# Maestro



## Step 类型

* leaf
  * NoOp
  * Sleep
  * Titus
  * Notebook
  * Kubernetes
  * Http
  * Join
* non-leaf
  * foreach
  * while
  * subworkflow
  * template

## 参数类型



## Flow

Maestro 提供了一个高度优化的流程引擎，但它不是一个完整地 DAG 引擎，它仅提供了部分任务并行功能，同时会对并行任务数量进行限制以适应单机服务器内存限制。高级的 Graph 特性如条件分支、SubWorkflow、ForEach 等都在 `maestro-engine` 模块。

在 `maestro-flow` 模块中，有 2 层抽象：`flow-group` 和 `flow`：

* `flow`。每个 `flow` 对应一个 workflow instance。
* `flow-group`。一次管理一组 `flow`，以实现本地化并减少 db 的读写。一组 `flow` 作为一个 `flow-group` 会一起分配到一个服务器节点，并统一使用一个心跳。`flow-group` 的大小需精心调整以防止太大或太小。`flow-group` 负责如下功能：
  * 心跳
  * launch、resume、shutdown flow

模型：

* `Flow` 和 `FlowDef`
* `Task` 和 `TaskDef`



