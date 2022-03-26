# Flink——任务提交(Client)

## Hadoop 任务提交

Flink 需要获取 Hadoop 配置以连接 Hadoop，向 YARN 提交任务，上传文件到 HDFS 中，获取配置的方式有 2 种：

* 配置文件。提供 Hadoop 配置文件 `core-size.xml` 和 `hdfs-site.xml`。
    * 环境变量。配置 `HADOOP_HOME` 环境变量，Flink 自动从 `$HADOOP_HOME/conf` 和 `$HADOOP_HOME/etc/hadoop` 获取配置文件，或者直接提供 `HADOOP_CONF_DIR` 环境变量。
    * 指定 Hadoop 配置地址。通过 `ConfigConstants#PATH_HADOOP_CONFIG` 指定 Hadoop 配置地址，此项配置已被标记为 `deprecated`，但是对于 Hadoop 多集群的情况，还是有意义的。
* 配置项。手动指定 Hadoop 的配置，配置前缀为 `flink.hadoop.`

具体的信息可以参考 `HadoopUtils#getHadoopConfiguration(org.apache.flink.configuration.Configuration)`。

## ClusterClient

Flink 提供了 2 个实现：`RestClusterClient` 和 `MiniClusterClient`。无论是 Standalone、YARN 还是 Native Kubernetes 模式下，都是通过 `RestClusterClient` 实现客户端与 JobManager 通信的。

而 `RestClusterClient` 与 JobManager 的通信代理给了 `RestClient`，到这里也就正式理通了 CLI 接口与 REST 接口之间的关系：CLI 接口是 REST 接口的一部分，是对 REST 接口的一层封装。

那么 REST 接口是否可以完全取代 CLI 呢？答案是不能，原因在于有些部署形式下，提交任务时才会创建集群，集群创建完成后才能通过 REST 接口与 JobManager 通信。

那么到此为止，Flink 集群的集成就分为了 2 部分：任务提交使用 CLI 接口，而后续的所有操作都通过 REST 接口。



对于 REST 接口集成也有 2 种方式：

* 通过 http 客户端，如 `OkHttp`、`HttpClient`，参照官网的 [REST API](https://nightlies.apache.org/flink/flink-docs-master/docs/ops/rest_api/) 编写接口。缺点是需要自己编写接口对应的 request 和 response，以及处理异常，也可以尝试复用 `flink-runtime` 模块的 bean，但是这些 bean 的序列化和反序列化都是通过 Jackson 实现的，Flink 将 Jackson 进行了 shaded，因此序列化和反序列化都需要根据 Flink shaded jackson 实现。
* 通过 `RestClient`集成。直接使用 `RestClient`，可以原生复用 `flink-runtime` 模块的一切。缺点是与 Flink 版本绑定，不如 http 方式灵活。



## 集成的粒度

### CLI

`CliFrontend` 切入。

`ClientUtils#executeProgram(PipelineExecutorServiceLoader, Configuration, PackagedProgram, boolean, boolean)` 提交。

`ApplicationDeployer#run(Configuration, ApplicationConfiguration)` 提交 application 任务。



`ClusterDescriptor` 切入。



ClusterClient 切入。



RestClient 切入。



### REST



