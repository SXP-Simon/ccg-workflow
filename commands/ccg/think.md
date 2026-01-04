---
description: UltraThink 深度分析（双模型并行分析 + 综合见解）
---

# /ccg:think - 深度分析

## Usage
`/ccg:think <分析主题>`

## Context
- 分析主题: $ARGUMENTS
- 使用双模型进行多角度深度分析
- 适用于复杂架构决策、技术选型、问题探索

## 工作流程

### Phase 1: 上下文收集

1. 调用 `mcp__auggie-mcp__codebase-retrieval` 检索相关代码
2. 识别分析范围和关键组件
3. 列出已知约束和假设

### Phase 2: 并行深度分析

**同时启动（`run_in_background: true`）**：

#### Codex 分析（后端/系统视角）
```bash
codeagent-wrapper --backend codex - $PROJECT_DIR <<'EOF'
Deep analysis of: <分析主题>

Context:
<相关代码和架构信息>

## Analysis Framework

### 1. Problem Decomposition
- Break down the problem into sub-components
- Identify dependencies and relationships
- Map data flows and system boundaries

### 2. Technical Assessment
- Evaluate current implementation
- Identify technical debt and risks
- Assess scalability and performance implications

### 3. Solution Exploration
- Propose 2-3 alternative approaches
- Analyze trade-offs for each approach
- Consider long-term maintainability

### 4. Recommendations
- Rank solutions by feasibility and impact
- Identify quick wins vs strategic changes
- Highlight risks and mitigation strategies

OUTPUT: Structured analysis report with clear reasoning.
EOF
```

#### Gemini 分析（前端/用户视角）
```bash
codeagent-wrapper --backend gemini - $PROJECT_DIR <<'EOF'
Deep analysis of: <分析主题>

Context:
<相关代码和设计信息>

## Analysis Framework

### 1. User Impact Assessment
- How does this affect user experience?
- What are the user-facing implications?
- Identify accessibility considerations

### 2. Design System Evaluation
- Consistency with existing patterns
- Component reusability opportunities
- Visual and interaction design implications

### 3. Implementation Considerations
- Frontend architecture impact
- State management implications
- Performance and bundle size concerns

### 4. Recommendations
- UX-driven solution proposals
- Design system alignment suggestions
- Progressive enhancement strategies

OUTPUT: Structured analysis report with clear reasoning.
EOF
```

### Phase 3: UltraThink 综合

1. 收集双模型分析报告（使用 `TaskOutput`）
2. **交叉验证**：
   - 识别一致的观点（强信号）
   - 分析分歧点（需要权衡）
   - 发现互补的见解
3. **综合推理**：
   - 整合技术和用户视角
   - 形成统一的分析框架
   - 生成可行的建议

### Phase 4: 输出结论

生成结构化的分析报告，包含清晰的推理过程和可执行的建议。

## 输出格式

```
## 🧠 深度分析: <分析主题>

### Phase 1: 上下文
- 分析范围: <涉及的模块/文件>
- 关键约束: <已知限制>
- 假设前提: <假设列表>

### Phase 2: 双模型分析

#### Codex 视角（后端/系统）
**问题分解**:
<分解结果>

**技术评估**:
<评估结果>

**方案探索**:
| 方案 | 优点 | 缺点 | 可行性 |
|------|------|------|--------|
| A    | ...  | ...  | High   |
| B    | ...  | ...  | Medium |

#### Gemini 视角（前端/用户）
**用户影响**:
<影响分析>

**设计评估**:
<评估结果>

**实现考量**:
<考量点>

### Phase 3: 综合分析

#### 一致观点（强信号）
1. <双方都认同的点>
2. <双方都认同的点>

#### 分歧点（需权衡）
| 议题 | Codex 观点 | Gemini 观点 | 建议 |
|------|------------|-------------|------|
| ... | ... | ... | ... |

#### 互补见解
- Codex 补充: <技术深度>
- Gemini 补充: <用户视角>

### Phase 4: 结论与建议

#### 核心结论
<1-2 句话总结>

#### 推荐方案
**首选**: <方案描述>
- 理由: <为什么选择>
- 风险: <潜在风险>
- 缓解: <如何应对>

#### 行动计划
1. [ ] <短期行动>
2. [ ] <中期行动>
3. [ ] <长期行动>

#### 待确认事项
- <需要进一步调研的问题>
- <需要用户决策的事项>
```

## 适用场景

| 场景 | 示例 |
|------|------|
| 架构决策 | "评估微服务拆分方案" |
| 技术选型 | "比较 Redux vs Zustand" |
| 性能分析 | "分析页面加载慢的原因" |
| 重构评估 | "评估重构遗留模块的风险" |
| 问题探索 | "为什么用户流失率高" |

## 分析质量标准

- [ ] 问题被充分分解
- [ ] 多角度视角覆盖
- [ ] Trade-off 明确列出
- [ ] 结论有证据支撑
- [ ] 行动项可执行

## 关键原则

1. **不急于结论** - 充分收集和分析后再下结论
2. **多视角思考** - 技术 + 用户 + 业务
3. **量化权衡** - 尽可能用数据支撑判断
4. **可执行导向** - 分析结果要能指导行动
