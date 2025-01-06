# Grafana Operator

参考文档

* [Grafana 高可用部署最佳实践](https://mp.weixin.qq.com/s/wv3dEM7BYMwKuiNd5ikuHQ)

## 安装

```shell
## scaleph 在 tools/kubernetes/grafana/values-grafana.yaml 中定制了开发、测试环境使用的 grafana-operator 配置
## 生产环境中可以考虑使用 kubernetes 统一的 grafana-operator 或者独立于 kubernetes 部署的 grafana 实例，只需将 prometheus 数据源加入即可
helm upgrade --install grafana grafana \
    --repo https://grafana.github.io/helm-charts \
    --values tools/kubernetes/grafana/values-grafana.yaml

## tools/kubernetes/grafana/values-grafana.yaml 默认通过 NodePort 方式暴露了 grafana dashboard 端口
## 通过 http://${IP}:${PORT} 访问 grafana
## IP 为 Kubernetes 节点的 IP 地址，本地则为 localhost 或 127.0.0.1
## 查看端口号
kubectl get services grafana
## 返回如下结果，端口号即为：31175
## NAME      TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
## grafana   NodePort   10.104.169.94   <none>        80:31175/TCP   136m

helm uninstall grafana
```

