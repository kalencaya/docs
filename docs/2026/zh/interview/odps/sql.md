# SQL

## 参考链接

* [SQL概述](https://help.aliyun.com/zh/maxcompute/user-guide/overview-of-maxcompute-sql)
* [行转列及列转行最佳实践](https://help.aliyun.com/zh/maxcompute/use-cases/transpose-rows-to-columns-or-columns-to-rows)

## SQL 常见操作

### 日期

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
```

### 函数

```json

-- 拆 json 数组，行转列
SELECT  *
FROM    (
            SELECT  *
            FROM    ods.ods_data_center_my_table
            WHERE   ds = '${bizdate}'
        ) AS a
LATERAL VIEW EXPLODE(FROM_JSON(json_ext,"array<string>")) ext AS json_field
-- POSEXPLODE 可以保留位置信息
-- LATERAL VIEW POSEXPLODE(FROM_JSON(json_ext,"array<string>")) ext AS pos, json_field
WHERE   GET_JSON_OBJECT(json_field,"$.name") = 'foo'
LIMIT   100
;



-- 将最新的一行和最早的一行放一块，不会去重
SELECT 
    user_id,
    FIRST_VALUE(order_id) OVER w AS first_order_id,
    FIRST_VALUE(order_date) OVER w AS first_order_date,
    FIRST_VALUE(amount) OVER w AS first_amount,
    LAST_VALUE(order_id) OVER w AS last_order_id,
    LAST_VALUE(order_date) OVER w AS last_order_date,
    LAST_VALUE(amount) OVER w AS last_amount
FROM orders
where ds = '${bizdate}'
WINDOW w AS (
    PARTITION BY user_id 
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
);
```

行转列参考：[ODPS SQL ——列转行、行转列这回让我玩明白了！](https://rivers.chaitin.cn/blog/cqq5ai10lnec5jjugkjg)

### 临时表

常见场景

```sql
with table1 as (
    select * from table_a where ds = '${bizdate}'
),
table2 as (
    select * from table_b where ds = '${bizdate}'
)
insert overwrite table table_c partition(ds='${bizdate}')
select * from table1 join table2 on table1.id = table2.id
;
```

临时表复用

```sql
with table1 as (
    select * from table_a where ds = '${bizdate}'
),
table2 as (
    select * from table1 where `type` = 'type1'
)
insert overwrite table table_b partition(ds='${bizdate}')
select * from table2
;
```

多路输出

```sql
with table1 as (
    select * from table_a where ds = '${bizdate}'
)
from table1
insert overwrite table table_type_1 partition(ds='${bizdate}')
select *
where table1.`type` = 'type1'
insert overwrite table table_type_2 partition(ds='${bizdate}')
select *
where table1.`type` = 'type2'
;
```

字段优化。对于表字段过多，需挨个写列名的时候很好使

```sql
INSERT OVERWRITE TABLE unique_orders PARTITION (ds = '${bizdate}')
SELECT  `(rn)?+.+`
FROM    (
            SELECT  *
                    ,ROW_NUMBER() OVER (PARTITION BY order_no ORDER BY update_time DESC ) AS rn
            FROM    orders
        ) 
WHERE   rn = 1
;

INSERT OVERWRITE TABLE unique_orders PARTITION (ds = '${bizdate}')
SELECT  `(ds|rn)?+.+`
        ,TO_CHAR(end_time,'yyyymmdd') ds
FROM    (
            SELECT  *
                    ,ROW_NUMBER() OVER (PARTITION BY order_no ORDER BY end_time DESC,ds ASC ) AS rn
            FROM    (
                        SELECT  *
                                ,CAST(end_time / 1000 AS TIMESTAMP) end_time
                                ,ds
                        FROM    ods_orders_di
                        WHERE   ds BETWEEN '${yesdate}' AND '${bizdate}'
                        UNION ALL
                        SELECT  *
                        FROM    dwd_orders_di
                        WHERE   ds IN (
                                    SELECT  DISTINCT TO_CHAR(CAST(end_time / 1000 AS TIMESTAMP),'yyyymmdd')
                                    FROM    ods_orders_di
                                    WHERE   ds BETWEEN '${yesdate}' AND '${bizdate}'
                                ) 
                        AND     ds > 0
                    ) t
        ) t
WHERE   rn = 1
;
```

### 字典表

从 mysql 中的表有很多是枚举，在代码中往往需要使用 `case when` 进行解析处理，可创建字典表集中维护项目中的枚举字典

```sql
-- 会创建 table，毕竟是 create table 语法
CREATE TABLE my_table AS
SELECT * FROM VALUES
  ('wang', 1),
  ('li', 2),
  ('zhang', 3)
AS t(name, age);

-- CTE（Common Table Expression）即公共表表达式，是一种临时命名的结果集，用于简化复杂查询的编写
WITH temp AS 
(
    SELECT  *
    FROM    VALUES
            ('wang',1)
            ,('li',2)
            ,('zhang',3) AS t(name,age)
)
SELECT  *
FROM    temp
;

-- 路径枚举，可处理任意层深的表
CREATE TABLE IF NOT EXISTS dim_type_df
(
    id         BIGINT COMMENT '类型ID'
    ,parent_id BIGINT COMMENT '类型父ID'
    ,name      STRING COMMENT '类型名称'
    ,`sort`    BIGINT COMMENT '排序值'
    ,root_id   BIGINT COMMENT 'root路径id'
    ,root_name STRING COMMENT 'root路径名称'
    ,id_path   STRING COMMENT 'id路径'
    ,name_path STRING COMMENT '名称路径'
    ,level     BIGINT COMMENT '层级'
    ,is_leaf   INT COMMENT '是否叶子节点。1=是，0=否'
)
COMMENT '类型'
PARTITIONED BY ( ds STRING)
;

WITH RECURSIVE path_builder AS (
    -- 递归部分：获取所有节点的完整路径
    SELECT 
        id
        ,parent_id
        ,name
        ,sort
        ,id AS root_id
        ,name AS root_name
        ,ARRAY(id) AS id_array
        ,ARRAY(name) AS name_array
        ,0 AS level
    FROM ods_type_df
    WHERE ds = '${bizdate}' AND is_deleted = 0 AND parent_id = 0 
    UNION ALL
    SELECT 
        c.id
        ,c.parent_id
        ,c.name
        ,c.sort
        ,p.root_id
        ,p.root_name
        ,CONCAT(p.id_array, ARRAY(c.id)) AS id_array
        ,CONCAT(p.name_array, ARRAY(c.name)) AS name_array
        ,p.level + 1 AS level
    FROM ods_type_df c
    JOIN path_builder p ON c.parent_id = p.id
    WHERE c.ds = '${bizdate}' AND c.is_deleted = 0
),
leaf_marker AS (
    -- 标记叶子节点
    SELECT 
        p.*
        ,CASE WHEN NOT EXISTS (
            SELECT 1 
            FROM ods_type_df t 
            WHERE t.ds = '${bizdate}' AND t.is_deleted = 0 AND t.parent_id = p.id
        ) THEN 1 ELSE 0 END AS is_leaf
    FROM path_builder p
)
INSERT OVERWRITE TABLE dim_type_df PARTITION(ds = '${bizdate}')
SELECT 
    id
    ,parent_id
    ,name
    ,sort
    ,root_id
    ,root_name
    ,CONCAT('/', CONCAT_WS('/', CAST(id_array AS ARRAY<STRING>)), '/') AS id_path
    ,CONCAT('/', CONCAT_WS('/', name_array), '/') AS name_path
    ,level
    ,is_leaf
FROM leaf_marker
;

```

### 数据备份

```sql
-- 备份数据，将 A 表数据复制到 B 表中
INSERT OVERWRITE TABLE my_table_b PARTITION (ds)
SELECT * FROM my_table_a
WHERE ds >= '20260101'

-- 删除分区
ALTER TABLE my_table DROP IF EXISTS PARTITION (ds='20260101');
```

