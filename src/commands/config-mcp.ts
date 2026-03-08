import ansis from 'ansis'
import inquirer from 'inquirer'
import { i18n } from '../i18n'
import { installAceTool, installAceToolRs, installContextWeaver, installMcpServer, uninstallAceTool, uninstallContextWeaver, uninstallMcpServer } from '../utils/installer'

/**
 * Configure MCP tools after installation
 */
export async function configMcp(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  配置 MCP 工具`))
  console.log()

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: '选择操作',
    choices: [
      { name: `${ansis.green('➜')} 代码检索 MCP ${ansis.gray('(ContextWeaver / ace-tool)')}`, value: 'code-retrieval' },
      { name: `${ansis.blue('➜')} 辅助工具 MCP ${ansis.gray('(context7 / Playwright / exa...)')}`, value: 'auxiliary' },
      { name: `${ansis.red('✕')} 卸载 MCP`, value: 'uninstall' },
      new inquirer.Separator(),
      { name: `${ansis.gray('返回')}`, value: 'cancel' },
    ],
  }])

  if (action === 'cancel')
    return

  if (action === 'code-retrieval') {
    await handleCodeRetrieval()
  }
  else if (action === 'auxiliary') {
    await handleAuxiliary()
  }
  else if (action === 'uninstall') {
    await handleUninstall()
  }
}

async function handleCodeRetrieval(): Promise<void> {
  console.log()

  const { tool } = await inquirer.prompt([{
    type: 'list',
    name: 'tool',
    message: '选择代码检索工具',
    choices: [
      { name: `ace-tool ${ansis.green('(推荐)')} ${ansis.gray('- 代码检索（enhance_prompt 已不可用）')}`, value: 'ace-tool' },
      { name: `ace-tool-rs ${ansis.green('(推荐)')} ${ansis.gray('- Rust 版本')}`, value: 'ace-tool-rs' },
      { name: `ContextWeaver ${ansis.gray('- 本地混合搜索（需硅基流动 API Key）')}`, value: 'contextweaver' },
      new inquirer.Separator(),
      { name: `${ansis.gray('返回')}`, value: 'cancel' },
    ],
  }])

  if (tool === 'cancel')
    return

  if (tool === 'contextweaver') {
    await handleInstallContextWeaver()
  }
  else {
    await handleInstallAceTool(tool === 'ace-tool-rs')
  }
}

async function handleInstallAceTool(isRs: boolean): Promise<void> {
  const toolName = isRs ? 'ace-tool-rs' : 'ace-tool'

  console.log()
  console.log(ansis.cyan(`📖 获取 ${toolName} 访问方式：`))
  console.log(`   ${ansis.gray('•')} ${ansis.cyan('官方服务')}: ${ansis.underline('https://augmentcode.com/')}`)
  console.log(`   ${ansis.gray('•')} ${ansis.cyan('第三方中转')} ${ansis.green('(推荐)')}: ${ansis.underline('https://acemcp.heroman.wtf/')}`)
  console.log(`   ${ansis.gray('⚠')} ${ansis.yellow('注意')}: enhance_prompt 已不可用，search_context 代码检索正常`)
  console.log()

  const answers = await inquirer.prompt([
    { type: 'input', name: 'baseUrl', message: `Base URL ${ansis.gray('(中转服务必填，官方留空)')}` },
    { type: 'password', name: 'token', message: `Token ${ansis.gray('(必填)')}`, validate: (v: string) => v.trim() !== '' || '请输入 Token' },
  ])

  console.log()
  console.log(ansis.yellow(`⏳ 正在配置 ${toolName} MCP...`))

  const result = await (isRs ? installAceToolRs : installAceTool)({
    baseUrl: answers.baseUrl?.trim() || undefined,
    token: answers.token.trim(),
  })

  console.log()
  if (result.success) {
    console.log(ansis.green(`✓ ${toolName} MCP 配置成功！`))
    console.log(ansis.gray(`  重启 Claude Code CLI 使配置生效`))
  }
  else {
    console.log(ansis.red(`✗ ${toolName} MCP 配置失败: ${result.message}`))
  }
}

async function handleInstallContextWeaver(): Promise<void> {
  console.log()
  console.log(ansis.cyan(`📖 获取硅基流动 API Key：`))
  console.log(`   ${ansis.gray('1.')} 访问 ${ansis.underline('https://siliconflow.cn/')} 注册账号`)
  console.log(`   ${ansis.gray('2.')} 进入控制台 → API 密钥 → 创建密钥`)
  console.log(`   ${ansis.gray('3.')} 新用户有免费额度，Embedding + Rerank 完全够用`)
  console.log()

  const { apiKey } = await inquirer.prompt([{
    type: 'password',
    name: 'apiKey',
    message: `硅基流动 API Key ${ansis.gray('(sk-xxx)')}`,
    mask: '*',
    validate: (v: string) => v.trim() !== '' || '请输入 API Key',
  }])

  console.log()
  console.log(ansis.yellow('⏳ 正在配置 ContextWeaver MCP...'))

  const result = await installContextWeaver({ siliconflowApiKey: apiKey.trim() })

  console.log()
  if (result.success) {
    console.log(ansis.green('✓ ContextWeaver MCP 配置成功！'))
    console.log(ansis.gray('  重启 Claude Code CLI 使配置生效'))
  }
  else {
    console.log(ansis.red(`✗ ContextWeaver MCP 配置失败: ${result.message}`))
  }
}

// 辅助工具 MCP 配置
const AUXILIARY_MCPS = [
  { id: 'context7', name: 'Context7', desc: '获取最新库文档', command: 'npx', args: ['-y', '@upstash/context7-mcp@latest'] },
  { id: 'Playwright', name: 'Playwright', desc: '浏览器自动化/测试', command: 'npx', args: ['-y', '@playwright/mcp@latest'] },
  { id: 'mcp-deepwiki', name: 'DeepWiki', desc: '知识库查询', command: 'npx', args: ['-y', 'mcp-deepwiki@latest'] },
  { id: 'exa', name: 'Exa', desc: '搜索引擎（需 API Key）', command: 'npx', args: ['-y', 'exa-mcp-server@latest'], requiresApiKey: true, apiKeyEnv: 'EXA_API_KEY' },
]

async function handleAuxiliary(): Promise<void> {
  console.log()

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: '选择要安装的辅助工具（空格选择，回车确认）',
    choices: AUXILIARY_MCPS.map(m => ({
      name: `${m.name} ${ansis.gray(`- ${m.desc}`)}`,
      value: m.id,
    })),
  }])

  if (!selected || selected.length === 0) {
    console.log(ansis.gray('未选择任何工具'))
    return
  }

  console.log()

  for (const id of selected) {
    const mcp = AUXILIARY_MCPS.find(m => m.id === id)!
    let env: Record<string, string> = {}

    if (mcp.requiresApiKey) {
      console.log(ansis.cyan(`📖 获取 ${mcp.name} API Key：`))
      console.log(`   访问 ${ansis.underline('https://exa.ai/')} 注册获取（有免费额度）`)
      console.log()

      const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: `${mcp.name} API Key`,
        mask: '*',
        validate: (v: string) => v.trim() !== '' || '请输入 API Key',
      }])
      env[mcp.apiKeyEnv!] = apiKey.trim()
    }

    console.log(ansis.yellow(`⏳ 正在安装 ${mcp.name}...`))
    const result = await installMcpServer(mcp.id, mcp.command, mcp.args, env)

    if (result.success) {
      console.log(ansis.green(`✓ ${mcp.name} 安装成功`))
    }
    else {
      console.log(ansis.red(`✗ ${mcp.name} 安装失败: ${result.message}`))
    }
  }

  console.log()
  console.log(ansis.gray('重启 Claude Code CLI 使配置生效'))
}

async function handleUninstall(): Promise<void> {
  console.log()

  const allMcps = [
    { name: 'ace-tool', value: 'ace-tool' },
    { name: 'ContextWeaver', value: 'contextweaver' },
    ...AUXILIARY_MCPS.map(m => ({ name: m.name, value: m.id })),
  ]

  const { targets } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'targets',
    message: '选择要卸载的 MCP（空格选择，回车确认）',
    choices: allMcps,
  }])

  if (!targets || targets.length === 0) {
    console.log(ansis.gray('未选择任何工具'))
    return
  }

  console.log()

  for (const target of targets) {
    console.log(ansis.yellow(`⏳ 正在卸载 ${target}...`))

    let result
    if (target === 'ace-tool') {
      result = await uninstallAceTool()
    }
    else if (target === 'contextweaver') {
      result = await uninstallContextWeaver()
    }
    else {
      result = await uninstallMcpServer(target)
    }

    if (result.success) {
      console.log(ansis.green(`✓ ${target} 已卸载`))
    }
    else {
      console.log(ansis.red(`✗ ${target} 卸载失败: ${result.message}`))
    }
  }

  console.log()
}
