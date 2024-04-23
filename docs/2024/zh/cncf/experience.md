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
* [java-operator-sdk](https://github.com/operator-framework/java-operator-sdk)。
  * 同时实现了 watch 和 timer 方式，还支持从消息队列中获取
