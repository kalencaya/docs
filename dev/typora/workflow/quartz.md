# quartz 介绍

Quartz 是一个开源的任务调度库，可以集成到应用中。它功能丰富，易于使用，可轻松支持数百、乃至上万任务运行。

用户在使用 Quartz 的时候主要流程如下：

创建 `Scheduler`：

```java
public void scheduler() throws Exception {
    try {
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        scheduler.start();
        scheduler.shutdown();
    } catch (SchedulerException e) {
        log.error(e.getMessage(), e);
    }
}
```

创建任务和 `Trigger`：

```java
JobDetail jobDetail = newJob(HelloJob.class)
        .withIdentity("hello", "demo")
        .withDescription("hello job")
        .usingJobData("timestamp", System.currentTimeMillis())
        .usingJobData("counter", 1)
        .build();
Trigger trigger = TriggerBuilder.newTrigger()
        .withIdentity( "" + 1, "hello")
        .withDescription("hello job trigger")
        .build();
scheduler.scheduleJob(jobDetail, trigger);
```

实现 `Job`：

```java
@Slf4j
public class HelloJob implements Job {

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        Trigger trigger = context.getTrigger();
        JobDataMap mergedJobDataMap = context.getMergedJobDataMap();
        log.info("{}={}: {}={}", trigger.getKey(), context.getFireInstanceId(), "timestamp", mergedJobDataMap.getLongValue("timestamp"));
    }
}
```

Quartz 还提供了 listener 功能，供用户处理 `Scheduler`、`Trigger` 和 `Job` 事件：

* `SchedulerListener`
* `TriggerListener`
* `JobListener`