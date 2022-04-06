# Flink connector——source framework

Flink 是新一代的流批一体计算引擎，从不同的文件格式、消息队列、存储引擎中读取、转换和写入数据。在 Flink 体系中，Connector 作为与外界交互的组件，连接 Flink 与外界存储系统。

为了方便开发 Connector，Flink 在 [FLIP-27](https://cwiki.apache.org/confluence/display/FLINK/FLIP-27%3A+Refactor+Source+Interface) 中提交了 source framework 的架构设计，以解决 `SourceFunction` 接口实现中的几个难题，并实现流、批一体的 source 接口：

* 流批一体的 source 接口，无需为流、批处理分别实现对应的 connector。
* `work discovery`(splits，partitions，etc) 和真正的数据 `read` 过程混合在 `SourceFunction` 和 `DataStream` 的 API 中，导致类似 Kafka source 实现的复杂。
* 接口没有对 partitions/shards/splits 提供明确地支持，导致与此相关的 `event-time alignment`、`per-partition watermarks`、`dynamic split assignment`、`work stealing` 很难实现，source connector 需要自行实现 partitions/shards/splits 功能后，再去考虑事件事件对齐、分区 watermark 等关键特性。
* checkpoint 锁由 SourceFunction 持有。SourceFunction 实现不得不确保在持有锁的情况下输出数据、更新状态，而 Flink  对此难以优化。并发竞争下、非公平锁也会导致不能确保部分线程（checkpoint 线程）及时获取到锁。锁是高性能的

详细解释可以在 [漫谈 Flink Source 接口重构](http://www.whitewood.me/2020/02/11/%E6%BC%AB%E8%B0%88-Flink-Source-%E6%8E%A5%E5%8F%A3%E9%87%8D%E6%9E%84/) 这篇文章中，获得详细地描述。

## Source

Flink 官方文档中对于数据源提供了详细的说明，点击[链接](https://nightlies.apache.org/flink/flink-docs-release-1.14/zh/docs/dev/datastream/sources/)可以跳转阅读。

一个数据源包含 3 个核心组件：

* `SplitEnumerator`。单线程运行在 `JobManager`。负责生成 `Split`，接受 `SourceReader` 的 pull 请求，分配 `Split`。
* `SourceReader`。运行在 `TaskManager`，可分配多个。主动向 `SplitEnumerator` pull `Split` 并进行处理。
* `Split`。source 数据的切分，比如对应一个文件，Kafka topic 中的一个 partition 等。

Source 类作为 API 入口，以工厂模式创建 `SplitEnumerator`、 `SourceReader` 和对应的序列化实现：

* *Split Enumerator*
* *Source Reader*
* *Split Serializer*
* *Enumerator Checkpoint Serializer*

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

### split 流程

`SplitEnumerator` 实现对 source 的 partitions/shards/splits，由 `SourceReader` 主动 pull 后进行处理。

* `SplitEnumerator` 提供 `SplitEnumerator#handleSplitRequest(int, String)`，等待 `SourceReader` 主动 pull splits。
* 当收到 pull split 请求时，通过 `SplitEnumeratorContext` 分配 split 给请求的 `SourceReader`，如果没有更多的 split，会调用 `#signalNoMoreSplits` 方法通知读取结束。
* 当 `SourceReader` 读取失败时，也会归还 splits 到 `SplitEnumerator`。

```java
public interface SplitEnumerator<SplitT extends SourceSplit, CheckpointT> extends AutoCloseable, CheckpointListener {

    /**
     * Handles the request for a split. This method is called when the reader with the given subtask
     * id calls the {@link SourceReaderContext#sendSplitRequest()} method.
     */
    void handleSplitRequest(int subtaskId, @Nullable String requesterHostname);

    /**
     * Add a split back to the split enumerator. It will only happen when a {@link SourceReader}
     * fails and there are splits assigned to it after the last successful checkpoint.
     */
    void addSplitsBack(List<SplitT> splits, int subtaskId);

    /**
     * Add a new source reader with the given subtask ID.
     */
    void addReader(int subtaskId);

}

public interface SplitEnumeratorContext<SplitT extends SourceSplit> {

    /**
     * Assigns a single split.
     *
     * <p>When assigning multiple splits, it is more efficient to assign all of them in a single
     * call to the {@link #assignSplits(SplitsAssignment)} method.
     */
    default void assignSplit(SplitT split, int subtask) {
        assignSplits(new SplitsAssignment<>(split, subtask));
    }

    /**
     * Assign the splits.
     */
    void assignSplits(SplitsAssignment<SplitT> newSplitAssignments);

    /**
     * Signals a subtask that it will not receive any further split.
     *
     * @param subtask The index of the operator's parallel subtask that shall be signaled it will
     *     not receive any further split.
     */
    void signalNoMoreSplits(int subtask);
  
    /**
     * Get the currently registered readers. The mapping is from subtask id to the reader info.
     */
    Map<Integer, ReaderInfo> registeredReaders();
}
```

`SourceReader` 会先通过 `SourceReaderContext` 请求 split，然后进行处理。

```java
public interface SourceReader<T, SplitT extends SourceSplit> extends AutoCloseable, CheckpointListener {

    /**
     * Poll the next available record into the {@link SourceOutput}.
     *
     * <p>The implementation must make sure this method is non-blocking.
     *
     * <p>Although the implementation can emit multiple records into the given SourceOutput, it is
     * recommended not doing so. Instead, emit one record into the SourceOutput and return a {@link
     * InputStatus#MORE_AVAILABLE} to let the caller thread know there are more records available.
     */
    InputStatus pollNext(ReaderOutput<T> output) throws Exception;

    /**
     * Adds a list of splits for this reader to read. This method is called when the enumerator
     * assigns a split via {@link SplitEnumeratorContext#assignSplit(SourceSplit, int)} or {@link
     * SplitEnumeratorContext#assignSplits(SplitsAssignment)}.
     */
    void addSplits(List<SplitT> splits);

    /**
     * This method is called when the reader is notified that it will not receive any further
     * splits.
     *
     * <p>It is triggered when the enumerator calls {@link
     * SplitEnumeratorContext#signalNoMoreSplits(int)} with the reader's parallel subtask.
     */
    void notifyNoMoreSplits();

}

public interface SourceReaderContext {

    /** @return The index of this subtask. */
    int getIndexOfSubtask();

    /**
     * Sends a split request to the source's {@link SplitEnumerator}. This will result in a call to
     * the {@link SplitEnumerator#handleSplitRequest(int, String)} method, with this reader's
     * parallel subtask id and the hostname where this reader runs.
     */
    void sendSplitRequest();
}
```

在流批一体的场景下，`SplitEnumerator` 通过对 split 的控制来实现流、批场景：

* 批处理场景下，数据存在边界，当 split 全部处理完成时，会主动通知 `SourceReader` 处理完成。
* 流处理场景下，数据不存在边界，`SplitEnumerator` 会源源不断地产生 split。

### checkpoint

`SplitEnumerator` 和 `SourceReader` 都需要实现 checkpoint。

```
public interface SplitEnumerator<SplitT extends SourceSplit, CheckpointT> extends AutoCloseable, CheckpointListener {

    /**
     * Creates a snapshot of the state of this split enumerator, to be stored in a checkpoint.
     *
     * <p>The snapshot should contain the latest state of the enumerator: It should assume that all
     * operations that happened before the snapshot have successfully completed. For example all
     * splits assigned to readers via {@link SplitEnumeratorContext#assignSplit(SourceSplit, int)}
     * and {@link SplitEnumeratorContext#assignSplits(SplitsAssignment)}) don't need to be included
     * in the snapshot anymore.
     *
     * <p>This method takes the ID of the checkpoint for which the state is snapshotted. Most
     * implementations should be able to ignore this parameter, because for the contents of the
     * snapshot, it doesn't matter for which checkpoint it gets created. This parameter can be
     * interesting for source connectors with external systems where those systems are themselves
     * aware of checkpoints; for example in cases where the enumerator notifies that system about a
     * specific checkpoint being triggered.
     */
    CheckpointT snapshotState(long checkpointId) throws Exception;

    /**
     * We have an empty default implementation here because most source readers do not have to
     * implement the method.
     */
    @Override
    default void notifyCheckpointComplete(long checkpointId) throws Exception {}
}

public interface SourceReader<T, SplitT extends SourceSplit> extends AutoCloseable, CheckpointListener {

    /**
     * Checkpoint on the state of the source.
     *
     * @return the state of the source.
     */
    List<SplitT> snapshotState(long checkpointId);

    /**
     * We have an empty default implementation here because most source readers do not have to
     * implement the method.
     */
    @Override
    default void notifyCheckpointComplete(long checkpointId) throws Exception {}
}
```

### enumerator 和 reader 交互

`SplitEnumerator` 和 `SourceReader` 之间来回传递自定义事件，可以利用此机制来执行复杂的协调任务。

```java
public interface SplitEnumerator<SplitT extends SourceSplit, CheckpointT> extends AutoCloseable, CheckpointListener {

    /**
     * Handles a custom source event from the source reader.
     *
     * <p>This method has a default implementation that does nothing, because it is only required to
     * be implemented by some sources, which have a custom event protocol between reader and
     * enumerator. The common events for reader registration and split requests are not dispatched
     * to this method, but rather invoke the {@link #addReader(int)} and {@link
     * #handleSplitRequest(int, String)} methods.
     */
    default void handleSourceEvent(int subtaskId, SourceEvent sourceEvent) {}
}

public interface SplitEnumeratorContext<SplitT extends SourceSplit> {

    /**
     * Send a source event to a source reader. The source reader is identified by its subtask id.
     */
    void sendEventToSourceReader(int subtaskId, SourceEvent event);

}

public interface SourceReader<T, SplitT extends SourceSplit> extends AutoCloseable, CheckpointListener {

    /**
     * Handle a custom source event sent by the {@link SplitEnumerator}. This method is called when
     * the enumerator sends an event via {@link SplitEnumeratorContext#sendEventToSourceReader(int,
     * SourceEvent)}.
     *
     * <p>This method has a default implementation that does nothing, because most sources do not
     * require any custom events.
     */
    default void handleSourceEvents(SourceEvent sourceEvent) {}

}

public interface SourceReaderContext {

    /**
     * Send a source event to the source coordinator.
     */
    void sendSourceEventToCoordinator(SourceEvent sourceEvent);

}
```

### 异步无阻塞

不可避免地，source 在于外部系统进行交互的时候，会出现阻塞的场景。Flink 的 source framework 同样对阻塞场景进行了支持，本文从 enumerator 和 reader 两方面进行介绍。

#### reader

`SourceReader` 在读取处理 split 的时候，无法避免需要等待外部系统数据就位，比如 `kafka` 的分区没有新数据，就需要等待。

`SourceReader#pollNext(ReaderOutput)` 方法返回结果为 `InputStatus`，标识是否可以立刻拉取下一个元素，暂无数据需等待，无数据。当返回 `InputStatus#NOTHING_AVAILABLE` 时，外部可以调用 `SourceReader#isAvailable()` 方法获取 `CompletableFuture`，当数据就位后，`SourceReader` 可以通过 future 机制通知数据就位。

```java
public interface SourceReader<T, SplitT extends SourceSplit> extends AutoCloseable, CheckpointListener {

    /**
     * Poll the next available record into the {@link SourceOutput}.
     *
     * <p>The implementation must make sure this method is non-blocking.
     *
     * <p>Although the implementation can emit multiple records into the given SourceOutput, it is
     * recommended not doing so. Instead, emit one record into the SourceOutput and return a {@link
     * InputStatus#MORE_AVAILABLE} to let the caller thread know there are more records available.
     */
    InputStatus pollNext(ReaderOutput<T> output) throws Exception;

    /**
     * Returns a future that signals that data is available from the reader.
     *
     * <p>Once the future completes, the runtime will keep calling the {@link
     * #pollNext(ReaderOutput)} method until that methods returns a status other than {@link
     * InputStatus#MORE_AVAILABLE}. After that the, the runtime will again call this method to
     * obtain the next future. Once that completes, it will again call {@link
     * #pollNext(ReaderOutput)} and so on.
     *
     * <p>The contract is the following: If the reader has data available, then all futures
     * previously returned by this method must eventually complete. Otherwise the source might stall
     * indefinitely.
     *
     * <p>It is not a problem to have occasional "false positives", meaning to complete a future
     * even if no data is available. However, one should not use an "always complete" future in
     * cases no data is available, because that will result in busy waiting loops calling {@code
     * pollNext(...)} even though no data is available.
     */
    CompletableFuture<Void> isAvailable();
}

public enum InputStatus {

    /**
     * Indicator that more data is available and the input can be called immediately again to
     * produce more data.
     */
    MORE_AVAILABLE,

    /**
     * Indicator that no data is currently available, but more data will be available in the future
     * again.
     */
    NOTHING_AVAILABLE,

    /** Indicator that the input has reached the end of data. */
    END_OF_INPUT
}
```

#### enumerator 

`SplitEnumerator` 也需要与外部系统进行交互，执行 split 过程，比如 kafka-connector 获取 topic 的 partitions。

`SplitEnumeratorContext` 类的 `#callAsync()` 方法提供了异步执行功能，而 `SplitEnumerator` 不需要自己维护线程。

```java
public interface SplitEnumeratorContext<SplitT extends SourceSplit> {

    /**
     * Invoke the callable and handover the return value to the handler which will be executed by
     * the source coordinator. When this method is invoked multiple times, The <code>Callable</code>
     * s may be executed in a thread pool concurrently.
     *
     * <p>It is important to make sure that the callable does not modify any shared state,
     * especially the states that will be a part of the {@link SplitEnumerator#snapshotState(long)}.
     * Otherwise, there might be unexpected behavior.
     *
     * <p>Note that an exception thrown from the handler would result in failing the job.
     */
    <T> void callAsync(Callable<T> callable, BiConsumer<T, Throwable> handler);

    /**
     * Invoke the given callable periodically and handover the return value to the handler which
     * will be executed by the source coordinator. When this method is invoked multiple times, The
     * <code>Callable</code>s may be executed in a thread pool concurrently.
     *
     * <p>It is important to make sure that the callable does not modify any shared state,
     * especially the states that will be a part of the {@link SplitEnumerator#snapshotState(long)}.
     * Otherwise, there might be unexpected behavior.
     *
     * <p>Note that an exception thrown from the handler would result in failing the job.
     */
    <T> void callAsync(Callable<T> callable, BiConsumer<T, Throwable> handler, long initialDelayMillis, long periodMillis);

    /**
     * Invoke the given runnable in the source coordinator thread.
     *
     * <p>This can be useful when the enumerator needs to execute some action (like assignSplits)
     * triggered by some external events. E.g., Watermark from another source advanced and this
     * source now be able to assign splits to awaiting readers. The trigger can be initiated from
     * the coordinator thread of the other source. Instead of using lock for thread safety, this API
     * allows to run such externally triggered action in the coordinator thread. Hence, we can
     * ensure all enumerator actions are serialized in the single coordinator thread.
     *
     * <p>It is important that the runnable does not block.
     */
    void runInCoordinatorThread(Runnable runnable);
}
```

### Watermark

`ReaderOutput` 提供了 Watermark 输出的功能。

```java
public interface ReaderOutput<T> extends SourceOutput<T> {

    /**
     * Emit a record without a timestamp.
     *
     * <p>Use this method if the source system does not have a notion of records with timestamps.
     *
     * <p>The events later pass through a {@link TimestampAssigner}, which attaches a timestamp to
     * the event based on the event's contents. For example a file source with JSON records would
     * not have a generic timestamp from the file reading and JSON parsing process, and thus use
     * this method to produce initially a record without a timestamp. The {@code TimestampAssigner}
     * in the next step would be used to extract timestamp from a field of the JSON object.
     *
     * @param record the record to emit.
     */
    @Override
    void collect(T record);

    /**
     * Emit a record with a timestamp.
     *
     * <p>Use this method if the source system has timestamps attached to records. Typical examples
     * would be Logs, PubSubs, or Message Queues, like Kafka or Kinesis, which store a timestamp
     * with each event.
     *
     * <p>The events typically still pass through a {@link TimestampAssigner}, which may decide to
     * either use this source-provided timestamp, or replace it with a timestamp stored within the
     * event (for example if the event was a JSON object one could configure aTimestampAssigner that
     * extracts one of the object's fields and uses that as a timestamp).
     *
     * @param record the record to emit.
     * @param timestamp the timestamp of the record.
     */
    @Override
    void collect(T record, long timestamp);

    /**
     * Emits the given watermark.
     *
     * <p>Emitting a watermark also implicitly marks the stream as <i>active</i>, ending previously
     * marked idleness.
     */
    @Override
    void emitWatermark(Watermark watermark);

    /**
     * Marks this output as idle, meaning that downstream operations do not wait for watermarks from
     * this output.
     *
     * <p>An output becomes active again as soon as the next watermark is emitted.
     */
    @Override
    void markIdle();

    /**
     * Creates a {@code SourceOutput} for a specific Source Split. Use these outputs if you want to
     * run split-local logic, like watermark generation.
     *
     * <p>If a split-local output was already created for this split-ID, the method will return that
     * instance, so that only one split-local output exists per split-ID.
     *
     * <p><b>IMPORTANT:</b> After the split has been finished, it is crucial to release the created
     * output again. Otherwise it will continue to contribute to the watermark generation like a
     * perpetually stalling source split, and may hold back the watermark indefinitely.
     *
     * @see #releaseOutputForSplit(String)
     */
    SourceOutput<T> createOutputForSplit(String splitId);

    /**
     * Releases the {@code SourceOutput} created for the split with the given ID.
     *
     * @see #createOutputForSplit(String)
     */
    void releaseOutputForSplit(String splitId);
}
```

## NumberSequenceSource

`NumberSequenceSource` 是一个用于测试用途的 source，输出一系列从 from 到 to 的 long 类型的数字：

```java
public class NumberSequenceSource
        implements Source<
                        Long,
                        NumberSequenceSource.NumberSequenceSplit,
                        Collection<NumberSequenceSource.NumberSequenceSplit>>,
                ResultTypeQueryable<Long> {

    private static final long serialVersionUID = 1L;

    /** The starting number in the sequence, inclusive. */
    private final long from;

    /** The end number in the sequence, inclusive. */
    private final long to;

    /**
     * Creates a new {@code NumberSequenceSource} that produces parallel sequences covering the
     * range {@code from} to {@code to} (both boundaries are inclusive).
     */
    public NumberSequenceSource(long from, long to) {
        checkArgument(from <= to, "'from' must be <= 'to'");
        this.from = from;
        this.to = to;
    }

    public long getFrom() {
        return from;
    }

    public long getTo() {
        return to;
    }
}
```

`SplitEnumerator` 过程如下：

```java
public class NumberSequenceSource
        implements Source<
                        Long,
                        NumberSequenceSource.NumberSequenceSplit,
                        Collection<NumberSequenceSource.NumberSequenceSplit>>,
                ResultTypeQueryable<Long> {

    /** The starting number in the sequence, inclusive. */
    private final long from;

    /** The end number in the sequence, inclusive. */
    private final long to;
                  
    @Override
    public SourceReader<Long, NumberSequenceSplit> createReader(SourceReaderContext readerContext) {
        return new IteratorSourceReader<>(readerContext);
    }

    @Override
    public SplitEnumerator<NumberSequenceSplit, Collection<NumberSequenceSplit>> createEnumerator(final SplitEnumeratorContext<NumberSequenceSplit> enumContext) {
        final List<NumberSequenceSplit> splits = splitNumberRange(from, to, enumContext.currentParallelism());
        return new IteratorSourceEnumerator<>(enumContext, splits);
    }

    protected List<NumberSequenceSplit> splitNumberRange(long from, long to, int numSplits) {
        final NumberSequenceIterator[] subSequences = new NumberSequenceIterator(from, to).split(numSplits);
        final ArrayList<NumberSequenceSplit> splits = new ArrayList<>(subSequences.length);

        int splitId = 1;
        for (NumberSequenceIterator seq : subSequences) {
            if (seq.hasNext()) {
                splits.add(new NumberSequenceSplit(String.valueOf(splitId++), seq.getCurrent(), seq.getTo()));
            }
        }

        return splits;
    }

    // ------------------------------------------------------------------------
    //  splits & checkpoint
    // ------------------------------------------------------------------------

    /** A split of the source, representing a number sub-sequence. */
    public static class NumberSequenceSplit implements IteratorSourceSplit<Long, NumberSequenceIterator> {

        private final String splitId;
        private final long from;
        private final long to;

        public NumberSequenceSplit(String splitId, long from, long to) {
            checkArgument(from <= to, "'from' must be <= 'to'");
            this.splitId = checkNotNull(splitId);
            this.from = from;
            this.to = to;
        }

        @Override
        public String splitId() {
            return splitId;
        }

        public long from() {
            return from;
        }

        public long to() {
            return to;
        }

        @Override
        public NumberSequenceIterator getIterator() {
            return new NumberSequenceIterator(from, to);
        }

        @Override
        public IteratorSourceSplit<Long, NumberSequenceIterator> getUpdatedSplitForIterator(final NumberSequenceIterator iterator) {
            return new NumberSequenceSplit(splitId, iterator.getCurrent(), iterator.getTo());
        }
    }
}
```

`IteratorSourceEnumerator` 源码如下：

```java
public class IteratorSourceEnumerator<SplitT extends IteratorSourceSplit<?, ?>>
        implements SplitEnumerator<SplitT, Collection<SplitT>> {

    private final SplitEnumeratorContext<SplitT> context;
    private final Queue<SplitT> remainingSplits;

    public IteratorSourceEnumerator(
            SplitEnumeratorContext<SplitT> context, Collection<SplitT> splits) {
        this.context = checkNotNull(context);
        this.remainingSplits = new ArrayDeque<>(splits);
    }

    // ------------------------------------------------------------------------

    @Override
    public void handleSplitRequest(int subtaskId, @Nullable String requesterHostname) {
        final SplitT nextSplit = remainingSplits.poll();
        if (nextSplit != null) {
            context.assignSplit(nextSplit, subtaskId);
        } else {
            context.signalNoMoreSplits(subtaskId);
        }
    }

    @Override
    public void addSplitsBack(List<SplitT> splits, int subtaskId) {
        remainingSplits.addAll(splits);
    }
}
```

`IteratorSourceReader` 源码如下：

```java
public class IteratorSourceReader<
                E, IterT extends Iterator<E>, SplitT extends IteratorSourceSplit<E, IterT>>
        implements SourceReader<E, SplitT> {

    /** The context for this reader, to communicate with the enumerator. */
    private final SourceReaderContext context;

    /** The availability future. This reader is available as soon as a split is assigned. */
    private CompletableFuture<Void> availability;

    /**
     * The iterator producing data. Non-null after a split has been assigned. This field is null or
     * non-null always together with the {@link #currentSplit} field.
     */
    @Nullable private IterT iterator;

    /**
     * The split whose data we return. Non-null after a split has been assigned. This field is null
     * or non-null always together with the {@link #iterator} field.
     */
    @Nullable private SplitT currentSplit;

    /** The remaining splits that were assigned but not yet processed. */
    private final Queue<SplitT> remainingSplits;

    private boolean noMoreSplits;

    public IteratorSourceReader(SourceReaderContext context) {
        this.context = checkNotNull(context);
        this.availability = new CompletableFuture<>();
        this.remainingSplits = new ArrayDeque<>();
    }

    // ------------------------------------------------------------------------

    @Override
    public void start() {
        // request a split if we don't have one
        if (remainingSplits.isEmpty()) {
            context.sendSplitRequest();
        }
    }

    @Override
    public InputStatus pollNext(ReaderOutput<E> output) {
        if (iterator != null) {
            if (iterator.hasNext()) {
                output.collect(iterator.next());
                return InputStatus.MORE_AVAILABLE;
            } else {
                finishSplit();
            }
        }

        return tryMoveToNextSplit();
    }

    private void finishSplit() {
        iterator = null;
        currentSplit = null;

        // request another split if no other is left
        // we do this only here in the finishSplit part to avoid requesting a split
        // whenever the reader is polled and doesn't currently have a split
        if (remainingSplits.isEmpty() && !noMoreSplits) {
            context.sendSplitRequest();
        }
    }

    private InputStatus tryMoveToNextSplit() {
        currentSplit = remainingSplits.poll();
        if (currentSplit != null) {
            iterator = currentSplit.getIterator();
            return InputStatus.MORE_AVAILABLE;
        } else if (noMoreSplits) {
            return InputStatus.END_OF_INPUT;
        } else {
            // ensure we are not called in a loop by resetting the availability future
            if (availability.isDone()) {
                availability = new CompletableFuture<>();
            }

            return InputStatus.NOTHING_AVAILABLE;
        }
    }
}
```

