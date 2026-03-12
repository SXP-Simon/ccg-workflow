# 命令参考

CCG 提供 28 个斜杠命令，覆盖开发全流程。所有命令通过 `/ccg:*` 访问。

## 开发工作流

| 命令 | 说明 | 模型 |
|------|------|------|
| `/ccg:workflow` | 6 阶段完整工作流（研究→构思→计划→执行→优化→评审） | Codex + Gemini |
| `/ccg:plan` | 多模型协作规划（Phase 1-2） | Codex + Gemini |
| `/ccg:execute` | 多模型协作执行（Phase 3-5） | Codex + Gemini + Claude |
| `/ccg:codex-exec` | Codex 全权执行（计划 → 代码 → 审核） | Codex + 多模型审核 |
| `/ccg:feat` | 智能功能开发 | 自动路由 |
| `/ccg:frontend` | 前端任务（快速模式） | Gemini |
| `/ccg:backend` | 后端任务（快速模式） | Codex |

### 使用示例

```bash
# 完整工作流
/ccg:workflow 实现用户认证功能

# 只做规划（不执行）
/ccg:plan 实现用户认证功能

# 前端快速模式
/ccg:frontend 优化登录页面的响应式布局
```

## 分析与质量

| 命令 | 说明 | 模型 |
|------|------|------|
| `/ccg:analyze` | 技术分析 | Codex + Gemini |
| `/ccg:debug` | 问题诊断 + 修复 | Codex + Gemini |
| `/ccg:optimize` | 性能优化 | Codex + Gemini |
| `/ccg:test` | 测试生成 | 自动路由 |
| `/ccg:review` | 代码审查（自动 git diff） | Codex + Gemini |
| `/ccg:enhance` | Prompt 增强 | 内置 |

### 使用示例

```bash
# 无参数自动审查最近改动
/ccg:review

# 分析特定模块
/ccg:analyze src/auth/ 的安全性

# 生成测试
/ccg:test src/utils/validator.ts
```

## OPSX 规范驱动

集成 [OPSX](https://github.com/fission-ai/opsx) 架构，把需求变成约束。

| 命令 | 说明 |
|------|------|
| `/ccg:spec-init` | 初始化 OPSX 环境 |
| `/ccg:spec-research` | 需求 → 约束集 |
| `/ccg:spec-plan` | 约束 → 零决策计划 |
| `/ccg:spec-impl` | 按计划执行 + 归档 |
| `/ccg:spec-review` | 双模型交叉审查 |

### 使用示例

```bash
/ccg:spec-init
/ccg:spec-research 实现用户认证
/ccg:spec-plan
/ccg:spec-impl
/ccg:spec-review
```

::: tip
每阶段之间可 `/clear`，状态存在 `openspec/` 目录，不怕上下文爆。
:::

## Agent Teams（v1.7.60+）

利用 Claude Code Agent Teams 实验特性，spawn 多个 Builder teammates 并行写代码。

| 命令 | 说明 |
|------|------|
| `/ccg:team-research` | 需求 → 约束集（并行探索） |
| `/ccg:team-plan` | 约束 → 并行实施计划 |
| `/ccg:team-exec` | spawn Builder teammates 并行写代码 |
| `/ccg:team-review` | 双模型交叉审查 |

::: warning 前置条件
需在 `settings.json` 中启用实验特性：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
:::

### 使用示例

```bash
/ccg:team-research 实现实时协作看板 API
# /clear
/ccg:team-plan kanban-api
# /clear
/ccg:team-exec
# /clear
/ccg:team-review
```

## Git 工具

| 命令 | 说明 |
|------|------|
| `/ccg:commit` | 智能提交（conventional commit 格式） |
| `/ccg:rollback` | 交互式回滚 |
| `/ccg:clean-branches` | 清理已合并分支 |
| `/ccg:worktree` | Worktree 管理 |

### 使用示例

```bash
# 智能提交（自动分析 diff）
/ccg:commit

# 交互式回滚
/ccg:rollback

# 清理已合并分支（默认 dry-run）
/ccg:clean-branches
```

## 项目管理

| 命令 | 说明 |
|------|------|
| `/ccg:init` | 初始化项目 CLAUDE.md |
| `/ccg:context` | 项目上下文管理（.context 初始化/日志/压缩/历史） |

### 使用示例

```bash
# 初始化项目 AI 上下文
/ccg:init

# 初始化 .context 目录
/ccg:context init

# 记录决策日志
/ccg:context log "选择 PostgreSQL 因为需要 JSONB 支持"

# 查看上下文历史
/ccg:context history
```
