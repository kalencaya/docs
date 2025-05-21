# Lombok

## 注解

### `@Getter` 和 `@Setter`

对于某些特殊字段，lombok 生成的 getter/setter 方法和 jackson、mybatis 等识别的 getter/setter 方法并不相同，如 `pType` 字段（第一个字母小写，第二个字母大写），lombok 会生成 `setPType()` 方法，而 jackson 等会识别成 `setPtype()` 

### 构造器

#### 建造者

* `@Builder`。建造者模式
  * `toBuilder(boolean)` 。当需要修改类的属性，将类再次转成 Builder，只需设置需要修改的属性即可
  * `@Builder.Default` 建造者模式下设置默认值
  * `@NoArgsConstructor` 建造者模式下不会生成无参构造器，这个对于一些框架如 jackson 很重要。或者同时使用 `@Builder` 和 `Jacksonized` 注解
  * javadoc 支持。在 bean 中直接使用 `@Builder` 生成的 Builder 会导致 javadoc 无法识别 Builder 类，导致 javadoc 异常。进而出现项目正常编译、启动，但是在 deploy 时（此阶段配置了生成 javadoc）异常
  * 
* `@SuperBuilder`。`PageParam` 和 `BasePageParam` 的故事。对于继承场景，需要使用 `@SuperBuilder`，但是某天在对 `PageParam` 应用后发现生成的 `Builder` 在报错，多番尝试后发现只是对于 `PageParam` 异常，不得已之下定义了一个 `BasePageParam` 字段与 `PageParam` 保持一致，在需要建造者场景下继承 `BasePageParam`。
* `@Singular`。建造者模式下，对集合类型进行设置
* `@Accessors(chain = true)`。亦可实现类似 `@Builder` 类的效果，一些文章推荐使用 `@Accessors` 取代 `@Builder` 的原因在于建造者模式下生成的类，不该在通过 setter 方法修改属性如 okhttpclient 的 Request、Response 和 Client 等，而 `@Accessors` 是搭配 `@Setter` 和 `@Getter` 使用，语义上就支持 setter 方法修改属性如 Redisson 的 `SingleServerConfig`。
* `@With`。类似 `@Builder(toBuilder = true)`，新生成的 Builder 可以修改任何支持的属性，但是 `@With` 生成的 `withXxx` 方法只支持修改当前属性。如果使用 `@With` 生成的方法进行链式调用，会在中间不断地生成临时对象 

