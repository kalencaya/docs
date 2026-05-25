# ODS

ods 的问题一般有 2 个：

* 数据从哪来？
* 数据写到哪里去？

如果是以实时为主的数仓，数据一般有 2 个源头：

* 数据库 binlog
* kafka

数据写入目的地的选型会比较多，依据技术选型和数据基建，用的比较多的有：

* paimon
* kafka
* doris

关于 Flink 的 catalog 说明

## Source

### MySQL

假设上游 MySQL 的 DDL 如下：

```mysql
DROP TABLE IF EXISTS sku_info
;

CREATE TABLE IF NOT EXISTS sku_info
(
    `id`              VARCHAR(255) COMMENT 'SKU ID',
    `spu_id`          VARCHAR(255) COMMENT 'SPU ID',
    `price`           DECIMAL(16, 2) COMMENT '价格',
    `sku_name`        VARCHAR(255) COMMENT 'SKU名称',
    `sku_desc`        VARCHAR(255) COMMENT 'SKU描述',
    `weight`          DECIMAL(16, 2) COMMENT '重量',
    `tm_id`           VARCHAR(255) COMMENT '品牌ID',
    `category3_id`    VARCHAR(255) COMMENT '品类ID',
    `sku_default_img` VARCHAR(255) COMMENT '默认显示图片',
    `is_sale`         VARCHAR(255) COMMENT '是否在售',
    `create_time`     DATETIME COMMENT '创建时间',
  	PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB COMMENT = 'sku info'
;
```

### Kafka



## Sink

### Paimon

Paimon 的 DDL 如下：

```sql
-- 使用 Flink SQL 编写 DDL 语句。Paimon 是湖仓表格式，并没有自己的执行引擎，依赖 Flink、Spark、Doris 等
DROP TABLE IF EXISTS paimon_catalog.ods.ods_product_sku_info
;

CREATE TABLE IF NOT EXISTS paimon_catalog.ods.ods_product_sku_info
(
    `id`              STRING COMMENT 'SKU ID',
    `spu_id`          STRING COMMENT 'SPU ID',
    `price`           DECIMAL(16, 2) COMMENT '价格',
    `sku_name`        STRING COMMENT 'SKU名称',
    `sku_desc`        STRING COMMENT 'SKU描述',
    `weight`          DECIMAL(16, 2) COMMENT '重量',
    `tm_id`           STRING COMMENT '品牌ID',
    `category3_id`    STRING COMMENT '品类ID',
    `sku_default_img` STRING COMMENT '默认显示图片',
    `is_sale`         STRING COMMENT '是否在售',
    `create_time`     TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`) NOT ENFORCED
) 
COMMENT 'sku info'
WITH (
    'bucket' = '-1'
    ,'changelog-producer' = 'input'
)
;
```

## 抽取

### MySQL -> Paimon

使用 Flink 抽取 SQL 如下：

```sql
CREATE TEMPORARY TABLE mysql_sku_info
(
    `id`              STRING COMMENT 'SKU ID',
    `spu_id`          STRING COMMENT 'SPU ID',
    `price`           DECIMAL(16, 2) COMMENT '价格',
    `sku_name`        STRING COMMENT 'SKU名称',
    `sku_desc`        STRING COMMENT 'SKU描述',
    `weight`          DECIMAL(16, 2) COMMENT '重量',
    `tm_id`           STRING COMMENT '品牌ID',
    `category3_id`    STRING COMMENT '品类ID',
    `sku_default_img` STRING COMMENT '默认显示图片',
    `is_sale`         STRING COMMENT '是否在售',
    `create_time`     TIMESTAMP(3) COMMENT '创建时间',
    PRIMARY KEY (`id`) NOT ENFORCED
)
WITH (
    'connector' = 'mysql'
    ,'hostname' = '<host>'
    ,'port' = '<port>'
    ,'username' = '<root>'
    ,'password' = '<password>'
    ,'database-name' = '<database>'
    ,'table-name' = '<table>'
    ,'jdbc.properties.tinyInt1isBit' = 'false'
    ,'server-id' = '8601-8610' -- 需协调好各个 binlog 服务抽取
    ,'scan.startup.mode' = 'initial'
)
;

BEGIN STATEMENT SET
;

INSERT INTO paimon_catalog.ods.ods_product_sku_info
SELECT
    ,`id`
	  ,`spu_id`
	  ,`price`
	  ,`sku_name`
    ,`sku_desc`
    ,`weight`
    ,`tm_id`
    ,`category3_id`
    ,`sku_default_img`
    ,`is_sale`
    ,`create_time`
FROM mysql_sku_info
;

END
;
```

