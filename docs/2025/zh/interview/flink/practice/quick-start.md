# 快速开始

以 paimon 为例，使用 paimon catalog 和 connector，文件系统采用 minio，即 s3。

* 下载 catalog，参考 [Quick Start](https://paimon.apache.org/docs/1.1/flink/quick-start/)，下载 Flink 1.20 的 bundle 包：[paimon-flink-1.20-1.1.1.jar](https://repo.maven.apache.org/maven2/org/apache/paimon/paimon-flink-1.20/1.1.1/paimon-flink-1.20-1.1.1.jar)。
* 下载 s3 支持。参考 [Filesystems](https://paimon.apache.org/docs/1.1/maintenance/filesystems/)，下载 [paimon-s3-1.1.1.jar](https://repo.maven.apache.org/maven2/org/apache/paimon/paimon-s3/1.1.1/paimon-s3-1.1.1.jar)。

```sql
-- 创建 catalog，注意替换 s3 endpoint 地址
CREATE CATALOG paimoncatalog WITH (
    'type'='paimon',
    'warehouse'='s3://gravitino/gravitino/paimon/',
    's3.endpoint' = 'http://localhost:9000',
    's3.access-key' = 'admin',
    's3.secret-key' = 'password'
);

-- 创建 paimon sink 表，在 paimon catalog 下无需指定 connector 为 paimon 和 path
CREATE TABLE paimoncatalog.`default`.word_count (
    word STRING PRIMARY KEY NOT ENFORCED,
    cnt BIGINT
);

-- 创建 source 表
CREATE TABLE vvp.`default`.word_table (
    word STRING
) WITH (
    'connector' = 'datagen',
    'fields.word.length' = '1'
);

-- 像 paimon 中写入数据，执行插入
INSERT INTO paimoncatalog.`default`.word_count SELECT word, COUNT(*) FROM vvp.`default`.word_table GROUP BY word;


-- 查询 paimon 数据
select * from paimoncatalog.`default`.word_count;
```

## paimon 数据库实时入湖

```sql
CREATE TEMPORARY TABLE mysqlcdc_source (
   order_id INT,
   order_date TIMESTAMP(0),
   customer_name STRING,
   price DECIMAL(10, 5),
   product_id INT,
   order_status BOOLEAN,
   db_name STRING METADATA FROM 'database_name' VIRTUAL,  -- 读取库名。
   table_name STRING METADATA  FROM 'table_name' VIRTUAL, -- 读取表名。
   operation_ts TIMESTAMP_LTZ(3) METADATA FROM 'op_ts' VIRTUAL, -- 读取变更时间。
   op_type STRING METADATA FROM 'op_type' VIRTUAL, -- 读取变更类型。
   PRIMARY KEY(order_id) NOT ENFORCED
) WITH (
  'connector' = 'mysql',
  'hostname' = '<yourHostname>',
  'port' = '3306',
  'username' = '<yourUsername>',
  'password' = '<yourPassword>',
  'database-name' = '<yourDatabaseName>',
  'table-name' = '<yourTableName>',
  'server-id' = '8000'
);

-- 在表名或者库名中使用正则表达式匹配多个表或者多个库
-- 'database-name' = '(^(test).*|^(tpc).*|txc|.*[p$]|t{2})', -- 正则表达式匹配多个库。
-- 'table-name' = '(t[5-8]|tt)' -- 正则表达式匹配多张表。


```

## selectdb 数据库实时入仓

```sql
CREATE TEMPORARY TABLE selectdb_sink (
  order_id BIGINT,
  user_id STRING,
  shop_id BIGINT,
  product_id BIGINT,
  buy_fee DECIMAL,   
  create_time TIMESTAMP(6),
  update_time TIMESTAMP(6),
  state int
) 
  WITH (
  'connector' = 'doris',
  'fenodes' = 'selectdb-cn-jfj3z******.selectdbfe.rds.aliyuncs.com:8080',
  'username' = 'admin',
  'password' = '${secret_values.selectdb}',
  'table.identifier' = 'selectdb.selecttable',
  'sink.enable-delete' = 'true'
);

```

## kafka 数据库实时导入

```sql
-- todo
```

## paimon merge-engine 实操

```sql
-- partial-update
CREATE TABLE paimon_catalog.dwd.dwd_order
(
    `order_id`                      STRING
    ,`product_id`                   STRING
    ,`product_name`                 STRING
    ,`product_type`                 SMALLINT
    ,`buyer_id`                     STRING
    ,`seller_id`                    STRING
    ,`order_item_amount`            BIGINT
    ,`order_pay_amount`             BIGINT
    ,PRIMARY KEY (order_id) NOT ENFORCED
)
WITH (
    'merge-engine' = 'partial-update'
    ,'changelog-producer' = 'lookup' 
    ,'partial-update.ignore-delete' = 'true'  --partial-update 无法处理 delete 与 update_before 消息
    ,'snapshot.time-retained' = '7d'   --快照保存7天
)
;

-- aggregation
-- 需关闭 table.exec.sink.upsert-materialize 
SET 'table.exec.sink.upsert-materialize' = 'NONE'
;
CREATE TABLE paimon_catalog.dws.msg_sum
(
    session_id               STRING
    ,first_msg_time          TIMESTAMP(3)
    ,last_msg_time           TIMESTAMP(3)
    ,msg_cnt                 BIGINT
    ,PRIMARY KEY (session_id) NOT ENFORCED
)
-- PARTITIONED BY (ds)
WITH (
    'merge-engine' = 'aggregation'
    ,'changelog-producer' = 'lookup'
    ,'snapshot.time-retained' = '1d'  ---- 快照保留
    ,'fields.first_msg_time.aggregate-function' = 'min' -- 指定 aggregate-function
    ,'fields.first_msg_time.source-field' = 'message_time' -- 指定该对那个字段进行 aggregate
    ,'fields.first_msg_time.ignore-retract' = 'true' -- 忽略 retract 消息
    ,'fields.last_msg_time.aggregate-function' = 'max'
    ,'fields.last_msg_time.source-field' = 'message_time'
    ,'fields.last_msg_time.ignore-retract' = 'true'
    ,'fields.msg_cnt.aggregate-function' = 'sum'
    ,'fields.msg_cnt.source-field' = 'msg_cnt'
    ,'fields.msg_cnt.ignore-retract' = 'true'
)
;
```

