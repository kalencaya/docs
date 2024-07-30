# Job Schedule

JDK 提供的有 `ExecutorService` 和 `ScheduledExecutorService` 提供异步和调度任务，但是存在一些弊病：

* 基于内存。应用宕机任务丢失
* 只支持单机，或者是单 JVM 实例。不支持集群，存在单点问题。如果应用是集群部署，存在任务重复执行问题
* 缺少重试。任务异常后，任务无法通过重试自愈，重新执行
  * 持久化。将任务持久化后就可以容忍 JVM 宕机问题，供后续重试

* 限流。通过限流保护应用不会因为压力过大宕机
* 生命周期管理。任务无法启动、停止
* 动态调整。无法调整任务参数、执行频率
* 不支持高级任务。任务分片，MapReduce 类型
* 任务上下游依赖。
* 监控告警、任务日志查看

关键特性

* 任务类型
  * 一次性。fire-and-forget
  * 周期性任务
  * 延时任务
  * MapReduce
  * 任务分片
  * 任务广播
  * DAG 任务
* 调度频率。执行开始时间、结束时间限制，执行次数限制，是否支持秒级调度
  * 固定延迟
  * 固定频率
  * CRON 表达式
* 任务参数
* 存储
  * 存储类型。内存，MySQL，Redis，消息队列
  * 任务持久化。是否支持将任务持久化到存储中，任务线程或 JVM 宕机后可以重试任务
* JDK。8，11，17
* 生命周期。
  * 任务管理。任务的启动，停止，暂停，恢复等
  * 任务事件监听。
* 监控、告警、日志白屏化
* 异步执行。异步执行任务，执行结束后发送任务执行结果
* 任务阻塞
  * 过期处理策略。任务错过调度时间的处理策略，如服务重启、调度线程阻塞
  * 负载均衡。
  * 阻塞策略。单机串行，丢弃后续调度
  * 队列
* 任务优先级，任务超时
* 其他
  * 长耗时
  * 任务进度条

## 调度任务

周期性执行任务。如固定频率、固定延迟、CRON

- 嵌入式

  - [quartz](https://github.com/quartz-scheduler/quartz)
  - [ShedLock](https://github.com/lukas-krecan/ShedLock)。ShedLock 并不是调度系统，而是在避免调度任务在多个实例或线程上同时运行
  - [redisson](https://github.com/redisson/redisson)。基于 redis 实现调度任务，依赖 redis。参考：[Distributed scheduled executor service](https://github.com/redisson/redisson/wiki/9.-distributed-services#94-distributed-scheduled-executor-service)
  - [auto-job](https://gitee.com/hyxl-520/auto-job)
  - [jobrunr](https://github.com/jobrunr/jobrunr)
  - [db-scheduler](https://github.com/kagkarlsson/db-scheduler)
  - [spring cloud task](https://spring.io/projects/spring-cloud-task#overview)
- 中间件

  - [elastic-job](https://github.com/apache/shardingsphere-elasticjob)。分 2 种模式：lite 和 cloud，lite 模式需嵌入应用中，cloud 模式下可独立部署
  - [xxl-job](https://github.com/xuxueli/xxl-job)
  - [light-task-scheduler](https://gitee.com/hugui/light-task-scheduler)。停止维护
  - [orca](https://github.com/spinnaker/orca)。CI/CD 系统的编排引擎
  - [lmstfy](https://github.com/bitleak/lmstfy)。基于 redis 的延迟队列实现

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
    * [redisson](https://github.com/redisson/redisson)。基于 Redis 实现了异步和调度任务
    * [hazelcast](https://github.com/hazelcast/hazelcast)。[Java Executor Service](https://docs.hazelcast.com/hazelcast/latest/computing/executor-service)
    * [fc-async](https://github.com/xiongyanokok/fc-async)。[一套万能的异步处理方案（典藏版）](https://mp.weixin.qq.com/s?__biz=MzI4Njc5NjM1NQ==&mid=2247557011&idx=1&sn=175a3f46f9310768aea1c0d31f9d61b9&chksm=ebd520bfdca2a9a9de0741319d5c1f4f3fe0bc53e465f3adbe6cfd0668a5108cbc9f7844fbc8&mpshare=1&scene=1&srcid=0730cCbOa8FrDkyKdIyWzXzJ&sharer_shareinfo=9e34ce939c1b54f05a3c7b522941173e&sharer_shareinfo_first=9e34ce939c1b54f05a3c7b522941173e&version=4.1.10.99312&platform=mac&nwr_flag=1#wechat_redirect)
    * [Task](https://github.com/WangJunTYTL/Task)
    * [大搜车异步任务队列中间件的建设实践](https://www.infoq.cn/article/umqb2cfdgrfcduz9ofd1)
    * [AsyncTask](https://gitee.com/jmpp/AsyncTask)
    * [asyncmd](https://github.com/bojiw/asyncmd)
    * [yy-job](https://gitee.com/the_source_of_the_abyss/yy-job)

## 其他

* [cron-utils](https://github.com/jmrozanec/cron-utils)。一个单纯的 cron 库

## 技术文档

- [如何设计一个海量任务调度系统](https://mp.weixin.qq.com/s/hv3tTOAdD-SiCq2owCdxZQ)
- [基于协程池架构实现分布式定时器 XTimer](https://mp.weixin.qq.com/s/gfiAm4NrcY_PaRNrQ1P2vw)
- [支付宝定时任务怎么做？三层分发任务处理框架介绍](https://mp.weixin.qq.com/s/6zY3ZtilM1jA5gMPMDRQyA)
- [亿级异构任务调度框架设计与实践](https://mp.weixin.qq.com/s/9WIZIf-7yApfCZSMuD9CWQ)
- [异步任务处理系统，如何解决业务长耗时、高并发难题？](https://mp.weixin.qq.com/s/Bwj8V6kFWfXwGiKS-E2pHA)
- [快速实现一个分布式定时器](https://mp.weixin.qq.com/s/ggPftQm2ewGOJwlRDQGgDQ)
- [Spring Boot 实现定时任务的 4 种方式](https://mp.weixin.qq.com/s/iWK70k1KgHLKG9cvIlELbg)
- [DAG流图自动排列布局的实现](https://mp.weixin.qq.com/s/tsmNFpABJAxAItVzPqluWw)。前端页面如何实现 DAG 自动排列的一篇文章

