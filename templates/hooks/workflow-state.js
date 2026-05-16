#!/usr/bin/env node
// CCG Workflow State Hook — UserPromptSubmit
// Injects per-turn breadcrumb based on active task state.
// Runs on EVERY user message. Must be fast (<1s) and never crash.

'use strict';

try {
  const { findProjectRoot, getActiveTask, outputHook } = require('./task-utils.js');

  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const root = findProjectRoot(cwd);

  if (!root) process.exit(0);

  const task = getActiveTask(root);

  if (!task) {
    process.exit(0);
  }

  const lines = [
    '<ccg-state>',
    `Task: ${task.title || task.id} (${task.status})`,
    `Strategy: ${task.strategy}`,
    `Phase: ${task.currentPhase}`,
  ];

  if (task.gate) {
    lines.push(`⛔ GATE: ${task.gate}`);
  }

  lines.push(`Next: ${task.nextAction || 'Continue current phase'}`);
  lines.push('</ccg-state>');

  outputHook('UserPromptSubmit', lines.join('\n'));
} catch {
  process.exit(0);
}
