# CCG - Claude + Codex + Gemini Multi-Model Collaboration

[![GitHub stars](https://img.shields.io/github/stars/fengshao1227/ccg-workflow?style=social)](https://github.com/fengshao1227/ccg-workflow)
[![NPM Downloads](https://img.shields.io/npm/dt/ccg-workflow?style=flat-square&color=blue)](https://www.npmjs.com/package/ccg-workflow)
[![npm version](https://img.shields.io/npm/v/ccg-workflow.svg)](https://www.npmjs.com/package/ccg-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[简体中文](./README.zh-CN.md) | English

## Sponsor

[302.AI](https://share.302.ai/oUDqQ6) — Pay-as-you-go enterprise AI resource hub with the latest AI models and APIs.

[n1n.ai](https://api.n1n.ai/register?channel=c_ivgzug0w) — One API Key to access 500+ AI models.

---

CCG is a workflow engine for Claude Code that orchestrates multiple AI models (Codex, Gemini, Claude) with hook-based state tracking, automatic strategy selection, and Agent Teams parallel execution.

## What's new in v3.0

v3.0 is a ground-up rewrite. One command replaces 29.

- `/ccg:go` — Describe what you want in plain language. The engine analyzes your intent, picks the right strategy, and executes it.
- **Hook engine** — Per-turn state injection keeps Claude on track even after context compaction. Session-start hooks inject full project context on every new session.
- **Task persistence** — Medium+ complexity tasks create `.ccg/tasks/` with persistent state. Phase gates enforce HARD STOP checkpoints.
- **Agent Teams** — Large tasks spawn parallel Builder teammates via TeamCreate. Each Builder gets isolated file ownership.
- **Quality gates** — `verify-security`, `verify-quality`, `verify-change` run as Skill invocations inside strategy verification phases.
- **Domain knowledge hooks** — When your message mentions security, caching, RAG, etc., the relevant knowledge file is auto-injected into context.

## Quick Start

```bash
npx ccg-workflow
```

Requires Node.js 20+ and Claude Code CLI. Codex CLI and Gemini CLI are optional (enable multi-model features).

The installer walks through 4 steps: API config, model routing, MCP tools, performance mode. New users get a streamlined 2-step flow with sensible defaults.

## How it works

```
You: /ccg:go add JWT authentication to this API

CCG Engine:
  1. Reads project context (git status, tech stack, file structure)
  2. Classifies: feature / L complexity / backend / high risk
  3. Selects strategy: full-collaborate
  4. Creates .ccg/tasks/add-jwt-auth/task.json
  5. Launches dual-model analysis (Codex + Gemini in parallel)
  6. Produces plan → HARD STOP for your approval
  7. Spawns Agent Teams Builders for parallel implementation
  8. Runs quality gates + dual-model cross-review
  9. Reports results

Every turn, a hook injects:
  <ccg-state>
  Task: add-jwt-auth (in_progress)
  Strategy: full-collaborate
  Phase: 4-implementation
  Next: Layer 1 Builders executing
  </ccg-state>
```

## Strategies

The engine picks a strategy based on task type and complexity:

| Strategy | When | External models | Teams |
|----------|------|-----------------|-------|
| direct-fix | Simple bug, single file | No | No |
| quick-implement | Small feature, clear scope | No | No |
| guided-develop | Medium feature, needs planning | Single model | No |
| full-collaborate | Complex feature, multi-module | Dual model parallel | Yes |
| debug-investigate | Complex bug, unknown cause | Dual model diagnosis | No |
| refactor-safely | Code restructuring | Dual model review | No |
| deep-research | Technical research, comparison | Dual model exploration | No |
| optimize-measure | Performance optimization | Optional | No |
| review-audit | Code review | Dual model cross-review | No |
| git-action | commit, rollback, branches | No | No |

Simple tasks run fast with no overhead. Complex tasks get the full engine.

## Commands

v3.0 default install: 13 commands. Legacy mode adds 18 more.

### Core

| Command | Description |
|---------|-------------|
| `/ccg:go` | Smart entry — describe what you want, engine handles the rest |

### Git

| Command | Description |
|---------|-------------|
| `/ccg:commit` | Smart conventional commit |
| `/ccg:rollback` | Interactive rollback |
| `/ccg:clean-branches` | Clean merged branches |
| `/ccg:worktree` | Worktree management |

### Project

| Command | Description |
|---------|-------------|
| `/ccg:init` | Initialize project CLAUDE.md |
| `/ccg:context` | Project context management |

### OpenSpec

| Command | Description |
|---------|-------------|
| `/ccg:spec-init` | Initialize OPSX environment |
| `/ccg:spec-research` | Requirements → constraints |
| `/ccg:spec-plan` | Constraints → zero-decision plan |
| `/ccg:spec-impl` | Execute plan + archive |
| `/ccg:spec-review` | Dual-model cross-review |

## Hook Engine

CCG installs 4 hooks into `~/.claude/settings.json`:

| Hook | Event | Purpose |
|------|-------|---------|
| workflow-state.js | UserPromptSubmit | Injects task state breadcrumb every turn |
| session-start.js | SessionStart | Injects full project context on session start/clear/compact |
| subagent-context.js | PreToolUse (Bash/Agent) | Injects spec + task context into codeagent-wrapper calls and Team member spawns |
| skill-router.js | UserPromptSubmit | Auto-injects domain knowledge when keywords detected |

Hooks are JavaScript, zero dependencies, silent on failure.

## Task System

Medium+ complexity tasks create a persistent task directory:

```
.ccg/tasks/add-jwt-auth/
├── task.json         # Status, strategy, current phase, gate
├── requirements.md   # Enhanced requirements (full-collaborate)
├── plan.md           # Approved implementation plan
├── context.jsonl     # Spec files for sub-agent injection
├── review.md         # Review results
└── research/         # Persisted research findings
```

The workflow-state hook reads `task.json` every turn and injects the current state. If context gets compacted, session-start re-injects the full task context. No state is lost.

## Spec System

Project-level coding standards in `.ccg/spec/`:

```
.ccg/spec/
├── backend/index.md    # Backend conventions
├── frontend/index.md   # Frontend conventions
└── guides/index.md     # Cross-module guidelines
```

The subagent-context hook reads `context.jsonl` and injects relevant spec files into every codeagent-wrapper call and Agent Team spawn. Sub-agents follow your project's standards without being told.

## Configuration

```
~/.claude/
├── commands/ccg/          # Slash commands
├── hooks/ccg/             # Hook scripts (4 files)
├── .ccg/
│   ├── config.toml        # Model routing, MCP, performance
│   ├── engine/            # Strategy files + model router
│   └── prompts/           # Expert prompts (codex/gemini/claude)
├── skills/ccg/            # Quality gates + domain knowledge
└── bin/codeagent-wrapper  # Multi-model execution bridge
```

### Environment Variables

Set in `~/.claude/settings.json` under `"env"`:

| Variable | Default | Description |
|----------|---------|-------------|
| `CODEX_TIMEOUT` | `7200` | Wrapper timeout (seconds) |
| `CODEAGENT_POST_MESSAGE_DELAY` | `5` | Post-completion delay (seconds) |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | unset | Set to `1` to enable Agent Teams parallel execution |

## Update / Uninstall

```bash
npx ccg-workflow@latest     # Update
npx ccg-workflow            # Select "Uninstall" from menu
```

## Credits

- [cexll/myclaude](https://github.com/cexll/myclaude) — codeagent-wrapper inspiration
- [UfoMiao/zcf](https://github.com/UfoMiao/zcf) — Git tools reference
- [mindfold-ai/Trellis](https://github.com/mindfold-ai/Trellis) — Hook-based workflow state patterns
- [ace-tool](https://linux.do/t/topic/1344562) — MCP code retrieval

## Contributors

<!-- readme: contributors -start -->
<table>
<tr>
    <td align="center"><a href="https://github.com/fengshao1227"><img src="https://avatars.githubusercontent.com/fengshao1227?v=4&s=100" width="100;" alt="fengshao1227"/><br /><sub><b>fengshao1227</b></sub></a></td>
    <td align="center"><a href="https://github.com/SXP-Simon"><img src="https://avatars.githubusercontent.com/SXP-Simon?v=4&s=100" width="100;" alt="SXP-Simon"/><br /><sub><b>SXP-Simon</b></sub></a></td>
    <td align="center"><a href="https://github.com/RebornQ"><img src="https://avatars.githubusercontent.com/RebornQ?v=4&s=100" width="100;" alt="RebornQ"/><br /><sub><b>RebornQ</b></sub></a></td>
    <td align="center"><a href="https://github.com/Sakuranda"><img src="https://avatars.githubusercontent.com/Sakuranda?v=4&s=100" width="100;" alt="Sakuranda"/><br /><sub><b>Sakuranda</b></sub></a></td>
    <td align="center"><a href="https://github.com/Mriris"><img src="https://avatars.githubusercontent.com/Mriris?v=4&s=100" width="100;" alt="Mriris"/><br /><sub><b>Mriris</b></sub></a></td>
    <td align="center"><a href="https://github.com/23q3"><img src="https://avatars.githubusercontent.com/23q3?v=4&s=100" width="100;" alt="23q3"/><br /><sub><b>23q3</b></sub></a></td>
    <td align="center"><a href="https://github.com/MrNine-666"><img src="https://avatars.githubusercontent.com/MrNine-666?v=4&s=100" width="100;" alt="MrNine-666"/><br /><sub><b>MrNine-666</b></sub></a></td>
</tr>
<tr>
    <td align="center"><a href="https://github.com/GGzili"><img src="https://avatars.githubusercontent.com/GGzili?v=4&s=100" width="100;" alt="GGzili"/><br /><sub><b>GGzili</b></sub></a></td>
</tr>
</table>
<!-- readme: contributors -end -->

## Contact

- **X (Twitter)**: [@CCG_Workflow](https://x.com/CCG_Workflow)
- **Email**: [fengshao1227@gmail.com](mailto:fengshao1227@gmail.com)
- **Issues**: [GitHub Issues](https://github.com/fengshao1227/ccg-workflow/issues)
- **Community**: [Linux.do](https://linux.do)

## License

MIT

---

v3.0.0 | [Issues](https://github.com/fengshao1227/ccg-workflow/issues) | [Contributing](./CONTRIBUTING.md)
