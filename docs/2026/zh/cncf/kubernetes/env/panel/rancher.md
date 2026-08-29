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

# 为 rancher 创建命名空间
kubectl create namespace cattle-system

# 安装
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=118.178.99.198 \
  --set replicas=1 \
  --set ingress.tls.source=rancher \
  --set bootstrapPassword=admin
```

