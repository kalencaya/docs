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

# 查看安装进度
# 方式1 查看 pods 状态。部分状态会出现 Error、CrashLoopBackOff 等，不用在意，job 会自动重试，一段时间后会自动正常
kubectl get pods -n sreworks
# 方式2 查看 sreworks-process-check 进度
kubectl logs job.batch/sreworks-progress-check -nsreworks -f
```

## 应用开发

### 社区案例-FlinkServerless

minio 配置。这里直接复用 sreworks 自带的：

* endpoint: http://sreworks-minio.sreworks:9000。格式：`printf "%s-%s.%s:%s" .Release.Name "minio" .Release.Namespace "9000"`
* accessKey: XmizyTRKhgYTrVkK。sreworks charts 中写死的
* secretAccessKey: Df229gtwZ4bssMzK23VJXq9vrGqpxdHA。sreworks charts 中写死的
* bucket: appmanager-dag

```yaml
acceptCommunityEditionLicense: true
vvp:
  blobStorage:
    baseUri: "s3://appmanager-dag"
    s3:
      endpoint: "http://sreworks-minio.sreworks:9000"
      region: "us-east-1"
  resultFetcher:
    pullPolicy: IfNotPresent
blobStorageCredentials:
  s3:
    accessKeyId: "XmizyTRKhgYTrVkK"
    secretAccessKey: "Df229gtwZ4bssMzK23VJXq9vrGqpxdHA"
appmanager:
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
gateway:
  resources:
    limits:
      cpu: 500m
      memory: 1Gi
    requests:
      cpu: 250m
      memory: 256Mi
ui:
  resources:
    limits:
      cpu: 100m
      memory: 32Mi
    requests:
      cpu: 100m
      memory: 32Mi
service:
  type: NodePort
```

将上述 yaml 转成 json 如下：

```json
{
    "acceptCommunityEditionLicense": true,
    "vvp": {
        "blobStorage": {
            "baseUri": "s3://appmanager-dag",
            "s3": {
                "endpoint": "http://sreworks-minio.sreworks:9000",
                "region": "us-east-1"
            }
        },
        "resultFetcher": {
            "pullPolicy": "IfNotPresent"
        }
    },
    "blobStorageCredentials": {
        "s3": {
            "accessKeyId": "XmizyTRKhgYTrVkK",
            "secretAccessKey": "Df229gtwZ4bssMzK23VJXq9vrGqpxdHA"
        }
    },
    "appmanager": {
        "resources": {
            "limits": {
                "cpu": "500m",
                "memory": "512Mi"
            },
            "requests": {
                "cpu": "250m",
                "memory": "256Mi"
            }
        }
    },
    "gateway": {
        "resources": {
            "limits": {
                "cpu": "500m",
                "memory": "1Gi"
            },
            "requests": {
                "cpu": "250m",
                "memory": "256Mi"
            }
        }
    },
    "ui": {
        "resources": {
            "limits": {
                "cpu": "100m",
                "memory": "32Mi"
            },
            "requests": {
                "cpu": "100m",
                "memory": "32Mi"
            }
        }
    },
    "service": {
        "type": "NodePort"
    }
}
```

注意事项：如何传参，不能用大写，只能用小写

## 参考链接

* [SREWorks](https://sreworks.cn/)。
* [SREWorks - 云原生数智运维平台](https://www.yuque.com/sreworks-doc)。语雀
* 
