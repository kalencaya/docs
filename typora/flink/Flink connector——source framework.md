# Flink connector——source framework

Flink 是新一代的流批一体计算引擎，从不同的文件格式、消息队列、存储引擎中读取、转换和写入数据。在 Flink 体系中，Connector 作为与外界交互的组件，连接 Flink 与外界存储系统。

为了方便开发 Connector，Flink 在 [FLIP-27](https://cwiki.apache.org/confluence/display/FLINK/FLIP-27%3A+Refactor+Source+Interface) 中提交了 source framework 的架构设计，以解决 `SourceFunction` 接口实现中的几个难题，并实现流、批一体的 source 接口：

* 流批一体的 source 接口，无需为流、批处理分别实现对应的 connector。
* `work discovery`(splits，partitions，etc) 和真正的数据 `read` 过程混合在 `SourceFunction` 和 `DataStream` 的 API 中，导致类似 Kafka source 实现的复杂。
* 接口没有对 partitions/shards/splits 提供明确地支持，导致与此相关的 `event-time alignment`、`per-partition watermarks`、`dynamic split assignment`、`work stealing` 很难实现，source connector 需要自行实现 partitions/shards/splits 功能后，再去考虑事件事件对齐、分区 watermark 等关键特性。
* checkpoint 锁由 SourceFunction 持有。SourceFunction 实现不得不确保在持有锁的情况下输出数据、更新状态，而 Flink  对此难以优化。并发竞争下、非公平锁也会导致不能确保部分线程（checkpoint 线程）及时获取到锁。锁是高性能的



可以在 [漫谈 Flink Source 接口重构](http://www.whitewood.me/2020/02/11/%E6%BC%AB%E8%B0%88-Flink-Source-%E6%8E%A5%E5%8F%A3%E9%87%8D%E6%9E%84/) 这篇文章中，获得详细地描述。



```java
public interface Source<T, SplitT extends SourceSplit, EnumChkT> extends Serializable {

    Boundedness getBoundedness();

    /**
     * Creates a new reader to read data from the splits it gets assigned. The reader starts fresh
     * and does not have any state to resume.
     */
    SourceReader<T, SplitT> createReader(SourceReaderContext readerContext) throws Exception;

    /**
     * Creates a new SplitEnumerator for this source, starting a new input.
     */
    SplitEnumerator<SplitT, EnumChkT> createEnumerator(SplitEnumeratorContext<SplitT> enumContext)
            throws Exception;

    /**
     * Restores an enumerator from a checkpoint.
     */
    SplitEnumerator<SplitT, EnumChkT> restoreEnumerator(
            SplitEnumeratorContext<SplitT> enumContext, EnumChkT checkpoint) throws Exception;

    // ------------------------------------------------------------------------
    //  serializers for the metadata
    // ------------------------------------------------------------------------

    /**
     * Creates a serializer for the source splits. Splits are serialized when sending them from
     * enumerator to reader, and when checkpointing the reader's current state.
     */
    SimpleVersionedSerializer<SplitT> getSplitSerializer();

    /**
     * Creates the serializer for the {@link SplitEnumerator} checkpoint. The serializer is used for
     * the result of the {@link SplitEnumerator#snapshotState()} method.
     */
    SimpleVersionedSerializer<EnumChkT> getEnumeratorCheckpointSerializer();
}
```

