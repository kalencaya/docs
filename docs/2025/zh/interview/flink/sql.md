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

参考文档：

* [Windowing table-valued functions (Windowing TVFs)](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/window-tvf/)
* [窗口函数](https://help.aliyun.com/zh/flink/window-functions-1)

### 滚动窗口

语法：`TUMBLE(TABLE table_name,DESCRIPTOR(time_attr), size [, offset])`

参数：table_name参数是表名，time_attr参数是时间属性，时间属性列可以为处理时间或事件时间，size参数用于定义窗口大小，offset参数用于定义窗口的偏移量，offset参数是可选参数

### 滑动窗口

HOP(TABLE table_name,DESCRIPTOR(time_attr), slide, size [, offset])，其中table_name参数是表名，time_attr参数是时间属性列，时间属性列可以是处理时间或事件时间的时间属性列，slide参数用于定义窗口的滑动步长，size参数用于定义滑动窗口大小，offset参数用于定义窗口的偏移量

### 累计窗口

累计窗口表值函数的定义方式为CUMULATE(TABLE table_name,DESCRIPTOR(time_attr), step, size)，其中table_name参数是表名，time_attr参数是时间属性列，时间属性列可以是处理时间或事件时间的时间属性列，step参数用于定义窗口的滑动步长，size参数用于定义窗口大小。

## Join

参考文档：

* DataStream
* [Joining](https://nightlies.apache.org/flink/flink-docs-release-2.1/docs/dev/datastream/operators/joining/)
* SQL
  * [Joins](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/joins/)
  * [Window Join](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/window-join/)
  * [双流JOIN语句](https://help.aliyun.com/zh/flink/dual-stream-join-statements)
  * [Interval Join语句](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/intervaljoin-statement)
  * [维表JOIN语句](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/join-statements-for-dimension-tables)
  * [Processing Time Temporal Join语句](https://help.aliyun.com/zh/flink/processing-time-temporal-join-statement)。paimon 支持

### DataStream



#### Regular Join



#### Window Join

#### Interval Join

### SQL

#### Regular Join

常规关联(Regular Join)，包括 Inner Join、Left Join、Right Join、Full Join等

```sql
-- INNER JOIN 案例

CREATE TABLE show_log_table (
    log_id BIGINT,
    show_params STRING
) WITH (
  'connector' = 'datagen',
  'rows-per-second' = '2',
  'fields.show_params.length' = '1',
  'fields.log_id.min' = '1',
  'fields.log_id.max' = '10'
);

CREATE TABLE click_log_table (
  log_id BIGINT,
  click_params     STRING
)
WITH (
  'connector' = 'datagen',
  'rows-per-second' = '2',
  'fields.click_params.length' = '1',
  'fields.log_id.min' = '1',
  'fields.log_id.max' = '10'
);

CREATE TABLE sink_table (
    s_id BIGINT,
    s_params STRING,
    c_id BIGINT,
    c_params STRING
) WITH (
  'connector' = 'print'
);

INSERT INTO sink_table
SELECT
    show_log_table.log_id as s_id,
    show_log_table.show_params as s_params,
    click_log_table.log_id as c_id,
    click_log_table.click_params as c_params
FROM show_log_table
INNER JOIN click_log_table ON show_log_table.log_id = click_log_table.log_id;

-- Inner Join、Left Join、Right Join、Full Join 案例
SELECT *
FROM Orders
LEFT JOIN Product
ON Orders.product_id = Product.id

SELECT *
FROM Orders
RIGHT JOIN Product
ON Orders.product_id = Product.id

SELECT *
FROM Orders
FULL OUTER JOIN Product
ON Orders.product_id = Product.id
```

假设 `JOIN…ON…` 子句中 `ON` 的条件为 `=` 条件，相同 key 下：

* 当左表收到一条数据 L 时，会和右表中的**所有数据**（数据保存在右表的状态中）进行遍历关联，将关联到的所有数据输出+I[L, R]。如果**没有关联到，则不会输出数据**。
  * 之后也会将 L 保存到左表的状态中，以供后续执行关联操作时使用
* 右表收到一条数据R，执行过程和上述流程相同，只不过左右表互换。

在 Inner Join 条件下，必须左右表同时有数据关联到，才会输出结果，这里的特性和关系型数据库是保持一致，对应的 Left Join 和 Right Join 就是分别能确保在无法关联到另一张表时依然输出数据，Full Join 则是为了确保左右两表都可以在无法关联到另一张表时左右两表数据都可以输出。效果也都和关系型数据库一致。

注意事项：

1. 常规关联的输入数据流不但可以是 Append-only 流，也可以是 Retract 流。当 Inner Join 的输入数据流为 Append-only时，经过 Inner Join 处理后的输出数据流也为 Append-only 流，因此我们可以在输出的 Append-only 流上执行时间窗口计算。除此之外的场景中，输出的数据流都为 Retract 流。
2. 常规关联是在无界流上进行处理的，在做关联操作时，左流中的每一条数据都会按照关联条件去关联右流中的所有数据。如果要实现这样的逻辑，StreamingJoinOperator 就会将两条流的所有数据都存储在键值状态中，因此如果不加干预，Flink 作业中的状态会随着表中数据的增多而逐渐增大，最终导致作业出现性能问题或者异常失败。建议读者为键值状态配置合适的状态保留时长，从而将过期的状态数据删除，避免作业出现性能问题
   1. 配置项：`table.exec.state.ttl` 
   2. SQL Hints。参考：[State TTL Hints](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/hints/#state-ttl-hints)

#### Window Join

时间窗口关联除了支持 Inner Join、Left Join、Right Join、Full Join，还支持 Semi Join（IN、EXISTS）、Anti Join（NOT IN、NOT EXISTS）。

```sql
CREATE TABLE show_log_table (
	product_id STRING,
	unique_id BIGINT,
	event_time BIGINT,
	row_time AS TO_TIMESTAMP_LTZ(event_time, 3),
	WATERMARK FOR row_time AS row_time - INTERVAL '5' SECONDS
) WITH (
	'connector' = 'kafka',
	...
);

CREATE TABLE click_log_table (
	product_id STRING,
	unique_id BIGINT,
	event_time BIGINT,
	row_time AS TO_TIMESTAMP_LTZ(event_time, 3),
	WATERMARK FOR row_time AS row_time - INTERVAL '5' SECONDS
) WITH (
	'connector' = 'kafka',
	...
);

-- INNER JOIN
SELECT 
	show_table.unique_id AS unique_id,
	show_table.product_id AS product_id,
	show_table.event_time AS event_time,
	click_table.event_time AS click_event_time
FROM 
(
	SELECT * 
	FROM TABLE(TUMBLE(TABLE show_log_table, DESCRIPTOR(row_time), INTERVAL '1' MINUTES))
) show_table
INNER JOIN 
(
	SELECT * 
	FROM TABLE(TUMBLE(TABLE click_log_table, DESCRIPTOR(row_time), INTERVAL '1' MINUTES))
) click_table
ON show_table.unique_id = click_table.unique_id
AND show_table.window_start = click_table.window_start
AND show_table.window_end = click_table.window_end;

-- SEMI JOIN，也可用 EXISTS
SELECT 
	show_table.unique_id AS unique_id,
	show_table.product_id AS product_id,
	show_table.event_time AS event_time
FROM 
(
	SELECT * 
	FROM TABLE(TUMBLE(TABLE show_log_table, DESCRIPTOR(row_time), INTERVAL '1' MINUTES))
) show_table
WHERE
	show_table.product_id IN (
			SELECT * FROM (
					SELECT * 
					FROM TABLE(TUMBLE(TABLE click_log_table, DESCRIPTOR(row_time), INTERVAL '1' MINUTES))
				) click_table
			WHERE
				show_table.window_start = click_table.window_start
				AND show_table.window_end = click_table.window_end
		);
-- ANTI JOIN，也可用 NOT EXISTS
```

#### Interval Join

时间区间关联意义：

* 常规关联问题：由于输出结果是 Retract 流，因此要计算得到正确的结果，下游作业就要有一套 Retract 流的处理机制，这会极大增大链路的复杂性。
* 时间窗口关联问题：时间窗口计算只能处理固定窗口的问题，对于处于时间窗口边界的问题无法处理。在埋点案例中，点击在曝光之后发生，点击流天然会比曝光流晚一些到达，时间窗口只能处理固定窗口，如曝光流在 `2024-11-01 01:00:59` 到达，被归入窗口 `2024-11-01 01:00:00 ~ 2024-11-01 01:01:00` 窗口，而曝光流在 `2024-11-01 01:01:01` 到达，被归入窗口 `2024-11-01 01:01:00 ~ 2024-11-01 01:02:00` 窗口，因此在时间窗口边界的数据是无法正常关联的。

在埋点案例中，期望曝光流和点击流的关联不是按照固定窗口，而是曝光流数据到达后的 1 分钟内，如曝光数据在 `2024-11-01 01:00:59` 到达，那么点击数据在 `2024-11-01 01:00:59 ~ 2024-11-01 01:01:59` 内到达都可以关联上。

时间区间关联支持 Inner Interval Join、Left  Interval Join、Right Interval Join 和 Full Interval Join。



#### Lookup Join

