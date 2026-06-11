# 后端数据归档

后端团队往往采用关系性数据库如 MySQL 存储业务数据，当数据量过大时往往有如下解决方案：

* 分库分表
* 分布式数据库。如 oceanbase、polardb
* 更换存储产品。如 ES，将数据实时写入到 ES
* 定时删除，只保留近 3 个月的数据。被删除的数据依靠数仓团队，数仓团队实时/离线抽取数据至数仓，MySQL 中删除的数据，在数仓有备份。

当数据量较大，且数据随着时间推移，查询频率越来越低但仍有查询需求时，后端团队将全量数据存入 MySQL 或 ES 中就需要为海量的冷数据付出和热数据一样的存储成本。因此后端团队需要一种能存储冷数据的存储产品来存储业务数据。



## 方案介绍

### SelectDB

* 延迟
  * mysql -> dataworks -> selectdb。T + 1 延迟
  * mysql -> dts/flink -> selectdb。秒级延迟
* 存储
  * selectdb。数据存储在 selectdb 中。秒级查询
  * paimon。数据存储在 paimon 中，selectdb 加载外部表方式查询。paimon 需有良好的分区、bucket 设置，必要时添加 bloom filter 索引。秒级查询
  * dataworks。数据存储在 dataworks 中，selectdb 加载外部表方式查询。分钟级查询
* 查询。归档数据和新增的热点数据如何查询。 
  * 如果要一次性查询出来，需要归档数据和热点数据放一块，查询全切到 selectdb
  * 如果要分2次查询，一次查热点，一次查归档，后端将2次查询结果merge
* 费用
  * flink。1CU/月 = 180元
  * selectdb
    * 存储资源。按量付费
    * 计算资源。
  * oss。标准存储 1T/年 = 463 元

## 参考文档

* [一套底座支撑多场景：高德地图基于 Paimon + StarRocks 轨迹服务实践](https://zhuanlan.zhihu.com/p/1996547427482748422)
* [VARCHAR 还是 CHAR？一张 30TB 表告诉你 Doris 字符串类型怎么选](https://mp.weixin.qq.com/s/bZZzkNK5dZkbG0zNMIdibw)
* paimon
  * [File Index](https://paimon.apache.org/docs/1.4/concepts/spec/fileindex/)
  * [Paimon 文件级索引（File Index）官方技术参考文档](https://mp.weixin.qq.com/s/oPmLk1FYDxSmZqI1Q-E1aw)
  * [StarRocks 查询 Paimon 表：Bitmap 索引全栈指南（官方标准+大厂案例+性能阈值+组合优化）](https://mp.weixin.qq.com/s?__biz=MzAxMTYxMDY3Mw==&mid=2247488774&idx=1&sn=cbf6589f5caa06b9356d83833d351530&chksm=9bbf2a58acc8a34eedcaed4890beac7757702979761838bf75cdaa5b835fade606905102de19&cur_album_id=3253595527980711943&scene=189#wechat_redirect)
  * [Paimon Bloom索引深度解析：从38s到1.5s的性能飞跃与生产最佳实践](https://mp.weixin.qq.com/s?__biz=MzAxMTYxMDY3Mw==&mid=2247488748&idx=1&sn=f33432a72a30273df22e51ab10bbe69b&chksm=9bbf2bb2acc8a2a4716fb18dc5bfa79016a39b6f715435616dd875011b83d7a71fae4487bd5d&cur_album_id=3253595527980711943&scene=189#wechat_redirect)