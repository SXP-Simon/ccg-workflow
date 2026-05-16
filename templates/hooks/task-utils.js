#!/usr/bin/env node
// CCG Hook Shared Utilities
// Pure Node.js, zero external dependencies

const fs = require('fs');
const path = require('path');

function findProjectRoot(startDir) {
  let dir = startDir || process.cwd();
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, '.ccg', 'tasks'))) return dir;
    if (fs.existsSync(path.join(dir, '.ccg'))) return dir;
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function getActiveTask(projectRoot) {
  const tasksDir = path.join(projectRoot, '.ccg', 'tasks');
  if (!fs.existsSync(tasksDir)) return null;

  try {
    const dirs = fs.readdirSync(tasksDir)
      .filter(d => {
        try {
          return fs.statSync(path.join(tasksDir, d)).isDirectory()
            && fs.existsSync(path.join(tasksDir, d, 'task.json'));
        } catch { return false; }
      })
      .sort()
      .reverse();

    for (const dir of dirs) {
      try {
        const raw = fs.readFileSync(path.join(tasksDir, dir, 'task.json'), 'utf-8');
        const task = JSON.parse(raw);
        if (task.status !== 'completed' && task.status !== 'archived') {
          return { dir: path.join(tasksDir, dir), ...task };
        }
      } catch { /* skip malformed */ }
    }
  } catch { /* silent */ }
  return null;
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return null; }
}

function readContextJsonl(taskDir) {
  const jsonlPath = path.join(taskDir, 'context.jsonl');
  if (!fs.existsSync(jsonlPath)) return [];
  try {
    return fs.readFileSync(jsonlPath, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(entry => entry && entry.file);
  } catch { return []; }
}

function detectTechStack(projectRoot) {
  const indicators = [
    { file: 'package.json', stack: 'Node.js' },
    { file: 'go.mod', stack: 'Go' },
    { file: 'pyproject.toml', stack: 'Python' },
    { file: 'Cargo.toml', stack: 'Rust' },
    { file: 'pom.xml', stack: 'Java' },
    { file: 'build.gradle', stack: 'Java/Kotlin' },
  ];
  const found = [];
  for (const { file, stack } of indicators) {
    if (fs.existsSync(path.join(projectRoot, file))) found.push(stack);
  }
  return found.length > 0 ? found.join(' + ') : 'Unknown';
}

function getGitInfo(projectRoot) {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot, stdio: 'pipe' }).toString().trim();
    const status = execSync('git status --porcelain', { cwd: projectRoot, stdio: 'pipe' }).toString().trim();
    const dirtyCount = status ? status.split('\n').length : 0;
    return { branch, dirtyCount };
  } catch { return { branch: 'unknown', dirtyCount: 0 }; }
}

function outputHook(eventName, additionalContext) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext
    }
  }));
}

module.exports = {
  findProjectRoot,
  getActiveTask,
  readFileSafe,
  readJsonSafe,
  readContextJsonl,
  detectTechStack,
  getGitInfo,
  outputHook
};
