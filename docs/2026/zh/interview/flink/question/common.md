# 通用

## 1.flink 慢要怎么处理？

* 及时发现。如何及时发现 flink 慢
  * source 延迟。如消费 kafka topic，可以从 kafka 收到告警消费延迟，或者 flink 任务自己有监控 source 延迟
  * 反压。某个算子出现反压情况
* 问题原因
  * source 端。检查上游数据源和 source 并行度。
    * 如读取 kafka topic 时，需确保 topic partition 设置合理，因为 flink source 最大并行度即为 kafka partition 数目，kafka topic partition 过小，并行度上不来消费慢。随着业务流量增长，kafka topic partition 数量也需及时调整。
    * 检查 source 并行度，查看是否并行度过小，消费不过来。
    * 检测 source 数据源集群情况，CPU、网络、磁盘IO 等，是否能支持消费
  * sink 端。检测下游数据源、sink 并行度和 sink 配置
    * 检测下游数据源集群情况，如 mysql，查看 CPU、网络、磁盘IO 是否。
    * 检测 sink 端并行度，查看是否并行度过小，消费不过来。
    * 检测 sink 端配置参数。如 jdbc 配置，每满 1000 条或到达 10s 批量执行一次。
  * 中间端。
    * 维表 join。是否维表关联慢，使用 redis 或 guava 缓存优化维表关联，或启用
    * 多流 join。
    * redis 慢。为了确保 flink 任务重启后一些数据不丢，将一些数据存储到了 redis 中，在流量比较大的时候，redis 的访问成为性能瓶颈
    * checkpoint 慢。checkpoint 耗时长，超过 timeout 配置，一直失败
    * 数据倾斜。个别 subTask 处理慢。
    * window 窗口慢。窗口不触发。
  * 任务在报错，反复重启，已经宕机
* 解决办法

## 2.POJO 的序列化异常

### 泛型问题

在使用 Java 开发代码中，经常会使用`泛型`，JVM 在编译 Java 代码时会丢掉泛型信息，导致序列化时出现异常。如 Jackson 在序列化一段 json 为`List<Map<String, User>>`类型时，往往需要在序列化时提供泛型信息以正确序列化：

```Java
String json = "";
List<Map<String, User>> list = JacksonUtil.parseJsonArray(json, new TypeReference<Map<String, User>>() {});
```

在 flink 中数据在不同计算节点之间传输时也需要经历序列化和反序列化，如果是普通的 POJO，flink 可以通过类型推导正确地推导出类型信息，继而序列化。如果不能推导或者推导错误，需要用户添加类型信息辅助 flink 识别具体的类型进行序列化和反序列化。

本次问题就是一起 flink 看似正确推导类型信息，实则没有正确推导的问题：

```Java
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class KafkaRecord<K, V> {

    private K key;
    private V value;
    private String topic;
    private long timestamp;
    private int partition;
    private long offset;
}

import lombok.Data;
import org.apache.flink.api.common.typeinfo.TypeHint;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.core.type.TypeReference;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;

import java.io.Serializable;
import java.lang.reflect.Type;
import java.util.Map;

public class KryoDemoJob {

    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        ParameterTool parameterTool = ParameterToolUtil.createParameterTool(args);
        env.getConfig().setGlobalJobParameters(parameterTool);
        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        StreamTableEnvironment streamTableEnv = StreamTableEnvironment.create(env, settings);

        Dog value = new Dog();
        // 中文会报错，英文不会报错
//        value.setName("english-name");
        value.setName("中文的名字");
        // 不作为范型不会犯错
        env.fromElements(value).print();

        /**
         * 报错：序列化异常。
         * 目前已知：中文会报错，英文不会报错。作为范型会报错，不作为范型不会犯错
         */
        KafkaRecord<String, Dog> kafkaRecord = new KafkaRecord<String, Dog>()
                .setTopic("topic")
                .setPartition(0)
                .setOffset(1L)
                .setTimestamp(System.currentTimeMillis())
                .setValue(value);
        // 作为范型会报错
        env.fromElements(kafkaRecord).print();

        env.execute();
    }

    @Data
    public static class Dog implements Serializable {
        private static final long serialVersionUID = 1L;

        private String name;
    }
}
```

在上述代码中，写了一个极简的 flink 任务，读取一个对象作为输入，输出到控制台打印。对象类型也极简，只有一个`String`类型的字段`name`。

问题主要出在泛型`KafkaRecord<String, Dog>`：

- 当`name`赋值为包含中文的字符串如`这是一个中文名`就会出现序列化异常，当`name`赋值为纯数字和英文字母之类的字符串如`my english name`不会报错。

问题发生的原因未知，没确定为啥会这么诡异。解决方式是通过`returns()`方法为 flink 提供具体的类型信息，即可正常序列化：

```Java
env.fromElements(kafkaRecord).returns(new TypeHint<KafkaRecord<String, Dog>>() {}).print();
```

### POJO 识别

待定，换个项目，在测试一下

影响 POJO 识别的几个因素：

- 继承中出现同名字段
- List 或 Map 不能正确识别。List 需换成 Array，Map 待定

POJO 判定标准。实现类：`org.apache.flink.api.java.typeutils.TypeExtractor.analyzePojo()`

- Public 类，不能是内部类
- 无参构造器
- 标准的 getter/setter
  - Lombok 和 IDEA 生成的 getter/setter 的区别问题。pType 问题，isUp 问题
- Flink 可以识别的类型
  - List、Map
  - LocalDateTime

另外注意为每个 POJO 添加 `Serializable` 接口，防止

### 序列化接口 Serializable

#### 排查方式

查看 `DataStream`中的类型信息。

POJO 会提取出`PojoTypeInfo`，并用`PojoSerializer`序列化(使用`Kryo`作为可配置的回退)。

例外情况是pojo实际上是`Avro`类型(`Avro`特定记录)或产生为“Avro反射类型”。在这种情况下，POJO由`AvroTypeInfo`表示，并用`AvroSerializer`序列化

Flink 无法翻译的类型，返回 `GenericTypeInfo`，并使用 Kryo 序列化

#### 序列化触发的场景

- Shuffer
- State
