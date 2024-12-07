# 数据服务

文档链接：

* [基于开源项目动态发布Rest API的数据服务探索](https://zhuanlan.zhihu.com/p/137643229)

开源项目：

* [DBApi](https://github.com/freakchick/DBApi)。零代码开发api服务，只需编写sql，就可以生成http api服务。支持api动态创建，多数据源连接，动态添加数据源，兼容多种数据库。非开源项目，源码实际上未开源。
* [magic-api](https://github.com/ssssssss-team/magic-api)。magic-api 是一个接口快速开发框架，通过Web页面编写脚本以及配置，自动映射为HTTP接口，无需定义Controller、Service、Dao、Mapper、XML、VO等Java对象
* [APIJSON](https://github.com/Tencent/APIJSON)。APIJSON 是一种专为 API 而生的 JSON 网络传输协议 以及 基于这套协议实现的 ORM 库。为各种增删改查提供了完全自动化的万能 API，零代码实时满足千变万化的各种新增和变更需求
* [Spring Data REST](https://spring.io/projects/spring-data-rest)。通过使用 Spring Data REST，开发者能够将数据存储层（如：JPA 数据库、MongoDB 等）中的实体以资源的形式发布到 Web 服务上，从而简化了构建 REST API 的过程。Spring Data REST 自动处理诸如列表检索、单个资源获取、创建新资源、更新和删除等常见操作。此外，它还支持分页、排序、链接关系以及自定义HTTP方法等功能，极大地减少了开发人员在实现基础 CRUD 操作时编写的样板代码量。[Spring Data REST一种快速且简单的暴露 RESTful风格的HTTP接口](https://mp.weixin.qq.com/s?__biz=MzA5MzI5NjQxNQ==&mid=2447612607&idx=1&sn=5bc5734bbcf66f1600590d12f4f68a72&chksm=847738cfb300b1d978dfb98d4964fb380c475d692c2880cd30fcb2d5231feb514718344bbafd&mpshare=1&scene=1&srcid=0208qKJFdZIn7cs7EhUWiLYG&sharer_shareinfo=cc6282dcbd14ce8897e599142cefb4ee&sharer_shareinfo_first=959f38a13062bf1febd1d4e6160a6ad1&version=4.1.10.99312&platform=mac#rd)
* [dataService](https://github.com/zhugezifang/dataService)。dataService 旨在提供全面的数据服务及共享能力，统一管理面向内外部的API服务。能够将数据表快速生成数据API，或将已有API快速注册至本平台进行统一管理与发布。
* [Dataway]([hasor](https://github.com/ClouGence/hasor))。Hasor 提供 DataQL（数据查询引擎）。依托 DataQL 服务聚合能力，Dataway 为应用提供一个 UI 界面，可以直接在界面上配置和发布接口。这种模式的革新使得开发一个接口不必在编写任何形式的代码，只需要配置一条 DataQL 查询即可完成满足前端对接口的需求。 从而避免了从数据库到前端之间一系列的开发配置任务，例如：Mapper、DO、DAO、Service、Controller 统统不在需要。Dataway特意采用了 jar包集成的方式发布，这使得任意的老项目都可以无侵入的集成 Dataway。 直接改进老项目的迭代效率，大大减少企业项目研发成本。
* [rocket-api](https://github.com/mihuajun/rocket-api)。"Rocket-API" 基于spring boot 的API敏捷开发框架，服务端50%以上的功能只需要写SQL或者 mongodb原始执行脚本就能完成开发，另外30%也在不停的完善公共组件，比如文件上传，下载，导出，预览，分页等等通过一二行代码也能完成开发，剩下的20%也能依赖于动态编译技术生成class的形式，不需要发布部署，不需要重启来实现研发团队的快速编码，提测以及回归。
* [DataApiService](https://github.com/WeBankFinTech/DataSphereStudio-Doc/blob/main/zh_CN/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/DataApiService%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3.md)。（DSS已内置的第三方应用工具）数据API服务。可快速将SQL脚本发布为一个 Restful 接口，对外提供 Rest 访问能力。
* [SREWorks](https://github.com/alibaba/SREWorks)。提供了数据服务功能，位于 [saas/dataops/api/dataset](https://github.com/alibaba/SREWorks/tree/main/saas/dataops/api/dataset) 模块
  * [InterfaceConfigService.java](https://github.com/alibaba/SREWorks/blob/main/saas/dataops/api/dataset/dataset-api/src/main/java/com/alibaba/sreworks/dataset/api/inter/InterfaceConfigService.java)
* [驭数平台](https://gitee.com/data_harness_cloud/data_harness-be)。提供了部分数据服务功能，参考：
  * [MyDynamicController.java](https://gitee.com/data_harness_cloud/data_harness-be/blob/master/application-webadmin/src/main/java/supie/webadmin/app/controller/dynamicRoutingAPI/MyDynamicController.java)
  * [CustomizeRouteServiceImpl](https://gitee.com/data_harness_cloud/data_harness-be/blob/master/application-webadmin/src/main/java/supie/webadmin/app/service/impl/CustomizeRouteServiceImpl.java)