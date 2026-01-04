# 监控告警

本文仅限于**集成**场景，非监控告警系统本身，而是如何更好地打通应用和现有的监控告警系统，简化使用。

集成场景指的是应用自身进行埋点或者使用开箱即用的库生成监控指标，将指标上报或者由监控系统主动采集（push 或 pull 方式），通过可视化系统查看监控指标，配置告警规则接收告警并进行分发。

为了实现集成，需要实现如下要点：

* 指标采集。
  * 监控系统如何采集到应用监控指标？
  * 当服务器、应用、任务新增或下线时如何动态调整采集？
* 可视化。
  * 可视化
* 告警规则管理
  * 如何简化告警配置？表单或者内置
  * 如何动态新增或删除告警规则？
* 告警事件通知
  * 如何将告警通知分发到具体的服务器、应用、任务 owner？

而在当今 prometheus + grafana 已经成为事实上的监控标准，集成场景也主要以 prometheus 为主。

## 指标采集

应用本身需要完成指标埋点生成监控指标，通过 push 或 pull 方式使监控系统获取到监控指标。

* push。应用本身需配置指标上报服务器地址，push 方式下监控系统无需感知服务器、应用、任务变更
* pull。应用本身需暴露指标接口（http、jmx 等），pull 方式下监控系统需感知服务器、应用、任务变更
  * 更改 prometheus 配置。将变动的服务器地址同步到 prometheus 配置中，通过 `http://${prometheus_url}/_/reload` 接口触发配置加载（如果 prometheus 开启了认证，还需要加上用户名和密码。在 header 中加上：`Authorization: Basic ${username}:${password}`，其中 `${username}:${password}` 只是个说明，不能发送明文用户名密码，实际发送请求时需用 base64 编码一下）
  * 借助 prometheus 的 service discovery 机制。
    * prometheus-operator 提供了 `ServiceMonitor` 和 `PodMonitor`。如果是在 kubernetes 环境中，可以手动创建一个  `ServiceMonitor` 和 `PodMonitor` 即可。
    * 应用提供 http service discovery 接口。
      * 应用提供 http 接口供 prometheus 获取服务器、应用、任务地址
      * prometheus 在 `scrape_configs` 中通过 `http_sd_configs` 配置采集。一次即可，后续无需变更

## 可视化

todo。

* 如何实现自动跳转到 grafana，并携带参数可以自动自动展示对应的服务器、应用、任务
* 如何实现在应用内通过代理的方式嵌入 grafana 图标

## 告警规则管理

* 告警规则定义：
  * 用户直接提供 promQL 语句
  * 通过表单或者内置规则生成 promQL 语句
* 告警规则标签
* 告警规则组合：
  * 单个规则
  * 组合规则。and 和 or 条件以及嵌套。prometheus 不支持组合规则，需要告警应用在处理一下
* 告警规则发布
  * `reload` 接口
  * `PrometheusRule`。在 k8s 环境中，如果使用 prometheus-operator，可以使用 `PrometheusRule`。

## 告警事件

在 prometheus 中告警事件不会一致保留，如果要长期保留告警事件，需要另行存储。prometheus 提供了 alertmanager 进行告警事件通知，但是它定制起来很麻烦。

如告警事件通知，alertmanager 确实支持了多种渠道，但是很难进行个性化分发。如技术部可以提供一个告警通知群，把相关技术都拉进去，告警统一发送到群内，如果群内消息如果可以 @ 下相关责任人就更好了。或者通过邮件发送到不同的用户中。

上述情况下就会出现告警通知需要频繁变动，需频繁修改。对于告警事件的处理可以开发一个专门的告警系统，接收 alertmanager 的告警事件，在告警系统中与公司内部的组织架构进行打通，这样就可以把告警事件灵活发送到相关人员手上，毕竟想办法打通 alertmanager 和公司组织架构比另开发一个内部的告警系统难多了。

同时在告警系统中也可以加入上一步的告警规则管理，这样就可以在告警系统中统一管理告警规则、告警事件和告警通知

## 方案参考

* [carp-module-alert](https://github.com/flowerfine/carp/tree/dev/carp-modules/carp-module-alert)
* [doris-manager](https://docs.selectdb.com/docs/enterprise/management-guide/what-is-doris-manager)。现更名为 selectdb-enterprise。指标采集和告警基于 prometheus 和 alertmanager，doris-manager 接收 alert-manager 的告警事件，内部处理决定是否继续通知以及选择通知渠道进行通知。
  * doris-manager、prometheus、grafana 位于同一台服务器。doris-manager 将告警规则写入本地文件，调用 prometheus 的 `reload` 接口进行加载。doris-manager 通过代理 grafana 可以在 doris-manager 上查看 grafana 图标
* [ozhera](https://github.com/apache/ozhera)。它与 prometheus 的集成是通过调用阿里云 arms 的 openapi 实现的
* [CloudEon](https://github.com/dromara/CloudEon)。基于 prometheus-operator，告警事件的处理与 doris-manager 类似，也是接收 alertmanager 的告警事件。它通过 k8s 的 `ConfigMap` 动态生成 grafana dashboard。
* [chitu-sdp](https://github.com/lwx351612/chitu-sdp)。chitu-sdp 指标采集基于 prometheus，告警是自己做的定时任务，根据 promQL 定时查询 prometheus 生成告警事件
* [ocp](https://www.oceanbase.com/docs/ocp)。ocp 的监控和告警都是自己实现的，它有一个 `monitordb` 专门用于存储采集的监控指标，并生成告警。后面 ocp 对接了 prometheus 和 sls，可以通过 prometheus 采集指标和进行可视化展示，生成告警
  * [告警中心](https://www.oceanbase.com/docs/common-ocp-1000000003339337)
  * [将 OCP 监控集成到 Prometheus](https://www.oceanbase.com/docs/common-ocp-1000000003339197)
  * [监控查询对接外部时序系统](https://www.oceanbase.com/docs/common-ocp-1000000003339460)
* [WatchAlert](https://github.com/opsre/WatchAlert)
* [Prometheus Operator 自定义报警](https://www.qikqiak.com/post/prometheus-operator-custom-alert/)。介绍了如何通过 k8s 的 `Secret` 动态修改 alertmanager 的通知渠道
* [探索 PrometheusRule：监控与报警的利器](https://mp.weixin.qq.com/s/56Z0LRoC8AL5NtyX7RdfMA)
* [Linux安装PrometheusAlert](https://mp.weixin.qq.com/s/kH51N--jjjzKNQwj_qxa4g)
* [熬了30夜！做了一个运维专属的告警管理系统AlertFusion](https://mp.weixin.qq.com/s/NYQuv2L2DrNz53gR7_1OPQ)

