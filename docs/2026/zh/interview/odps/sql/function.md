# 函数

### 日期

### 类型转换



```sql
-- 格式化为 年月日
TO_CHAR(create_time,'yyyymmdd')
-- 格式化为 年月日时分秒
TO_CHAR(chat_start_time,'yyyy-mm-dd hh:mi:ss')

-- 增加日期 DATEADD
-- 加一天。天: dd, 月: mm, 小时: hh, 分钟: mi, 秒: ss
-- 扩展格式。年: year, 月: month 或 -mon, 日: day, 小时: hour
DATEADD(DATETIME '2005-02-28 00:00:00', 1, 'dd');
-- 直接使用 STRING 类型，需符合 yyyy-mm-dd 或 yyyy-mm-dd hh:mi:ss 格式
DATEADD('2005-02-28 00:00:00', 1, 'dd');
-- 常用操作
TO_CHAR(DATEADD(TO_DATE('${bizdate}','yyyymmdd'),-3,'month'),'yyyymmdd')

-- 日期和时间戳互相转化
unix_timestamp(datetime|date|timestamp|string <date>)
from_unixtime(bigint <unixtime>)

-- CAST

-- DATE
```

## 参考文档

* [SQL概述](https://help.aliyun.com/zh/maxcompute/user-guide/overview-of-maxcompute-sql)
