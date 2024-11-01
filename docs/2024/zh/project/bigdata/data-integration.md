# 数据集成

## Binlog

* [debezium](https://github.com/debezium/debezium)。
* [canal](https://github.com/alibaba/canal)

## Flink

* [chunjun](https://github.com/DTStack/chunjun)。原 flinkx。
* [bitsail](https://github.com/bytedance/bitsail)。字节开源，项目已经前途未卜，可能要烂尾
* [seatunnel](https://github.com/apache/seatunnel)。原 waterdrop。支持 Flink、Spark 以及 SeaTunnel 社区自研的 Zeta 引擎
  * [Apache SeaTunnel 及 Web 功能部署指南(小白版)](https://mp.weixin.qq.com/s?__biz=MzkwNTMwNTEyNA==&mid=2247492653&idx=1&sn=ade20dd5f54ee316da37285247b7d9e3&chksm=c0fb6966f78ce0704acfd97c8df66783b32399eb37708cf26c57ba91efe301085b8a916a3c68&mpshare=1&scene=1&srcid=022937Eilg8OdLx0JRZYtrbI&sharer_shareinfo=cc0f57196b3e559aa362dcbf477b83c3&sharer_shareinfo_first=b196a66a8d05063264e8c821e9b9cfa0&version=4.1.10.99312&platform=mac#rd)
  * [SeaTunnel wiki](https://cwiki.apache.org/confluence/display/SEATUNNEL/Home)
  
* [flink-cdc-connectors](https://github.com/ververica/flink-cdc-connectors)。flink cdc 在 3.0 推出 pipeline 功能，实现端到端数据实时集成
  * [Flink CDC 在阿里云 DataWorks 数据集成应用实践](https://mp.weixin.qq.com/s/GvV2CW7C8iW7HGk6nZvG0g)

* [inlong](https://github.com/apache/inlong)。消息队列、flink
* [datalinkx](https://github.com/SplitfireUptown/datalinkx)。基于 Flink 的异构数据源同步。使用 chunjun 做数据同步，xxl-job 做任务调度

## Airbyte

* [airbyte](https://github.com/airbytehq/airbyte)。数据集成框架，支持大量数据源。source 和 destination connector 采用面向容器的实现方式，扩展性非常好

## DataX

* [DataX](https://github.com/alibaba/DataX)
* [Addax](https://github.com/wgzhao/Addax)
* [datax-web](https://github.com/WeiYe-Jing/datax-web)
* [tis](https://github.com/datavane/tis)。支持 DataX、Flink-CDC 和 chunjun

## 其他

* [kettle](https://github.com/pentaho/pentaho-kettle)
* [hop](https://github.com/apache/hop)。基于 kettle fork 的一个分支版本，进入 apache 孵化
* [nifi](https://github.com/apache/nifi)。[Apache Nifi基本介绍与使用](https://mp.weixin.qq.com/s?__biz=MzIwODM1OTYzOQ==&mid=2247486027&idx=1&sn=868e3ee51ae71c1cbabc3c6d133030c0&chksm=970513f3a0729ae5f1e1921183b3a10d1f4b2ebf74fe97913b6b0cc973b7fa02316d5b9f2530&mpshare=1&scene=1&srcid=0218OWFHlB23PjFLnRdqmYJE&sharer_shareinfo=a6305395a276a30dbbe6a4a7632cc7f7&sharer_shareinfo_first=574620c92972a0dbd995a9cdbc8c06c7&version=4.1.10.99312&platform=mac#rd)
* [gobblin](https://github.com/apache/gobblin)
* [Exchangis](https://github.com/WeBankFinTech/Exchangis)。微众银行开源
* [wrangler](https://github.com/data-integrations/wrangler)
* [开源ETL工具 Streamsets介绍](https://mp.weixin.qq.com/s/xCTy6_xTEzHFlAXIngUc6w?version=4.1.10.99312&platform=mac)
* [ares](https://github.com/rewerma/ares)。Ares-Access 是基于 `PL-SQL` 语法的 ETL、跨源计算、数据分析、存计分离的数据计算集成引擎

## 不维护

* [DBus](https://github.com/BriData/DBus)
* [DataLink](https://github.com/ucarGroup/DataLink)
* [databus](https://github.com/linkedin/databus)

