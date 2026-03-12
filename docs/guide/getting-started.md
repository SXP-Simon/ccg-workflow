# 快速开始

## CCG 是什么

一句话：**Claude Code 指挥 Codex 和 Gemini 帮你写代码。**

```
Claude Code (指挥)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(后端)   (前端)
   │       │
   └───┬───┘
       ↓
  统一 Patch → Claude 审核 → 写入文件
```

你发一条需求，CCG 判断该给谁干，干完了 Claude 审核，没问题才写入代码。Codex 和 Gemini 全程碰不到你的文件。

## 需要什么

- **Node.js 20+** — 低于 20 会报错，不要问为什么（`ora@9.x` 的锅）
- **Claude Code CLI** — 没有这个什么都跑不了
- **jq** — 自动授权 Hook 要用
- **Codex CLI** — 可选，装了才有后端路由
- **Gemini CLI** — 可选，装了才有前端路由

## 装上

```bash
npx ccg-workflow
```

第一次跑会让你选语言，选完就不问了。

### jq 怎么装

::: code-group

```bash [macOS]
brew install jq
```

```bash [Debian / Ubuntu]
sudo apt install jq
```

```bash [RHEL / CentOS]
sudo yum install jq
```

```bash [Windows]
choco install jq
# 或者
scoop install jq
```

:::

### Claude Code 怎么装

```bash
npx ccg-workflow menu  # 里面有「安装 Claude Code」选项
```

npm、homebrew、curl、powershell、cmd 都支持。

## 试一下

装完后，在 Claude Code 里输入：

```
/ccg:frontend 给登录页加个暗色模式切换按钮
```

看到 Gemini 被调用，说明一切正常。

## 更新和卸载

```bash
# 更新
npx ccg-workflow@latest

# 卸载
npx ccg-workflow  # 选「卸载工作流」
```

## 然后呢

- [命令参考](/guide/commands) — 28 个命令，总有你用得上的
- [工作流指南](/guide/workflows) — 什么场景用什么工作流
- [MCP 配置](/guide/mcp) — 让代码搜索更聪明
