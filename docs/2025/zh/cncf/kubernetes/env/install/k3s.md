# K3s

文档链接

* [快速入门指南](https://docs.k3s.io/zh/quick-start)。k3s 文档
* [K3s 中文文档](https://docs.rancher.cn/k3s/)。rancher k3s 文档
* [腾讯云k3s试用](https://mp.weixin.qq.com/s/d6aoYdrpU2HLnsFwm1Nk_g)。腾讯云轻量服务器提供了 k3s 模版
* [单机部署K3s服务并接入Kuboard](https://mp.weixin.qq.com/s?__biz=MzU2ODAxNjI4Nw==&mid=2247483959&idx=1&sn=5230dc0221553221403db97a3dae515d&chksm=fd428ba4d9310e90cf4504b701b2e2b5f4f795ce081787a22805eeeaa01f9befc3153028d95d&mpshare=1&scene=1&srcid=0406DrzerfrBhUfY20F2TI4d&sharer_shareinfo=f670f924a1417129b00fbbf1625d7011&sharer_shareinfo_first=511934ec0017ce6247353580a0111aa2&version=4.1.10.99312&platform=mac#rd)
* [K3S 证书有效期太短？一招将证书延长至 10 年！](https://mp.weixin.qq.com/s/wAzHw-bsp8wQ-VBnO5i4UA)

## 介绍

k3s 是一种轻量级、经过认证的 Kubernetes 发行版，专为资源受限的环境（例如边缘设备、物联网设备和小规模部署）而设计。它由 `Rancher Labs` 开发，构建的目标是提供一个简约且易于使用的 Kubernetes 发行版，消耗更少的资源，同时保持与 Kubernetes API 的完全兼容性。

### 功能和特性

1. 轻量级且资源高效：与标准 Kubernetes 发行版相比，k3s 的设计占地面积小，消耗的资源更少。它具有更少的内存占用、更小的二进制大小和更低的 CPU 开销，使其适合资源有限的环境。
2. 易于安装和管理：k3s 的设计宗旨是易于安装和管理。它可以安装在各种操作系统上，包括 Linux、macOS 和 Windows。安装过程得到简化，可以使用单个二进制文件完成。默认情况下，它还提供了一个轻量级容器运行时：containerd。
3. 高可用性和弹性：k3s 支持与标准 Kubernetes 相同的高可用性功能，允许您部署高弹性集群。它提供自动 etcd 快照和备份、控制平面组件自动扩展以及集成服务负载平衡等功能。
4. 安全性和兼容性：k3s 保持与 Kubernetes API 的完全兼容，确保现有的 Kubernetes 应用程序和工具无需修改即可与 k3s 一起使用。它还包括安全增强功能，例如内置 TLS 加密、RBAC（基于角色的访问控制）以及对 Seccomp 和 AppArmor 的容器安全支持。

### K3 的用例

1. 边缘计算：k3s 非常适合资源有限、需要轻量级 Kubernetes 发行版的边缘计算场景。它支持在边缘设备上部署和管理容器化应用程序，使组织能够在更接近数据源的地方处理数据并减少延迟。
2. IoT 部署：k3s 可用于需要 Kubernetes 功能但设备资源有限的物联网 (IoT) 部署。借助 k3s，您可以编排和管理 IoT 设备上的容器化工作负载，为 IoT 应用程序开发和部署提供可扩展且灵活的解决方案。
3. 开发和测试环境：k3s 可用于搭建轻量级的 Kubernetes 集群，用于开发和测试目的。它允许开发人员在笔记本电脑或台式机上轻松创建本地 Kubernetes 环境，而无需消耗过多资源，从而使他们能够高效地测试和迭代应用程序。
4. 小规模部署：k3s 适用于小规模部署，在这种情况下，成熟的 Kubernetes 发行版可能会显得大材小用。它提供了简化的安装过程，并且需要更少的资源，使得在小规模生产环境或个人项目中部署和管理 Kubernetes 集群变得更加容易。

总体而言，k3s 提供了一个轻量级、易于使用且资源高效的 Kubernetes 发行版，在边缘计算、物联网、开发/测试和小规模部署场景中特别有用。

## 管理 k3s

### 部署 server

一个 k3s 集群由 1 台 server 节点和 0 ~ N 个 agent 节点组成。一个 server 节点即是一个功能齐全的 Kubernetes 集群，它包括了托管工作负载 pod 所需的所有数据存储、control plane、kubelet 和容器运行时组件。

官方启动脚本：

```shell
# 默认下载最新的 stable 版本
curl -sfL https://get.k3s.io | sh -

# 中国用户可使用国内镜像，加速下载。默认下载最新的 stable 版本
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn sh -
```

推荐安装脚本如下：

```shell
# 安装 server 节点，注意替换 myip
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_VERSION=v1.31.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_KUBECONFIG_OUTPUT=/root/.kube/config \
	INSTALL_K3S_EXEC="--node-external-ip=myip --advertise-address=myip --system-default-registry=registry.cn-hangzhou.aliyuncs.com" \
	sh -

# 如果发现卡在下载 docker ce，需要更换 linux 的软件源
# centos 系统
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# ubuntu
# 安装GPG证书
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
# 写入软件源信息
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
```

### 新增 agent

获取 server 的 `K3S_TOKEN`

```shell
# 获取 server K3S_TOKEN，替换下面的 mynodetoken
cat /var/lib/rancher/k3s/server/node-token
```

官方添加 agent 节点脚本：

```shell
# 增加 agent 节点，注意替换 mynodetoken、myserver
curl -sfL https://get.k3s.io | K3S_URL=https://myserver:6443 K3S_TOKEN=mynodetoken sh -

# 中国用户可使用国内镜像，加速下载，注意替换 mynodetoken、myserver
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn K3S_URL=https://myserver:6443 K3S_TOKEN=mynodetoken sh -
```

推荐安装脚本如下：

```shell
# 增加 agent 节点，注意替换 mynodetoken、myserver 和 myip
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_VERSION=v1.31.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_URL=https://myserver:6443 \
	K3S_TOKEN=mynodetoken \
	INSTALL_K3S_EXEC="--node-external-ip=myip" \
	sh -

# 如果发现拉取 rancher k3s 和 docker 镜像异常，可以修改配置，切换下载地址
# 无需添加 --system-default-registry=registry.cn-hangzhou.aliyuncs.com
curl -sfL https://rancher-mirror.oss-cn-beijing.aliyuncs.com/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_MIRROR_URL=rancher-mirror.oss-cn-beijing.aliyuncs.com \
	INSTALL_K3S_VERSION=v1.31.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_URL=https://myserver:6443 \
	K3S_TOKEN=mynodetoken \
	INSTALL_K3S_EXEC="--node-external-ip=myip" \
	sh -
```

### 节点管理

* [卸载 K3s](https://docs.k3s.io/zh/installation/uninstall)
* [重启 K3s](https://docs.k3s.io/zh/upgrades/manual?_highlight=stable#%E9%87%8D%E5%90%AF-k3s)
* [停止 K3s](https://docs.k3s.io/zh/upgrades/killall)

## 问题排查

用户在安装运行异常，无法启动 k3s 时，可以通过如下命令查询状态：

```shell
systemctl status k3s.service
systemctl status k3s-agent.service
```

使用 systemd 运行时，日志将发送到 Journald，用户可以查看对应的日志：

```shell
journalctl -xeu k3s
journalctl -xeu k3s-agent

# 日志滚动
journalctl -xeu k3s -f
journalctl -xeu k3s-agent -f
```

k3s 日志查看：[K3s 日志在哪里？](https://docs.k3s.io/zh/faq?_highlight=journalctl#k3s-%E6%97%A5%E5%BF%97%E5%9C%A8%E5%93%AA%E9%87%8C)

## 安装脚本说明

### 指定版本

k3s 在国内提供了下载镜像，加速 k3s 下载。但不是每个版本在国内都有对应的镜像，在老版本中 k3s 是没有的。

官方的启动脚本默认会安装最新版本，用户可以选择一个固定版本。推荐版本：

* `v1.31.8+k3s1`
* `v1.26.8+k3s1`

### 指定 kubeconfig

k3s server 将 kubeconfig 文件写入到 `/etc/rancher/k3s/k3s.yaml`，由 k3s 安装的 kubectl 将自动使用该文件。

往往用户安装完 k3s 后，找不到 kubeconfig 文件，用户可以在安装时指定 kubeconfig 安装目录为 $HOME/.kube/config。

k3s 提供的相关文档：[集群访问](https://docs.k3s.io/zh/cluster-access)。

### 节点 ip

在云提供商购买的云服务器，一般都有 2 个 ip：内网 ip 和公网 ip，服务器上获取的 ip 地址都是内网 ip。内网不互通的多台服务器无法组成 k3s 集群。

解决方式就是在运行时指定节点 ip 和公网 ip：

* `--node-ip`。设置节点 InternalIP，默认是 `127.0.0.1`，无需设置。如果设置为内网 ip，还可能会因为云服务商设置，访问 `https://内网ip：6443` 异常。
* `--node-external-ip`。设置节点 ExternalIP
* `--advertise-address`。ApiServer 向集群成员发布的 IP 地址

一些云提供商（例如 Linode）将创建以 “localhost” 作为主机名的主机，而其他云提供商可能根本没有设置主机名。这可能会导致域名解析出现问题。你可以使用 `--node-name` 标志或 `K3S_NODE_NAME` 环境变量运行 K3s，这会通过传递节点名称来解决此问题。

启动成功后通过 kubectl 查看集群节点信息：

```shell
kubectl get nodes -o wide
```

可以看到节点的 `INTERNAL-IP` 和 `EXTERNAL-IP` 被成功设置为云服务器的内网 ip 和公网 ip。

### 开放端口

多台服务器组成 k3s 集群时，还要注意开放服务器端口，让集群节点互通。参考：[网络](https://docs.k3s.io/zh/installation/requirements?_highlight=10250#%E7%BD%91%E7%BB%9C)

```shell
# tcp
2379-2380,6443,10250

# udp
8472,51820,51821
```

### 配置证书有效期

通过配置环境变量 `CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS`，将证书有效期最长延长至 10 年。`CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS` 的最大值为 3650（即 10 年），因为 K3S 内部 CA 的最大有效期也是 10 年。

```shell
cat > /etc/default/k3s <<EOF
CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650
EOF
```

### 指定镜像源

随着 docker 镜像被禁，拉取 docker 镜像愈发艰难，需配置镜像解决镜像下载问题。参考：[Private Registry Configuration](https://docs.k3s.io/zh/installation/private-registry)

```shell
# 创建 /etc/rancher/k3s/registries.yaml 文件
mkdir -p /etc/rancher/k3s && touch /etc/rancher/k3s/registries.yaml

# 编辑 /etc/rancher/k3s/registries.yaml，添加内容
vim /etc/rancher/k3s/registries.yaml
```

在 `/etc/rancher/k3s/registries.yaml` 中添加如下内容：

```yaml
# 配置 docker.io 镜像加速地址
mirrors:
  docker.io:
    endpoint:
      - "https://docker.1ms.run/"
      - "https://docker.1panel.live/"
      - "https://docker.1panelproxy.com/"
      - "https://docker.m.daocloud.io/"
      - "https://docker.gh-proxy.com/"

# 腾讯云提供了内网下的镜像加速地址。如果是腾讯云可以加上
mirrors:
  docker.io:
    endpoint:
      - "https://mirror.ccs.tencentyun.com"
      - "https://docker.1ms.run/"
      - "https://docker.1panel.live/"
      - "https://docker.1panelproxy.com/"
      - "https://docker.m.daocloud.io/"
      - "https://docker.gh-proxy.com/"
```

或者直接写入：

```shell
mkdir -p /etc/rancher/k3s
cat >> /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://mirror.ccs.tencentyun.com"
EOF
```

### 系统代理

通过指定 `--system-default-registry` 参数，修改 k3s 系统镜像地址，防止安装 k3s 过程中拉取镜像失败导致安装失败。但是如果配置了镜像源，解决了镜像拉取的问题，此参数可省略。毕竟这个配置只能解决 k3s 自身安装过程中的镜像拉取问题

```shell
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_VERSION=v1.26.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_KUBECONFIG_OUTPUT=/root/.kube/config \
	INSTALL_K3S_EXEC="--node-external-ip=myip --advertise-address=myip --system-default-registry=registry.cn-hangzhou.aliyuncs.com" \
	sh -
```

### docker

k3s 默认使用  [containerd](https://containerd.io/)，如果用户可以通过 `--docker` 选项启用 docker。参考：[使用 Docker 作为容器运行时](https://docs.k3s.io/zh/advanced#%E4%BD%BF%E7%94%A8-docker-%E4%BD%9C%E4%B8%BA%E5%AE%B9%E5%99%A8%E8%BF%90%E8%A1%8C%E6%97%B6)。

随着 kubernetes 和 docker 的各自发展，kubernetes 使用 docker 作为容器运行时会出现版本不支持问题，即 docker 版本过高，kubernetes 不支持现象。使用 docker 作为容器运行时需多加测试。

对应的安装脚本：

```shell
# 安装 server 节点，注意替换 myip
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_VERSION=v1.26.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_KUBECONFIG_OUTPUT=/root/.kube/config \
	INSTALL_K3S_EXEC="--docker --node-external-ip=myip --advertise-address=myip --system-default-registry=registry.cn-hangzhou.aliyuncs.com" \
	sh -

# 增加 agent 节点，注意替换 mynodetoken、myserver 和 myip
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
	INSTALL_K3S_MIRROR=cn \
	INSTALL_K3S_VERSION=v1.26.8+k3s1 \
	INSTALL_K3S_SKIP_SELINUX_RPM=true \
	K3S_URL=https://myserver:6443 \
	K3S_TOKEN=mynodetoken \
	INSTALL_K3S_EXEC="--docker --node-external-ip=myip" \
	sh -
```

### Helm

k3s 提供了 Helm controller，通过自动部署 helm，参考：[helm](https://docs.rancher.cn/docs/k3s/helm/_index/)

以部署 minio 为例，提供如下 `values.yaml`

```yaml
accessKey: admin
secretKey: password
defaultBucket:
  enabled: true
  name: carp
  policy: public
  purge: true
buckets:
  - name: scaleph
    policy: public
    purge: true
replicas: 1
persistence:
  size: 5Gi
resources:
  requests:
    memory: 256Mi
    cpu: 250m
  limits:
    memory: 256Mi
    cpu: 1000m
# 使用 NodePort
 service:
  type: NodePort
# 使用 Traefik 和 Ingress。k3s 默认安装 Traefik
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: traefik
  path: /minio
```

定义 helm manifests 清单：

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChart
metadata:
  name: minio
  namespace: kube-system
spec:
  chart: stable/minio
#  repo: https://charts.helm.sh/stable stable 可省略
  targetNamespace: default  # MinIO 将安装到这个命名空间
  valuesContent: |-
    accessKey: admin
    secretKey: password
    defaultBucket:
      enabled: true
      name: carp
      policy: public
      purge: true
    buckets:
      - name: scaleph
        policy: public
        purge: true
    replicas: 1
    persistence:
      size: 5Gi
    resources:
      requests:
        memory: 256Mi
        cpu: 250m
      limits:
        memory: 512Mi
        cpu: 500m
     service:
      type: NodePort
```

