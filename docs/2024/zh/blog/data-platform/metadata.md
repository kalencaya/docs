# 元数据



数据资产

数据目录

元数据采集



## 元数据存储

hive metastore

flink 和 seatunnel schema

paimon catalog

iceberg catalog

## 元数据采集

存储系统大致分为如下几类：

* DRMS。关系型数据库
* 消息队列。
* NoSQL。
  * Redis
  * MongoDB
  * Elasticsearch
* 文件系统。
* OLAP。

其中有些存储有 schema，如 DRMS、OLAP，有些存储则是 schemaless，如消息队列、文件系统。

支持 schema 的系统以 JDBC 协议为主，但是也有部分不支持如 MongoDB 和 Elasticsearch。

### Schema

JDBC

### Schemaless

schemaless 存储需要用户自己定义存储数据的 schema，计算引擎 Flink 提供了 format 功能，支持如下格式：

* raw
* csv
* json
* protobuf
* avro
  * confluent avro
* orc
* parquet
* cdc
  * debezium
  * canal
  * maxwell
  * ogg

针对消息队列中数据的 schema，有对应的 schema registry 用于管理消息队列数据 schema 变更：

* [schema-registry](https://github.com/confluentinc/schema-registry)
* [aws glue schema registry](https://docs.aws.amazon.com/glue/latest/dg/schema-registry.html)
* [spring-cloud-schema-registry](https://github.com/spring-cloud/spring-cloud-schema-registry)