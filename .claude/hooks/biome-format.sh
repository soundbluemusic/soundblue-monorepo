#!/bin/bash
# PostToolUse hook - Edit|Write|MultiEdit 후 Biome 포맷팅

file_path=$(jq -r '.tool_input.file_path // .tool_input.files[0].file_path' 2>/dev/null)

if [ -n "$file_path" ] && echo "$file_path" | grep -qE '\.(ts|tsx)$'; then
  cd "$CLAUDE_PROJECT_DIR" && pnpm exec biome check --write "$file_path" 2>&1 | tail -5
fi
