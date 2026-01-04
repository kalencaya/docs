# Flink

Flink 介绍
- [因为不懂 Flink on K8S 类加载机制，引发了线上事故。(建议收藏)](https://mp.weixin.qq.com/s/H4H_g3s_7BhodnfKcxiT1g)
- [全网最详细4W字Flink入门笔记（上）](https://mp.weixin.qq.com/s/Ux3PFErASMB0jYubwdaMFg)
- [全网最详细4W字Flink入门笔记（下）](https://mp.weixin.qq.com/s/WukF3Y4Bn-gVKEtK2IKj9w)
- [Flink 累加器是什么？与广播变量有什么区别？](https://mp.weixin.qq.com/s/C2tnSJdLCaIzVccuxDf9ZA)
- [一文详解 Flink 的分布式缓存使用步骤！](https://mp.weixin.qq.com/s/Jgx7w1WYu_SNgnYGc6e93A)

## 窗口

* [Flink 为什么需要窗口（Window）？](https://mp.weixin.qq.com/s/pbtBi7QEY5cI27bX_RExSQ)
* [一篇文章带你彻底明白Flink中Window的2个类型](https://mp.weixin.qq.com/s/dSVkM5YADu3do8FTFaBShw)
* [Flink 时间窗口全解析！（建议收藏）](https://mp.weixin.qq.com/s/Ddqt_wAfGHNxo-6NdcRQCg)
* [Flink中，如何使用滚动窗口？](https://mp.weixin.qq.com/s/P9KdUaYPEtUK0n-mKsReiQ)
* [Flink窗口函数：滑动窗口使用方法详解](https://mp.weixin.qq.com/s/xFWOu2rFFf4IB7WmqXcC8Q)
* [如何使用定长和可变的Session gap来建立会话窗口？](https://mp.weixin.qq.com/s/B628H4SvGdtgAzx5PHdIFQ)
* [窗口如何确定什么时候执行触发和关闭？](https://mp.weixin.qq.com/s/Nj2RnN9-tnm4y_4FzTut6A)
* [Flink | 想要对数据加窗口，通过什么调用方法实现？](https://mp.weixin.qq.com/s/v2-rEJLldHybO98S_WZ_1w)
* [Flink 滚动窗口的计算实现（附详细代码）](https://mp.weixin.qq.com/s/qw4GvYvHl0VeuJrS2p3Lxg)
* [Time Window 案例：滑动时间窗口案例的代码实现](https://mp.weixin.qq.com/s/YuK5g9N-VpulqQQ-DVxOvg)
* [Count-Window 案例：滚动计数窗口及滑动计数窗口的代码实现](https://mp.weixin.qq.com/s/KzW40-0stuOUpiKohxBBiQ)
* [Flink中会话窗口是什么？这篇文章讲明白了！](https://mp.weixin.qq.com/s/-itdPzBGoiI2cbtWeXuxBg)
* [2个案例带你彻底搞懂[会话窗口]的计算实现](https://mp.weixin.qq.com/s/X2PP1ghhRcTscHWdTcTLmg)

## State&Checkpoint

* [Flink的状态state概念详解](https://mp.weixin.qq.com/s/NteZdiHGxlN_NttLxoSpEw)
* [什么是有状态的计算？](https://mp.weixin.qq.com/s/Cy72bIsHTneACtcM8x6FMw)
* [哪些场景需要使用状态？](https://mp.weixin.qq.com/s/LV7OSeYHPGJyRPck2_lHKg)
* [Flink中的State有哪些类型划分？有什么区别？](https://mp.weixin.qq.com/s/JgtSq_FhseXfikMZ2XsXNQ)
* [Flink中存储State的数据结构都有哪些？](https://mp.weixin.qq.com/s/GPcenXyABcWqZVxzbP37JQ)
* [如何在 Flink 中使用 state ？（附案例代码）](https://mp.weixin.qq.com/s/sS5gh71zgbS42ZL3Fu6LOA)
* [Flink中，State TTL 功能具体要怎么用？](https://mp.weixin.qq.com/s/Pq6UgWzKuh5TcQbMMZ1fDw)
* [State TTL全量快照时清理过期数据如何配置？](https://mp.weixin.qq.com/s/mwETFEJAtT2XtW4_YuMeIg)
* [Flink中，增量式清理状态数据怎么进行配置？](https://mp.weixin.qq.com/s/K-R6-Kb3YeTydjo6TfT8Ew)
* [Flink 提供的 RocksDB 压缩过滤器，是怎么完成过期数据处理的？](https://mp.weixin.qq.com/s/h_fCFosepvw7pKOZ_VDPhw)
* [案例详解 Flink中State TTL 具体使用方法](https://mp.weixin.qq.com/s/5njkwh81lXhcMOE3jEl7ag)
* [Flink中，Checkpoint 与 state 有什么关系？](https://mp.weixin.qq.com/s/VjQl55YHjmftLGUgKfZ9vQ)
* [一文详解 Flink中的Checkpoint是什么？](https://mp.weixin.qq.com/s/cA6zFtlgAFTsRHqEd-0R0g)
* [详解Flink 分布式快照的核心概念Barrier栅栏](https://mp.weixin.qq.com/s/-xyZnRGOFGWkqbRcOc81nA)
* [两个输入源的情况下，checkpoint实现流程是什么样的？](https://mp.weixin.qq.com/s/ZiYsMwku26usPvuduUjsVA)
* [Checkpoint持久化存储什么时候使用？](https://mp.weixin.qq.com/s/-AjJsEdh9x6u2yFaT8slOA)
* [Flink | 修改State Backend的方式有哪些？](https://mp.weixin.qq.com/s/1cIsjt7x6MwvDq-Fjra7nw)
* [Flink进阶之Checkpoint的高级选项详解！](https://mp.weixin.qq.com/s/OOkC0nRxN5P0YasJsP7MBA)
* [当你取消作业时外部checkpoint会产生什么行为？](https://mp.weixin.qq.com/s/WcqS3-PraSoSRXYoZULlIA)
* [Flink 从传统后端迁移代码如何配置？](https://mp.weixin.qq.com/s/Cp-QtwxPb67WcXFydu0O7Q)
* [Flink 的 Savepoint 与 Checkpoint 有什么不同之处？](https://mp.weixin.qq.com/s/5gBArmdzPmUKEGSUUdOt3Q)
* [Flink的广播变量是什么？详细的操作步骤有哪些？](https://mp.weixin.qq.com/s/hrsYJvUS-0n-5XzPtAZo3w)
* [Flink 中的 Broadcast State 是什么？可以在哪些场景使用？](https://mp.weixin.qq.com/s/YirfTbhG2OkTLFqeyAb44Q)
* [Broadcast 广播状态案例分析，实现原理一目了然！](https://mp.weixin.qq.com/s/l35XG_1Qtu7-S-_ftMEVlw)
* [Flink中，为什么要有 Watermark？](https://mp.weixin.qq.com/s/dzkGj8kdaS65Ap5X9ulpZA)
* [Flink中，如何使用水印解决网络延迟问题？](https://mp.weixin.qq.com/s/XKC3NBBi2weoRhbcrf2SUw)
* [详解WatermarkStrategy在Flink中的两种使用方式](https://mp.weixin.qq.com/s/d-773Za-AwLud_0MPrd6pQ)
* [水印的生成策略-内置水印生成策略如何使用？](https://mp.weixin.qq.com/s/IfHkX6qRbpesP_WLCt1Wng)
* [Flink水印生成方式有哪些？](https://mp.weixin.qq.com/s/sEm_gkD8sS-l7IeEgwX5YQ)
* [Flink中，升序流水印的案例实现（附详细代码）](https://mp.weixin.qq.com/s/tTC9zHdThvMcX9WybHv-jQ)
* [如何解决Flink水印乱序的数据丢失问题呢？](https://mp.weixin.qq.com/s/6K8M7PZMRaC8yKA3BxvSqg)
* [如何实现直接在数据源上使用Watermark？](https://mp.weixin.qq.com/s/1wScMfVCnS1CJnwCKwHL6A)
* [有没有什么办法能处理Flink长期延迟的数据呢？](https://mp.weixin.qq.com/s/g15R4N4KKzTnZi-HzL2e4Q)
* [Flink对于延迟数据的解决方法：allowedLateness](https://mp.weixin.qq.com/s/6ahxtA4kyXLUIWggVEDvpQ)
* [对于迟到太久的数据，Flink如何收集？](https://mp.weixin.qq.com/s/J4Mnqo9ly-Xfz-dBEqU95g)
* [一个案例详解Flink延迟数据处理流程（附代码）](https://mp.weixin.qq.com/s/AKv9xSC34h0wqbmAxFfXIw)

## 精确一致性

* [Flink 流处理的数据处理语义](https://mp.weixin.qq.com/s/nnxznHc3urPwfZLDTIpO2Q)
* [Flink 流处理引擎提供的数据处理语义有哪些？](https://mp.weixin.qq.com/s/zsJH392eMNiuVXCn3ypszg)
* [『exactly-once』和『End-to-End Exactly-Once』的区别是什么？](https://mp.weixin.qq.com/s/Q3Z4jafkKw9qwjlr5ViJ6g)
* [End-to-End Exactly-Once的两种实现方式详解](https://mp.weixin.qq.com/s/5RyuAU-y5Z9k_5siwnJNuA)
* [对于sink端，Flink端到端的精确一次语义如何实现？](https://mp.weixin.qq.com/s/o7v_H_-_chBRdKu36tF0pg)
* [Flink的两阶段提交协议是如何支持端到端的精确语义的？](https://mp.weixin.qq.com/s/AprTEdzPJrS79Q2494YR7g)
* [两阶段提交协议如何在一个读写Kafka的Flink程序中实现端到端的Exactly-Once语义？](https://mp.weixin.qq.com/s/Sj8mIIyuh8N9sGnjP9HIQQ)
* [Flink+Kafka实现End-to-End Exactly-Once的详细代码演示](https://mp.weixin.qq.com/s/jWDQI3WG-PS3x5djMGY_zw)
* [一文带你彻底掌握Flink+MySQL实现End-to-End Exactly-Once](https://mp.weixin.qq.com/s/mKz-i02UKpIjP2qCvqFjqQ)

## 重启

* [Flink的重启策略如何使用？](https://mp.weixin.qq.com/s/NtFJsOLXVfAy929B4qHRFg)
* [Flink固定延迟重启策略怎么配置启用？](https://mp.weixin.qq.com/s/57JFoR9Blly1iDFLN4vXKg)
* [Flink失败率重启策略有哪两种配置方式？](https://mp.weixin.qq.com/s/6P1YLH0I3gLtU98duX6Mxg)

## Join

join 的分类

* window join
* interval join
* lookup join

文章介绍

* [Flink高频面试题：双流Join是什么？](https://mp.weixin.qq.com/s/8kpRT_DkGigyJjZTOsu8jA)
* [Flink 双流Join中，Window Join的实现原理是什么？](https://mp.weixin.qq.com/s/ziMoUUVUca0qQShomziaUQ)
* [Flink 双流Join中，Interval Join的实现原理是什么？](https://mp.weixin.qq.com/s/DIRP0xLPMDdT3Lu1E2qnEA)
* [一个案例彻底掌握Window Join[附详细代码]](https://mp.weixin.qq.com/s/N2DAZb0b8gIdygZUZROkZg)
* [Flink Table Store 0.3 构建流式数仓最佳实践](https://flink-learning.org.cn/article/detail/73fa0115d226c7f496240f180736b884?spm=a2csy.flink.0.0.49495badC4blix&name=article&tab=suoyou&page=7)。对 Flink 的多种 join 有一个介绍
* [Flink流计算常用算子之Union使用方法及代码演示](https://mp.weixin.qq.com/s/svXRgBHtgnSH0EWVBCdiUQ)
* [Flink中如何使用Connect实现两个数据流合并？](https://mp.weixin.qq.com/s/jUNpytO2EGSaI0FfSSYTEQ)
* [Flink数据分流：split、select和Side Outputs](https://mp.weixin.qq.com/s/Rb7R5fO_C6HmjiTElaPrww)

## 分区策略

* [Flink物理分区：Global Partitioner](https://mp.weixin.qq.com/s/UAiuPGefEF8YJBI0yRAXXg)
* [Flink中，如何使用分区器按照均匀分布随机划分元素？](https://mp.weixin.qq.com/s/XAWVCfpIvuB6WtVwGu2_fA)
* [Flink物理分区之：Broadcast Partitioner](https://mp.weixin.qq.com/s/8dXSP0iAvtH2FmrBRiDUjQ)
* [Flink中数据倾斜问题怎么解决？](https://mp.weixin.qq.com/s/Z5CFB6IO8TJNfJMDTrj6-A)
* [Rebalance和rescale的区别是什么？](https://mp.weixin.qq.com/s/AwecHIkAK7_a5agCtjy_Vw)
* [详解Flink中Forward Partitioner的使用方法，助力流式计算高效运行](https://mp.weixin.qq.com/s/mCbmqdEdCWWWFI1mk_3NEg)
* [Flink中，如何按照指定的规则进行分区？](https://mp.weixin.qq.com/s/tR4er-dE3UAHdUZdCaxdFA)

## function

* [Flink增量聚合函数：reduce和aggregate的区别是什么？](https://mp.weixin.qq.com/s/2cwkxdmjXlljy2dv15vbGA)
* [Flink全量聚合函数：apply和process这两种实现方法有什么区别？](https://mp.weixin.qq.com/s/IYvwAvaa4efXcrgj9KnP-w)
* [Flink 中 ProcessFunction 有哪些分类？](https://mp.weixin.qq.com/s/IzyX9cahmeB3chMtctsNng)
* [一文详解 KeyedProcessFunction](https://mp.weixin.qq.com/s/a_B1XLEblbs216CbmLAESw)
* [ProcessFunction案例实现代码详解](https://mp.weixin.qq.com/s/R6tB9-1bwWt6pOdeG0O0Cg)

## connector

* [如何将Kafka中的二进制数据转换为Java或者Scala对象？](https://mp.weixin.qq.com/s/o_Qb2j-J9adinjjg1o2-tw)
* [确定 Kafka 分区起始位置的配置方法详解！](https://mp.weixin.qq.com/s/HfZwXaQvwKzaE48k2sfP5Q)
* [关于Kafka的Topic和分区发现，这回终于讲清楚了！](https://mp.weixin.qq.com/s/ljX2DOcYmOANYumEDSY0Vg)
* [Flink Kafka Producer: 将消息流写入Kafka topic的必备工具](https://mp.weixin.qq.com/s/eeSaeiuAswOCBJVuPSw3_g)
* [Kafka Producer 如何保证容错和仅一次语义？](https://mp.weixin.qq.com/s/K7-Y0VLLSF1zMwcFku2WGQ)
* [2个案例详解 Kafka Consumer 和 Kafka Producer （附代码）](https://mp.weixin.qq.com/s/Io3gx-xGwlr_z-YR78AuzA)
* [如何实现 Flink 读写数据到 Redis ？](https://mp.weixin.qq.com/s/GDKlZtLqx6xR4wxBnteRnQ)

## Ingemar 系列文章

* [Flink是如何做到同时支持流处理和批处理系统的？](https://mp.weixin.qq.com/s/rpND7DGnOtfT4N5ekhdiUA)
* [Flink架构体系 | Flink中的重要角色解析](https://mp.weixin.qq.com/s/vlxe1YbGa54xJqOX60VT4Q)。资源提供者，部署模式，部署流程
* [Flink运行时的架构组件有什么职责？](https://mp.weixin.qq.com/s/SaaKjXDoy3N1nf8QsVPEMQ)
* [一文彻底学会Flink任务调度原理（建议收藏！）](https://mp.weixin.qq.com/s/DeNtaLlzcv3uIgRbqcU4Pw)
* [Apache Flink 运行架构 | 槽共享有什么好处？](https://mp.weixin.qq.com/s/WGNvTIz3Uk3k743mrF4LGQ)
* [Flink DataStream API编程步骤有哪些？](https://mp.weixin.qq.com/s/26juY2NZ5b_4YP33iwd5vQ)

## operator chain

* [Flink的任务链是什么？如何创建任务链或禁止任务链？](https://mp.weixin.qq.com/s/Gxi12ntW3X7LbBex_IsHUA)
* [Flink操作链是什么？如何开启和禁用操作链？](https://mp.weixin.qq.com/s/M_aYk__Re9kF79JmFTS67g)