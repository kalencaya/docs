# 案例



## 表格式

表格式定义一套“表”的格式，它通过定义“表的”元数据文件和“表”数据的数据文件，将分散的文件组织成一个逻辑上的“表”，并提供事务、版本控制、模式演化等高级功能。

* 文件格式。不像 mysql/es/redis/mongo/kafka 等设计自己的数据存储格式，它采用开放的数据格式如 Parquet、ORC、avro、json、csv。
* 存储方式。支持各种文件系统和对象存储，无厂商和技术锁定，



|          | 关系型数据库                                                 | 表格式                                                   |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 权限管理 | 完备，支持数据库级别，DQL、DML、DDL 等不同权限               | 不支持                                                   |
| 数据格式 | 独有。如 binlog，mysql/postgresql/oracle 等具有各自不同的格式 | 采用开放格式，支持 Parquet、ORC、avro、json、csv 等      |
| 灵活性   | 不够灵活                                                     | 灵活。不限格式、不限存储、不限计算引擎                   |
| 存储     | 依赖数据库实现                                               | 文件系统或对象存储                                       |
| 访问     | 只能通过数据库                                               | 基于规范，通过多语言的 SDK，可在应用、各种计算引擎中访问 |





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

## 概念

* 数据仓库。数据仓库是一个面向主题的、集成的、相对稳定的、反映历史变化的数据集合，用于支持管理决策和信息的全局共享。数据仓库的数据在进入仓库之前需要进行 ETL（提取、转换、加载），以便于未来的分析。数据仓库主要用于存储和管理结构化数据，支持复杂的查询和分析。
  * 优点
    * 高级查询编程语言。支持 SQL
    * 高性能。适合报表和 BI 分析
  * 缺点
    * 非结构化数据能力不足。无法处理音频、视频、文本等非结构化数据，无法支持机器学习
    * 扩展性有限、成本高。变更需要调整 ETL 流程，耗时耗力
* 数据湖。数据湖是一种存储系统，可以存储各种类型的原始数据，包括结构化、半结构化和非结构化数据。数据湖的特点是能够以原始格式存储数据，不需要在存储前进行处理和转换（它和数仓的一大区别就是 ELT，把处理和转换后置）。数据湖通常用于大规模数据存储和处理，支持批处理、流式计算、交互式分析和机器学习等多种分析方式。
  * 缺点
    * 易变成数据沼泽。先收存在处理，不要求数据按照预设的结构存入，容易导致存入的数据变得杂乱无章，同一类型的数据，格式乱七八糟
* 湖仓一体。湖仓一体试图在数据仓库的规范性和数据湖的灵活性之间找到一个平衡点，既能实现数据仓库的数据管理（库、表、字段和权限管理）和查询性能，又能存储各类数据的灵活性。

|          | 数据仓库                        | 数据湖                             | 湖仓一体                        |
| -------- | ------------------------------- | ---------------------------------- | ------------------------------- |
| 存储内容 | 结构化数据（如 MySQL 中的数据） | 任意格式（音频、视频、图片、文本） | 混合存储（原始数据+结构化数据） |
| 数据处理 | ETL（先清洗、转化在存储）       | ELT（先存储在处理）                | 动态处理（按需加工）            |
| 适用场景 | 固定报表、BI 分析               | 机器学习、模型训练                 | 实时分析、跨源数据融合          |

## 数据湖

### 关键技术

为了让数据湖不变成数据沼泽，以及支持湖仓一体，数据湖需要获得如下能力：

* 事务管理。数据湖以文件的形式将文件存在文件系统或对象存储上，满足了海量、廉价存储各种类型的数据，但仅仅“一堆文件”只会形成数据沼泽。数据湖需要在文件系统或对象存储的文件之上，引入一个**事务性的元数据层**：
  * 实现：元数据层通过一个事务日志（Transaction Log）来精确地跟踪“哪个版本的表是由哪些数据文件组成的”。所有的 DML 操作（INSERT, UPDATE, DELETE, MERGE）都通过向日志中追加一条新的原子提交来完成。
  * 收益
    * ACID 事务。解决数据湖不可靠的问题
    * 数据版本控制（时间旅行）。由于所有历史版本都记录在日志中，用户可以轻松查询任意时间点的表状态，这对于审计、错误回滚和保证可复现的机器学习实验至关重要
    * 模式强制与演进 (Schema Enforcement & Evolution)。可以强制写入的数据符合表的预定义结构，防止脏数据污染数据湖；同时也支持表结构的平滑变更
* 高性能。传统数据仓库通过专有的、高度优化的存储格式和计算引擎来实现极致性能，数据湖需要在 Parquet、ORC 这种开放格式的前提下，追上甚至超越它们。
  * 缓存。计算引擎将远程的慢数据缓存到本地的高速 SSD 或内存中，实现加速。由于事务元数据层的存在，引擎可以精确地判断缓存数据是否已经因为表的更新而失效，从而保证了缓存的有效性和一致性。
  * 辅助数据结构。虽然 Parquet、ORC 中的数据不可更改，但我们可以创建和维护一些额外的数据结构来加速查询。
    * 数据统计信息。在元数据中记录每个数据文件里每一列的最大值和最小值。当查询带有 WHERE 条件（如 age > 30）时，引擎可以先检查统计信息，如果一个文件的 age 列最大值只有25，那么就可以直接**跳过（Data Skipping）**读取整个文件，极大地减少了 I/O。
    * 索引。例如布隆过滤器（Bloom filters）或更复杂的索引结构，可以帮助引擎快速判断某个值是否存在于一个文件中，进一步增强数据跳过的效果
  * 数据布局优化。数据的物理组织方式对查询性能有决定性影响，如对数据进行排序每次查询只需读取少量连续的文件，而不是大量分散的文件。

#### 事务管理

数据湖的文件如果不加以管理，就是一堆文件，杂乱无章。

![MetadataTreeSmall.png](https://images.squarespace-cdn.com/content/v1/56894e581c1210fead06f878/c686cef2-84b4-4b43-91a9-5890128ab9e5/MetadataTreeSmall.png?format=2500w)

Paimon 的文件结构分为 2 层：

* 元数据层。存储表的字段信息、数据文件位置和数据统计信息
* 数据层。数据文件和索引文件，它们构成了表的实际数据

![文件结构](https://paimon.apache.org/docs/master/img/file-layout.png)

Paimon 文件类型：

* [snapshot](https://paimon.apache.org/docs/master/concepts/spec/snapshot/)
* [schema](https://paimon.apache.org/docs/master/concepts/spec/schema/)
* [manifest list & manifest](https://paimon.apache.org/docs/master/concepts/spec/manifest/)
* [data file](https://paimon.apache.org/docs/master/concepts/spec/datafile/)
* changelog file
* data file index
* global index

Paimon 和 Flink 的实现采取了`并行写入，串行提交`的方式，过程如下：

* 写入阶段。Flink 向文件系统或对象系统写入数据，写入数据包含分区、存储桶、数据文件和索引。写入并发通常为一个 bucket 一个 writer。
* 提交阶段。Flink 在向文件系统或对象系统写入数据后，需提交写入的数据到元数据层。每次提交会生成一个新的 snapshot，snapshot id 自增，因此每次提交时 writer 会根据现有的 snapshot 的 id 决定下一个 snapshot 的 id。Paimon 确保不能提交到已提交的 snapshot id（实际上 Paimon 的实现利用了文件系统的 rename 操作来实现提交，数据在写入期间，数据文件和元数据文件也会不断地写入到文件系统上，在提交的时候首先决定提交的 snapshot id，然后将写入的元数据文件通过 rename 操作实现提交。hdfs 的 rename 操作具有原子性，OSS 和 S3 对象存储不具有原子性，有一定概率丢数据）。

![snapshot-conflict](https://paimon.apache.org/docs/master/img/snapshot-conflict.png)

Flink 在数据写入的时候，先对数据按照分区和桶将数据 shuffer 到对应的 Writer，确保每个 bucket 只有一个 writer。writer 会将创建的数据和索引文件传输到一个 commiter 执行提交。这种实现方式确保了每个 bucket 内数据的写入是串行的，不同 bucket 内数据的写入是并行的。

![FlinkTopologySmall.png](https://images.squarespace-cdn.com/content/v1/56894e581c1210fead06f878/303eb978-5719-44b0-9d82-12616a3ab0ad/FlinkTopologySmall.png?format=2500w)

#### 高性能

无论是关系型数据库还是 Paimon 等开放表格式的元数据层，都有着共同的目标：*最大限度地减少扫描的数据量*

依靠更宽松的数据布局和轻量级的元数据来指导 query（剪枝是一种 query 优化）。

##### 数据布局

![PartitionsAndBucketsSmall.png](https://images.squarespace-cdn.com/content/v1/56894e581c1210fead06f878/3ac4d131-0bef-41e3-88be-783749576a42/PartitionsAndBucketsSmall.png?format=2500w)

* 分区。数据文件被组织成一个或多个分区，分区是基于一组分区列定义的。分区允许计算引擎剔除与查询无关的整个分区，从而提高查询效率。通常，分区是基于时间的，例如日期。由于分区的存在，按日期筛选的查询可以避免加载大量数据文件

* 分桶。每个分区又可以进一步细分为一个或多个桶，在每个分区内，数据根据 bucket-key（如果没有 bucket-key，则根据 primary key）分布到各个桶中。桶的数量可以是固定的，也可以在写入数据时动态创建。对于固定数量的桶，数据根据桶键（或主键）的哈希值路由到相应的桶；对于按需创建的动态桶，则在全局桶索引中维护一个桶键到桶的映射关系（类似于 Apache Hudi 及其文件切片）。
* 排序。文件中的数据按主键排序
* 存储格式。数据文件支持多种存储格式，默认采用 parquet，支持 orc、avro、json、csv 和 lance。parquet 和 orc 是列式格式存储。列式存储将数据存在列中而非行中，并将数据分组为大的连续块。因为 OLAP 类的查询需求往往需要 aggregate 和 join，只需要对部分列进行 group by，无需查询所有行，只需加载部分列即可。将列集中存储因为数据类型相同也更容易做数据压缩。列式存储通过在数据扫描期间有效跳过数据来加速。

##### 辅助数据结构

###### 列统计信息

对于开放表格式而言，列统计信息是查询引擎用来定位数据文件和文件中行组的主要方法：

* 元数据文件。清单文件中列出了数据文件以及每列的最小值和最大值，查询引擎可以在利用这些列统计信息，在规划阶段就跳过某些文件
* 数据文件。Parquet 文件被划分为多个行组，每个行组包含数千到数百万行数据，并按列存储。对于行组中的每一列，Parquet 都会记录最小值/最大值统计信息，查询引擎可以利用这些信息，快速跳过整个行组。

###### 索引

通过维护额外的索引文件，查询引擎在查询时可快速检索数据，定位数据，确定要读取的数据文件。

索引一般有 2 个：`BloomFilter` 和 `Bitmap` 索引及其变种

##### 更新操作

数据文件是不可变的，但是数据不仅仅是 insert，还有 update 和 delete。

因为 Parquet 文件是不支持修改的，无法支持原地更新。更新操作普遍有 3 种实现方式：

* COW（写时复制）。在更新时读取数据对应的数据文件中全部数据，将数据更新后将所有数据写入新的数据文件。缺点是写入时需大量复制数据，写入慢读取友好
* MOR（读时合并）。在更新数据时直接将更新的数据写入到新的数据文件中，读取数据时需读取所有的数据文件，并根据相关序列号进行排序，读取最新的数据。写入友好读取慢
* MOW（写时合并）。Paimon 数据存储采用 LSM 结构，可以支持按照 primary key 查询。写入的时候数据写入新的文件，并通过 deletion vector 文件标记数据文件中被修改的数据删除了，从而可以在读取时直接过滤不需要的数据。这种方式在写入和读取时性能都很高。（Iceberg 在实现类似的功能）

之前有介绍数据在写入时每个 bucket 只有一个 writer，单 bucket 是串行写入，要提高并发需增加 bucket 数量。deletion vector 的另一个优势是可以支持单个 bucket 并发读取。在没有 deletion vector 时如果采用 MOR 模式，reader 需读取 bucket 中的所有数据按照序列号进行排序，从而确定最新的数据，因此无法实现多个 reader 同时读取一个 bucket，每个 reader 读取 bucket 中的一部分数据。有了 deletion vector 后，每个 reader 读取 deletion vector 到内存中，然后读取 bucket 中的一部分数据，只需要在读取时通过 deletion vector 过滤标记删除的数据即可。

##### 压缩

因为每次提交时都会生成新的一批数据文件（数据文件的生成不是提交时一次性写入的，而是在提交间隔内持续性写入，写入的数据文件只有提交后才可见。如果数据在写入后未提交，则会变成 orphan 文件，可通过配置自动删除），时间久了，数据会分布在许多文件中。可通过 `Compaction` 操作将多个数据文件自动合并成一个数据文件，减少数据文件数量，优化读取性能。

##### 点查

OLAP 和 OLTP 因为常见负载用途不同，OLTP 系统只需读取少量行或更新单个记录，而 OLAP 系统查询通常需要扫描数百万行甚至数十亿行数据，并通过 aggregate 和 join 来获得分析结果。

但是对于点查场景（根据主键查询整行数据），OLAP 往往表现拉垮。Paimon 得益于 LSM 结构，对于 primary key 过滤表现良好，因此可以在实时计算场景中替代 redis/hbase，实现统一存储。其他的 OLAP 产品，比如 Doris、Hologres 等 OLAP 产品对于点查支持不好的问题，开发出了行列共存模式，提高点查能力。

如果 Paimon 数据写入时性能不够，也可调整文件格式为 avro，切换为行存模式，加快写入速度。Paimon 不支持行列共存，使用 avro 时执行分析型查询会很慢，往往需要对数据进行再次加工，以 Parquest 等列存格式存储。

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