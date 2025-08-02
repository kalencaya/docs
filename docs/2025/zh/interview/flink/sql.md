# Flink SQL

## 数据类型

参考文档：

* [Data Types](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/types/)

| 类型                                                         | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| CHAR，CHAR(n)                                                | 1 <= n <= 2,147,483,647，不指定 n 默认为 1                   |
| VARCHAR，VARCHAR(n)                                          | 1 <= n <= 2,147,483,647，不指定 n 默认为 1                   |
| STRING                                                       | 等同于 VARCHAR(2,147,483,647)                                |
| BINARY，BINARY(n)                                            | 1 <= n <= 2,147,483,647，不指定 n 默认为 1                   |
| VARBINARY，VARBINARY(n)                                      |                                                              |
| BYTES                                                        | 等同于 VARBINARY(2,147,483,647)                              |
| BOOLEAN                                                      | 取值可以是TRUE、FALSE和UNKNOWN                               |
| TINYINT                                                      | 取值范围为[-128, 127]的有符号整数                            |
| SMALLINT                                                     | 取值范围为[-32768, 32767]的有符号整数                        |
| INTEGER，INT                                                 | 取值范围为[-2147483648, 2147483647]的有符号整数              |
| BIGINT                                                       | 取值范围为[-9223372036854775808,9223372036854775807]的有符号整数 |
| FLOAT                                                        | 大小为4字节的单精度浮点数值                                  |
| DOUBLE，DOUBLE PRECISION                                     | 大小为8字节的双精度浮点数值                                  |
| DECIMAL，DECIMAL(p)，DECIMAL(p, s)，DEC，DEC(p)，DEC(p, s)，NUMERIC，NUMERIC(p)，NUMERIC(p, s) | 功能和Java中的BigDecimal类型。p代表数值位数（长度），取值范围为[1, 38]，s代表小数点后的位数（精度），取值范围为[0, p]。注意，如果不指定p和s，则p默认为10，s默认为0。 |
| DATE                                                         | 格式为yyyy-MM-dd的日期类型，不包含时区信息                   |
| TIME，TIME(p)                                                | 格式为HH:mm:ss.SSSSSSSSS的时间类型，其中HH代表小时，mm代表分钟，ss代表秒，SSSSSSSSS代表小数秒，小数秒的精度可以达到纳秒，取值范围为[00:00:00.000000000,23:59:59.99999999]。p代表小数秒的位数，取值范围为[0, 9]，如果不指定p，则默认为0。注意，该类型不包含时区信息 |
| TIMESTAMP，TIMESTAMP(p)，TIMESTAMP WITHOUT TIME ZONE，TIMESTAMP(p) WITHOUT TIME ZONE | 格式为yyyy-MM-dd HH:mm:ss.SSSSSSSSS的时间戳类型，取值范围为[0000-01-0100:00:00.000000000, 9999-12-31 23:59:59.999999999]。p代表小数秒的位数，取值范围为[0, 9]，如果不指定p，则默认为6。注意，该类型不包含时区信息 |
| TIMESTAMP WITH TIME ZONE，TIMESTAMP(p) WITH TIME ZONE，      | 和 TIMESTAMP 一样，包含时区信息                              |
| TIMESTAMP_LTZ，TIMESTAMP_LTZ(p)，TIMESTAMP WITH LOCAL TIME ZONE，TIMESTAMP(p) WITH LOCAL TIME ZONE | 和 TIMESTAMP WITHTIME ZONE 一样，都是包含时区信息的时间戳类型。两者的区别在于TIMESTAMP WITH TIMEZONE的时区信息需要携带在数据中，举例来说，TIMESTAMP WITHTIME ZONE的输入数据应该是2022-01-0100:00:00.000000000+08:00的格式，而TIMESTAMP_LTZ的时区信息不是携带在数据中的，是由Flink作业的全局配置决定的，可通过 `table.local-time-zone` 参数设置 |
| INTERVAL YEAR，INTERVAL YEAR(p)，INTERVAL YEAR(p) TO MONTH，INTERVAL MONTH |                                                              |
| INTERVAL DAY，INTERVAL DAY(p1)，INTERVAL DAY(p1) TO HOUR，INTERVAL DAY(p1) TO MINUTE，INTERVAL DAY(p1) TO SECOND(p2)，INTERVAL HOUR，INTERVAL HOUR TO MINUTE，INTERVAL HOUR TO SECOND(p2)，INTERVAL MINUTE，INTERVAL MINUTE TO SECOND(p2)，INTERVAL SECOND，INTERVAL SECOND(p2) | INTERVAL是时间区间类型，常用于给TIMESTAMP、   TIMESTAMP_LTZ这两种时间类型添加偏移量。例如：`f1 + INTERVAL '10' YEAR AS result_interval_year --2022-01-01 00:01:06.500 -> 2032-01-01 00:01:06.500` |
| ARRAY\<t\>，t ARRAY                                          | 数组中可以保存的元素上限为 2147483647 个，参数 t 代表数组内的数据类型 |
| MAP<kt, vt>                                                  |                                                              |
| MULTISET\<t\>， t MULTISET                                   | 该类型的功能和Java中的list类型一样，是用于保存元素的列表     |
| ROW<n0 t0, n1 t1, ...>，ROW(n0 t0, n1 t1, ...)               | 表中的字段类型可以为 ROW(userId INT, gender STRING)          |
| RAW                                                          |                                                              |
| Structured types                                             | 只在 UDF 中使用                                              |

### UDF

在 UDF 中，输入输出参数可以是自定义类型。

如名为 User 的 Java 类：

```java
public class User {
	// 基础类型，flink 会通过反射获取字段类型
	// age -> INT
	// name -> STRING
	public int age;
	public String name;
	// 复杂类型，用户可通过 @DataTypeHint("Decimal(10, 2)") 指定字段类型
	public @DataTypeHint("Decimal(10, 2)") BigDecimal totalBalance;
}
```

## SQL

### DDL

参考文档：

* [CREATE TABLE](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/create/#create-table)

例如

```sql
CREATE TABLE IF NOT EXISTS source_table (
	`user_id` BIGINT,
	`name` STRING,
	`order_time` TIMESTAMP(3),
	`cost` AS price * quantity,  -- evaluate expression and supply the result to queries
	`record_time` TIMESTAMP_LTZ(3) METADATA FROM 'timestamp',    -- reads and writes a Kafka record's timestamp
	`timestamp` TIMESTAMP_LTZ(3) METADATA,    -- 如果和 metadata 中字段名一致，可不写 from xxx
	`partition` BIGINT METADATA,     -- part of the query-to-sink schema，即可读取也可写入
	`offset` BIGINT METADATA VIRTUAL, -- not part of the query-to-sink schema，只能读取不可写入
	`proctime` AS PROCTIME(),
	WATERMARK FOR order_time AS order_time - INTERVAL '5' SECOND,
	PRIMARY KEY (`partition`, `offset`) NOT ENFORCED
)
PARTITIONED BY (`partition`) 
WITH (
	'connector' = 'kafka'
	...
)
```

### CTAS、CDAS

参考链接：

* [Like](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/create/#like)
* [AS select_statement](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/create/#as-select_statement)
* [CTAS](https://help.aliyun.com/zh/flink/create-table-as-statement)
* [CDAS](https://help.aliyun.com/zh/flink/create-database-as-statement)

`CTAS` 支持实时同步数据及将上游表结构（Schema）变更同步至下游表，提升目标表创建与源表Schema变更的维护效率。

如将 mysql 表通过 flink-cdc 同步为 paimon，中规中矩的写法是先定义 source 表，在定义 sink 表，在 source 和 sink 表中同时定义字段信息，这种方式一个是在 source、sink 表中定义 2 遍字段类型，另外也无法在 source 发生 schema 变更时，无法同步至下游，需要同时修改 source 和 sink 表后在重新上线任务。

## 窗口

