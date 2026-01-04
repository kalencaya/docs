# 概览

[Apache Paimon](https://paimon.apache.org/) 是一种新型的流式数据湖存储技术，结合了 LSM-Tree 结构和湖格式，提供了高吞吐、低延迟的数据摄入、完整的流式变更订阅以及高效的 OLAP 查询能力。

* 流批一体。基于统一的数据湖存储，在分钟级时效性基础上满足流、批、OLAP 等场景的全方位支持。
  * 近实时高效更新
  * 局部更新
  * 增量流读
  * 全增量混合流读
  * 特别的 Lookup 能力
* 实时入湖
  * CDC 摄入
  * Schema Evolution
* 生态扩展
  * 计算引擎
    * flink
    * spark
    * hive
    * trino
    * doris
    * starrocks
  * 存储。支持文件系统/对象存储
  * 语言
    * java
    * python
    * rust
* iceberg 生态

## 应用场景

### 实时数仓

实时数仓经历以下阶段：

- 第一阶段：Kafka + Flink。基于 Kafka 和 Flink 的实时 ETL，Kafka 作为存储层，数据经过实时采集、实时加工、实时写入在线存储如 Redis、MySQL 等供在线查询使用。该方案中因为 Kafka 无法查询和做长期持久化，需将 Kafka 中数据 dump 到离线数仓中供问题排查。该方案资源耗费高，难以规模化，着重解决实时问题，无法统一解决实时和离线。
- 第二阶段：OLAP 或 MPB。当年 Clickhouse 以生产可用的向量化引擎横空出世，给实时数仓带来了新的解决思路：将数据实时写入 Clickhouse，不进行逻辑加工，实时 OLAP 查询阶段进行逻辑加工。即 ELT。而当前 Doris、StarRocks 以**易用性**的优势成为主流。
  - 微批全量。数据实时写入到 Clickhouse 后，将离线调度由天级调整为小时级、甚至分钟级，达到准实时加工效果。这种方式不是真正地实时，依然受限于调度频率，可能存在跑批不稳定等问题。
  - View。使用 View 封装加工逻辑，查询时触发 View 底层计算。可以做到真正地实时，受限于 View 性能、查询消耗资源大，使用场景受限无法推广至所有场景。
  - 物化视图。类似 View，受限于物化视图成熟度，在创建物化视图时有诸多限制。
- 第三阶段：流式湖仓
  - paimon
  - risewave 等

### 实时任务优化

案例分享：

* [美团 Flink 大作业部署与状态稳定性优化实践](https://mp.weixin.qq.com/s/KZoEBjdqDsW34PUUuLR8Xw)。大作业并发度达到 5000，状态达到了 10 TB
* [Apache Paimon 在抖音集团多场景中的优化实践](https://mp.weixin.qq.com/s/D2vIw4OUZB3bhCKbsqzESA)。某基于 MQ 和 Flink 做打宽任务的多流 Join，状态大小超过了 10TB，计算资源 1600+ CU。
* [抖音集团基于Flink的亿级RPS实时计算优化实践](https://mp.weixin.qq.com/s/G02-1yVXXnU-60JMqSosWQ)

flink 任务中的常见操作如 join、窗口操作、聚合操作等依赖内部 state，对于高流量任务往往在占据大量资源的同时，还会有作业不稳定，状态恢复难，难以回溯等问题。

paimon 提供的 partial-update 和 aggregation 引擎，可以将 flink 中的部分操作通过底层存储系统解决。

* join。在大宽表打宽的时候，可以通过 paimon 的 partial-update 实现
* lookup join。paimon 表作为维表使用。性能不及传统的 kv 存储（如 redis），但也很好使
* 聚合操作。通过 paimon 的 aggregation 实现

### 流批一体存储

1. 实时存储。流读，流写，changelog
   1. 支持流读，有多种 changelog-producer。
   2. 支持 time travel。可以根据 snapshot 读取不同时间的数据
      1. snapshot 一般不会保存很久，过期时间较短。如果需长期保存，需使用 tag 和 branch 功能
2. 离线存储。
   1. 离线存储如 hive 有分区概念，paimon 通过创建 tag 永久保留数据，通过可以将 paimon 的 tag 映射为 hive 的分区，参考：[Upsert To Partitioned](https://paimon.apache.org/docs/1.2/migration/upsert-to-partitioned/)。[tag 自动管理](https://paimon.apache.org/docs/1.2/maintenance/manage-tags/)
      1. `tag.automatic-creation`。自动创建策略，可选 `none`、`process-time`、`watermark`、`batch`
      2. `tag.creation-period` 和 `tag.creation-period-duration`，自动创建周期
      3. `tag.automatic-completion`
      4. `tag.default-time-retained` 和 `tag.num-retained-max`。分区保留策略
   2. paimon 中也有分区的概念，但是分区的概念并不完全契合 hive 的分区。在 hive 中计算是以全量 + 增量方式，包含了整张表的数据，hive 中的分区（如 `20241008` -> `20241009` -> `20241010` -> `20241011`）往往代表某个时刻的表的数据。paimon 中表示表不同时刻的状态是通过 `snapshot`，在 `2024-10-08 11:20:18` 时刻的 snapshot 是 paimon 表在那个时刻的全部数据，那个时刻的 paimon 表的分区只是 paimon 表中的部分数据，所有分区的数据加在一块才是完整地数据。paimon 中的 snapshot 在数据写入时随着提交自动创建，一段时间后自动过期，tag 是根据 snapshot 创建，可永久保留。因此 paimon 的 tag 在概念上才是和 hive 分区等同的存在。
      1. hive 分区。`20241008` 分区中包含 `20241007` 分区中的所有数据 + 20241008 日的增量数据。
      2. paimon 分区。如 paimon 表以行政省区作为分区，paimon 中的某个分区只是 paimon 表中的部分数据。
   3. paimon 支持读取 tag 的数据，以及不同 tag 之间的增量数据。
   4. 存储优化。离线计算如 hive 或 spark 是全量 + 增量计算方式，不同分区中的数据存在重复。paimon 的 tag 基于 snapshot 创建，数据按照 LSM 存储，只有顶层的数据（增量部分）不同，底层的数据（全量部分）是相同的，因此 paimon 数据存储上复用更高，存储更少。
   5. paimon 支持离线的 insert overwrite 操作
   6. branch。paimon 有 branch 概念

### 离线数仓加速

在传统的 Flink + Kafka 的实时方案中，代价巨大，难以作为一种通用方案将离线数仓转化为实时数仓，进行通用加速。

在离线数仓中通过跑批来进行数据分层和逻辑加工，要提高数据新鲜度，需调整跑批频率，将天级任务调整为小时级、分钟级来对数据加速，传统的离线数仓会出现调度资源、计算资源、存储资源同步激增，而任务不稳定等现象。

paimon 支持多种计算引擎：flink、spark、hive、trino、doris、starrocks，离线数仓可以在不变动计算引擎和调度的情况下将底层存储切换到 paimon 上（doris 和 starrocks 通过 external catalog 支持）。

ps。离线数仓根据现存架构可能存在对接 paimon 的 catalog 情况。

## 发版记录

* [发行](https://paimon.apache.org/releases/1.2.0)
* [官宣｜Apache Paimon 1.1 发布公告](https://mp.weixin.qq.com/s/wSs-U9O9ChRlNlD2w2NGAA)
* [官宣｜Apache Paimon 1.0 发布公告](https://mp.weixin.qq.com/s/xYXuX26p78c7el9iEr0DmA)
* [官宣｜Apache Paimon 0.9.0 发布公告](https://mp.weixin.qq.com/s/Uu0AHYEf-u5V_vdjdxBsRw)
* [官宣｜Apache Paimon 0.8.0 发布公告](https://mp.weixin.qq.com/s/iTCGIolOKXJYcR6O7oVXcQ)
* [官宣｜Apache Paimon 0.7.0 发布公告](https://mp.weixin.qq.com/s/wyfQZmV6XoxBWPD3bR9O0w)
* [官宣｜Apache Paimon 0.6.0 发布公告](https://mp.weixin.qq.com/s/pM1sBckNXLHesbRxOai4tw)
