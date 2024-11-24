# 字节码

## AnnotationProcessor

* [pf4j](https://github.com/pf4j/pf4j)。
* [devops-framework](https://github.com/bkdevops-projects/devops-framework)。源码：[devops-boot-core/devops-plugin](https://github.com/bkdevops-projects/devops-framework/tree/master/devops-boot-project/devops-boot-core/devops-plugin)，类似于 pf4j 的插件系统
* 实现 annotation-processor
  * [build-your-own-framework](https://github.com/JacekDubikowski/build-your-own-framework)。基于 annotation processor 实现依赖注入
  * [jdeparser2](https://github.com/jdeparser/jdeparser2)
  
* 相关框架
  * [lombok](https://github.com/projectlombok/lombok)
  * [mapstruct](https://github.com/mapstruct/mapstruct)
  * [auto](https://github.com/google/auto)。google auto-serivce
  * [quarkus](https://github.com/quarkusio/quarkus)
  * [micronaut-core](https://github.com/micronaut-projects/micronaut-core)


## Agent

* [javassist](https://github.com/jboss-javassist/javassist)。dubbo 和 ageiport
* [byte-buddy](https://github.com/raphw/byte-buddy)
* [asm](https://asm.ow2.io/)
* [bytekit](https://github.com/alibaba/bytekit)
* [javapoet](https://github.com/palantir/javapoet)。Java library used to generate Java source files
  * [kotlinpoet](https://github.com/square/kotlinpoet)
  * 生成 java 代码，使用 api 拼接是一件费时费力的事情，也可以使用 freemarker、mustache 等模板引擎生成会更易读和方便

## 简介

在开发过程中，`.java` 文件需要经过编译变成 `.class` 字节码，在到启动、运行，Java 提供了多种方式增强程序的方法：

- 编译。annotation processor
- 启动。JavaAgent
- 运行。反射，aop，动态生成和编译

### 编译-annotation processor

常见的项目：

* [lombok](https://github.com/projectlombok/lombok)
* [mapstruct](https://github.com/mapstruct/mapstruct)
* [auto](https://github.com/google/auto)。google auto-serivce

缺陷：只是在编译时提供了 API 处理特定注解，如果要新增 Java 类或修改字节码，annotation processor 并未提供 API。需要使用其他 API 配合，新增 Java 类已经有成熟的解决方案，但是修改字节码则应用较少，做的最好的是 lombok，其中的难度参考 [Generate Methods in annotation processors](https://stackoverflow.com/a/70008734)。

### 启动-JavaAgent

常见项目：

* 链路追踪。

