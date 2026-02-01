# OpenSpec CLI 命令参考

## CCG 模板中使用的命令验证

### ✅ 已验证的命令

| 命令 | 用途 | 选项 | 状态 |
|------|------|------|------|
| `openspec --version` | 查看版本 | - | ✅ 正确 |
| `openspec list --json` | 列出变更（JSON格式） | `--json` | ✅ 正确 |
| `openspec status --change "<id>" --json` | 查看变更状态 | `--change <id>`, `--json` | ✅ 正确 |
| `openspec new change "<name>"` | 创建新变更 | - | ✅ 正确 |
| `npx @fission-ai/openspec --version` | 通过 npx 查看版本 | - | ✅ 正确 |
| `npx @fission-ai/openspec init --tools claude` | 初始化项目 | `--tools claude` | ✅ 正确 |

### 📋 命令使用位置

#### spec-init.md
- ✅ `npx @fission-ai/openspec --version`
- ✅ `openspec --version`
- ✅ `npx @fission-ai/openspec init --tools claude`

#### spec-research.md
- ✅ `openspec list --json`
- ✅ `openspec new change "<name>"`

#### spec-plan.md
- ✅ `openspec list --json`
- ✅ `openspec status --change "<change_id>" --json`

#### spec-impl.md
- ✅ `openspec list --json`
- ✅ `openspec status --change "<change_id>" --json`

#### spec-review.md
- ✅ `openspec list --json`
- ✅ `openspec status --change "<proposal_id>" --json`

### 🔍 OpenSpec CLI 完整命令列表

```
openspec
├── init [options] [path]              # 初始化项目
├── update [options] [path]            # 更新指令文件
├── list [options]                     # 列出变更/规格
│   ├── --specs                        # 列出规格
│   ├── --changes                      # 列出变更（默认）
│   ├── --sort <order>                 # 排序：recent/name
│   └── --json                         # JSON 输出
├── status [options]                   # 显示工件完成状态
│   ├── --change <id>                  # 变更名称
│   ├── --schema <name>                # 架构覆盖
│   └── --json                         # JSON 输出
├── new                                # 创建新项目
│   └── change [options] <name>        # 创建新变更
│       ├── --description <text>       # 描述
│       └── --schema <name>            # 工作流架构
├── show [options] [item-name]         # 显示变更/规格
├── archive [options] [change-name]    # 归档变更
├── validate [options] [item-name]     # 验证变更/规格
├── instructions [options] [artifact]  # 输出工件指令
├── view                               # 交互式仪表板
├── change                             # 管理变更提案
├── spec                               # 管理规格
├── schema                             # 管理工作流架构
├── templates [options]                # 显示模板路径
├── schemas [options]                  # 列出可用架构
├── config [options]                   # 查看/修改配置
├── feedback [options] <message>       # 提交反馈
└── completion                         # 管理 shell 补全
```

### ⚠️ 常见错误

1. ❌ `openspec new "<name>"` 
   - ✅ 正确：`openspec new change "<name>"`

2. ❌ `openspec new change "<name>" --json`
   - ✅ 正确：`openspec new change "<name>"` (不支持 --json)

3. ❌ `Skill(opsx:list)`
   - ✅ 正确：`openspec list --json` (通过 Bash 调用)

4. ❌ `/opsx:status <id>`
   - ✅ 正确：`openspec status --change "<id>" --json`

### 📝 注意事项

1. **命令名称**：CLI 命令是 `openspec`，不是 `opsx`
2. **斜杠命令**：`/opsx:xxx` 是 Claude 命令，内部调用 `openspec` CLI
3. **JSON 输出**：大多数查询命令支持 `--json` 选项
4. **创建命令**：`new change` 不支持 `--json` 选项

---

**验证日期**: 2026-02-01
**OpenSpec 版本**: 1.1.1
