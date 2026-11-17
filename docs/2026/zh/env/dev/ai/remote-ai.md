# 远端 AI

## 模型网关

### magpie

直接安装，通过代理下载 release

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --mirror https://gh-proxy.org/
```

通过 docker 启动：

```yaml
services:

# port 设置为 127.0.0.1 确保只能本地打开，
# 使用的时候通过 ssh -L 把服务器的 3430 转到本地，在本地浏览器中打开带 ?k= 的地址
# 带 ?k= 的地址通过查看日志找到。docker compose logs magpie
  magpie:
    image: ghcr.io/yetone/magpie:0.1.3098
    container_name: magpie
    restart: unless-stopped
    command: web --addr 0.0.0.0:3430 --no-open
    ports:
      - "127.0.0.1:3425:3425"
      - "127.0.0.1:3430:3430"
    environment:
      TZ: Asia/Shanghai
      MAGPIE_WEB_KEY: <at-least-16-characters>
    networks:
      - magpie

networks:
  magpie:
    driver: bridge
```

本地 ssh 配置端口转发，打开 magpie web 页面进行模型配置，以 [tabby](https://tabby.sh/) 为例：



## nvm

```bash
## 安装 nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
## 验证安装结果
nvm --version

## 查询支持的长期版本
nvm ls-remote --lts

## 安装 node
nvm install <node_version>

## 设置默认版本
nvm alias default <node_version>

## 查看已安装的版本
nvm list
```

## Agent

* claude code。`npm install -g @anthropic-ai/claude-code`
* codex。`npm install -g @openai/codex`

## T3 Code

```bash
## 配置代理
export T3CODE_RELEASE_BASE_URL=https://gh-proxy.org/https://github.com/pingdotgg/t3code/releases/download

## npm 方式安装
npm install -g t3@0.1.7
t3 service install
```

为了开启外部连接，配置 systemd：

```bash
# 创建配置目录
mkdir -p ~/.config/systemd/user/t3code.service.d

# 写入 Host 配置
cat > ~/.config/systemd/user/t3code.service.d/override.conf <<'EOF'
[Service]
Environment=T3CODE_HOST=0.0.0.0
EOF

# 重新加载并重启服务
systemctl --user daemon-reload
systemctl --user restart t3code

# 验证配置
systemctl --user show t3code -p Environment
t3 service status

# 远程连接
t3 pair
```

