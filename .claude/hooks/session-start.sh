#!/bin/bash
# SessionStart hook - 세션 시작 시 환경 검증

cd "$CLAUDE_PROJECT_DIR" || exit 0

errors=()

# 1. node_modules 존재 확인
if [ ! -d "node_modules" ]; then
  errors+=("node_modules missing - run 'pnpm install'")
fi

# 2. pnpm-lock.yaml 존재 확인
if [ ! -f "pnpm-lock.yaml" ]; then
  errors+=("pnpm-lock.yaml missing")
fi

# 3. Node.js 버전 확인 (>=20)
node_version=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$node_version" ]; then
  errors+=("Node.js not found")
elif [ "$node_version" -lt 20 ]; then
  errors+=("Node.js >= 20 required (current: v$node_version)")
fi

# 4. pnpm 존재 확인
if ! command -v pnpm &> /dev/null; then
  errors+=("pnpm not found")
fi

# 에러가 있으면 출력
if [ ${#errors[@]} -gt 0 ]; then
  echo "## Environment Issues"
  for err in "${errors[@]}"; do
    echo "- $err"
  done
  echo ""
  echo "Run 'pnpm install' to fix dependency issues."
fi

# 토큰 절약 팁 표시
echo "💡 토큰 절약: 20턴마다 /compact | @파일 직접 지정 | 작업 후 새 세션"
