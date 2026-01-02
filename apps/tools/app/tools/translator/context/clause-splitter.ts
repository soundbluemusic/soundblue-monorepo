// ========================================
// Clause Splitter - 절 분할기
// ========================================

import type { Clause, Domain } from './types';

/**
 * 절 분할 규칙
 */
interface SplitRule {
  pattern: RegExp;
  type: 'conjunction' | 'punctuation' | 'relative' | 'adverbial';
  keepDelimiter: 'before' | 'after' | 'none';
}

/**
 * 영어 분할 규칙
 */
const ENGLISH_SPLIT_RULES: SplitRule[] = [
  // === 접속사 기반 분할 ===
  // 등위 접속사 (Coordinating conjunctions)
  {
    pattern: /\s+but\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+and\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+or\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+yet\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+so\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },

  // 종속 접속사 (Subordinating conjunctions)
  {
    pattern: /\s+because\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+although\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+though\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+while\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+whereas\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+since\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+if\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+unless\s+/gi,
    type: 'conjunction',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+when\s+/gi,
    type: 'adverbial',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+after\s+/gi,
    type: 'adverbial',
    keepDelimiter: 'after',
  },
  {
    pattern: /\s+before\s+/gi,
    type: 'adverbial',
    keepDelimiter: 'after',
  },

  // === 관계절 기반 분할 ===
  {
    pattern: /,\s*who\s+/gi,
    type: 'relative',
    keepDelimiter: 'after',
  },
  {
    pattern: /,\s*which\s+/gi,
    type: 'relative',
    keepDelimiter: 'after',
  },
  {
    pattern: /,\s*that\s+/gi,
    type: 'relative',
    keepDelimiter: 'after',
  },
  {
    pattern: /,\s*where\s+/gi,
    type: 'relative',
    keepDelimiter: 'after',
  },

  // === 구두점 기반 분할 ===
  {
    pattern: /;\s*/g,
    type: 'punctuation',
    keepDelimiter: 'none',
  },
  {
    pattern: /,\s+/g,
    type: 'punctuation',
    keepDelimiter: 'none',
  },
];

/**
 * 한국어 분할 규칙
 */
const KOREAN_SPLIT_RULES: SplitRule[] = [
  // === 연결 어미 기반 분할 ===
  // 대조/역접
  {
    pattern: /지만\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /는데\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /으나\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },

  // 원인/이유
  {
    pattern: /아서\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /어서\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /니까\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /므로\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },

  // 조건
  {
    pattern: /으면\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /면\s+/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },
  {
    pattern: /다면\s*/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },

  // 나열
  {
    pattern: /고\s+/g,
    type: 'conjunction',
    keepDelimiter: 'before',
  },

  // === 구두점 기반 분할 ===
  {
    pattern: /,\s*/g,
    type: 'punctuation',
    keepDelimiter: 'none',
  },
];

/**
 * 언어 감지
 */
function detectLanguage(text: string): 'korean' | 'english' {
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  return koreanChars > englishChars ? 'korean' : 'english';
}

/**
 * 텍스트를 절로 분할
 *
 * @param text - 분할할 텍스트
 * @returns 절 배열
 *
 * @example
 * splitIntoClauses("The developer pushed the branch, but got an injection in his deltoid")
 * // → [
 * //   { text: "The developer pushed the branch", startIndex: 0, endIndex: 33, confidence: 0 },
 * //   { text: "but got an injection in his deltoid", startIndex: 35, endIndex: 71, confidence: 0 }
 * // ]
 */
export function splitIntoClauses(text: string): Clause[] {
  const language = detectLanguage(text);
  const rules = language === 'korean' ? KOREAN_SPLIT_RULES : ENGLISH_SPLIT_RULES;

  // 분할 지점 찾기
  interface SplitPoint {
    index: number;
    length: number;
    type: SplitRule['type'];
    keepDelimiter: SplitRule['keepDelimiter'];
    delimiter: string;
  }

  const splitPoints: SplitPoint[] = [];

  for (const rule of rules) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match = regex.exec(text);

    while (match) {
      splitPoints.push({
        index: match.index,
        length: match[0].length,
        type: rule.type,
        keepDelimiter: rule.keepDelimiter,
        delimiter: match[0],
      });
      match = regex.exec(text);
    }
  }

  // 분할 지점이 없으면 전체 텍스트를 하나의 절로
  if (splitPoints.length === 0) {
    return [
      {
        text: text.trim(),
        startIndex: 0,
        endIndex: text.length,
        confidence: 0,
      },
    ];
  }

  // 인덱스 순으로 정렬
  splitPoints.sort((a, b) => a.index - b.index);

  // 겹치는 분할 지점 제거 (우선순위: conjunction > relative > punctuation)
  const typePriority: Record<SplitRule['type'], number> = {
    conjunction: 3,
    relative: 2,
    adverbial: 2,
    punctuation: 1,
  };

  const filteredSplitPoints: SplitPoint[] = [];
  for (const point of splitPoints) {
    const overlapping = filteredSplitPoints.find(
      (p) => Math.abs(p.index - point.index) < Math.max(p.length, point.length),
    );

    if (!overlapping) {
      filteredSplitPoints.push(point);
    } else if (typePriority[point.type] > typePriority[overlapping.type]) {
      // 더 높은 우선순위로 교체
      const idx = filteredSplitPoints.indexOf(overlapping);
      filteredSplitPoints[idx] = point;
    }
  }

  // 절 생성
  const clauses: Clause[] = [];
  let currentStart = 0;

  for (const point of filteredSplitPoints) {
    // 현재 절의 텍스트 추출
    let clauseText: string;
    let nextStart: number;

    if (point.keepDelimiter === 'before') {
      // 구분자를 현재 절 끝에 포함
      clauseText = text.slice(currentStart, point.index + point.length);
      nextStart = point.index + point.length;
    } else if (point.keepDelimiter === 'after') {
      // 구분자를 다음 절 시작에 포함
      clauseText = text.slice(currentStart, point.index);
      nextStart = point.index;
    } else {
      // 구분자 제거
      clauseText = text.slice(currentStart, point.index);
      nextStart = point.index + point.length;
    }

    const trimmedText = clauseText.trim();
    if (trimmedText.length > 0) {
      clauses.push({
        text: trimmedText,
        startIndex: currentStart,
        endIndex: point.index + (point.keepDelimiter === 'before' ? point.length : 0),
        confidence: 0,
      });
    }

    currentStart = nextStart;
  }

  // 마지막 절
  const lastText = text.slice(currentStart).trim();
  if (lastText.length > 0) {
    clauses.push({
      text: lastText,
      startIndex: currentStart,
      endIndex: text.length,
      confidence: 0,
    });
  }

  return clauses;
}

/**
 * 절에 도메인 할당 (외부에서 호출)
 */
export function assignDomainToClause(clause: Clause, domain: Domain, confidence: number): Clause {
  return {
    ...clause,
    domain,
    confidence,
  };
}

/**
 * 너무 짧은 절을 이전 절과 병합
 * (예: "but" 단독으로 절이 된 경우)
 */
export function mergeShortClauses(clauses: Clause[], minLength = 5): Clause[] {
  if (clauses.length <= 1) return clauses;

  const merged: Clause[] = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];

    if (clause.text.length < minLength && merged.length > 0) {
      // 이전 절과 병합
      const prev = merged[merged.length - 1];
      merged[merged.length - 1] = {
        text: `${prev.text} ${clause.text}`,
        startIndex: prev.startIndex,
        endIndex: clause.endIndex,
        domain: prev.domain, // 이전 절의 도메인 유지
        confidence: prev.confidence,
      };
    } else {
      merged.push(clause);
    }
  }

  return merged;
}
