# SREWorks





## 安装脚本

```shell
# 下载 sreworks 1.5
echo "下载 sreworks 1.5"
rm sreworks-v1.5.tar.gz
rm -rf SREWorks-1.5-20230727
rm -rf sreworks
wget https://hub.gitmirror.com/https://github.com/alibaba/SREWorks/archive/refs/tags/v1.5-20230727.tar.gz -O sreworks-v1.5.tar.gz
tar -xzvf sreworks-v1.5.tar.gz
mv SREWorks-1.5-20230727 sreworks
rm sreworks-v1.5.tar.gz
echo "下载结束"

# 按需调整 ip 和 storageClass
echo "安装 sreworks"
cd sreworks/chart/sreworks-chart
helm install sreworks ./ \
    --create-namespace --namespace sreworks \
    --set global.accessMode="nodePort" \
    --set global.images.tag="v1.5" \
    --set appmanager.home.url="http://{ip}:30767" \
    --set appmanager.server.jwtSecretKey="1234567" \
    --set global.storageClass="{storageClass}" \
    --set saas.onlyBase=true \
    --set localPathProvisioner=false

echo "安装 sreworks 结束，15min 后检查安装进度"

```

## 参考链接

