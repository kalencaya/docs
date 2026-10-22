# DataFoundry



## 安装

参考 README，安装即可。如果遇到 npm 包从 github 无法下载的情况，可以考虑用手机热点替代 wifi（某些时候手机热点比 wifi 连接 github 网络更好）。

### 安全认证

```properties
## 随机生成的至少32位字符串
AUTH_SESSION_SECRET=d3cf1202b23c45f7911bbc5f238f573747dbe90f4237403a973d7671976f9105
## 真实生产改为 https://你的域名
## 本地只能用 127.0.0.1，否则会要求 https
AUTH_PUBLIC_BASE_URL=http://127.0.0.1:3000
## open|closed。open = 自己注册，closed = 关闭注册
AUTH_REGISTRATION_MODE=open

## smtp|test。smtp = 发送邮箱验证，test = 打日志代替邮箱验证
AUTH_EMAIL_DELIVERY=test
AUTH_EMAIL_FROM=DataFoundry <no-reply@example.com>
AUTH_SMTP_HOST=smtp.example.com
AUTH_SMTP_PORT=587
AUTH_SMTP_SECURE=false
AUTH_SMTP_USER=
AUTH_SMTP_PASSWORD=
```

可用的邮箱配置，以飞书为例：

```properties
AUTH_EMAIL_DELIVERY=smtp   
AUTH_EMAIL_FROM=sender@group.com
AUTH_SMTP_HOST=smtp.feishu.cn
AUTH_SMTP_PORT=465
# 飞书需开启
AUTH_SMTP_SECURE=true
AUTH_SMTP_USER=example-password
AUTH_SMTP_PASSWORD=example-password
```

### 配置大模型

默认配置文件里提供了阿里云百炼的案例

```properties
# LLM_* values are optional server-side defaults. Models can also be created in the Web UI after deploy.
LLM_PROVIDER=openai-compatible
LLM_MODEL=qwen-plus
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=

# deepseek
LLM_PROVIDER=openai-compatible
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com
LLM_API_KEY=你的_API_Key

# embedding
EMBEDDING_PROVIDER=bailian
EMBEDDING_MODEL=text-embedding-v4
EMBEDDING_DIM=1024
EMBEDDING_OUTPUT_TYPE=dense
EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_API_KEY=
```



## 参考链接

* [dataagent](https://github.com/datagallery-ai/dataagent)
* [DataFoundry文档](https://datagallery-ai.github.io/dataagent/zh/home/)
