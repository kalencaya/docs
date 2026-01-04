# Join

flink 的 join 支持多种类型：

- 双流 Join（Regular Join）。
- Interval Join
- 窗口关联（Window Join）
- Temporal Join
- Lookup Join

参考资料：

- [Flink SQL 双表 JOIN 介绍与原理简析](https://xie.infoq.cn/article/624534862bf0fba3c19adecb0)
- [【Flink】第十篇：join 之 regular join](https://mp.weixin.qq.com/s?__biz=MzIwMTUzMjQ3Mw==&mid=2247484173&idx=1&sn=54144c60eff285156c0539879f6e6fc6&chksm=96ed365ba19abf4dc83e4fdf3eca0ab7e0a7625ac83dacfb1aca3deffa3b355d4a39e95470a0&scene=21#wechat_redirect)
- [【Flink】第二十三篇：join 之 temporal join](https://cloud.tencent.com/developer/article/1969409)
- [【Flink】第十一篇：join 之 interval join](https://mp.weixin.qq.com/s?__biz=MzIwMTUzMjQ3Mw==&mid=2247484185&idx=1&sn=89c914557918f1f8977fd4efbddc8249&chksm=96ed364fa19abf59faf3fd65997b3753b30f979aa8a7efe8af28dbf7a794a1538f4e5cdef4f6&scene=21#wechat_redirect)
- [Flink SQL 知其所以然（二十六）：2w 字详述 Join 操作（大威天龙）](https://mp.weixin.qq.com/s/zR2ukRjiw-IqUDX894NyGw)
- [【转】Flink SQL 之 regular join 机制解析](https://mp.weixin.qq.com/s/OyZqw6YScwysM8-UW4sBWA)
- [Flink SQL 知其所以然（二十）：核心思想之动态表 & 连续查询！（建议收藏）](https://mp.weixin.qq.com/s/Kq0hRcnWNXeLhOekG1OoDA)

## Regular Join

文档介绍：[Regular Joins](https://nightlies.apache.org/flink/flink-docs-release-1.17/docs/dev/table/sql/queries/joins/#regular-joins)。

Regular Join 是最常见的 join 类型。当 join 的两张表的任何数据发生变更，都会影响 join 结果。不只是未处理的数据 join 结果发生变更，之前已经处理过的数据也会重新触发计算重新输出结果。

```sql
SELECT * FROM Orders
INNER JOIN Product
ON Orders.productId = Product.id
```

Flink 的 join 和传统批处理 join 的语义一致，都用于将两张表关联起来。区别为实时计算关联的是两张动态表，关联的结果需动态更新，以保证最终结果和批处理结果一致。

为了实现 join 结果的最终一致性，Flink 会保存两张表的所有数据的最新状态至状态中，如果数据条数无限增长会导致状态无限增加。用户可以为状态添加 time-to-live (TTL) 避免状态无限增长。

比如直播电商公司准备直播带货时，最早上午 08:00 开始，最晚凌晨 03:00 结束，那么相关表的 join 时，可以设置 TTL 为 48h，超过 48h 仍然有直播数据变更的可能性非常低，即使仍然有数据过来，也属于异常数据。

设置 TTL 时需充分考虑到表数据的实际变更情况，上述案例如果设置为 3h 就会因为数据的状态过期被清除导致结果错误。

TTL 设置参考 [Idle State Retention Time](https://nightlies.apache.org/flink/flink-docs-release-1.17/docs/dev/table/concepts/overview/#idle-state-retention-time)。

Flink 支持 INNER Join 和 OUTER Join，且只支持相等联接，即至少有一个连接条件是相等谓词的联接。

### INNER Join

```sql
SELECT *
FROM Orders
INNER JOIN Product
ON Orders.product_id = Product.id
```

### OUTER Join

包括 LEFT，RIGHT，FULL Join。

```sql
-- LEFT Join
SELECT *
FROM Orders
LEFT JOIN Product
ON Orders.product_id = Product.id

-- RIGHT Join
SELECT *
FROM Orders
RIGHT JOIN Product
ON Orders.product_id = Product.id

-- FULL OUTER Join
SELECT *
FROM Orders
FULL OUTER JOIN Product
ON Orders.product_id = Product.id
```

## Temporal Join

## Lookup Join

维表查询
