# FlorGram

字节开源的 [FlowGram.AI](https://flowgram.ai/index.html) 介绍

## 扩展

* [IOC](https://flowgram.ai/guide/concepts/ioc.html)。flowgram 使用 [inversify](https://inversify.io/docs/introduction/getting-started/) 作为 IOC（控制反转），因此一些扩展也需要使用 inversify 来开发。
* [ECS](https://flowgram.ai/guide/concepts/ecs.html)。



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

参考 [coze-studio](https://github.com/coze-dev/coze-studio) 开发节点加载逻辑。通过远程加载。

* coze-studio
  * frontend/packages/workflow/playground/src/entites。`WorkflowGlobalStateEntity`
  * frontend/packages/workflow/playground/src/container。`WorkflowPageContainerModule`

