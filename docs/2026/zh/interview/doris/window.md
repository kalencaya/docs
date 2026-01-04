# 窗口函数

窗口函数是一类特殊的分析函数，又名开窗函数。最常见的窗口函数是 `row_number()`，如用 `row_number()` 函数进行去重：

```mysql
-- row_number 函数，对用户发言顺序进行排序
SELECT
  *,
  ROW_NUMBER() OVER ( PARTITION BY user_id ORDER BY time ASC ) AS rn
FROM
  chat_logs;
  
-- 获取首次发言记录
SELECT * 
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER ( PARTITION BY user_id ORDER BY time ASC ) AS rn
  FROM
    chat_logs
) AS t WHERE t.rn = 1;
```

窗口函数总结如下：

* 窗口函数只能出现在 select 列表和最外层的 order by 从句中。在查询过程中，窗口函数会在最后生效，就是说，在执行完 join，where 和 group by 等操作之后再执行。
* 窗口函数针对的是 select 最后的结果集每一行计算出一个单独的值，这种方式允许用户在 select 从句中增加额外的列，给用户提供了更多的机会来对结果集进行重新组织和过滤
* 窗口函数是对于多个输入行做计算得到一个数值。窗口函数是在一个特定的窗口内对输入数据做处理，每个窗口函数内的数据可以用 over() 从句进行排序和分组

## 使用场景

* 排名和排序。窗口函数能够计算每行在
* 累计和平均值，分组内聚合
* 移动平均和滑动窗口分析
* 前后行比较
* 填充和插值

## 语法介绍

```sql
function(args) OVER(partition_by_clause order_by_clause [window_clause])    
partition_by_clause ::= PARTITION BY expr [, expr ...]    
order_by_clause ::= ORDER BY expr [ASC | DESC] [, expr [ASC | DESC] ...]
```

### function

AVG(), COUNT(), DENSE_RANK(), FIRST_VALUE(), LAG(), LAST_VALUE(), LEAD(), MAX(), MIN(), RANK(), ROW_NUMBER() 和 SUM()

### partition by 从句

Partition By 从句和 Group By 类似。它把输入行按照指定的一列或多列分组，相同值的行会被分到一组。

### order by 从句

Order By 从句和外层的 Order By 基本一致。它定义了输入行的排列顺序，如果指定了 Partition By，则 Order By 定义了每个 Partition 分组内的顺序。

### window 从句

Window 从句用来为分析函数指定一个运算范围，以当前行为准，前后若干行作为分析函数运算的对象。

语法:

```sql
ROWS BETWEEN [ { m | UNBOUNDED } PRECEDING | CURRENT ROW] [ AND [CURRENT ROW | { UNBOUNDED | n } FOLLOWING] ]
```

该部分指定了窗口函数的窗口区间，支持按照计算列值的范围（即RANGE）或计算列的行数（即ROWS）等两种模式来定义区间。

您可以使用`BETWEEN start AND end`指定边界的可取值，其中：

- `start`取值范围如下：
  - `CURRENT ROW`：当前行
  - `N PRECEDING`：前N行
  - `UNBOUNDED PRECEDING`：直到第1行
- `end`取值范围如下：
  - `CURRENT ROW`：当前行
  - `N FOLLOWING`：后N行
  - `UNBOUNDED FOLLOWING`：直到最后1行

## 函数分类

* 聚合函数
  * sum
  * avg
  * count
  * min
  * max
* 排名函数
  * row_number
  * rank
  * dense_rank
  * percent_rank
  * cume_dist
  * ntile
* 偏移函数
  * first_value
  * last_value
  * lag
  * lead
  * nth_value

## 参考链接

* doris。[分析函数（窗口函数）](https://doris.apache.org/zh-CN/docs/3.x/sql-manual/sql-functions/window-functions/overview)
* hive。
  * [hive](https://hive.apache.org/docs/latest/language/languagemanual/)
  * [WindowingAndAnalytics](https://hive.apache.org/docs/latest/language/languagemanual-windowingandanalytics/)
* polardb。[窗口函数](https://help.aliyun.com/zh/polardb/polardb-for-xscale/window-functions)
* dataworks。[窗口函数](https://help.aliyun.com/zh/maxcompute/user-guide/window-functions-1/)
* hologres。[窗口函数](https://help.aliyun.com/zh/hologres/developer-reference/window-functions)