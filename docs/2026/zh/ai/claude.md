# Claude Code

## 经验分享

* [Claude Code + DeepSeek V4：基于 CC Switch 在 IDEA 实现免登录全配置指南](https://mp.weixin.qq.com/s/8wbV-2LQ0nxX2nNIOQ41YQ)

## 镜像站

* [AICodeMirror](https://www.aicodemirror.com/)
* [cc-switch](https://github.com/farion1231/cc-switch)。[CC Switch](https://ccswitch.io/zh/)

## 插件

* [codegraph](https://github.com/colbymchenry/codegraph)。
* [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)。

## 使用经验

### cc-switch

管理 skills 和 mcps

### codegraph

```shell
# 安装
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# 绑定 agent。安装好后需与 claude、codex 等 agent 进行绑定，让 claude、codex 可以自动应用 codegraph
codegraph install --target claude --yes --no-permissions

# 代码应用。进入代码仓库，初始化 codegraph
cd yourr-project
codegraph init

# 启动 agent，进行编程
```

注意，在配置好 codegraph 后，可进入 cc-switch 导入 mcp，后续在 cc-switch 统一管理 mcp
