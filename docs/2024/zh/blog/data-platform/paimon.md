# Paimon

## 表类型

* [primary table](https://paimon.apache.org/docs/master/concepts/primary-key-table/overview/)。默认表，需定义主键，支持 insert、update 和 delete。
  * 数据在 bucket 内根据主键进行排序。
* [append table](https://paimon.apache.org/docs/master/concepts/append-table/overview/)。又名日志表，未定义主键即为 append table。
  * 自动小文件合并
  * z-order 文件布局
  * 索引。minmax，bitmap，bloomfilter，倒排索引

## 写入

* merge engine。部分更新，去重选择最新一条或者第一条数据，聚合数据量。类似 doris 的 AggregationType。
* 配置生成 changelog 以支持流读，取代消息队列

## 读取

* 批读
  * 历史分区
* 流读
  * 数据更新时生成 changelog，取代消息队列
  * 多客户端同时读取时，支持位点读取
* 混合读取。全增量一体
* 位点。流读
* changelog。取代消息队列
* 

## 数据湖特性

* 元数据
  * FileSystem
  * Hive Metastore
  * JDBC。已合并，未发布
  * REST。规划中
* ACID 事务
* Time Travel。SNAPSHOT，TAG 和正在开发的 Branch
* Schema Evolution
* 支持 orc、parquet 和 avro 格式。默认 orc



## 文件布局

参考 [Basic Concepts](https://paimon.apache.org/docs/master/concepts/basic-concepts/)



在分区内数据存储在 bucket 内

### bucket

* 最小的存储单元，bucket 数量决定数据最大处理并行度。partition 内数据分布在 bucket 内
* bucket 包含 LSM 数据文件和对应的 changelog 文件

#### primary table

固定分桶

分桶数大于 0 即为固定分桶。

固定分桶只能通过离线处理进行[扩缩容](https://paimon.apache.org/docs/master/maintenance/rescale-bucket/)

动态分桶

分桶数设置为 `-1` 即为动态分桶。

动态分桶只支持单个写入任务。