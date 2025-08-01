# Plugin

* [pf4j](https://github.com/pf4j/pf4j)。
  * [sbp](https://github.com/hank-cp/sbp)。Plugin framework for Spring Boot based on pf4j
  * [spinnaker/kork](https://github.com/spinnaker/kork)
  * [oceanbase/odc](https://github.com/oceanbase/odc/blob/main/server/plugins/pom.xml)
  
* [exp](https://github.com/stateIs0/exp)。Java extension plugin and hot swap plugin（Java 扩展点/插件系统，支持热插拔，旨在解决大部分软件的功能定制问题）。没有在 maven 仓库找到依赖
  * [open-exp-plugin](https://github.com/mqttsnet/open-exp-plugin)。只找到了这个

* [devops-framework](https://github.com/bkdevops-projects/devops-framework)。源码：[devops-boot-core/devops-plugin](https://github.com/bkdevops-projects/devops-framework/tree/master/devops-boot-project/devops-boot-core/devops-plugin)，类似于 pf4j 的插件系统
* [COLA](https://github.com/alibaba/COLA)。源码：[cola-components/cola-component-extension-starter](https://github.com/alibaba/COLA/tree/master/cola-components/cola-component-extension-starter)
* [easy-extension](https://github.com/xiaoshicae/easy-extension)
* [AGEIPort](https://github.com/alibaba/AGEIPort)。源码：[ageiport-ext/ageiport-ext-arch](https://github.com/alibaba/AGEIPort/tree/master/ageiport-ext/ageiport-ext-arch)。类似 dubbo 的 spi 机制
* [AutoService](https://github.com/google/auto)。google autoservice。自动生成 SPI 需要的配置信息
* [metainf-services](https://github.com/kohsuke/metainf-services)。自动生成 `MEA-INF/services` 文件。
* [sofa-ark](https://github.com/sofastack/sofa-ark)
* [代码更新不停机：SpringBoot应用实现零停机更新的新质生产力](https://mp.weixin.qq.com/s?__biz=MzU2NDEyMzIzOA==&mid=2247504064&idx=1&sn=da9475e12d9c0c7f7759ee8dd4741416&chksm=fc4d53c9cb3adadf85c9c491d9953b35b360f756fd53d4411ef8809d81846488ff5ec78a13be&mpshare=1&scene=1&srcid=0728XMPHzrb0DR6S22aOBBrW&sharer_shareinfo=e5a2949a2439e47db6d40a2a345ada9b&sharer_shareinfo_first=ec7c8d0cab9d4101abaae4782175d3b3&version=4.1.10.99312&platform=mac&nwr_flag=1#wechat_redirect)
* [Spring Boot 插件化开发模式](https://mp.weixin.qq.com/s?__biz=MzUxOTc4NjEyMw==&mid=2247582442&idx=2&sn=fb797affae73a8f24ffa3b621eaa8bf3&chksm=f9f7990ece801018dd65cdc6c8ba9f221b7ad78748edbfb097f74205edae8e900b8b35d3fcfe&mpshare=1&scene=1&srcid=0714m8TKeh13TMRKzycRzvRS&sharer_shareinfo=9269b075514d8c16f5604c63d4eb487c&sharer_shareinfo_first=9526d653142ecb195a0394e0f98d568f&version=4.1.10.99312&platform=mac#rd)
* [一种基于动态代理的通用研发提效解决方案](https://mp.weixin.qq.com/s?__biz=MzIzOTU0NTQ0MA==&mid=2247535205&idx=1&sn=2245bef586416bdba23eaf533bec3448&chksm=e8bbf81a3b4564bb186b9e0bb068ec428a0f40d3c8e0a4f6ec4ec95d55b9362059908e6c562b&mpshare=1&scene=1&srcid=1221rKO6mSuZa9sbcclogSo1&sharer_shareinfo=3154a9ea15cd74cc242509bd6e53e1fe&sharer_shareinfo_first=f32b05f33d86040bd2b7984ef0f7dedf&version=4.1.10.99312&platform=mac&nwr_flag=1#wechat_redirect)
* [fit-framework](https://gitcode.com/ModelEngine/fit-framework)
* [gravitee-plugin](https://github.com/gravitee-io/gravitee-plugin)

## 动态加载

* [SpringBoot 实现热插拔AOP，非常实用！](https://mp.weixin.qq.com/s?__biz=MzI4Njc5NjM1NQ==&mid=2247550674&idx=2&sn=567297f2db09222e4ba80e865caaca98&chksm=ebd539fedca2b0e8704dbeb4437fcf8405509286ca1d9767f07abbe1aa1f0ccc2cc12b7adfee&mpshare=1&scene=1&srcid=0207jtJpmjOgsrcAIy0oPP7L&sharer_shareinfo=1739885ada50806096a3c720287ef49c&sharer_shareinfo_first=387c6d831788074f7109cba0c66a6f50&version=4.1.10.99312&platform=mac#rd)
  * [一种基于动态代理的通用研发提效解决方案](https://mp.weixin.qq.com/s?__biz=MzIzOTU0NTQ0MA==&mid=2247535205&idx=1&sn=2245bef586416bdba23eaf533bec3448&chksm=e92a776ade5dfe7c6ca615eaed11c7dd993372ecf0ae277f66758c0ae4fc566beb89ffa488e2&mpshare=1&scene=1&srcid=0208QQxFsRFi2HQ9T9LIdTWd&sharer_shareinfo=efe01c2823c34ce3b4549f81bf4f59ed&sharer_shareinfo_first=efe01c2823c34ce3b4549f81bf4f59ed&version=4.1.10.99312&platform=mac#rd)
* [Spring Boot 动态加载jar包，动态配置太强了！](https://mp.weixin.qq.com/s?__biz=MzU3MDAzNDg1MA==&mid=2247531757&idx=1&sn=45dea52054176844243598ff05e5d21f&chksm=fcf7a320cb802a36ef6390265956cdffc05a2751c2a35b21d56e9b8ac3d8c40e3c2483ff54c2&mpshare=1&scene=1&srcid=0207f5Vlav27DSdXecZPBzOM&sharer_shareinfo=204ede66379ee3b7a2afe2f39a5d9452&sharer_shareinfo_first=bb2a8f5a5b1c83e95246fe6762fb9874&version=4.1.10.99312&platform=mac#rd)
* [【技术深度剖析】Java运行时魔法：动态加载JAR包并无缝注册到Spring容器的完整实现](https://mp.weixin.qq.com/s?__biz=MzkxMjQ1MTM5Ng==&mid=2247483794&idx=1&sn=83d7c59de40f17692ca45ca1087518d2&chksm=c069f72e10b966e8f1f2a12778a19a3b99a5753e4fd369f618face900f39dd0b5d6a2452e7f0&mpshare=1&scene=1&srcid=04104RS6nNVCLsQ39JqNYWN2&sharer_shareinfo=4a517440d40b898ecceba7bec58eaa48&sharer_shareinfo_first=fa3ac10402b43476246ca7d06c2781c1&version=4.1.10.99312&platform=mac#rd)

