# Flink Redis Connector

Flink 向 Redis 写入数据常见于和前后端一起协作，比如在搜推广场景，Flink 提供实时特征到 Redis，搜推广查询 Redis。

## Connector

* [flink-connector-redis](https://github.com/jeff-zou/flink-connector-redis)。开源版本，支持 DataStream API
* [ververica-connector-redis](https://repo1.maven.org/maven2/com/alibaba/ververica/ververica-connector-redis/)。[参考文档](https://help.aliyun.com/zh/flink/realtime-flink/developer-reference/apsaradb-for-redis-connector)，阿里云 VVR 商业实现，基于 Jedis，只支持 SQL
* [flink-connector-redis_2.12](https://repo.huaweicloud.com/repository/maven/huaweicloudsdk/org/apache/flink/flink-connector-redis_2.12/)。[参考文档](https://support.huaweicloud.com/sqlref-flink-dli/dli_08_15063.html)，华为云商业实现，基于 Lettuce，只支持 SQL。
