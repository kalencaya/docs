# 前端

## 安装 node

mac 或 linux 下安装 nvm

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm -v
```

安装node

```shell
## 列出远程可用版本
nvm ls-remote --lts
## 安装最新 LTS 版本
nvm install --lts
## 安装指定代号的 LTS（lts/krypton 代表 node 24）
nvm install lts/krypton
## 设置默认版本
nvm alias default lts/krypton
## 手动切换版本
nvm use 18
node -v
```

配置镜像源：

```bash
npm config set registry https://registry.npmjs.org
npm config get registry
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

