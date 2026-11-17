# Python

## 安装

### Mac

```bash
brew install mise uv
```

### Linux

#### uv

安装：

```bash
## 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh
wget -qO- https://astral.sh/uv/install.sh | sh
uv --version
```

配置代理

```bash
## python 解释器。使用 gh-proxy.com 代理
export UV_PYTHON_INSTALL_MIRROR="https://gh-proxy.com/https://github.com/astral-sh/python-build-standalone/releases/download"
## python 包
export UV_DEFAULT_INDEX="https://mirrors.aliyun.com/pypi/simple/"
```

常用命令

```bash
# 装 Python 版本（取代 pyenv）
uv python install 3.13 
# 指定项目版本，会在项目目录下生成 .python-version 文件
uv python pin 3.12
# 建虚拟环境（取代 virtualenv）
uv venv
# 装包（取代 pip，快得不像话）
uv pip install requests
# 全局工具（取代 pipx）
uv tool install ruff ## uninstall reinstall     
```

#### mise

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

