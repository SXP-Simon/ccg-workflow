# 快速开始

## 架构概览

```
Claude Code (编排)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(后端)   (前端)
   │       │
   └───┬───┘
       ↓
  Unified Patch
```

外部模型无写入权限，仅返回 Patch，由 Claude 审核后应用。

## 前置条件

| 依赖 | 必需 | 说明 |
|------|------|------|
| **Node.js 20+** | 是 | `ora@9.x` 要求 Node >= 20 |
| **Claude Code CLI** | 是 | [安装方法](#安装-claude-code) |
| **jq** | 是 | 用于自动授权 Hook |
| **Codex CLI** | 否 | 启用后端路由 |
| **Gemini CLI** | 否 | 启用前端路由 |

## 安装

```bash
npx ccg-workflow
```

首次运行会提示选择语言（简体中文 / English），选择后自动保存。

### 安装 jq

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
# 或
scoop install jq
```

:::

### 安装 Claude Code

```bash
npx ccg-workflow menu  # 选择「安装 Claude Code」
```

支持：npm、homebrew、curl、powershell、cmd。

## 验证安装

安装完成后，在 Claude Code 中输入：

```
/ccg:workflow 你好
```

如果看到多模型协作输出，说明安装成功。

## 更新

```bash
# npx 用户
npx ccg-workflow@latest

# npm 全局用户
npm install -g ccg-workflow@latest
```

## 卸载

```bash
npx ccg-workflow  # 选择「卸载工作流」

# npm 全局用户需额外执行
npm uninstall -g ccg-workflow
```

## 下一步

- [命令参考](/guide/commands) — 查看全部 28 个命令
- [工作流指南](/guide/workflows) — 学习三种主要工作流
- [MCP 配置](/guide/mcp) — 增强代码检索能力
