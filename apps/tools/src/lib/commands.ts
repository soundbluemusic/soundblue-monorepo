/**
 * @fileoverview 봇 명령어 파싱 시스템 (Bot Command Parser System)
 *
 * 사용자의 자연어 입력을 분석하여 도구 제어 인텐트로 변환합니다.
 * Parses natural language input and converts it to tool control intents.
 *
 * ## 인텐트 타입 (Intent Types)
 * - `OPEN_TOOL`: 특정 도구 열기 (예: "메트로놈 열어줘")
 * - `CLOSE_TOOL`: 현재 도구 닫기 (예: "닫아", "종료")
 * - `SET_PARAM`: 파라미터 설정 (예: "120 bpm", "볼륨 80")
 * - `HELP`: 도움말 표시 (예: "도움말", "뭐해")
 * - `UNKNOWN`: 인식 불가
 *
 * ## 파싱 우선순위 (Parsing Priority)
 * 1. Help 키워드 체크
 * 2. Close 키워드 체크
 * 3. Parameter 패턴 매칭 (regex)
 * 4. Tool 키워드 매칭
 * 5. UNKNOWN 반환
 *
 * @module commands
 */

import type { ToolType } from '~/stores/tool-store';

// ========================================
// Command Parser - 채팅 명령어 파싱
// ========================================

/**
 * 봇이 반환하는 인텐트 타입
 *
 * @typedef {Object} Intent
 * @property {'OPEN_TOOL'} type - 도구 열기
 * @property {ToolType} tool - 열 도구 ID
 *
 * @property {'CLOSE_TOOL'} type - 현재 도구 닫기
 *
 * @property {'SET_PARAM'} type - 파라미터 설정
 * @property {ToolType} tool - 대상 도구
 * @property {string} param - 파라미터 이름 (예: 'bpm', 'volume')
 * @property {number|string} value - 설정할 값
 *
 * @property {'HELP'} type - 도움말 요청
 *
 * @property {'UNKNOWN'} type - 인식 불가
 */
export type Intent =
  | { type: 'OPEN_TOOL'; tool: ToolType }
  | { type: 'CLOSE_TOOL' }
  | { type: 'SET_PARAM'; tool: ToolType; param: string; value: number | string }
  | { type: 'HELP' }
  | { type: 'UNKNOWN' };

/**
 * 도구별 키워드 매핑 테이블
 * Tool-to-keyword mapping table
 *
 * 각 도구(ToolType)에 대해 사용자가 입력할 수 있는 키워드 목록을 정의합니다.
 * 한국어, 영어, 줄임말 등 다양한 표현을 지원합니다.
 *
 * @example
 * // 키워드 구조
 * {
 *   metronome: ['메트로놈', 'metronome', ...],  // 메트로놈 도구
 *   qr: ['qr', 'QR코드', ...],                  // QR 생성기
 *   drumMachine: ['드럼머신', 'drum', ...],     // 드럼 머신
 *   translator: ['번역', 'translate', ...],    // 번역기
 * }
 */
const TOOL_KEYWORDS: Record<ToolType, string[]> = {
  metronome: ['메트로놈', '박자기', 'metronome', '메트로'],
  qr: ['qr', 'QR', '큐알', 'qr코드', 'QR코드', 'qr생성', 'qr 생성기'],
  drumMachine: ['드럼머신', '드럼 머신', 'drum machine', '드럼', 'drum', '드럼패턴'],
  translator: ['번역', '번역기', 'translate', 'translator', '한영', '영한'],
};

// Parameter pattern result type
interface ParamResult {
  param: string;
  value: number | string;
}

// Parameter patterns
interface ParamPattern {
  regex: RegExp;
  handler: (match: RegExpMatchArray) => ParamResult;
  tool?: ToolType; // If specified, only applies to this tool
}

const PARAM_PATTERNS: ParamPattern[] = [
  // BPM patterns
  {
    regex: /(\d+)\s*bpm/i,
    handler: (match: RegExpMatchArray): ParamResult => ({
      param: 'bpm',
      value: parseInt(match[1] ?? '0', 10),
    }),
  },
  {
    regex: /템포\s*(\d+)/i,
    handler: (match: RegExpMatchArray): ParamResult => ({
      param: 'bpm',
      value: parseInt(match[1] ?? '0', 10),
    }),
  },
  {
    regex: /bpm\s*(\d+)/i,
    handler: (match: RegExpMatchArray): ParamResult => ({
      param: 'bpm',
      value: parseInt(match[1] ?? '0', 10),
    }),
  },
  // Volume patterns
  {
    regex: /볼륨\s*(\d+)/i,
    handler: (match: RegExpMatchArray): ParamResult => ({
      param: 'volume',
      value: parseInt(match[1] ?? '0', 10),
    }),
  },
  {
    regex: /volume\s*(\d+)/i,
    handler: (match: RegExpMatchArray): ParamResult => ({
      param: 'volume',
      value: parseInt(match[1] ?? '0', 10),
    }),
  },
];

// Close keywords
const CLOSE_KEYWORDS: readonly string[] = ['닫아', '닫기', '종료', 'close', '끄기', '끝'];

// Help keywords
const HELP_KEYWORDS: readonly string[] = [
  '도움말',
  '도움',
  'help',
  '뭐해',
  '뭘 할 수 있어',
  '명령어',
];

/**
 * 사용자 입력을 파싱하여 인텐트를 반환합니다.
 * Parses user input and returns the detected intent.
 *
 * ## 반환 타입별 설명 (Intent Type Details)
 *
 * | 타입 | 트리거 예시 | 반환값 |
 * |------|-------------|--------|
 * | `HELP` | "도움말", "help" | `{ type: 'HELP' }` |
 * | `CLOSE_TOOL` | "닫아", "종료" | `{ type: 'CLOSE_TOOL' }` |
 * | `SET_PARAM` | "120 bpm" | `{ type: 'SET_PARAM', tool: 'metronome', param: 'bpm', value: 120 }` |
 * | `OPEN_TOOL` | "메트로놈" | `{ type: 'OPEN_TOOL', tool: 'metronome' }` |
 * | `UNKNOWN` | 인식 불가 | `{ type: 'UNKNOWN' }` |
 *
 * @param {string} input - 사용자 입력 문자열
 * @returns {Intent} 파싱된 인텐트 객체
 *
 * @example
 * parseCommand("메트로놈 열어줘");
 * // { type: 'OPEN_TOOL', tool: 'metronome' }
 *
 * @example
 * parseCommand("템포 140");
 * // { type: 'SET_PARAM', tool: 'metronome', param: 'bpm', value: 140 }
 *
 * @example
 * parseCommand("도구 닫아");
 * // { type: 'CLOSE_TOOL' }
 */
export function parseCommand(input: string): Intent {
  const trimmed = input.trim().toLowerCase();

  // Check for help
  if (HELP_KEYWORDS.some((kw) => trimmed.includes(kw))) {
    return { type: 'HELP' };
  }

  // Check for close
  if (CLOSE_KEYWORDS.some((kw) => trimmed.includes(kw))) {
    return { type: 'CLOSE_TOOL' };
  }

  // Check for parameter setting
  for (const pattern of PARAM_PATTERNS) {
    const match = input.match(pattern.regex);
    if (match) {
      const { param, value } = pattern.handler(match);
      // Try to detect which tool the parameter is for
      const tool = pattern.tool ?? detectToolFromContext(input);
      if (tool) {
        return { type: 'SET_PARAM', tool, param, value };
      }
      // If we have a param but no tool, default to metronome for BPM
      if (param === 'bpm') {
        return { type: 'SET_PARAM', tool: 'metronome', param, value };
      }
    }
  }

  // Check for tool open
  for (const [tool, keywords] of Object.entries(TOOL_KEYWORDS)) {
    if (keywords.some((kw) => trimmed.includes(kw.toLowerCase()))) {
      return { type: 'OPEN_TOOL', tool: tool as ToolType };
    }
  }

  return { type: 'UNKNOWN' };
}

/**
 * Detect tool from context in input
 */
function detectToolFromContext(input: string): ToolType | null {
  const lower = input.toLowerCase();
  for (const [tool, keywords] of Object.entries(TOOL_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return tool as ToolType;
    }
  }
  return null;
}

/** Bot response templates interface */
export interface BotResponses {
  greeting: string;
  openTool: (toolName: string) => string;
  closeTool: string;
  setParam: (param: string, value: number | string) => string;
  unknown: string;
  noToolOpen: string;
  help: string;
}

// Bot response templates
export const RESPONSES: BotResponses = {
  greeting: '안녕하세요! 어떤 도구를 열까요?',
  openTool: (toolName: string): string => `${toolName} 열게요!`,
  closeTool: '도구를 닫았어요.',
  setParam: (param: string, value: number | string): string => {
    const paramNames: Record<string, string> = {
      bpm: 'BPM',
      volume: '볼륨',
    };
    return `${paramNames[param] ?? param}을(를) ${value}(으)로 설정했어요.`;
  },
  unknown: '무슨 말인지 모르겠어요. "도움말"을 입력해보세요.',
  noToolOpen: '열려 있는 도구가 없어요.',
  help: `사용 가능한 명령어:
• 메트로놈, QR, 드럼머신 (도구 열기)
• 120 bpm (템포 설정)
• 닫아 (도구 닫기)
• 도움말 (이 메시지 보기)`,
};
