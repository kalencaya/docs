# mise

安装：

```bash
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc

mise --version
mise doctor

mise ls --current
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

* `mkdir -p .config/mise && touch .config/mise/config.toml`
* `vim .config/mise/config.toml`

```toml
[settings]
http_download_timeout = "6h"
pypi.registry_url = "https://mirrors.aliyun.com/pypi/simple/"
node.mirror_url = "https://npmmirror.com/mirrors/node/"
[settings.python]
# python 解释器下载地址
# mirror_url = "https://registry.npmmirror.com/-/binary/python-build-standalone"
uv_venv_auto = "create|source"
[settings.url_replacements]
"https://github.com/" = "https://gh-proxy.org/https://github.com/"
"https://archive.apache.org/dist/" = "https://dlcdn.apache.org/"

# maven.mirror = "https://maven.aliyun.com/repository/public"

[env]
# 自动创建 venv
_.python.venv = { path = ".venv", create = true, uv_create_args = ["--seed"]  }
```



