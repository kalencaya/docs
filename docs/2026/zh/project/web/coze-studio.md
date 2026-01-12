# Coze Studio

字节开源的 [Coze Studio](https://github.com/coze-dev/coze-studio) 介绍

## 前端

coze 的前端使用的 [FlowGram.AI](https://flowgram.ai/index.html)，但做了大量的定制。flowgram 提供了一个类似的 [demo](https://flowgram.ai/examples/free-layout/free-feature-overview.html)，实现了类似 coze 的功能，在网站上的效果并没有很好，可以直接 clone flowgram 在本地运行，看着效果更好。

主要理解 Coze Studio 的几个基本功能：

* 加载工作流
* 保存工作流
* 执行工作流

### 加载工作流

参考 [coze-studio](https://github.com/coze-dev/coze-studio) 开发节点加载逻辑。通过远程加载。

* 工作流渲染入口。[Main](https://github.com/coze-dev/coze-studio/blob/main/frontend/packages/project-ide/biz-workflow/src/main.tsx)。在这里获取到 `spaceId`、`projectId`、`workspaceId` 关键信息，并传入 [WorkflowPlayground](https://github.com/coze-dev/coze-studio/blob/main/frontend/packages/workflow/playground/src/workflow-playground.tsx)。
* 设置状态。[WorkflowContainer](https://github.com/coze-dev/coze-studio/blob/main/frontend/packages/workflow/playground/src/components/workflow-container/index.tsx) 里会对 `workflowState` 进行状态设置。
* 全局状态。[useGlobalState](https://github.com/coze-dev/coze-studio/blob/main/frontend/packages/workflow/playground/src/hooks/use-global-state.ts)、[WorkflowGlobalStateEntity](https://github.com/coze-dev/coze-studio/blob/main/frontend/packages/workflow/playground/src/entities/workflow-global-state-entity.ts)
* 
* frontend/packages/workflow/playground/src/workflow-playground.tsx。`WorkflowPlayground`
* 

- coze-studio
  - frontend/packages/workflow/playground/src/entites。`WorkflowGlobalStateEntity`
  - frontend/packages/workflow/playground/src/container。`WorkflowPageContainerModule`
  - frontend/packages/workflow/playground/src/workflow-playground.tsx。`WorkflowPlayground`
  - frontend/packages/project-ide/biz-workflow/src/main.tsx。`Main`

### 保存工作流
