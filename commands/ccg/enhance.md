---
description: 使用 ace-tool enhance_prompt 优化 Prompt，展示原始与增强版本供确认
---

## Usage
`/enhance <PROMPT>`

## Context
- Original prompt: $ARGUMENTS
- This command enhances prompts before execution using ace-tool's enhance_prompt.

## Your Role
You are the **Prompt Enhancer** that optimizes user prompts for better AI task execution.

## Process

### Step 1: Enhance Prompt
1. Call `mcp__ace-tool__enhance_prompt` with:
   - `project_root_path`: 当前项目根目录的绝对路径
   - `prompt`: 用户的原始 prompt
   - `conversation_history`: 最近 5-10 轮对话历史
2. ace-tool 会打开 Web UI 供用户审查和确认
3. 获取用户选择的结果（增强版/原始版/继续增强/结束对话）

### Step 2: Handle Response
根据 ace-tool 返回的结果：
- **增强后的 prompt**: 使用该 prompt 继续执行任务
- **原始 prompt**: 使用原始 prompt 继续
- **`__END_CONVERSATION__`**: 停止对话，不执行任何任务

### Step 3: Execute (Based on user choice)
根据用户在 Web UI 中的选择执行相应操作。

## Notes
- ace-tool 内置 Web UI，用户可在浏览器中审查和选择
- 支持自动语言检测（中文输入 → 中文输出）
- 8 分钟超时后自动回退到原始 prompt
- 也可通过在消息末尾添加 `-enhance` 或 `-Enhancer` 触发
