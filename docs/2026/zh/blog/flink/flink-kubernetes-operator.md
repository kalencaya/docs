# Flink Kubernetes Operator

Flink Kubernetes Operator 使用 Kubernetes API，提供云原生管理 Flink 集群的能力：

- 部署、监控 Flink Session 和 Application 应用
- 升级、暂停和删除应用
- 日志和 metrics 集成
- 支持弹性部署，与 Kuberentes 生态原生集成

## 体验

1. 环境要求

   1. [docker](https://docs.docker.com/)
   2. [kubernetes](https://kubernetes.io/)
   3. [helm](https://helm.sh/docs/intro/quickstart/)

2. 准备 kubernetes 环境

   1. docker desktop 自带的 kubernetes
   2. k3s
   3. minikube

3. 创建 Flink 任务专用 service account，参考 [Native Kubernetes#RBAC](https://nightlies.apache.org/flink/flink-docs-release-1.18/docs/deployment/resource-providers/native_kubernetes/#rbac)

   ```shell
   kubectl create serviceaccount flink-service-account
   kubectl create clusterrolebinding flink-role-binding-flink --clusterrole=edit --serviceaccount=default:flink-service-account
   ```

4. 安装 flink-kubernetes-operator，参考 [Try the Flink Kubernetes Operator](https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-release-1.7/docs/try-flink-kubernetes-operator/quick-start/)

   ```shell
   kubectl create -f https://github.com/jetstack/cert-manager/releases/download/v1.8.2/cert-manager.yaml
   
   helm repo add flink-kubernetes-operator-1.7.0 https://archive.apache.org/dist/flink/flink-kubernetes-operator-1.7.0/
   # 修改 flink 镜像仓库为 apache/flink-kubernetes-operator
   # 默认是从 github packages 下载，从 github 下载比较慢，换成 dockerhub 
   helm install flink-kubernetes-operator flink-kubernetes-operator-1.7.0/flink-kubernetes-operator --set webhook.create=false --set image.repository=apache/flink-kubernetes-operator
   
   # 查看安装状态
   kubectl get deployment
   # 查看安装详情
   kubectl describe deployment flink-kubernetes-operator
   ```

5. 提交任务

   ```shell
   # 任务创建时需要拉取 flink 镜像，为了安装体验可以预先拉取镜像
   docker pull flink:1.17

   # 提交任务
   kubectl create -f https://raw.githubusercontent.com/apache/flink-kubernetes-operator/release-1.7/examples/basic.yaml
   ```

6. 查看任务

   ```shell
   # 查看任务信息
   kubectl get deployment
   kubectl get pods

   # 查看任务日志
   kubectl logs -f deploy/basic-example

   # 访问 flink web-ui
   # 访问 http://localhost:8081
   kubectl port-forward svc/basic-example-rest 8081
   ```

7. 关闭任务

   ```shell
   kubectl delete flinkdeployment/basic-example
   ```

## Ingress

在 Kubernetes 中，外部访问集群内的服务有两种方式：[service](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) 和 [ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)。其中 Flink 的 web ui 对 service 的 3 种类型都进行了支持，[参考链接](https://nightlies.apache.org/flink/flink-docs-release-1.17/docs/deployment/resource-providers/native_kubernetes/#accessing-flinks-web-ui)：

- ClusterIP
- NodePort
- LoadBalancer

Flink Kubernetes Operator 并不干涉 Flink web ui 的功能，用户在通过 Flink Kubernetes Operator 部署 Flink 任务的时候，仍然可以使用上述 3 种方式来访问 Flink web ui。但除此之外，Flink Kubernetes Operator 提供 ingress 配置，可以让用户在未配置外部访问的情况下，访问到 Flink web ui。

1. 安装 nginx ingress

   ```shell
   # 安装 ingress-nginx
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml

   # 检验安装结果
   kubectl get pods -n ingress-nginx
   kubectl get services -n ingress-nginx
   ```

2. yaml 增加 ingress 配置

   ```yaml
   apiVersion: flink.apache.org/v1beta1
   kind: FlinkDeployment
   metadata:
     name: advanced-ingress
   spec:
     image: flink:1.17
     flinkVersion: v1_17
     ingress:
       template: "/{{namespace}}/{{name}}(/|$)(.*)"
       className: "nginx"
       annotations:
         nginx.ingress.kubernetes.io/rewrite-target: "/$2"
     flinkConfiguration:
       taskmanager.numberOfTaskSlots: "2"
     serviceAccount: flink
     jobManager:
       resource:
         memory: "1024m"
         cpu: 0.1
     taskManager:
       resource:
         memory: "1024m"
         cpu: 0.25
     job:
       jarURI: local:///opt/flink/examples/streaming/StateMachineExample.jar
       parallelism: 2
   ```

3. 部署任务

   ```yaml
   # 部署任务
   kubectl apply -f advanced-ingress.yaml

   # 查看任务
   kubectl get FlinkDeployment

   kubectl get deployment

   kubectl get pods

   kubectl get ingress -A
   kubectl describe ingress $ingress

   kubectl get services
   ```

4. 访问任务。https://localhost/default/advanced-ingress/

5. 删除任务。

   ```shell
   kubectl delete -f advanced-ingress.yaml
   ```

## CRD

Flink 除了 Standalone，还支持多种资源调度框架如 YARN、Kubernetes。在 Kubernetes 上支持 Application 和 Session 模式。Flink Kubernetes Operator 同时提供在 Kubernetes 上创建 Standalone 集群，以 Application 和 Session 模式原生运行 Flink 的功能。

Flink Kubernetes Operator 以 CRD 的方式提供云原生配置，分别定义 `FlinkDeployment` 和 `FlinkSessionJob`。

`FlinkDeployment` 包含信息如下：

- JobSpec
- flinkConfiguration
- logConfiguration
- JobManager，Taskmanager，PodTemplate
- IngressSpec

### `JobSpec`

```java
/** Flink job spec. */
@Experimental
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobSpec implements Diffable<JobSpec> {

    private String jarURI;
    private String entryClass;
    private String[] args = new String[0];
    private String initialSavepointPath;
    private Boolean allowNonRestoredState;

    private int parallelism;

		private UpgradeMode upgradeMode = UpgradeMode.STATELESS;

    private JobState state = JobState.RUNNING;

    private Long savepointTriggerNonce;
}
```

### `JobManagerSpec`，`TaskmanagerSpec`，`PodTemplate`

```java
/** JobManager spec. */
@Experimental
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobManagerSpec {

    private Resource resource;
    private int replicas = 1;
    private Pod podTemplate;
}

/** TaskManager spec. */
@Experimental
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskManagerSpec implements Diffable<TaskManagerSpec> {

    private Resource resource;
    private Integer replicas;
    private Pod podTemplate;
}

/** Resource spec. */
@Experimental
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Resource {

    private Double cpu;
    private String memory;
    private String ephemeralStorage;
}
```

### `IngresssSpec`

```Java
/** Ingress spec. */
@Experimental
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class IngressSpec {

    private String template;
    private String className;
    private Map<String, String> annotations;
}
```

### `flinkConfiguration`, `logConfiguration`

```java
private Map<String, String> flinkConfiguration;
private Map<String, String> logConfiguration;
```
