# 概览

## 基础概念

### 1.kafka 架构

![kafka-arch.jpg](https://cdn.tobebetterjavaer.com/tobebetterjavaer/images/nice-article/weixin-baogwdkafkamsgczhs-6c5e6ab3-ff41-4b91-a083-5f8df6d925bd.jpg)

kafka 组件：

* zookeeper。元数据中心和注册中心
* broker。kafka 以集群方式运行，每个节点称作 broker
* consumer。kafka topic 消费者
* consumer group。每个 kafka consumer 属于一个 consumer group，共同使用一个 groupId
* producer。消息生产者，发送消息到 kafka 集群

### 2.kafka topic&partition

![topic_partition.jpg](https://img-blog.csdnimg.cn/27d3c94e2313417ba5a2b287dfaad84b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBARGF0Yei3s-WKqA==,size_20,color_FFFFFF,t_70,g_se,x_16)

在 kafka 中消息以 topic 进行组织，在逻辑上 topic 是一个 queue，通过 topic 实现发布-订阅机制。

实际上每个 topic 由多个 partition 组成，消息发送时按照 key 确定发送至不同的 partition。consumer 消费 topic 的消息是 partition 有序，topic 无序：发送到同一个 partition 的消息会被有序消费，不同 partition 中的消息消费顺序不可预知。

每个 partition 对应磁盘上的一个文件，同时为了保证容错，每个 partition 会有多个副本，副本位于不同的 broker 上。副本分为 leader 和 follower，leader 负责处理读写，follower 则同步 leader 数据：

* AR(Assigned Replicas)。一个分区中的所有副本统称为 AR；
* ISR(In-Sync Replicas)。leader 副本和所有保持一定程度同步的 follower 副本（包括 leader 本身）组成 ISR；
* OSR(Out-of-Sync Raplicas)。与 ISR 相反，没有与 leader 副本保持一定程度同步的所有 follower 副本组成OSR；

producer 发送消息给 leader，follower 从 leader 中同步消息，在同一时刻，所有副本中的消息不完全相同，也就是说同步期间，follower 相对于 leader 而言会有一定程度上的滞后，这个滞后程度是可以通过参数来配置的。

那么，我们就可以厘清了它们三者的关系：AR = ISR + OSR。

leader 负责维护和跟踪 ISR 集合中所有 follower 副本的滞后状态，当 follower 出现滞后太多或者失效时，leader 将会把它从 ISR 集合中剔除。

当然，如果 OSR 集合中有 follower 同步范围追上了 leader，那么 leader 也会把它从 OSR 集合中转移至 ISR 集合。

一般情况下，当 leader 发送故障或失效时，只有 ISR 集合中的 follower 才有资格被选举为新的 leader，而 OSR 集合中的 follower 则没有这个机会（不过可以修改参数配置来改变）。

### 2.kafka 为什么这么快？大数据中流计算、日志采集为什么采用 kafka？（高吞吐量、低延迟或高性能原因）

* producer
  * 批量发送。kafka 通过将多个消息打包成一个批次，减少了网络传输和磁盘写入的次数，从而提高了消息的吞吐量和传输效率
  * 异步发送。生产者可以异步发送消息，不必等待每个消息的确认，这大大提高了消息发送的效率
  * 消息压缩。支持对消息进行压缩，减少网络传输的数据量
  * 并行发送。通过将数据分布在不同的分区（partitions）中，生产者可以并行发送消息，从而提高了吞吐量
* broker
  * 零拷贝技术。数据直接在内核完成输入和输出，无需切换到用户空间。kafka 使用零拷贝技术来避免了数据的拷贝操作，隆低了内存和 CPU 的使用率，提高了系统的件能。
  * mmap 文件映射。
  * 磁盘顺序写入。kafka 把消息存储在磁盘上，且以顺序的方式写入数据。顺序写入比随机写入速度快很多，因为它减少了磁头寻道时间。避免了随机读写带来的性能损耗，提高了磁盘的使用效率
  * 页缓存（PageCache）。kafka 将其数据存储在磁盘中，但在访问数据时，它会先将数据加载到统的页缓存中，并在页缓存中保留一份副本，从而实现快速的数据访问
  * 稀疏索引。kafka 存储消息是通过分段的日志文件，每个分段都有自己的索引文件。这些索引文件中的条目不是对分段中的每条消息都建立索引，而是每隔一定数量的消息建立一个索引点，这就构成了稀疏索引。稀疏索引减少了索引大小，使得加载到内存中的索引更小，提高了查找特定消息的效率
  * 分区和副本。kafka 采用分区和副本的机制，可以将数据分散到多个节点上讲行处理，从而实现了分布式的高可用件和负载均衡
* consumer
  * 磁盘顺序读取。consumer 读取 parititon 数据时，按照偏移量开始顺序读取
  * 批量拉取。kafka 支持批量拉取消息，可以一次性拉取多个消息进行消费。减少网络消耗，提升性能
  * 消费者群组。通过消费者群组可以实现消息的负载均衡和容错处理
  * 并行消费。不同的消费者可以独立地消费不同的分区，实现消费的并行处理

