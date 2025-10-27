# 概览

* [Doris 也太懒了吧...](https://mp.weixin.qq.com/s/uI9VxpcYdJwArAl_vhTb0g)

## 面试题

### doris 和 clickhouse 对比？

* 场景支持
  * doris 一站式解决多场景需求
    * 同时支持实时和离线数据应用。支持多种方式导入数据
      * 实时。stream load/routine load
      * 离线。broker load/spark load
    * 即席查询（ad-hoc 查询）。
    * 多表关联。复杂 join 查询
    * 湖仓一体，多源联邦查询
    * 可满足多种场景：实时数仓、离线数仓、ad-hoc 查询、报表看板、用户画像、日志与事件分析
  * clickhouse 侧重单表高性能分析
    * 单表大规模聚合、时序数据查询
    * 缺点。多表 join 性能弱，事务支持不足，批量导入复杂
* 架构设计
  * doris。fe + be 分层，组件少，运维简单
    * 运维工具多。doris-manager，doris-kubernetes-operator
    * 弹性扩展。支持节点动态增删、无数据迁移成本
  * clickhouse。去中心化架构，运维复杂
    * 元数据依赖外部组件（zookeeper）
    * 副本同步依赖表引擎配置，跨节点一致性难保证
    * 扩展需手动调整分片，运维成本高
* 功能特性
  * 数据导入
    * doris 支持 stream/routine/broker/spark，支持断点续传，事务回滚。还有 X2Doris 可视化同步数据至 doris
    * clickhouse 依赖外部工具，原生导入工具少，无事务保障
  * 事务与一致性
    * doris 支持 acid 事务，两阶段提交（2pc）确保分布式一致性
    * clickhouse 无完整事务，并发写入易出现数据不一致
  * 数据模型
    * doris 支持 3 种数据模型：Duplicate/Aggregate/Unique，支持动态 schema 变更
    * clickhouse 以 MergeTree 为主，模型单一，schema 变更成本高
  * 湖仓一体
    * doris 支持 hudi/iceberg/paimon，支持物化视图加速数据湖查询
    * clickhouse 需自定义开发
* 性能表现
  * 复杂查询，多表 join 性能高
    * doris。mpp 架构+智能优化器（RBO+CBO+HBO）
    * clickhouse。单表查询快，但多表 join 依赖 hash join，大表关联易 OOM
  * 写入性能。高吞吐+低延迟均衡
    * doris。客户端直连 BE + 异步刷盘，支持每秒数万条写入，延迟秒级
    * clickhouse。写入性能强劲，但并发写入易引发Merge风暴，导致查询卡顿
  * 稳定性
    * doris。Compaction 后台异步执行，不阻塞读写，支持自动故障转移
    * clickhouse。Merge 操作占用大量资源，易导致集群不稳定，节点故障恢复复杂
* 运维与生态
  * 部署。一键部署工具（Doris Manager），可视化运维
    * 监控。内置完善监控指标，对接 Prometheus/Grafana
    * 升级。支持滚动升级，无停机风险
  * 社区生态
    * doris。apache 社区，社区活跃
    * clickhouse。社区活跃，