# DataStream 和 SQL 互转

在 flink 开发中，提供了 3 层 API 供使用：

![levels_of_abstraction](https://nightlies.apache.org/flink/flink-docs-release-1.20/fig/levels_of_abstraction.svg)

在 API 层级中 `SQL/Table` 和 `DataStream` API 都是基于 `Stateful Stream Processing` API，但是二者使用的方式并不同：

* `Stateful Stream Processing` 通过 `DataStream` API 中的 `ProcessFunction` 嵌入到 `DataStream` API 中。
* `SQL/Table` API 在编译阶段生成 `JobGraph`，在通过 `JobGraph` 通过代码生成来生成底层的 `Operator`，底层的 `Operator` 利用 `ProcessFunction`。

因此 `SQL/Table` 和 `DataStream` 之间是缺乏复用的，导致两种 API 能力未能对齐，比如：

* Interval Join。`DataStream` 只支持 inner join，不支持 left join，而 `SQL/Table` 同时支持 inner join 和 left join
* Lookup Join。在关联维表时常关注的 3 个点为：cache、retry、同步 or 异步。
  * `DataStream` 可以在不同的算子中完成关联维表操作，`filter`、`map` 和 `flatmap`，还有专门的 `AsyncIO` 来实现异步加载维表，但是需要用户自己按需添加 cache 和 retry 功能。
  * `SQL/Table` 大部分 connector 都提供了 Lookup Join 功能，且为 Lookup Join 功能提供了 cache 和 retry 功能，但是多以同步为主，只有部分实现了异步如 [hbase](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/table/hbase/)、[paimon](https://paimon.apache.org/docs/1.3/flink/sql-lookup/)、[doris](https://doris.apache.org/zh-CN/docs/3.x/ecosystem/flink-doris-connector#lookup-join)，如 jdbc 不支持异步。另外如 paimon API 不适合用 `DataStream` API 开发维表 join 功能。

因此在使用 `DataStream` API 编程的时候，遇到 API 或 connector 支持力度不如 `SQL/Table`，可以通过 `DataStream` -> `Table` -> `SQL` -> `Table` -> `DataStream` 的方式巧妙利用 API 或 connector 的 `SQL/Table` 能力。

## 注意事项

* watermark。在 `DataStream` -> `Table` 或 `Table` -> `DataStream` 转换过程中，是不能转换 watermark 信息的。需添加 `Schema` 参数，在 `Schema` 中指定 watermark 完成转换
* 定义 bean 不推荐使用 `primitive types` 如不推荐使用 `int` 而使用 `Integer`。在 `Table` -> `DataStream` 转换时，`int` 类型默认为 `NOT NULL`，而 `Integer` 除非显示在 `Schema` 中声明为 `NOT NULL`，一般认为是允许为 `NULL`
* 字段类型和数量相同。在 `Table` -> `DataStream` 转换时，使用 bean 接收 `Table` 中的数据时，需注意 bean 中的字段数量和 `Table` 中的字段数据量一致且类型一致
* 序列化器。`Table` -> `DataStream` 转换和 `DataStream` -> `DataStream` 转换会使用不同的序列化器，导致同样是两个 `DataStream<Event>` 类型的流无法通过 `union()` 方法连接在一起。解决方式是对 `Table` -> `DataStream` 得出的结果执行 `DataStream<Event>.map(record -> record).returns(TypeInformation.of(Event.class))`。

## 实操案例

### Left Interval Join

```java
package com.pxb7.mall.realtime.dw.job.inspection.demo;

import com.pxb7.mall.realtime.dw.base.util.ParameterToolUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;

import java.util.Arrays;
import java.util.Date;

public class TableDataStreamDemoJob {

    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        ParameterTool parameterTool = ParameterToolUtil.createParameterTool(args);
        env.getConfig().setGlobalJobParameters(parameterTool);

        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        StreamTableEnvironment streamTableEnv = StreamTableEnvironment.create(env, settings);

        SingleOutputStreamOperator<Order> leftStream = getLeftStream(env);
        SingleOutputStreamOperator<Refund> rightStream = getRightStream(env);


        Schema leftSchema = Schema.newBuilder()
                .column("id", DataTypes.INT())
                .column("userId", DataTypes.INT())
                .column("name", DataTypes.STRING())
                .column("timestampLong", DataTypes.BIGINT())
                .columnByExpression("order_time", "TO_TIMESTAMP_LTZ(timestampLong, 3)")
                .watermark("order_time", "order_time - INTERVAL '5' SECOND")
                .build();

        Schema rightSchema = Schema.newBuilder()
                .column("id", DataTypes.INT())
                .column("orderId", DataTypes.INT())
                .column("timestampLong", DataTypes.BIGINT())
                .columnByExpression("refund_time", "TO_TIMESTAMP_LTZ(timestampLong, 3)")
                .watermark("refund_time", "refund_time - INTERVAL '5' SECOND")
                .build();

        streamTableEnv.createTemporaryView("orders", leftStream, leftSchema);
        streamTableEnv.createTemporaryView("refunds", rightStream, rightSchema);

        String leftIntervalJoin = """
                SELECT
                    orders.id as order_id,
                    orders.userId as user_id,
                    orders.name as name,
                    DATE_FORMAT(order_time, 'yyyy-MM-dd HH:mm:ss') as order_time_str,
                    refunds.id as refund_id,
                    DATE_FORMAT(refund_time, 'yyyy-MM-dd HH:mm:ss') as refund_time_str
                FROM orders LEFT JOIN refunds ON orders.id = refunds.orderId
                AND orders.order_time BETWEEN refunds.refund_time - INTERVAL '1' MINUTE AND refunds.refund_time;
                """;

        Table table = streamTableEnv.sqlQuery(leftIntervalJoin);

        DataStream<OrderWithRefund> dataStream = streamTableEnv.toDataStream(table, OrderWithRefund.class);
        dataStream.print();

        env.execute();
    }

    private static SingleOutputStreamOperator<Order> getLeftStream(StreamExecutionEnvironment env) {
        // 必须设置 watermark
        return env.fromCollection(
                        Arrays.asList(
                                new Order(1, 1, "ken", 1662022777000L), // 2022-09-01 16:59:37
                                new Order(2, 1, "ken", 1662022878000L), // 2022-09-01 17:01:18
                                new Order(3, 1, "ken", 1662022890000L), // 2022-09-01 17:01:30
                                new Order(4, 1, "ken", 1662023120000L), // 2022-09-01 17:05:20
                                new Order(5, 1, "ken", 1662023290000L)  // 2022-09-01 17:08:10
                        )
                )
                .assignTimestampsAndWatermarks(WatermarkStrategy.
                        <Order>forMonotonousTimestamps().withTimestampAssigner((event, ts) -> event.getTimestampLong()));
    }

    private static SingleOutputStreamOperator<Refund> getRightStream(StreamExecutionEnvironment env) {
        // 必须设置 watermark
        return env.fromCollection(
                        Arrays.asList(
                                new Refund(1, 1, 1662022781000L), // 2022-09-01 16:59:41
                                new Refund(2, 3, 1662023310000L), // 2022-09-01 17:08:30
                                new Refund(3, 4, 1662023321000L)  // 2022-09-01 17:08:41
                        )
                )
                .assignTimestampsAndWatermarks(WatermarkStrategy.
                        <Refund>forMonotonousTimestamps().withTimestampAssigner((event, ts) -> event.getTimestampLong()));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderWithRefund {
        // 这里不能用 int 类型，因为 int 类型为 not null，而 Integer 则可以为 null
        private Integer order_id;
        private Integer user_id;
        private String name;
        private String order_time_str;
        private Integer refund_id;
        private String refund_time_str;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Order {
        private int id;
        private int userId;
        private String name;
        private long timestampLong;

        @Override
        public String toString() {
            return "Order{" +
                    "id=" + id +
                    ", timestamp=" + DateFormatUtils.format(new Date(timestampLong), "yyyy-MM-dd HH:mm:ss") +
                    '}';
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Refund {
        private int id;
        private int orderId;
        private long timestampLong;

        @Override
        public String toString() {
            return "Refund{" +
                    "id=" + id +
                    ", orderId=" + orderId +
                    ", timestamp=" + DateFormatUtils.format(new Date(timestampLong), "yyyy-MM-dd HH:mm:ss") +
                    '}';
        }
    }

}
```

