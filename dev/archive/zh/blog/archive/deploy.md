# 部署

`scaleph` 产出为镜像，部署方式以 docker 为主。同时，Scaleph 也提供了安装包的方式用来在内网环境中进行部署。
用户可以根据自己的需求选择适合自己的部署方式。

## docker

`scaleph` 运行依赖如下，其中 minio 作为文件存储中间件，可以使用 HDFS、OSS 以及 S3 代替：

- redis
- mysql
- minio

`scaleph` 应用本身由 2 个组件组成：

- [scaleph-api](https://github.com/flowerfine/scaleph/pkgs/container/scaleph%2Fscaleph-api)。服务端功能实现。
- [scaleph-ui-react](https://github.com/flowerfine/scaleph/pkgs/container/scaleph%2Fscaleph-ui-react)。前端功能实现。

镜像本身发布在 github packages 中，如遇到网络不好的情况，需通过科学上网手段，本地下载镜像上传到部署服务器等操作实现部署。

部署过程：

```shell
# clone scaleph 源码
git clone https://github.com/flowerfine/scaleph.git --depth 1

# 一键启动 scaleph 及其依赖
cd scaleph/tools/docker/deploy/scaleph
docker compose up -d

# 如网络不好，可以先 pull 镜像，稍后启动
docker compose pull
docker compose up -d

# 关闭 scaleph
docker compose down
```

在所有容器正常启动后，用户即可访问 [http://localhost](http://localhost/)，用户名密码为 `sys_admin/123456`。

## 安装包

### 获取二进制包

从[github](https://github.com/flowerfine/scaleph/releases)获取二进制包。
或者您也可以[自行编译](./compile)。

### 解压安装包

```shell
tar -zxf scaleph-1.0.6-bin.tar.gz
```

文件目录树如下所示：

```text
scaleph-1.0.6
├── bin
├── conf
├── libs
├── plugins
        └──datasource
├── sql
├── ui
├── LICENSE
└── README.md
```

### 准备环境

您可以使用 docker 的方式来部署`mysql`,`redis`,`minio`，也可以自行部署相关组件。

> 如果您使用自行安装的 mysql 数据库，您需要将`sql`目录下的脚本在 mysql 中执行。
>
> 或者使用 scaleph 提供的初始化数据库的脚本：

```shell
./bin/tools.sh init-database \
--driver com.mysql.cj.jdbc.Driver \
--url jdbc:mysql://127.0.0.1:3306 \
--username root \
--password 123456 \
--sql-files sql
```

### 修改配置

```shell
vim bin/config.sh
```

设置`JAVA_HOME`.

```shell
export JAVA_HOME=path/to/your/java_home
```

编辑 `conf/application.yml` 和 `conf/application-dev.yml` 以适配您的环境。

### 启停

#### 后台启动

```shell
./bin/scaleph.sh start
```

输出如下:

```text
Staring in backend
Running with pid 45193
```

#### 前台启动

```shell
./bin/scaleph.sh start-frontend
```

启动后在浏览器打开[http://localhost:8080/scaleph/ui/#/login](http://localhost:8080/scaleph/ui/#/login)

#### 检查进程状态

```shell
./bin/scaleph.sh status
```

#### 停止

> 只能在后台启动时使用此脚本停止进程。

```shell
./bin/scaleph.sh stop
```

### 日志

日志保存在 `logs/scaleph`

```text
logs
└── scaleph
    ├── scaleph-error.log
    ├── scaleph-info.log
    ├── scaleph-server.log
    └── scaleph-warn.log
```
