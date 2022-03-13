# Flink——任务提交(YARN)

Flink on YARN 支持 3 种部署模式：

* Application。对应 `YarnClusterDescriptor#deployApplicationCluster(ClusterSpecification, ApplicationConfiguration)` 方法。
* Per-job。对应 `YarnClusterDescriptor#deployJobCluster(ClusterSpecification, JobGraph, detached)` 方法。
* Session。对应 `YarnClusterDescriptor#deploySessionCluster(ClusterSpecification)` 方法，创建 session 集群，返回 `ClusterClient`，同时可以获取 `ApplicationId`，后续根据 `ApplicationId` 可以多次向 session 集群提交任务，无需重复创建。

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
* `ClusterDescriptor#deploySessionCluster(ClusterSpecification)`。以 Session 模式创建集群，只创建集群，并不会提交任务，任务需通过方法返回值获取 `ClusterClient` 自行提交。创建 yarn session 集群后，接口会返回 webInterfaceUrl 和 application.id 两个地址，前者可以使用 rest 接口进行任务提交，后者可以通过 clusterId 获取集群信息，然后提交任务。

## 环境变量

Flink on YARN 形式的部署需要明确提供 `HADOOP_CONF_HOME` 或 `HADOOP_HOME` 环境变量，Flink 内部会使用 Hadoop 配置文件获取 Hadoop 集群地址。

Hadoop 配置文件包括 `core-site.xml`、 `hdfs-site.xml`、 `yarn-site.xml` 即可。

## Application 模式

```java
public class JarYarnApplicationSubmitDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = Util.loadConfiguration();
        ClusterClientFactory<ApplicationId> factory = newClientFactory(config);
        YarnClusterDescriptor clusterDescriptor = createClusterDescriptor(factory, config);
        ClusterSpecification clusterSpecification = Util.createClusterSpecification();

        config.setLong(JobManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());
        config.setLong(TaskManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());

        Util.addJarFiles(clusterDescriptor, config);

        ConfigUtils.encodeCollectionToConfig(config, PipelineOptions.JARS, Collections.singletonList(new File(Util.JAR_FILE_PATH)), Object::toString);
        ApplicationConfiguration applicationConfiguration = new ApplicationConfiguration(new String[]{}, Util.ENTRY_POINT_CLASS_NAME);
        ClusterClient<ApplicationId> clusterClient = createClusterClient(clusterDescriptor, clusterSpecification, applicationConfiguration);
    }

    private static ClusterClientFactory<ApplicationId> newClientFactory(Configuration config) {
        config.setString(DeploymentOptions.TARGET, YarnDeploymentTarget.APPLICATION.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }

    private static YarnClusterDescriptor createClusterDescriptor(ClusterClientFactory<ApplicationId> factory, Configuration config) throws MalformedURLException {
        YarnClusterDescriptor clusterDescriptor = (YarnClusterDescriptor) factory.createClusterDescriptor(config);
        return clusterDescriptor;
    }

    private static ClusterClient<ApplicationId> createClusterClient(YarnClusterDescriptor clusterDescriptor,
                                                                    ClusterSpecification clusterSpecification,
                                                                    ApplicationConfiguration applicationConfiguration) throws ClusterDeploymentException {

        ClusterClientProvider<ApplicationId> provider = clusterDescriptor.deployApplicationCluster(clusterSpecification, applicationConfiguration);
        ClusterClient<ApplicationId> clusterClient = provider.getClusterClient();
        log.info("deploy application with appId: {}", clusterClient.getClusterId());
        return clusterClient;
    }
}
```

## Per-job 模式

```java
public class JarYarnPerJobSubmitDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = Util.loadConfiguration();
        ClusterClientFactory<ApplicationId> factory = newClientFactory(config);
        YarnClusterDescriptor clusterDescriptor = createClusterDescriptor(factory, config);
        ClusterSpecification clusterSpecification = Util.createClusterSpecification();
        JobGraph jobGraph = Util.createJobGraph(config);
        ClusterClient<ApplicationId> clusterClient = createClusterClient(clusterDescriptor, clusterSpecification, jobGraph);
    }

    private static ClusterClientFactory<ApplicationId> newClientFactory(Configuration config) {
        config.setString(DeploymentOptions.TARGET, YarnDeploymentTarget.PER_JOB.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }

    private static YarnClusterDescriptor createClusterDescriptor(ClusterClientFactory<ApplicationId> factory, Configuration config) throws MalformedURLException {
        YarnClusterDescriptor clusterDescriptor = (YarnClusterDescriptor) factory.createClusterDescriptor(config);
        Util.addJarFiles(clusterDescriptor, config);
        return clusterDescriptor;
    }

    private static ClusterClient<ApplicationId> createClusterClient(YarnClusterDescriptor clusterDescriptor,
                                                                    ClusterSpecification clusterSpecification,
                                                                    JobGraph jobGraph) throws ClusterDeploymentException {

        ClusterClientProvider<ApplicationId> provider = clusterDescriptor.deployJobCluster(clusterSpecification, jobGraph, true);
        ClusterClient<ApplicationId> clusterClient = provider.getClusterClient();
        log.info("deploy per_job with appId: {}", clusterClient.getClusterId());
        return clusterClient;
    }
}
```

`ClusterDescriptor#deployJobCluster(ClusterSpecification, JobGraph, boolean)` 方法返回 `ClusterClientProvider`，可以获得 `ClusterClient`，即而可以获取 applicationId，后续用于监控任务状态。

## Session 模式

Session 模式需先创建集群，再提交任务，创建集群的实现如下：

```java
public class YarnSessionClusterCreateDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = new Configuration();
        ClusterClientFactory<ApplicationId> factory = newClientFactory(config);
        YarnClusterDescriptor clusterDescriptor = (YarnClusterDescriptor) factory.createClusterDescriptor(config);
        Util.addJarFiles(clusterDescriptor, config);

        config.setLong(JobManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(2048).getBytes());
        config.setLong(TaskManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(2048).getBytes());
        ClusterSpecification clusterSpecification = Util.createClusterSpecification();
        // 1. 创建 session 集群
        ClusterClient<ApplicationId> clusterClient = createClusterClient(clusterDescriptor, clusterSpecification);
        // 2. 提交任务
        JobGraph jobGraph = Util.createJobGraph(config);
        JobID jobID = clusterClient.submitJob(jobGraph).get();
        System.out.println(jobID);
    }

    private static ClusterClientFactory<ApplicationId> newClientFactory(Configuration config) {
        config.setString(DeploymentOptions.TARGET, YarnDeploymentTarget.SESSION.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }

    private static ClusterClient<ApplicationId> createClusterClient(YarnClusterDescriptor clusterDescriptor,
                                                                    ClusterSpecification clusterSpecification) throws ClusterDeploymentException {

        ClusterClientProvider<ApplicationId> provider = clusterDescriptor.deploySessionCluster(clusterSpecification);
        ClusterClient<ApplicationId> clusterClient = provider.getClusterClient();

        log.info("deploy session with appId: {}", clusterClient.getClusterId());
        return clusterClient;
    }
}
```

提交任务也可以只根据 applicationId：

```java
public class JarYarnSessionSubmitDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = new Configuration();
        ClusterClientFactory<ApplicationId> factory = newClientFactory(config);
        ApplicationId clusterId = factory.getClusterId(config);
        YarnClusterDescriptor clusterDescriptor = (YarnClusterDescriptor) factory.createClusterDescriptor(config);
        // 1. 通过 application.id 获取 集群
        ClusterClient<ApplicationId> clusterClient = clusterDescriptor.retrieve(clusterId).getClusterClient();
        // 2. 提交任务
        JobGraph jobGraph = Util.createJobGraph(config);
        JobID jobID = clusterClient.submitJob(jobGraph).get();
        System.out.println(jobID);
    }

    private static ClusterClientFactory<ApplicationId> newClientFactory(Configuration config) {
        config.setString(YarnConfigOptions.APPLICATION_ID, "application_1646981816129_0003");
        config.setString(DeploymentOptions.TARGET, YarnDeploymentTarget.SESSION.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }
}
```

创建 session 集群后，也可以获取 Flink web url，同样可以使用 rest 接口提交任务：

```java
public class JarStandaloneSubmitDemo02 {

    public static void main(String[] args) throws Exception {
        Configuration config = new Configuration();
        ClusterClientFactory<StandaloneClusterId> factory = newClientFactory(config);
        StandaloneClusterId clusterId = factory.getClusterId(config);
        StandaloneClusterDescriptor clusterDescriptor = (StandaloneClusterDescriptor) factory.createClusterDescriptor(config);

        ClusterClient<StandaloneClusterId> client = clusterDescriptor.retrieve(clusterId).getClusterClient();
        String webInterfaceURL = client.getWebInterfaceURL();

        String jarFilePath = "/Users/wangqi/Documents/software/flink/flink-1.13.6/examples/streaming/SocketWindowWordCount.jar";
        JarUploadResponse jarUploadResponse = uploadJar(webInterfaceURL, new File(jarFilePath));
        String jarId = jarUploadResponse.getFilename().substring(jarUploadResponse.getFilename().lastIndexOf("/") + 1);
        JobID jobID = run(webInterfaceURL, jarId, "org.apache.flink.streaming.examples.socket.SocketWindowWordCount");
        System.out.println(jobID);
    }

    private static JarUploadResponse uploadJar(String webInterfaceURL, File jarFile) throws IOException {
        String response = Request.post(webInterfaceURL + "/jars/upload")
                .connectTimeout(Timeout.ofSeconds(3L))
                .responseTimeout(Timeout.ofSeconds(3L))
                .body(
                        MultipartEntityBuilder.create()
                                .addBinaryBody("jarfile", jarFile, ContentType.create("application/java-archive"), "SocketWindowWordCount.jar")
                                .build()
                ).execute().returnContent().asString(StandardCharsets.UTF_8);
        return JacksonUtil.parseJsonString(response, JarUploadResponse.class);
    }

    private static JobID run(String webInterfaceURL, String jarId, String entryClass) throws IOException {
        JarRunRequest jarRunRequest = new JarRunRequest();
        jarRunRequest.setEntryClass(entryClass);
        jarRunRequest.setProgramArgs("--port 9000");

        String response = Request.post(webInterfaceURL + "/jars/" + jarId + "/run")
                .connectTimeout(Timeout.ofSeconds(3L))
                .responseTimeout(Timeout.ofSeconds(60))
                .body(new StringEntity(JacksonUtil.toJsonString(jarRunRequest)))
                .execute().returnContent().asString(StandardCharsets.UTF_8);
        String jobID = JacksonUtil.parseJsonString(response, JarRunResponse.class).getJobID();
        return JobID.fromHexString(jobID);
    }


    private static ClusterClientFactory<StandaloneClusterId> newClientFactory(Configuration config) {
        // yarn session 模式下预先创建的 cluster 的 webInterfaceUrl
        config.setString(RestOptions.ADDRESS, "192.168.12.19");
        config.setInteger(RestOptions.PORT, 49998);
        config.setString(DeploymentOptions.TARGET, RemoteExecutor.NAME);

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }
}
```

