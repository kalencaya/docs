# AI

## CLI



### MaxCompute CLI，基于阿里云CLI

当安装好阿里云CLI 后，无需额外安装 MaxCompute CLI 即可使用。

需安装 SKILL 引导 Agent 使用 `aliyun maxc`：

```bash
# 一键安装到 Claude Code
aliyun maxc agent skill install --json

# 一键安装到 codex
aliyun maxc agent skill install codex --json

# 查看所有平台的安装状态
aliyun maxc agent skill list --json

# 更新已安装的 SKILL（新版本发布后）
aliyun maxc agent skill update --all --json

# 查看已安装版本与最新版本的差异
aliyun maxc agent skill diff claude-code --json

# 卸载
aliyun maxc agent skill uninstall cursor --json
```

### MaxCompute 语义增强 CLI

语义增量 CLI 为对 maxcompute 中的表进行语义化后存入本地 sqlite + markdown。

profile 配置和目录绑定：

```bash
## profile
# 创建 profile
mcs profile create

mcs profile list # 查看 profile 列表
mcs profile list -f json # 查看 profile 列表，json 格式输出
mcs profile show <name> # 查看 profile 详情
mcs profile show <name> -f json # 查看 profile 详情，json 格式输出

mcs profile update <name> # 更新 profile

## 绑定 profile。在进入指定目录后可自动应用 profile。
## 如果不绑定，需在 cli 中指定 --profile <name>，如 mcs status --profile <name>
mcs link bind <profile-name> # 将当前目录绑定到 profile（推荐）
mcs link status # 查看当前目录绑定状态
```

安装 Agent Skill，安装完后可以让大模型自己去通过 skill 操作，无需用户自身去查看 CLI 语法手敲：

```bash
# mcs 的 Skill 注册到本机 Agent

# 安装到 claude
mcs skill install -p claude-code
# 安装到 codex
mcs skill install -p codex

# --detect 表示只安装到当前机器上已检测到的 Agent 平台
# Claude Code、Cursor、Codex、Gemini CLI、Qwen Code 和 OpenCode。
mcs skill install --detect -g

# 把 Skill 安装到所有支持的平台
mcs skill install --all -g
```

支持导出为 ossie，不支持从 ossie 导入：

```bash
# 导出 profile 名为 game_buddy_dw 下的语义包
mcs profile export game_buddy_dw --osi
```

一些常用命令行说明：

```bash
## 语义包构建与维护
mcs show --profile <name> # 查看语义包
mcs show --table <table-name> --profile <name> # 查看表语义
mcs build --profile <name> # 构建语义包
## 语义包构建完成后，会对表描述、字段含义等生成语义建议（比如从字段采样后生成的置信度判断是否可信），需经人工审核后写入语义包
mcs package propose --from-suggestions --profile <name>
mcs package list-proposals --status suggested|applied|rejected|pending --profile <name>
mcs package apply <id> --profile <name>
mcs package show-proposal <id> --profile <name>

## metric
mcs metric add gmv \
  --expression "SUM(pay_amount)" \
  --description "成交金额" \
  --ai-context "GMV 使用订单支付金额求和，排除取消订单。"

## memory
# 新增一条经过验证的 SQL。比较反常识，命令不是 add 之类的
mcs memory verify --question "<自然语言问题>" --sql '<SQL>' --tables table_a,table_b
```

## 参考链接

* [阿里云CLI](https://help.aliyun.com/zh/cli)
* [阿里云 Agent Skills](https://skills.aliyun.com/skills?orderBy=install)
* MaxCompute Agentic 生态
  * [MaxCompute MCP 服务使用文档](https://help.aliyun.com/zh/maxcompute/user-guide/mcp-overview-and-access)。
    * remote。需要是阿里云主账号或者 `AliyunRAMFullAccess` 权限进行 OAuth 授权
    * local。本地安装 python mcp server
  * [MaxCompute CLI](https://help.aliyun.com/zh/maxcompute/user-guide/maxcompute-cli)。基于 阿里云CLI 调用
  * [MaxCompute 语义增强 CLI（MaxCompute-semantic）](https://help.aliyun.com/zh/maxcompute/user-guide/maxcompute-semantic-cli)。[maxcompute-semantic](https://github.com/aliyun/maxcompute-semantic)
* SDK
  * [catalog-api](https://mvnrepository.com/artifact/com.aliyun.odps/catalog-api)。源码：[aliyun-odps-openapi-sdk](https://github.com/aliyun/aliyun-odps-openapi-sdk)
  * [odps-jdbc](https://mvnrepository.com/artifact/com.aliyun.odps/odps-jdbc)
  * [odps-sdk-core](https://mvnrepository.com/artifact/com.aliyun.odps/odps-sdk-core)。源码：[aliyun-odps-java-sdk](https://github.com/aliyun/aliyun-odps-java-sdk)
