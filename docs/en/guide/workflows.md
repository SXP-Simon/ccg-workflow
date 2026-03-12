# Workflow Guide

CCG provides three main workflows for different scenarios.

## Planning & Execution Separation

The most basic workflow: plan first, execute later, with human review in between.

```bash
# 1. Generate implementation plan
/ccg:plan implement user authentication

# 2. Review the plan (editable)
# Plan saved to .claude/plan/user-auth.md

# 3a. Execute (Claude refactors) — fine-grained control
/ccg:execute .claude/plan/user-auth.md

# 3b. Execute (Codex does everything) — efficient, low Claude token usage
/ccg:codex-exec .claude/plan/user-auth.md
```

### execute vs codex-exec

| Dimension | `/ccg:execute` | `/ccg:codex-exec` |
|-----------|---------------|-------------------|
| Executor | Claude-led + Codex/Gemini assist | Codex handles everything |
| Token cost | Higher (Claude processes each step) | Very low (Claude only reviews) |
| Best for | Complex tasks needing fine control | Clear, independently executable tasks |
| MCP search | Claude executes | Codex executes (needs MCP sync) |

## OPSX Spec-Driven Workflow

Integrates [OPSX](https://github.com/fission-ai/opsx) to turn requirements into constraints. Best for scenarios needing **strict control**.

```bash
/ccg:spec-init                          # Initialize OPSX environment
/ccg:spec-research implement user auth  # Research → constraints
/ccg:spec-plan                          # Parallel analysis → zero-decision plan
/ccg:spec-impl                          # Execute the plan
/ccg:spec-review                        # Independent review (anytime)
```

### Key Features

- **Constraint-driven**: Requirements become verifiable constraints, not vague descriptions
- **Zero-decision plan**: Execution requires no decisions — all decisions made during planning
- **Persistent state**: State stored in `openspec/` directory, `/clear` between phases to free context

::: tip
`/ccg:spec-*` commands internally call `/opsx:*`. If using OPSX directly, use `/opsx:*` commands.
:::

## Agent Teams Parallel Workflow

Leverage Claude Code Agent Teams to spawn multiple Builder teammates for parallel coding. Best for tasks **decomposable into 3+ independent modules**.

```bash
/ccg:team-research implement kanban API  # 1. Requirements → constraints
# /clear
/ccg:team-plan kanban-api               # 2. Plan → parallel tasks
# /clear
/ccg:team-exec                          # 3. Builders code in parallel
# /clear
/ccg:team-review                        # 4. Dual-model cross-review
```

### vs Traditional Workflow

| Dimension | Traditional | Agent Teams |
|-----------|------------|-------------|
| Context | Continuous conversation | `/clear` between steps |
| State passing | Conversation context | Files (.claude/plan/) |
| Parallelism | Sequential | Multiple Builders in parallel |
| Best for | General tasks | 3+ independent modules |

### Workflow Diagram

```
team-research          team-plan           team-exec          team-review
     │                    │                    │                   │
  Analyze             Plan & split       Builder 1 ──┐       Codex review
     │                    │              Builder 2 ──┤            │
  Constraints          Parallel plan     Builder 3 ──┘       Gemini review
     │                    │                    │                   │
     ↓                    ↓                    ↓                   ↓
  constraints.md    plan/*.md           Code output        Review report
```

## Full 6-Phase Workflow

`/ccg:workflow` is the most complete workflow with 6 phases:

1. **Research** — Analyze requirements, understand context
2. **Ideate** — Propose solutions
3. **Plan** — Create implementation plan (Codex + Gemini parallel analysis)
4. **Execute** — Implement the plan (model routing: frontend → Gemini, backend → Codex)
5. **Optimize** — Performance optimization and code quality
6. **Review** — Multi-model cross-review

```bash
/ccg:workflow implement a complete user auth system with registration, login, and JWT tokens
```

::: info
For large tasks, consider using `/ccg:plan` + `/ccg:execute` for step-by-step execution with plan review in between.
:::

## Workflow Selection Guide

```
Receive task
  │
  ├─ Simple / clear? ──────────→ /ccg:frontend or /ccg:backend
  │
  ├─ Needs planning? ──────────→ /ccg:plan + /ccg:execute
  │
  ├─ Needs strict constraints? ─→ /ccg:spec-* series
  │
  ├─ Decomposable into 3+ modules? → /ccg:team-* series
  │
  └─ Full end-to-end? ─────────→ /ccg:workflow
```
