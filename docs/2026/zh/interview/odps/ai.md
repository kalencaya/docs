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

安装 Agent Skill：

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
  * [odps-sdk-core](https://mvnrepository.com/artifact/com.aliyun.odps/odps-sdk-core)
