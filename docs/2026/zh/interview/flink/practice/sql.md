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

参数：table_name 参数是表名，time_attr 参数是时间属性，时间属性列可以为处理时间或事件时间，size 参数用于定义窗口大小，offset 参数用于定义窗口的偏移量，offset 参数是可选参数

### 滑动窗口

`HOP(TABLE table_name,DESCRIPTOR(time_attr), slide, size [, offset])`，其中 table_name 参数是表名，time_attr 参数是时间属性列，时间属性列可以是处理时间或事件时间的时间属性列，slide参数用于定义窗口的滑动步长，size 参数用于定义滑动窗口大小，offset 参数用于定义窗口的偏移量

### 累计窗口

累计窗口表值函数的定义方式为 `CUMULATE(TABLE table_name,DESCRIPTOR(time_attr), step, size)`，其中 table_name 参数是表名，time_attr 参数是时间属性列，时间属性列可以是处理时间或事件时间的时间属性列，step 参数用于定义窗口的滑动步长，size 参数用于定义窗口大小。

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
  * [Flink SQL Join快速入门](https://help.aliyun.com/zh/flink/flink-sql-join-quickstart)

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

```sql
-- 使用 PROCTIME() 例子
CREATE TABLE show_log_table (
    log_id BIGINT,
    show_params STRING,
    proctime AS PROCTIME()
) WITH (
  'connector' = 'datagen',
  'rows-per-second' = '1',
  'fields.show_params.length' = '1',
  'fields.log_id.min' = '1',
  'fields.log_id.max' = '10'
);

CREATE TABLE click_log_table (
    log_id BIGINT,
    click_params STRING,
    proctime AS PROCTIME()
)
WITH (
  'connector' = 'datagen',
  'rows-per-second' = '1',
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
FROM show_log_table INNER JOIN click_log_table ON show_log_table.log_id = click_log_table.log_id
AND show_log_table.proctime BETWEEN click_log_table.proctime - INTERVAL '4' HOUR AND click_log_table.proctime;

-- 使用 event_time，watermark
CREATE TABLE show_log_table (
    log_id BIGINT,
    show_params STRING,
    row_time AS cast(CURRENT_TIMESTAMP as timestamp(3)),
    WATERMARK FOR row_time AS row_time
) WITH (
  'connector' = 'datagen',
  'rows-per-second' = '1',
  'fields.show_params.length' = '1',
  'fields.log_id.min' = '1',
  'fields.log_id.max' = '10'
);

CREATE TABLE click_log_table (
    log_id BIGINT,
    click_params STRING,
    row_time AS cast(CURRENT_TIMESTAMP as timestamp(3)),
    WATERMARK FOR row_time AS row_time
)
WITH (
  'connector' = 'datagen',
  'rows-per-second' = '1',
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
FROM show_log_table INNER JOIN click_log_table ON show_log_table.log_id = click_log_table.log_id
AND show_log_table.row_time BETWEEN click_log_table.row_time - INTERVAL '4' HOUR AND click_log_table.row_time;
```

#### Lookup Join

维表关联

```sql
-- 维表关联。维表只能用 PROCTIME() 查询。
CREATE TABLE show_log (
    log_id BIGINT,
    `timestamp` as cast(CURRENT_TIMESTAMP as timestamp(3)),
    user_id STRING,
    proctime AS PROCTIME()
)
WITH (
  'connector' = 'datagen',
  'rows-per-second' = '10000000',
  'fields.user_id.length' = '1',
  'fields.log_id.min' = '1',
  'fields.log_id.max' = '10'
);

CREATE TABLE user_profile (
    user_id STRING,
    age STRING,
    sex STRING
    ) WITH (
  'connector' = 'redis',
  'hostname' = '127.0.0.1',
  'port' = '6379',
  'format' = 'json',
  'lookup.cache.max-rows' = '500',
  'lookup.cache.ttl' = '3600',
  'lookup.max-retries' = '1'
);

CREATE TABLE sink_table (
    log_id BIGINT,
    `timestamp` TIMESTAMP(3),
    user_id STRING,
    proctime TIMESTAMP(3),
    age STRING,
    sex STRING
) WITH (
  'connector' = 'print'
);

INSERT INTO sink_table
SELECT 
    s.log_id as log_id
    , s.`timestamp` as `timestamp`
    , s.user_id as user_id
    , s.proctime as proctime
    , u.sex as sex
    , u.age as age
FROM show_log AS s
LEFT JOIN user_profile FOR SYSTEM_TIME AS OF s.proctime AS u
ON s.user_id = u.user_id
```

#### Temporal Join

Lookup Join 即是基于 Temporal Join。

## 列转行

参考文档：

* [Array, Multiset and Map Expansion](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/joins/#array-multiset-and-map-expansion)
* [Table Function](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/table/sql/queries/joins/#table-function)。需配合 UDTF
* [FlinkSQL实现行转列](https://blog.csdn.net/liuwei0376/article/details/125038130)

## DataStream API 和 Table API

二者互转，DataStream 如何转化为 Table? Table 如何转化为 DataStream？

`TableEnvironment` 是 Table API 和 SQL API 的执行环境，`TableEnvironment` 在 Table API 和 SQL API 中的地位和 `StreamExecutionEnvironment` 在 DataStream API 中的地位是相同的，`TableEnvironment` 可以给 Table API 和 SQL API 作业提供上下文环境信息以及各种接口，比如管理表、用户自定义函数等元数据信息，并提供 SQL 查询和 SQL 执行的能力。

`TableEnvironment` 是一个接口，有两个实现类：

* `TableEnvironmentImpl`。只使用 Table API 和 SQL API
* `StreamTableEnvironmentImpl`。混合使用 Table API、SQL API 和 DataStream API

```java
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.TableEnvironment;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;

public class Test {

    public static void main(String[] args) {
        ParameterTool parameterTool = ParameterTool.fromArgs(args);
        Configuration configuration = Configuration.fromMap(parameterTool.toMap());
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment(configuration);
        env.getConfig().setGlobalJobParameters(parameterTool);

        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
      
        TableEnvironment tableEnv = TableEnvironment.create(settings);
        // StreamTableEnvironment streamTableEnv = StreamTableEnvironment.create(env, settings);
    }
}
```

`TableEnvironment` 提供元数据管理的功能：

* catalog 管理。Flink 默认的 catalog 和 database 分别为 `default_catalog` 和 `default_database`。
* database 管理。
* table 管理。table 包含 table 和 view，其中 table 和 view 还分为 temporal 和永久 2 种。
* function 管理。包含用户自定义函数和内置函数。
* module 管理。module 用于管理用户自定义函数。Flink 提供了 `HiveModule`，从而支持在 Flink 中运行 `Hive SQL`。

`TableEnvironment` 可以执行 SQL API，参考：[SqlRunner.java](https://github.com/apache/flink-kubernetes-operator/blob/main/examples/flink-sql-runner-example/src/main/java/org/apache/flink/examples/SqlRunner.java)

```java
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.*;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;

public class Test {

    public static void main(String[] args) {
        ParameterTool parameterTool = ParameterTool.fromArgs(args);
        Configuration configuration = Configuration.fromMap(parameterTool.toMap());
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment(configuration);
        env.getConfig().setGlobalJobParameters(parameterTool);

        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        TableEnvironment tableEnv = TableEnvironment.create(settings);

        StreamTableEnvironment streamTableEnv = StreamTableEnvironment.create(env, settings);

        // 执行 DQL，返回结果流
        Table table = tableEnv.sqlQuery("select xxx from xxxx");
        // 调用 Table 的 #execute() 方法：该方法会自动生成一个 CollectSinkFunction
        // CollectSinkFunction 可以将查询结果返回提交作业的客户端
        TableResult executeResult = table.execute();
        // 将当前表的结果插入目标表，方法入参为目标表
        TableResult executeInsertResult = table.executeInsert("sink_table");
        // 执行 DDL、DML、DQL、DCL
        // 如果 SQL 语句是 DML 或 DQL，作业提交之后就会运行起来，比如 INSERT INTO…SELECT…FROM…WHERE…
        // 如果 SQL 语句是 DDL 或 DCL，那么在语句执行完成之后，就会直接返回结果并退出程序，比如 CREATE TABLE…
        TableResult executeSqlResult = tableEnv.executeSql("xxx");

        // StatementSet 用于运行多段 SQL 逻辑，只有调用 #execute() 方法才会执行
        StatementSet statementSet = tableEnv.createStatementSet();
        TableResult statementSetResult = statementSet
                .addInsertSql("INSERT INTO xxx SELECT xxx FROM xxxx")
                .addInsertSql("INSERT INTO xxx SELECT xxx FROM xxxx")
                .addInsertSql("INSERT INTO xxx SELECT xxx FROM xxxx")
                .execute();
    }
```

### Table API 和 SQL API 原理

参考链接：

* [Determinism In Continuous Queries](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/concepts/determinism/)
* [Dynamic Tables](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/table/concepts/dynamic_tables/)

Flink 能实现 SQL 流处理的原理有 2 个：

* 流表二象性。参考：[Flink架构浅析：流表二象性](https://juejin.cn/post/7439594533002444838)
* 动态表。如何将无界流转化为表，动态表如何通过 
* 连续查询。对动态表的查询会产生一个连续查询，连续查询永不停止，输出一个动态表。连续查询的核心是将表的更新映射为更新日志流

Flink 实现过程如下：

![stream-query-stream](https://nightlies.apache.org/flink/flink-docs-release-1.20/fig/table-streaming/stream-query-stream.png)

* 读取源数据，将无界流转化为动态表。源数据中的每条数据都会被转化为一条 `INSERT` 类型的 changelog
* 在动态表执行连续查询。相比于批处理，连续查询不会终止，只要输入表更新，就会输出新的结算结果。
* 连续查询输出的结果为动态表
* 将动态表转化为无界流，写入外部存储。Flink 会将动态表翻译成无界流，Flink 支持 3 种方式：
  * Append-Only。动态表只有 `INSERT` 类型数据
  * Retract。retract 流有 2 种消息：Add 和 Retract（回撤）。`INSERT` 转化为 Add 消息，`DELETE` 转化为 Retract 消息，`UPDATE` 转化为一条 Retract 消息和一条 Add 消息，通过 Retract 消息将旧结果删除，通过 Add 消息写入新的结果
    * Add 消息前缀为 `+`，Retract 消息前缀为 `-`。
  * Upsert。upsert 流有 2 种消息：Upsert 和 Delete。执行 Upsert 操作依赖主键，因此动态表必须有主键。`INSERT` 和 `UPDATE` 转化为 Upsert 消息，`DELETE` 转化为 Delete 消息
    * Upsert 消息前缀为 `*`，Delete 消息前缀为 `-`。

动态表可以编码为 Append-only 流、Retract 流和 Upsert 流，而 Table API 和 SQL API 中的 Table 对象与 DataStream API 的 DataStream 对象之间的转换就是动态表到数据流的转换。

### Table API、SQL API 和 DataStream API 转换

`StreamTableEnvironment` 支持 Table API 和 SQL API 与 DataStream API 的集成，`TableEnvironment` 不支持。

```java
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.*;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.apache.flink.types.Row;
import org.apache.flink.types.RowKind;

public class Test {

    public static void main(String[] args) {
        ParameterTool parameterTool = ParameterTool.fromArgs(args);
        Configuration configuration = Configuration.fromMap(parameterTool.toMap());
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment(configuration);
        env.getConfig().setGlobalJobParameters(parameterTool);

        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        StreamTableEnvironment streamTableEnv = StreamTableEnvironment.create(env, settings);

        DataStreamSource<Row> dataStream = env.fromData(
                Row.ofKind(RowKind.INSERT, "商品1", 12),
                Row.ofKind(RowKind.INSERT, "商品2", 7),
                Row.ofKind(RowKind.UPDATE_BEFORE, "商品1", 12),
                Row.ofKind(RowKind.UPDATE_AFTER, "商品1", 66)
                );
        Table table = streamTableEnv.fromChangelogStream(dataStream);
        streamTableEnv.createTemporaryView("source_table", table);

        streamTableEnv.executeSql("""
                SELECT 
                    f0 AS pid,
                    SUM(f1) AS all
                FROM source_table
                GROUP BY f0
                """).print();
    }
}
```

`StreamTableEnvironment` 提供了 6 个方法用于转换：

* `StreamTableEnvironment#fromChangelogStream(DataStream<Row> dataStream)`。DataStream 的 StreamRecord 数据中保存了事件时间戳，转换为 Table 对象后，事件时间戳将会被丢弃。当 DataStream 对象转换为 Table 对象后，Watermark 不会在 DataStream API 和 Table API 之间的算子间传输。
* `StreamTableEnvironment#fromChangelogStream(DataStream<Row> dataStream, Schema schema)`。可以通过 Schema 为转换得到的表重新指定时间属性、Watermark 生成策略、主键。
* `StreamTableEnvironment#fromChangelogStream(DataStream<Row> dataStream, Schema schema, ChangelogMode changelogMode)`。入参 `ChangelogMode` 允许指定转换得到的表对应的更新日志流的类型
* `StreamTableEnvironment#toChangelogStream(Table table)`。入参 Table 包含事件时间列，那么转换为 DataStream 后，数据的事件时间将会保存在 StreamRecord 的 timestamp 字段中。同时，Watermark 也会在 Table API 和 DataStream API 的算子间正常传播。
* `StreamTableEnvironment#toChangelogStream(Table table, Schema targetSchema)`。通过入参 Schema，我们可以将 Table 中数据的事件时间作为一个元数据的列写出，从而将 Table 中数据的事件时间保留下来。
* `StreamTableEnvironment#toChangelogStream(Table table, Schema targetSchema, ChangelogMode changelogMode)`。入参 `ChangelogMode` 允许将表按照指定的更新模式转换为数据类型为 Row 的 DataStream

