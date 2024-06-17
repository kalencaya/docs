# KDP

KDP(Kubernetes Data Platform) 提供了一个基于 Kubernetes 的现代化混合云原生数据平台。它能够利用 Kubernetes 的云原生能力来有效地管理数据平台。

## Feature

- 开箱即用的 Kubernetes 大数据平台：
  - 主流大数据计算、存储引擎的 K8s 化改造及优化
  - 大数据组件的标准化配置管理，简化了大数据组件配置依赖管理的复杂性
- 提供标准化的大数据应用集成框架：
  - 基于 [OAM](https://oam.dev/) 的应用交付引擎，简化大数据应用的交付和开发。内部集成了 [kubevela](https://kubevela.net/zh/)。
  - 可扩展的应用层运维能力：可观测性、弹性伸缩、灰度发布等
- 大数据集群及应用目录的模型概念：
  - 大数据集群：在K8s上以“集群”的形式管理大数据组件，提供同一个大数据集群下大数据应用统一的生命周期管理
  - 应用目录：将相关的单体大数据组件组合成一个应用目录，提供从应用层到容器层的统一管理视图

## 文档链接

参考：[Kubernetes Data Platform](https://linktimecloud.github.io/kubernetes-data-platform/)

* [快速启动](https://linktimecloud.github.io/kubernetes-data-platform/docs/zh/getting-started/quick-start.html)。本地使用 Kind 和 Docker 快速启动演示环境。
* [高级安装](https://linktimecloud.github.io/kubernetes-data-platform/docs/zh/getting-started/advanced-install.html)。在 Kubernetes 上安装环境

## 实操指南

实践在 Kubernetes 上安装 KDP。安装版本为：[V1.1.0](https://github.com/linktimecloud/kubernetes-data-platform/releases/tag/v1.1.0)。

KDP 发版很频繁，用户可以选择较新版本进行实践，测试时最新版本为 V1.1.1，安装时有失败现象，回退到了 V1.1.0 版本。

### 准备 Kubernetes 环境

* 准备 K3s 环境。参考：[k3s](../env/install/k3s.md)。
  * K3s 国内镜像。如果 `https://rancher-mirror.rancher.cn` 无法访问，切换成 `https://rancher-mirror.oss-cn-beijing.aliyuncs.com`，或者在网络搜索相关资源。
  * Docker 镜像。为加快镜像下载速度，需配置镜像源。
    * 配置 Docker 镜像源。参考 [Docker](../../../env/proxy/docker.md)。腾讯云服务器选择容器镜像操作系统后，Docker 自带了镜像源：`https://mirror.ccs.tencentyun.com/`
    * 配置 K3s 镜像源。参考：[私有镜像仓库配置参考](https://docs.rancher.cn/docs/k3s/installation/private-registry/_index/#%E9%87%8D%E5%86%99)。也可通过 `--system-default-registry` 参数指定镜像源。
  * Docker 软件源问题。安装 k3s 时，仍需从 Docker 软件下载网站下载文件，如果遇到下载 docker ce 异常时，需更换 linux 服务器的软件源。对于 centos 系统：`sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo `
* 配置 Docker 镜像代理。参考 [Docker](../../../env/proxy/docker.md)。腾讯云服务器选择容器镜像操作系统后，Docker 自带了镜像源：`https://mirror.ccs.tencentyun.com/`

### 安装 KDP

```shell
## 下载 KDP
## 这里选择的是 linux 非 arm 对应的版本
wget https://github.com/linktimecloud/kubernetes-data-platform/releases/download/v1.1.0/kdp-v1.1.0-linux-amd64.tar.gz

## 解压文件
tar -zxvf kdp-v1.1.0-linux-amd64.tar.gz

## 解压后获得 linux-amd64 目录
cd linux-amd64
mv ./kdp /usr/local/bin/kdp

## 安装
kdp install --set loki.enabled=false \
	--set prometheusCRD.enabled=false \
	--set prometheus.enabled=false \
	--set kong.enabled=false \
	--set ingress.class=traefik
```

为了节约资源和复用 k3s 自带的资源，这里关闭了 KDP 自带的 prometheus 、loki，后续访问 kdp-ux 时部分功能无法使用。同时关闭了 kong，替换成 k3s 自带的 traefik。

耐心等待即可。

### 访问 kdp-ux

```shell
## 查看 service
kubectl get services -n kdp-system

## 修改 kdp-ux 为 NodePort
kubectl patch service kdp-ux -n kdp-system -p '{"spec":{"type":"NodePort"}}'

## 查看 kdp-ux 端口号
kubectl get services -n kdp-system
```

在浏览器访问：`http://ip:node-port`