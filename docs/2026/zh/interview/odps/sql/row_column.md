# 行列转换

```sql
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

WITH base_data AS 
(
    SELECT  ds
            ,user_id
            ,MIN(login_time) AS login_time
            ,MAX(logout_time) AS logout_time
    FROM    dwd.dwd_data_center_my_table
    WHERE   ds BETWEEN '20260306' AND '20260319'
    GROUP BY ds
             ,user_id
)
,list_data AS 
(
    SELECT  t.ds
            ,t.user_id
            ,b.behavior_name
            ,b.behavior_time
            ,ROW_NUMBER() OVER (PARTITION BY t.ds,t.merge_id ORDER BY b.behavior_time ASC ) AS behavior_rn
    FROM    base_data t
    LATERAL VIEW UNNEST(
           ARRAY(
               NAMED_STRUCT('behavior_name','登陆','behavior_time',login_time),
               NAMED_STRUCT('behavior_name','登出','behavior_time',logout_time)
                        )
    ) tmp AS b
    WHERE   b.behavior_time IS NOT NULL
)
SELECT *
FROM list_data
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

## LATERAL VIEW

`lateral view` 可以和 array、map 类型进行展开操作，通过 UDTF 函数的输入和输出是一对多的关系，可以配合 `lateral view` 将一行数据拆成多行数据。

`explode` 和 `posexplode` 函数是 odps 内置的 udtf 函数。示例如下：

```sql
-- 
LATERAL VIEW EXPLODE(FROM_JSON(json_ext,"array<string>")) temp AS json_field
-- POSEXPLODE 可以保留位置信息
LATERAL VIEW POSEXPLODE(FROM_JSON(json_ext,"array<string>")) temp AS pos,json_field
-- OUTER 可以在 FROM_JSON(json_ext,"array<string>") 无数据时对应的输入行依然保留
LATERAL VIEW OUTER EXPLODE(FROM_JSON(json_ext,"array<string>")) temp AS json_field
-- 还可以组合多个 LATERAL VIEW，结果为笛卡尔集
SELECT pageid,mycol1, mycol2 FROM pageAds 
    LATERAL VIEW EXPLODE(col1) myTable1 AS mycol1 
    LATERAL VIEW EXPLODE(col2) myTable2 AS mycol2;
-- 如果有多个列数据相同，还可以先把 array 组合到一起
LATERAL VIEW OUTER EXPLODE(
        CONCAT(NVL(FROM_JSON(json_1,"array<string>"),ARRAY()),NVL(FROM_JSON(json_2,"array<string>"),ARRAY()))
) temp AS json_field
```

`lateral view` 可以和 array 和 map 配合，主要是 array，构建 array 的方式有多种：

* JSON 函数。如果数据是 JSON 数组，可以使用 `FROM_JSON(json_ext,"array<string>")`
* SPLIT。如果数据是类似 `name1,name2`，可以使用 SPLIT 函数：`LATERAL VIEW EXPLODE(SPLIT(id_list,',')) temp AS ids `
* 手动构建。如果数据是已知的枚举，可以手动构建。`LATERAL VIEW EXPLODE(ARRAY('用户','游客')) temp AS user_type`

除了 `explode` 和 `posexplode` 之外，MaxCompute 也支持 `UNNEST` 函数，它和 `explode` 和 `posexplode` 作用一致。

## 参考文档

* [SQL概述](https://help.aliyun.com/zh/maxcompute/user-guide/overview-of-maxcompute-sql)
* [行转列及列转行最佳实践](https://help.aliyun.com/zh/maxcompute/use-cases/transpose-rows-to-columns-or-columns-to-rows)
* [LATERAL VIEW](https://help.aliyun.com/zh/maxcompute/user-guide/lateral-view)
* [EXPLODE](https://help.aliyun.com/zh/maxcompute/user-guide/explode)、[POSEXPLODE](https://help.aliyun.com/zh/maxcompute/user-guide/posexplode)
* [ODPS SQL ——列转行、行转列这回让我玩明白了！](https://rivers.chaitin.cn/blog/cqq5ai10lnec5jjugkjg)
* [SQL面试题 03｜行转列和列转行，一篇讲透](https://mp.weixin.qq.com/s/MAfcasf1HIW7KqLM4-OhPQ)
