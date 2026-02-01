#!/bin/bash
set -e

echo "🧪 测试本地安装 CCG Workflow"
echo "================================"

# 1. 打包
echo ""
echo "📦 步骤 1: 打包..."
npm pack

# 2. 获取包文件名
PACKAGE_FILE=$(ls -t ccg-workflow-*.tgz | head -1)
echo "✅ 包文件: $PACKAGE_FILE"

# 3. 备份当前配置
echo ""
echo "💾 步骤 2: 备份当前配置..."
if [ -d ~/.claude/commands/ccg ]; then
    cp -r ~/.claude/commands/ccg ~/.claude/commands/ccg.backup.$(date +%s)
    echo "✅ 已备份到 ~/.claude/commands/ccg.backup.*"
fi

# 4. 测试安装
echo ""
echo "🚀 步骤 3: 测试安装..."
npx $PACKAGE_FILE

echo ""
echo "✅ 安装完成！"
echo ""
echo "📋 验证步骤:"
echo "1. 检查命令文件:"
echo "   ls -la ~/.claude/commands/ccg/spec-*.md"
echo ""
echo "2. 验证修复内容:"
echo "   grep -n 'openspec list' ~/.claude/commands/ccg/spec-plan.md"
echo ""
echo "3. 确认没有错误的 /opsx: 引用:"
echo "   grep '/opsx:' ~/.claude/commands/ccg/spec-*.md | grep -v 'OPSX Commands'"
echo ""
echo "4. 重启 Claude Code 并测试 /ccg:spec-plan"

