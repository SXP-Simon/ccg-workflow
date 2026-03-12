# Configuration

## Directory Structure

CCG installation layout:

```
~/.claude/
├── commands/ccg/       # 28 slash commands
├── agents/ccg/         # 4 sub-agents
├── skills/ccg/         # Quality gates + multi-agent orchestration
├── bin/codeagent-wrapper
└── .ccg/
    ├── config.toml     # CCG configuration
    └── prompts/
        ├── codex/      # 6 Codex expert prompts
        └── gemini/     # 7 Gemini expert prompts
```

## Environment Variables

Configure in `~/.claude/settings.json` under `"env"`:

| Variable | Description | Default | When to change |
|----------|-------------|---------|----------------|
| `CODEAGENT_POST_MESSAGE_DELAY` | Wait after Codex completion (sec) | `5` | Set to `1` if Codex process hangs |
| `CODEX_TIMEOUT` | Wrapper execution timeout (sec) | `7200` | Increase for very long tasks |
| `BASH_DEFAULT_TIMEOUT_MS` | Claude Code Bash timeout (ms) | `120000` | Increase if commands time out |
| `BASH_MAX_TIMEOUT_MS` | Claude Code Bash max timeout (ms) | `600000` | Increase for long builds |

::: details Example settings.json

```json
{
  "env": {
    "CODEAGENT_POST_MESSAGE_DELAY": "1",
    "CODEX_TIMEOUT": "7200",
    "BASH_DEFAULT_TIMEOUT_MS": "600000",
    "BASH_MAX_TIMEOUT_MS": "3600000"
  }
}
```
:::

## Fixed Configuration

Since v1.7.0, the following are no longer customizable:

| Setting | Fixed Value | Reason |
|---------|------------|--------|
| Frontend model | Gemini | Best at UI/CSS/components |
| Backend model | Codex | Best at logic/algorithms/debugging |
| Collaboration mode | smart | Best practice |
| Command count | 28 | All installed |

## Utilities

```bash
npx ccg-workflow menu  # Select "Tools"
```

- **ccusage** — Claude Code usage analytics
- **CCometixLine** — Status bar tool (Git + usage tracking)

## FAQ

### Codex CLI 0.80.0 process does not exit

In `--json` mode, Codex does not automatically exit after output completion.

**Fix**: Set `CODEAGENT_POST_MESSAGE_DELAY=1`.

### Node 18 throws SyntaxError

CCG depends on `ora@9.x`, which requires Node >= 20.

**Fix**: Upgrade to Node 20+.

### MCP tools not working

**Fix**: Run `npx ccg-workflow diagnose-mcp` to check configuration.

### Agent Teams commands unavailable

**Fix**: Add to `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
