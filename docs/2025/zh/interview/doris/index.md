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
* clickhouse。去中心化架构，运维复杂
* xxx