# Flink——任务提交(Native Kubernetes)

Flink 同样支持在 Kubernetes 上进行部署。

Kubernetes 作为一个容器编排系统，可以实现自动化的应用部署、扩缩容和管理。Flink 的 Native Kubernetes 集成支持将 Flink 部署到 Kubernetes 集群上，同时 Flink 也可以动态地按需分配和移除 TaskManager。

本文依赖的 Flink 版本为 `1.13.6`，截至到本文，Flink 的官方邮件已经作出了通告，以 `CRD（Custom Resource Define）` 发布 Flink Kubernetes operator。

实现 Flink 任务提交到 Native Kubernetes 集群与 YARN 类似：

* 配置信息。YARN 需要提供 `HADOOP_CONF_HOME` 环境变量获取 YARN 集群信息，Kubernetes 同样需要 kubeconfig 获取 Kubernetes 集群信息，文件默认位置为 `$HOME/.kube/config`。
* 依赖。YARN 需要引入 `flink-yarn_${scala.binary.version}` 依赖，Kubernetes 需要引入 `flink-kubernetes_${scala.binary.version}` 依赖。
* 任务提交。YARN 部署的 `ClusterDescriptor` 实现类为 `YarnClusterDescriptor`，Kubernetes 的实现类为 `KubernetesClusterDescriptor`。
* 任务形式。YARN 支持 Application、Per-job 和 Session 模式，Kubernetes 支持 Application 和 Session 模式，不支持 Per-job 模式。事实上 YARN Per-job 已经被标记为 `deprecated`。

## Application 模式

Application 模式下需要指定 JobManager 和 TaskManager 的内存设置，便于 Kubernetes 分配资源。

```java
ClusterSpecification clusterSpecification = Util.createClusterSpecification();
        config.setLong(JobManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());
        config.setLong(TaskManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());


public enum Util {
    ;

    public static ClusterSpecification createClusterSpecification() {
        return new ClusterSpecification.ClusterSpecificationBuilder()
                .setMasterMemoryMB(2048)
                .setTaskManagerMemoryMB(2048)
                .setSlotsPerTaskManager(1)
                .createClusterSpecification();
    }
}

```

其次，Application 模式下需要用户提供镜像，镜像中包含任务 jar 和运行依赖，以下是 `Dockerfile` 内容：

```dockerfile
FROM flink
MAINTAINER wangqi

RUN mkdir -p $FLINK_HOME/usrlib
COPY TopSpeedWindowing.jar $FLINK_HOME/usrlib/TopSpeedWindowing.jar
```

构建镜像：

```shell
docker build -f Dockerfile -t flink-example:1 .
```

设置自定义镜像名称和 jar 包位置：

```java
ConfigUtils.encodeCollectionToConfig(config, PipelineOptions.JARS, Collections.singletonList(new File("local:///opt/flink/usrlib/TopSpeedWindowing.jar")), Object::toString);
        config.setString(KubernetesConfigOptions.CONTAINER_IMAGE, "flink-example:1");
```

完整代码如下：

```java
public class JarKubernetesApplicationSubmitDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = Util.loadConfiguration();
        ClusterClientFactory<String> factory = newClientFactory(config);
        KubernetesClusterDescriptor clusterDescriptor = createClusterDescriptor(factory, config);

        ClusterSpecification clusterSpecification = Util.createClusterSpecification();
        config.setLong(JobManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());
        config.setLong(TaskManagerOptions.TOTAL_PROCESS_MEMORY.key(), MemorySize.ofMebiBytes(4096).getBytes());

        ConfigUtils.encodeCollectionToConfig(config, PipelineOptions.JARS, Collections.singletonList(new File("local:///opt/flink/usrlib/TopSpeedWindowing.jar")), Object::toString);
        config.setString(KubernetesConfigOptions.CONTAINER_IMAGE, "flink-example:1");
        ApplicationConfiguration applicationConfiguration = new ApplicationConfiguration(new String[]{}, Util.ENTRY_POINT_CLASS_NAME);
        ClusterClient<String> clusterClient = createClusterClient(clusterDescriptor, clusterSpecification, applicationConfiguration);
    }

    private static ClusterClientFactory<String> newClientFactory(Configuration config) {
        config.setString(DeploymentOptions.TARGET, KubernetesDeploymentTarget.APPLICATION.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }

    private static KubernetesClusterDescriptor createClusterDescriptor(ClusterClientFactory<String> factory, Configuration config) throws MalformedURLException {
        KubernetesClusterDescriptor clusterDescriptor = (KubernetesClusterDescriptor) factory.createClusterDescriptor(config);
        return clusterDescriptor;
    }

    private static ClusterClient<String> createClusterClient(KubernetesClusterDescriptor clusterDescriptor,
                                                             ClusterSpecification clusterSpecification,
                                                             ApplicationConfiguration applicationConfiguration) throws ClusterDeploymentException {

        ClusterClientProvider<String> provider = clusterDescriptor.deployApplicationCluster(clusterSpecification, applicationConfiguration);
        ClusterClient<String> clusterClient = provider.getClusterClient();
        log.info("deploy application with clusterId: {}", clusterClient.getClusterId());
        return clusterClient;
    }
}
```

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

        // 1. 创建 session 集群
        ClusterSpecification clusterSpecification = Util.createClusterSpecification();
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

创建集群后，可以获取 cluseterId 和 webInterfaceUrl。通过 clusterId 可以使用 `kubectl` 获取 `deployment` 和 `pod` 信息，也可以后续提交任务，通过 webInterfaceUrl 可以访问 Flink web UI，也可以通过 rest 接口提交任务。

通过 clusterId 提交任务实现如下：

```java
public class JarKubernetesSessionSubmitDemo {

    public static void main(String[] args) throws Exception {
        Configuration config = new Configuration();
        ClusterClientFactory<String> factory = newClientFactory(config);
        String clusterId = factory.getClusterId(config);
        KubernetesClusterDescriptor clusterDescriptor = (KubernetesClusterDescriptor) factory.createClusterDescriptor(config);

        // 1. 通过 cluster.id 获取 集群
        ClusterClient<String> clusterClient = clusterDescriptor.retrieve(clusterId).getClusterClient();
        // 2. 提交任务
        JobGraph jobGraph = Util.createJobGraph(config);
        JobID jobID = clusterClient.submitJob(jobGraph).get();
        System.out.println(jobID);
    }

    private static ClusterClientFactory<String> newClientFactory(Configuration config) {
        config.setString(KubernetesConfigOptions.CLUSTER_ID, "flink-cluster-7b367a19632fb03f4ff84a580e3d032");
        config.setString(DeploymentOptions.TARGET, KubernetesDeploymentTarget.SESSION.getName());

        DefaultClusterClientServiceLoader serviceLoader = new DefaultClusterClientServiceLoader();
        return serviceLoader.getClusterClientFactory(config);
    }
}
```

通过 webInterfaceUrl 提交任务实现如下：

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

