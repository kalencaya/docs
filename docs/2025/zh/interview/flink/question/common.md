# 通用

## 1.flink 慢要怎么处理？

* 及时发现。如何及时发现 flink 慢
  * source 延迟。如消费 kafka topic，可以从 kafka 收到告警消费延迟，或者 flink 任务自己有监控 source 延迟
  * 反压。某个算子出现反压情况
* 问题原因
  * source 端。检查上游数据源和 source 并行度。
    * 如读取 kafka topic 时，需确保 topic partition 设置合理，因为 flink source 最大并行度即为 kafka partition 数目，kafka topic partition 过小，并行度上不来消费慢。随着业务流量增长，kafka topic partition 数量也需及时调整。
    * 检查 source 并行度，查看是否并行度过小，消费不过来。
    * 检测 source 数据源集群情况，CPU、网络、磁盘IO 等，是否能支持消费
  * sink 端。检测下游数据源、sink 并行度和 sink 配置
    * 检测下游数据源集群情况，如 mysql，查看 CPU、网络、磁盘IO 是否。
    * 检测 sink 端并行度，查看是否并行度过小，消费不过来。
    * 检测 sink 端配置参数。如 jdbc 配置，每满 1000 条或到达 10s 批量执行一次。
  * 中间端。
    * 维表 join。是否维表关联慢，使用 redis 或 guava 缓存优化维表关联，或启用
    * 多流 join。
    * redis 慢。为了确保 flink 任务重启后一些数据不丢，将一些数据存储到了 redis 中，在流量比较大的时候，redis 的访问成为性能瓶颈
    * checkpoint 慢。checkpoint 耗时长，超过 timeout 配置，一直失败
    * 数据倾斜。个别 subTask 处理慢。
    * window 窗口慢。窗口不触发。
  * 任务在报错，反复重启，已经宕机
* 解决办法

