# KubePi

KubePi 是一个现代化的 K8s 面板，1Panel 官方出品。

链接地址：

* github。[KubePi](https://github.com/1Panel-dev/KubePi)

KubePi 发布基于镜像，天然适合使用 Docker 和 Kubernetes 部署。

## Docker Compose 部署

将下述信息保存为 `docker-compose.yaml` 文件

```yaml
version: '3.1'

services:

  kubepi:
    image: 1panel/kubepi:v1.7.0
    privileged: true
    restart: unless-stopped
    ports:
    # 默认的是 80 端口，这里改成了 8000，防止端口冲突
      - 8000:80
```

操作命令

```shell
# 启动
docker compose up -d

# 关闭
docker compose down
```

启动后，通过 `http://localhost:8000` 访问。KubePi 镜像默认是 `80` 端口，这里将外部访问端口改成了 `8000`。