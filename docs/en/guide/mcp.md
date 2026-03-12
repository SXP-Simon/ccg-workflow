# MCP Configuration

MCP (Model Context Protocol) tools enhance Claude Code's code retrieval and search capabilities. CCG supports multiple MCP providers.

## Setup

```bash
npx ccg-workflow menu  # Select "Configure MCP"
```

## Code Retrieval (choose one)

### ace-tool (Recommended)

Code search service based on Augment Code, providing semantic retrieval via `search_context`.

- **Pros**: High search quality, good context understanding
- **Note**: Requires Augment Code account or third-party proxy
- [Official](https://augmentcode.com/) | [Third-party proxy](https://acemcp.heroman.wtf/)

### fast-context (Recommended)

AI-powered code search based on Windsurf Fast Context, no full-repo indexing required.

- **Pros**: No indexing needed, fast search
- **Note**: Requires Windsurf account
- Supports optional API Key and `FC_INCLUDE_SNIPPETS` mode

### ContextWeaver (Alternative)

Local hybrid search engine combining Embedding + Rerank.

- **Pros**: Fully local, works offline
- **Note**: Requires SiliconFlow API Key (free)

## Optional Tools

| Tool | Description | Requires API Key |
|------|-------------|-----------------|
| **Context7** | Latest library documentation | No (auto-installed) |
| **Playwright** | Browser automation / testing | No |
| **DeepWiki** | Knowledge base queries | No |
| **Exa** | Search engine | Yes |

## MCP Sync

CCG automatically syncs MCP configuration to Codex and Gemini:

- **Codex sync**: `~/.codex/config.toml` — Codex can use MCP search when running `/ccg:codex-exec`
- **Gemini sync**: `~/.gemini/settings.json` — Gemini can use the same MCP tools

Synced MCP server IDs: `grok-search`, `context7`, `ace-tool`, `contextweaver`, `fast-context`

## Auto-Authorization Hook

CCG automatically installs a Hook to authorize `codeagent-wrapper` commands (requires [jq](https://jqlang.github.io/jq/)).

::: details Manual setup (for versions before v1.7.71)

Add to `~/.claude/settings.json`:

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

## Diagnostics

If MCP tools aren't working, run the diagnostic command:

```bash
npx ccg-workflow diagnose-mcp
```
