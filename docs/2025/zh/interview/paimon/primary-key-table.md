# 主键表

## Bucket

bucket 是 paimon 存储的最小单位，每个 bucket 由一个 LSM 树和 changelog 文件组成。

数据写入哪个 bucket 由 record 中的列决定。用户可以通过 `bucket-key` 配置列，如果没有配置，会优先选择 primary key。没有 primary key 会使用整个 record。

bucket 数量决定任务处理的并行度，bucket 数量不宜过大，会造成每个 bucket 内数据量很少导致很多小文件存在。应使 bucket 内数据量在 200MB - 1GB。

在表创建之后，可以通过缩放 bucket 调整。

固定 bucket 表和动态 bucket 表

当表的 bucket 配置大于 0 时为固定 bucket 表。缩放 bucket 只能通过离线操作完成。

数据通过 `Math.abs(key_hashcode % numBuckets)` 决定进入哪个 bucket

主键表默认为动态 bucket 表，也可以通过设置 `'bucket' = '-1'` 明确指定。

paimon 根据如下选项来调整 bucket 数量：

- Option1: `'dynamic-bucket.target-row-num'`: controls the target row number for one bucket.
- Option2: `'dynamic-bucket.initial-buckets'`: controls the number of initialized bucket.
- Option3: `'dynamic-bucket.max-buckets'`: controls the number of max buckets.

按照数据到来顺序决定进入哪个 bucket，任务会维护一个 primary-key 和 bucket 的索引，确保相同 primary-key 的数据进入同一个 bucket。

动态 bucket 表只可以有一个写入任务。因为决定 primary-key 进入哪个 bucket 是随机的，不确定的。多个任务同时写入会导致 相同 primary-key 进入不同 bucket。

