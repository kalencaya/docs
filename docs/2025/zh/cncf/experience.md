# 经验技巧



## 监听 Kubernetes 中集群资源状态变更

* watch 方式
  * [java-operator-sdk](https://github.com/operator-framework/java-operator-sdk)。
  * Flink 的 [KubernetesSharedWatcher](https://github.com/apache/flink/blob/release-1.19/flink-kubernetes/src/main/java/org/apache/flink/kubernetes/kubeclient/KubernetesSharedWatcher.java)。倾向于 watch handler 的封装。并未对 SharedIndexInformer 添加封装
  * 变更处理逻辑
    * Event 存在丢失问题，建议仅使用 Event 作为 Trigger。当收到 Event 时在去查询最新的状态执行更新操作。因此需要设计一个 handler，只处理查询最新的状态的操作
* timer 方式

综合实现

* sreworks
  * [QCon 演讲实录（上）：多云环境下应用管理与交付实践](https://xie.infoq.cn/article/330fa3e9327c0836f193ba9b0)
  * [QCon 演讲实录（下）：多云管理关键能力实现与解析 -AppManager](https://xie.infoq.cn/article/ccf591830b980db73d0e5af9c)
* [java-operator-sdk](https://github.com/operator-framework/java-operator-sdk)。
  * [Handling Related Events with Event Sources](https://javaoperatorsdk.io/docs/features#handling-related-events-with-event-sources)同时实现了 watch 和 timer 方式，还支持从消息队列中获取

## 监控、可视化和告警

基于 prometheus 和 grafana 实现

* [ververica platform](https://github.com/ververica/ververica-platform-playground)
* [doris-manager](https://github.com/apache/doris-manager)
  * [【Apache Doris】Manager 极致丝滑地运维管理](https://mp.weixin.qq.com/s/kMBQ51kuVHL3Fb-xmb5a8A)
  * [Cluster Manager for Apache Doris 24.x 安装手册](https://docs.selectdb.com/docs/enterprise/cluster-manager-guide/deployment-guide/deployment-guide-24.x)
* [DataSophon](https://datasophon.github.io/datasophon-website/docs/current/%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/)
