# Flink 类型——序列化

Flink 定义了序列化接口描述数据类型是如何序列化的，Flink 运行时通过 `TypeSerializer` 接口处理序列化。

`TypeSerializer` 不仅定义了序列化和反序列化方法，还提供了 clone 方法。序列化存在前后兼容的问题，Flink 提供了 `TypeSerializerSnapshot` 接口解决 checkpoint 和 savepoint 的序列化 schema 兼容问题。

```java
public abstract class TypeSerializer<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Gets whether the type is an immutable type.
     */
    public abstract boolean isImmutableType();

    /**
     * Creates a deep copy of this serializer if it is necessary, i.e. if it is stateful. This can
     * return itself if the serializer is not stateful.
     *
     * <p>We need this because Serializers might be used in several threads. Stateless serializers
     * are inherently thread-safe while stateful serializers might not be thread-safe.
     */
    public abstract TypeSerializer<T> duplicate();

    /**
     * Creates a new instance of the data type.
     *
     * @return A new instance of the data type.
     */
    public abstract T createInstance();

    /**
     * Creates a deep copy of the given element in a new element.
     */
    public abstract T copy(T from);

    /**
     * Creates a copy from the given element. The method makes an attempt to store the copy in the
     * given reuse element, if the type is mutable. This is, however, not guaranteed.
     */
    public abstract T copy(T from, T reuse);

    /**
     * Gets the length of the data type, if it is a fix length data type.
     */
    public abstract int getLength();

    /**
     * Serializes the given record to the given target output view.
     */
    public abstract void serialize(T record, DataOutputView target) throws IOException;

    /**
     * De-serializes a record from the given source input view.
     */
    public abstract T deserialize(DataInputView source) throws IOException;

    /**
     * De-serializes a record from the given source input view into the given reuse record instance
     * if mutable.
     */
    public abstract T deserialize(T reuse, DataInputView source) throws IOException;

    /**
     * Copies exactly one record from the source input view to the target output view. Whether this
     * operation works on binary data or partially de-serializes the record to determine its length
     * (such as for records of variable length) is up to the implementer. Binary copies are
     * typically faster. A copy of a record containing two integer numbers (8 bytes total) is most
     * efficiently implemented as {@code target.write(source, 8);}.
     */
    public abstract void copy(DataInputView source, DataOutputView target) throws IOException;

    public abstract boolean equals(Object obj);

    public abstract int hashCode();

    /**
     * Snapshots the configuration of this TypeSerializer. This method is only relevant if the
     * serializer is used to state stored in checkpoints/savepoints.
     *
     * <p>The snapshot of the TypeSerializer is supposed to contain all information that affects the
     * serialization format of the serializer. The snapshot serves two purposes: First, to reproduce
     * the serializer when the checkpoint/savepoint is restored, and second, to check whether the
     * serialization format is compatible with the serializer used in the restored program.
     *
     * <p><b>IMPORTANT:</b> TypeSerializerSnapshots changed after Flink 1.6. Serializers implemented
     * against Flink versions up to 1.6 should still work, but adjust to new model to enable state
     * evolution and be future-proof. See the class-level comments, section "Upgrading
     * TypeSerializers to the new TypeSerializerSnapshot model" for details.
     */
    public abstract TypeSerializerSnapshot<T> snapshotConfiguration();
}
```

## 基本类型

Flink 提供了基本类型和对应的 Value 类型的序列化实现。

* `BooleanSerializer` 和 `BooleanValueSerializer`，处理 `boolean` 和 `BooleanValue`。
* `ByteSerializer` 和 `ByteValueSerializer`，处理 `byte` 和 `ByteValue`。
* `CharSerializer` 和 `CharValueSerializer`，处理 `char` 和 `CharValue`。
* `ShortSerializer` 和 `ShortValueSerializer`，处理 `short` 和 `ShortValue`。
* `IntSerializer` 和 `IntValueSerializer`，处理 `int` 和 `IntValue`。
* `LongSerializer` 和 `LongValueSerializer`，处理 `long` 和 `LongValue`。
* `FloatSerializer` 和 `FloatValueSerializer`，处理 `float` 和 `FloatValue`。
* `DoubleSerializer` 和 `DoubleValueSerializer`，处理 `double` 和 `DoubleValue`。
* `StringSerializer` 和 `StringValueSerializer`，处理 `String` 和 `StringValue`。
* `NullValueSerializer`，处理 `NullValue`。
* `BigIntSerializer`，处理 `BigInteger`。
* `BigDecSerializer`，处理 `BigDecimal`。

## 时间类型

因为 Java 时间 API 设计的缺陷，在 JDK8 版本新添加了 `java.time` 包，提供了新版时间 API。

* `DateSerializer`，处理 `java.util.Date`。
* `SqlDateSerializer`，处理 `java.sql.Date`。
* `SqlTimeSerializer`，处理 `java.sql.Time`。
* `SqlTimestampSerializer`，处理 `java.sql.Timestamp`。
* `InstantSerializer`，处理 `Instant`。
* `LocalDateSerializer`，处理 `LocalDate`。
* `LocalTimeSerializer`，处理 `LocalTime`。
* `LocalDateTimeSerializer`，处理 `LocalDateTime`。

## 集合类型

* `ListSerializer`，处理 `List`。
* `MapSerializer`，处理 `Map`。
* `GenericArraySerializer`，处理数组对象。
* `VoidSerializer`，处理 `Void`。
* `EnumSerializer`，处理枚举。

