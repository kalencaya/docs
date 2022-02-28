# Flink 类型——Value

Value 类型需要手动实现序列化和反序列化，相比通用类型的序列化框架，定制的序列化可以获得更高的性能。

比如针对可能为 null 的值，需要额外一位标记是否为 null，当确保值非 null 时可以节约这个开销，又或者一个稀疏的数组，序列化时可以只序列化非 null 的元素而非整个数组。

与序列化原理类似，自定义的对象 clone 也可以获得更高的性能。

除此之外，Value 类型的值可以支持修改，提高对象的复用率，减少 JVM 垃圾回收的压力。

## 核心接口

Value 的接口有多个，包括序列化，支持修改，标准化 key。具体的 Value 类按需实现对应的接口，基础接口如下：

```java
public interface Value extends IOReadableWritable, Serializable {}
```

### 序列化

```java
public interface IOReadableWritable {

    /**
     * Writes the object's internal data to the given data output view.
     */
    void write(DataOutputView out) throws IOException;

    /**
     * Reads the object's internal data from the given data input view.
     */
    void read(DataInputView in) throws IOException;
}
```

### 支持修改

```java
public interface ResettableValue<T extends Value> extends Value {

    /**
     * Sets the encapsulated value to another value
     */
    void setValue(T value);
}
```

### 标准化 key

面试题：如何比较 int 和 long 类型的大小？

Flink 定义了接口 `NormalizableKey`，实现类需要提供 byte 级的比较方式。进行 byte 级比较时会逐位比较 byte 值大小，出现不相等的 byte 时，byte 位较小即表示 key 较小。如果所有 byte 位都相等，byte 级比较无法确定两个标准 key 的大小，需要 key 本身来确定。

```java
public interface NormalizableKey<T> extends Comparable<T>, Key<T> {

    /**
     * Gets the maximal length of normalized keys that the data type would produce to determine the
     * order of instances solely by the normalized key. A value of {@link
     * java.lang.Integer}.MAX_VALUE is interpreted as infinite.
     *
     * <p>For example, 32 bit integers return four, while Strings (potentially unlimited in length)
     * return {@link java.lang.Integer}.MAX_VALUE.
     */
    int getMaxNormalizedKeyLen();

    /**
     * Writes a normalized key for the given record into the target byte array, starting at the
     * specified position an writing exactly the given number of bytes. Note that the comparison of
     * the bytes is treating the bytes as unsigned bytes: {@code int byteI = bytes[i] & 0xFF;}
     *
     * <p>If the meaningful part of the normalized key takes less than the given number of bytes,
     * then it must be padded. Padding is typically required for variable length data types, such as
     * strings. The padding uses a special character, either {@code 0} or {@code 0xff}, depending on
     * whether shorter values are sorted to the beginning or the end.
     */
    void copyNormalizedKey(MemorySegment memory, int offset, int len);
}
```

## 基本类型

Flink 提供了基本数据类型的实现，比如 `IntValue` 对标可序列化和比较的 int 装箱类型 `Integer`：

* `BooleanValue`，对标 `boolean`。
* `ByteValue`，对标 `byte`。
* `CharValue`，对标 `char`。
* `ShortValue`，对标 `short`。
* `IntValue`，对标 `int`。
* `LongValue`，对标 `long`。
* `FloatValue`，对标 `float`。
* `DoubleValue`，对标 `double`。
* `StringValue`，对标 `String`。
* `NullValue`，对标 `null`。

基本数据类型的实现基本类似，本文只讲解 IntValue 类型实现。

Flink 内对于 int 类型的存储使用 IntValue，可以获得更好地序列化性能，提高对象复用性减少垃圾回收压力，减少 int 类型的装箱拆箱消耗。

```java
public class IntValue implements NormalizableKey<IntValue>, ResettableValue<IntValue>, CopyableValue<IntValue> {
    private static final long serialVersionUID = 1L;

    private int value;

    public IntValue() {
        this.value = 0;
    }

    public IntValue(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    @Override
    public void setValue(IntValue value) {
        this.value = value.value;
    }

    @Override
    public String toString() {
        return String.valueOf(this.value);
    }

    @Override
    public int hashCode() {
        return this.value;
    }

    @Override
    public boolean equals(final Object obj) {
        if (obj instanceof IntValue) {
            return ((IntValue) obj).value == this.value;
        }
        return false;
    }
}
```

序列化实现。其中 `#copyNormalizedKey(MemeorySegment, int, int)` 方法的实现和 `DataOutputView#writeInt(int)` 实现是关联的，保证数据复制后依然能够通过 `DataInputView#readInt()` 读取。

```java
public class IntValue implements NormalizableKey<IntValue>, ResettableValue<IntValue>, CopyableValue<IntValue> {
    private static final long serialVersionUID = 1L;

    private int value;

    @Override
    public void read(DataInputView in) throws IOException {
        this.value = in.readInt();
    }

    @Override
    public void write(DataOutputView out) throws IOException {
        out.writeInt(this.value);
    }

    @Override
    public int getMaxNormalizedKeyLen() {
        return 4;
    }

    @Override
    public void copyNormalizedKey(MemorySegment target, int offset, int len) {
        // take out value and add the integer min value. This gets an offset
        // representation when interpreted as an unsigned integer (as is the case
        // with normalized keys). write this value as big endian to ensure the
        // most significant byte comes first.
        if (len == 4) {
            target.putIntBigEndian(offset, value - Integer.MIN_VALUE);
        } else if (len <= 0) {
        } else if (len < 4) {
            int value = this.value - Integer.MIN_VALUE;
            for (int i = 0; len > 0; len--, i++) {
                target.put(offset + i, (byte) ((value >>> ((3 - i) << 3)) & 0xff));
            }
        } else {
            target.putIntBigEndian(offset, value - Integer.MIN_VALUE);
            for (int i = 4; i < len; i++) {
                target.put(offset + i, (byte) 0);
            }
        }
    }
}
```

高效地复制：

```java
public class IntValue implements NormalizableKey<IntValue>, ResettableValue<IntValue>, CopyableValue<IntValue> {
    private static final long serialVersionUID = 1L;

    private int value;

    @Override
    public int getBinaryLength() {
        return 4;
    }

    @Override
    public void copyTo(IntValue target) {
        target.value = this.value;
    }

    @Override
    public IntValue copy() {
        return new IntValue(this.value);
    }

    @Override
    public void copy(DataInputView source, DataOutputView target) throws IOException {
        target.write(source, 4);
    }
}
```

## 特殊类型

除了基本数据类型实现，Flink 还提供了 list 和 map 集合类的实现，以及序列化优化的 `Record` 实现。

### 集合类型

集合类型实现包括 `ListValue` 和 `MapValue`，用于 `PACT` 程序实现 `List`、`Map` 接口与 `Value` 接口：

```java
public abstract class ListValue<V extends Value> implements Value, List<V> {
    private static final long serialVersionUID = 1L;

    // Type of list elements
    private final Class<V> valueClass;
    // Encapsulated list
    private final List<V> list;

    /**
     * Initializes the encapsulated list with an empty ArrayList.
     */
    public ListValue() {
        this.valueClass = ReflectionUtil.<V>getTemplateType1(this.getClass());

        this.list = new ArrayList<V>();
    }

    /**
     * Initializes the encapsulated list with an ArrayList filled with all object contained in the
     * specified Collection object.
     */
    public ListValue(final Collection<V> c) {
        this.valueClass = ReflectionUtil.<V>getTemplateType1(this.getClass());

        this.list = new ArrayList<V>(c);
    }
}

public abstract class MapValue<K extends Value, V extends Value> implements Value, Map<K, V> {
    private static final long serialVersionUID = 1L;

    // type of the map's key
    private final Class<K> keyClass;
    // type of the map's value
    private final Class<V> valueClass;
    // encapsulated map
    private final Map<K, V> map;

    /** Initializes the encapsulated map with an empty HashMap. */
    public MapValue() {
        this.keyClass = ReflectionUtil.getTemplateType1(this.getClass());
        this.valueClass = ReflectionUtil.getTemplateType2(this.getClass());

        this.map = new HashMap<>();
    }

    /**
     * Initializes the encapsulated map with a HashMap filled with all entries of the provided map.
     */
    public MapValue(Map<K, V> map) {
        this.keyClass = ReflectionUtil.getTemplateType1(this.getClass());
        this.valueClass = ReflectionUtil.getTemplateType2(this.getClass());

        this.map = new HashMap<>(map);
    }
}
```

序列化实现如下：

```java
public abstract class ListValue<V extends Value> implements Value, List<V> {
    private static final long serialVersionUID = 1L;

    // Type of list elements
    private final Class<V> valueClass;
    // Encapsulated list
    private final List<V> list;

    @Override
    public void read(final DataInputView in) throws IOException {
        int size = in.readInt();
        this.list.clear();

        try {
            for (; size > 0; size--) {
                final V val = this.valueClass.newInstance();
                val.read(in);

                this.list.add(val);
            }
        } catch (final InstantiationException e) {
            throw new RuntimeException(e);
        } catch (final IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void write(final DataOutputView out) throws IOException {
        out.writeInt(this.list.size());
        for (final V value : this.list) {
            value.write(out);
        }
    }
}

public abstract class MapValue<K extends Value, V extends Value> implements Value, Map<K, V> {
    private static final long serialVersionUID = 1L;

    // type of the map's key
    private final Class<K> keyClass;
    // type of the map's value
    private final Class<V> valueClass;
    // encapsulated map
    private final Map<K, V> map;

    @Override
    public void read(final DataInputView in) throws IOException {
        int size = in.readInt();
        this.map.clear();

        try {
            for (; size > 0; size--) {
                final K key = this.keyClass.newInstance();
                final V val = this.valueClass.newInstance();
                key.read(in);
                val.read(in);
                this.map.put(key, val);
            }
        } catch (final InstantiationException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void write(final DataOutputView out) throws IOException {
        out.writeInt(this.map.size());
        for (final Entry<K, V> entry : this.map.entrySet()) {
            entry.getKey().write(out);
            entry.getValue().write(out);
        }
    }
}
```

### Record

`Record` 代表多个 Value 数据，每个 Record 可以存储任意多个 field 和 Value 组成的元组，不过 Record 其实没有一个真正地 field，类似 `name -> StringValue`，而是 `0 -> StringValue，1 -> IntValue，2 -> LongValue……`。

Record 采用稀疏存储的方式，即 field 对应的 Value 可能为 null。

```java
public final class Record implements Value, CopyableValue<Record> {
    private static final long serialVersionUID = 1L;

    private final InternalDeSerializer serializer =
            new InternalDeSerializer(); // DataInput and DataOutput abstraction

    private byte[] binaryData; // the buffer containing the binary representation


    private int[] offsets; // the offsets to the binary representations of the fields

    private int[] lengths; // the lengths of the fields

    private int numFields; // the number of fields in the record
}
```

Record 内部的数据存储都是 byte 方式，每次读取和写入都需要经过序列化和反序列化。

Record 内部使用 numFields 表示存储的 field 的数量，numFields 初始为 0，每次新增 field，numFields 也会递增。新增 field 时，numfields 的值也会作为 `int[] offsets` 和 `int[] lengths` 数组下标，记录 Value 在 `byte[] binaryData` 中的 offset 和 length，用于从 binaryData 中读取 byte 数据。

