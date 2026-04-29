# 基础



## JOIN

```sql
full outer join
```

### 参考文档

* [JOIN](https://help.aliyun.com/zh/maxcompute/user-guide/join)
* [SEMI JOIN](https://help.aliyun.com/zh/maxcompute/user-guide/semi-join)
* [MAPJOIN HINT](https://help.aliyun.com/zh/maxcompute/user-guide/mapjoin-hints)
* [SUBQUERY_MAPJOIN HINT](https://help.aliyun.com/zh/maxcompute/user-guide/subquery-mapjoin-hint)
* [DISTRIBUTED MAPJOIN](https://help.aliyun.com/zh/maxcompute/user-guide/distributed-mapjoin)
* [SKEWJOIN HINT](https://help.aliyun.com/zh/maxcompute/user-guide/skewjoin-hint)

## Group

```sql
-- 过滤
SELECT  user_id
        ,COUNT(1) AS order_cnt
FROM    my_order
WHERE   ds = '${bizdate}'
GROUP BY user_id
HAVING  order_cnt > 10
LIMIT   100
;

-- 数据上卷
SELECT  ds_date
        ,CASE   WHEN GROUPING(status) = 1 THEN '合计'
                ELSE status
        END AS status
        ,COUNT(*) AS cnt
FROM    my_table
GROUP BY 
GROUPING SETS ((ds_date)
              ,(ds_date,status))
;
```
