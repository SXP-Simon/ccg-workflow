# Command Reference

CCG provides 28 slash commands covering the full development lifecycle. All commands are accessed via `/ccg:*`.

## Development Workflow

| Command | Description | Model |
|---------|-------------|-------|
| `/ccg:workflow` | Full 6-phase workflow (research → ideate → plan → execute → optimize → review) | Codex + Gemini |
| `/ccg:plan` | Multi-model collaborative planning (Phase 1-2) | Codex + Gemini |
| `/ccg:execute` | Multi-model collaborative execution (Phase 3-5) | Codex + Gemini + Claude |
| `/ccg:codex-exec` | Codex full execution (plan → code → review) | Codex + multi-model review |
| `/ccg:feat` | Smart feature development | Auto-routed |
| `/ccg:frontend` | Frontend tasks (fast mode) | Gemini |
| `/ccg:backend` | Backend tasks (fast mode) | Codex |

### Usage Examples

```bash
# Full workflow
/ccg:workflow implement user authentication

# Planning only (no execution)
/ccg:plan implement user authentication

# Frontend fast mode
/ccg:frontend optimize login page responsive layout
```

## Analysis & Quality

| Command | Description | Model |
|---------|-------------|-------|
| `/ccg:analyze` | Technical analysis | Codex + Gemini |
| `/ccg:debug` | Problem diagnosis + fix | Codex + Gemini |
| `/ccg:optimize` | Performance optimization | Codex + Gemini |
| `/ccg:test` | Test generation | Auto-routed |
| `/ccg:review` | Code review (auto git diff) | Codex + Gemini |
| `/ccg:enhance` | Prompt enhancement | Built-in |

### Usage Examples

```bash
# No args — auto-review recent changes
/ccg:review

# Analyze a specific module
/ccg:analyze src/auth/ security

# Generate tests
/ccg:test src/utils/validator.ts
```

## OPSX Spec-Driven

Integrates [OPSX](https://github.com/fission-ai/opsx) architecture to turn requirements into constraints.

| Command | Description |
|---------|-------------|
| `/ccg:spec-init` | Initialize OPSX environment |
| `/ccg:spec-research` | Requirements → Constraints |
| `/ccg:spec-plan` | Constraints → Zero-decision plan |
| `/ccg:spec-impl` | Execute plan + archive |
| `/ccg:spec-review` | Dual-model cross-review |

### Usage Examples

```bash
/ccg:spec-init
/ccg:spec-research implement user auth
/ccg:spec-plan
/ccg:spec-impl
/ccg:spec-review
```

::: tip
You can `/clear` between phases — state is persisted in the `openspec/` directory.
:::

## Agent Teams (v1.7.60+)

Leverage Claude Code Agent Teams to spawn multiple Builder teammates for parallel coding.

| Command | Description |
|---------|-------------|
| `/ccg:team-research` | Requirements → constraints (parallel exploration) |
| `/ccg:team-plan` | Constraints → parallel implementation plan |
| `/ccg:team-exec` | Spawn Builder teammates for parallel coding |
| `/ccg:team-review` | Dual-model cross-review |

::: warning Prerequisite
Enable Agent Teams in `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
:::

### Usage Examples

```bash
/ccg:team-research implement kanban API
# /clear
/ccg:team-plan kanban-api
# /clear
/ccg:team-exec
# /clear
/ccg:team-review
```

## Git Tools

| Command | Description |
|---------|-------------|
| `/ccg:commit` | Smart commit (conventional commit format) |
| `/ccg:rollback` | Interactive rollback |
| `/ccg:clean-branches` | Clean merged branches |
| `/ccg:worktree` | Worktree management |

### Usage Examples

```bash
# Smart commit (auto-analyze diff)
/ccg:commit

# Interactive rollback
/ccg:rollback

# Clean merged branches (dry-run by default)
/ccg:clean-branches
```

## Project Setup

| Command | Description |
|---------|-------------|
| `/ccg:init` | Initialize project CLAUDE.md |
| `/ccg:context` | Project context management (.context/ init, log, compress, history) |

### Usage Examples

```bash
# Initialize project AI context
/ccg:init

# Initialize .context directory
/ccg:context init

# Log a decision
/ccg:context log "Chose PostgreSQL for JSONB support"

# View context history
/ccg:context history
```
