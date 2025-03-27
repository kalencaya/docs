# 灾备

* [failsafe](https://github.com/failsafe-lib/failsafe)
* [resilience4j](https://github.com/resilience4j/resilience4j)
* [guava-retrying](https://github.com/rholder/guava-retrying)
* [spring-retry](https://github.com/spring-projects/spring-retry)
* [easy-retry](https://github.com/alibaba/easy-retry)
* [easy-retry](https://github.com/aizuda/easy-retry)
* [bucket4j](https://github.com/bucket4j/bucket4j)
* [guava](https://github.com/google/guava)。RateLimiter

## Metrics

* [metrics](https://github.com/dropwizard/metrics)
* [micrometer](https://github.com/micrometer-metrics/micrometer)

## 告警

* [HertzBeat](https://hertzbeat.apache.org/zh-cn/)。具有强大的无 agent 采集器，通过如 `Http`、`JMX`、`SNMP`、`JDBC`、`Prometheus` 等协议采集指标。因为无 agent，需要采集器主动采集应用的监控指标，采集器支持集群部署。
  * 监控任务采用时间轮定时采集应用的监控指标
  * 监控任务在采集器中自调度，采集器失败后可无感知迁移采集任务，采集器上下线会触发重新平衡分担采集压力。监控任务采用
* [nightingale](https://github.com/ccfos/nightingale)。夜莺
* [ozhera](https://github.com/apache/ozhera)。小米开源