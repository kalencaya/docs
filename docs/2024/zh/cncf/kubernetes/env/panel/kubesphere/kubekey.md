# KubeKey

KubeKey 是一个开源的轻量级工具，用于部署 Kubernetes 集群。它提供了一种灵活、快速、方便的方式来安装 Kubernetes/K3s、Kubersphere。它也是扩展和升级集群的有效工具。

通过 KubeKey 可以实现如下功能：

* 仅安装 Kubernetes
* 同时安装 Kubernetes 和 Kubesphere
* 使用 KubeKey 安装 Kubernetes 中，使用 [ks-installer](https://github.com/kubesphere/ks-installer/blob/master/README_zh.md) 在Kubernetes 中安装 KubeSphere。

本文主要描述使用 KubeKey 同时安装 Kubernetes 和 Kubesphere，Kubernetes 为 K3s。

文档链接：

* [KubeKey](https://github.com/kubesphere/kubekey/blob/master/README_zh-CN.md)
* [部署 K3s 和 KubeSphere](https://kubesphere.io/zh/docs/v3.3/installing-on-linux/on-premises/install-kubesphere-and-k3s/)
* [快速入门指南](https://docs.k3s.io/zh/quick-start)
* [探索 K3s 简单高效的多云和混合云部署](https://mp.weixin.qq.com/s/EOYSSDyrRbg0G9P-PbYtZQ)

### 安装依赖

```shell
yum install socat conntrack -y
```

如果是中国地区，可以设置为中国地区，从国内镜像下载，否则就只能从 github 下载

```shell
export KKZONE=cn
```

### 下载 KubeKey

```shell
curl -sfL https://get-kk.kubesphere.io | sh -
```

### 安装 k3s 和 kubersphere

```shell
./kk create cluster --with-kubernetes v1.23.13-k3s --with-kubesphere v3.3.2
```

kubekey 是支持很多 k3s 版本的，但是如果设置了中国区域，在国内镜像就只支持 `v1.21.6-k3s` 版本。如果要使用其他版本，则需取消中国区域设置。

安装完成后即可访问 kubersphere：

```
Console: http://myserver:30880
Account: admin
Password: P@88w0rd
```
