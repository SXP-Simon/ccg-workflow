# 配置说明

## 目录结构

CCG 安装后的文件布局：

```
~/.claude/
├── commands/ccg/       # 28 个斜杠命令
├── agents/ccg/         # 4 个子智能体
├── skills/ccg/         # 质量关卡 + 多 Agent 协同
├── bin/codeagent-wrapper
└── .ccg/
    ├── config.toml     # CCG 配置
    └── prompts/
        ├── codex/      # 6 个 Codex 专家提示词
        └── gemini/     # 7 个 Gemini 专家提示词
```

## 环境变量

在 `~/.claude/settings.json` 的 `"env"` 中配置：

| 变量 | 说明 | 默认值 | 何时修改 |
|------|------|--------|----------|
| `CODEAGENT_POST_MESSAGE_DELAY` | Codex 完成后等待时间（秒） | `5` | Codex 进程挂起时设为 `1` |
| `CODEX_TIMEOUT` | wrapper 执行超时（秒） | `7200` | 超长任务时增大 |
| `BASH_DEFAULT_TIMEOUT_MS` | Claude Code Bash 超时（毫秒） | `120000` | 命令超时时增大 |
| `BASH_MAX_TIMEOUT_MS` | Claude Code Bash 最大超时（毫秒） | `600000` | 长时间构建时增大 |

::: details settings.json 示例

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

## 固定配置

v1.7.0 起，以下配置不再支持自定义：

| 项目 | 固定值 | 原因 |
|------|--------|------|
| 前端模型 | Gemini | 擅长 UI/CSS/组件 |
| 后端模型 | Codex | 擅长逻辑/算法/调试 |
| 协作模式 | smart | 最佳实践 |
| 命令数量 | 28 个 | 全部安装 |

## 实用工具

```bash
npx ccg-workflow menu  # 选择「实用工具」
```

- **ccusage** — Claude Code 用量分析
- **CCometixLine** — 状态栏工具（Git + 用量跟踪）

## 常见问题

### Codex CLI 0.80.0 进程不退出

`--json` 模式下 Codex 完成输出后进程不会自动退出。

**解决**：将 `CODEAGENT_POST_MESSAGE_DELAY` 设为 `1`。

### Node 18 报 SyntaxError

CCG 依赖 `ora@9.x`，要求 Node >= 20。

**解决**：升级到 Node 20+。

### MCP 工具不生效

**解决**：运行 `npx ccg-workflow diagnose-mcp` 检查配置。

### Agent Teams 命令不可用

**解决**：在 `settings.json` 中添加：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
