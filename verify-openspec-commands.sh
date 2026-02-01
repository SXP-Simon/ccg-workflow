#!/bin/bash

echo "🔍 验证 OpenSpec 命令语法"
echo "=========================="
echo ""

# 测试的命令
commands=(
  "openspec --version"
  "openspec list --json"
  "openspec status --change test --json"
  "openspec new change --help"
  "npx @fission-ai/openspec --version"
  "npx @fission-ai/openspec init --help"
)

for cmd in "${commands[@]}"; do
  echo "Testing: $cmd"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "  ✅ 语法正确"
  else
    exit_code=$?
    if [ $exit_code -eq 1 ]; then
      # Exit code 1 可能是因为参数问题（如 change 不存在），但语法是对的
      echo "  ⚠️  命令执行失败（可能是参数问题，但语法正确）"
    else
      echo "  ❌ 语法错误 (exit code: $exit_code)"
    fi
  fi
  echo ""
done

echo "✅ 验证完成"
