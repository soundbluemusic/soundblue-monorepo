/**
 * 절(Clause) 파서
 *
 * 복합문을 단순절로 분리하고, 각 절의 유형을 파악
 *
 * Phase 7: 절 구조 (Clause Structures)
 * - 7.1: 명사절 (that/if/wh- clauses)
 * - 7.2: 관계절 (who/which/that/where/when)
 * - 7.3: 부사절 (when/while/before/after/because)
 * - 7.4: 인용절 (직접/간접 인용)
 */

export type ClauseType =
  | 'main' // 주절
  | 'noun' // 명사절 (that-절, if/whether-절, wh-절)
  | 'relative' // 관계절 (who/which/that)
  | 'adverbial' // 부사절 (when/while/before/after/because)
  | 'quotation' // 인용절 (직접/간접 인용)
  | 'conditional'; // 조건절 (if)

export interface Clause {
  type: ClauseType;
  text: string;
  connector?: string; // 연결사 (that, when, if 등)
  connectorKo?: string; // 한국어 연결어미 (-면, -ㄹ 때 등)
  isSubordinate: boolean; // 종속절 여부
}

export interface ParsedClauses {
  original: string;
  clauses: Clause[];
  structure: 'simple' | 'compound' | 'complex' | 'compound-complex';
}

// ============================================
// 영어 절 분리 패턴
// ============================================

/** 명사절 도입어 (that-clause, wh-clause) */
const NOUN_CLAUSE_MARKERS = [
  'that',
  'what',
  'who',
  'whom',
  'which',
  'when',
  'where',
  'why',
  'how',
  'whether',
  'if',
];

/** 관계절 도입어 */
const _RELATIVE_CLAUSE_MARKERS = ['who', 'whom', 'whose', 'which', 'that', 'where', 'when'];

/** 부사절 도입어 (접속사) */
const ADVERBIAL_CLAUSE_MARKERS: Record<string, { ko: string; type: string }> = {
  // 시간
  when: { ko: '-ㄹ 때', type: 'time' },
  while: { ko: '-는 동안', type: 'time' },
  before: { ko: '-기 전에', type: 'time' },
  after: { ko: '-ㄴ 후에', type: 'time' },
  until: { ko: '-ㄹ 때까지', type: 'time' },
  since: { ko: '-ㄴ 이후로', type: 'time' }, // 시간/이유 중의적 (기본: 시간)
  as: { ko: '-ㄹ 때', type: 'time' }, // 시간/이유 중의적 (기본: 시간)

  // 이유
  because: { ko: '-기 때문에', type: 'reason' },
  // since, as는 위에서 정의 (중의적)

  // 조건
  if: { ko: '-면', type: 'condition' },
  unless: { ko: '-지 않으면', type: 'condition' },

  // 양보
  although: { ko: '-지만', type: 'concession' },
  though: { ko: '-더라도', type: 'concession' },
  'even though': { ko: '-에도 불구하고', type: 'concession' },
  'even if': { ko: '-더라도', type: 'concession' },

  // 목적
  'so that': { ko: '-도록', type: 'purpose' },
  'in order that': { ko: '-기 위해', type: 'purpose' },

  // 결과
  'so...that': { ko: '너무 ~해서', type: 'result' },
};

/** 등위 접속사 (compound sentence) */
const COORDINATING_CONJUNCTIONS = ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'];

// ============================================
// 한국어 절 분리 패턴
// ============================================

/** 한국어 연결어미 패턴 */
const KO_CONNECTIVE_ENDINGS: Record<string, { en: string; type: ClauseType }> = {
  // 시간 연결
  ㄹ때: { en: 'when', type: 'adverbial' },
  을때: { en: 'when', type: 'adverbial' },
  는동안: { en: 'while', type: 'adverbial' },
  면서: { en: 'while', type: 'adverbial' },
  으면서: { en: 'while', type: 'adverbial' },
  기전에: { en: 'before', type: 'adverbial' },
  ㄴ후에: { en: 'after', type: 'adverbial' },
  은후에: { en: 'after', type: 'adverbial' },

  // 이유 연결
  아서: { en: 'because', type: 'adverbial' },
  어서: { en: 'because', type: 'adverbial' },
  니까: { en: 'because', type: 'adverbial' },
  으니까: { en: 'because', type: 'adverbial' },
  기때문에: { en: 'because', type: 'adverbial' },

  // 조건/양보
  면: { en: 'if', type: 'conditional' },
  으면: { en: 'if', type: 'conditional' },
  더라도: { en: 'even if', type: 'adverbial' },
  지만: { en: 'but', type: 'adverbial' },
  는데: { en: 'but/and', type: 'adverbial' },
  ㄴ데: { en: 'but/and', type: 'adverbial' },

  // 목적/결과
  려고: { en: 'in order to', type: 'adverbial' },
  으려고: { en: 'in order to', type: 'adverbial' },
  도록: { en: 'so that', type: 'adverbial' },
  게: { en: 'so that', type: 'adverbial' },

  // 나열/병렬
  고: { en: 'and', type: 'main' },

  // 인용
  라고: { en: 'that (quote)', type: 'quotation' },
  다고: { en: 'that (quote)', type: 'quotation' },
  냐고: { en: 'whether (quote)', type: 'quotation' },
};

/** 한국어 명사절 어미 */
const _KO_NOUN_CLAUSE_ENDINGS = [
  '는것', // -는 것 (what)
  'ㄴ것', // -ㄴ 것 (what)
  'ㄹ것', // -ㄹ 것 (what)
  '는지', // -는지 (whether)
  'ㄴ지', // -ㄴ지 (whether)
  'ㄹ지', // -ㄹ지 (whether)
  '기', // -기 (gerund)
  '음', // -음 (nominalization)
];

// ============================================
// 절 분리 함수
// ============================================

/**
 * 영어 문장을 절로 분리
 *
 * @param text 영어 문장
 * @returns 분리된 절 목록
 */
export function parseEnglishClauses(text: string): ParsedClauses {
  const clauses: Clause[] = [];
  const normalized = text.trim();

  // 1. 쉼표, 세미콜론, 접속사로 분리
  const segments = splitByConnectors(normalized, 'en');

  if (segments.length === 1) {
    // 단문
    clauses.push({
      type: 'main',
      text: segments[0].text,
      isSubordinate: false,
    });
    return { original: text, clauses, structure: 'simple' };
  }

  // 2. 각 세그먼트의 절 유형 판단
  for (const segment of segments) {
    const clauseType = identifyEnglishClauseType(segment.text, segment.connector);
    clauses.push({
      type: clauseType,
      text: segment.text,
      connector: segment.connector,
      connectorKo: segment.connector
        ? ADVERBIAL_CLAUSE_MARKERS[segment.connector.toLowerCase()]?.ko
        : undefined,
      isSubordinate: clauseType !== 'main',
    });
  }

  // 3. 문장 구조 판단
  const hasSubordinate = clauses.some((c) => c.isSubordinate);
  const hasCoordinate = clauses.filter((c) => !c.isSubordinate).length > 1;

  let structure: ParsedClauses['structure'];
  if (hasSubordinate && hasCoordinate) {
    structure = 'compound-complex';
  } else if (hasSubordinate) {
    structure = 'complex';
  } else if (hasCoordinate) {
    structure = 'compound';
  } else {
    structure = 'simple';
  }

  return { original: text, clauses, structure };
}

/**
 * 한국어 문장을 절로 분리
 *
 * @param text 한국어 문장
 * @returns 분리된 절 목록
 */
export function parseKoreanClauses(text: string): ParsedClauses {
  const clauses: Clause[] = [];
  const normalized = text.trim();

  // 1. 연결어미 패턴으로 분리
  const segments = splitByConnectors(normalized, 'ko');

  if (segments.length === 1) {
    // 단문
    clauses.push({
      type: 'main',
      text: segments[0].text,
      isSubordinate: false,
    });
    return { original: text, clauses, structure: 'simple' };
  }

  // 2. 각 세그먼트의 절 유형 판단
  for (const segment of segments) {
    const endingInfo = segment.connector ? KO_CONNECTIVE_ENDINGS[segment.connector] : undefined;

    clauses.push({
      type: endingInfo?.type || 'main',
      text: segment.text,
      connector: endingInfo?.en,
      connectorKo: segment.connector,
      isSubordinate: endingInfo?.type !== 'main',
    });
  }

  // 3. 문장 구조 판단
  const hasSubordinate = clauses.some((c) => c.isSubordinate);
  const hasCoordinate = clauses.filter((c) => !c.isSubordinate).length > 1;

  let structure: ParsedClauses['structure'];
  if (hasSubordinate && hasCoordinate) {
    structure = 'compound-complex';
  } else if (hasSubordinate) {
    structure = 'complex';
  } else if (hasCoordinate) {
    structure = 'compound';
  } else {
    structure = 'simple';
  }

  return { original: text, clauses, structure };
}

// ============================================
// 헬퍼 함수
// ============================================

interface Segment {
  text: string;
  connector?: string;
}

/**
 * 연결사/연결어미로 문장 분리
 */
function splitByConnectors(text: string, lang: 'en' | 'ko'): Segment[] {
  if (lang === 'en') {
    return splitEnglishByConnectors(text);
  }
  return splitKoreanByConnectors(text);
}

/**
 * 영어 문장을 연결사로 분리
 *
 * 단순 분리: 쉼표나 접속사로 분리
 */
function splitEnglishByConnectors(text: string): Segment[] {
  // 접속사 목록 (긴 것부터)
  const allConnectors = [
    ...Object.keys(ADVERBIAL_CLAUSE_MARKERS),
    ...COORDINATING_CONJUNCTIONS,
  ].sort((a, b) => b.length - a.length);

  // 쉼표로 먼저 분리
  const commaParts = text.split(/,\s*/);

  if (commaParts.length === 1) {
    // 쉼표 없으면 접속사로 분리 시도
    for (const conn of allConnectors) {
      const pattern = new RegExp(`\\b${conn}\\b`, 'i');
      const match = text.match(pattern);
      if (match && match.index !== undefined && match.index > 3) {
        // 접속사가 문장 중간에 있으면 분리
        const before = text.slice(0, match.index).trim();
        const after = text.slice(match.index + conn.length).trim();
        if (before && after) {
          return [{ text: before }, { text: after, connector: conn.toLowerCase() }];
        }
      }
    }
    // 분리 불가
    return [{ text }];
  }

  // 쉼표로 분리된 경우
  const segments: Segment[] = [];
  for (let i = 0; i < commaParts.length; i++) {
    const part = commaParts[i].trim();
    if (!part) continue;

    // 각 부분에서 접속사 확인
    let foundConnector: string | undefined;
    let cleanPart = part;

    for (const conn of allConnectors) {
      const pattern = new RegExp(`^${conn}\\b`, 'i');
      if (pattern.test(part)) {
        foundConnector = conn.toLowerCase();
        cleanPart = part.slice(conn.length).trim();
        break;
      }
    }

    if (cleanPart) {
      segments.push({
        text: cleanPart,
        connector: foundConnector,
      });
    }
  }

  if (segments.length === 0) {
    segments.push({ text });
  }

  return segments;
}

/**
 * 한국어 문장을 연결어미로 분리
 *
 * 단순 분리: 연결어미로 분리
 */
function splitKoreanByConnectors(text: string): Segment[] {
  // 연결어미 패턴 (긴 것부터 매칭)
  const endings = Object.keys(KO_CONNECTIVE_ENDINGS).sort((a, b) => b.length - a.length);

  // 첫 번째 연결어미만 찾아서 분리
  for (const ending of endings) {
    const idx = text.indexOf(ending);
    // 연결어미가 문장 중간에 있어야 함 (끝에 있으면 분리 안 함)
    if (idx !== -1 && idx > 0 && idx + ending.length < text.length) {
      const beforeText = text.slice(0, idx + ending.length).trim();
      const afterText = text.slice(idx + ending.length).trim();

      if (beforeText && afterText) {
        return [{ text: beforeText, connector: ending }, { text: afterText }];
      }
    }
  }

  // 분리 불가 - 단문
  return [{ text }];
}

/**
 * 영어 절 유형 판단
 */
function identifyEnglishClauseType(text: string, connector?: string): ClauseType {
  if (!connector) return 'main';

  const lower = connector.toLowerCase();

  // 조건절
  if (lower === 'if' || lower === 'unless') {
    return 'conditional';
  }

  // 부사절
  if (ADVERBIAL_CLAUSE_MARKERS[lower]) {
    return 'adverbial';
  }

  // 등위접속 → 주절
  if (COORDINATING_CONJUNCTIONS.includes(lower)) {
    return 'main';
  }

  // 관계절/명사절 (문맥 필요, 일단 명사절로)
  if (NOUN_CLAUSE_MARKERS.includes(lower)) {
    // that 뒤에 완전한 절이 오면 명사절
    // 불완전한 절이면 관계절
    // 간단히 판단: 동사가 있으면 명사절
    const hasVerb =
      /\b(is|are|was|were|have|has|had|do|does|did|will|would|can|could|shall|should|may|might)\b/i.test(
        text,
      );
    return hasVerb ? 'noun' : 'relative';
  }

  return 'main';
}

/**
 * 문장이 인용절을 포함하는지 확인
 */
export function hasQuotation(text: string, lang: 'en' | 'ko'): boolean {
  if (lang === 'en') {
    // 따옴표 또는 said/told/asked 등
    return (
      /["']/.test(text) ||
      /\b(said|says|told|asked|replied|answered|shouted|whispered)\b/i.test(text)
    );
  }
  // 한국어: -라고, -다고, -냐고 등
  return /[라다냐자]고/.test(text);
}

/**
 * 문장 복잡도 계산 (절 개수 기반)
 */
export function getComplexity(parsed: ParsedClauses): number {
  return parsed.clauses.length;
}
