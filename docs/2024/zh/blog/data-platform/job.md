# Job Schedule

JDK 提供的有 `ExecutorService` 和 `ScheduledExecutorService` 提供异步和调度任务，但是存在一些弊病：

* 基于内存。应用宕机任务丢失
* 只支持单机，或者是单 JVM 实例。不支持集群，存在单点问题。如果应用是集群部署，存在任务重复执行问题
* 缺少重试。任务异常后，任务无法通过重试自愈，重新执行
* 限流。通过限流保护应用不会因为压力过大宕机
* 生命周期管理。任务无法启动、停止
* 动态调整。无法调整任务参数、执行频率
* 不支持高级任务。任务分片，MapReduce 类型
* 任务上下游依赖。
* 监控告警、任务日志查看

在技术发展过程中，出现了很多开源软件致力于解决 JDK 提供的异步和调度任务的不足。

## 调度任务

周期性执行任务。如固定频率、固定延迟、CRON

- 嵌入式

  - [quartz](https://github.com/quartz-scheduler/quartz)
  - [ShedLock](https://github.com/lukas-krecan/ShedLock)。ShedLock 并不是调度系统，而是在避免调度任务在多个实例或线程上同时运行
  - [redisson](https://github.com/redisson/redisson)。基于 redis 实现调度任务，依赖 redis。参考：[Distributed scheduled executor service](https://github.com/redisson/redisson/wiki/9.-distributed-services#94-distributed-scheduled-executor-service)
  - [auto-job](https://gitee.com/hyxl-520/auto-job)
  - [jobrunr](https://github.com/jobrunr/jobrunr)
  - [db-scheduler](https://github.com/kagkarlsson/db-scheduler)

- 中间件

  - [elastic-job](https://github.com/apache/shardingsphere-elasticjob)。分 2 种模式：lite 和 cloud，lite 模式需嵌入应用中，cloud 模式下可独立部署
  - [xxl-job](https://github.com/xuxueli/xxl-job)
  - [light-task-scheduler](https://gitee.com/hugui/light-task-scheduler)。停止维护
  - [orca](https://github.com/spinnaker/orca)。CI/CD 系统的编排引擎

- DAG

  - [PowerJob](https://github.com/PowerJob/PowerJob)
  - [openjob](https://github.com/open-job/openjob)

  - [dolphinscheduler](https://github.com/apache/dolphinscheduler)
  - [Taier](https://dtstack.github.io/Taier/)
  - [airflow](https://github.com/apache/airflow)
  - [disjob](https://github.com/dromara/disjob)
  - [hodor](https://github.com/dromara/hodor)
  - [big-whale](https://gitee.com/meetyoucrop/big-whale)
  - [hera](https://github.com/scxwhite/hera)。停止维护


## 异步任务

执行数据下载、导入任务时，往往采用异步任务执行这些长耗时任务。但是对于缺乏重试、监控的 `ExecutorService`，任务异常时无法重新执行，缺少容错性。如何保证异步任务执行的可靠性就成了这些长耗时任务的关注点。

除此之外还要考虑异步任务性能，为支持数以百万的异步任务执行，需支持异步任务在集群其他节点的执行。

Python 语言的 [Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)、Ruby 语言的 [sidekiq](https://github.com/sidekiq/sidekiq)，提供了简单、高性能、功能齐全的异步任务，只需要简单配置，就可以像在本地调用异步一样，实现集群异步任务。

* Python
  * [Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)

* Ruby
  * [Sidekiq](https://github.com/sidekiq/sidekiq)
  * [Resque](https://github.com/resque/resque)

* Java
  * Celery 实现
    * [celery-java](https://github.com/crabhi/celery-java)
    * [celery-spring-boot-starter](https://github.com/juforg/celery-spring-boot-starter)

  * Resque 实现
    * [jesque](https://github.com/gresrun/jesque)

  * 其他
    * [redisson](https://github.com/redisson/redisson)。基于 Redis 实现了异步和调度任务。
    * [hazelcast](https://github.com/hazelcast/hazelcast)。[Java Executor Service](https://docs.hazelcast.com/hazelcast/latest/computing/executor-service)
    * [Task](https://github.com/WangJunTYTL/Task)
    * [大搜车异步任务队列中间件的建设实践](https://www.infoq.cn/article/umqb2cfdgrfcduz9ofd1)
    * [AsyncTask](https://gitee.com/jmpp/AsyncTask)
    * [asyncmd](https://github.com/bojiw/asyncmd)
    * [yy-job](https://gitee.com/the_source_of_the_abyss/yy-job)


## 技术文档

- [如何设计一个海量任务调度系统](https://mp.weixin.qq.com/s/hv3tTOAdD-SiCq2owCdxZQ)
- [基于协程池架构实现分布式定时器 XTimer](https://mp.weixin.qq.com/s/gfiAm4NrcY_PaRNrQ1P2vw)
- [支付宝定时任务怎么做？三层分发任务处理框架介绍](https://mp.weixin.qq.com/s/6zY3ZtilM1jA5gMPMDRQyA)
- [亿级异构任务调度框架设计与实践](https://mp.weixin.qq.com/s/9WIZIf-7yApfCZSMuD9CWQ)
- [异步任务处理系统，如何解决业务长耗时、高并发难题？](https://mp.weixin.qq.com/s/Bwj8V6kFWfXwGiKS-E2pHA)
- [快速实现一个分布式定时器](https://mp.weixin.qq.com/s/ggPftQm2ewGOJwlRDQGgDQ)
- [Spring Boot 实现定时任务的 4 种方式](https://mp.weixin.qq.com/s/iWK70k1KgHLKG9cvIlELbg)
- [DAG流图自动排列布局的实现](https://mp.weixin.qq.com/s/tsmNFpABJAxAItVzPqluWw)。前端页面如何实现 DAG 自动排列的一篇文章

