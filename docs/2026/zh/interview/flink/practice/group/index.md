# 人群圈选

## 去重

涉及到去重时计算 UV，Flink 不像离线计算那样高效，它需要在状态中缓存大量数据进行去重，长周期、大数据量下去重耗费资源过多。

现有 Flink 去重方式有如下几种：

* HashMap/Set或MapState。将数据存入 HashMap/Set 或 MapState 中
* HyperLogLog
* BitMap





## 参考资料

* [实时计算中的精确去重：RoaringBitmap 原理剖析与 Flink 落地全过程](https://mp.weixin.qq.com/s/3kaerom60zywncX5GpFrJw)
* [Flink通过BITMAP类型实现精确去重](https://help.aliyun.com/zh/flink/realtime-flink/use-cases/perform-efficient-deduplication-using-bitmaps)
  * [BITMAP 位图函数](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/bitmap-functions)
* Doris
  * [SQL 类型 BITMAP](https://doris.apache.org/zh-CN/docs/4.x/sql-manual/basic-element/sql-data-types/aggregate/BITMAP)
  * [SQL 函数 BITMAP函数](https://doris.apache.org/zh-CN/docs/4.x/sql-manual/sql-functions/scalar-functions/bitmap-functions/bitmap-and)

