# Strategy: Guided Develop — 引导式开发

> 适用于中等复杂度的功能开发。可选调用外部模型进行领域分析。

## 适用条件
- 复杂度 M（2-5 文件，单模块）
- 需要一定规划但不需要完整的多模型协作
- 风险 low 或 medium

---

## 工作流状态机

[phase-state:1-requirements]
当前阶段：需求增强
📍 Next: 需求结构化后进入上下文检索
[/phase-state:1-requirements]

[phase-state:2-context]
当前阶段：上下文检索
Gate: 需求已增强 ✓
📍 Next: 上下文收集完毕后判断是否需要外部模型分析
[/phase-state:2-context]

[phase-state:3-analysis]
当前阶段：领域分析（可选外部模型）
Gate: 上下文已收集 ✓
📍 Next: 分析完成后进入规划阶段
[/phase-state:3-analysis]

[phase-state:4-plan]
当前阶段：规划
Gate: 分析已完成 ✓
📍 Next: 用户确认计划后进入实施
[/phase-state:4-plan]

[phase-state:5-implement]
当前阶段：实施
Gate: 用户已确认计划 ✓（HARD STOP）
📍 Next: 实施完成后进入验证
[/phase-state:5-implement]

[phase-state:6-verify]
当前阶段：验证
Gate: 实施已完成 ✓
📍 Next: 验证通过后报告结果
[/phase-state:6-verify]

---

## 阶段详情

### Phase 1: 需求增强 [required]

分析用户的 $ARGUMENTS，补全为结构化需求：
- **目标**：要实现什么
- **约束**：不能改什么、需要兼容什么
- **范围**：哪些文件/模块会受影响
- **验收标准**：怎样算完成

展示增强后的需求，用户确认或调整。

### Phase 2: 上下文检索 [required]

1. 用 MCP 搜索工具搜索相关代码
2. 读取目标模块的核心文件
3. 识别依赖关系和可能的影响范围
4. 了解现有的测试覆盖情况

### Phase 3: 多模型分析 [required]

**Gate check**: 需求已增强 ✓ 上下文已收集 ✓

**M 复杂度必须调用外部模型进行分析。** 不可跳过。

执行步骤：

1. 确定工作目录：`WORKDIR=$(pwd)`
2. 根据领域选择模型：
   - 后端任务 → backend 模型（codex）+ analyzer 角色
   - 前端任务 → frontend 模型（gemini）+ analyzer 角色
   - 全栈任务 → 双模型并行

3. **调用 codeagent-wrapper**（必须实际执行，不是读文件）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend codex {{GEMINI_MODEL_FLAG}}- \"$WORKDIR\" <<'CODEAGENT_EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/analyzer.md\n<TASK>\n需求：{增强后的需求}\n上下文：{Phase 2 收集的项目上下文、相关代码摘要}\n</TASK>\nOUTPUT: 技术分析报告（可行性、架构建议、风险评估、实施方案对比）\nCODEAGENT_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Backend 模型分析"
})
```

如果是全栈任务，同时启动 frontend 模型：
```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend gemini {{GEMINI_MODEL_FLAG}}- \"$WORKDIR\" <<'CODEAGENT_EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/analyzer.md\n<TASK>\n需求：{增强后的需求}\n上下文：{Phase 2 收集的项目上下文}\n</TASK>\nOUTPUT: 前端/UX 视角分析报告\nCODEAGENT_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Frontend 模型分析"
})
```

4. **等待结果**（必须等，不可跳过）：
```
TaskOutput({ task_id: "<id>", block: true, timeout: 600000 })
```

5. 综合模型分析结果，提取关键建议用于 Phase 4 规划

**Task 更新**：`currentPhase → "3-analysis"`, `nextAction → "等待模型分析返回"`

### Phase 4: 规划 [required]

撰写实施计划，输出格式：

```
📋 实施计划

## 需求
[增强后的需求摘要]

## 方案
[选定方案及理由]

## 步骤
1. [文件路径] — [具体变更]
2. [文件路径] — [具体变更]
...

## 影响范围
- 修改: [文件列表]
- 新增: [文件列表]（如有）
- 测试: [需要更新/新增的测试]
```

将计划持久化到 `.ccg/tasks/{task-name}/plan.md`。

**Task 更新**：
```
更新 .ccg/tasks/{task-name}/task.json:
  currentPhase → "4-plan"
  gate → "user_approval_required"
  nextAction → "等待用户审批计划"
```

**⛔ HARD STOP**：展示计划，等待用户确认后才能进入 Phase 5。

用户确认后：
```
更新 task.json: gate → null, currentPhase → "5-implement"
```

### Phase 5: 实施

1. 严格按计划执行
2. 遵循项目现有代码规范
3. 每完成一个主要步骤，简要报告进度
4. 遇到计划外的问题时告知用户，不自行扩大范围

**Task 更新**：`currentPhase → "5-implement"`, `nextAction → "按计划执行实施"`

### Phase 6: 验证 + 双模型审查 + 质量关卡

1. `git diff` 展示所有变更
2. 运行测试（如果有）

**⛔ 双模型交叉审查（变更 >30 行时必须执行）：**
3. 并行调用双模型（`run_in_background: true`，使用 model-router.md 模板）：
   - backend 模型 + reviewer 角色 — 安全、性能、错误处理
   - frontend 模型 + reviewer 角色 — 设计一致性（如涉及前端）
4. 综合审查意见

**⛔ 质量关卡（变更 >30 行时必须逐个调用 Skill，不可跳过）：**
5. 调用 Skill `verify-quality` — 等待报告
6. 调用 Skill `verify-security` — 等待报告（涉及 auth/input/crypto 时）
7. 调用 Skill `verify-change` — 等待报告
8. Critical 问题必须修复
4. 检查是否满足验收标准
5. 输出结果：
   ```
   ✅ 开发完成
     变更: [N] 文件，[M] 行
     实现: [摘要]
     测试: [通过/跳过/失败情况]
     质量: [Critical: N, Warning: N, Info: N]
     📍 Next: 可以用 /ccg:commit 提交
   ```

**Task 更新**：`status → "completed"`, `nextAction → "可用 /ccg:commit 提交"`

---

## 升级规则

- 发现涉及 5+ 文件或需要跨模块协调 → 升级到 `full-collaborate`
- 发现涉及架构级变更 → 升级到 `full-collaborate`
- 外部模型分析发现重大风险 → 升级到 `full-collaborate`

---

## 铁律

- **Phase 4 计划必须用户确认** — HARD STOP，不可自动跳过
- **外部模型仅提供建议** — Claude 执行所有文件修改
- **不扩大范围** — 只做计划内的变更，计划外的报告但不自行处理
- **增量实施** — 多文件变更时逐文件执行，便于追踪
