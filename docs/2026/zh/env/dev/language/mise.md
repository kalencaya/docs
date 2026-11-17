# mise

安装：

```bash
curl https://mise.run | sh

mise --version
mise doctor

## 激活其他工具如 npm 和 node
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc

mise ls --current

# 安装 node
mise use --global node@20
node -v
```

## 配置文件

项目下创建 `.mise.toml` 文件

```toml
[tools]
java = "21"
maven = "3.9"
node = "24.22.1"
python = "3.12"

[env]
# 自动创建 venv
_.python.venv = { path = ".venv", create = true, uv_create_args = ["--seed"]  }

[settings]
python.uv_venv_auto = "create|source"
```

maven 需要额外安装插件：

```bash
mise plugin install maven
```

配置好文件后：

```bash
## 安装
mise install
## 查询当前环境
mise current
## 查看服务目录
mise which <tool>
```

如何遇到从 github 下载不稳定，在 `~/.config/mise/config.toml` 配置：

```toml
[settings.url_replacements]
"https://github.com/" = "https://gh-proxy.com"
```



