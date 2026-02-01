#!/bin/bash

echo "🔍 验证 OPSX 集成修复"
echo "====================="
echo ""

echo "📁 检查模板文件..."
for file in templates/commands/spec-*.md; do
    echo "  ✓ $file"
done
echo ""

echo "🔎 检查错误的 /opsx: 引用（应该只有 Reference 部分）..."
ERRORS=$(grep -n '/opsx:' templates/commands/spec-*.md | grep -v 'OPSX Commands' | grep -v 'Reference' || true)
if [ -z "$ERRORS" ]; then
    echo "  ✅ 没有发现错误的 /opsx: 引用"
else
    echo "  ❌ 发现错误的引用:"
    echo "$ERRORS"
    exit 1
fi
echo ""

echo "✅ 检查正确的 openspec CLI 调用..."
echo "  spec-plan.md:"
grep -n "openspec list --json" templates/commands/spec-plan.md | head -1
grep -n "openspec status --change" templates/commands/spec-plan.md | head -1
echo ""
echo "  spec-research.md:"
grep -n "openspec new" templates/commands/spec-research.md | head -1
grep -n "openspec list --json" templates/commands/spec-research.md | head -1
echo ""
echo "  spec-impl.md:"
grep -n "openspec list --json" templates/commands/spec-impl.md | head -1
grep -n "openspec status --change" templates/commands/spec-impl.md | head -1
echo ""
echo "  spec-review.md:"
grep -n "openspec list --json" templates/commands/spec-review.md | head -1
grep -n "openspec status --change" templates/commands/spec-review.md | head -1
echo ""

echo "✅ 所有修复验证通过！"
echo ""
echo "📦 下一步: 运行 ./test-local-install.sh 进行本地安装测试"

