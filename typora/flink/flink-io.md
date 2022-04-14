# flink-io

`InputFormat` 和 `OutputFormat` 用于 `DataSet`。

目前 Flink 的 source connector 属于 3 类实现：

* 批流一体。使用新的 source 框架实现。
* 流。使用 SourceFunction 实现。
* 批。使用 InputFormat 实现。

