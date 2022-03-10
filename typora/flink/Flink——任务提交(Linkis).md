# Flink——任务提交(Linkis)

[Linkis](https://linkis.apache.org/) 是微众银行开源的计算中间件，在上层应用和底层引擎之间构建了一层计算中间件，实现 Serverless 形式的 Spark、Presto、Flink 等引擎体验。通过使用Linkis 提供的REST/WebSocket/JDBC 等标准接口，上层应用可以方便地连接访问Spark, Presto, Flink 等底层引擎,同时实现跨引擎上下文共享、统一的计算任务和引擎治理与编排能力。



[Flink 引擎使用文档](https://linkis.apache.org/zh-CN/docs/1.1.0/engine_usage/flink) 描述，Linkis 只支持 Flink on YARN 模式的部署。同时支持 jar 包和 sql 的提交方式。

Flink 在初始化 YARN 客户端时使用 `HADOOP_CONF_DIR` 的配置信息，Linkis 强制必需配置 `HADOOP_HOME` 和 `HADOOP_CONF_DIR` 环境变量。

`FLINK_HOME/bin/config.sh` 脚本会根据 `FLINK_HOME` 环境变量初始化 `FLINK_CONF_DIR` 和 `FLINK_LIB_DIR` 目录，Linkis 提交 jar 包形式的任务并没有使用 `FLINK_HOME/bin/flink` 命令行接口，因此在设置 Flink 引擎时，必需配置 `FLINK_CONF_DIR` 和 `FLINK_LIB_DIR` 环境变量。



Flink on YARN 支持 3 种方式的任务运行条件：

* Application。对应 `YarnClusterDescriptor#deployApplicationCluster(ClusterSpecification, ApplicationConfiguration)` 方法。
* Per-job。对应 `YarnClusterDescriptor#deployJobCluster(ClusterSpecification, JobGraph, detached)` 方法。
* Session。对应 `YarnClusterDescriptor#deploySessionCluster(ClusterSpecification)` 方法。

Linkis 同时支持 3 种形式的任务提交模式，与之对应的也提供了对应的实现类。

