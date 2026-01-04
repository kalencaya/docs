# Nginx Ingress Controller

## 安装

1. 安装 nginx ingress

   ```shell
   # 安装 ingress-nginx
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
   
   # 检验安装结果
   kubectl get pods -n ingress-nginx
   kubectl get services -n ingress-nginx
   ```
