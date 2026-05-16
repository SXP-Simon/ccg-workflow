# CCG 通用阶段指导

> 本文件定义所有策略共享的阶段执行规范。策略文件可通过 Read 引用。

## 1. 阶段状态自检

每完成一个阶段，回顾对应的 `[phase-state:N]` 块：
1. 确认该阶段的 Gate 条件已满足
2. 输出 `📍 Next: [具体动作]` 告知用户下一步
3. 如有 `[required]` 标记的阶段未完成，不可跳过

## 2. Gate Check 执行规范

Gate 是阶段间的硬性检查点。执行方式：

- **数据 Gate**：检查前序阶段是否产出了必要数据（分析结果？计划文件？）
- **确认 Gate（HARD STOP）**：必须等待用户明确确认才能继续
- **质量 Gate**：检查产出物是否达到最低质量标准

Gate 失败时：说明缺失什么，给出补救建议，不可绕过。

## 3. Next-Action 格式

每个阶段完成后输出：

```
📍 Next: [一句话描述下一步具体动作]
```

示例：
- `📍 Next: 加载模型路由器，启动双模型并行分析`
- `📍 Next: 请确认以上修复方案是否正确`
- `📍 Next: 运行测试验证修复效果`

## 4. 策略升级规则

执行中发现复杂度超出当前策略能力时：

1. 明确告知用户：`当前策略为 [名称]，但发现 [原因]，建议升级到 [目标策略]`
2. 等待用户确认
3. 确认后：`Read ~/.claude/.ccg/engine/strategies/[target].md`
4. 从新策略的 Phase 1 开始（已完成的分析工作可复用）

**只能升级，不能降级**（除非用户明确要求）。

## 5. 错误恢复

| 场景 | 处理方式 |
|------|---------|
| 外部模型调用失败 | 按模型路由器重试规则处理 |
| 测试失败 | 分析失败原因，修复后重新运行 |
| 用户要求中止 | 立即停止，报告已完成的工作 |
| 意外文件冲突 | 报告冲突，等待用户决策 |

## 6. Team Dispatch 协议

当策略需要并行实施时，使用 Agent Teams：

### 前置条件
- 任务已拆分为文件级子任务（互不重叠）
- plan.md 已审批

### 标准流程
```
1. TeamCreate({ team_name: "{task-id}-team" })
2. 同一消息内并行 spawn 所有 Layer 1 Builder
3. 等待完成 → spawn Layer 2（如有）
4. spawn Reviewer 快检
5. Critical → spawn fix-dev（最多 2 轮）
6. shutdown 所有 teammates
```

### Builder Prompt 必含项
- `## 工作目录` — 绝对路径
- `## 文件范围约束（⛔ 硬性规则）` — 只能改的文件列表
- `## 实施步骤` — 具体操作
- `## 验收标准` — 怎样算完成

### Spec 注入
PreToolUse Hook 自动为 Team member 注入：
- context.jsonl 中列出的 spec 文件
- requirements.md 和 plan.md 摘要
- research/ 目录下的研究成果

Builder 不需要在 prompt 中手动粘贴 spec — Hook 自动处理。

### 降级方案
TeamCreate 失败（Agent Teams 未启用）→ Claude 自己按计划顺序实施。

## 7. 输出规范

- 中文交流，技术术语保留英文
- 代码块标明语言
- 变更摘要用 git diff 格式
- 研究结果用表格对比
