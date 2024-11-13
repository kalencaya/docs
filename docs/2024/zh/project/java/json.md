# Json

## Json Schema

* [json-schema](https://json-schema.org/)
* [json-schema-validator](https://github.com/networknt/json-schema-validator)
* [jsonschema-generator](https://github.com/victools/jsonschema-generator)
* [json-schema-inferrer](https://github.com/saasquatch/json-schema-inferrer)

## Jackson

* [jackson](https://github.com/FasterXML/jackson)
  * 多态序列化
  * 自定义序列化器
    * 脱敏&数据权限
    * 格式化。数字（金钱，千|万｜亿），日期，字典｜枚举转换

### 反射

jackson 反射 api 使用

```java
ObjectMapper mapper = createMapper();
JavaType javaType = mapper.constructType(Test.class);
// JavaType javaType = mapper.getTypeFactory().constructType(Test.class);
BeanDescription bd = mapper.getSerializationConfig().introspect(javaType);
bd.findProperties().stream().forEach(bpd -> System.out.println(bpd.getName()));
```

## 其他

* [JsonPath](https://github.com/json-path/JsonPath)。类似 xml path 功能，用于快速提取 json 字段内容。
* [zjsonpatch](https://github.com/flipkart-incubator/zjsonpatch)。用于比较两个 json 片段，获取一个 json 相比另一个 json 增加或者减少的信息。可用于数据传输场景，每次只传输变更的数据。也可用于 json merge 功能，将一个 json 应用于另一个 json，实现如果第一条 json 有字段，则使用第一条的，第一条 json 没有而第二条 json 有的，则继续使用第二条的。
