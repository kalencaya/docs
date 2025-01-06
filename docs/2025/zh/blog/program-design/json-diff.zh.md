# Json Diff&Merge

Json 的 diff 和 merge 功能实现

## 需求背景

scaleph 为了减少用户配置 flink 任务的工作，将一些常用、重复性的配置做成 template，自动应用到新建任务中。当 template 与新建任务进行 merge 时，需要比较 template 和新建任务配置项，新建任务会应用、新增或覆盖 template 配置项。

scaleph 的 flink 任务管理基于 flink kubernetes operator 实现，需要提供符合 flink kubernetes operator CRD 格式的对象，格式为 json 或 yaml。

scaleph 实现 template 和新建任务配置 merge 时，也同样采用了 json 生态相关库。

## 功能调研

在很多场景都需要用到数据的 diff 和 merge 功能：

- 优化网络传输。网络传输大对象的时候会消耗大量网络流量，此时可以只传输变动的数据，减少对象体积。如 [Elasticsearch](https://github.com/elastic/elasticsearch/blob/8.8/server/src/main/java/org/elasticsearch/cluster/Diff.java) 优化集群信息同步。
- 配置变更。当推送新配置时，对比当前生效中的配置和新配置区别，应用发生变更的配置。如 kubernetes 的[声明式配置](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/#%E5%A3%B0%E6%98%8E%E5%BC%8F%E5%AF%B9%E8%B1%A1%E9%85%8D%E7%BD%AE)特性。

收集到的开源项目实现如下：

- flink kubernetes operator。[Diffable](https://github.com/apache/flink-kubernetes-operator/blob/release-1.5/flink-kubernetes-operator-api/src/main/java/org/apache/flink/kubernetes/operator/api/diff/Diffable.java) & [ReflectiveDiffBuilder](https://github.com/apache/flink-kubernetes-operator/blob/release-1.5/flink-kubernetes-operator/src/main/java/org/apache/flink/kubernetes/operator/reconciler/diff/ReflectiveDiffBuilder.java)
- apache commons-lang。[ReflectionDiffBuilder](https://github.com/apache/commons-lang/blob/master/src/main/java/org/apache/commons/lang3/builder/ReflectionDiffBuilder.java)
- [json-patch](https://jsonpatch.com/)。kubernetes 使用 json-patch 对配置进行 diff 和 apply

## 实现一

基于 jackson 实现

```java
package cn.sliew.scaleph.engine.flink.kubernetes.operator.util;

import cn.sliew.milky.common.util.JacksonUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.flipkart.zjsonpatch.DiffFlags;
import com.flipkart.zjsonpatch.JsonDiff;
import com.flipkart.zjsonpatch.JsonPatch;

import java.util.EnumSet;

public enum TemplateMerger {
    ;

    public static <T> T merge(T template, T target, Class<T> clazz) {
        JsonNode templateNode = JacksonUtil.toJsonNode(template);
        JsonNode targetNode = JacksonUtil.toJsonNode(target);
        JsonNode merged = doMerge(templateNode, targetNode);
        return JacksonUtil.toObject(merged, clazz);
    }

    public static JsonNode doMerge(final JsonNode template, final JsonNode target) {
        ObjectNode targetObject = (ObjectNode) target;
        ObjectNode templateObject;
        if (template instanceof ObjectNode) {
            templateObject = (ObjectNode) template;
        } else {
            templateObject = targetObject.objectNode();
        }

        target.fields().forEachRemaining(field -> {
            String key = field.getKey();
            JsonNode value = field.getValue();
            if (value.isNull()) {
                templateObject.remove(key);
            } else {
                JsonNode existingValue = templateObject.get(key);
                JsonNode mergeResult = doMerge(existingValue, value);
                templateObject.replace(key, mergeResult);
            }
        });
        return templateObject;
    }

}
```

## 实现二

基于 [zjsonpatch](https://github.com/flipkart-incubator/zjsonpatch) 实现，取消 `remove` 类型。

```java
package cn.sliew.scaleph.engine.flink.kubernetes.operator.util;

import cn.sliew.milky.common.util.JacksonUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.flipkart.zjsonpatch.DiffFlags;
import com.flipkart.zjsonpatch.JsonDiff;
import com.flipkart.zjsonpatch.JsonPatch;

import java.util.EnumSet;

public enum TemplateMerger {
    ;

    public static <T> T merge(T template, T target, Class<T> clazz) {
        JsonNode templateNode = JacksonUtil.toJsonNode(template);
        JsonNode targetNode = JacksonUtil.toJsonNode(target);
        JsonNode merged = doMerge(templateNode, targetNode);
        return JacksonUtil.toObject(merged, clazz);
    }

    private static JsonNode doMerge(JsonNode source, JsonNode target) {
        EnumSet<DiffFlags> flags = DiffFlags.dontNormalizeOpIntoMoveAndCopy().clone();
        JsonNode patch = disableRemove((ArrayNode) JsonDiff.asJson(source, target, flags));
        return JsonPatch.apply(patch, source);
    }

    private static JsonNode disableRemove(ArrayNode patch) {
        if (patch.isEmpty()) {
            return patch;
        }

        ArrayNode arrayNode = JacksonUtil.createArrayNode();
        for (JsonNode op : patch) {
            ObjectNode objectNode = (ObjectNode) op;
            if (objectNode.path("op").asText().equals("remove") == false) {
                arrayNode.add(objectNode);
            }
        }

        return arrayNode;
    }
}
```
