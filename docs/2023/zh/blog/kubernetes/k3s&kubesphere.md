# K3s&Kubesphere

文档链接

* [KubeKey](https://github.com/kubesphere/kubekey/blob/master/README_zh-CN.md)
* [部署 K3s 和 KubeSphere](https://kubesphere.io/zh/docs/v3.3/installing-on-linux/on-premises/install-kubesphere-and-k3s/)
* [快速入门指南](https://docs.k3s.io/zh/quick-start)

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

### 新增 k3s 节点

kubersphere 的新增节点功能没有试过，这里是通过对 k3s 集群新增 agent 的方式扩展集群。安装的过程也是通过 k3s 的脚本实现的。

```shell
# 获取 server K3S_TOKEN
cat /var/lib/rancher/k3s/server/node-token

curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=myversion K3S_URL=https://myserver:6443 K3S_TOKEN=mytoken INSTALL_K3S_EXEC="--docker" sh -
# 国内镜像
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_VERSION=myversion INSTALL_K3S_MIRROR=cn K3S_URL=https://myserver:6443 K3S_TOKEN=mytoken INSTALL_K3S_EXEC="--docker" sh -

```

这里有 2 个注意点：

* 版本。kubekey 安装脚本支持的 k3s 版本和 k3s 提供的安装脚本支持的 k3s 版本并不一致，比如同样是 `v1.21.6`，在 kubekey 中为 `v1.21.6-k3s`，在 k3s 脚本中则为 `v1.21.6+k3s1`。kubekey 的版本命名规则为文档中支持的版本后增加 `-k3s` 后缀，k3s 则需到 github release 或 tag 查找对应的版本，k3s 的命名规则一般为添加 `+k3s1` 后缀。
* 下载镜像源。k3s 同样支持国内镜像，同样国内镜像只支持部分版本的情况，对于不支持的版本则只能从 github 下载。

```shell
# 查看安装情况
systemctl status k3s-agent.service

journalctl -xe
```

禁用 SELinux

```shell
vim /etc/selinux/config

# SELINUX=disabled

vim /etc/rancher/k3s/config.yaml
# selinux: false
```

### 预下载 k3s

- 从 [Releases](https://github.com/k3s-io/k3s/releases) 页面下载 K3s 二进制文件，该文件需要匹配用于获取离线镜像的版本。将二进制文件放在每个离线节点上的 `/usr/local/bin` 中，并确保文件是可执行的。
- 在 [get.k3s.io](https://get.k3s.io/) 下载 K3s 安装脚本。将安装脚本放在每个离线节点上的任何位置，并将其命名为 `install.sh`。
- 使用 `INSTALL_K3S_SKIP_DOWNLOAD` 环境变量运行 K3s 脚本时，K3s 将使用脚本的本地版本和二进制文件。
- 安装 agent。`INSTALL_K3S_SKIP_DOWNLOAD=true K3S_URL=https://<SERVER_IP>:6443 K3S_TOKEN=<YOUR_TOKEN> ./install.sh`。
- Server 的 Token 通常位于 `/var/lib/rancher/k3s/server/token`。