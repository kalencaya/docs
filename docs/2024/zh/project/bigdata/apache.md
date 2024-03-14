# Apache 社区

## 存储

* [hadoop](https://hadoop.apache.org/)
* [hbase](https://hbase.apache.org/)

## 权限

* [ranger](https://ranger.apache.org/)

## 数据血缘

* [atlas](https://atlas.apache.org/#/)

## 调度

* [airflow](https://airflow.apache.org/)
* [dolphinscheduler](https://dolphinscheduler.apache.org/zh-cn)
  * [2024年Apache DolphinScheduler RoadMap：引领开源调度系统的未来](https://mp.weixin.qq.com/s?__biz=MzA4NDYxNTc2NA==&mid=2247521259&idx=1&sn=34f57620fb4aeda1afca44e4de16149e&chksm=9fe6a4d0a8912dc6201bc0d4e7c7ebab7fc24e25a4747cb56d36df3ffa2401b7446f2c085efe&mpshare=1&scene=1&srcid=03097iC0mgw1pTyvdj259qmd&sharer_shareinfo=a02ef71fe5a512d65610af05a5d20817&sharer_shareinfo_first=a02ef71fe5a512d65610af05a5d20817&version=4.1.10.99312&platform=mac#rd)
  * [Apache DolphinScheduler-3.2.0集群部署教程](https://mp.weixin.qq.com/s?__biz=MzA4NDYxNTc2NA==&mid=2247521304&idx=1&sn=a3fe8578fcf04cd0d5fcc31d2510fc43&chksm=9fe6a323a8912a3533d94e97a95d9ffbb1d5fd75773abc22ad6a7a8c9443f007a867c176ea96&mpshare=1&scene=1&srcid=03141ATSXkgmMjMDoZVWE81m&sharer_shareinfo=96b57665a386c84e75cf35d6fe6f7cef&sharer_shareinfo_first=1d2596fe5db8e7831050aa60dad0a708&version=4.1.10.99312&platform=mac#rd)
  
* [oozie](https://oozie.apache.org/)

## 消息队列

* [kafka](https://kafka.apache.org/)
* [pulsar](https://pulsar.apache.org/)

## 数据集成

* [gobblin](https://gobblin.apache.org/)
* [inlong](https://inlong.apache.org/)
* [seatunnel](https://seatunnel.apache.org/)
  * [Apache SeaTunnel社区发布最新Roadmap：定义数据集成未来](https://mp.weixin.qq.com/s?__biz=MzkwNTMwNTEyNA==&mid=2247492782&idx=1&sn=cc5dda78b883e9b3ec02fa9bd4d80bbd&chksm=c0fb69e5f78ce0f345539e72702a9ff1c4dc748d8e49d61927dfdeb0bda7154d3900aa10a2b4&mpshare=1&scene=1&srcid=0309qKLEDXVyk5WWLWvqWA3j&sharer_shareinfo=5d03516ccad1cc683c16e68da79ad7d0&sharer_shareinfo_first=5d03516ccad1cc683c16e68da79ad7d0&version=4.1.10.99312&platform=mac#rd)


## 计算引擎

* [hive](https://hive.apache.org/)
* [spark](https://spark.apache.org/)
* [flink](https://flink.apache.org/)
* [beam](https://beam.apache.org/)
* [Gluten](https://incubator.apache.org/projects/gluten.html)

## 计算中间件

* [linkis](https://linkis.apache.org/)
* [kyuubi](https://kyuubi.apache.org/)
  * [基于 Kyuubi 实现分布式 Flink SQL 网关](https://mp.weixin.qq.com/s/-AwXJz9CqEeX7cRdGGdyIg)


## 数据湖

* [hudi](https://hudi.apache.org/)
* [iceberg](https://iceberg.apache.org/)
* [paimon](https://paimon.apache.org/)
* [XTable](https://xtable.apache.org/)。原 OneTable 项目，进入 apache 孵化更名为 XTable

### 文章列表

* [一文详细对比三大数据湖产品-Hudi，Delta Lake ，Iceberg](https://mp.weixin.qq.com/s?__biz=MzkwNDIwMDc3Ng==&mid=2247485780&idx=1&sn=f30256cd817b77d3c208df5eb2f3d205&chksm=c08bde73f7fc5765bbbc58b43418892bdc52c076a98c355490affa6451b2e5c22c84907aeeee&mpshare=1&scene=1&srcid=0308FAlkLsvO7dFPNz7ycnuS&sharer_shareinfo=11feaf3f4932a401551b930ccb502a38&sharer_shareinfo_first=8022db6072a915323add5a8ccee815be&version=4.1.10.99312&platform=mac#rd)
* [当流计算邂逅数据湖：Paimon 的前生今世](https://mp.weixin.qq.com/s?__biz=MzkyNjQ1MDI3Mg==&mid=2247484012&idx=1&sn=1e21196708d5883651cb9d8e2fd0eec6&chksm=c2365563f541dc754fc84a37d67d517b4f2c1b658a7e03c83af3c7c13f5f2633d0ca8a5c350c&mpshare=1&scene=1&srcid=0726wS0DY3iR05XWbImfAHne&sharer_shareinfo=2f1441d6a9d3995c88c6e94a43f00e48&sharer_shareinfo_first=2f1441d6a9d3995c88c6e94a43f00e48&version=4.1.10.99312&platform=mac&poc_token=HGnL62WjutiDvnGPHut3WJp7RJpjpDhTvUMhwVav)。里面有非常好的 iceberg、hudi 的分析，Flink 先是做了与 iceberg 和 hudi 的集成后，发现流式数仓目标依然遥远，开始探索新的数据湖，后面才有了 paimon。
* [构建 Streaming Lakehouse：使用 Paimon 和 Hudi 的性能对比](https://mp.weixin.qq.com/s?__biz=MzU3Mzg4OTMyNQ==&mid=2247509706&idx=1&sn=2499367510fe7af3e68e67d2994ceb6b&chksm=fd382888ca4fa19e6a19b9ca8151ea8feb02664e44987b843ac637acfd569c93b8484134d806&mpshare=1&scene=1&srcid=0212gB2b0yJExDEg4gcHvImp&sharer_shareinfo=a55e3d5f23dd47653d1d11b75a97e1f6&sharer_shareinfo_first=c8a61e176765ce0e034f6887f2d3b3d3&version=4.1.10.99312&platform=mac#rd)。基于阿里云 EMR 和 spark 的一个使用对比
* paimon 系列文章
  * [基于 Apache Paimon 的 Append 表处理](https://mp.weixin.qq.com/s?__biz=MzkyNjQ1MDI3Mg==&mid=2247484078&idx=1&sn=b553af3a1564066460f5197ce6c2c63d&chksm=c23655a1f541dcb7455335571b424253e96aae38180aabb742c4e4ee0488775b8f9d041a08d9&mpshare=1&scene=1&srcid=1015QlqMyllLH5SEptN1fPFw&sharer_shareinfo=ba2e5fc1278878d5c6455bd9ac00f035&sharer_shareinfo_first=c7fc5635fb8989ef3d5be40385d5bfec&version=4.1.10.99312&platform=mac#rd)。对于 paimon 的 append 表应用场景做了非常细致的介绍
  * [快速上手使用 Paimon MySQL CDC](https://mp.weixin.qq.com/s?__biz=MzkyNjQ1MDI3Mg==&mid=2247484022&idx=1&sn=0167b802499705f9c4497198d62abdef&chksm=c2365579f541dc6f674a8548c0b9603a128b844b930a060cb6410cbe0d69487b8490f6ddddc1&mpshare=1&scene=1&srcid=0828DckrLAY02TnBYoePodXU&sharer_shareinfo=2493dc1383b1e18d7ce5b8499615c397&sharer_shareinfo_first=2493dc1383b1e18d7ce5b8499615c397&version=4.1.10.99312&platform=mac#rd)
  * [Apache Paimon CDC集成|Kafka篇](https://mp.weixin.qq.com/s?__biz=MzI0NjYzMDI0OA==&mid=2247485631&idx=1&sn=eae44adcc41925f2130e87e2afefae76&chksm=e9bd1ab8deca93ae63b4ca9b11d19f40c75eaf492d9c98c87ea48ee7cabe551f1e8d6f89d5c4&mpshare=1&scene=1&srcid=1003w3nnF8nRvSqUWgj9mdhX&sharer_shareinfo=a3d2f39ea14a1137f28a302b90518ced&sharer_shareinfo_first=a6591676b2003947512ca3af53cec4e5&version=4.1.10.99312&platform=mac#rd)
* hudi 系列文章
  * [基于Apache Hudi + MinIO 构建流式数据湖](https://mp.weixin.qq.com/s?__biz=MzIyMzQ0NjA0MQ==&mid=2247490069&idx=1&sn=7ac05b248c2ec7a6b434ebeab826e6f1&chksm=e81f4f63df68c675e3b13db5486879e3fa1e8145f7b26882359c847506d18a9325a260cabd5e&mpshare=1&scene=1&srcid=1010g5ogflytVnn2Gc5UcqB9&sharer_shareinfo=ebf540239185351b8bc6d5c23ee09bf8&sharer_shareinfo_first=ebf540239185351b8bc6d5c23ee09bf8&version=4.1.10.99312&platform=mac#rd)
  * [Hudi0.14.0最新编译（修订版）](https://mp.weixin.qq.com/s?__biz=MzUyODk0Njc1NQ==&mid=2247485068&idx=1&sn=0ec5cef689c0b907d49f0cc07f9f5707&chksm=fa69c5a0cd1e4cb6bbe26cb6e82abb83a2a4931b270a2939c710084898d4084eb7f65e2d40c0&mpshare=1&scene=1&srcid=0302lzf4lzZQGgokkvqLUyN7&sharer_shareinfo=eda2a3e53356528a4a1ec9a69e87734d&sharer_shareinfo_first=95990bba99fa5cebc9faa8e7a06db97b&version=4.1.10.99312&platform=mac#rd)
  * [Apache Hudi从零到一：存储格式初探（一）](https://mp.weixin.qq.com/s?__biz=MzIyMzQ0NjA0MQ==&mid=2247491548&idx=1&sn=e8088e2a67e545ded94c70b7797e0913&chksm=e81f4aaadf68c3bcd41d17aa52a423799cb88d5a8702ed380933670971d7a467a2810d382858&mpshare=1&scene=1&srcid=0309xIHFJzOq4Wev6YwOf1SL&sharer_shareinfo=05eb3cd6baf7aaf6565795bf8ee49dfa&sharer_shareinfo_first=05eb3cd6baf7aaf6565795bf8ee49dfa&version=4.1.10.99312&platform=mac#rd)
  * [Apache Hudi从零到一：深入研究读取流程和查询类型（二）](https://mp.weixin.qq.com/s?__biz=MzIyMzQ0NjA0MQ==&mid=2247491636&idx=1&sn=1c7df6411a025430a8d4a0d35588170e&chksm=e81cb542df6b3c542d8fdcce634809ad6e49589d682f55c0907d99dfa8e5e16c803ec112a9a0&mpshare=1&scene=1&srcid=0309wxGcIPzyBvvSlk2DZK2G&sharer_shareinfo=ac033b340a14441ddfb964e50f90d704&sharer_shareinfo_first=ac033b340a14441ddfb964e50f90d704&version=4.1.10.99312&platform=mac#rd)
* 其他
  * [数据存储中的z-ordering与Partitioning](https://mp.weixin.qq.com/s/ZBfNJWRObasvbU8J5bQLiw?version=4.1.10.99312&platform=mac)
  * [几张图弄懂 Z-order clustering](https://mp.weixin.qq.com/s?__biz=MzkwMTQwNDA4NA==&mid=2247484272&idx=1&sn=3c8be16b88b57ee3db7e979e08b9f31f&chksm=c0b407abf7c38ebdcd00d7bc726ce254b61edd2c5c5cbdd08d49bf27f643680d3a6c5883b66a&mpshare=1&scene=1&srcid=1017FGCqOsq73J0Upxo52PGN&sharer_shareinfo=ff50c758d4a23e8c5971561455c32ba8&sharer_shareinfo_first=3a60576609b3dfd897b0aa01bcf85215&version=4.1.10.99312&platform=mac#rd)

## 数据平台

* [streampark](https://streampark.apache.org/)
* [amoro](https://amoro.netease.com/)。正在走 apache 孵化流程
* [nifi](https://nifi.apache.org/)
* [zeppelin](https://zeppelin.apache.org/)

## 数据格式

* [avro](https://avro.apache.org/)
* [orc](https://orc.apache.org/)
* [parquet](https://parquet.apache.org/)
* [arrow](https://arrow.apache.org/)
* [fury](https://fury.apache.org/)。蚂蚁开源的数据序列化框架

## shuffle 服务

* [celeborn](https://celeborn.apache.org/)
* [uniffle](https://uniffle.apache.org/)

## OLAP

* [doris](https://doris.apache.org/)
* [phoenix](https://phoenix.apache.org/)
* [druid](https://druid.apache.org/)
* [impala](https://impala.apache.org/)
* [griffin](https://griffin.apache.org/)
* [kudu](https://kudu.apache.org/)
* [kylin](https://kylin.apache.org/)
* [pinot](https://pinot.apache.org/)
* [pig](https://pig.apache.org/)
* [drill](https://drill.apache.org/)

### 文章列表

* [Elasticsearch：普通检索和向量检索的异同？](https://mp.weixin.qq.com/s?__biz=MzI2NDY1MTA3OQ==&mid=2247488583&idx=1&sn=f996d7feb4cbccc620e68188fee46d67&chksm=eaa83c6fdddfb5795db9fb304e3b4c8c81c720d7bbfaf237cdbdd6b1ea7fae599d896ff017c8&mpshare=1&scene=1&srcid=0119MfFl9o4f1H3diunSo5GD&sharer_shareinfo=d5e15b2d5d5ef990870f93a803265c24&sharer_shareinfo_first=d5e15b2d5d5ef990870f93a803265c24&version=4.1.10.99312&platform=mac#rd)
* [向量化引擎怎么提升数据库性能](https://mp.weixin.qq.com/s?__biz=MzU1OTgxMjA4OA==&mid=2247485545&idx=1&sn=1e0fd7478505c52501ef3ce10a9c4e09&chksm=fc10d4fecb675de8d924b9fa949aad65ef97223fda880b8e8b00922972f262567bbdd48b4df0&mpshare=1&scene=1&srcid=1107GMZnzvngqMF0MsLZL0LY&sharer_shareinfo=7f9a225dab1664b1b670ce62f4ce4500&sharer_shareinfo_first=d2195e4381332631c74b2cf5aff7fa55&version=4.1.10.99312&platform=mac#rd)
* [向量化代码实践与思考：如何借助向量化技术给代码提速](https://mp.weixin.qq.com/s?__biz=MzIzOTU0NTQ0MA==&mid=2247536363&idx=1&sn=e3b6d17baa9c44c49819e48745142129&chksm=e92a73e4de5dfaf2b9486eabd118da98fb05e7a93aa8d7ba413a8b415b0ea92b98d1f321a5eb&mpshare=1&scene=1&srcid=1226Jqkg6lAArQu4QS1J1ad2&sharer_shareinfo=5a1676b649f42c446506c05a3e47d538&sharer_shareinfo_first=7972b1e35ce97d23086dfa0d52200c5f&version=4.1.10.99312&platform=mac#rd)