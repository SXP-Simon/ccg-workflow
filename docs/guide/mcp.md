# MCP 配置

MCP（Model Context Protocol）工具可以增强 Claude Code 的代码检索和搜索能力。CCG 支持多个 MCP 提供者。

## 配置方式

```bash
npx ccg-workflow menu  # 选择「配置 MCP」
```

## 代码检索（多选一）

### ace-tool（推荐）

基于 Augment Code 的代码搜索服务，通过 `search_context` 提供语义检索。

- **优势**：搜索质量高、上下文理解好
- **注意**：需要 Augment Code 账号或第三方中转
- [官方](https://augmentcode.com/) | [第三方中转](https://acemcp.heroman.wtf/)

### fast-context（推荐）

基于 Windsurf Fast Context 的 AI 驱动代码搜索，无需全量索引。

- **优势**：无需索引、搜索速度快
- **注意**：需要 Windsurf 账号
- 支持可选 API Key 和 `FC_INCLUDE_SNIPPETS` 模式

### ContextWeaver（备选）

本地混合搜索引擎，结合 Embedding + Rerank。

- **优势**：完全本地运行、可离线使用
- **注意**：需要硅基流动 API Key（免费）

## 辅助工具（可选）

| 工具 | 说明 | 需要 API Key |
|------|------|-------------|
| **Context7** | 获取最新库文档 | 否（自动安装） |
| **Playwright** | 浏览器自动化 / 测试 | 否 |
| **DeepWiki** | 知识库查询 | 否 |
| **Exa** | 搜索引擎 | 是 |

## MCP 同步

CCG 会自动将 MCP 配置同步到 Codex 和 Gemini：

- **Codex 同步**：`~/.codex/config.toml` — 执行 `/ccg:codex-exec` 时 Codex 可直接使用 MCP 搜索
- **Gemini 同步**：`~/.gemini/settings.json` — Gemini 可使用相同的 MCP 工具

同步的 MCP 服务器 ID：`grok-search`、`context7`、`ace-tool`、`contextweaver`、`fast-context`

## 自动授权 Hook

CCG 安装时自动写入 Hook，授权 `codeagent-wrapper` 命令（需要 [jq](https://jqlang.github.io/jq/)）。

::: details 手动配置（v1.7.71 之前的版本）

在 `~/.claude/settings.json` 中添加：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' 2>/dev/null | grep -q 'codeagent-wrapper' && echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PreToolUse\", \"permissionDecision\": \"allow\", \"permissionDecisionReason\": \"codeagent-wrapper auto-approved\"}}' || true",
            "timeout": 1
          }
        ]
      }
    ]
  }
}
```
:::

## 诊断

如果 MCP 工具不工作，运行诊断命令：

```bash
npx ccg-workflow diagnose-mcp
```
