# 概览

## 基础概念

### 1.kafka 架构

![kafka-arch.jpg](https://cdn.tobebetterjavaer.com/tobebetterjavaer/images/nice-article/weixin-baogwdkafkamsgczhs-6c5e6ab3-ff41-4b91-a083-5f8df6d925bd.jpg)

kafka 组件：

* zookeeper。元数据中心和注册中心
  * 偏移量管理。kafka 后来更改为内部的偏移量 topic
  * 识别新 broker 连接和离开
  * leader 检测
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

### 3.kafka 副本（leader&follower）主从同步原理1

kafka 动态维护了一个同步状态的副本的集合（a set of In-SyncReplicas），简称 ISR，在这个集合中的结点都是和Leader保持高度一致的，任何一条消息只有被这个集合中的每个结点读取并追加到日志中，才会向外部通知“这个消息已经被提交”。

kafka 通过配置 `producer.type` 来确定是 producer 向 broker 发送消息是异步还是同步，默认是同步：

* 同步复制。
  * producer 会先通过 zookeeper 识别到 leader，向 leader 发送消息，leader 收到消息后写入到本地 log 文件。
  * follower 从 leader pull 消息写入本地 log，写入完成后会向 leader 发送 ack 回执。
  * leader 收到所有 follower 的回执向 producer 回传 ack。
* 异步复制。异步发送消息是基于同步发送消息的接口来实现的。client 消息发送时会先放入一个 `BlackingQueue` 队列中然后就返回了。producer 再开启一个线程 `ProducerSendTread` 不断从队列中取出消息，通过同步发送消息的接口将消息发送给 broker。

producer 的这种在内存缓存消息，当累计达到阀值时批量发送请求，小数据I/O太多，会拖慢整体的网络延迟，批量延迟发送事实上提升了网络效率。但是如果在达到阀值前，producer不可用了，缓存的数据将会丢失。

producer 向 broker 发送消息时可以通过配置 acks 属性来确认消息是否成功投递到了 broker：

- `0`：表示不进行消息接收是否成功的确认。延迟最低，但持久性可靠性差。不和 kafka 进行消息接收确认，可能会因为网络异常，缓冲区满的问题，导致消息丢失
- `1`：默认设置，表示当 leader 接收成功时的确认。只有 leader 同步成功而 follower 尚未完成同步，如果 leader 挂了，就会造成数据丢失。此机制提供了较好的延迟和持久性的均衡
- `-1`：表示 leader 和 follower 都接收成功的确认。此机制持久性可靠性最好，但延时性最差。

### 4.kafka 副本（leader&follower）主从同步原理2

在消息写入 leader 后，follower 同步 leader 的消息，以及 consumer 消费 leader 中的消息，producer 向 leader 继续写入消息，这一系列的机制时通过 hw 和 leo 实现的：

* HW（High Watermark）。高水位，它标识了一个特定的消息偏移量（offset），消费者只能拉取到这个水位 offset 之前的消息

* LEO（Log End Offset）。标识当前日志文件中下一条待写入的消息的 offset。在 ISR 集合中的每个副本都会维护自身的 LEO，且HW==LEO。

参考：[Kafka中的HW、LEO、LSO等分别代表什么？](https://cloud.tencent.com/developer/article/1803023)

### 5.producer 发送消息流程

![producer_send.jpg](https://picx.zhimg.com/v2-9d624e2899460d6f6936e8bde6a14471_1440w.jpg)

基本流程：

1. 主线程 producer 中会经过`拦截器`、`序列化器`、`分区器`，然后将处理好的消息发送到`消息累加器`中
2. `消息累加器`每个分区会对应一个队列，在收到消息后，将消息放到队列中
3. 使用 `ProducerBatch` 批量的进行消息发送到 Sender 线程处理（这里为了提高发送效率，减少带宽），`ProducerBatch` 中就是我们需要发送的消息，其中消息累加器中可以使用 `Buffer.memory` 配置，默认为 `32MB`
4. Sender 线程会从队列的队头部开始读取消息，然后创建 request 后会经过会被缓存，然后提交到 `Selector`，`Selector` 发送消息到 kafka 集群
5. 对于一些还没收到 kafka 集群 ack 响应的消息，会将未响应接收消息的请求进行缓存，当收到 kafka 集群 ack 响应后，会将request 请求**在缓存中清除并同时移除消息累加器中的消息**

### 6.consumer 消费模式

consumer 采用 pull 模式从 broker 批量拉取消息。

pull 模式可以让 consumer 根据自身消息消费能力决定拉取速率，防止消息拉取速率超出 consumer 处理能力。同时 consumer 也可以自主决定是否采用批量 pull。

pull 模式的缺点是 consumer 不知道 topic 是否有新消息到达时需要不断地轮询 broker，直到新的消息到达。为了避免这点，kafka 有个参数可以让 consumer 阻塞直到新消息到达(当然也可以阻塞直到新消息数量达到阈值这样就可以批量 pull)。

### 如何保证消息的顺序性

parititon 内消息有序，只需要确保消息发送至同一个 partition 即可：

* topic 设置 partition 只有 1 个
* producer 发送消息时指定发送到具体的 partition。通过 `ProducerRecord`
* producer 发送时设置消息的 key，kafka 对 key 进行 hash 计算，确保同一个 key 的消息进入同一个 partition

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

### kafka 数据丢失原因

丢失原因：

* producer。
  * producer 在向 broker 发送消息选择异步发送，未发送到 broker 前 producer 崩溃重启，数据丢失
  * producer 端的 acks 设置为发送即认为成功，producer 不会确认 leader 是否接收成功，导致 producer 存在一定丢失消息概率
* broker。producer 端的 acks 设置为 1，即 leader 确认认为发送成功。leader 所在的 broker 发生崩溃，leader 中的数据未同步到 follower，导致数据丢失
* consumer。consumer 消费消息时先提交偏移位点，后消费消息，在提交偏移位点后崩溃没有消费消息。consumer 提交位点方式选择自动提交，即先提交位点后消费消息

解决办法：

* producer。
  * 设置 acks 为 1 或 -1。默认为 1
  * 设置 producer 重试参数：
    * `retries = Integer.MAX_VALUE`。重试次数，需大于 0
    * `max.in.flight.requests.per.connection = 1`。为保证消息发送重试时依然有序，需设置此参数
    * `retry.backoff.ms`。重试间隔，默认为 `100ms`
  * 调整发送方式，在异步发送代码中对 `#send()` 方法的 `future` 对象设置回调，当发生异常时进行重试
* broker
  * `unclean.leader.election.enable`。表示哪些 follower 可以选举为 leader。设置为 false，表示落后太多的 follower 不可选举为 leader
  * `replication.factor`。分区副本的个数，建议设置为 >=3 个
  * `min.insync.replicas`。该参数表示消息至少要被写入成功到 ISR 多少个副本才算`已提交`。推荐设置成：`replication.factor =min.insync.replicas +1`, 最大限度保证系统可用性
* consumer
  * 关闭自动提交。`enable.auto.commit = false`
  * 业务增加幂等处理

### kafka 数据重复原因

重复原因：

* producer。producer 发送消息到 broker 后，因为异常如网络原因没有收到 broker 返回的 acks，导致重试重复发送。同一条消息在 topic 中存了多条
* consumer。consumer 消费消息后没有提交偏移位点，consumer 崩溃重启后还是从之前的偏移位点开始消费，导致数据重复消费。topic 中的消息被多次消费

解决办法：

* 幂等
* 事务

### kafka 是如何实现 exactly once 语义的？

消息的投递语义主要分为三种：

- At Most Once。消息投递至多一次，可能会丢但不会出现重复。
- At Least Once。消息投递至少一次，可能会出现重复但不会丢。kafka 默认提供
- **Exactly Once**。消息投递正好一次，不会出现重复也不会丢。

kafka 主要实现`流计算`场景下的 exactly once 能力，数据必须是从 kafka 读取，计算结果在写入 kafka 中。如果流计算中的状态存储依赖外部系统，则无法在系统出现故障崩溃时保证 exactly once。比如消费者消费一批数据后，在崩溃前没有提交消费位点，重启后可能会消费到重复的消息。flink 的 exactly once 语义下是将 kafka 消费位点保存到 checkpoint 或 savepoint 中，当flink 重启后读取 checkpoint 或 savepoint 中的 kafka 消费位点重新消费，则不会出现重复消费，所以可能重复消费的原因是任务没有把消费位点提交到 kafka 中，也没有自己额外存下来，做不到从崩溃前的位点消费。

kafka 通过 `幂等性（Idempotence）`和`事务（Transaction）`实现 exactly once。

- 幂等性只能保证单分区、单会话上的消息幂等性
- 而事务能够保证跨分区、跨会话间的幂等性，但是事务性能比幂等性差

#### 幂等性

`幂等性`是指可以安全地进行重试，而不会对系统造成破坏。kafka 中 producer 默认不是幂等性的，可以通过参数开启：

*  `props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG， true)`

`enable.idempotence` 被设置成 `true` 后，producer 自动升级成幂等性 producer，其他所有的代码逻辑都不需要改变，kafka 自动帮你做消息的重复去重，kafka 通过`空间去换时间`的思路在 broker 多保存一些字段记录消息信息进行去重，当 producer 发送相同字段值的消息后，broker 可以识别消息重复发送，会丢弃掉这些重复消息。

kafka 在底层设计架构中引入了 producerID 和 SequenceNumber。

producer 需要做的只有两件事：

- 启动时向 broker 申请一个 producerID
- 为每条消息绑定一个 SequenceNumber

broker 收到消息后会以 producerID 为单位存储 SequenceNumber，也就是说即时 Producer 重复发送了， Broker 端也会将其过滤掉。

实现比较简单，同样的限制也比较大：

- 首先，它只能保证单分区上的幂等性

  。即一个幂等性 producer 能够保证某个主题的一个分区上不出现重复消息，它无法实现多个分区的幂等性。

  - 因为 SequenceNumber 是以 Topic + Partition 为单位单调递增的，如果一条消息被发送到了多个分区必然会分配到不同的 SequenceNumber ，导致重复问题。

- 其次，它只能实现单会话上的幂等性

  。不能实现跨会话的幂等性。当你重启 producer 进程之后，这种幂等性保证就丧失了。

  - 重启 producer 后会分配一个新的 ProducerID，相当于之前保存的 SequenceNumber 就丢失了。

#### 事务

kafka 自 0.11 版本开始也提供了对事务的支持，支持 `read committed` 隔离级别。它能保证 producer 将多条消息原子性地写入到目标分区（可写入多个分区），同时也能保证 consumer 只能看到事务成功提交的消息。事务型 producer 重启后 kafka 依然可以保证`发送消息`的精确一次处理。

设置事务型 producer：

- 开启 `enable.idempotence = true`。
- 设置 producer 端参数 `transactional. id`。最好为其设置一个有意义的名字。

同时 producer 发送事务消息代码也与普通消息不同，需要加入事务处理：

```java
producer.initTransactions();
try {
            producer.beginTransaction();
            producer.send(record1);
            producer.send(record2);
            producer.commitTransaction();
} catch (KafkaException e) {
            producer.abortTransaction();
}
```

consumer 读取事务消息时也需要做一些配置，设置 `isolation.level` 参数：

* read_uncommitted。默认值，consumer 能够读取到 kafka 写入的任何消息，不论事务型 producer 提交事务还是终止事务，其写入的消息都可以读取
* read_committed。consumer 只会读取事务型 producer 成功提交事务写入的消息，同时它也可以读取非事务型 producer 发送的所有消息

### kafka rebalance 原理

kafka 中 topic 中的 partition 分配给 consumer group 中的 consumer，需确定 group 中的 consumer 消费哪几个 partition。当 consumer group 发生变动时需重新进行分配，这个过程就叫做 rebalance。

rebalance 影响：rebalance 期间 consumer 不消费消息，会造成应用消费 kafka 消息 tps 抖动，数据延迟以及 kafka topic 消息积压。

rebalance 触发原因：

* group 中 consumer 发生变动，新增或减少
* topic 动态增加 partition
* group 订阅了更多的 topic

rebalance 目的：

* 负载均衡。通过重新分配 partition，使得 consumer 消费数据负载更加均衡
* 故障恢复。当 consumer 或 partition 发生故障时，系统能够自动恢复
* 扩展性。支持动态增加/减少 consumer，动态添加 partition，增加扩展性
* 数据一致性。当 consumer 减少或动态添加 partition 时，可以确保不会因为 consumer 减少，导致分配的 partition 不被消费，动态添加 partition 也是类似

rebalance 策略：

* range
* round-robin。轮询
* sticky。粘性

rebalance 过程：

* 选择组协调器（GroupCoordinator）。每个 consumer group 都会选择一个 broker 作为自己的组协调器 coordinator，负责监控这个消费组里的所有消费者的心跳，以及判断是否宕机，然后开启消费者 rebalance
* 加入消费组。在成功找到消费组所对应的 `GroupCoordinator` 之后就进入加入消费组的阶段，在此阶段的消费者会向 `GroupCoordinator` 发送 `JoinGroupRequest` 请求，并处理响应。然后 `GroupCoordinator` 从一个consumer group 中选择一个加入 group 的 consumer 作为 leader (消费组协调器)，把 consumer group 情况发送给这个 leader，接着这个 leader 会负责制定分区方案
* SyncGroup。coordinator 通过 SyncGroup 把 leader 制定的分区方案下发给所有的 consumer，每个 consumer 从指定的分区 leader broker 建立连接消费数据

### 如何处理消息积压

### kafka 如何实现延迟消息

参考链接：

* [高吞吐低延迟：朴朴基于 Kafka 的延迟队列实践](https://www.infoq.cn/article/2ymoli5o2ooj1vw3r3q7)

RocketMQ 在 4.x 版本只支持18个延迟级别，在 5.x 版本支持任意延迟等级的延迟队列，能够满足业务高吞吐、低延迟的要求。RocketMQ 4.x 的延迟队列主要在 client 完成，5.x 版本在 server 完成，基于 Kafka 实现延迟队列，主要参考 RocketMQ 4.x 的实现。

在 RocketMQ 中定义了 18 个延迟级别，分别是 `1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h`，消息创建的时候，调用 `setDelayTimeLevel(int level)` 方法设置延迟时间，如 `setDelayTimeLevel(level = 3)` 也就是延迟 `10s`，因为 `level = 3` 对应 `10s` 延迟。

当用户定义一个延迟 topic 如 `topic_order_delay`，当向 `topic_order_delay` 发送消息时，broker 并不会将消息直接写入 `topic_order_delay` 而是写入一个内部队列，如 `1s` 写入 `1s` 对应的队列，`5s` 写入 `5s` 对应的队列等等。也即 RockmeMQ 整个集群的所有延迟 topic 的延迟消息都会放入对应级别的一个内部队列，放入同一个内部队列的好处是：

* 同一内部队列中的消息延时时间是一致的，都是 `1s` 或 `5s`。
* 内部队列中的消息时按照消息到期时间进行递增排序的，说的简单直白就是队列中消息越靠前的到期时间越早。

每个内部队列都有一个定时任务按照固定频率扫描到期的消息，当检测到期后重新发送入对应的 topic。

![kafka_delay.png](https://static001.geekbang.org/infoq/ea/ea53c31cefca6f7d24fcf14e19437c62.png)

基于 kafka 的实现也类似，首先在 kafka 中定义一系列对应的队列，每个队列对应一个延迟级别，在为每个队列设置一个消费者，通过 pull 方式拉取到期的消息，然后发送到真实的 topic。应用消费真实的 topic 即可。

* sdk 或 client。对 kafka client 进行封装，当发送延迟消息时将消息进行重新封装，发送到对应延迟级别的队列中
* 延迟调度服务。监控不同延迟级别的队列，消息到期后取出重新发送入对应的业务 topic

在延迟调度服务中，需要将延迟级别对应的 topic 中的到期消息取出并投递到对应的业务 topic，延迟调度服务需要`准确`和`低延迟`地完成内部延迟队列和业务 topic 的投递。

延迟调度服务设计为 kafka topic 的消费者，消息处理逻辑将收到的消息检测是否到期，如果到期则发送入业务 topic，如果没有到期则 sleep 一段时间后重新消费，继续进行检测：

* 休眠时间设置。不能过长，过长会导致延迟，不能过短，否则会频繁无效拉取。可以根据收到的消息设置休眠时长为需要投递的时间。但是过长的休眠时长会导致 kafka consumer group 发生 rebalance，因此休眠时长会设置一个最长休眠时长。

通过 sleep 机制可以确保延迟队列消息消费的及时性。

因为 kafka topic 下有多个 partition，如果 consumer group 中的某个 consumer 负责其中几个 partition 的消费，如果 consumer sleep，则几个 partition 的消费都会停止。不同 partition 中的消息有快有慢，直接按照收到的消息的到期时间设置 sleep 时长会导致比较快的 partition 的消息无法及时投递，造成投递延迟。解决思路是将延迟队列 topic 的 partition 数目设置 1，这样就确保延迟队列 topic 的消息是全局有序的，第一条消息就是最早到期的。

但是延迟队列 topic 的 partition 只有 1 个的话，消息吞吐量可能会有上限，不支持水平扩展。处理方式是将对应级别的延迟队列 topic 设置为多个，比如 `5s` 延迟级别可以设置 10 个 topic（这 10 个延迟队列 topic 的 partition 数量都是 1），每个 topic 都有各自的 consumer 来进行上述到期发送逻辑。sdk 发送延迟消息时只需要从 10 个 topic 中选择一个投递即可。这样就可以增加吞吐量。

同时延迟级别也可以按需设置，可以设置很多的延迟级别出来。

