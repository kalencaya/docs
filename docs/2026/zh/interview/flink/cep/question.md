# 问题经验

## 异常

### 1.量词翻译异常

如果 `Pattern` 没有设置 `量词`，则为 `SINGLE` 模式，如果设置量词，变为 `LOOP` 模式。

在自定义规则翻译成 flink-cep 的 `Pattern` 时，为了方便将只发生 1 次的事件直接设置为 `times(1, 1)`，认为会与 `SINGLE` 模式等效。在实际运行中发现是有问题的：

```java
Pattern<Event, Event> pattern = Pattern.<Event>begin("start", AfterMatchSkipStrategy.skipPastLastEvent())
        .where(new AviatorCondition<>("action == 0"))
        .followedBy("middle")
        .where(new AviatorCondition<>("action == 0"))
// 使用 1 ~ 1，会导致 within 失效，会命中超过 5 秒的事件
//        .times(1, 1)
        .within(Time.seconds(5L))
        ;
```

