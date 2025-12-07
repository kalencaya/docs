# 动态更新 CEP

todo

## 解决方案

* flink 社区
  * [FLIP-200: Support Multiple Rule and Dynamic Rule Changing (Flink CEP)](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=195730308)
* 阿里云版。阿里云实时计算服务提供了对动态 cep 的支持，未开源
  * [ververica-cep-demo](https://github.com/RealtimeCompute/ververica-cep-demo)
  * [Flink动态CEP快速入门](https://help.aliyun.com/zh/flink/realtime-flink/getting-started/getting-started-with-dynamic-flink-cep)
  * [动态Flink CEP电商实时预警系统](https://help.aliyun.com/zh/flink/realtime-flink/use-cases/build-an-e-commerce-early-warning-system-with-flink-cep)
  * [动态CEP中规则的JSON格式定义](https://help.aliyun.com/zh/flink/definitions-of-rules-in-the-json-format-in-dynamic-flink-cep)
  * [复杂事件处理（CEP）语句](https://help.aliyun.com/zh/flink/cep-statements)

* [Flink-CEPplus](https://github.com/ljygz/Flink-CEPplus)。针对 flink 1.8 版本可做参考
* [flink-dynamic-cep](https://github.com/shirukai/flink-dynamic-cep)。针对 flink 1.17 版本，对 flink 侵入小。推荐
* [Flink动态CEP实例](https://jxeditor.github.io/2021/06/02/Flink%E5%8A%A8%E6%80%81CEP%E5%AE%9E%E4%BE%8B/)
* [Flink-Cep实现规则动态更新](https://blog.csdn.net/young_0609/article/details/110407781)

## Ververica Flink-CEP

* [探索Flink动态CEP：杭州银行的实战案例](https://developer.aliyun.com/article/1646649)
* 袋鼠云
  * [数栈基于Flink CEP与规则热更新扩展的深度解析](https://mp.weixin.qq.com/s/VxG-53jSUvnrNAo2v8W0Jg)
  * [深入浅出Flink CEP丨如何通过Flink SQL作业动态更新Flink CEP作业](https://mp.weixin.qq.com/s/ddA0-KeFbNXvPqu4u6KspQ)