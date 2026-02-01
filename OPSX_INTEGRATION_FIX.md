# OPSX 集成修复总结

## 问题描述

在执行 `/ccg:spec-plan` 和 `/ccg:spec-research` 命令时，Claude 尝试使用 `Skill(opsx:list)` 等方式调用 OPSX 命令，但这是错误的。

### 根本原因

1. **OPSX 不是 Skills**：OPSX 提供的是斜杠命令（`/opsx:xxx`），而不是可以通过 `Skill()` 工具调用的 skills
2. **命令模板错误**：CCG 命令模板中使用了错误的语法来引用 OPSX 功能
3. **混淆了两种调用方式**：
   - ❌ 错误：`Skill(opsx:list)` 或 `Run /opsx:list`
   - ✅ 正确：直接调用 CLI `openspec list --json`

## 修复内容

### 修复的文件

1. **templates/commands/spec-plan.md**
   - 第19行：`/opsx:list` → `openspec list --json`
   - 第21行：`/opsx:status <change_id>` → `openspec status --change "<change_id>" --json`
   - 第105行：`/opsx:status <id>` → `openspec status --change "<id>" --json`
   - 第106行：删除 `/opsx:schemas`，添加 `openspec list --json`

2. **templates/commands/spec-research.md**
   - 第36行：`/opsx:new` → `openspec new "<brief-descriptive-name>" --json`
   - 第39行：`/opsx:list` → `openspec list --json`
   - 第101行：`/opsx:status`, `/opsx:show` → `openspec status --change "<id>" --json`, `openspec list --json`

3. **templates/commands/spec-impl.md**
   - 第19行：`/opsx:list` → `openspec list --json`
   - 第21行：`/opsx:show <change_id>` → `openspec status --change "<change_id>" --json`
   - 第114-116行：更新 Reference 部分的命令

4. **templates/commands/spec-review.md**
   - 第18行：`/opsx:list` → `openspec list --json`
   - 第20行：`/opsx:show <proposal_id>` → `openspec status --change "<proposal_id>" --json`
   - 第24行：删除 `/opsx:diff <proposal_id>`
   - 第116-118行：更新 Reference 部分的命令

5. **templates/commands/spec-init.md**
   - 第22行：`/opsx:version` → `npx @fission-ai/openspec --version`
   - 第37行：`/opsx:init --tools claude` → `npx @fission-ai/openspec init --tools claude`
   - 第40行：`opsx-*` → `openspec-*`（skills 目录名称）
   - 第87-88行：更新 Reference 部分

## OPSX 正确使用方式

### 1. CLI 命令（在 Bash 中使用）

```bash
# 列出所有变更
openspec list --json

# 查看变更状态
openspec status --change "<change_id>" --json

# 创建新变更
openspec new "<change-name>" --json

# 获取指令
openspec instructions <artifact-id> --change "<name>" --json
```

### 2. 斜杠命令（在对话中使用）

这些命令是 OPSX 安装在 `.claude/commands/opsx/` 中的：

- `/opsx:new` - 创建新变更
- `/opsx:continue` - 继续工作（创建下一个工件）
- `/opsx:apply` - 实施任务
- `/opsx:list` - 列出活动变更
- `/opsx:archive` - 归档变更
- `/opsx:explore` - 探索代码库
- 等等...

**重要**：斜杠命令不能通过 `Skill()` 工具调用，它们是直接在对话中使用的。

### 3. CCG 封装命令（推荐）

CCG 提供了更高级的封装，内部会调用 OPSX CLI：

- `/ccg:spec-research` - 研究阶段（创建 proposal）
- `/ccg:spec-plan` - 规划阶段（创建 specs/design/tasks）
- `/ccg:spec-impl` - 实施阶段（执行任务 + 审查 + 归档）
- `/ccg:spec-review` - 独立审查工具

## 验证修复

### 测试步骤

1. 重启 Claude Code（使更新的命令生效）
2. 运行 `/ccg:spec-plan`
3. 观察是否正确调用 `openspec list --json` 而不是 `Skill(opsx:list)`

### 预期行为

```bash
# Claude 应该执行：
Bash({
  command: "openspec list --json",
  description: "列出活动变更"
})

# 而不是：
Skill(opsx:list)  # ❌ 错误
```

## 架构说明

```
用户
 ↓
/ccg:spec-plan (CCG 命令)
 ↓
openspec CLI (通过 Bash 调用)
 ↓
.claude/skills/openspec-* (OPSX skills，由 CLI 内部使用)
```

**关键点**：
- CCG 命令 → 调用 `openspec` CLI
- OPSX 斜杠命令 → 也是调用 `openspec` CLI
- OPSX skills → 由 CLI 内部使用，不直接暴露给 Claude

## 后续工作

1. ✅ 修复所有命令模板
2. ✅ 更新已安装的命令文件
3. ⏳ 测试完整工作流
4. ⏳ 更新 CLAUDE.md 文档
5. ⏳ 发布新版本

## 相关文件

- `templates/commands/spec-*.md` - 命令模板（已修复）
- `~/.claude/commands/ccg/spec-*.md` - 已安装命令（已更新）
- `.claude/commands/opsx/*.md` - OPSX 原生命令
- `.claude/skills/openspec-*` - OPSX skills

---

**修复日期**: 2026-02-01
**修复人**: Claude (Sonnet 4.5)
**问题报告人**: 用户 li
