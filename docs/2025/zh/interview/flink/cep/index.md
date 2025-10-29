# 概览

## cep介绍

### 模式

模式分为 2 种：

* 单个模式。单个模式又分为 2 种形式：单例和循环
  * 单例。单例模式只处理一个事件，如客服智能质检中发言数据，每条发言就是一个事件。单例模式可对单个事件进行匹配，如针对客服发言检测：客服发言 not contains ['辱骂词汇'] and 客服发言 not contains ['索要敏感信息']
  * 循环。循环模式可处理多个事件。期望指定事件出现一次或多次，比如客服发言不能机器僵硬，反复回复：“请稍等，正在处理”，即检测：客服发言 == “请稍等，正在处理” 出现次数不能大于 3 次。
  * 说明。循环模式是单例模式的升级，对单例增加`量词`即成为循环模式
* 组合模式。组合模式是对单个模式的扩张，如在风控领域当用户连续

### 连续性

* `next()`，严格连续。期望所有匹配的事件严格的一个接一个出现，中间没有任何不匹配的事件。如事件序列 [a, b, c, c, b, a, c]，针对 a 事件后下一个必须是事件 b，可以比配成功
* `followedBy`，松散连续。忽略匹配的事件之间的不匹配的事件。如事件序列 [a, c, c, b, a, c]，检测事件 a 发生后是否发生事件 b，可以匹配成功
* `followedByAny`，不确定的松散连续。更进一步的松散连续，允许忽略掉一些匹配事件的附加匹配。如事件序列 [a, c, c, b, b, a, c]，检测事件 a 发生后是否发生事件 b，可以匹配成功，而且会匹配出 2 条结果
* 还有 `notNext` 和 `notFollowedBy`。如果模式序列没有定义时间约束，则不能以 `notFollowedBy()` 结尾。

循环模式中的连续性如 `times()` 默认是松散连续，如果想使用`严格连续` 需使用 `consecutive()` 方法，如果使用 `不确定的松散连续`需使用 `allowCombinations()` 方法。

### 匹配后跳过策略



### 经验

* 如何实现在 b 事件之前没有发生 a 事件？正常来说是 a 事件之后发生（未发生）b 事件，但如果从 b 事件出发进行逆推，b 事件发生前需要匹配未发生 a 事件。这种场景可以先设置一个 任意事件开始 notnext or notfollowedby 

## 动态 cep

* 阿里云版。阿里云实时计算服务提供了对动态 cep 的支持，未开源
* [Flink-CEPplus](https://github.com/ljygz/Flink-CEPplus)。针对 flink 1.8 版本可做参考
* [flink-dynamic-cep](https://github.com/shirukai/flink-dynamic-cep)。针对 flink 1.17 版本，对 flink 侵入小。推荐
* [Flink动态CEP实例](https://jxeditor.github.io/2021/06/02/Flink%E5%8A%A8%E6%80%81CEP%E5%AE%9E%E4%BE%8B/)
* [Flink-Cep实现规则动态更新](https://blog.csdn.net/young_0609/article/details/110407781)
* [一个Flink-Cep使用案例](https://blog.51cto.com/u_9928699/3699677)

## 参考文档

* [FlinkCEP - Flink的复杂事件处理](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/libs/cep/#flinkcep---flink%e7%9a%84%e5%a4%8d%e6%9d%82%e4%ba%8b%e4%bb%b6%e5%a4%84%e7%90%86)
* [Flink-CEP 实战教程](https://blog.csdn.net/qq_43048957/article/details/135508027)
* 阿里云。阿里云实时计算服务提供了对动态 cep 的支持，未开源
  * [FLIP-200: Support Multiple Rule and Dynamic Rule Changing (Flink CEP)](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=195730308)
  * [ververica-cep-demo](https://github.com/RealtimeCompute/ververica-cep-demo)
  * [Flink动态CEP快速入门](https://help.aliyun.com/zh/flink/realtime-flink/getting-started/getting-started-with-dynamic-flink-cep)
  * [动态CEP中规则的JSON格式定义](https://help.aliyun.com/zh/flink/definitions-of-rules-in-the-json-format-in-dynamic-flink-cep)
  * [探索Flink动态CEP：杭州银行的实战案例](https://developer.aliyun.com/article/1646649)
* [Flink1.19源码编译及本地运行](https://blog.csdn.net/qq_20672231/article/details/147017660)
* [基于flink和drools的实时日志处理](https://github.com/luxiaoxun/eagle)
