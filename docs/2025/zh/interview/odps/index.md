# 概览

## SQL 常见操作

### 日期

```sql
-- 格式化为 年月日
TO_CHAR(create_time,'yyyymmdd')
-- 格式化为 年月日时分秒
TO_CHAR(chat_start_time,'yyyy-mm-dd hh:mi:ss')
```

### 函数



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
```

