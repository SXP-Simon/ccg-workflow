# Getting Started

## What is CCG

In short: **Claude Code directs Codex and Gemini to write code for you.**

```
Claude Code (Director)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(Backend) (Frontend)
   │       │
   └───┬───┘
       ↓
  Unified Patch → Claude reviews → Written to files
```

You describe what you want. CCG figures out who should handle it. The result goes through Claude's review before touching any file. Codex and Gemini never write directly to your codebase.

## What you need

- **Node.js 20+** — Below 20 will break (`ora@9.x` requires it)
- **Claude Code CLI** — Nothing works without this
- **jq** — For the auto-authorization hook
- **Codex CLI** — Optional. Enables backend routing
- **Gemini CLI** — Optional. Enables frontend routing

## Install

```bash
npx ccg-workflow
```

First run asks you to pick a language. After that, it remembers.

### Installing jq

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

### Installing Claude Code

```bash
npx ccg-workflow menu  # Look for "Install Claude Code"
```

Works with npm, homebrew, curl, powershell, and cmd.

## Try it out

After installing, type this in Claude Code:

```
/ccg:frontend add a dark mode toggle to the login page
```

If you see Gemini being called, you're good.

## Updating and uninstalling

```bash
# Update
npx ccg-workflow@latest

# Uninstall
npx ccg-workflow  # Select "Uninstall"
```

## What's next

- [Command Reference](/en/guide/commands) — All 28 commands
- [Workflow Guide](/en/guide/workflows) — Which workflow for which scenario
- [MCP Configuration](/en/guide/mcp) — Smarter code search
