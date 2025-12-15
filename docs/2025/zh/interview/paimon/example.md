# 案例

存储问题

计算问题



## Paimon 介绍

存储体系
rocksdb vs mysql

LSM tree VS B+

表格式 vs 数据库

bucket、partition

索引
内置索引 vs b+ 树索引



### Paimon 表结构

分为 3 类表：

* 主键表。存在主键，支持增删改查
* 日志表。只能插入。
* 系统表。Paimon 元数据信息
  * manifests
  * snapshots
  * schemas
  * files
  * options
  * audit_log
  * binlog
  * buckets
  * parititons
  * tags
  * branches
  * consumers
  * table_indexes
  * statistics



### Paimon 特性

流读，流写，批读，批写，增量计算。changelog-producer

多流 join（partial update），实时打宽

lookup join



tag，branch



实时链路。流读流写，中间数据可查
全流程加速 + Doris + Flink
每日 T + 1 抽取 -> 数据实时入仓

### Changelog 说明

flink sql 原理

changelog，sql

### Paimon 遇到的问题

压缩，多写问题，小文件问题



局限性
延迟。依赖 checkpoint 设置
速度。底层依然是对象存储，需要加载数据，查询



## 实操

环境问题：使用 docker 搭建

minio + mysql + flink + flink-sql-gateway

需要添加的 connector jar:

mysql-cdc connector + jdbc driver
paimon connector + s3 依赖



### 常见操作

常用操作，读取数据，写入数据，多流 join，

流读，流写，批读，批写，增量计算

### 抽取数据

#### Binlog

从 mysql 抽取 binlog 数据，可以使用 flink-cdc 项目。阿里云商业版 flink 服务提供了开源版 mysql-cdc 的商业版实现，可以读取 mysql 本地 binlog 被删除情况下，读取 OSS 上的 binlog 备份。

```sql
-- 开源版 mysql-cdc
CREATE TEMPORARY TABLE products
(
    db_name           STRING METADATA FROM 'database_name' VIRTUAL
    ,table_name       STRING METADATA FROM 'table_name' VIRTUAL
    ,operation_ts     TIMESTAMP_LTZ(3) METADATA FROM 'op_ts' VIRTUAL
    ,operation        STRING METADATA FROM 'row_kind' VIRTUAL
    ,id               INT
    ,name             STRING COMMENT '名称'
    ,`create_user_id` VARCHAR(64)
    ,`create_time`    TIMESTAMP(3)
    ,`update_user_id` VARCHAR(64)
    ,`update_time`    TIMESTAMP(3)
    ,`is_deleted`     TINYINT
    ,PRIMARY KEY (id) NOT ENFORCED
)
WITH (
    'connector' = 'mysql-cdc'
    ,'hostname' = 'localhost'
    ,'port' = '3306'
    ,'username' = 'root'
    ,'password' = '123456'
    ,'database-name' = 'data_center_.*' -- 分库场景，正则表达式匹配多库
    ,'table-name' = 'product_.*'    -- 分表场景，正则表达式匹配多表
    ,'scan.startup.mode' = 'latest-offset'
    ,'server-id' = '200-300'
)
;
```

```mysql
-- 阿里云商业版 mysql。开源版 mysql-cdc 的商业版，connector 需改为 mysql，同时开源版的 row_kind 也变为 op_type 
CREATE TEMPORARY TABLE products
(
    db_name           STRING METADATA FROM 'database_name' VIRTUAL
    ,table_name       STRING METADATA FROM 'table_name' VIRTUAL
    ,operation_ts     TIMESTAMP_LTZ(3) METADATA FROM 'op_ts' VIRTUAL
    ,operation        STRING METADATA FROM 'op_type' VIRTUAL
    ,id               INT
    ,name             STRING COMMENT '名称'
    ,`create_user_id` VARCHAR(64)
    ,`create_time`    TIMESTAMP(3)
    ,`update_user_id` VARCHAR(64)
    ,`update_time`    TIMESTAMP(3)
    ,`is_deleted`     TINYINT
    ,PRIMARY KEY (id) NOT ENFORCED
)
WITH (
    'connector' = 'mysql'
    ,'hostname' = 'localhost'
    ,'port' = '3306'
    ,'username' = 'root'
    ,'password' = '123456'
    ,'database-name' = 'data_center_.*' -- 分库场景，正则表达式匹配多库
    ,'table-name' = 'product_.*'    -- 分表场景，正则表达式匹配多表
    ,'scan.startup.mode' = 'latest-offset'
    ,'server-id' = '200-300'
)
;
```

#### kafka

如果 kafka 消息体是比较扁平的，如：

```json
{
    "order_id": "123456",
    "order_time": "2025-03-15 17:25:23",
    "pay_time": "2025-03-15 17:28:12.918",
    "order_status": 1,
    "buyer_user_id": "ozionlaienalnefa"
}
```

表结构定义可以如下：

```sql
CREATE TEMPORARY TABLE orders
(
    order_id         STRING COMMENT '订单ID'
    ,`order_time`    STRING COMMENT '下单时间'
    ,`pay_time`      TIMESTAMP(3) COMMENT '支付时间'
    ,`order_status`  SMALLINT COMMENT '订单状态 1-下单 2-支付'
    ,`buyer_user_id` VARCHAR(64) COMMENT '买家用户id'
    ,`partition`     BIGINT METADATA VIRTUAL
    ,`offset`        BIGINT METADATA VIRTUAL
    ,`event_time`    TIMESTAMP_LTZ(3) METADATA FROM 'timestamp' -- kafka 消息时间戳
    ,`proctime`      AS PROCTIME() -- 处理时间
    ,ts              AS TO_TIMESTAMP(`order_time`,'yyyy-MM-dd HH:mm:ss') -- 事件时间
    ,WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
)
WITH (
    'connector' = 'kafka'
    ,'properties.bootstrap.servers' = 'localhost:9092'
    ,'properties.group.id' = 'gid_test'
    ,'topic' = 'topic_order'
    ,'format' = 'json'
    ,'scan.startup.mode' = 'earliest-offset'
)
;
```

如果 kafka 消息存在嵌套，如：

```json
{
    "schema_version": "1",
    "data": {
        "order_id": "123456",
        "order_time": "2025-03-15 17:25:23",
        "pay_time": "2025-03-15 17:28:12.918",
        "order_status": 1,
        "buyer_user_id": "ozionlaienalnefa"
    }
}
```

就需要使用 json 函数解析：

```sql
CREATE TEMPORARY TABLE orders
(
    schema_version  STRING COMMENT '订单ID'
    ,`data`         STRING COMMENT '数据'
    ,`partition`    BIGINT METADATA VIRTUAL
    ,`offset`       BIGINT METADATA VIRTUAL
    ,`event_time`   TIMESTAMP_LTZ(3) METADATA FROM 'timestamp' -- kafka 消息时间戳
    ,`proctime`     AS PROCTIME() -- 处理时间
    ,ts             AS TO_TIMESTAMP(JSON_VALUE(`data`, '$.order_time'),'yyyy-MM-dd HH:mm:ss') -- 事件时间
    ,WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
)
WITH (
    'connector' = 'kafka'
    ,'properties.bootstrap.servers' = 'localhost:9092'
    ,'properties.group.id' = 'gid_test'
    ,'topic' = 'topic_order'
    ,'format' = 'json'
    ,'scan.startup.mode' = 'earliest-offset'
)
;
```

### 写入数据

建表参数

bucket、分区

快照

```sql
'snapshot.num-retained.max' = '2880',
'snapshot.time-retained' = '1 d',
```



动态分区

```sql
    'bucket' = '-1'
    ,'target-file-size' = '256 MB'
    ,'partition.expiration-time' = '3d' -- 分区过期时间，例如3天
    ,'partition.expiration-check-interval' = '1h' -- 检查分区过期的间隔时间
    ,'partition.expiration-max-partition-num' = '3' -- 最大保留分区数，超过则删除最旧分区
```

写入参数设置：

```sql
/*+ OPTIONS('sink.parallelism'='2','local-merge-buffer-size'='128 mb','write-buffer-size'='512 mb') */
```



### CTAS 和 CDAS

Paimon表支持实时同步单表或整库级别的数据，在同步过程之中如果上游的表结构发生了变更也会实时同步到Paimon表中。

* CTAS。`create table xxx as xxx`
* CDAS。`create database xxx as xxx`

CTAS 和 CDAS 不是 flink 开源社区的语法，是阿里云商业版的功能。flink 开源社区的语法是 `LIKE` 和 `AS select_statement`。

```sql
-- CTAS 语法
SET 'table.exec.sink.upsert-materialize' = 'NONE'
;

CREATE TABLE IF NOT EXISTS paimon_catalog.ods.ods_item_product   
WITH(
    
   'changelog-producer' = 'input'  
    ,'snapshot.time-retained' = '7 d' 
    )
AS TABLE data_center.item.product 
/*+ OPTIONS('server-id'='8016') */;  -- 指定mysql-cdc源表的额外参数。
;

-- CDAS 语法 mysql -> paimon
SET 'table.cdas.scan.newly-added-table.enabled' = 'true' -- 开启新增表读取功能
;
SET 'table.exec.sink.upsert-materialize' = 'NONE' -- 消除无用的SinkMaterialize算子
;
-- 在 paimon 中创建 data_center_1 库，包括 mysql data_center_1 实例下 item 分库的所有表。
CREATE DATABASE IF NOT EXISTS data_center_1  
WITH(
    'write-mode' = 'change-log'   
    ,'changelog-producer' = 'input'
    )
AS DATABASE data_center_1.item_.*
INCLUDING  TABLE 'item|item_category'  
/*+OPTIONS('server-id'='8010-8012')*/    -- 指定mysql-cdc源表的额外参数。
;  

-- CDAS 语法 mysql -> kafka
SET 'table.cdas.scan.newly-added-table.enabled' = 'true' -- 开启新增表读取功能
;
SET 'table.exec.sink.upsert-materialize' = 'NONE' -- 消除无用的SinkMaterialize算子
;
CREATE DATABASE IF NOT EXISTS kafka_catalog.kafka
WITH (
    'cdas.topic.pattern' = 'ods_item_{table-name}'
    ,'properties.enable.idempotence' = 'false'         -- 高版本 kafka-clients 默认开启了幂等写入，需关闭防止 kafka topic 不支持
    ,'key.json.encode.decimal-as-plain-number' = 'true'
    ,'value.json.encode.decimal-as-plain-number' = 'true'
)
AS DATABASE data_center_1.item INCLUDING 
TABLE 'ass_dispute_work','complaint_work','ass_retrieve_work'
/*+ OPTIONS('server-id'='8031-8033','scan.startup.mode' = 'earliest-offset') */
; 
```

参考链接：

* [CREATE TABLE AS（CTAS）语句](https://help.aliyun.com/zh/flink/create-table-as-statement)
* [CREATE DATABASE AS（CDAS）语句](https://help.aliyun.com/zh/flink/create-database-as-statement)
* [LIKE](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/sql/create/#like)

### 查询数据

通过 sql hint 配置参数 consumer-id：

* Paimon snapshot 过期时会检查是否有 consumer-id 在读取，如果有 consumer-id 在读取，snapshot 不会删除。如果在读取 paimon 表时设置了很多的 consumer-id，任务下线不在启用 consumer-id 不删除，会导致 snapshot 一直不删除，长久下来造成小文件堆积

```sql
select
    *
from paimon_catalog.ods.ods_item_product /*+ OPTIONS('scan.mode'='latest-full','consumer-id' = 'ods_item_product_test','consumer.expiration-time' = '3d') */
;
```



参考链接：

* [Consumer ID](https://paimon.apache.org/docs/master/flink/consumer-id/)

## 参考链接

* [SQL Hints](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/sql/queries/hints/)
* [Building a Real-time Data Lake with Flink CDC](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.5/docs/connectors/flink-sources/tutorials/build-real-time-data-lake-tutorial/)
* [Building a Streaming ETL with Flink CDC](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.5/docs/connectors/flink-sources/tutorials/build-streaming-etl-tutorial/)