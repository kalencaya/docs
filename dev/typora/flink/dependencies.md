# dependencies

Flink 提供分层的 API 供用户使用，其中 `DataStream` 和 `Table` API 需要通过构建工具 `Maven` 或 `Gradle` 进行打包任务 Jar。

打包时，建议将应用代码和必要依赖打包成一个 fat/uber Jar，它应包含应用使用的 connectors、formats 和三方依赖。而 Flink 本身的 runtime 模块、DataStream API 等则不需要打包，Flink 本身会提供这些 Jar。

配置 `Maven` 或 `Gradle` 时需要添加必要依赖：

* Flink libs。
* [connectors and formats](https://nightlies.apache.org/flink/flink-docs-release-1.18/docs/dev/configuration/connector/)，[tests](https://nightlies.apache.org/flink/flink-docs-release-1.18/docs/dev/configuration/testing/)
* connectors 或者 formats 依赖的三方依赖，比如 flink-jdbc-connector 需要依赖 MySQL 驱动 Jar。
* 应用自身依赖

Flink 本身包含很多的类和三方依赖以实现 Flink 的核心功能如 coordination, networking, checkpointing, failover, APIs, operators (such as windowing), resource management 等，这些类和三方依赖组成了 Flink 的 runtime。Flink 将这些类和三方依赖打成 `flink-dist.jar`，放在 `/lib` 目录下。为了保证 Flink 的核心依赖尽可能的小，Flink 核心依赖并不包含 connectors 以及一些库如 `CEP`、`SQL`、`ML`。

Flink 的 `/lib` 目录包含了很多常用模块，如 `Table` API 运行所需模块，一些 connectors 和 formats。Flink 在 `/opt` 目录添加了一些额外可选依赖，用户可以将 `/opt` 目录下的 Jar 移动到 `/lib` 目录下使其生效。

Flink 的依赖多种多样，同时也支持 Standalone、YARN 和 Kubernetes 部署，不同的依赖，不同的运行资源都会影响依赖的管理。

Flink 的依赖管理可以分为 3 个方面：

* 用户。用户将任务依赖打进 Jar 中，提供 fat/uber Jar。
* 平台。用户为任务添加依赖配置，平台在部署任务时将依赖和任务 Jar 一起提交。
* 硬件。服务器上内置依赖，Java 程序可以通过 `CLASSPATH` 环境变量访问到依赖。

## 平台

平台支持 Flink 依赖，根据 Flink 任务的提交方式和运行资源会有所不同。

### `ClusterClient` 方式

在 Flink 架构中，client 将应用 Jar 编译成 JobGraph，提交到 JobManager：

```java
public ClusterClient submit(Path flinkHome, Configuration configuration, PackageJarJob job) throws Exception {
    YarnClusterDescriptor clusterDescriptor = (YarnClusterDescriptor) FlinkUtil.createClusterDescriptor(configuration);
    Util.addJarFiles(clusterDescriptor, flinkHome, configuration);
    ClusterSpecification clusterSpecification = FlinkUtil.createClusterSpecification(configuration);

    PackagedProgram program = FlinkUtil.buildProgram(configuration, job);
    JobGraph jobGraph = PackagedProgramUtils.createJobGraph(program, configuration, 1, false);
    return createClusterClient(clusterDescriptor, clusterSpecification, jobGraph);
}

private ClusterClient<ApplicationId> createClusterClient(YarnClusterDescriptor clusterDescriptor,
                                                         ClusterSpecification clusterSpecification,
                                                         JobGraph jobGraph) throws ClusterDeploymentException {
    ClusterClientProvider<ApplicationId> provider = clusterDescriptor.deployJobCluster(clusterSpecification, jobGraph, true);
    ClusterClient<ApplicationId> clusterClient = provider.getClusterClient();
    log.info("deploy per_job with appId: {}", clusterClient.getClusterId());
    return clusterClient;
}
```

在生成 JobGraph 时可以通过 `PipelineOptions#JARS` 将依赖 Jar 添加进 JobGraph。

这种方式使用 Flink 的 client API 实现，可以支持 Standalone、YARN 和 Kubernetes 3 种运行资源，Session、Per-Job、Application 3 种运行方式，兼容性最好。

开源和公司内部自研的 Flink 任务管理系统或者实时计算平台基本都是以这种方式：

* [StreamPark（StreamX）](https://github.com/apache/incubator-streampark)
* [Dinky](https://github.com/DataLinkDC/dinky)
* [Linkis](https://github.com/apache/linkis)

因为功能比较通用，因此将这部分功能简单封装成了一个库 [flinkful](https://github.com/flowerfine/flinkful)，类似 [dbutils](https://commons.apache.org/proper/commons-dbutils/) 与 JDBC。

### Yarn

Flink 对 YARN 上运行提供了额外的依赖支持。

```java
public static void addJarFiles(YarnClusterDescriptor clusterDescriptor, java.nio.file.Path flinkHome, Configuration configuration) throws MalformedURLException {
    if (flinkHome == null || Files.notExists(flinkHome)) {
        flinkHome = FlinkUtil.getFlinkHomeEnv();
    }
    if (flinkHome == null || Files.notExists(flinkHome)) {
        throw new IllegalStateException("flinkHome and FLINK_HOME must exist one of two");
    }
    boolean isRemoteJarPath =
            !CollectionUtil.isNullOrEmpty(configuration.get(YarnConfigOptions.PROVIDED_LIB_DIRS));
    boolean isRemoteDistJarPath = !StringUtils.isNullOrWhitespaceOnly(configuration.get(YarnConfigOptions.FLINK_DIST_JAR));
    List<File> shipFiles = new ArrayList<>();
    File[] plugins = FlinkUtil.getFlinkPluginsDir(flinkHome).toFile().listFiles();
    if (plugins != null) {
        for (File plugin : plugins) {
            if (plugin.isDirectory() == false) {
                continue;
            }
            if (!isRemoteJarPath) {
                shipFiles.addAll(Arrays.asList(plugin.listFiles()));
            }
        }
    }
    File[] jars = FlinkUtil.getFlinkLibDir(flinkHome).toFile().listFiles();
    if (jars != null) {
        for (File jar : jars) {
            if (jar.toURI().toURL().toString().contains("flink-dist")) {
                if (!isRemoteDistJarPath) {
                    clusterDescriptor.setLocalJarPath(new Path(jar.toURI().toURL().toString()));
                }
            } else if (!isRemoteJarPath) {
                shipFiles.add(jar);
            }
        }
    }
    clusterDescriptor.addShipFiles(shipFiles);
}
```

`YarnClusterDescriptor` 提供了 `YarnClusterDescriptor#setLocalJarPath` 方法设置 `flink-dist-xxx.jar`，`YarnClusterDescriptor#addShipFiles` 方法设置额外依赖。Flink 任务提交时每次都需要把依赖从本地传输到任务调度的所在节点，因此提供了可以在 HDFS 中预先存储 Flink 依赖，任务运行时直接通过 HDFS 分发到任务所在节点：

```java
private static Configuration buildConfiguration() throws MalformedURLException {
    Configuration configuration = FlinkExamples.loadConfiguration();
        
    configuration.set(YarnConfigOptions.PROVIDED_LIB_DIRS, Arrays.asList(new String[]{"hdfs://hadoop:9000/flink/1.13.6"}));
    configuration.set(YarnConfigOptions.FLINK_DIST_JAR, "hdfs://hadoop:9000/flink/1.13.6/flink-dist_2.11-1.13.6.jar");

    URL exampleUrl = new File(FlinkExamples.EXAMPLE_JAR).toURL();
    ConfigUtils.encodeCollectionToConfig(configuration, PipelineOptions.JARS, Collections.singletonList(exampleUrl), Object::toString);
    return configuration;
}
```

### Kubernetes

Flink 在 Kubernetes 上运行在容器中，容器创建的基础是镜像。要想在容器中添加依赖，有 2 种方式：

* 镜像。构建镜像时，将依赖打进镜像中。将依赖添加进 `$FLINK_HOME/usrlib` 目录，具体参考 [Configuring Flink on Docker](https://nightlies.apache.org/flink/flink-docs-release-1.18/docs/deployment/resource-providers/standalone/docker/#configuring-flink-on-docker)
* 容器生命周期。Kubernetes 提供了 `PostStart` 和 `PreStart` hooks，使用 hook 添加依赖。参考 [Container Lifecycle Hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/)
* init-container。在 Flink 容器启动前，运行初始化容器，加载依赖。参考 [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)

## 硬件

Flink 任务依然是 Java 程序，可在每台服务器上添加依赖 Jar，通过 `CLASSPATH` 环境变量配置依赖路径。

在 Kubernetes 中，还可以通过将文件系统通过 FUSE 挂载到本地，本地直接访问文件系统上的 Flink 依赖。



