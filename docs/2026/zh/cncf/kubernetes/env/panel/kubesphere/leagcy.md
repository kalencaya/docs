# Leagcy 版本

kubesphere 断供后删除了：

* 文档网站
* helm charts
* 镜像

本文根据仍留下的源码和一些大佬保留的资源进行安装。

## 安装说明

安装 kubesphere 4.x

### 文档网站

参考链接部分

### 安装 helm

为方便 helm 安装，这里直接使用 sreworks 的 helm 镜像，避免网络问题。参考：[安装 Helm](https://sreworks.cn/docs/rr5g10#2-%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2)

```shell
wget https://sreworks.oss-cn-beijing.aliyuncs.com/bin/helm-linux-am64 -O helm
chmod +x ./helm
mv ./helm /usr/local/bin/
```

todo: 查找 helm 国内代理

### helm charts

#### 备份

采用备份的镜像，可以参考：[openksc/ks-core](https://hub.docker.com/r/openksc/ks-core/tags)

```bash
# 下载 docker 的 ks-core 
helm pull oci://registry-1.docker.io/openksc/ks-core --version 1.1.5

# 如果因为网络无法下载，可以更换代理，以 https://docker.1ms.run 为例
helm pull oci://docker.1ms.run/openksc/ks-core --version 1.1.5
```

#### 源码

各种文档里面的 `https://charts.kubesphere.com.cn/main/ks-core-${VERSION}.tgz` 已经被 kubesphere 删除，但可以从 github 上面的 release 源码中重新打包获取到，下面是具体的流程：

```bash
# 下载 kubesphere release 中的源码
# 或者 clone 源码切换到对应的 tag 也是可以的
wget https://github.com/kubesphere/kubesphere/archive/refs/tags/helm-chart-1.1.5.tar.gz -O kubesphere-helm-chart-1.1.5.tar.gz

# 解压源码
mkdir kubesphere; \
	tar -xzf kubesphere-helm-chart-1.1.5.tar.gz -C kubesphere --strip-components=1; \
	rm kubesphere-helm-chart-1.1.5.tar.gz
	
# 打包
cd kubesphere/config/ks-core && helm package . 
# 命令执行完成后可以看到 ks-core-1.1.5.tgz 文件
```

### 镜像

采用备份的镜像，可以参考：[openksc](https://hub.docker.com/u/openksc)

对于网络慢的情况，可以找找 docker 代理或者把镜像推送到阿里云个人镜像

### 安装

```bash
# docker 备份版本
helm upgrade --install -n kubesphere-system --create-namespace ks-core ks-core-1.1.5.tgz \
     --set global.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
     --set extension.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
#     --set global.imageRegistry=hub.kubesphere.com.cn \
#     --set extension.imageRegistry=hub.kubesphere.com.cn \
     --set apiserver.image.registry=docker.io \
     --set apiserver.image.repository=openksc/ks-apiserver \
     --set console.image.registry=docker.io \
     --set console.image.repository=openksc/ks-console \
     --set controller.image.registry=docker.io \
     --set controller.image.repository=openksc/ks-controller-manager \
     --set kubectl.image.registry=docker.io \
     --set kubectl.image.repository=openksc/kubectl \
     --set ksExtensionRepository.image.registry=docker.io \
     --set ksExtensionRepository.image.repository=openksc/ks-extensions-museum \
     --set ksExtensionRepository.image.tag=v1.1.6

# 可以考虑用下面的 扩展市场 镜像，比较新，但没有测试过兼容性，毕竟还是用的没有限制的 4.1.3 版本
#     --set ksExtensionRepository.image.registry=hub.kubesphere.com.cn \
#     --set ksExtensionRepository.image.repository=kse/extensions-museum \
#     --set ksExtensionRepository.image.tag=v11.3.0

# 阿里云 acr 备份版本
helm upgrade --install -n kubesphere-system --create-namespace ks-core ks-core-1.1.5.tgz \
     --set global.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
     --set extension.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
     --set apiserver.image.registry=xxx.cn-hangzhou.personal.cr.aliyuncs.com \
     --set apiserver.image.repository=kalencaya/openksc-ks-apiserver \
     --set console.image.registry=xxx.cn-hangzhou.personal.cr.aliyuncs.com \
     --set console.image.repository=kalencaya/openksc-ks-console \
     --set controller.image.registry=xxx.cn-hangzhou.personal.cr.aliyuncs.com \
     --set controller.image.repository=kalencaya/openksc-ks-controller-manager \
     --set kubectl.image.registry=xxx.cn-hangzhou.personal.cr.aliyuncs.com \
     --set kubectl.image.repository=kalencaya/openksc-kubectl \
     --set ksExtensionRepository.image.registry=xxx.cn-hangzhou.personal.cr.aliyuncs.com \
     --set ksExtensionRepository.image.repository=kalencaya/openksc-ks-extensions-museum \
     --set ksExtensionRepository.image.tag=v1.1.6
```

## 参考链接

* [【k8s】全新Ubuntu 26.04 使用kt 超简单安装 k8s 最新1.37.1+KubeSphere4.1.3](https://mp.weixin.qq.com/s/D5GlAbEF6-JxSet-Gdm6Mw)。可联系作者获取安装物料
* [kubesphere](https://github.com/kubesphere/kubesphere)。在 `config/ks-core` 目录为 helm charts
* [deletesphere-4.1.2](https://github.com/jdjn123/deletesphere-4.1.2)。https://kubesphere.saowu.top/
* [openksc](https://github.com/openksc)
  * 容器镜像：[openksc](https://hub.docker.com/u/openksc)
* [GitHub Actions + 阿里云个人版 ACR 自建 Docker 镜像加速器](https://mp.weixin.qq.com/s/O_M9SlMcbkxvp39uSgnyMw)
* [一种基于 Github Action 解决国内 Docker 镜像拉取的方法](https://onlytl.com/archives/docker-image-sync)
