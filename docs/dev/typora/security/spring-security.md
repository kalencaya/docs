# Spring Security 介绍

授权信息上下文共享

应用在处理逻辑时，一般需要获取登陆用户的信息，如记录操作日志。为了方便应用代码获取登陆用户信息，一般采用 `ThreadLocal` 存储用户信息：

```java
public final class MassPrincipalHolder {

    private static final ThreadLocal<CustomPrincipal> THREAD_LOCAL = new ThreadLocal();
    private static final TransmittableThreadLocal<CustomPrincipal> T_THREAD_LOCAL = new TransmittableThreadLocal<>();

    public static void removePrincipal() {
        CustomPrincipal principal = THREAD_LOCAL.get();
        if (principal != null) {
            principal.clear();
        }
        THREAD_LOCAL.remove();
    }

    public static void putPrincipal(@Nullable CustomPrincipal principal) {
        THREAD_LOCAL.set(principal);
    }
}

public final class MassPrincipal implements Principal {
    
    public Map<String, Object> map = new ConcurrentHashMap(8);
    
    @Override
    public String getName() {
        return (String) map.get("userId");
    }

}
```

spring-security 也提供了类似的类：

* `Authentication`
* `SecurityContext`
* `SecurityContextHolder`。`SecurityContext` 保存支持 `ThreadLocal`、`InheritableThreadLocal` 和 Global。

在多线程环境中，`ThreadLocal` 在线程之间传递很容易丢失数据，因此出现了 [transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local) 解决方案。除了使用 [transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local) 外，spring-security 也提供了相应的解决方案：[Concurrency Support](https://docs.spring.io/spring-security/reference/features/integrations/concurrency.html)。



