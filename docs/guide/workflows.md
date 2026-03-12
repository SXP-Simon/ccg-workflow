# 工作流指南

CCG 提供三种主要工作流，适用于不同场景。

## 规划与执行分离

最基础的工作流：先规划，再执行，中间可以人工审查和修改计划。

```bash
# 1. 生成实施计划
/ccg:plan 实现用户认证功能

# 2. 审查计划（可修改）
# 计划保存至 .claude/plan/user-auth.md

# 3a. 执行计划（Claude 重构）— 精细控制
/ccg:execute .claude/plan/user-auth.md

# 3b. 执行计划（Codex 全权）— 高效执行，Claude token 极低
/ccg:codex-exec .claude/plan/user-auth.md
```

### 选择 execute 还是 codex-exec？

| 维度 | `/ccg:execute` | `/ccg:codex-exec` |
|------|---------------|-------------------|
| 执行者 | Claude 主导 + Codex/Gemini 辅助 | Codex 全权执行 |
| Token 消耗 | 较高（Claude 处理每一步） | 极低（Claude 只审核） |
| 适用场景 | 需要精细控制的复杂任务 | 明确的、可独立执行的任务 |
| MCP 搜索 | Claude 执行 | Codex 执行（需同步 MCP） |

## OPSX 规范驱动工作流

集成 [OPSX](https://github.com/fission-ai/opsx) 架构，把需求变成约束，让 AI 没法自由发挥。适合需要**严格控制**的场景。

```bash
/ccg:spec-init                       # 初始化 OPSX 环境
/ccg:spec-research 实现用户认证        # 研究需求 → 输出约束集
/ccg:spec-plan                       # 并行分析 → 零决策计划
/ccg:spec-impl                       # 按计划执行
/ccg:spec-review                     # 独立审查（随时可用）
```

### 工作流特点

- **约束驱动**：需求不再是模糊描述，而是可验证的约束条件
- **零决策计划**：执行阶段不需要做任何决策，所有决策在规划阶段完成
- **状态持久化**：状态存在 `openspec/` 目录，每阶段可 `/clear` 释放上下文

::: tip
`/ccg:spec-*` 命令内部调用 `/opsx:*`。如果你直接使用 OPSX，请使用 `/opsx:*` 命令。
:::

## Agent Teams 并行工作流

利用 Claude Code Agent Teams 实验特性，spawn 多个 Builder teammates 并行写代码。适合**可拆分为 3+ 独立模块**的任务。

```bash
/ccg:team-research 实现实时协作看板 API  # 1. 需求 → 约束集
# /clear
/ccg:team-plan kanban-api               # 2. 规划 → 并行计划
# /clear
/ccg:team-exec                          # 3. Builder 并行写代码
# /clear
/ccg:team-review                        # 4. 双模型交叉审查
```

### vs 传统工作流

| 维度 | 传统工作流 | Agent Teams |
|------|-----------|-------------|
| 上下文 | 连续对话 | 每步 `/clear` 隔离 |
| 状态传递 | 对话上下文 | 文件（.claude/plan/） |
| 并行度 | 串行 | 多 Builder 并行 |
| 适用场景 | 通用 | 3+ 独立模块 |

### 工作流图

```
team-research          team-plan           team-exec          team-review
     │                    │                    │                   │
  需求分析            规划拆分           Builder 1 ──┐         Codex 审查
     │                    │            Builder 2 ──┤              │
  约束输出            并行计划          Builder 3 ──┘         Gemini 审查
     │                    │                    │                   │
     ↓                    ↓                    ↓                   ↓
  constraints.md    plan/*.md          代码产出            审查报告
```

## 完整 6 阶段工作流

`/ccg:workflow` 是最完整的工作流，包含 6 个阶段：

1. **研究** — 分析需求，理解上下文
2. **构思** — 提出解决方案
3. **计划** — 制定实施计划（Codex + Gemini 并行分析）
4. **执行** — 按计划实施（模型路由：前端 → Gemini，后端 → Codex）
5. **优化** — 性能优化和代码质量
6. **评审** — 多模型交叉审查

```bash
/ccg:workflow 实现完整的用户认证系统，包含注册、登录、JWT 令牌
```

::: info
对于大型任务，建议使用 `/ccg:plan` + `/ccg:execute` 分步执行，以便中间审查计划。
:::

## 工作流选择指南

```
收到任务
  │
  ├─ 简单/明确？ ────────────→ /ccg:frontend 或 /ccg:backend
  │
  ├─ 需要规划？ ─────────────→ /ccg:plan + /ccg:execute
  │
  ├─ 需要严格约束？ ─────────→ /ccg:spec-* 系列
  │
  ├─ 可拆分 3+ 模块？ ──────→ /ccg:team-* 系列
  │
  └─ 完整端到端？ ───────────→ /ccg:workflow
```
