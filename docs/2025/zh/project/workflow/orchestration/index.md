# 任务编排

参考：[awesome-workflow-engines](https://github.com/meirwah/awesome-workflow-engines)



## 嵌入式

* [liteflow](https://github.com/dromara/liteflow)
* [easy-flows](https://github.com/j-easy/easy-flows)
* [smart-flow](https://gitee.com/smartboot/smart-flow)。[开源推荐 | 一个轻量、灵活的业务流程编排框架，支持业务流程中常见的条件分支控制、子流程等功能](https://mp.weixin.qq.com/s?__biz=MzAwMTE5MjAwNQ==&mid=2652148684&idx=1&sn=41d0ccc2dc93ae1ac03abc7e3c7fd426&chksm=813d4ae6b64ac3f0d744932889d082e53a86809c9194131c62a0c7876b5184f6192359b978e6&mpshare=1&scene=1&srcid=0220E5L6FNuAYDBm6rt3axz6&sharer_shareinfo=93354d1b65beae123375271c5a46c1e6&sharer_shareinfo_first=0c87c81f2c72477c296725d3e79b89d7&version=4.1.10.99312&platform=mac#rd)
* Phoenix。非开源项目
  * [Phoenix 框架 小米商城产品站革新之路](https://mp.weixin.qq.com/s/EYMOvIHhCpSnb4TbAm4TsA)
  * [Phoenix框架 从0到1设计业务并发框架 怎么组织设计一个框架](https://mp.weixin.qq.com/s/f29We5lfTafhXAIMpWq5LQ)
  * [Phoenix框架 从0到1设计业务并发框架 并发线程池的核心设计](https://mp.weixin.qq.com/s/lx7Mk4T2V32JnvWSRONn4g)
  * [Phoenix框架 从0到1设计业务并发框架 自动构建有向无循环图设计](https://mp.weixin.qq.com/s/ORH3dtIVcoykjUOG0dzrFA)。如何规划有向无环图的任务执行先后顺序？
* [mule](https://github.com/mulesoft/mule)。Mule 是由 MuleSoft 提供的轻量级集成平台，旨在实现任意系统、服务、APIs 及设备间的高效连接。它避免传统的点对点集成方式，通过智能管理消息路由、数据映射、编排、可靠性和安全性，简化多系统间通信。Mule 应用基于事件驱动架构（EDA），利用各种“乐高积木式”的消息处理器（称为Flow）串联起来处理消息。
  * [mule-api](https://github.com/mulesoft/mule-api)
  * [mule-scheduler-service](https://github.com/mulesoft/mule-scheduler-service)
* [automatiko-engine](https://github.com/automatiko-io/automatiko-engine)
* [goobi-workflow](https://github.com/intranda/goobi-workflow)
* [cloudslang/score](https://cloudslang-docs.readthedocs.io/en/latest/developer/developer_score.html)
* [jd-easyflow](https://github.com/jd-opensource/jd-easyflow)



## 独立服务

* [rill-flow](https://github.com/weibocom/rill-flow)。
* [nifi](https://nifi.apache.org/)

## API 编排

* [Juggle](https://github.com/somta/Juggle)。Juggle是一个图形化的微服务编排工具，通过简单的流程编排，快速完成接口开发，大大提高开发效率，Juggle致力于完成以下几个使命：
  - 微服务的接口编排，根据已有的基础接口快速开发新接口
  - 第三方系统平台对接集成，快速打通系统之间的壁垒
  - 面向前端提供聚合适配聚合层（即业界的BFF层）
  - 私有化标准功能的定制开发，通过Juggle实现定制部分，避免污染标准代码
