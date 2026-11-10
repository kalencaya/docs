# QwenPaw-Data





## 安装部署

README 中的部署流程偏向从源码编译部署。

文档中列出的为 Mac 版本，具体以原代码仓库为准。


### 1. Clone 仓库并创建本地配置

```bash
git clone https://github.com/agentscope-ai/QwenPaw-Data.git
cd QwenPaw-Data
cp .env.example .env
```

所有本地配置都写入根目录 `.env`。不要提交包含密钥的 `.env`。
请将 `NEO4J_PASSWORD=YOUR_PASSWORD` 替换为本地 Neo4j 实例的密码。

### 2. 配置下载镜像和模型

国内网络建议在 `.env` 中添加一个镜像配置，例如：

```bash
UV_DEFAULT_INDEX=https://mirrors.aliyun.com/pypi/simple/
```

然后填写 DataBridge 与 QwenPaw Data CLI 共用的模型配置。CLI 默认复用这组
OpenAI-compatible 配置；只有需要为 CLI 指定不同模型时，才配置
`QWENPAW_DATA_MODEL_*`：

```bash
OPENAI_API_KEY=<replace-with-your-api-key>
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen3.7-max
EMBED_MODEL=text-embedding-v3
EMBED_DIM=1024
```

### 3. 初始化本地环境

```bash
# macOS / Linux
python3 scripts/init_local.py
```

初始化脚本会：

1. 创建 `packages/qwenpaw-data-context/.venv`，安装 DataBridge 后端依赖并构建管理界面。
2. 从仓库提交的 `uv.lock` 导出固定版本及 hash，通过 `UV_DEFAULT_INDEX` 指定的镜像安装到根目录 `.venv`，再以 editable 模式安装所有 workspace 包。
3. 使用临时源文件，将名为 `databridge` 的 MCP 客户端导入 `${QWENPAW_DATA_HOME:-~/.qwenpaw-data}/host/workspace/.mcp`。
4. 在不覆盖已有命令的前提下发布 `qwenpaw-data`：macOS/Linux 默认写入
   `${QWENPAW_DATA_CLI_BIN_DIR:-~/.local/bin}`，Windows 默认生成
   `%LOCALAPPDATA%\QwenPaw Data\bin\qwenpaw_data.cmd`。

镜像只影响下载地址，不会重写或删除 `uv.lock`，初始化后仓库也不会因此产生锁文件变更。首次初始化不要使用 `--skip-build`；只有已经存在前端构建产物时才向初始化命令传入 `--skip-build`。

如果其他系统负责管理默认 workspace 的 MCP 配置，向初始化命令传入 `--skip-mcp-config`。

如果遇到了 `dbt_core_experimental_parser` 报错，可以手动安装：

```bash
## 使用 github 代理下载文件
curl -L -o dbt_core_experimental_parser-2.0.8-py3-none-macosx_11_0_arm64.whl \
  https://gh-proxy.org/https://github.com/dbt-labs/dbt/releases/download/v2.0.8/dbt_core_experimental_parser-2.0.8-py3-none-macosx_11_0_arm64.whl

## 手动安装到项目目录
uv pip install --python /path/to/QwenPaw-Data/packages/qwenpaw-data-context/.venv/bin/python \
  ./dbt_core_experimental_parser-2.0.8-py3-none-macosx_11_0_arm64.whl
```

### 4. 在终端 A 启动本地服务

```bash
# macOS / Linux
python3 scripts/start_local.py
```

该命令会启动本地 Neo4j、DataBridge API 和管理界面，并持续占用当前终端。如果 DataBridge UI 端口 `3000` 或 API 端口 `8765` 已被占用，它会安全失败，不会终止无关进程。

默认地址：

```text
DataBridge UI:   http://localhost:3000
DataBridge API:  http://localhost:8765
DataBridge 文档: http://localhost:8765/docs
```

### 5. 在终端 B 初始化内置 demo

仓库包含确定性的 PostgreSQL 数据、语义配置工作簿和知识图谱文档。执行：

```bash
# macOS / Linux
examples/init_demo.sh --register
```

命令可重复运行，会生成 475 行合成数据并创建固定数据源
`postgresql-demo-gaap`。它不会自动上传知识图谱文档，因为该步骤会调用
`.env` 中配置的模型。

### 6. 构建 demo 图谱

打开 `http://localhost:3000`：

1. 在 **Semantic Weaving** 中选择 `Demo PG - GAAP use case`，提交一次
   `FULL` weave。
2. 在 **KG Docs Management** 中上传 `examples/demo_kg_doc.docx`。
3. 等待文档状态变为 `ready`。

如果只想在没有真实模型 API key 的情况下快速走查，可以跳过图谱构建，使用
下文的确定性 smoke test。

### 7. 验证 CLI

```bash
command -v qwenpaw-data
qwenpaw-data datasource list
```

命令应解析到初始化程序发布的 launcher，`datasource list` 应包含
`postgresql-demo-gaap`。CLI
会自动加载仓库根目录 `.env`；只有需要使用其他 dotenv 文件时才设置
`QWENPAW_DATA_ENV_FILE`。

### 8. 执行真实数据任务

建议第一次使用非流式模式，便于查看完整执行摘要：

```bash
qwenpaw-data run \
  --no-stream \
  --datasource-id postgresql-demo-gaap \
  "分析 2026 年 3 月 product X 有效用户的平均 GAAP 值，展示时间趋势，并结合相关 KG 事件解释异常峰值"
```

预期峰值出现在 2026-03-10，有效用户平均 GAAP 值约为 `45.89`。默认产物
目录在 macOS/Linux 上是
`${QWENPAW_DATA_HOME:-~/.qwenpaw-data}/host/workspace

如需在不使用真实模型 API key 的情况下做确定性端到端走查：

```bash
# macOS / Linux
examples/init_demo.sh
uv run python examples/smoke_test.py
```

直接 SQL、清理和故障排查命令见 [完整 demo 文档](examples/README.md)。



## 参考链接

* [QwenPaw-Data](https://github.com/agentscope-ai/QwenPaw-Data)