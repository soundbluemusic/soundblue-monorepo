import type { ToolType } from '@/stores/tool-store';

// ========================================
// Command Parser - 채팅 명령어 파싱
// ========================================

export type Intent =
  | { type: 'OPEN_TOOL'; tool: ToolType }
  | { type: 'CLOSE_TOOL' }
  | { type: 'SET_PARAM'; tool: ToolType; param: string; value: number | string }
  | { type: 'HELP' }
  | { type: 'UNKNOWN' };

// Tool keywords mapping
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
 * Parse user input and return intent
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
