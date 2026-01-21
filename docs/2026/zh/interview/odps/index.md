# 概览



## ODPS 连接地址

众所周知，阿里云 ODPS、DataWorks、MaxCompute 傻傻分不清楚，常常混合在一起使用，而对于一些需要连接到 ODPS 的场景，使用的 `endpoint` 是哪一个就很纠结了：

* selectdb 里面创建 maxcompute catalog。
  * 内网地址。`https://service.cn-hangzhou-vpc.maxcompute.aliyun-inc.com/api`
  * 公网地址。`https://service.cn-hangzhou.maxcompute.aliyun-inc.com/api`，使用公网地址，需额外配置 `"mc.public_access"="true"`
* jdbc driver url。`jdbc:odps:http://service.odps.aliyun.com/api?project=<MY_PROJECT>`
* DataWorks 中 PyODPS 任务中创建 `odps` 对象。`http://service.odps.aliyun.com/api`
