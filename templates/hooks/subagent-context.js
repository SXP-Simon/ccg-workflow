#!/usr/bin/env node
// CCG SubAgent Context Hook — PreToolUse (Bash|Agent matcher)
// Injects spec + task context when:
//   1. codeagent-wrapper is about to be called (Bash)
//   2. Agent Team member is about to be spawned (Agent)

'use strict';

try {
  const path = require('path');
  const fs = require('fs');
  const {
    findProjectRoot, getActiveTask, readFileSafe,
    readContextJsonl, outputHook
  } = require('./task-utils.js');

  let inputData = '';
  if (!process.stdin.isTTY) {
    inputData = fs.readFileSync(0, 'utf-8');
  }

  let toolInput = {};
  try {
    const parsed = JSON.parse(inputData);
    toolInput = parsed.tool_input || parsed.input || parsed;
  } catch { /* not JSON */ }

  // Determine trigger type
  const command = toolInput.command || '';
  const teamName = toolInput.team_name || '';
  const agentPrompt = toolInput.prompt || '';

  const isCodeagentCall = command.includes('codeagent-wrapper');
  const isTeamSpawn = !!teamName;

  // Only activate for codeagent-wrapper calls or Agent Team spawns
  if (!isCodeagentCall && !isTeamSpawn) {
    process.exit(0);
  }

  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const root = findProjectRoot(cwd);
  if (!root) process.exit(0);

  const task = getActiveTask(root);
  if (!task) process.exit(0);

  const contextParts = [];

  // Inject active task info for team members
  if (isTeamSpawn) {
    contextParts.push(`<ccg-active-task>
Active task: ${task.dir}
Task: ${task.title || task.id} (${task.status})
Strategy: ${task.strategy}
Phase: ${task.currentPhase}
</ccg-active-task>`);
  }

  // Read context.jsonl entries (specs + research refs)
  const entries = readContextJsonl(task.dir);
  if (entries.length > 0) {
    const specContents = [];
    for (const entry of entries) {
      const filePath = path.isAbsolute(entry.file)
        ? entry.file
        : path.join(root, entry.file);
      const content = readFileSafe(filePath);
      if (content) {
        specContents.push(`--- ${entry.file} (${entry.reason || 'context'}) ---\n${content}`);
      }
    }
    if (specContents.length > 0) {
      contextParts.push(`<ccg-specs>\n${specContents.join('\n\n')}\n</ccg-specs>`);
    }
  }

  // Read PRD and plan
  const prd = readFileSafe(path.join(task.dir, 'requirements.md'));
  const plan = readFileSafe(path.join(task.dir, 'plan.md'));

  if (prd || plan) {
    const taskContext = ['<ccg-task-context>'];
    if (prd) {
      const prdSummary = prd.length > 2000 ? prd.substring(0, 2000) + '\n...(truncated)' : prd;
      taskContext.push(`## Requirements\n${prdSummary}`);
    }
    if (plan) {
      const planSummary = plan.length > 3000 ? plan.substring(0, 3000) + '\n...(truncated)' : plan;
      taskContext.push(`## Plan\n${planSummary}`);
    }
    taskContext.push('</ccg-task-context>');
    contextParts.push(taskContext.join('\n'));
  }

  // Read research files
  const researchDir = path.join(task.dir, 'research');
  if (fs.existsSync(researchDir)) {
    try {
      const researchFiles = fs.readdirSync(researchDir).filter(f => f.endsWith('.md'));
      if (researchFiles.length > 0) {
        const researchContents = researchFiles.map(f => {
          const content = readFileSafe(path.join(researchDir, f));
          return content ? `--- research/${f} ---\n${content.substring(0, 1500)}` : null;
        }).filter(Boolean);
        if (researchContents.length > 0) {
          contextParts.push(`<ccg-research>\n${researchContents.join('\n\n')}\n</ccg-research>`);
        }
      }
    } catch { /* silent */ }
  }

  if (contextParts.length === 0) process.exit(0);

  outputHook('PreToolUse', contextParts.join('\n\n'));
} catch {
  process.exit(0);
}
