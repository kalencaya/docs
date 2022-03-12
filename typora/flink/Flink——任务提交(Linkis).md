# Flink——任务提交(Linkis)

[Linkis](https://linkis.apache.org/) 是微众银行开源的计算中间件，在上层应用和底层引擎之间构建了一层计算中间件，实现 Serverless 形式的 Spark、Presto、Flink 等引擎体验。通过使用Linkis 提供的REST/WebSocket/JDBC 等标准接口，上层应用可以方便地连接访问Spark, Presto, Flink 等底层引擎,同时实现跨引擎上下文共享、统一的计算任务和引擎治理与编排能力。



[Flink 引擎使用文档](https://linkis.apache.org/zh-CN/docs/1.1.0/engine_usage/flink) 描述，Linkis 只支持 Flink on YARN 模式的部署。同时支持 jar 包和 sql 的提交方式。

Flink 在初始化 YARN 客户端时使用 `HADOOP_CONF_DIR` 的配置信息，Linkis 强制必需配置 `HADOOP_HOME` 和 `HADOOP_CONF_DIR` 环境变量。

`FLINK_HOME/bin/config.sh` 脚本会根据 `FLINK_HOME` 环境变量初始化 `FLINK_CONF_DIR` 和 `FLINK_LIB_DIR` 目录，Linkis 提交 jar 包形式的任务并没有使用 `FLINK_HOME/bin/flink` 命令行接口，因此在设置 Flink 引擎时，必需配置 `FLINK_CONF_DIR` 和 `FLINK_LIB_DIR` 环境变量。



Flink on YARN 支持 3 种方式的任务运行条件：

* Application。对应 `YarnClusterDescriptor#deployApplicationCluster(ClusterSpecification, ApplicationConfiguration)` 方法。
* Per-job。对应 `YarnClusterDescriptor#deployJobCluster(ClusterSpecification, JobGraph, detached)` 方法。
* Session。对应 `YarnClusterDescriptor#deploySessionCluster(ClusterSpecification)` 方法。

Flink 内部关于任务提交的核心类为 `ClusterDescriptor`，通过 `ClusterDescriptor` 可以获得 `ClusterClient` 对象，提交 `JobGraph`。

```java
/**
 * A descriptor to deploy a cluster (e.g. Yarn) and return a Client for Cluster communication.
 *
 * @param <T> Type of the cluster id
 */
public interface ClusterDescriptor<T> extends AutoCloseable {

    /**
     * Returns a String containing details about the cluster (NodeManagers, available memory, ...).
     */
    String getClusterDescription();

    /**
     * Retrieves an existing Flink Cluster.
     */
    ClusterClientProvider<T> retrieve(T clusterId) throws ClusterRetrieveException;

    /**
     * Triggers deployment of a cluster.
     */
    ClusterClientProvider<T> deploySessionCluster(ClusterSpecification clusterSpecification)
            throws ClusterDeploymentException;

    /**
     * Triggers deployment of an application cluster. This corresponds to a cluster dedicated to the
     * execution of a predefined application. The cluster will be created on application submission
     * and torn down upon application termination. In addition, the {@code main()} of the
     * application's user code will be executed on the cluster, rather than the client.
     */
    ClusterClientProvider<T> deployApplicationCluster(
            final ClusterSpecification clusterSpecification,
            final ApplicationConfiguration applicationConfiguration)
            throws ClusterDeploymentException;

    /**
     * Deploys a per-job cluster with the given job on the cluster.
     */
    @Deprecated
    ClusterClientProvider<T> deployJobCluster(
            final ClusterSpecification clusterSpecification,
            final JobGraph jobGraph,
            final boolean detached)
            throws ClusterDeploymentException;

    /**
     * Terminates the cluster with the given cluster id.
     */
    void killCluster(T clusterId) throws FlinkException;

    @Override
    void close();
}
```

获取 `ClusterClientProvider` 的方法有 4 个：

* `ClusterDescriptor#retrieve(T)`。根据 `clusterId` 获取现有集群的信息。
* `ClusterDescriptor#deployApplicationCluster(ClusterSpecification, ApplicationConfiguration)`。以 Application 模式创建集群，运行任务。
* `ClusterDescriptor#deployJobCluster(ClusterSpecification, JobGraph, boolean)`。以 Per-job 模式创建集群，运行任务。现在只有 Flink on YARN 部署才支持，且已经标记为 `deprecated`，Standalone 和 Flink on k8s 都不支持。
* `ClusterDescriptor#deploySessionCluster(ClusterSpecification)`。以 Session 模式创建集群，只创建集群，并不会提交任务，任务需通过方法返回值获取 `ClusterClient` 自行提交。创建 yarn session 集群后，接口会返回 webInterfaceUrl 和 application.id 两个地址，前者可以使用 rest 接口进行任务提交，后者可以通过 clusterId 获取集群信息，然后提交任务

Linkis 同时支持 3 种形式的任务提交模式，用于不同的场景。

jar 包形式的提交采用 Application 模式，sql 形式的提交采用 Per-job 模式，Session 模式则用于调试？？？

实现方式利用了 `适配器` 设计模式，对 `ClusterDescriptor` 进行了适配，以一种统一的方式提交任务。



`ClusterDescriptorAdapterFactory` 创建 `ClusterDescriptorAdapter`：

```java
public class ClusterDescriptorAdapterFactory {

    public static ClusterDescriptorAdapter create(ExecutionContext executionContext) {
        String yarnDeploymentTarget =
                executionContext.getFlinkConfig().get(DeploymentOptions.TARGET);
        ClusterDescriptorAdapter clusterDescriptorAdapter = null;
        if (YarnDeploymentTarget.PER_JOB.getName().equals(yarnDeploymentTarget)) {
            clusterDescriptorAdapter = new YarnPerJobClusterDescriptorAdapter(executionContext);
        } else if (YarnDeploymentTarget.APPLICATION.getName().equals(yarnDeploymentTarget)) {
            clusterDescriptorAdapter =
                    new YarnApplicationClusterDescriptorAdapter(executionContext);
        } else if (YarnDeploymentTarget.SESSION.getName().equals(yarnDeploymentTarget)) {
            clusterDescriptorAdapter = new YarnSessionClusterDescriptorAdapter(executionContext);
        }
        return clusterDescriptorAdapter;
    }
}
```





```java
public abstract class ClusterDescriptorAdapter implements Closeable {

    public static final long CLIENT_REQUEST_TIMEOUT =
            FlinkEnvConfiguration.FLINK_CLIENT_REQUEST_TIMEOUT().getValue().toLong();

    protected final ExecutionContext executionContext;
    // jobId is not null only after job is submitted
    private JobID jobId;
    protected ApplicationId clusterID;
    protected ClusterClient<ApplicationId> clusterClient;
    private YarnClusterDescriptor clusterDescriptor;

    protected String webInterfaceUrl;

    public ClusterDescriptorAdapter(ExecutionContext executionContext) {
        this.executionContext = executionContext;
    }

    /**
     * The reason of using ClusterClient instead of JobClient to retrieve a cluster is the JobClient
     * can't know whether the job is finished on yarn-per-job mode.
     *
     * <p>If a job is finished, JobClient always get java.util.concurrent.TimeoutException when
     * getting job status and canceling a job after job is finished. This method will throw
     * org.apache.hadoop.yarn.exceptions.ApplicationNotFoundException when creating a ClusterClient
     * if the job is finished. This is more user-friendly.
     */
    protected <R> R bridgeClientRequest(ExecutionContext executionContext, JobID jobId, Supplier<CompletableFuture<R>> function, boolean ignoreError) throws JobExecutionException {
        if (clusterClient == null) {
            if (this.clusterID == null) {
                throw new JobExecutionException("Cluster information don't exist.");
            }
            clusterDescriptor = executionContext.createClusterDescriptor();
            try {
                clusterClient = clusterDescriptor.retrieve(this.clusterID).getClusterClient();
            } catch (ClusterRetrieveException e) {
                throw new JobExecutionException(String.format("Job: %s could not retrieve or create a cluster.", jobId), e);
            }
        }
        try {
            return function.get().get(CLIENT_REQUEST_TIMEOUT, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            if (ignoreError) {
                return null;
            } else {
                throw new JobExecutionException(String.format("Job: %s operation failed!", jobId), e);
            }
        }
    }
}
```

