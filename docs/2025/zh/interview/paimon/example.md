# 案例

## 存储趋势

### 存算分离

存算分离是一个近些年常见的名词，与存算分离相对的是存算一体。存算一体对应 `Shared Nothing`，节点资源完全独立，每个节点拥有独立的计算与存储资源（CPU、内存、磁盘），节点之间完全不共享任何资源。

存算一体：

* 优点
  * 本地磁盘存储速度更快，本地读写减少网络开销
  * 部署简单，单机即可运行
* 缺点
  * 扩展不灵活。存储与计算同步扩容，扩容时容易出现数据 rebalance 等行为，有些甚至需要停机扩展。
  * 成本高昂。本地  SSD 盘价格高，且需要将数据多副本存储进一步增加硬件投入
* 场景
  * 极简运维，无专职 DBA 或运维
  * 无云环境，本地化部署
  * 中小规模
* 常见产品
  * MySQL
  * Redis
  * RocketMQ

存算分离。存算分离将数据库拆解为独立的三层，将节点分为存储层（对象存储、HDFS）与计算层（云服务器、容器），二者独立扩展，通过高速网络实现数据共享：

* 存储层。远端存储，保障数据一致性、可靠性
* 计算层。无状态结算节点，查询解析、优化、事务处理等。任一计算节点收到请求都可以通过网络访问存储层处理请求。
* 元数据层。因为数据存储在远端存储中，不在本地。结算节点需要通过元数据获取到数据在存储层的具体分布，在通过网络访问数据。

* 优点
  * 弹性伸缩。存储和计算资源可独立按需扩缩容，同时提升扩缩容效率
  * 降低成本。共享存储（如对象存储）成本比本地盘价格更低，且支持冷热数据分层管理
  * 高可用性。存储层独立容灾，计算节点故障无数据丢失风险
* 缺点
  * 网络限制。远程读写有网络延迟，性能优化依赖数据缓存。参考：[基于Netty的自研流系统缓存实现挑战: 内存碎片与OOM困境](https://mp.weixin.qq.com/s?__biz=MzkxNzY0ODE2Ng==&mid=2247485616&idx=1&sn=e3e62e2d28f9cf833af0852e9fffe4a1&chksm=c1bc2ef9f6cba7ef411730ad9f8c37095fffc8a3ca0abda442889612902aa2cfc6ac40e740ba&mpshare=1&scene=1&srcid=0709JtAzTWEk5pWwGKrgKeA0&sharer_shareinfo=f7d2b2cfb6c8e1a6c08b86a7bf528145&sharer_shareinfo_first=981a1004fb447ff357fb3ab0bff44c16&version=4.1.10.99312&platform=mac&nwr_flag=1#wechat_redirect)
* 场景
  * 海量数据
  * 成本敏感。历史数据归档、冷数据低成本存储
  * 弹性需求。极速扩容应对流量高峰
  * 云原生。云环境 Serverless，需按需付费，根据负载动态扩缩容
* 常见产品
  * Pulsar。云原生的消息队列，存储节点为 bookeeper
  * Oceanbase。同时支持存算一体和存算分离部署模式，灵活应对各种场景
  * CockroachDB
  * Doris/StarRocks。同时支持存算一体和存算分离部署模式

分层存储。将数据分为冷热数据，热数据存储在本地，冷数据存储到远端存储或低速存储。完全存算分离代价巨大，作为一种存储优化方案，通过将历史数据归档、冷数据存储到底成本存储节约成本。是介于存算一体和存算分离之间的一种形式，因为分层存储是存算一体模式下的一种可选配置，其实仍属于存算一体

常见存储：

* ElasticSearch
* MongoDB
* Kafka

### 共享数据

在存算分离模式下，存储层是共享的，可以供多个计算节点同时访问。但是对于不同的数据库系统，同样一条数据可以存储到 MySQL 中，也可以存储到 MongoDB、ElasticSearch 或者 Hive、Doris 等，那么 MySQL 是否可以识别 MongoDB、ElasticSearch 等存储在磁盘上的数据呢？其次同样是关系型数据库，MySQL 和 PostgreSQL 是否可以识别彼此的数据？

* MySQL vs ElasticSearch vs MongoDB vs Redis vs RocketMQ vs Hive vs Doris？
* MySQL vs PostgreSQL vs SQL Server vs Oracle？
* MySQL A 实例 vs B 实例？

这就是从任何节点都可以访问的共享存储到共享数据的演变，不同的应用不仅可以访问同一个存储，还可以识别存储上的数据。

共享数据的解决方式：

* ETL。通过 ETL 管道将数据从 A 数据库转移到 B 数据库
* 异构数据联邦查询。Presto/Trino 查询时将数据分别从 MySQL 和 Kafka 中读取出来，在 Presto/Trino 内存中进行数据计算，并可将计算结果写到 ElasticSearch。
* 数据湖。利用云存储服务 + 开放文件格式 + 开放表格式，在分布式文件系统/对象存储建立基于文件的标准存储格式，存储海量数据
  * 高可用性
  * 高持久性
  * 低成本
  * 易于扩展
  * 结构化、半结构化和非结构化数据
  * 支持人工智能/机器学习工作负载

数据湖架构：

* 云存储。使用云服务对象存储或 HDFS 等分布式文件系统。解决数据存在哪？
* 开放文件格式。包含 JSON、CSV、Avro、Parquet、ORC 等文件格式。解决数据怎么存？
  * Hive 按照文件目录组织数据，分区目录下文件格式一致，文件内数据字段一致，Hive 分区下的数据不支持修改和删除，只支持全部覆盖
* 开放表格式。包含 Iceberg、Hudi、Delta Lake、Paimon 等。提供 ACID 事务，数据修改和删除，高性能，细粒度访问控制等高级功能

## 开放表格式

开放表格式是从功能上来说，开放表格式定义了一套规范，规定了数据文件在远端存储如何组织，文件内数据采取怎样的格式，并提供了不同开发语言的 SDK 实现。

从使用上来说，开放表格式提供了一种选择，可以将不同的数据（结构化数据、半结构化数据、非结构化数据）存储到一起，将一个组织的数据集中存储和管理，形成专门的数据存储，我们将之称为数据湖表格式，一般简称为数据湖。

基于共享存储的数据湖带来了技术和产品上新的想象力：

* 海量存储。对象存储提供了高吞吐、低成本、高可用、无限扩展的存储能力
* 弹性扩缩容、灾难恢复。对象存储本身具有多副本、高可用的持久化能力，数据本身不会因为集群故障丢失，结合元数据机制，可以任意拉起新的无状态计算节点。
* 跨地域容灾。对象存储提供地域间的准实时复制，可以很容易 0 编码实现跨地域容灾的解决方案
* 只读副本。写少读多是一类重要的业务场景，一份数据可能存在数十个下游消费者，基于对象存储，无需数据复制就可以在对象存储上读取数据，提高极具扩展性的高扇出能力
* Zero ETL。对象存储上的开放表格式数据，无需经过 ETL 不同的分析软件或计算引擎就可以识别、读取数据。

数据湖表格式想要在使用共享存储（分布式文件系统/对象存储），构建共享的数据库表，需要达到如下要求：

* 事务能力。
* 高性能。是否存在一种方法，可以将数据存储在对象存储中，同时还能保持像在本地硬盘上一样的高性能？
* 格式演化（schema evolution）。可修改表配置和表字段

同时数据湖表格式主要应用于数据分析、机器学习、模型训练等场景，还需支持时间旅行（time travel，可以轻易查询某个时刻表得状态，查询那个时刻表的快照，实现数据可回溯）。

### 表格式定义

数据湖表格式定义一套“表”的格式，它通过定义“表的”元数据文件和“表”数据的数据文件，将分散的文件组织成一个逻辑上的“表”，并提供事务、版本控制、模式演化等高级功能。它们为数据共享提供了标准化的格式。

表格式分为 3 层：

* 共享存储。支持各种文件系统和对象存储，无厂商和技术锁定。
  * 文件格式。不像 mysql/es/redis/mongo/kafka 等设计自己的数据存储格式，它采用开放的数据格式如 Parquet、ORC、Avro、JSON、CSV
* 多语言 SDK 实现。如 Java、Python、Rust
* 元数据层。文件系统、Hive、JDBC、REST 等形式

目前有多种数据湖表格式实现：

* Iceberg。Netflix 开源。抽象好，设计优雅，扩展性强，底子好，在国外风声水起，最流行。
* Hudi。Uber 开源，在国内最先流行开。
* Delta Lake。Databricks 开源，与 Spark 集成过深，其他计算引擎难以替换 Spark。经历过一段时间的半开源，市面上受众较少。
* Paimon。Flink 社区。鉴于 Iceberg、Hudi 和 Delta Lake 一开始定位都是在离线场景，面向 Spark，架构上适配流处理场景困难，Flink 社区孵化了专为流处理场景的实时数据湖。

### 事务管理

数据湖以文件的形式将文件存在文件系统或对象存储上，满足了海量、廉价存储各种类型的数据，但仅仅“一堆文件”只会形成数据沼泽。数据湖需要在文件系统或对象存储的文件之上，引入一个**事务性的元数据层**：

* 实现。元数据层通过一个事务日志（Transaction Log）来精确地跟踪“哪个版本的表是由哪些数据文件组成的”。所有的 DML 操作（INSERT, UPDATE, DELETE, MERGE）都通过向日志中追加一条新的原子提交来完成。
* 收益
  * ACID 事务。解决数据湖不可靠的问题
  * 数据版本控制（时间旅行）。由于所有历史版本都记录在日志中，用户可以轻松查询任意时间点的表状态，这对于审计、错误回滚和保证可复现的机器学习实验至关重要
  * 模式强制与演进 (Schema Enforcement & Evolution)。可以强制写入的数据符合表的预定义结构，防止脏数据污染数据湖；同时也支持表结构的平滑变更

实现。以 Paimon 为例，Paimon 的元数据支持多种实现，如 FileSystem、Jdbc、REST。

Paimon 每次提交数据都会生成一个 Snapshot，Snapshot id 唯一，因此一旦 Snapshot 成功写入文件系统等即可认为提交成功。

Paimon 约定 Snapshot id 递增如从 `S1 -> S2 -> S3 -> S4 ......`，客户端在生成 Snapshot 时根据历史 Snapshot 确定要生成的 Snapshot id，提交时采用文件系统的 rename 操作保证原子性。像 HDFS 保证 rename 操作的事务性和原子性，但是类似 S3 和 OSS 等对象存储，rename 操作不具有原子性，需依赖外部 metastore 系统如 Hive 或 JDBC，利用 metastore 的 lock 功能进行 rename 操作。

* rename 操作是提交 Snapshot 操作。客户端会源源不断地将数据持续性写入文件系统，只是文件名不是 Snapshot id，当要提交这一批数据时才会将 Snapshot rename 为下一个 Snapshot id。如果 rename 失败或者没有到提交时客户端就挂掉了，文件系统上就多出一批脏文件。脏文件不会污染数据，因为只有 Snapshot 的数据才被认为是有效的，脏文件也不会一直留在文件系统上，Paimon 会定期清除
* 冲突。只有多个客户端同时发起提交时才会产生冲突。冲突的解决方式有 2 种：一种是保证只有一个客户端在执行提交操作，另一种是提交失败时通过重试继续获取下一个 Snapshot id 再次提交。在大数据中一般一张表的只有一个任务写入，不会搞多个任务同时写入

### 高性能

对象存储并不擅长高 IOPS 的场景，同时它会为每一次 IO 进行计费，且不同的 API 具有不同的收费方式，如 PUT/DELETE 收费比 GET 贵。

以云存储作为底层存储会遇到两个问题：

* 写入/读取数据速度慢于本地磁盘
* 过多的写入/读取操作会产生大量的费用

写入。

* 高压缩比。通过采用列式存储格式如 Parquet 和 ORC，比行存储具有更高的压缩比。同样的数据采用列式存储占据存储更少。

读取：

* 数据裁剪。通过元数据，在查询 Plan 阶段确定要加载的数据文件，在存储层过滤数据（又称“谓词下推”）而不是大批量加载数据到计算层，在计算层过滤数据。列式存储格式将数据按列存储，查询时对于不需要加载的列可直接过滤。
* 缓存

在云存储作为共享存储想要达到高性能非常依赖列式存储格式，而列式存储格式是一种专为 OLAP 分析型负载设计的存储格式，对于 OLTP 事务型负载表现很差。

#### 数据湖表格式 vs MySQL

索引的核心作用是通过减少执行查询所需的 I/O 操作来加速查询。

##### 关系型数据库索引

在传统的关系数据库管理系统中，我们可以将索引大致分为两类：

- 聚簇索引。也叫主键索引，索引和数据存储在一起，表本身就是一个聚簇索引。
- 非聚簇索引。也叫二级索引，索引不存储数据，而是存储数据的 PK，通过索引查询到的 PK 还需要再次通过 PK 查询到完整数据。

![pk_b+](./images/pk_b+.webp)

如果通过主键查询表，数据库引擎可以执行 B 树遍历，快速找到所需行的位置。

在 OLTP 工作负载中，查询绝大多数都是快速查找或更新单行或极少量行。按主键排序的 B+ 树使得这一切成为可能：无论表的大小如何，查找的成本都仅为 `O(log n)`，并且一旦到达叶子页，目标行就在那里。这意味着无论表有 1000 行还是 1 亿行，对 `UserId = 18764389` 进行聚集索引查找只需读取少量页面。

![second_index](./images/second_index.webp)

如果仅是根据 PK 查询，聚簇索引完全可以满足，如果要支持其他字段查询就需要通过全表扫描（扫描聚簇索引）才能找到所有符合条件的数据。为了处理不使用主键的查询，需增加二级索引，二级索引是独立的 B+ 树，索引中的数据为 PK，当通过二级索引定位到数据时需要通过 PK 反查聚簇索引获取到数据。如果二级索引返回的数据量很多，执行全表扫描可能会更快。在二级索引中也可以通过`覆盖索引`减少反查聚簇索引。

同时关系数据库还会存储表的`统计信息`如行数、索引大小、基数（不同值的数量，如 sex 的基数只有 3：男、女、未知，userId 的基数非常高），查询优化器可以通过表的统计信息决定如何是否采用二级索引执行查询以达到更高的查询性能。通过基数信息，查询优化器可以知道字段的选择性高低，或者基数分布不均匀，部分值行数很多，部分值行数很少，查询优化器可能会跳过二级索引直接进行全表扫描。

##### 数据湖表格式索引

数据湖表格式往往搭配云存储，为 OLAP 分析型负载服务，数据湖表格式采用列式存储系统：它将数据存储在**列中而非行中**，并将数据分组为大的连续块，列式存储可以在查询 plan 阶段由执行引擎决定需要扫描哪些文件，跳过整列，或跳过整个文件，尤其适合OLAP分析场景。注意列式存储系统只是数据湖表格式支持的开放文件格式中的一种，是可选的，数据湖表格式+列式存储可以到达一种卓越的性能体验，但数据湖表格式+行式存储也是可行的，只不过速度很慢，缺乏优势。

* 数据布局。**有效的数据裁剪关键在于使数据局部性与查询保持一致**。如果查询 _Country = 'Spain'_  的行，但 _Spain_ 数据分散在所有文件中，那么查询就必须扫描每个文件。但如果将所有 _Spain_ 数据集中到一个较小的子集中，那么查询只需读取该子集，从而加快速度。
* 索引。二级索引
  * bloomfilter 索引
  * bitmap 索引
* 统计信息

###### 数据布局

* 分区。它决定了数据文件的组织方式，根据一个或多个列（例如日期（或月/年）、地区等）将表划分为逻辑分区。所有共享相同分区键值的行都会写入同一目录或文件组。这创建了数据局部性，使得当查询包含分区列的筛选条件（例如，*WHERE EventDate = '2025-10-01'*）时，引擎可以准确识别哪些分区包含相关数据并忽略其余分区。此过程称为**分区修剪**，它允许引擎完全跳过对数据集大部分内容的扫描。分区与典型查询筛选条件越匹配，修剪效果就越好
* 排序。对分区内的数据进行排序，以便逻辑上接近的值在同一个文件中，物理文件上也接近存储在一起。常用的排序方式为 z-order，这是一种多维聚类技术。z-order 并非按单列排序，而是将多个列值（例如，国家/地区、国籍和事件日期）的位交错组合成一个复合键，从而保留空间局部性。这意味着，即使没有对任何单列进行全局排序，具有相似列值组合的行也更有可能在文件中彼此靠近存储。z-order 对于同时对多个维度进行筛选的查询尤其有效。类似的还有 hilbert sort

###### 索引

BloomFilter 索引是基于 BloomFilter 的一种跳数索引，原理是利用 BloomFilter 跳过等值查询指定条件不满足的数据块，达到减少 I/O、加速查询的目的。通常应用在一些需要快速判断某个元素是否属于集合，但并不严格要求 100%正确的场合。

Bitmap 索引的基本原理是将数据中的每个值映射到一个位图中，每个位表示一个数据项的状态（例如，是否存在）。通过位图的每一位，可以快速判断某个值是否存在，从而大大提高了查询效率。

###### 统计信息

在 OLAP 系统中，最常见的索引为 min-max 索引，min-max 索引又称为 Zone Map 索引，是一种轻量级的**统计信息**索引。元数据会记录每个数据文件中的**每一列**在该文件内的**最小值**和**最大值**、NULL 值分布信息。min-max 索引的核心思想是利用数据的局部性原理：如果一个查询的过滤条件无法匹配某个数据块内某列的值范围，那么这个数据块就可以被安全地跳过，无需读取和解压其中的数据。

## Paimon 介绍

Apache Paimon 是一款新兴的数据湖存储系统，其核心特点包括统一的批流处理、数据湖功能、丰富的合并引擎等。

该项目的本意是想提供一个 Flink 完全内置的存储，解决实时、近实时、Queue、Table Format 的所有问题，结合 Flink + 这个内置存储，提供 Materialized View 的自动流处理，直接提供查询服务，打造一个完整的 Streaming DB。好事多磨，经过长达近2年的打磨，最终形成了湖 + LSM的方案。

* 统一存储
  * 消息队列。支持 changelog 生成，可以从任何数据源生成正确且完整的 changelog，替代 Kafka
  * 离线数仓。支持分区，时间旅行
  * 维表。提供高性能的点查能力，取代 Redis/Hbase
* 批流一体
  * 数据同时支持流模式与批模式下大规模读写数据。写入一次可同时供实时、离线使用，无需维护两套链路
  * 流式实时写入的数据可加速离线数据新鲜度，将数据链路从 T + 1 加速到分钟级
* 多计算引擎。支持 Flink、Spark、Hive、Doris、StarRocks
* 多种存储支持。即支持 HDFS 也支持对象存储
* 丰富的合并引擎。
  * Deduplicate
  * Partial Update
  * Aggregation
  * First Row
* 丰富的管理能力。支持 tag、branch
* 数据湖能力。
  * 低成本、高可靠性、可扩展的元数据。Apache Paimon 具有作为数据湖存储的所有优势
  * 支持完整的模式演化

价值详解：

* 实时数仓。离线处理的最大问题就是数据新鲜度，T + 1 的数据更新能力在很多场景无法满足业务需求，基于 Flink + Kafka 的实时处理代价巨大不具有通用性，无法将离线处理完整迁移到 Flink + Kafka。Paimon 另辟蹊径，数据即支持流处理又支持批处理，将 T + 1 的离线数仓完整迁移到 Paimon，将数据的新鲜度从 T + 1 加速到分钟级
* 统一存储。在数仓中组件众多，往往对不同场景采用不同存储，如实时采用消息队列如 Kafka、离线使用 Hive、维表数据又使用 Redis/Hbase，业务查询又使用 OLAP，Paimon 同时满足上述场景。
* 实时痛点。Paimon 孵化自 Flink 社区，Flink 作为流处理的事实标准，Flink 本身作为计算引擎，依靠本身状态实现实时数据处理。但 Flink 定位在计算层，面对海量数据、复杂计算场景，在本地状态中存储了大量数据，单 Flink 任务占据资源上万 CU，本地状态体积超过 TB 级。
  * 多流 JOIN，实时宽表打宽
  * 长周期指标聚合。实时聚合近 7 天、30 天、90 天用户行为，需缓存用户长期

### Paimon 表类型

分为 3 类表：

* 主键表。存在主键，支持增删改查
* 日志表。无主键，只能插入
  * append queue 表。配合`'bucket' = '8'` 和  `'bucket-key' = 'userId'` 等同于 kafka。
  * append scalable 表。配合 `'bucket' = '-1'`。

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

### Paimon 常见应用

实时数仓：

* Changelog Producer。任何数据源产生的数据写入 Paimon 表都可以生成 changelog，供下游流式消费数据变更
* 流式 Upsert。在数据实时架构中，经常遇到数据需频繁更新和合并的场景，比如 CDC 技术接入的在线数据库的增量更新，流计算过程中产生的 changlog 数据，而 Hive 是不支持更新，只能覆盖整个分区。在 Paimon 以前，需存储原始的 changelog 数据，用户自己合并合并 changelog 数据，获取最新的数据。如数据 A 产生了 3 条 binlog：insert、update、update，最终的数据就是最后一次的 update 对应的数据，合并过程就是按照 changelog 数据的主键和时间进行聚合，取最新的一条的过程。一般合并操作有 2 种：实时对 changelog 表做 view，view 中对数据做合并，可实时查询最新的数据，离线批量合并。Paimon 采用 LSM（Log-Structured Merge-Tree）存储架构，数据在做 INSERT、UPDATE、DELETE 时可通过 LSM 的分层顺序合并实现，支持数据需频繁更新和合并的场景。
* 多流 JOIN，实时宽表打宽。在引入 Paimon 之前作业通常使用典型的双流 Join 方案。作业会消费两条事件流，进行过滤和转换操作，然后进行双流 Join。由于数据量较大，状态可能轻松达到 TB 级别。为了减少 Flink 作业的状态，通常会将更长周期的数据存放在 HBase 或 Pegasus 等外部 KV 系统中，而在 Flink 作业中只保存最近几个小时的数据状态。这样做带来了两个问题。首先，状态过大导致作业不稳定；其次，需要使用额外的 KV 系统，增加了开发和运维成本，并且 KV 系统的管理并不方便。分析这些问题的根本原因，可以发现双流 Join 的效率非常低。由于双流数据量过大，Flink 状态数据大部分都缓存在本地磁盘中，Join 时如果内存中的数据缓存被击穿，就需要进行磁盘的随机读。由于整体数据流量很大，磁盘随机读的频次非常高。此外，当需要查找更长周期的数据时，必须访问外部的 KV 系统，这不仅带来了网络开销，还导致数据冗余。Paimon 支持一种名为 Partial-Update 的 Merge 引擎。这个功能能够对相同主键的多条记录进行合并，取每个列的最后一个非空值。然而，这种 Merge 操作并不是在 Flink 的计算任务中完成的，而是在 Paimon 表的 Compaction 任务中进行的。由于 Paimon 的存储采用 LSM（Log-Structured Merge-Tree）分层有序的数据结构，在进行 Compaction 时，能够轻松地将不同层的相同记录合并。
* 长周期指标实时聚合。
* lookup join。统一存储，不在使用 redis/hbase



实时链路。流读流写，中间数据可查

全流程加速 + Doris + Flink

每日 T + 1 抽取 -> 数据实时入仓

### Paimon 遇到的问题

局限性

延迟。依赖 checkpoint 设置

速度。底层依然是对象存储，需要加载数据，查询





AutoMQ 的 Table Topic 和 S3 Tables：

* AWS S3 Tables 时一种在 S3 种托管的 Apache Iceberg 表，旨在让结构化数据存储和分析更加简单高效。数据在文件中以行和列的形式组织，类似于传统数据库中的表。
  * 提升查询性能，S3 Tables 对查询性能进行优化，相比通用 S3 存储和 Iceberg 表，查询性能提高 3 倍，每秒事务数提升 10 倍
  * 自动进行表维护、文件压缩和快照管理，持续优化查询效率、降低存储成本。
  * 无缝对接 AWS 分析服务。支持 Iceberg 标准，与 Athena、Redshift、EMR 等分析服务无缝对接
* Table Topic。在大数据中 Kafka 是流数据存储的事实标准，AutoMQ 推出 Table Topic 将 Kafka 中的流数据高效写入 Iceberg 表，实现流数据和静态数据的无缝对接。AutoMQ Table Topic 与 AWS S3 Tables 实现了无缝集成。
  * 实时数据。数据通过 Kafka 实时写入，其他应用可以消费 Kafka 数据实时处理
  * 数据持久化。数据转换为表格式并存储在对象存储中，实现数据的廉价、高效持久化
  * 数据分析。存储在对象存储中的数据可以通过 Hive、Spark、Clickhouse、Presto 等数据分析工具进行查询和分析，实现 Zero ETL 访问

 

另一方面，流式数据入湖，现代化数据栈完成了最后一块拼图，流湖一体的架构有了落地的基础，这也是 Confluent 推出的 TableFlow[2] 带来的巨大想象力。数据以流的形式产生和存储，符合真实世界中信息不断生成和变化的特征，实时生成的数据一定要以流的形式存在，从而流计算框架有机会挖掘更多实时的价值。当一段时间后数据失去新鲜度后，再转换为 Iceberg[3] 等表的形态进行存储，做进一步大规模的数据分析。从数据的生命周期来看，从流到表，是非常符合数据从高频变低频，从热变冷的自然特征，在对象存储之上构建流表一体的数据技术栈是未来的趋势。



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