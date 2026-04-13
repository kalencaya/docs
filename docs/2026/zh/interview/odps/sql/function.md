# 函数

### 日期

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
```

## 参考文档

* [SQL概述](https://help.aliyun.com/zh/maxcompute/user-guide/overview-of-maxcompute-sql)
