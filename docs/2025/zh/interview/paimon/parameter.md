# 参数

## 实践经验

### CDC 同步



### partial update 

paimon 的 partial update 可以代替多流Join构建宽表，显著提升了链路的稳定性和开发效率。但是用好 partial update 还有一些细节需要关注。

#### 常见用法

通过 `union all` 合并多个流写入 paimon。

#### 无法更新为 NULL 值

当使用 `partial-update` 合并引擎时，默认的是“**按字段合并非 NULL 值**”，以订单宽表为例，需关联订单和商品表。如果商品表某个字段原先有值非 NULL，后来更新为 NULL，`partial-update` 不会将订单宽表中商品表的这个字段更新为 NULL，而是保留之前的值，从而导致错误。

解决思路是使用 `sequence-group` 机制控制多个流中的每个流的更新顺序，如`'fields.G.sequence-group'='A,B'`，由字段 `G` 控制是否更新字段 `A, B`；总得来说，`G` 的值如果为 null 或比更新值大将不更新 `A,B`。

 `sequence-group` 作用是：

1. 在多个数据流更新期间的无序问题。每个数据流都定义自己的序列组。
2. 真正的部分更新，而不仅仅是非空值的更新。
3. 接受删除记录来撤销部分列。

```sql
CREATE TABLE t (
    trace_id BIGINT,
    f1 STRING,
    f2 STRING,
    g_1 BIGINT,
    f3 STRING,
    f4 STRING,
    g_2 BIGINT,
    PRIMARY KEY (trace_id) NOT ENFORCED
) WITH (
    'merge-engine'='partial-update',
    'fields.g_1.sequence-group'='f1,f2', -- f1,f2字段根据 g_1 排序
    'fields.g_2.sequence-group'='f3,f4'  -- f3,f4字段根据 g_2 排序
);

insert  into t
select  trace_id,
        f1,
        f2,
        g_1,
        f3,
        f4,
        g_2,
        ...
from    (
            select  trace_id,
                    f1,
                    f2,
                    g_1,
                    cast(null as STRING) as f3,
                    cast(null as STRING) as f4,
                    cast(null as BIGINT) as g_2,
                    xxx
            from    table1
            union all
            select  trace_id,
                    cast(null as STRING) as f1,
                    cast(null as STRING) as f2,
                    cast(null as BIGINT) as g_1,
                    f3,
                    f4,
                    g_2,
                    xxx
            from    table2
            union all
            ......
        )
```

`sequence-group` 作用进一步说明。假设如下一张表，参数基本都是默认的：

```sql
CREATE TABLE partial_update01
(
    id   INT,
    age   INT,
    name   STRING,
    address STRING,
    PRIMARY KEY (id) NOT ENFORCED
) WITH (
    'merge-engine' = 'partial-update'
);

-- 插入数据，age 第一次插入为 30，第二次被更新为 20
insert into partial_update01 (id,age) values (1,30);
insert into partial_update01 (id,age,address) values (1,20,'China');
```

假设现在要求 age 只能越来越大，即不可以出现 30 -> 20 这种情况，这里就可以通过 `sequence-group` 设置 age：

```sql
CREATE TABLE partial_update02
(
    id   INT,
    age   INT,
    name   STRING,
    address STRING,
    PRIMARY KEY (id) NOT ENFORCED
) WITH (
    'merge-engine' = 'partial-update',
    'fields.age.sequence-group' = 'age'
);

-- 插入数据，age 第一次插入为 30，第二次不会 age 不会更新
insert into partial_update02 (id,age) values (1,30);
insert into partial_update02 (id,age,address) values (1,20,'China');
```

#### 删除数据

当使用 `partial-update` 合并引擎时，默认情况下 **无法处理删除记录**，因为该引擎的设计逻辑是“**按字段合并非 NULL 值**”，而删除操作需要移除整行数据。此时，系统会抛出错误或忽略删除操作，导致数据不一致。为解决此问题，Paimon 提供以下四种配置方案：

| 配置项                                                    | 核心行为                                                     | 适用场景                                                     |      | 副作用                                               |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---- | ---------------------------------------------------- |
| 'ignore-delete' = 'true'                                  | 完全忽略删除记录，仅处理插入（Insert）和更新（Update）操作   | 删除操作无意义（如日志追加场景），或下游自行处理删除逻辑。   |      | 删除记录被静默丢弃，可能导致数据冗余。               |
| 'partial-update.remove-record-on-delete' = 'true'         | 当收到删除记录时，直接删除整行（即使其他字段有非 NULL 值）   | 需要严格按主键删除整行的场景（如用户注销）                   |      | 可能意外删除其他字段的有效数据                       |
| 配置 sequence-group                                       | 通过字段组（sequence-group）定义删除操作仅撤回指定字段，而非整行 | 多源更新场景，删除操作仅针对特定字段组（如删除用户地址但保留其他信息） |      | 需显式定义字段组，删除操作不彻底（残留其他字段数据） |
| 'partial-update.remove-record-on-sequence-group' = 'true' | 当收到指定 sequence-group 的删除记录时，删除整行             | 关键字段组被删除时需移除整行（如订单核心信息删除后，整条订单失效） |      | 需结合 sequence-group 使用，配置复杂度较高           |

#### aggragation 函数

在 `partial-update` 的合并过程中也支持 aggragation 函数。

```sql
CREATE TABLE partial_update03
(
    id   INT,
    age   INT,
    name   STRING,
    address STRING,
    merge_num INT,
    PRIMARY KEY (id) NOT ENFORCED
) WITH (
    'merge-engine' = 'partial-update',
    'fields.age.sequence-group' = 'age',
    'fields.merge_num.aggregate-function' = 'sum' -- 设置 aggragation 函数，统计更新次数
);

-- 插入数据，每次插入的时候都带着 merge_num，merge_num 值为 1，这样就可以记录插入次数
insert into partial_update03 (id,age,merge_num) values (1,30,1);
insert into partial_update03 (id,age,address,merge_num) values (1,20,'China',1);
```

#### 级联 join或外键打宽

`partial-update` 要求目标宽表的主键和源表主键相同。

以订单宽表为例，离线加工中需做如下 join 操作，同时 flink 的多流 join 也是支持这个操作的：

```sql
select *
from ods.ods_order as t1
join ods.ods_item as t2 on t1.item_id = t2.item_id
join ods.ods_shop as t3 on t2.shop_id = t3.shop_id
;
```

业界的一个操作是通过 flink sql 做多流 join，只存储相关主键和关联键，后续在通过 paimon 的 partial update 进行打宽。

```sql
-- 通过 flink sql 进行多流 join，只保留主键的部分，状态开销就会节省很多, 性能也会提升，以较低代价产出一张多表的主键变更关系流
insert into dwd.dwd_order_pk
select t1.order_id, t2.item_id, t3.shop_id
from ods.ods_order as t1
join ods.ods_item as t2 on t1.item_id = t2.item_id
join ods.ods_shop as t3 on t2.shop_id = t3.shop_id
;

-- 下游流读这张 dwd.dwd_order_pk, 和原始的单表进行基于主键的维表关联, 来补齐其他表的字段形成大宽表
-- 这里其实走的都是 lookup join，性能依赖 lookup join 性能，lookup join 不够快这种方式也是不行的
select t1.order_id, t2.item_id, t3.shop_id
from dwd.dwd_order_pk as x
left join ods.ods_order as t1 on x.order_id = t1.order_id -- lookup join
left join ods.ods_item as t2 on x.item_id = t2.item_id    -- lookup join
left join ods.ods_shop as t3 on x.shop_id = t3.shop_id    -- lookup join
;

-- 上述方案会依赖 dwd.dwd_order_pk 的表的更新，如果 dwd.dwd_order_pk 表重置位点，回溯一定历史数据，则会触发所有依赖这种流表的任务更新
-- 可通过 sequence 能力，减少 dwd.dwd_order_pk changelog 的产生
insert into dwd.dwd_order_pk_sequence
select t1.order_id, t2.item_id, t3.shop_id, t1.gmt_modified_1, t1.gmt_modified_2, t1.gmt_modified_3
from ods.ods_order as t1
left join ods.ods_item as t2 on t1.item_id = t2.item_id
left join ods.ods_shop as t3 on t2.shop_id = t3.shop_id
;

CREATE TABLE dwd.dwd_order_pk_sequence (
  `order_id` varchar,
  `item_id` varchar,
  `shop_id` varchar,
  `gmt_modified_1` bigint,
  `gmt_modified_2` bigint,
  `gmt_modified_3` bigint,
   primary key (`pk1`, `pk2`, `pk3`) NOT ENFORCED
) with (
    'merge-engine' = 'partial-update',
    'fields.gmt_modified_1.sequence_group' = 'gmt_modified_1',
    'fields.gmt_modified_2.sequence_group' = 'gmt_modified_2',
    'fields.gmt_modified_3.sequence_group' = 'gmt_modified_3',
    'chaneglog-producer' = 'lookup'
)
;
```

也可以参考：[widetable](https://github.com/CNDPP/widetable)

### aggregate

针对ODS表主键不一致、无法通过一次Partial Update实现多流数据合并的场景，我们采用了Paimon的Aggregation合并引擎，并结合nested_update函数进行处理。

具体做法是：将三个主键分别为col1、(co1, col8)、(col1, col18) 的流表，通过Aggregation引擎聚合到以 col1 为主键的宽表。nested_update函数的作用类似于hive SQL中的collect_list()，能够将非 col1 作为主键的流表记录，按  col1 聚合为Array类型，统一宽表的主键粒度。此外，对于 col8 和 col18 的计数需求，由于Paimon Aggregation引擎表暂不支持count函数，我们通过sum+case when的方式实现等价计算，满足了业务对多维度数据聚合的需求。

### lookup join



通过Aggregation加工的宽表和维表进行Lookup Join丰富维度信息，nested_update函数聚合的字段通过unnest展开与维表Join，作用等价于常用的explode函数。

## 参数解读

### 1. bucket 管理

paimon 中 bucket 分为 3 种类型：

* 固定 bucket 表
* 动态 bucket 表
* 延迟 bucket。适用于一开始无法确定 bucket，待运行一段时间在设置 bucket 的方式

参数如下：

* `bucket`。
  * 大于 0。固定 bucket
  * -1。动态 bucket
  * -2。延迟 bucket
* `bucket-function.type`。分桶函数类型
  * **作用**：指定 Paimon 计算记录所属分桶的函数逻辑，定义数据分桶的核心算法。
  * **可选值**：目前仅支持 `DEFAULT`（默认值）。
  * **详细说明**：`DEFAULT` 分桶函数基于哈希算法实现：首先对 `bucket-key` 指定的字段（或主键/整行数据）计算哈希值，再通过哈希值与分桶数取模确定记录所属的分桶编号。例如，若分桶数为 4，哈希值为 5，则记录进入分桶 `5 % 4 = 1`。该逻辑确保数据均匀分布到各分桶（假设 `bucket-key` 选择合理），避免数据倾斜导致的并行处理瓶颈。需注意，分桶数一旦确定后通常不建议修改，因重新分桶需全量数据迁移，成本较高。
* `bucket-key`。数据分发策略
  * **作用**：指定数据分桶的依据字段，控制记录如何分配到不同分桶。
  * **配置规则**：
    * 支持单个字段或多个字段（逗号分隔，如 `dt,hour,user_id`）；
    * 若未显式指定，则按优先级自动选择：**主键字段 > 整行数据**（无主键时）。
  * **详细说明**：`bucket-key` 的选择直接影响数据分布与查询性能：
    * **按主键分桶**：若表有主键（如 `user_id`），默认以主键为 `bucket-key`，确保同一主键的记录始终落入同一分桶，避免更新操作跨分桶，提升点查与更新效率；
    * **按多字段分桶**：适用于需要联合分布的场景，如按 `dt`（日期）和 `hour`（小时）分桶，可让同一时间段的数据集中存储，优化时间范围查询；
    * **按整行分桶**：无主键且未指定 `bucket-key` 时，Paimon 会对整行数据序列化后计算哈希值，可能导致数据分布不均匀（若行数据差异较小），需谨慎使用。
    * **核心目标**：通过合理分桶实现数据均匀分布，避免“热点分桶”（某分桶数据量远超其他），同时提升查询时的并行扫描效率。
* dynamic-bucket.assigner-parallelism
  * **默认值**：未明确指定
  * **功能描述**：设置动态bucket模式下分配器操作符的并行度。该参数与初始化bucket的数量相关，如果设置过小，可能导致分配器处理速度不足，成为性能瓶颈。
  * **使用建议**：根据数据写入量和集群资源情况合理设置，通常应与写入任务的并行度相匹配。
* dynamic-bucket.initial-buckets
  * **默认值**：未明确指定
  * **功能描述**：设置动态bucket模式下分配器操作符中分区的初始bucket数量。这个值决定了系统开始处理数据时的初始分桶数量。
  * **使用建议**：根据预期的初始数据量设置，可以避免早期数据倾斜，但也不宜过大以免造成资源浪费。
* dynamic-bucket.max-buckets
  * **默认值**：-1（无限制）
  * **功能描述**：设置动态bucket模式下分区的最大bucket数量。可以设置为-1表示无限制，或者设置为大于0的固定值作为上限。
  * **使用建议**：在资源受限的环境中，建议设置合理的上限值以防止bucket数量无限增长；在资源充足且数据分布不确定的情况下，可以保持默认值-1。
* dynamic-bucket.target-row-num
  * **默认值**：2,000,000
  * **功能描述**：当bucket设置为-1时，对于主键表启用动态bucket模式，此选项控制单个bucket的目标行数。系统会根据此值自动调整bucket数量以维持每个桶的数据量接近目标值。
  * **使用建议**：根据数据特征和查询需求调整，较大的值可以减少文件数量但可能增加查询延迟，较小的值可以提高并行度但增加管理开销。

### 2. 分区管理

* dynamic-partition-overwrite
  * **默认值**：true
  * **功能描述**：控制在使用动态分区列覆盖分区表时是否仅覆盖动态分区。此参数仅在表具有分区键时生效。
  * **使用建议**：在大多数情况下保持默认值true，这样可以只覆盖实际涉及的分区，提高操作效率并减少不必要的数据重写。
* 

### 3. 快照管理

### 4. changelog

* `changelog-file.format`。变更日志文件格式
  * **作用**：指定 Changelog 文件的消息存储格式，影响读写性能、压缩效率及生态兼容性。
  * **可选值**：`parquet`（默认）、`avro`、`orc`。
  * **详细说明**：
    * **parquet**：列式存储格式，适合分析型场景（如批量读取 Changelog 进行统计）。优势为高压缩比、高效的列裁剪，但写入开销较大；
    * **avro**：行式存储格式，适合流式场景（如实时消费 Changelog）。优势为写入性能高、支持模式演进（字段变更），但压缩比低于列式格式；
    * **orc**：列式存储格式，与 parquet 类似，但对复杂类型（如 map、array）支持更优，且内置索引（如行组索引），可加速点查。
  * **选择建议**。avro 作为行式存储，适合写入，orc 或 parquet 作为列式，适合查询，写入性能不及 avro
    * 流式消费为主（如 Flink 实时读取）：选 `avro`，优化写入与实时性；
    * 批量分析为主（如 Spark 离线审计）：选 `parquet` 或 `orc`，优化读取与压缩。
* `changelog-file.prefix`。变更日志文件名前缀
  * **作用**：指定 Changelog 文件的命名前缀，便于文件管理与识别。
  * **默认值**：`"changelog-"`。
  * **详细说明**：
    * Paimon 生成的 Changelog 文件名格式为 `<prefix><sequence-id>.<format>`（如 `changelog-00001.parquet`）。通过自定义前缀，可区分不同表或不同业务的 Changelog 文件（如 `order_changelog-`、`user_changelog-`），避免文件系统中的命名冲突，同时方便运维人员快速定位文件。
* `changelog-file.stats-mode`。变更日志文件元数据统计模式
  * **作用**：控制 Changelog 文件写入时收集的元数据统计信息粒度，影响查询优化与文件管理效率。
  * **可选值**：`none`、`counts`、`truncate(16)`（默认）、`full`。
  * **详细说明**：
    * **none**：不收集任何统计信息，写入性能最高，但查询时无法利用统计信息优化（如跳过无效文件）；
    * **counts**：仅收集基础统计信息（如文件行数、最小值/最大值），适用于简单过滤场景（如 `dt > '2024-01-01'`）；
    * **truncate(16)**：收集截断后的统计信息（如字符串字段仅保留前 16 字符的统计），平衡统计精度与开销，是默认推荐值；
    * **full**：收集完整统计信息（如所有字段的精确最小值/最大值、null 值数量等），查询优化效果最佳，但写入开销最大（需额外计算与存储统计信息）。
  * **选择建议**：
    * 对查询性能要求高、写入压力不大的场景：选 `full`；
    * 写入吞吐敏感、统计信息要求不高的场景：选 `none` 或 `counts`；
    * 通用场景：默认 `truncate(16)`，兼顾性能与优化效果。
* `changelog-producer`。变更日志生产模式
  * **作用**：控制是否生成 Changelog 文件及生成方式，决定变更数据的来源与处理逻辑。
  * **可选值**：`none`、`input`、`full-compaction`、`lookup`。
  * **详细说明**：
    * **none**（默认）：不生成 Changelog 文件，表仅支持批量读写，适用于无流式变更需求的场景（如静态数据归档）；
    * **input**：从输入数据直接生成 Changelog。要求上游数据（如 Flink Source）自带变更标识（如 `+I`、`-U`、`+U`），Paimon 直接透传这些变更到 Changelog 文件，适用于 CDC 数据同步（如 MySQL Binlog -> Paimon）；
    * **full-compaction**：通过全量压缩（Full Compaction）生成 Changelog。在压缩过程中，Paimon 合并同一主键的多个变更版本，输出最终的 `+I`/`+U`/`-D` 变更，适用于写入密集型场景（如高频更新，通过定期压缩生成一致性的 Changelog）；
    * **lookup**：通过查找（Lookup）生成 Changelog。当写入一条更新记录时，Paimon 会查找旧值（基于主键），对比新旧值后生成 `-U`（旧值）和 `+U`（新值）变更，适用于对变更实时性要求高的场景（如实时数仓维表更新），但查找操作会增加写入延迟。
    * **核心区别**：`input` 依赖上游变更标识，`full-compaction` 依赖压缩触发，`lookup` 实时生成但开销较高。
* `changelog-producer.row-deduplicate`。变更记录去重开关
  * **作用**：控制是否为“相同记录”生成 `-U`、`+U` 变更对，避免重复变更导致的下游处理错误。
  * **默认值**：`false`。
  * **生效条件**：仅在 `changelog-producer` 为 `lookup` 或 `full-compaction` 时有效。
  * **详细说明**：“相同记录”指主键相同、但非主键字段可能不同的记录。当设置为 `true` 时：
    * 若新旧记录的所有字段（或忽略部分字段后）完全相同，则不生成 `-U`、`+U` 变更（避免无意义的重复更新）；
    * 若存在差异，则生成 `-U`（旧值）和 `+U`（新值）变更。
    * 例如，主键为 `user_id` 的记录，若更新前后仅 `update_time` 字段变化，且配置忽略 `update_time`，则视为相同记录，不生成变更。
  * **适用场景**：下游消费端对重复变更敏感（如精确一次计算），或需减少 Changelog 数据量时，可开启该参数。
* `changelog-producer.row-deduplicate-ignore-fields`。去重忽略字段
  * **作用**：在变更记录去重时，指定不参与比较的字段，避免因非关键字段（如更新时间、版本号）的频繁变化触发不必要的变更生成。
  * **配置规则**：字段名列表，逗号分隔（如 `update_time,version`）。
  * **生效条件**：仅在 `changelog-producer.row-deduplicate` 为 `true` 时有效。
  * **详细说明**：
    * 实际业务中，某些字段（如 `update_time`、`operator_id`）的更新不影响记录的“业务语义”，但会导致新旧记录被判定为“不同”。通过配置该参数，可忽略这些字段的比较，减少 `-U`、`+U` 变更的生成量，降低下游处理压力。
  * **示例**：表包含 `user_id`（主键）、`name`、`age`、`update_time`，配置 `changelog-producer.row-deduplicate-ignore-fields=update_time` 后，若更新仅改变 `update_time`，则不生成变更；若 `name` 或 `age` 变化，仍生成 `-U`、`+U`。
* `changelog.num-retained.min`。最小保留文件数量
  * **作用**：指定保留的已完成 Changelog 文件的最小数量，确保至少可追溯一定数量的变更历史。
  * **默认值**：无固定默认值（需手动配置），但要求 **≥1**。
  * **详细说明**：
    * 即使 Changelog 文件超过保留时间，只要文件数量未低于该值，就不会被清理。例如，设置 `min=5`，即使部分文件已超过 `time-retained`，也会至少保留 5 个最新的文件，避免因时间策略误删所有变更历史。
  * **适用场景**：需确保“至少可回溯 N 次变更”的业务（如故障恢复需分析最近 10 次变更），可设置 `min=10`。
* `changelog.num-retained.max`。最大保留文件数量
  * **作用**：指定保留的已完成 Changelog 文件的最大数量，限制存储占用。
  * **默认值**：无固定默认值（需手动配置），但要求 **≥ min 值**。
  * **详细说明**：
    * 当 Changelog 文件数量超过该值时，即使未超过保留时间，也会从最旧的文件开始清理，直至数量降至 `max` 以下。例如，设置 `max=100`，当文件数达到 101 时，会删除最旧的 1 个文件。
  * **核心作用**：防止因高频写入导致 Changelog 文件无限增长，控制存储成本。需结合 `min` 参数使用，避免清理过激（如 `max` 设置过小，可能导致文件数低于 `min`）。
* `changelog.time-retained`。保留时间
  * **作用**：指定已完成 Changelog 文件的最大保留时长，超过该时间的文件将被清理（除非受 `min` 参数限制）。
  * **配置格式**：时间长度+单位，如 `1h`（1小时）、`7d`（7天）、`30d`（30天）。
  * **详细说明**：
    * 保留时间从 Changelog 文件“完成”（即不再写入新数据）时开始计算。例如，设置 `time-retained=7d`，则 7 天前完成的文件会被标记为可清理（实际清理时机由后台任务触发，非实时）。
  * **协同逻辑**：清理策略同时满足“时间”和“数量”限制：文件需同时超过 `time-retained` 且当前数量 > `min` 时，才会被删除，直至数量 ≤ `max`。
  * **适用场景**：根据业务审计需求设置，如合规要求保留 30 天变更历史，则配置 `time-retained=30d`。
* 

### 5. compaction

### 6.consumer

* consumer-id
* **功能说明**：`consumer-id`是用于在存储中记录消费偏移量的消费者标识符。它实现了两个核心功能：
  * **安全消费**：在决定快照是否过期时，Paimon会检查所有消费者，如果有消费者仍依赖该快照，则该快照不会被过期删除。
  * **断点续传**：当之前的作业停止后，新启动的作业可以从之前的进度继续消费。
* consumer.expiration-time
  * **功能说明**：
    * 此参数定义了消费者文件的过期间隔。如果消费者文件最后修改后的生存时间超过此值，该消费者文件将过期。这有助于清理不再活跃的消费者记录，防止元数据无限增长。
* consumer.ignore-progress
  * **功能说明**：
    * 此参数决定是否忽略新启动作业的消费者进度。默认值为false。当您只想要"安全消费"功能，而在重启流消费作业时希望获得新的快照进度时，可以启用此选项。
* consumer.mode
  * **功能说明**：
    * 此参数指定表的消费者一致性模式，默认值为 `EXACTLY_ONCE`。默认情况下，快照的消费在检查点内严格对齐以实现"断点续传"功能的精确一次性。但在某些不需要严格"断点续传"的场景中，可以考虑启用 `at-least-once` 模式以提高性能。
* continuous.discovery-interval
  * **功能说明**：
    * 此参数定义了连续读取的发现间隔，默认值为 `10s`。它控制 Paimon 在连续模式下检查新数据的时间间隔，较短的间隔可以降低延迟，但会增加系统负载。
* 

### 7.增量读取

### 8.维表 lookup



## 参考链接

* [Apache Paimon核心配置参数详解（一）](https://mp.weixin.qq.com/s/BuTOstbyR-nRTkSKMTsExQ)
* [Apache Paimon核心配置参数详解（二）](https://mp.weixin.qq.com/s/Tmri8DwEmQh0Fnxez8hb-Q)
* [Apache Paimon核心配置参数详解（三）](https://mp.weixin.qq.com/s/Y6msP2fvUgIBuyRyNh_BPw)
* [Apache Paimon核心配置参数详解（四）](https://mp.weixin.qq.com/s/Vh9k0TZvxeba_89DipCiKA)
* [Apache Paimon核心配置参数详解（五）](https://mp.weixin.qq.com/s/sKQ19zq_TvfBQzd1pwsmJA)
* [Apache Paimon核心配置参数详解（六）](https://mp.weixin.qq.com/s/8HKDg36sLAqRSc63QTKjvg)
* [Apache Paimon核心配置参数详解（七）](https://mp.weixin.qq.com/s/QdF1JXR8nLgSXNhuN5F8vw)
* [Apache Paimon核心配置参数详解（八）](https://mp.weixin.qq.com/s/PwHoE2afc8rjp7U7wiSxzw)
* [Apache Paimon核心配置参数详解（九）](https://mp.weixin.qq.com/s/Q0NzfclNH2Pxnc7k8zF0KA)
* [Apache Paimon核心配置参数详解（十）](https://mp.weixin.qq.com/s/4EcfCLmzTrXNkc-GDp7ZSA)
* [Apache Paimon核心配置参数详解（十一）](https://mp.weixin.qq.com/s/oXVUT8P6f4VFnPYmT5bRHg)
