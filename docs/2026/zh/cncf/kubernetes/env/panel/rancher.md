# Rancher



## 安装 cert-manager

rancher 默认需要 SSL/TLS，需先安装 cert-manager 管理 SSL/TLS

### kubectl 方式

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

### helm 方式

```bash
# 添加 Jetstack Helm 仓库
helm repo add jetstack https://charts.jetstack.io

# 更新本地 Helm chart 仓库缓存
helm repo update

# 安装 cert-manager Helm chart
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.5.1 \
  --set installCRDs=true
```

## 安装步骤

```bash
# 国内镜像
helm repo add rancher-stable https://rancher-mirror.rancher.cn/server-charts/stable

# 安装
# 在 kubernetes 中安装时，rancher 要求必须要有 hostname 不能是 ip
# 使用像 sslip.io 这样的免费 DNS 服务，它可以将任何 IP 地址解析为一个域名
# 例如，如果你的服务器 IP 是 192.168.1.100，可以设置 hostname: 192.168.1.100.sslip.io
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --create-namespace \
  --set hostname=118.178.99.198.sslip.io \
  --set replicas=1 \
  --set ingress.tls.source=rancher \
  --set bootstrapPassword=admin \
  --set rancherImage=registry.cn-hangzhou.aliyuncs.com/rancher/rancher \
  --set systemDefaultRegistry=registry.cn-hangzhou.aliyuncs.com \
  --version v2.14.3
  
# 卸载
helm uninstall rancher -n cattle-system
# 或通过清理脚本卸载
# 参考：https://github.com/rancher/rancher-cleanup
```

