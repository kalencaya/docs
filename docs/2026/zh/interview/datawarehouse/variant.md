# Variant 类型

## Variant 介绍

Variant是一种专为高效存储与查询“半结构化数据”（如JSON对象、嵌套数组、动态schema表）设计的二进制编码数据类型。它不仅支持传统的结构化数据，同时也能灵活表达多样化、复杂的数据结构，满足动态变化的数据需求。

典型应用场景包括日志平台、事件仓库、宽表分析以及复杂嵌套数据等。

Variant类型最初由Delta Lake和Apache Spark社区联合推动，并作为开源标准在大数据领域逐步推广。目前，Spark 4.0已原生支持Variant类型，最新发布的Iceberg 1.10版本也正式加入了对Variant类型的支持。

### 为什么要有Variant类型
在大数据分析和数据湖建设中，半结构化数据（如 JSON）被广泛使用，特别是在宽表、嵌套对象、动态字段场景下。传统的 JSON 存储方式（如保存为字符串）存在以下主要痛点：

* 查询慢： 每次查询或分析某个字段值，都需要遍历整个 JSON 字符串进行解析，尤其在大宽表或深度嵌套结构时，解析开销成倍增长，大幅降低查询效率。
* 空间浪费： 字段名（key）在每条记录中反复存储，造成大量重复数据。对于 JSON 格式本身的冗余标点和描述，进一步加重存储负担。
* 类型不精确： JSON 标准只定义了布尔、数字、字符串、对象、数组等基础类型，不能表达时间戳、二进制、UUID 等更丰富的数据类型，影响后续数据兼容与解析。
* 列式查询能力不足： 传统 JSON 作为整体字符串存储，难以支持现代数据分析所需的按列投影、高效拆分提取与过滤。

## Doris

* [Variant](https://doris.apache.org/zh-CN/docs/4.x/sql-manual/basic-element/sql-data-types/semi-structured/VARIANT)。在 doris 3.x 版本引入



## Flink

* [Variant](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/dev/table/types/#variant)。在 flink 2.x 版本引入

flink 与 Variant 类型推出了 `PARSE_JSON` 和 `TRY_PARSE_JSON` 函数将 JSON 字符串转成半结构化类型 Variant

在阿里云实时计算Flink版服务中，支持了 Variant：[Paimon表数据写入和消费](https://www.alibabacloud.com/help/zh/flink/realtime-flink/use-cases/write-and-consume-paimon-table-data)

## Paimon

* [Data Types](https://paimon.apache.org/docs/master/concepts/data-types/)。在 paimon 1.4 版本引入

