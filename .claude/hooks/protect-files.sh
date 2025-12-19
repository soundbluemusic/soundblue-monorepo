#!/bin/bash
# PreToolUse hook - Edit|Write 전 보호 파일 체크

file_path=$(jq -r '.tool_input.file_path')

if echo "$file_path" | grep -qE '(\.env$|\.env\.|pnpm-lock\.yaml$)'; then
  echo '{"decision":"deny","reason":"보호된 파일입니다"}'
fi
