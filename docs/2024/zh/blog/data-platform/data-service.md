# 数据服务

## 路由

当用户上传 SQL 片段或者其他方式查询语句（redis command、es query）快速生成一个接口时，数据服务需要将接口发布。

接口发布后，接口调用方如何调用接口，数据服务又如何处理掉用方请求呢？这里就需要接口路由实现。

### 静态路由

服务端定义一个通用接口如：

```java
@Component
public class DynamicController {

    @PostMapping("/execute")
    @ResponseBody
    public ResponseResult<Object> executeSql(HttpServletRequest request) {
        Map<String, Object> requestBody = HttpParamUtil.getRequestBody(request);

        String api = requestBody.get(HttpParamUtil.API_KEY);
        Object params = requestBody.get(HttpParamUtil.API_PARAMS);
        
        return doExecuteSql(api, params);
    }
}
```

用户所有请求都发往一个统一的接口，通过请求参数中数据服务接口的唯一key进行二次路由，但是对外提供的接口只有一个，外界所有接口调用都走到这里面。

### 动态路由

数据服务发布接口后，可以指定接口，如商品列表发布至 `GET /api/items/list`，商品删除接口发布至 `DELETE /api/items/delete`。

大部分后端框架定义接口的时候，都是提前定义好，无法在项目启动后在做修改（如框架在项目启动执行代码扫描，扫描出用户定义的接口，框架本身完成请求参数和响应结果的序列化和反序列化，做动态路由）：

* dubbo。用户需定义接口，增加 `@Producer` 注解和对应实现
* spring mvc。用户通过 `@RequestMapping` 定义接口

要实现动态发布接口，需有 2 个步骤：

* 动态定义接口
* 动态注册接口

服务端框架实现方式：

* dubbo。
  * 使用代码生成动态定义接口，及其实现
  * 注册接口至 dubbo 注册中心
* spring。
  * 使用代码生成动态定义接口，及其实现
  * 注册接口至 spring 的 `RequestMappingHandlerMapping` 类中

#### dubbo

多协议。待补充

#### spring

待补充

### 通用实现

通用实现，做内部路由。待补充