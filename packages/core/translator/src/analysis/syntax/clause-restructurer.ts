// ========================================
// Clause Restructurer - 복합 문장 절 분리/재조립
// 연결어미로 연결된 절을 분리하고 영어 접속사로 재조립
// ========================================

import { type ParsedSentence, parseSentence } from './sentence-parser';

// 절 구조
export interface Clause {
  text: string; // 원본 텍스트
  parsed?: ParsedSentence; // 파싱된 구조
  connective?: ConnectiveInfo; // 연결어미 정보
  isMainClause: boolean; // 주절 여부
}

// 연결어미 정보
export interface ConnectiveInfo {
  korean: string; // 한국어 연결어미 (-고, -서 등)
  english: string; // 영어 접속사 (and, because 등)
  type: ConnectiveType; // 연결 유형
  tense?: 'past' | 'present' | 'future'; // 시제 정보
}

// 연결 유형
export type ConnectiveType =
  | 'and' // 나열: -고, -며
  | 'sequence' // 순차: -서, -아서
  | 'reason' // 이유: -니까, -으니까
  | 'contrast' // 대조: -지만, -는데
  | 'condition' // 조건: -면, -으면
  | 'concession' // 양보: -도, -ㄴ데도
  | 'simultaneous'; // 동시: -면서

// 복합 문장 분석 결과
export interface CompoundSentence {
  original: string;
  clauses: Clause[];
  restructuredEnglish?: string;
}

// ========================================
// 연결어미 패턴 정의 (길이순 정렬)
// ========================================

interface ConnectivePattern {
  pattern: string;
  info: ConnectiveInfo;
}

// 연결어미 패턴 (긴 것부터 매칭)
const CONNECTIVE_PATTERNS: ConnectivePattern[] = [
  // 5글자 이상 - 과거 시제 포함
  {
    pattern: '았으니까',
    info: { korean: '았으니까', english: 'because', type: 'reason', tense: 'past' },
  },
  {
    pattern: '었으니까',
    info: { korean: '었으니까', english: 'because', type: 'reason', tense: 'past' },
  },
  {
    pattern: '였으니까',
    info: { korean: '였으니까', english: 'because', type: 'reason', tense: 'past' },
  },
  {
    pattern: '했으니까',
    info: { korean: '했으니까', english: 'because', type: 'reason', tense: 'past' },
  },

  // 4글자 - 과거 시제 포함
  {
    pattern: '았지만',
    info: { korean: '았지만', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '었지만',
    info: { korean: '었지만', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '였지만',
    info: { korean: '였지만', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '았는데',
    info: { korean: '았는데', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '었는데',
    info: { korean: '었는데', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '였는데',
    info: { korean: '였는데', english: 'but', type: 'contrast', tense: 'past' },
  },
  {
    pattern: '았으면',
    info: { korean: '았으면', english: 'if', type: 'condition', tense: 'past' },
  },
  {
    pattern: '었으면',
    info: { korean: '었으면', english: 'if', type: 'condition', tense: 'past' },
  },
  {
    pattern: '였으면',
    info: { korean: '였으면', english: 'if', type: 'condition', tense: 'past' },
  },
  {
    pattern: '았어서',
    info: { korean: '았어서', english: 'and then', type: 'sequence', tense: 'past' },
  },
  {
    pattern: '었어서',
    info: { korean: '었어서', english: 'and then', type: 'sequence', tense: 'past' },
  },
  {
    pattern: '였어서',
    info: { korean: '였어서', english: 'and then', type: 'sequence', tense: 'past' },
  },
  { pattern: '았으며', info: { korean: '았으며', english: 'and', type: 'and', tense: 'past' } },
  { pattern: '었으며', info: { korean: '었으며', english: 'and', type: 'and', tense: 'past' } },
  { pattern: '였으며', info: { korean: '였으며', english: 'and', type: 'and', tense: 'past' } },

  // 3글자
  { pattern: '으니까', info: { korean: '으니까', english: 'because', type: 'reason' } },
  { pattern: '으면서', info: { korean: '으면서', english: 'while', type: 'simultaneous' } },
  { pattern: '는데도', info: { korean: '는데도', english: 'even though', type: 'concession' } },
  { pattern: '았고', info: { korean: '았고', english: 'and', type: 'and', tense: 'past' } },
  { pattern: '었고', info: { korean: '었고', english: 'and', type: 'and', tense: 'past' } },
  { pattern: '였고', info: { korean: '였고', english: 'and', type: 'and', tense: 'past' } },
  { pattern: '했고', info: { korean: '했고', english: 'and', type: 'and', tense: 'past' } },

  // 3글자 - 추가 패턴
  { pattern: '으려고', info: { korean: '으려고', english: 'in order to', type: 'reason' } },
  { pattern: '느라고', info: { korean: '느라고', english: 'because of', type: 'reason' } },
  { pattern: '더라도', info: { korean: '더라도', english: 'even if', type: 'concession' } },
  { pattern: '다가는', info: { korean: '다가는', english: 'if continues', type: 'condition' } },
  { pattern: '거나', info: { korean: '거나', english: 'or', type: 'and' } },

  // 2글자
  { pattern: '아서', info: { korean: '아서', english: 'and then', type: 'sequence' } },
  { pattern: '어서', info: { korean: '어서', english: 'and then', type: 'sequence' } },
  { pattern: '여서', info: { korean: '여서', english: 'and then', type: 'sequence' } },
  { pattern: '해서', info: { korean: '해서', english: 'and then', type: 'sequence' } },
  { pattern: '으며', info: { korean: '으며', english: 'and', type: 'and' } },
  { pattern: '으면', info: { korean: '으면', english: 'if', type: 'condition' } },
  { pattern: '면서', info: { korean: '면서', english: 'while', type: 'simultaneous' } },
  { pattern: '지만', info: { korean: '지만', english: 'but', type: 'contrast' } },
  { pattern: '는데', info: { korean: '는데', english: 'but', type: 'contrast' } },
  { pattern: '니까', info: { korean: '니까', english: 'because', type: 'reason' } },
  { pattern: 'ㄴ데', info: { korean: 'ㄴ데', english: 'but', type: 'contrast' } },
  { pattern: '려고', info: { korean: '려고', english: 'in order to', type: 'reason' } },
  { pattern: '느라', info: { korean: '느라', english: 'because of', type: 'reason' } },
  { pattern: '다가', info: { korean: '다가', english: 'while', type: 'simultaneous' } },

  // 1글자
  { pattern: '고', info: { korean: '고', english: 'and', type: 'and' } },
  { pattern: '며', info: { korean: '며', english: 'and', type: 'and' } },
  { pattern: '서', info: { korean: '서', english: 'and then', type: 'sequence' } },
  { pattern: '면', info: { korean: '면', english: 'if', type: 'condition' } },
];

// ========================================
// 복합 문장 분리
// ========================================

/**
 * 복합 문장을 절로 분리
 *
 * @example
 * splitIntoClauses('나는 밥을 먹고 학교에 갔다')
 * // → [{ text: '나는 밥을 먹', connective: {...} }, { text: '학교에 갔다', isMainClause: true }]
 */
export function splitIntoClauses(text: string): Clause[] {
  const clauses: Clause[] = [];
  const remaining = text.trim();

  // 쉼표로 먼저 분리
  const commaSeparated = remaining.split(/\s*,\s*/);

  for (let i = 0; i < commaSeparated.length; i++) {
    const segment = commaSeparated[i];
    if (!segment) continue;

    // 각 세그먼트에서 연결어미로 분리
    const segmentClauses = splitByConnectives(segment);
    clauses.push(...segmentClauses);
  }

  // 마지막 절이 없으면 전체를 주절로
  if (clauses.length === 0) {
    clauses.push({
      text: text.trim(),
      isMainClause: true,
    });
  }

  // 마지막 절을 주절로 표시
  if (clauses.length > 0 && clauses[clauses.length - 1]) {
    clauses[clauses.length - 1].isMainClause = true;
  }

  return clauses;
}

/**
 * 연결어미로 문장 분리
 */
function splitByConnectives(text: string): Clause[] {
  const clauses: Clause[] = [];
  const remaining = text.trim();
  let lastMatchEnd = 0;

  // 토큰화 (공백 기준)
  const tokens = remaining.split(/\s+/);
  const tokenPositions: Array<{ token: string; start: number; end: number }> = [];

  // 각 토큰의 위치 추적
  let pos = 0;
  for (const token of tokens) {
    const start = remaining.indexOf(token, pos);
    const end = start + token.length;
    tokenPositions.push({ token, start, end });
    pos = end;
  }

  // 각 토큰에서 연결어미 찾기
  for (let i = 0; i < tokenPositions.length; i++) {
    const { token, end } = tokenPositions[i] || { token: '', start: 0, end: 0 };

    // 연결어미 매칭 (긴 것부터)
    for (const { pattern, info } of CONNECTIVE_PATTERNS) {
      if (token.endsWith(pattern) && token.length > pattern.length) {
        // 연결어미 발견
        const clauseText = remaining.slice(lastMatchEnd, end).trim();

        // 어간 부분 (연결어미 제외)
        const stemPart = token.slice(0, -pattern.length);

        // 어간에 종결어미 "다"를 붙여서 기본형으로 만듦 (번역을 위해)
        // 예: "먹" → "먹다", "가" → "간다" (동사 기본형)
        const verbForm = stemPart + '다';

        clauses.push({
          text: clauseText.replace(new RegExp(`${escapeRegex(pattern)}$`), verbForm),
          connective: info,
          isMainClause: false,
        });

        lastMatchEnd = end;
        // 공백 건너뛰기
        while (lastMatchEnd < remaining.length && remaining[lastMatchEnd] === ' ') {
          lastMatchEnd++;
        }
        break;
      }
    }
  }

  // 남은 부분이 있으면 마지막 절로 추가
  if (lastMatchEnd < remaining.length) {
    const remainingText = remaining.slice(lastMatchEnd).trim();
    if (remainingText) {
      clauses.push({
        text: remainingText,
        isMainClause: true,
      });
    }
  }

  // 분리된 절이 없으면 전체를 하나의 절로
  if (clauses.length === 0) {
    clauses.push({
      text: text.trim(),
      isMainClause: true,
    });
  }

  return clauses;
}

/**
 * 정규식 이스케이프
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========================================
// 절 파싱
// ========================================

/**
 * 각 절을 파싱
 */
export function parseClauses(clauses: Clause[]): Clause[] {
  return clauses.map((clause) => ({
    ...clause,
    parsed: parseSentence(clause.text),
  }));
}

// ========================================
// 복합 문장 분석
// ========================================

/**
 * 복합 문장 전체 분석
 *
 * @example
 * analyzeCompoundSentence('나는 밥을 먹고 학교에 갔다')
 */
export function analyzeCompoundSentence(text: string): CompoundSentence {
  // 1. 절 분리
  const rawClauses = splitIntoClauses(text);

  // 2. 각 절 파싱
  const parsedClauses = parseClauses(rawClauses);

  return {
    original: text,
    clauses: parsedClauses,
  };
}

// ========================================
// 영어 접속사로 재조립
// ========================================

/**
 * 번역된 절들을 영어 접속사로 재조립
 *
 * @param translatedClauses 번역된 절 배열 [{text: 'I ate rice', connective: {...}}, ...]
 * @returns 재조립된 영어 문장
 */
export function reassembleWithConjunctions(
  translatedClauses: Array<{ text: string; connective?: ConnectiveInfo }>,
): string {
  if (translatedClauses.length === 0) return '';
  if (translatedClauses.length === 1) return translatedClauses[0]?.text || '';

  const parts: string[] = [];

  for (let i = 0; i < translatedClauses.length; i++) {
    const clause = translatedClauses[i];
    if (!clause) continue;

    // 첫 절
    if (i === 0) {
      parts.push(clause.text);
      continue;
    }

    // 이전 절의 연결어미 정보 사용
    const prevClause = translatedClauses[i - 1];
    const connective = prevClause?.connective;

    if (connective) {
      // 연결 유형에 따라 다르게 처리
      switch (connective.type) {
        case 'and':
        case 'sequence':
          // 단순 나열/순차: and로 연결
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        case 'reason':
          // 이유: because로 연결
          // "I went to school because I ate breakfast"
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        case 'contrast':
          // 대조: but으로 연결
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        case 'condition':
          // 조건: if로 시작하는 절 앞으로 이동
          // "If I have time, I will go" 형태로 재구성
          // 현재는 단순 연결
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        case 'simultaneous':
          // 동시: while로 연결
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        case 'concession':
          // 양보: even though로 연결
          parts.push(`${connective.english} ${lowerFirst(clause.text)}`);
          break;

        default:
          parts.push(`and ${lowerFirst(clause.text)}`);
      }
    } else {
      // 연결어미 정보 없으면 and로 연결
      parts.push(`and ${lowerFirst(clause.text)}`);
    }
  }

  // 첫 글자 대문자
  const result = parts.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * 첫 글자 소문자로
 */
function lowerFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// ========================================
// 조건문 재구성
// ========================================

/**
 * 조건문 구조 재배열
 * "조건절 + 결과절" → "If 조건절, 결과절" 또는 "결과절 if 조건절"
 *
 * @param clauses 절 배열
 * @returns 재구성된 절 배열
 */
export function restructureConditional(
  clauses: Array<{ text: string; connective?: ConnectiveInfo; isMainClause?: boolean }>,
): Array<{ text: string; connective?: ConnectiveInfo }> {
  // 조건절 찾기
  const conditionalIndex = clauses.findIndex(
    (c) => c.connective?.type === 'condition' && !c.isMainClause,
  );

  if (conditionalIndex === -1) {
    return clauses;
  }

  // 조건절과 결과절 분리
  const conditionalClause = clauses[conditionalIndex];
  const resultClause = clauses[conditionalIndex + 1];

  if (!conditionalClause || !resultClause) {
    return clauses;
  }

  // "If 조건절, 결과절" 형태로 재구성
  const restructured: Array<{ text: string; connective?: ConnectiveInfo }> = [];

  // 조건절 이전의 절들
  for (let i = 0; i < conditionalIndex; i++) {
    const clause = clauses[i];
    if (clause) {
      restructured.push(clause);
    }
  }

  // 조건문 재구성
  restructured.push({
    text: `If ${lowerFirst(conditionalClause.text)}, ${lowerFirst(resultClause.text)}`,
    connective: undefined,
  });

  // 결과절 이후의 절들
  for (let i = conditionalIndex + 2; i < clauses.length; i++) {
    const clause = clauses[i];
    if (clause) {
      restructured.push(clause);
    }
  }

  return restructured;
}

// ========================================
// 유틸리티
// ========================================

/**
 * 복합 문장인지 판별
 */
export function isCompoundSentence(text: string): boolean {
  // 쉼표가 있거나 연결어미가 있으면 복합 문장
  if (text.includes(',')) return true;

  // 연결어미 패턴 검사
  const tokens = text.split(/\s+/);
  for (const token of tokens) {
    for (const { pattern } of CONNECTIVE_PATTERNS) {
      if (token.endsWith(pattern) && token.length > pattern.length) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 연결어미 추출
 */
export function extractConnective(token: string): ConnectiveInfo | null {
  for (const { pattern, info } of CONNECTIVE_PATTERNS) {
    if (token.endsWith(pattern) && token.length > pattern.length) {
      return info;
    }
  }
  return null;
}
