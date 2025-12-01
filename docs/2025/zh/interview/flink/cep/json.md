# Json 定义

本文是阿里云的 flink-cep 动态规则加载的 JSON 格式定义解读。

flink-cep 的定义为 `Pattern` 对象，它是一种链式的定义：

```java
Pattern<Event, Event> pattern = Pattern.<Event>begin("start", AfterMatchSkipStrategy.skipPastLastEvent())
        .where(new AviatorCondition<>("action == 0"))
        .next("middle")
        .where(new RichAndCondition<>(new AviatorCondition<>("action == 0"), new AviatorCondition<>("action == 0")))
        .oneOrMore()
        .within(Time.seconds(5L))
        .followedBy("end")
        .where(new AviatorCondition<>("action == 0"));
```

如上述案例中定义了 `start -> middle -> end` 3 个条件，在 `Pattern` 类中有 `previous` 字段分别存储每个条件的上一个条件。

在 ververica flink-cep 的 JSON 定义中，它是按照 graph 进行定义，因此会有 node 和 edge 的概念，只不过只有一条路径。

## Java 接口

每个模式组可以用 JSON 来定义，每个模式组内部由点和边组成，点即可以是一个模式，也可以是模式组即形成嵌套。因为在定义接口的时候，模式组也是模式，因此模式组的字段和模式有所重叠。

```java
public class Pattern<T, F extends T> {
    private final String name;
    private final Pattern<T, ? extends T> previous;
    private IterativeCondition<F> condition;
    private final Map<WithinType, Time> windowTimes = new HashMap();
    private Quantifier quantifier;
    private IterativeCondition<F> untilCondition;
    private Quantifier.Times times;
    private final AfterMatchSkipStrategy afterMatchSkipStrategy;
}

public class GroupPattern<T, F extends T> extends Pattern<T, F> {
    private final Pattern<T, ? extends T> groupPattern;
}
```

## 模式组

以一个最简单的 `Pattern` 为例：

```java
Pattern<Event, Event> pattern = Pattern.<Event>begin("start", AfterMatchSkipStrategy.noSkip())
        .where(new AviatorCondition<>("action == 0"));
```

生成的 JSON 如下，这里忽略了部分字段，以着重显示最外层的 JSON 定义

```json
{
    "name": "start",
    "quantifier": {
        "consumingStrategy": "SKIP_TILL_NEXT",
        "properties": [
            "SINGLE"
        ],
        "times": null,
        "untilCondition": null
    },
    "afterMatchStrategy": {
        "type": "NO_SKIP",
        "patternName": null
    },
    "type": "COMPOSITE",
    "version": 1
}
```

增加一个条件，并修改匹配后跳过策略：

```java
Pattern<Event, Event> pattern = Pattern.<Event>begin("start", AfterMatchSkipStrategy.skipPastLastEvent())
        .where(new AviatorCondition<>("action == 0"))
        .next("end")
        .where(new AviatorCondition<>("action == 1"))
        .times(3).optional().greedy();
```

生成的 JSON 如下，这里忽略了部分字段，以着重显示最外层的 JSON 定义

```json
{
    "name": "xxx",
    "quantifier": {
        "consumingStrategy": "SKIP_TILL_NEXT",
        "properties": [
            "TIMES",
            "OPTIONAL",
            "GREEDY"
        ],
        "times": {
            "from": 3,
            "to": 3,
            "windowTime": null
        },
        "untilCondition": null
    },
    "condition": null,
    "window": null,
    "afterMatchStrategy": {
        "type": "SKIP_PAST_LAST_EVENT",
        "patternName": null
    },
    "type": "COMPOSITE",
    "version": 1
}
```

可以看到：

* version。固定为 `1`
* type。`COMPOSITE`。模式组固定为 `COMPOSITE`，表明它是由多个节点和边组成的完整模式图。
  * 它有两个枚举值：`SINGLE` 和 `COMPOSITE`，一般内部的节点是 `SINGLE`，如果节点是一个模式组，则它的类型是 `COMPOSITE`
* afterMatchStrategy。开始条件的匹配后跳过策略，也是全局策略
* window。模式组整体的窗口
* condition。模式组为 null
* name。第一次为 `start`，第二次为 `end`，说明它选择了最后一个条件的 name 字段
* quantifier。与 name 一样，同样为最后一个条件的 quantifier 字段

## Node

### 条件

即筛选条件。如使用 `aviator` 表达式，即为：

```json
{
    "condition": {
        "expression": "action == 0",
        "type": "AVIATOR"
    }
}
```

如果是比较复杂，有一定嵌套的如 `action == 0 and action == 0` 可以如下表示

```java
{
    "condition": {
        "nestedConditions": [
            {
                "expression": "action == 0",
                "type": "AVIATOR"
            },
            {
                "expression": "action == 0",
                "type": "AVIATOR"
            }
        ],
        "type": "CLASS",
        "className": "org.apache.flink.cep.pattern.conditions.RichAndCondition"
    }
}
```

### 量词

模式有 2 种类型：

* 单例模式（`SINGLE`）
* 循环模式（`LOOPING`）。单例模式加上`量词`即位循环模式

量词有 3 类：

* `times(4)`及其变体
* `optional()`
* `greedy()`

`QuantifierProperty` 有 5 个枚举：

* `SINGLE`。只发生 1 次
* `TIMES`。发生固定次数。如 `times(3)` 或 `times(3, 5)`
* `LOOPING`。使用 `oneOrMore()` 或 `timesOrMore(5)` 后 `TIMES` 变为 `LOOPING`
* `OPTIONAL`。使用 `optional()` 方法
* `GREEDY`。使用 `greedy()` 方法

次数定义

```java
public static class Times {
    private final int from;
    private final int to;
    @Nullable
    private final Time windowTime;
}

public final class Time {
    private final TimeUnit unit;
    private final long size;
}
```

#### 窗口

窗口有 2 种场景：

* `量词`。如10s 内连续 5 次出现
* `模式组`。如下单后 5 分钟内支付，它是限制 `下单` 和 `支付` 两个时间在 5 分钟内完成，即 `下单` 后发生 `支付` 整个模式组在 5 分钟内完成。模式组的窗口只能发生在最后面。

todo：需研究是 flink-cep 本身不支持，还是 ververica flink-cep 定义的 json 格式不支持

### 连续性

`ConsumingStrategy` 有 5 个枚举：

* `STRICT`。严格连续
* `SKIP_TILL_NEXT`。宽松连续
* `SKIP_TILL_ANY`。不确定连续
* `NOT_NEXT`
* `NOT_FOLLOW`

## Edge

 edge 只有 3 个字段：

* source
* target
* type。连续性

案例如下：

```json
{
    "source": "middle",
    "target": "end",
    "type": "SKIP_TILL_NEXT"
}
```

