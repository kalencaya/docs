---
id: job
title: Job Schedule
slug: job
order: 2
---

调度系统相关资料

调度最开始来源于一些需要周期性运行的工作，比如每天凌晨定时清除服务器上的日志文件。不同场景有不同的调度解决方案，如 linux 的 cron，Java 语言提供的 `ScheduledExecutorService`：

```java
ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
        scheduledExecutorService.scheduleAtFixedRate(() -> System.out.println("每 10 分钟运行一次，不管上一次花了多久、有没有完成"), 10, 10, TimeUnit.MINUTES);
        scheduledExecutorService.scheduleWithFixedDelay(() -> System.out.println("等待上一次任务运行结束 10 分钟运行"), 10, 10, TimeUnit.MINUTES);
```

随着系统复杂度增加，开始慢慢衍生出下面概念：

* 分布式系统。类似 linux 的 cron 和 JDK 提供的 `ScheduledExecutorService` 无法为分布式系统提供解决方案。
  * 只运行一次。调度任务只在集群中单个实例运行
  * 负载均衡。
  * 超时、重试、监控&告警。当任务失败，需支持再次运行
* 任务触发。
  * 定时调度、延迟调度
  * cron 表达式
  * 执行一次
  * 其他方式。如 webhook
* 任务编排（workflow、orchestration）。业务逻辑复杂或者执行时间过长，需要对功能进行解耦。将一个大任务拆分成一个个地子任务，串行或并行地执行任务
  * 编排。串行、并行，执行一次、迭代循环，条件等
  * DAG。将子任务编排成有向无环图（DAG），可视化编排和运行

## 开源产品

调度系统

- [quartz](https://github.com/quartz-scheduler/quartz)
- [ShedLock](https://github.com/lukas-krecan/ShedLock)
- [db-scheduler](https://github.com/kagkarlsson/db-scheduler)
- [jobrunr](https://github.com/jobrunr/jobrunr)
- [elastic-job](https://github.com/apache/shardingsphere-elasticjob)
- [xxl-job](https://github.com/xuxueli/xxl-job)
- [PowerJob](https://github.com/PowerJob/PowerJob)
- [openjob](https://github.com/open-job/openjob)
- [airflow](https://github.com/apache/airflow)
- [dolphinscheduler](https://github.com/apache/dolphinscheduler)
- [hodor](https://github.com/dromara/hodor)
- [disjob](https://github.com/dromara/disjob)

编排引擎

* [easy-flows](https://github.com/j-easy/easy-flows)
* [taskflow](https://github.com/ytyht226/taskflow)
* [liteflow](https://github.com/dromara/liteflow)
* [kestra](https://github.com/kestra-io/kestra)
* [temporal](https://github.com/temporalio/temporal)

## 技术文档

- [如何设计一个海量任务调度系统](https://mp.weixin.qq.com/s/hv3tTOAdD-SiCq2owCdxZQ)
- [基于协程池架构实现分布式定时器 XTimer](https://mp.weixin.qq.com/s/gfiAm4NrcY_PaRNrQ1P2vw)
- [支付宝定时任务怎么做？三层分发任务处理框架介绍](https://mp.weixin.qq.com/s/6zY3ZtilM1jA5gMPMDRQyA)
- [亿级异构任务调度框架设计与实践](https://mp.weixin.qq.com/s/9WIZIf-7yApfCZSMuD9CWQ)
- [异步任务处理系统，如何解决业务长耗时、高并发难题？](https://mp.weixin.qq.com/s/Bwj8V6kFWfXwGiKS-E2pHA)
- [快速实现一个分布式定时器](https://mp.weixin.qq.com/s/ggPftQm2ewGOJwlRDQGgDQ)
- [Spring Boot 实现定时任务的 4 种方式](https://mp.weixin.qq.com/s/iWK70k1KgHLKG9cvIlELbg)
- [DAG流图自动排列布局的实现](https://mp.weixin.qq.com/s/tsmNFpABJAxAItVzPqluWw)。前端页面如何实现 DAG 自动排列的一篇文章
