# 监控告警

## 阿里云 Flink 实时计算平台

阿里云 Flink 实时计算平台的告警由阿里云 ARMS 实现。监控指标由 ARMS 的 prometheus 实例采集，任何告警规则都可以在 ARMS 配置。在 Flink 实时计算平台这边提供了一些预定义指标的方便配置，这些配置都可以在 ARMS 配置实现。

参考链接：[配置监控告警](https://help.aliyun.com/zh/flink/user-guide/configure-alert-rules?spm=a2cn1.deployment_alarm_rules.help.dexternal.a04f458a82ILXa)

### 告警模板

![alert_config_template_list](./image/alert_config_template_list.png)

#### 告警详情

![alert_config_template_detail_01](./image/alert_config_template_detail_01.png)

![alert_config_template_detail_02](./image/alert_config_template_detail_02.png)

![alert_config_template_detail_03](./image/alert_config_template_detail_03.png)

#### 指标配置

![alert_config_template_detail_metrics_01](./image/alert_config_template_detail_metrics_01.png)

![alert_config_template_detail_metrics_02](./image/alert_config_template_detail_metrics_02.png)

![alert_config_template_detail_metrics_03](./image/alert_config_template_detail_metrics_03.png)

![alert_config_template_detail_metrics_04](./image/alert_config_template_detail_metrics_04.png)

#### 通知管理

![alert_config_template_detail_nofity_01](./image/alert_config_template_detail_nofity_01.png)

![alert_config_template_detail_nofity_02](./image/alert_config_template_detail_nofity_02.png)

### 任务告警

#### 告警规则

![alert_rule_list](./image/alert_rule_list.png)

![alert_rule_detail](./image/alert_rule_detail.png)

#### 告警历史

![alert_list](./image/alert_list.png)

![alert_list_select](./image/alert_list_select.png)



