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

#### 修改和读取缓存

因为数据在 Record 中的存储形式是 byte，每次读取和修改都需要经过序列化和反序列化，而且修改后还会影响到 byte[] 数组内其他 Value 的移动，Record 提供了缓存功能。

当发生修改时，Record 不会立即更新 `byte[] binaryData`，而是会现在 `Value[] writeFields` 中缓存修改的值，并修改 `int firstModifiedPos` 值。

```java
public final class Record implements Value, CopyableValue<Record> {
    private static final long serialVersionUID = 1L;

    private static final int NULL_INDICATOR_OFFSET =
            Integer.MIN_VALUE; // value marking a field as null

    private static final int MODIFIED_INDICATOR_OFFSET =
            Integer.MIN_VALUE + 1; // value marking field as modified

    private int[] offsets; // the offsets to the binary representations of the fields

    private Value[]
            readFields; // the cache for objects into which the binary representations are read

    private Value[]
            writeFields; // the cache for objects into which the binary representations are read

    private int numFields; // the number of fields in the record

    private int firstModifiedPos; // position of the first modification (since (de)serialization)

    public Record(Value value) {
        setField(0, value);
    }

    /**
     * Sets the field at the given position to the given value. If the field position is larger or
     * equal than the current number of fields in the record, than the record is expanded to host as
     * many columns.
     *
     * <p>The value is kept as a reference in the record until the binary representation is
     * synchronized. Until that point, all modifications to the value's object will change the value
     * inside the record.
     *
     * <p>The binary representation is synchronized the latest when the record is emitted. It may be
     * triggered manually at an earlier point, but it is generally not necessary and advisable.
     * Because the synchronization triggers the serialization on all modified values, it may be an
     * expensive operation.
     */
    public void setField(int fieldNum, Value value) {
        // range check
        if (fieldNum < 0) {
            throw new IndexOutOfBoundsException();
        }

        // if the field number is beyond the size, the tuple is expanded
        if (fieldNum >= this.numFields) {
            setNumFields(fieldNum + 1);
        }
        internallySetField(fieldNum, value);
    }

    private void internallySetField(int fieldNum, Value value) {
        // check if we modify an existing field
        this.offsets[fieldNum] = value != null ? MODIFIED_INDICATOR_OFFSET : NULL_INDICATOR_OFFSET;
        this.writeFields[fieldNum] = value;
        markModified(fieldNum);
    }

    private void markModified(int field) {
        if (this.firstModifiedPos > field) {
            this.firstModifiedPos = field;
        }
    }
}
```

当从 Record 中读取时会调用 `#updateBinaryRepresenation()` 方法将 `Value[] writeFields` 中的数据更新到 `byte[] binaryData` 中去，在更新的过程中也会主动剔除 `#writeFields` 中的 null 值。

```java
public final class Record implements Value, CopyableValue<Record> {
    private static final long serialVersionUID = 1L;

    private static final int NULL_INDICATOR_OFFSET =
            Integer.MIN_VALUE; // value marking a field as null

    private static final int MODIFIED_INDICATOR_OFFSET =
            Integer.MIN_VALUE + 1; // value marking field as modified

    // --------------------------------------------------------------------------------------------

    private final InternalDeSerializer serializer =
            new InternalDeSerializer(); // DataInput and DataOutput abstraction

    private byte[] binaryData; // the buffer containing the binary representation

    private byte[] switchBuffer; // the buffer containing the binary representation

    private int[] offsets; // the offsets to the binary representations of the fields

    private int[] lengths; // the lengths of the fields

    private Value[]
            writeFields; // the cache for objects into which the binary representations are read

    private int binaryLen; // the length of the contents in the binary buffer that is valid

    private int firstModifiedPos; // position of the first modification (since (de)serialization)

    /**
     * Updates the binary representation of the data, such that it reflects the state of the
     * currently stored fields. If the binary representation is already up to date, nothing happens.
     * Otherwise, this function triggers the modified fields to serialize themselves into the
     * records buffer and afterwards updates the offset table.
     */
    public void updateBinaryRepresenation() {
        // check whether the binary state is in sync
        final int firstModified = this.firstModifiedPos;
        if (firstModified == Integer.MAX_VALUE) {
            return;
        }

        final InternalDeSerializer serializer = this.serializer;
        final int[] offsets = this.offsets;
        final int numFields = this.numFields;

        serializer.memory =
                this.switchBuffer != null
                        ? this.switchBuffer
                        : (this.binaryLen > 0
                                ? new byte[this.binaryLen]
                                : new byte[numFields * DEFAULT_FIELD_LEN_ESTIMATE + 1]);
        serializer.position = 0;

        if (numFields > 0) {
            int offset = 0;

            // search backwards to find the latest preceding non-null field
            if (firstModified > 0) {
                for (int i = firstModified - 1; i >= 0; i--) {
                    if (this.offsets[i] != NULL_INDICATOR_OFFSET) {
                        offset = this.offsets[i] + this.lengths[i];
                        break;
                    }
                }
            }

            // we assume that changed and unchanged fields are interleaved and serialize into
            // another array
            try {
                if (offset > 0) {
                    // copy the first unchanged portion as one
                    serializer.write(this.binaryData, 0, offset);
                }
                // copy field by field
                for (int i = firstModified; i < numFields; i++) {
                    final int co = offsets[i];
                    /// skip null fields
                    if (co == NULL_INDICATOR_OFFSET) {
                        continue;
                    }

                    offsets[i] = offset;
                    if (co == MODIFIED_INDICATOR_OFFSET) {

                        final Value writeField = this.writeFields[i];

                        if (writeField == RESERVE_SPACE) {
                            // RESERVE_SPACE is a placeholder indicating lengths[i] bytes should be
                            // reserved
                            final int length = this.lengths[i];

                            if (serializer.position >= serializer.memory.length - length - 1) {
                                serializer.resize(length);
                            }
                            serializer.position += length;

                        } else {
                            // serialize modified fields
                            this.writeFields[i].write(serializer);
                        }
                    } else {
                        // bin-copy unmodified fields
                        serializer.write(this.binaryData, co, this.lengths[i]);
                    }

                    this.lengths[i] = serializer.position - offset;
                    offset = serializer.position;
                }
            } catch (Exception e) {
                throw new RuntimeException(
                        "Error in data type serialization: " + e.getMessage(), e);
            }
        }

        serializeHeader(serializer, offsets, numFields);

        // set the fields
        this.switchBuffer = this.binaryData;
        this.binaryData = serializer.memory;
        this.binaryLen = serializer.position;
        this.firstModifiedPos = Integer.MAX_VALUE;
    }
}
```

读取时，如果 Value 标记为被修改，则可以直接从 `Value[] writeFields` 中读取，否则从 `byte[] binaryData` 中反序列化。另外读取缓存，仅缓存了 `Value`，Value 持有的值每次仍通过 byte 数据中反序列化获得。

```java
public final class Record implements Value, CopyableValue<Record> {
    private static final long serialVersionUID = 1L;

    private static final int NULL_INDICATOR_OFFSET =
            Integer.MIN_VALUE; // value marking a field as null

    private static final int MODIFIED_INDICATOR_OFFSET =
            Integer.MIN_VALUE + 1; // value marking field as modified

    private static final int DEFAULT_FIELD_LEN_ESTIMATE = 8; // length estimate for bin array

    // --------------------------------------------------------------------------------------------

    private final InternalDeSerializer serializer =
            new InternalDeSerializer(); // DataInput and DataOutput abstraction

    private byte[] binaryData; // the buffer containing the binary representation

    private byte[] switchBuffer; // the buffer containing the binary representation

    private int[] offsets; // the offsets to the binary representations of the fields

    private int[] lengths; // the lengths of the fields

    private Value[]
            readFields; // the cache for objects into which the binary representations are read

    private Value[]
            writeFields; // the cache for objects into which the binary representations are read

    private int binaryLen; // the length of the contents in the binary buffer that is valid

    private int numFields; // the number of fields in the record

    private int firstModifiedPos; // position of the first modification (since (de)serialization)

    /**
     * Gets the field at the given position from the record. This method checks internally, if this
     * instance of the record has previously returned a value for this field. If so, it reuses the
     * object, if not, it creates one from the supplied class.
     */
    @SuppressWarnings("unchecked")
    public <T extends Value> T getField(final int fieldNum, final Class<T> type) {
        // range check
        if (fieldNum < 0 || fieldNum >= this.numFields) {
            throw new IndexOutOfBoundsException(
                    fieldNum + " for range [0.." + (this.numFields - 1) + "]");
        }

        // get offset and check for null
        final int offset = this.offsets[fieldNum];
        if (offset == NULL_INDICATOR_OFFSET) {
            return null;
        } else if (offset == MODIFIED_INDICATOR_OFFSET) {
            // value that has been set is new or modified
            return (T) this.writeFields[fieldNum];
        }

        final int limit = offset + this.lengths[fieldNum];

        // get an instance, either from the instance cache or create a new one
        final Value oldField = this.readFields[fieldNum];
        final T field;
        if (oldField != null && oldField.getClass() == type) {
            field = (T) oldField;
        } else {
            field = InstantiationUtil.instantiate(type, Value.class);
            this.readFields[fieldNum] = field;
        }

        // deserialize
        deserialize(field, offset, limit, fieldNum);
        return field;
    }
}
```

### Row

`Row` 并不是 Value 的实现类，它用于桥接 Flink 的 Table 与 SQL API 和其他生态。

Row 和 Record 的区别：

* Row 不像 Record 一样，可以放入任意数量的 Value，Row 中的 field 数量是固定的，即 Row 一旦创建不能添加新的 field，但是可以修改已有的 field。
* Row 中字段是有字段名和字段值，字段值的类型是任意的，所以 Row 中任意一个字段都需要提供 `TypeInformation`，而 Record 中字段经过序列化后顺序存储在在 `byte[]` 数组中，并没有一个明确地字段名，且所有数据的类型都是 Value。
* Row 中字段的顺序同样是固定的，Record 中数据的排列是 `0 -> Value1，1 -> Value2……`，并没有明确地顺序信息。
* Row 中字段的访问可以通过 position 和 字段名两种，而 Record 只能通过 position。

```java
public final class Row implements Serializable {

    private static final long serialVersionUID = 3L;

    /** The kind of change a row describes in a changelog. */
    private RowKind kind;

    /** Fields organized by position. Either this or {@link #fieldByName} is set. */
    private final @Nullable Object[] fieldByPosition;

    /** Fields organized by name. Either this or {@link #fieldByPosition} is set. */
    private final @Nullable Map<String, Object> fieldByName;

    /** Mapping from field names to positions. Requires {@link #fieldByPosition} semantics. */
    private final @Nullable LinkedHashMap<String, Integer> positionByName;

    Row(
            RowKind kind,
            @Nullable Object[] fieldByPosition,
            @Nullable Map<String, Object> fieldByName,
            @Nullable LinkedHashMap<String, Integer> positionByName) {
        this.kind = kind;
        this.fieldByPosition = fieldByPosition;
        this.fieldByName = fieldByName;
        this.positionByName = positionByName;
    }
}
```

Row 中的数据同时按照 position 和 name 存储，使用 `LinkedHashMap` 存储字段顺序。

因为 Row 设计的目的是为了用于桥接 Table 与 SQL API，所以添加了 RowKind 字段用于表示数据的 changelog。

Row 查询和修改 field 的逻辑如下：

```java
public final class Row implements Serializable {

    private static final long serialVersionUID = 3L;

    /** Fields organized by position. Either this or {@link #fieldByName} is set. */
    private final @Nullable Object[] fieldByPosition;

    /** Fields organized by name. Either this or {@link #fieldByPosition} is set. */
    private final @Nullable Map<String, Object> fieldByName;

    /** Mapping from field names to positions. Requires {@link #fieldByPosition} semantics. */
    private final @Nullable LinkedHashMap<String, Integer> positionByName;

    /**
     * Returns the field's content at the specified field position.
     *
     * <p>Note: The row must operate in position-based field mode.
     */
    public @Nullable Object getField(int pos) {
        if (fieldByPosition != null) {
            return fieldByPosition[pos];
        } else {
            throw new IllegalArgumentException(
                    "Accessing a field by position is not supported in name-based field mode.");
        }
    }

    /**
     * Returns the field's content using the specified field name.
     *
     * <p>Note: The row must operate in name-based field mode.
     */
    public @Nullable Object getField(String name) {
        if (fieldByName != null) {
            return fieldByName.get(name);
        } else if (positionByName != null) {
            final Integer pos = positionByName.get(name);
            if (pos == null) {
                throw new IllegalArgumentException(
                        String.format("Unknown field name '%s' for mapping to a position.", name));
            }
            assert fieldByPosition != null;
            return fieldByPosition[pos];
        } else {
            throw new IllegalArgumentException(
                    "Accessing a field by name is not supported in position-based field mode.");
        }
    }

    /**
     * Sets the field's content at the specified position.
     *
     * <p>Note: The row must operate in position-based field mode.
     */
    public void setField(int pos, @Nullable Object value) {
        if (fieldByPosition != null) {
            fieldByPosition[pos] = value;
        } else {
            throw new IllegalArgumentException(
                    "Accessing a field by position is not supported in name-based field mode.");
        }
    }

    /**
     * Sets the field's content using the specified field name.
     *
     * <p>Note: The row must operate in name-based field mode.
     */
    public void setField(String name, @Nullable Object value) {
        if (fieldByName != null) {
            fieldByName.put(name, value);
        } else if (positionByName != null) {
            final Integer pos = positionByName.get(name);
            if (pos == null) {
                throw new IllegalArgumentException(
                        String.format(
                                "Unknown field name '%s' for mapping to a row position. "
                                        + "Available names are: %s",
                                name, positionByName.keySet()));
            }
            assert fieldByPosition != null;
            fieldByPosition[pos] = value;
        } else {
            throw new IllegalArgumentException(
                    "Accessing a field by name is not supported in position-based field mode.");
        }
    }
}
```

## Parser

`FieldParser` 用于从 bytes 中解析字段值。

Flink 提供了基本类型和对应的 Value 类型的解析器实现：

* `BooleanParser` 和 `BooleanValueParser`，解析 `boolean` 类型，只支持 `true|false` 或 `0|1`。
* `ByteValue` 和 `ByteValueParser`，解析 `byte` 类型。数据的存储格式只支持负号（`-`），0 到 9，0 和 9 对应的 utf-8 编码为 48 和 57。
* 不支持 `char` 和 `CharValue` 的解析。
* `ShortParser` 和 `ShortValueParser`，解析 `short` 类型。数据的存储格式与 `byte` 类型相同。
* `IntParser` 和 `InvValueParser`，解析 `int` 类型。数据的存储格式与 `byte` 类型相同。
* `LongParser` 和 `LongValueParser`，解析 `long` 类型。数据的存储格式与 `byte` 类型相同。
* `FloatParser` 和 `FloatValueParser`，解析 `float` 类型。
* `DoubleParser` 和 `DoubleValueParser`，解析 `double` 类型。
* `StringParser` 和 `StringValueParser`，解析 `String` 类型。
* `BigIntParser` 和 `BigDecParser`，解析 `BigInteger` 和 `BigDecimal` 类型。
* `SqlDateParser`、`SqlTimeParser` 和 `SqlTimestampParser`，解析 `java.sql.Date`、`java.sql.Time` 和 `java.sql.Timestamp` 类型。

其中对于 `boolean` 类型的解析，只支持 `true|false` 或 `0|1` 的格式。

数值类型中，`byte`、`short`、`int` 和 `long` 支持正负，即 `decimal text`，而 `float`、`double`、`BigInteger` 和 `BigDecimal` 不支持正负，即 `text`。`java.sql.Date`、`java.sql.Time` 和 `java.sql.Timestamp` 支持文本类型的时间戳。

其中 `int` 类型的解析如下：

```java
public class IntParser extends FieldParser<Integer> {

    private static final long OVERFLOW_BOUND = 0x7fffffffL;
    private static final long UNDERFLOW_BOUND = 0x80000000L;

    private int result;

    @Override
    public int parseField(
            byte[] bytes, int startPos, int limit, byte[] delimiter, Integer reusable) {

        if (startPos == limit) {
            setErrorState(ParseErrorState.EMPTY_COLUMN);
            return -1;
        }

        long val = 0;
        boolean neg = false;

        final int delimLimit = limit - delimiter.length + 1;

        if (bytes[startPos] == '-') {
            neg = true;
            startPos++;

            // check for empty field with only the sign
            if (startPos == limit
                    || (startPos < delimLimit && delimiterNext(bytes, startPos, delimiter))) {
                setErrorState(ParseErrorState.NUMERIC_VALUE_ORPHAN_SIGN);
                return -1;
            }
        }

        for (int i = startPos; i < limit; i++) {
            if (i < delimLimit && delimiterNext(bytes, i, delimiter)) {
                if (i == startPos) {
                    setErrorState(ParseErrorState.EMPTY_COLUMN);
                    return -1;
                }
                this.result = (int) (neg ? -val : val);
                return i + delimiter.length;
            }
            if (bytes[i] < 48 || bytes[i] > 57) {
                setErrorState(ParseErrorState.NUMERIC_VALUE_ILLEGAL_CHARACTER);
                return -1;
            }
            val *= 10;
            val += bytes[i] - 48;

            if (val > OVERFLOW_BOUND && (!neg || val > UNDERFLOW_BOUND)) {
                setErrorState(ParseErrorState.NUMERIC_VALUE_OVERFLOW_UNDERFLOW);
                return -1;
            }
        }

        this.result = (int) (neg ? -val : val);
        return limit;
    }
}
```

`double` 类型的解析如下：

```java
public class DoubleParser extends FieldParser<Double> {

    private static final Double DOUBLE_INSTANCE = Double.valueOf(0.0);

    private double result;

    @Override
    public int parseField(
            byte[] bytes, int startPos, int limit, byte[] delimiter, Double reusable) {
        final int endPos = nextStringEndPos(bytes, startPos, limit, delimiter);
        if (endPos < 0) {
            return -1;
        }

        if (endPos > startPos
                && (Character.isWhitespace(bytes[startPos])
                        || Character.isWhitespace(bytes[(endPos - 1)]))) {
            setErrorState(ParseErrorState.NUMERIC_VALUE_ILLEGAL_CHARACTER);
            return -1;
        }

        String str =
                new String(bytes, startPos, endPos - startPos, ConfigConstants.DEFAULT_CHARSET);
        try {
            this.result = Double.parseDouble(str);
            return (endPos == limit) ? limit : endPos + delimiter.length;
        } catch (NumberFormatException e) {
            setErrorState(ParseErrorState.NUMERIC_VALUE_FORMAT_ERROR);
            return -1;
        }
    }
}
```

`java.sql.Date` 类型解析如下：

```java
public class SqlDateParser extends FieldParser<Date> {

    private static final Date DATE_INSTANCE = new Date(0L);

    private Date result;

    @Override
    public int parseField(byte[] bytes, int startPos, int limit, byte[] delimiter, Date reusable) {
        final int endPos = nextStringEndPos(bytes, startPos, limit, delimiter);
        if (endPos < 0) {
            return -1;
        }

        if (endPos > startPos
                && (Character.isWhitespace(bytes[startPos])
                        || Character.isWhitespace(bytes[(endPos - 1)]))) {
            setErrorState(ParseErrorState.NUMERIC_VALUE_ILLEGAL_CHARACTER);
            return -1;
        }

        String str =
                new String(bytes, startPos, endPos - startPos, ConfigConstants.DEFAULT_CHARSET);
        try {
            this.result = Date.valueOf(str);
            return (endPos == limit) ? limit : endPos + delimiter.length;
        } catch (IllegalArgumentException e) {
            setErrorState(ParseErrorState.NUMERIC_VALUE_FORMAT_ERROR);
            return -1;
        }
    }
}
```
