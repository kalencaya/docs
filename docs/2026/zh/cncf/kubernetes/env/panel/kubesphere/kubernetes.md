# Kubernetes

参考文档：

* [ks-installer](https://github.com/kubesphere/ks-installer/blob/master/README_zh.md)
* [在 Linux 上安装 Kubernetes 和 KubeSphere](https://kubesphere.io/zh/docs/v4.1/03-installation-and-upgrade/02-install-kubesphere/02-install-kubernetes-and-kubesphere/)
* [在 Kubernetes 上快速安装 KubeSphere](https://kubesphere.io/zh/docs/v4.1/02-quickstart/01-install-kubesphere/)

## 安装说明

安装 kubesphere 4.x

### 安装 helm

为方便 helm 安装，这里直接使用 sreworks 的 helm 镜像，避免网络问题。参考：[安装 Helm](https://sreworks.cn/docs/rr5g10#2-%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2)

```shell
wget https://sreworks.oss-cn-beijing.aliyuncs.com/bin/helm-linux-am64 -O helm
chmod +x ./helm
mv ./helm /usr/local/bin/
```

todo: 查找 helm 国内代理

## 安装 kubesphere

默认添加上国内代理和镜像。

```shell
# 如果无法访问 charts.kubesphere.io, 可将 charts.kubesphere.io 替换为 charts.kubesphere.com.cn
helm upgrade --install -n kubesphere-system --create-namespace ks-core https://charts.kubesphere.com.cn/main/ks-core-1.1.4.tgz --debug --wait --set global.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks --set extension.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks
```

登陆信息：

* 端口号：30880
* 用户名/密码：admin / P@88w0rd
