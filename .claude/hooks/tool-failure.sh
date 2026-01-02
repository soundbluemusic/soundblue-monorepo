#!/bin/bash
# PostToolUseFailure hook - 도구 실패 시 경고
# 에러 숨기기 방지, 근본 원인 분석 강제

tool_name=$(jq -r '.tool_name // "unknown"')
error=$(jq -r '.error // "unknown error"')

echo "## Tool Failure Detected"
echo ""
echo "- Tool: $tool_name"
echo "- Error: $error"
echo ""
echo "## Required Actions"
echo "1. Identify root cause (WHY, not just WHAT)"
echo "2. Do NOT hide error with @ts-ignore, as any, or empty catch"
echo "3. Do NOT delete code to make error disappear"
echo "4. Fix the structural issue"
