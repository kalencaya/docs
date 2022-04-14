# Flink connector——source framework(2)

`SourceReader` 是一个底层的 API，用户自行与 `SplitEnumerator` 交互请求分片，使用自己的线程处理分片，获取和发送 record。Flink 提供 `SourceReaderBase` 基础类，提供 pre-defined 功能帮助开发者减少编写 `SourceReader` 所需要的工作量。

从外部系统获取分片

split 处理的线程模型

维护每个分片的水印（watermark）以保证水印对齐

维护每个分片的状态以进行 Checkpoint



https://www.ai2news.com/blog/1159020/





`SplitEnumerator` 以单线程进行数据 split，分发到 TaskManager 上的 `SourceReader`，`SourceReader` 的数量等于 source 的并行度。比如 Kafka source，`SplitEnumerator` 将 topic 的 partition 作为 split，分配给 `SourceReader`，假设 source 的并行度设置为 1，则一个 `SourceReader` 会处理 topic 下的所有 partitions。`SourceReader` 往往要处理多个 split，同时在处理 split 的时候也不可避免地执行阻塞操作，为了避免阻塞 `SourceReader` 线程，需要拉起专门的 I/O 线程执行阻塞操作。

`SourceReader` 提供 3 种线程模型来处理 splits。

### 单线程单 split



![single_split](Flink connector——source framework(2).assets/single_split.png)

`SourceReader` 以单线程方式处理分配的 split，每次只处理一个 split，处理完毕后继续处理下一个 split。

具体实现为 `SingleThreadFetcherManager`。

### 单线程多路复用多 split

![multi_split_multiplexed](Flink connector——source framework(2).assets/multi_split_multiplexed.png)

单线程同时处理多个 split。

具体实现为 `SingleThreadMultiplexSourceReaderBase`。

### 多线程多 split

![multi_split_multi_threaded](Flink connector——source framework(2).assets/multi_split_multi_threaded.png)

## SplitFetcherManager

`SplitFetcherManager` 是真正干活的，负责拉取每个 `Split` 的数据。





`SplitReader` 只专注于从外部系统读取记录，阻塞、轮询、同步读取数据。



`SplitFetcher` 是拉取任务，封装了 `SplitReader`。





Flink 提供了开箱即用的线程模型。