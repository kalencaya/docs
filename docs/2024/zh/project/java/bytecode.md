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


## 字节码

* [javassist](https://github.com/jboss-javassist/javassist)
  * dubbo。参考 [SPI](https://github.com/apache/dubbo/blob/3.3/dubbo-common/src/main/java/org/apache/dubbo/common/extension/SPI.java)、[ClassGenerator](https://github.com/apache/dubbo/blob/3.3/dubbo-common/src/main/java/org/apache/dubbo/common/bytecode/ClassGenerator.java)、[Compiler](https://github.com/apache/dubbo/blob/3.3/dubbo-common/src/main/java/org/apache/dubbo/common/compiler/Compiler.java)
  * ageiport。参考 [ageiport-ext-arch](https://github.com/alibaba/AGEIPort/tree/master/ageiport-ext/ageiport-ext-arch)，目测应该是 dubbo 3.0 版本之前的 dubbo 相关功能

* [byte-buddy](https://github.com/raphw/byte-buddy)
* [asm](https://asm.ow2.io/)
* [bytekit](https://github.com/alibaba/bytekit)
* [cglib](https://github.com/cglib/cglib)。不在新版本 JDK 维护，尤其是 JDK 17+

## 代理

* JDK。基于接口。mybatis 插件
* [javassist](https://github.com/jboss-javassist/javassist)
* [cglib](https://github.com/cglib/cglib)

## 简介

在开发过程中，`.java` 文件需要经过编译变成 `.class` 字节码，在到启动、运行，Java 提供了多种方式增强程序的方法：

- 编译。annotation processor
- 启动。JavaAgent
- 运行。JavaAgent，反射，代理，aop，动态生成和编译

### Annotation Processor

注解处理器（Annotation Processor）在 JSR 269 中引入，是 `javac` 的一个工具，只在**编译**时生效。Annotation Processor 在编译时扫描、编译、处理注解（Annotation）。用户可以自定义注解和注解处理器在**编译**期间处理一些工作：

* 新增 Java 类
* 修改字节码文件
* 其他。如动态生成 `META-INF/services` 文件

Annotation Processor 的应用场景：

* [mapstruct](https://github.com/mapstruct/mapstruct)
* [lombok](https://github.com/projectlombok/lombok)
* [auto](https://github.com/google/auto)。google auto-serivce

Annotation Processor 只提供了在编译时扫描、编译、处理注解（Annotation）功能。如果用户想要在新增 Java 类或修改字节码，都需要使用其他 API 配合：

* 新增 Java 类。
  * [javapoet](https://github.com/palantir/javapoet)
  * [kotlinpoet](https://github.com/square/kotlinpoet)
  * 生成 Java 代码，使用 API 处理 import，字段，方法参数、返回结果，方法体，执行方法调用是一件费时费力的事情，也可以使用 freemarker、mustache 等模板引擎生成会更易读和方便
* 修改字节码文件。
  * 修改字节码则应用较少，做的最好的是 lombok，难度参考 [Generate Methods in annotation processors](https://stackoverflow.com/a/70008734)。

### JavaAgent

JavaAgent 在 JDK 1.5 引入，是一种可以动态修改 Java 字节码的技术。JavaAgent 不能独立运行，启动时需要在目标程序的启动参数中添加 `-javaagent` 参数引入。

JavaAgent 通过 Instrumentation API 与 JVM 交互，Instrumentation API 主要有以下功能：

* 在 JVM 加载 Java 字节码之前拦截并对字节码进行修改。
  * JVM 启动时加载 JavaAgent 代码，Instrumentation 通过 `premain` 方法传入代理程序，`premain` 方法会在 `main` 方法之前被调用。
  * `premain` 方法在启动时，在类加载前定义类的 TransFormer，在类加载时更新对应的类的字节码。
* 在 JVM 运行期间修改已经加载的字节码。JDK 1.6 提供
  * Instrumentation 提供 `agentmain`方法实现字节码修改。JVM 提供 Attach API，可以将代理程序 `attach(pid)` 到另一个运行中的 Java 进程，通过 `loadAgent(AgentJarPath)` 方法将 JavaAgent jar 包注入到对应的 Java 进程，Java 进程即会调用 `agentmain` 方法，实现动态字节码修改。如果有 [arthas](https://github.com/alibaba/arthas) 使用体验，这个过程会很有既视感。
  * `agentmain` 方法用于在运行时进行字节码改写，分为注册类的 TransFormer 调用和 retransformClasses 函数进行类的重加载

`premain` 方法仅在程序启动时运行，即 `main` 方法执行前。此时还有很多类没有被加载，这些类无法通过 `premain` 方法修改字节码。

JavaAgent 的应用场景：

- 线上诊断。如 [arthas](https://github.com/alibaba/arthas)
- 链路工具。如 [skywalking](https://github.com/apache/skywalking)

### 反射

普通反射

* mybatis
  * `ReflectorFactory`
  * `MetaClass`
  * `MetaObject`
* spring
  * `ReflectionUtils`
  * `ClassUtils`
  * `TypeUtils`
* apache commons
  * `ClassUtils`
  * `FieldUtils`
  * `MethodUtils`
  * `TypeUtils`
* hutool
  * `ReflectUtil`
* jackson
  * `TypeFactory`, `JavaType`, `SerializationConfig`, `DeserializationConfig`,  `ClassIntrospector`

lambda

* [JobRunr](https://github.com/jobrunr/jobrunr/blob/master/core/src/main/java/org/jobrunr/jobs/details/JobDetailsAsmGenerator.java)

其他

* [objenesis](https://github.com/easymock/objenesis)。对象创建

