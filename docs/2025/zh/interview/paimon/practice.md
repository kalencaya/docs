# 实践





## 参考链接

* [Paimon 实践 | 幸福里基于 Flink & Paimon 的流式数仓实践](https://mp.weixin.qq.com/s/torn9jWdG4E50rGKzvYP_g)
* [快速上手使用 Paimon MySQL CDC](https://mp.weixin.qq.com/s/ejoZQ6AMm7QAS4nVSpTntg)
* [海程邦达基于Apache Paimon+Streampark实现 Streaming warehouse的实战应用](https://mp.weixin.qq.com/s/KB_CG-o7PHqY1V5FcMt85w)
* [巴别时代基于 Apache Paimon 的 Streaming Lakehouse 的探索与实践](https://mp.weixin.qq.com/s/NxYvXj5NHRJf1J8oFiFmfQ)
* [Apache Paimon 在同程旅行的探索实践](https://mp.weixin.qq.com/s/edS2_TKhg3jRC0MXzhiCpg)

![湖仓一体架构](https://mmbiz.qpic.cn/mmbiz_png/8AsYBicEePu7eiaj66wa1ObEiaibMcH1dpEJau8yiacNbtQbEfQPsV1QE5x8vqEnib7YcOcyJeXcQr63k6arAP8cq0Wg/640?wx_fmt=png&from=appmsg&randomid=v9v33jj1&tp=webp&wxfrom=5&wx_lazy=1)

## 场景

### CDC 入湖

### 日志、埋点

使用 Append 表作为 ods 层表。

```sql
CREATE TABLE if not exists paimon.ods.event_log(
    .......
) 
PARTITIONED BY (......)
WITH (
  'bucket' = '100',
  'bucket-key' = 'uuid',
  'snapshot.time-retained' = '7 d',
  'write-mode' = 'append-only'
);
INSERT INTO paimon.ods.event_log
SELECT 
    .......
FROM 
    realtime_event_kafka_source
;
```

日志入湖

```sql
--CREATE TABLE
create table t_ods_table(
    ......
    gn string,
    dt string 
 ) partitioned by (gn,dt) 
WITH (
    'bucket' = '8',
    'bucket-key' = 'id',
    'write-mode' = 'append-only', --创建 Append Anly 表
    'snapshot.time-retained' = '24h'
);

--INSERT
create table default_catalog.default_database.role_login (
    message string,
    fields row < project_id int,
    topic string,
    gn string >
) with (
    'connector' = 'kafka',
    'topic' = 'topic',
    'properties.bootstrap.servers' = '${kafka_server}',
    'properties.group.id' = 'topic_group',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'json'
);

insert into
    fts_ods_log.t_ods_table
select
    ......
    cast(SPLIT_INDEX(message, '|', 5) as int) log_create_unix_time,
    fields.gn gn,
    FROM_UNIXTIME(
        cast(SPLIT_INDEX(message, '|', 5) as int),
        'yyyy-MM-dd'
    ) dt
from
    default_catalog.default_database.role_login
where
  try_cast(SPLIT_INDEX(message, '|', 5) as int) is not null
  and cast(SPLIT_INDEX(message, '|', 5) as int) between 0 and 2147483647;
```



### 基于 Partial Update 打宽宽表

* 主键表
* 设置 `merge-engine` 为 `partial-update`
* `partial-update` 不能接收和处理 DELETE 消息，为了避免接收到 DELETE 消息报错，需要通过配置 `'partial-update.ignore-delete' = 'true'` 忽略 DELETE 消息。

优点：在没有存储支持 partial update，从而可以在存储系统实现打宽宽表时，需要通过 flink 多流 join 来打宽，消耗大量资源存储 state。在存储层通过 partial update 打宽，flink 任务直接写入即可，节省资源。

结果表字段由多个数据源提供组成，可使用 Union All 的方式进行逻辑拼接。这里所说的多个 Flink 流任务并不是指多个 Flink Job 并发写同一张 Paimon 表，这样需要拆分 Compaction 任务，就不能在每个 Job 的 Writer 端做 Compaction, 需要一个独立的 Compaction 任务，比较麻烦。目前推荐将多条 Flink 流任务 UNION ALL 起来，启动一个 Job 写 Paimon 表

数据写入

```sql
--FlinkSQL参数设置
set `table.dynamic-table-options.enabled`=`true`;
SET `env.state.backend`=`rocksdb`; 
SET `execution.checkpointing.interval`=`60000`;
SET `execution.checkpointing.tolerable-failed-checkpoints`=`3`;
SET `execution.checkpointing.min-pause`=`60000`;


--创建Paimon catalog
CREATE CATALOG paimon WITH (
  'type' = 'paimon',
  'metastore' = 'hive',
  'uri' = 'thrift://localhost:9083',
  'warehouse' = 'hdfs://paimon',
  'table.type' = 'EXTERNAL'
);

--创建Partial update结果表
CREATE TABLE if not EXISTS paimon.dw.order_detail
(
    `order_id` string 
    ,`product_type` string 
    ,`plat_name` string 
    ,`ref_id` bigint 
    ,`start_city_name` string 
    ,`end_city_name` string 
    ,`create_time` timestamp(3)
    ,`update_time` timestamp(3) 
    ,`dispatch_time` timestamp(3) 
    ,`decision_time` timestamp(3) 
    ,`finish_time` timestamp(3) 
    ,`order_status` int 
    ,`binlog_time` bigint
    ,PRIMARY KEY (order_id) NOT ENFORCED
) 
WITH (
  'bucket' = '20', -- 指定20个bucket
  'bucket-key' = 'order_id',
  -- 记录排序字段
  'sequence.field' = 'binlog_time', 
  -- 选择 full-compaction ，在compaction后产生完整的changelog
  'changelog-producer' = 'full-compaction',  
  -- compaction 间隔时间
  'changelog-producer.compaction-interval' = '2 min', 
  'merge-engine' = 'partial-update',
  -- 忽略DELETE数据，避免运行报错
  'partial-update.ignore-delete' = 'true' 
);

INSERT INTO paimon.dw.order_detail
-- order_info表提供主要字段
SELECT
order_id,
product_type,
plat_name,
ref_id,
cast(null as string) as start_city_name,
cast(null as string) as end_city_name,
create_time,
update_time,
dispatch_time,
decision_time,
finish_time,     
order_status,
binlog_time
FROM
paimon.ods.order_info /*+ OPTIONS ('scan.mode'='latest') */

union all 

-- order_address表提供城市字段
SELECT
order_id,
cast(null as string) as product_type,
cast(null as string) as plat_name,
cast(null as bigint) as ref_id,
start_city_name,
end_city_name,
cast(null as timestamp(3)) as create_time,
cast(null as timestamp(3)) as update_time,
cast(null as timestamp(3)) as dispatch_time,
cast(null as timestamp(3)) as decision_time,
cast(null as timestamp(3)) as finish_time,  
cast(null as int) as order_status,
binlog_time
FROM
paimon.ods.order_address/*+ OPTIONS ('scan.mode'='latest') */
;
```

dim 维表 sql

```sql
--CREATE TABLE
create table t_dim_A01(
    ......
    gn string,
    PRIMARY KEY (gn,lid) NOT ENFORCED
) WITH (
    'bucket' = '4',
    'snapshot.time-retained' = '24h'
);
--INSERT
insert into
    fts_dim.t_dim_A01
select
    'AA' as gn,
    ......
from
    fts_ods_db_A.A01
union all
select
    'BB' as gn,
    ......
from
    fts_ods_db_B.A01
......
```

dwd 入湖：

```sql
--CREATE TABLE
create table t_dwd_table(
    ......
    id string,
    gn string,
    dt string,
    PRIMARY KEY (gn, id, log_create_unix_time, dt) NOT ENFORCED
) partitioned by (gn, dt) WITH (
    'bucket' = '8',
    'bucket-key' = 'id',
    'changelog-producer' = 'full-compaction',
    'changelog-producer.compaction-interval' = '54s',
    'snapshot.time-retained' = '24h'
);

--INSERT
create view default_catalog.default_database.t_table_view as (
    select
        ......
        PROCTIME() proc_time,
        gn,
        dt
    from
        fts_ods_log.t_ods_table
    where
        AA is not null
        and try_cast(BB as int) is not null
        and try_cast(CC as int) is not null
)
insert into
    fts_dwd.t_dwd_table
select
    /*+ LOOKUP('table'='fts_dim.t_dim_A01', 'retry-predicate'='lookup_miss', 'retry-strategy'='fixed_delay', 'fixed-delay'='10s','max-attempts'='30'),
     LOOKUP('table'='fts_dim.t_dim_A02', 'retry-predicate'='lookup_miss', 'retry-strategy'='fixed_delay', 'fixed-delay'='10s','max-attempts'='30'),
     LOOKUP('table'='fts_dim.t_dim_A03', 'retry-predicate'='lookup_miss', 'retry-strategy'='fixed_delay', 'fixed-delay'='10s','max-attempts'='30')*/
    ......
    cast(d.open_date_time as int) open_date_time,
    cast(d.merge_server_time as int) merge_server_time,
    CONCAT(a.aa, a.bb) id,
    a.gn,
    a.dt
from
    default_catalog.default_database.t_table_view as a
    left join fts_dim.t_dim_A01 for SYSTEM_TIME AS OF a.proc_time as b on a.AA = b.AA
    and a.BB = b.BB
    left join fts_dim.t_B01 for SYSTEM_TIME AS OF a.proc_time as c on a.AA = c.AA
    and a.BB = c.BB
    left join fts_dim.t_dim_C01 for SYSTEM_TIME AS OF a.proc_time as d on a.AA = d.AA
    and a.BB = d.BB;
```

DWD 层也采用 Paimon 的 PK 表，ODS 层的表数据经由 Flink SQL 做 ETL 清洗，并通过 Retry Lookup Join 关联维表拉宽后写入到 DWD 层对应的 Paimon 表里，由于维表数据可能晚于事实数据到达湖仓，存在 Join 不上的情况，所以这里需要增加重试机制

DWS 层主要是分主题进行数仓建模，目前主要采用 Paimon 的 Agg 表进行一些预聚合模型及大宽表的建设

aggregation：如果用户建表时指定 'merge-engine' = 'aggregation'，此时使用聚合表引擎，可以通过聚合函数做一些预聚合，每个除主键以外的列都可以指定一个聚合函数，相同主键的数据就可以按照列字段指定的聚合函数进行相应的预聚合，如果不指定则默认为 last-non-null value ，空值不会覆盖。Agg 表引擎也需要结合 Lookup 或者 full-compaction 的 Changelog Producer 一起使用，需要注意的是除了 SUM 函数，其他的 Agg 函数都不支持 Retraction，为了避免接收到 DELETE 和 UPDATEBEFORE 消息报错，需要通过给指定字段配置 'fields.${field_name}.ignore-retract'='true' 忽略。

### Append 表

必须设置 `bucket-key`。因为无主键

### Changelog Produer

如果不指定则不会在写入 Paimon 表的时候生成 Changelog，那么下游任务需要在流读时生成一个物化节点来产生 Changelog。这种方式的成本相对较高，同时官方不建议这样使用，因为下游任务在 State 中存储一份全量的数据，即每条数据以及其变更记录都需要保存在状态中。

Paimon 支持的 Changelog Produer 包括：

- none：如果不指定，默认就是 none，成本较高，不建议使用。
- input：如果我们的 Source 源是业务库的 Binlog ，即写入 Paimon 表 Writer 任务的输入是完整的 Changelog，此时能够完全依赖输入端的 Changelog, 并且将输入端的 Changelog 保存到 Paimon 的 Changelog 文件，由 Paimon Source 提供给下游流读。通过配置 'changelog-producer' = 'input'，将 Changelog Producer 设置为 input 。
- lookup：如果我们的输入不是完整的 Changelog, 并且不想在下游流读时通过 Normalize 节点生成 Changelog, 通过配置 'changelog-producer' = 'lookup'，通过 Lookup 的方式在数据写入的时候生成 Changelog，此 Changelog Produer 目前处于实验状态，暂未经过大量的生产验证。
- full-compaction：除了以上几种方式，通过配置 'changelog-producer' = 'full-compaction' 将 Changelog Producer 设置为 full-compaction，Writer 端在 Compaction 后产生完整的 Changelog，并且写入到 Changelog 文件。通过设置 changelog-producer.compaction-interval 配置项控制 Compaction 的间隔和频率，不过此参数计划弃用，建议使用 full-compaction.delta-commits，此配置下默认为1 即每次提交都做 Compaction。

## 实时发展

参考文档：

* [Paimon 实践 | Paimon+StarRocks 湖仓一体数据分析方案](https://mp.weixin.qq.com/s/vooE9p9k3Xi-YFHotq-PLw)

首先介绍一下实时化的演进历程，对整个发展过程和未来的方向有一个概括性的了解。

- 第一阶段：起步。基于 Kafka 的实时 ETL，包括实时采集、实时加工、实时载入、实时 OLAP。该架构能够解决的问题大都是基于事实表的统计分析，已经在行内有大量的落地案例，但无法解决银行基于维度表的统计分析。另外，该方案很难形成规模化的数据分层复用，Kafka 数据无法查询和长期持久化等问题也比较突出。
- 第二阶段：探索。为了解决银行业大量基于维度表统计分析场景，先载入后分析，也就是 ELT 的方式。过程是先实时采集，然后不进行逻辑加工直接实时载入，最后再实时 OLAP 查询阶段进行逻辑加工。
  - 在 ELT 探索初期，我们采用过微批全量的方式，在数据实时写入到数据库后，定时执行全量加工逻辑，类似于离线数仓跑批的概念。只不过是从每天跑批缩短到了小时级别，甚至分钟级别，达到准时加工的效果。显而易见这种方式不可取，存在时效性差、跑批不稳定等问题。
  - 随着 MPB 数据库的发展，查询性能也得到了极大的提升。使用 View 视图嵌套加工逻辑的方式也进行了探索，也就是把业务数据以 CDC 的方式载入 MPP 数据库的明细层，分析查询逻辑使用 View 封装，在查询时触发底层计算。这种方式也可以解决维度表的统计分析，但每次查询资源消耗太大，无法大范围推广。这种 ELT 方式虽然能够解决一部分的实时场景，但局限很大。
- 第三阶段：优化。接下来到了优化升级和未来方向选择的节点。为了解决银行业基于维度表的实时 OLAP，必须把部分计算向前移动到 Flink 计算。数据湖 Flink Table Store(Apache Paimon) 的出现，使基于维度表的全量统计分析成为了可能。也就是前期一部分的加工工作在 Flink 中完成，另一部分聚合等计算工作在 OLAP 数据库中完成，两者分摊了计算的时间消耗。
- 第四阶段：未来。在未来还是希望能够把全部加工逻辑在 Flink 端完成，向着存算分离流批一体的流式数仓方向发展。
