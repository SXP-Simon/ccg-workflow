import type { InstallResult } from '../types'
import fs from 'fs-extra'
import { join } from 'pathe'
import { getWorkflowById } from './installer-data'
import { PACKAGE_ROOT, injectConfigVariables, replaceHomePathsInTemplate } from './installer-template'

// ═══════════════════════════════════════════════════════
// Re-exports — all consumers import from './installer'
// These re-exports preserve backward compatibility.
// ═══════════════════════════════════════════════════════

export {
  getAllCommandIds,
  getWorkflowById,
  getWorkflowConfigs,
  getWorkflowPreset,
  WORKFLOW_PRESETS,
} from './installer-data'
export type { WorkflowPreset } from './installer-data'

export { injectConfigVariables } from './installer-template'

export {
  installAceTool,
  installAceToolRs,
  installContextWeaver,
  installFastContext,
  installMcpServer,
  syncMcpToCodex,
  syncMcpToGemini,
  uninstallAceTool,
  uninstallContextWeaver,
  uninstallFastContext,
  uninstallMcpServer,
} from './installer-mcp'
export type { ContextWeaverConfig } from './installer-mcp'

export {
  removeFastContextPrompt,
  writeFastContextPrompt,
} from './installer-prompt'

// ═══════════════════════════════════════════════════════
// Install context — shared across sub-functions
// ═══════════════════════════════════════════════════════

interface InstallConfig {
  routing: {
    mode: string
    frontend: { models: string[], primary: string }
    backend: { models: string[], primary: string }
    review: { models: string[] }
  }
  liteMode: boolean
  mcpProvider: string
}

interface InstallContext {
  installDir: string
  force: boolean
  config: InstallConfig
  templateDir: string
  result: InstallResult
}

// ═══════════════════════════════════════════════════════
// Binary download
// ═══════════════════════════════════════════════════════

const GITHUB_REPO = 'fengshao1227/ccg-workflow'
const RELEASE_TAG = 'preset'
const BINARY_DOWNLOAD_URL = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_TAG}`

/**
 * Download codeagent-wrapper binary from GitHub Release.
 * Retry: 3 attempts with exponential backoff. Timeout: 60s per attempt.
 */
async function downloadBinaryFromRelease(binaryName: string, destPath: string): Promise<boolean> {
  const url = `${BINARY_DOWNLOAD_URL}/${binaryName}`
  const MAX_ATTEMPTS = 3
  const TIMEOUT_MS = 60_000

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await fetch(url, { redirect: 'follow', signal: controller.signal })
      if (!response.ok) {
        clearTimeout(timer)
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
          continue
        }
        return false
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      clearTimeout(timer)

      await fs.writeFile(destPath, buffer)
      if (process.platform !== 'win32') {
        await fs.chmod(destPath, 0o755)
      }
      return true
    }
    catch {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        continue
      }
      return false
    }
  }

  return false
}

// ═══════════════════════════════════════════════════════
// Shared file-copy helper
// ═══════════════════════════════════════════════════════

/**
 * Copy .md templates from srcDir → destDir with optional variable injection.
 * Returns list of installed file stems (filename without .md).
 */
async function copyMdTemplates(
  ctx: InstallContext,
  srcDir: string,
  destDir: string,
  options: { inject?: boolean } = {},
): Promise<string[]> {
  const installed: string[] = []
  if (!(await fs.pathExists(srcDir))) return installed

  await fs.ensureDir(destDir)
  const files = await fs.readdir(srcDir)
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const destFile = join(destDir, file)
    if (ctx.force || !(await fs.pathExists(destFile))) {
      let content = await fs.readFile(join(srcDir, file), 'utf-8')
      if (options.inject) content = injectConfigVariables(content, ctx.config)
      content = replaceHomePathsInTemplate(content, ctx.installDir)
      await fs.writeFile(destFile, content, 'utf-8')
      installed.push(file.replace('.md', ''))
    }
  }
  return installed
}

// ═══════════════════════════════════════════════════════
// Install sub-steps
// ═══════════════════════════════════════════════════════

/**
 * Install slash command .md files from templates/commands/
 */
async function installCommandFiles(ctx: InstallContext, workflowIds: string[]): Promise<void> {
  const commandsDir = join(ctx.installDir, 'commands', 'ccg')

  for (const workflowId of workflowIds) {
    const workflow = getWorkflowById(workflowId)
    if (!workflow) {
      ctx.result.errors.push(`Unknown workflow: ${workflowId}`)
      continue
    }

    for (const cmd of workflow.commands) {
      const srcFile = join(ctx.templateDir, 'commands', `${cmd}.md`)
      const destFile = join(commandsDir, `${cmd}.md`)

      try {
        if (await fs.pathExists(srcFile)) {
          if (ctx.force || !(await fs.pathExists(destFile))) {
            let content = await fs.readFile(srcFile, 'utf-8')
            content = injectConfigVariables(content, ctx.config)
            content = replaceHomePathsInTemplate(content, ctx.installDir)
            await fs.writeFile(destFile, content, 'utf-8')
            ctx.result.installedCommands.push(cmd)
          }
        }
        else {
          const placeholder = `---
description: "${workflow.descriptionEn}"
---

# /ccg:${cmd}

${workflow.description}

> This command is part of CCG multi-model collaboration system.
`
          await fs.writeFile(destFile, placeholder, 'utf-8')
          ctx.result.installedCommands.push(cmd)
        }
      }
      catch (error) {
        ctx.result.errors.push(`Failed to install ${cmd}: ${error}`)
        ctx.result.success = false
      }
    }
  }
}

/**
 * Install agent .md files from templates/commands/agents/
 */
async function installAgentFiles(ctx: InstallContext): Promise<void> {
  try {
    await copyMdTemplates(
      ctx,
      join(ctx.templateDir, 'commands', 'agents'),
      join(ctx.installDir, 'agents', 'ccg'),
      { inject: true },
    )
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install agents: ${error}`)
    ctx.result.success = false
  }
}

/**
 * Install expert prompt .md files from templates/prompts/{codex,gemini,claude}/
 */
async function installPromptFiles(ctx: InstallContext): Promise<void> {
  const promptsTemplateDir = join(ctx.templateDir, 'prompts')
  const promptsDir = join(ctx.installDir, '.ccg', 'prompts')
  if (!(await fs.pathExists(promptsTemplateDir))) return

  for (const model of ['codex', 'gemini', 'claude']) {
    try {
      const installed = await copyMdTemplates(
        ctx,
        join(promptsTemplateDir, model),
        join(promptsDir, model),
      )
      for (const name of installed) {
        ctx.result.installedPrompts.push(`${model}/${name}`)
      }
    }
    catch (error) {
      ctx.result.errors.push(`Failed to install ${model} prompts: ${error}`)
      ctx.result.success = false
    }
  }
}

/**
 * Count installed SKILL.md files (recursive, excludes root-level).
 */
async function countInstalledSkills(skillsDir: string, depth = 0): Promise<number> {
  let count = 0
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(skillsDir, entry.name)
      if (entry.isDirectory()) {
        count += await countInstalledSkills(fullPath, depth + 1)
      }
      else if (entry.name === 'SKILL.md' && depth > 0) {
        count++
      }
    }
  }
  catch { /* Directory doesn't exist or can't be read */ }
  return count
}

/**
 * Install skill files from templates/skills/ → ~/.claude/skills/ccg/
 * Includes v1.7.73 legacy layout migration.
 */
async function installSkillFiles(ctx: InstallContext): Promise<void> {
  const skillsTemplateDir = join(ctx.templateDir, 'skills')
  const skillsDestDir = join(ctx.installDir, 'skills', 'ccg')
  if (!(await fs.pathExists(skillsTemplateDir))) return

  try {
    // Migration: move old v1.7.73 layout into skills/ccg/ namespace
    const oldSkillsRoot = join(ctx.installDir, 'skills')
    const ccgLegacyItems = ['tools', 'orchestration', 'SKILL.md', 'run_skill.js']
    const needsMigration = !await fs.pathExists(skillsDestDir)
      && await fs.pathExists(join(oldSkillsRoot, 'tools'))
    if (needsMigration) {
      await fs.ensureDir(skillsDestDir)
      for (const item of ccgLegacyItems) {
        const oldPath = join(oldSkillsRoot, item)
        const newPath = join(skillsDestDir, item)
        if (await fs.pathExists(oldPath)) {
          await fs.move(oldPath, newPath, { overwrite: true })
        }
      }
    }

    // Recursive copy: preserves full directory tree
    await fs.copy(skillsTemplateDir, skillsDestDir, {
      overwrite: ctx.force,
      errorOnExist: false,
    })

    // Post-copy: apply template variable replacement to .md files
    const replacePathsInDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          await replacePathsInDir(fullPath)
        }
        else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8')
          const processed = replaceHomePathsInTemplate(content, ctx.installDir)
          if (processed !== content) {
            await fs.writeFile(fullPath, processed, 'utf-8')
          }
        }
      }
    }
    await replacePathsInDir(skillsDestDir)

    ctx.result.installedSkills = await countInstalledSkills(skillsDestDir)
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install skills: ${error}`)
    ctx.result.success = false
  }
}

/**
 * Install rule .md files from templates/rules/ → ~/.claude/rules/
 */
async function installRuleFiles(ctx: InstallContext): Promise<void> {
  try {
    const installed = await copyMdTemplates(
      ctx,
      join(ctx.templateDir, 'rules'),
      join(ctx.installDir, 'rules'),
    )
    if (installed.length > 0) ctx.result.installedRules = true
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install rules: ${error}`)
  }
}

/** Resolve platform-specific binary name. Returns null for unsupported platforms. */
function getBinaryName(): string | null {
  const osMap: Record<string, string> = { darwin: 'darwin', linux: 'linux', win32: 'windows' }
  const os = osMap[process.platform]
  if (!os) return null
  const arch = process.arch === 'arm64' ? 'arm64' : 'amd64'
  const ext = process.platform === 'win32' ? '.exe' : ''
  return `codeagent-wrapper-${os}-${arch}${ext}`
}

/**
 * Download and install codeagent-wrapper binary for current platform.
 */
async function installBinaryFile(ctx: InstallContext): Promise<void> {
  try {
    const binDir = join(ctx.installDir, 'bin')
    await fs.ensureDir(binDir)

    const binaryName = getBinaryName()
    if (!binaryName) {
      ctx.result.errors.push(`Unsupported platform: ${process.platform}`)
      ctx.result.success = false
      return
    }

    const destBinary = join(binDir, process.platform === 'win32' ? 'codeagent-wrapper.exe' : 'codeagent-wrapper')
    const installed = await downloadBinaryFromRelease(binaryName, destBinary)

    if (installed) {
      try {
        const { execSync } = await import('node:child_process')
        execSync(`"${destBinary}" --version`, { stdio: 'pipe' })
        ctx.result.binPath = binDir
        ctx.result.binInstalled = true
      }
      catch (verifyError) {
        ctx.result.errors.push(`Binary verification failed (non-blocking): ${verifyError}`)
      }
    }
    else {
      ctx.result.errors.push(`Failed to download binary: ${binaryName} from GitHub Release (after 3 attempts). Check network or visit https://github.com/${GITHUB_REPO}/releases/tag/${RELEASE_TAG}`)
    }
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install codeagent-wrapper (non-blocking): ${error}`)
  }
}

// ═══════════════════════════════════════════════════════
// Public API: install / uninstall
// ═══════════════════════════════════════════════════════

export async function installWorkflows(
  workflowIds: string[],
  installDir: string,
  force = false,
  config?: {
    routing?: {
      mode?: string
      frontend?: { models?: string[], primary?: string }
      backend?: { models?: string[], primary?: string }
      review?: { models?: string[] }
    }
    liteMode?: boolean
    mcpProvider?: string
  },
): Promise<InstallResult> {
  const ctx: InstallContext = {
    installDir,
    force,
    config: {
      routing: config?.routing as InstallConfig['routing'] || {
        mode: 'smart',
        frontend: { models: ['gemini'], primary: 'gemini' },
        backend: { models: ['codex'], primary: 'codex' },
        review: { models: ['codex', 'gemini'] },
      },
      liteMode: config?.liteMode || false,
      mcpProvider: config?.mcpProvider || 'ace-tool',
    },
    templateDir: join(PACKAGE_ROOT, 'templates'),
    result: {
      success: true,
      installedCommands: [],
      installedPrompts: [],
      errors: [],
      configPath: '',
    },
  }

  // Ensure base directories
  await fs.ensureDir(join(installDir, 'commands', 'ccg'))
  await fs.ensureDir(join(installDir, '.ccg'))
  await fs.ensureDir(join(installDir, '.ccg', 'prompts'))

  // Execute each install step
  await installCommandFiles(ctx, workflowIds)
  await installAgentFiles(ctx)
  await installPromptFiles(ctx)
  await installSkillFiles(ctx)
  await installRuleFiles(ctx)
  await installBinaryFile(ctx)

  ctx.result.configPath = join(installDir, 'commands', 'ccg')
  return ctx.result
}

// ═══════════════════════════════════════════════════════
// Uninstall
// ═══════════════════════════════════════════════════════

export interface UninstallResult {
  success: boolean
  removedCommands: string[]
  removedPrompts: string[]
  removedAgents: string[]
  removedSkills: string[]
  removedRules: boolean
  removedBin: boolean
  errors: string[]
}

/**
 * Uninstall workflows by removing their command files
 */
export async function uninstallWorkflows(installDir: string): Promise<UninstallResult> {
  const result: UninstallResult = {
    success: true,
    removedCommands: [],
    removedPrompts: [],
    removedAgents: [],
    removedSkills: [],
    removedRules: false,
    removedBin: false,
    errors: [],
  }

  const commandsDir = join(installDir, 'commands', 'ccg')
  const agentsDir = join(installDir, 'agents', 'ccg')
  const skillsDir = join(installDir, 'skills', 'ccg')
  const rulesDir = join(installDir, 'rules')
  const binDir = join(installDir, 'bin')
  const ccgConfigDir = join(installDir, '.ccg')

  // Remove CCG commands directory
  if (await fs.pathExists(commandsDir)) {
    try {
      const files = await fs.readdir(commandsDir)
      for (const file of files) {
        if (file.endsWith('.md')) {
          result.removedCommands.push(file.replace('.md', ''))
        }
      }
      await fs.remove(commandsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove commands directory: ${error}`)
      result.success = false
    }
  }

  // Remove CCG agents directory
  if (await fs.pathExists(agentsDir)) {
    try {
      const files = await fs.readdir(agentsDir)
      for (const file of files) {
        result.removedAgents.push(file.replace('.md', ''))
      }
      await fs.remove(agentsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove agents directory: ${error}`)
      result.success = false
    }
  }

  // Remove CCG skills directory only (skills/ccg/) — preserves user's own skills
  if (await fs.pathExists(skillsDir)) {
    try {
      const collectSkillNames = async (dir: string, depth: number): Promise<string[]> => {
        const names: string[] = []
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            names.push(...await collectSkillNames(join(dir, entry.name), depth + 1))
          }
          else if (entry.name === 'SKILL.md' && depth > 0) {
            const parts = dir.split('/')
            names.push(parts[parts.length - 1])
          }
        }
        return names
      }
      result.removedSkills = await collectSkillNames(skillsDir, 0)
      await fs.remove(skillsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove skills: ${error}`)
      result.success = false
    }
  }

  // Remove CCG rules files
  if (await fs.pathExists(rulesDir)) {
    try {
      for (const ruleFile of ['ccg-skills.md', 'ccg-grok-search.md']) {
        const rulePath = join(rulesDir, ruleFile)
        if (await fs.pathExists(rulePath)) {
          await fs.remove(rulePath)
          result.removedRules = true
        }
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove rules: ${error}`)
    }
  }

  // Remove codeagent-wrapper binary
  if (await fs.pathExists(binDir)) {
    try {
      const wrapperName = process.platform === 'win32' ? 'codeagent-wrapper.exe' : 'codeagent-wrapper'
      const wrapperPath = join(binDir, wrapperName)
      if (await fs.pathExists(wrapperPath)) {
        await fs.remove(wrapperPath)
        result.removedBin = true
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove binary: ${error}`)
      result.success = false
    }
  }

  // Remove .ccg config directory
  if (await fs.pathExists(ccgConfigDir)) {
    try {
      await fs.remove(ccgConfigDir)
      result.removedPrompts.push('ALL_PROMPTS_AND_CONFIGS')
    }
    catch (error) {
      result.errors.push(`Failed to remove .ccg directory: ${error}`)
    }
  }

  return result
}
