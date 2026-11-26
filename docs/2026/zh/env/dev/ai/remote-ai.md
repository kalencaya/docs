# 远端 AI



## 环境

切换用户

```bash
sudo useradd -m -s /bin/bash agent-user
echo "agent-user:123456" | sudo chpasswd
sudo chown -R agent-user:agent-user /home/agent-user
# 切换到
su - agent-user
```

通过 mise 安装如下环境：

```bash
# 安装 node
mise use --global node@24
node -v
# 配置 npm 镜像源
npm config set registry https://registry.npmmirror.com
npm config get registry

# 安装 java
mise use --global java@21
java -version

# 安装 maven
mise use --global maven@3.9.16
mvn -v
# 阿里云代理配置在 mise 的全局配置中
mvn help:effective-settings

# 安装 python
mise use --global python@3.12
python --version
```

## 模型网关

### magpie

直接安装，通过代理下载 release

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --mirror https://gh-proxy.com/

```

本地 ssh 配置端口转发，打开 magpie web 页面进行模型配置，以 [tabby](https://tabby.sh/) 为例：



## Agent

安装 agent

* claude code。`npm install -g @anthropic-ai/claude-code`
* codex。`npm install -g @openai/codex`

## T3 Code

```bash
## 配置代理
export T3CODE_RELEASE_BASE_URL=https://gh-proxy.com/https://github.com/pingdotgg/t3code/releases/download
export T3CODE_TELEMETRY_ENABLED=false

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
Environment=T3CODE_TELEMETRY_ENABLED=false

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

