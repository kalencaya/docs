# 函数

## 日期

在 MaxCompute 中日期类型包括 3 个：

* DATE
* DATETIME。精确到秒。如 create_time、update_time 类型的字段使用 DATETIME，会出现多个 `2026-01-01 00:00:01` 无法区别前后顺序
* TIMESTAMP。精确到毫秒

区别如下：

```sql
-- 如果日期格式为 yyyy-mm-dd、yyyy-mm-dd hh:mi:ss 等可以直接转化成对应的类型，无需
SELECT  DATE('2026-01-01')
        ,DATETIME('2021-11-29 00:01:00')
        ,TIMESTAMP('2021-01-11 00:00:00.123456789')
        ,CAST("2005-03-30" AS DATE)
        ,CAST("2005-03-30 00:00:00" AS DATETIME)
        ,CAST("2005-03-30 00:00:00" AS TIMESTAMP)
        
        -- 。yyyy-mm-dd hh:mi:ss
        -- 日期加减。年: yyyy, 月: mm, 天: dd, 小时: hh, 分钟: mi, 秒: ss
				-- 扩展格式。年: year, 月: month 或 -mon, 日: day, 小时: hour
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'yyyy')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'year')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'mm')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'month')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'mon')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'dd')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'day')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'hh')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'hour')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'mi')
        ,DATEADD(DATETIME('2021-11-29 00:01:00'),-1,'ss')

-- 如果想直接使用 STRING 类型，格式需符合 yyyy-mm-dd hh:mi:ss，同时添加配置
SET odps.sql.type.system.odps2=false;
SELECT DATEADD('2005-02-28 00:00:00', 1, 'dd');

-- 日期和时间戳互相转化。时间戳单位为 秒
unix_timestamp(datetime|date|timestamp|string <date>)
from_unixtime(bigint <unixtime>)
```

常用操作

```sql
TO_CHAR(DATEADD(TO_DATE('${bizdate}','yyyymmdd'),-3,'month'),'yyyymmdd')
```

### 日期格式化

```sql
-- 格式化为 年月日
TO_CHAR(create_time,'yyyymmdd')
-- 格式化为 年月日时分秒
TO_CHAR(chat_start_time,'yyyy-mm-dd hh:mi:ss')
```

### 周

```sql
-- 获取某个日期所在的周一和周日，周一以 monday 开始
SELECT  DATE_ADD(NEXT_DAY(DATETIME('2026-04-10 10:02:03'),'Monday'),-7)
        ,DATE_ADD(NEXT_DAY(DATETIME('2026-04-10 10:02:03'),'Monday'),-1)
;

-- 获取某个日期所在的周一和周日，周一以 friday 开始
SELECT  DATE_ADD(NEXT_DAY(DATETIME('2026-04-10 10:02:03'),'Friday'),-7)
        ,DATE_ADD(NEXT_DAY(DATETIME('2026-04-10 10:02:03'),'Friday'),-1)
;
-- 上面的 sql 不仅在 ODPS 中有效，在 Doris 中也有效
```

## 窗口函数

### 最大值、最小值

假设有 1 张订单表，查询用户首次下单的订单id、下单时间，最后一次下单的订单id、下单时间，在 odps 中有 3 种方式可以实现：

* FIRST_VALUE、LAST_VALUE
* ARG_MIN、ARG_MAX
* MIN_BY、MIN_MAX

```sql
CREATE TABLE IF NOT EXISTS orders
(
    order_id    STRING COMMENT '工单id'
    ,user_id    BIGINT COMMENT '用户id'
    ,order_time DATETIME COMMENT '下单时间'
)
COMMENT '订单表'
PARTITIONED BY 
(
    ds          STRING
)
LIFECYCLE 30
;

SELECT  *
        ,FIRST_VALUE(order_id) OVER (PARTITION BY user_id ORDER BY order_time ) AS first_order_id
        ,FIRST_VALUE(order_time) OVER (PARTITION BY user_id ORDER BY order_time ) AS first_order_time
        ,LAST_VALUE(order_id) OVER (PARTITION BY user_id ORDER BY order_time ) AS last_order_id
        ,LAST_VALUE(order_time) OVER (PARTITION BY user_id ORDER BY order_time ) AS last_order_time
FROM    order
WHERE   ds = MAX_PT('order')
;

SELECT  user_id
        ,ARG_MIN(order_time,order_id) AS first_order_id
        ,MIN_BY(order_id,order_time) AS first_order_id2 -- MIN_BY 函数的字段顺序和 ARG_MIN 是相反的
        ,MIN(order_time) AS first_order_time
        ,ARG_MAX(order_time,order_id) AS last_order_id
        ,MAX_BY(order_id,order_time) AS last_order_id2 -- MAX_BY 函数的字段顺序和 ARG_MAX 是相反的
        ,MAX(order_time) AS last_order_time
FROM    order
WHERE   ds = MAX_PT('order')
GROUP BY user_id
;
```

## JSON

todo



## 参考文档

* [SQL概述](https://help.aliyun.com/zh/maxcompute/user-guide/overview-of-maxcompute-sql)
