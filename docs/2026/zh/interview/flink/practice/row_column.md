# 行列转换

## 行转列

* LATERAL
* UNNEST

### LATERAL

LATERAL 需要配合 Table Function 使用。

```sql
-- INNER JOIN
SELECT order_id, res
FROM Orders,
LATERAL TABLE(table_func(order_id)) t(res)

-- LEFT OUTER JOIN
SELECT order_id, res
FROM Orders
LEFT OUTER JOIN LATERAL TABLE(table_func(order_id)) t(res)
  ON TRUE
```

#### Table Function

`table_function` 返回的结果需要是 `ARRAY` 类型。

* 内置函数
  * 社区实现
    * SPLIT。
  * 阿里云商业实现
    * [GENERATE_SERIES](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/generate-series-1)
    * [JSON_TUPLE](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/json-tuple)
    * [MULTI_KEYVALUE](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/multi-keyvalue)
    * [STRING_SPLIT](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/string-split)
* UDTF

### UNNEST



## 参考文档

* Flink
* [Table Functions](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/python/table/udfs/python_udfs/)
* [Table Functions](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/functions/udfs/#table-functions)
* [Array Expansion](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/sql/queries/joins/#array-expansion)