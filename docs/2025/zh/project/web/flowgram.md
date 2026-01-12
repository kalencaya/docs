# FlowGram

字节开源的 [FlowGram.AI](https://flowgram.ai/index.html) 介绍

## 扩展

* [IOC](https://flowgram.ai/guide/concepts/ioc.html)。flowgram 使用 [inversify](https://inversify.io/docs/introduction/getting-started/) 作为 IOC（控制反转），因此一些扩展也需要使用 inversify 来开发。
* [ECS](https://flowgram.ai/guide/concepts/ecs.html)。

ECS 介绍

* [EntityManager、bindConfigEntity](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/common/entity-manager.ts)。
  * [Entity](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/common/entity.ts)、[EntityData](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/common/entity-data.ts)、[ConfigEntity](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/common/config-entity.ts)、[observeEntity、observeEntities、observeEntityDatas](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/common/playground-decorators.ts)、
* [useConfigEntity](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/react-hooks/use-config-entity.ts)、[useEntities](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/react-hooks/use-entities.ts)、[useService](https://github.com/bytedance/flowgram.ai/blob/main/packages/canvas-engine/core/src/react-hooks/use-service.ts)

### Service

参考链接：

* [自定义 Service](https://flowgram.ai/guide/advanced/custom-service.html#%E8%87%AA%E5%AE%9A%E4%B9%89-service)
* 实战
  * [services](https://github.com/bytedance/flowgram.ai/tree/main/apps/demo-free-layout/src/services)
  * 

### 插件

参考链接：

* [自定义插件](https://flowgram.ai/guide/advanced/custom-plugin.html)

### 实战



## Runtime

除工作流外，flowgram 还提供了一套 workflow 运行的实现，称作 [runtime](https://flowgram.ai/guide/runtime/introduction.html)。flowgram 提供的 runtime 使用 typescript 实现，并封装成 RuntimePlugin，提供 2 种运行方式：

* browser。runtime 直接在前端运行
* server。runtime 通过 node 另起一个服务端，web 通过 http 接口与 runtime server 交互
