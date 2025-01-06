# Doris Operator

链接：

* [基于 Doris-Operator 部署](https://doris.apache.org/zh-CN/docs/install/cluster-deployment/k8s-deploy/install-operator)
* [doris-operator](https://github.com/selectdb/doris-operator)

## 安装

1. 添加 DorisCluster CRD

   ```
   kubectl apply -f https://raw.githubusercontent.com/selectdb/doris-operator/master/config/crd/bases/doris.selectdb.com_dorisclusters.yaml   
   ```

2. 部署 Doris-Operator

   ```shell
   kubectl apply -f https://raw.githubusercontent.com/selectdb/doris-operator/master/config/operator/operator.yaml
   ```

3. 检查 Doris-Operator 服务部署状态

   ```shell
   # Operator 服务部署后，可通过如下命令查看服务的状态。当STATUS为Running状态，且 pod 中所有容器都为Ready状态时服务部署成功。
   kubectl -n doris get pods
   
   # operator.yaml 中 namespace 默认为 Doris，如果更改了 namespace，在查询服务状态的时候请替换正确的 namespace 名称。
   ```

