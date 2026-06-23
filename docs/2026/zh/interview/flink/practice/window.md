# 窗口函数

## 传统

参考文档:

* [Windowing table-valued functions (Windowing TVFs)](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/sql/queries/window-tvf/)

Flink 中`传统`的窗口函数：

* Tumble（滚动窗口）。
* Hop（滑动窗口）。
* Cumulate（累积窗口）。滚动窗口的升级版，当需要统计长周期如一天的销售额时，滚动窗口只有等1天结束才能触发，滑动窗口无法实现按天滚动的效果，因此需要对滚动窗口做升级：窗口时间1天，触发事件1分钟。
* Session

以埋点场景为例：

```sql
-- kafka 埋点表
CREATE TEMPORARY TABLE kafka_bury_event
(
    event_key         STRING COMMENT '事件名称'
    ,event_time       TIMESTAMP(3) COMMENT '事件时间戳'
    ,event_timestamp  BIGINT COMMENT '事件时间戳'
    ,client_time      TIMESTAMP(3) COMMENT '事件客户端时间戳'
    ,client_timestamp BIGINT COMMENT '事件客户端时间戳'
    ,user_id          STRING COMMENT '用户id'
    ,page_name        STRING COMMENT '页面名称'
    ,module_name      STRING COMMENT '模块名称'
    ,pit_name         STRING COMMENT '坑位名称'
    ,pit_position     STRING COMMENT '坑位位置'
    ,proc_time        AS PROCTIME() --处理时间
    ,WATERMARK FOR event_time AS event_time - INTERVAL '5' MINUTE --事件时间
)
WITH (
    'connector' = 'kafka'
    ,'topic' = 'bury_event'
    ,'properties.bootstrap.servers' = 'localhost:9092,localhost:9093,localhost:9094'
    ,'format' = 'json'
    ,'properties.group.id' = 'flink_user_tag'
    ,'scan.startup.mode' = 'latest-offset'
)
;

-- doris 用户维表
CREATE TEMPORARY TABLE doris_dim_user
(
    user_id    VARCHAR(255)
    ,user_name STRING
    ,age       INT
    ,PRIMARY KEY (user_id) NOT ENFORCED
)
WITH (
    'connector' = 'doris'
    ,'fenodes' = 'localhost:8080'
    ,'jdbc-url' = 'jdbc:mysql://localhost:9030'
    ,'username' = 'admin'
    ,'password' = 'admin'
    ,'table.identifier' = 'dws.user'
    ,'lookup.cache.max-rows' = '100000'
    ,'lookup.cache.ttl' = '300s'
    ,'lookup.jdbc.async' = 'true'
)
;


WITH events
AS
(
    SELECT
        t1.*
        ,t2.user_name
    FROM kafka_bury_event /*+ OPTIONS('scan.startup.mode'='timestamp', 'scan.startup.timestamp-millis' = '1777600800000') */ AS t1
        LEFT JOIN doris_dim_user FOR SYSTEM_TIME AS OF PROCTIME() AS t2
            ON t1.user_id = t2.user_id
    WHERE t1.user_id IS NOT NULL
)
SELECT
    user_id
    ,DATE_FORMAT(window_start, 'yyyyMMdd') AS stat_date
    ,SUM(IF(event_key IN ('flowOnShow') AND page_name IN ('首页','个人中心'),1,0)) AS show_cnt
    ,SUM(IF(event_key IN ('flowOnClick') AND page_name IN ('首页','个人中心'),1,0)) AS click_cnt
FROM TABLE(CUMULATE(TABLE events,
        DESCRIPTOR(event_time),
        INTERVAL '5' MINUTES,
        INTERVAL '1' DAYS))
GROUP BY
    user_id
    ,window_start
;
```

