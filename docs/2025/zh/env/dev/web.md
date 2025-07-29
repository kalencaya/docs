# 前端

## 安装 node

mac 或 linux 下安装 nvm

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm -v
```

安装node

```shell
nvm install 18
nvm use 18
node -v
```

安装包管理工具

* npm。node自带，无序安装
* [pnpm](https://pnpm.io/installation)
* [Yarn](https://yarnpkg.com/getting-started/install)

安装 pnpm

```shell
curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm -v
```

## 配置代理

新建 `.npmrc` 文件，文件内容如下：

```
registry=https://registry.npmmirror.com/
```

