# TopIAM

## 介绍

[TopIAM](https://github.com/topiam/eiam) 是一个开源的IDaas/IAM平台，用于管理企业内员工账号、权限、身份认证、应用访问，帮助整合部署在本地或云端的内部办公系统、业务系统及三方 SaaS 系统的所有身份，实现一个账号打通所有应用的服务。

只能用来做单点登陆，不支持做RBAC授权，仍需要应用在用户登陆后保存下登陆信息（包含登陆方式为 TopIAM），手动分配权限。

## 部署

使用 docker compose 快速部署 topiam。

topiam 依赖 mysql 和 redis，同时需要 mysql 和 redis 作为依赖。mysql 需要预先创建一个数据库 `topiam`，topiam 启动后会自动初始化表结构。

topiam 需要通过配置文件 `topiam.properties` 配置 mysql 和 redis 连接信息，在 `docker-compose.yml` 文件目录创建 `conf/topiam.properties` 文件

最后文件目录如下：

```shell
./
├── conf
│   └── topiam.properties
└── docker-compose.yml
```

启动命令如下

```shell
# 启动
docker compose up -d 
# 停止。此命令会停止 mysql、redis、topiam 容器，但数据不会丢失。通过 docker compose up -d 重新启动后数据仍然在
docker compose stop
# 销毁。此举会彻底销毁 mysql、redis、topiam 容器，所有数据都会丢失
docker compose down
```

启动成功后，登陆信息如下：

* 登陆链接。http://localhost:1898
* 用户名/密码。`admin` / `topiam.cn`

文件内容如下：

docker-compose.yml

```yaml
version: "3.8"

services:

  redis:
    image: bitnamilegacy/redis:7.0.10
    container_name: redis
    environment:
      - REDIS_PORT_NUMBER=6379
      - REDIS_PASSWORD=123456
    healthcheck:
      test: [ "CMD", "redis-cli", "-a", "$REDIS_PASSWORD", "ping" ]
      interval: 15s
      timeout: 5s
      retries: 60
      start_period: 15s
    networks:
      - topiam

  mysql:
    image: bitnamilegacy/mysql:8.0
    container_name: mysql
    environment:
      - TZ=Asia/Shanghai
      - MYSQL_ROOT_USER=root
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_AUTHENTICATION_PLUGIN=mysql_native_password
      - MYSQL_DATABASE=topiam # 初始化数据库 topiam
    ports:
      - 3306:3306
    healthcheck:
      test: [ "CMD", "mysqladmin", "-u$$MYSQL_ROOT_USER", "-p$$MYSQL_ROOT_PASSWORD",  "ping", "-h", "localhost" ]
      interval: 3s
      timeout: 1s
      retries: 16
      start_period: 30s
    volumes:
      - ../mysql/my_custom.cnf:/opt/bitnami/mysql/conf/my_custom.cnf
      - ../mysql/init.d:/docker-entrypoint-initdb.d
    networks:
      - topiam

# 用户名密码：admin/topiam.cn
  topiam:
    image: registry.cn-hangzhou.aliyuncs.com/topiam/topiam-ce:2.0.0
    container_name: topiam
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: [ "CMD-SHELL", "curl -f http://localhost:1898/actuator/health || exit 1" ]
      interval: 20s
      timeout: 10s
      retries: 60
    volumes:
      - ./conf:/opt/topiam/conf
    ports:
      - 1898:1898
    networks:
      - topiam


networks:
  topiam:
    driver: bridge
```

topiam.properties

```properties
spring.datasource.url=jdbc:mysql://mysql:3306/topiam?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true
spring.datasource.username=root
spring.datasource.password=123456

spring.data.redis.host=redis
spring.data.redis.port=6379
spring.data.redis.password=123456
spring.data.redis.database=3
```

## 配置 OIDC

登陆成功后（首次登陆需要修改密码），进入后台管理



## 参考链接

