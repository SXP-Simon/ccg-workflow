# Getting Started

## Architecture

```
Claude Code (Orchestrator)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(Backend) (Frontend)
   │       │
   └───┬───┘
       ↓
  Unified Patch
```

External models have no write access — they only return patches, which Claude reviews before applying.

## Prerequisites

| Dependency | Required | Notes |
|------------|----------|-------|
| **Node.js 20+** | Yes | `ora@9.x` requires Node >= 20 |
| **Claude Code CLI** | Yes | [Install guide](#install-claude-code) |
| **jq** | Yes | Used for auto-authorization hook |
| **Codex CLI** | No | Enables backend routing |
| **Gemini CLI** | No | Enables frontend routing |

## Installation

```bash
npx ccg-workflow
```

On first run, CCG prompts you to select a language (English / Chinese). This preference is saved for all future sessions.

### Install jq

::: code-group

```bash [macOS]
brew install jq
```

```bash [Debian / Ubuntu]
sudo apt install jq
```

```bash [RHEL / CentOS]
sudo yum install jq
```

```bash [Windows]
choco install jq
# or
scoop install jq
```

:::

### Install Claude Code

```bash
npx ccg-workflow menu  # Select "Install Claude Code"
```

Supports: npm, homebrew, curl, powershell, cmd.

## Verify Installation

After installation, type in Claude Code:

```
/ccg:workflow hello
```

If you see multi-model collaboration output, the installation is successful.

## Update

```bash
# npx users
npx ccg-workflow@latest

# npm global users
npm install -g ccg-workflow@latest
```

## Uninstall

```bash
npx ccg-workflow  # Select "Uninstall"

# npm global users need this extra step
npm uninstall -g ccg-workflow
```

## Next Steps

- [Command Reference](/en/guide/commands) — See all 28 commands
- [Workflow Guide](/en/guide/workflows) — Learn the three main workflows
- [MCP Configuration](/en/guide/mcp) — Enhance code retrieval
