# Spinnaker

## 安装流程

* 安装 halyard
* 准备环境
  * 准备 kubernetes
  * 准备 minio
* 使用 halyard 在 kubernetes 中启动 spinnaker

### 安装 Halyard

```shell
# 下载 docker 镜像。网络无法连通情况下，需开通 VPN 和代理
docker pull us-docker.pkg.dev/spinnaker-community/docker/halyard:stable

# 启动 halyard
docker run -p 8084:8084 -p 9000:9000 \
    --name halyard --rm \
    -v ~/.hal:/home/spinnaker/.hal \
    -v ~/.kube:/home/spinnaker/.kube \
    -it -d \
    us-docker.pkg.dev/spinnaker-community/docker/halyard:stable

# 关闭 halyard
docker stop halyard

# 进入 halyard
docker exec -it halyard bash

# 在进入 halyard 后执行如下命令，启动命令行补全。
source <(hal --print-bash-completion)

# 启动命令行补全后，可通过 hal -h 获得命令提示
```

### 准备 kubernetes

kubernetes 环境以 docker-desktop 启动的 kubernetes 为例，略过为 kubernetes 配置 context 和 RBAC，一切都使用默认的

在 halyard 容器中执行

```shell
# 启用 kubernetes 作为 provider
hal config provider kubernetes enable

# 添加账号，即添加 kubernetes 的 context 作为 account
# kubernetes 的信息通过在用 docker 启动 halyard 的时候，把 .kube 目录挂载到了 /home/spinnaker/.kube
CONTEXT=$(kubectl config current-context)
hal config provider kubernetes account add my-k8s-account \
    --context $CONTEXT
```

## 参考链接

* [Install](https://spinnaker.io/docs/setup/install/)
* [Kubernetes V2 Provider](https://spinnaker.io/docs/setup/install/providers/kubernetes-v2/)

