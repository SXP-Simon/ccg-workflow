# Strategy: Refactor Safely — 安全重构

> 适用于代码重构，强调增量执行和测试保护。

## 适用条件
- 复杂度 M 或以上
- 重构、整理、提取、简化类任务
- 需要保证行为不变

## 前置加载（L/XL 复杂度时）

```
Read("~/.claude/.ccg/engine/model-router.md")
```

---

## 工作流状态机

[phase-state:1-understand]
当前阶段：理解现有代码
📍 Next: 映射完依赖关系后建立测试基线
[/phase-state:1-understand]

[phase-state:2-baseline]
当前阶段：建立基线
Gate: 代码已理解 ✓
📍 Next: 基线建立后进入规划
[/phase-state:2-baseline]

[phase-state:3-plan]
当前阶段：规划重构步骤
Gate: 测试基线已建立 ✓
📍 Next: 计划确认后逐步执行
[/phase-state:3-plan]

[phase-state:4-execute]
当前阶段：增量执行
Gate: 用户已确认计划 ✓
📍 Next: 每步执行后验证测试通过
[/phase-state:4-execute]

[phase-state:5-verify]
当前阶段：最终验证
Gate: 所有步骤已执行 ✓
📍 Next: 全部测试通过后报告结果
[/phase-state:5-verify]

---

## 阶段详情

### Phase 1: 理解 [required]

**Task 更新**：`currentPhase → "1-understand"`, `nextAction → "读取代码，映射依赖"`

1. 读取所有涉及重构的文件
2. 映射依赖关系（谁调用了这些代码？谁被这些代码调用？）
3. 识别公共 API / 接口边界（这些不能轻易改变）
4. 记录当前行为特征

### Phase 2: 建立基线 [required]

1. 运行现有测试：`pnpm test` / `go test` / `pytest` 等
2. 记录测试结果作为基线
3. 如果没有相关测试 → 告知用户，建议但不强制先补测试
4. 输出基线状态：
   ```
   📊 测试基线
     通过: [N] 个
     失败: [M] 个（已有的，非重构引入）
     覆盖: [相关模块的测试覆盖情况]
   ```

### Phase 3: 规划

制定增量重构计划，每一步应该能独立通过测试：

```
📋 重构计划

## 目标
[重构目标和预期效果]

## 步骤（每步独立可验证）
1. [步骤描述] — 影响文件: [...]
2. [步骤描述] — 影响文件: [...]
...

## 不变量
- [不应该改变的行为/接口]
```

对于 L/XL 任务，可选调用外部模型做架构审查。

展示计划，等待用户确认。

### Phase 4: 增量执行

**Task 更新**：`currentPhase → "4-execute"`, `nextAction → "逐步执行重构"`

**逐步执行**，每步之后：
1. 应用变更
2. 运行测试
3. 如果测试通过 → 继续下一步
4. 如果测试失败 → **立即停止**，分析原因，修复或回退

每步报告：
```
Step [N/M]: [描述] — ✅ 测试通过 / ❌ 测试失败
```

### Phase 5: 最终验证 + 双模型审查 + 质量关卡

1. 运行完整测试套件
2. 对比基线：确保不引入新的失败

**⛔ 双模型交叉审查（必须执行，使用 model-router.md 调用模板）：**

3. 获取变更：`git diff` 全量输出
4. 并行调用双模型审查（`run_in_background: true`）：
   - backend 模型 + reviewer 角色 — 关注安全、性能、错误处理、行为一致性
   - frontend 模型 + reviewer 角色 — 关注可访问性、设计一致性（如涉及前端）
5. 等待双模型结果，综合审查意见

**⛔ 质量关卡（必须逐个调用 Skill，不可跳过，不可用自己的判断替代）：**

6. 调用 Skill `verify-quality` — 等待报告
7. 调用 Skill `verify-security` — 等待报告
8. 调用 Skill `verify-change` — 等待报告

**综合报告**：双模型审查 + 质量关卡，按严重度分级：
- Critical → 必须修复后重新验证
- Warning → 建议修复
- Info → 供参考

9. `git diff` 展示全部变更
5. 输出结果：
   ```
   ✅ 重构完成
     步骤: [N] 步全部通过
     变更: [文件数] 文件，[行数] 行
     测试: 基线 [N] 通过 → 重构后 [N] 通过
     质量: [Critical: N, Warning: N, Info: N]
     📍 Next: /ccg:commit 提交
   ```

**Task 更新**：`status → "completed"`, `nextAction → "可用 /ccg:commit 提交"`

---

## 铁律

- **不可一次性大改** — 必须拆分为增量步骤
- **每步必须验证测试** — 测试失败立即停止
- **保持行为不变** — 除非重构目标明确包含行为变更
- **不扩大范围** — 只重构用户指定的范围
