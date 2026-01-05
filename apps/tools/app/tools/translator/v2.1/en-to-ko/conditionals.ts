/**
 * 영어 조건문 → 한국어 번역 모듈
 * index.ts에서 분리됨 (Phase 4 리팩토링)
 *
 * g6 조건문 관련 함수들:
 * - Type 0: 일반적 사실 (If you study, you learn)
 * - Type 1: 현실 가능성 (If it snows, I will stay home)
 * - Type 2: 반사실 가정 (If I were you, I would go)
 * - Type 3: 과거 반사실 (If I had known, I would have helped)
 * - Unless: 부정 조건 (Unless you hurry)
 * - Even if: 양보 조건 (Even if it is hard)
 */

import { EN_KO } from '../data';
import { ppToBase } from '../english-utils';
import { attachKoNieun, attachKoPast, attachKoRieul, removeKoDa } from '../korean-utils';
import type { Formality, ParsedSentence } from '../types';

// ============================================
// 인터페이스
// ============================================

export interface EnglishClauseParts {
  subject?: string;
  subjectKo?: string;
  verb?: string;
  verbKo?: string;
  object?: string;
  objectKo?: string;
  complement?: string; // "you" in "I were you"
  adjectiveKo?: string;
  weatherVerb?: string;
}

// ============================================
// 메인 함수
// ============================================

/**
 * 영어 조건문 → 한국어 생성
 *
 * g6-1: If you study, you learn → 공부하면 배운다
 * g6-2: If it snows, I will stay home → 눈이 오면 집에 있을 것이다
 * g6-3: If I were you, I would go → 내가 너라면 갈 텐데
 * g6-4: If I had known, I would have helped → 알았더라면 도왔을 텐데
 */
export function generateConditionalKorean(parsed: ParsedSentence, _formality: Formality): string {
  const condType = parsed.englishConditionalType;
  const condClause = parsed.conditionalClause || '';
  const resultClause = parsed.resultClause || '';

  // 조건절에서 주어/동사 추출
  const condParts = parseEnglishConditionClause(condClause);
  const resultParts = resultClause ? parseEnglishResultClause(resultClause, condType) : null;

  switch (condType) {
    case 'type0': {
      // If + present, present → V-면 V-ㄴ다
      // "If you study, you learn" → "공부하면 배운다"
      const condKo = condParts.verbKo ? `${condParts.verbKo}면` : condClause;
      const resultKo = resultParts?.verbKo ? `${attachKoNieun(resultParts.verbKo)}다` : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type1': {
      // If + present, will + V → V-면 V-을 것이다
      // "If it snows, I will stay home" → "눈이 오면 집에 있을 것이다"
      const condKo = generateType1ConditionKorean(condParts);
      const resultKo = resultParts?.verbKo
        ? `${resultParts.objectKo || ''}${attachKoRieul(resultParts.verbKo)} 것이다`
        : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type2': {
      // If + were, would + V → N-(이)라면 V-ㄹ 텐데
      // "If I were you, I would go" → "내가 너라면 갈 텐데"
      const condKo = generateType2ConditionKorean(condParts);
      const resultKo = resultParts?.verbKo ? `${attachKoRieul(resultParts.verbKo)} 텐데` : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type3': {
      // If + had + pp, would have + pp → V-았더라면 V-었을 텐데
      // "If I had known, I would have helped" → "알았더라면 도왔을 텐데"
      const condPast = condParts.verbKo ? `${attachKoPast(condParts.verbKo)}더라면` : condClause;
      const resultPast = resultParts?.verbKo
        ? `${attachKoPast(resultParts.verbKo, resultParts.verb)}을 텐데`
        : '';
      return resultPast ? `${condPast} ${resultPast}` : condPast;
    }

    case 'unless': {
      // Unless + clause → V-지 않으면
      // "Unless you hurry" → "서두르지 않으면"
      const verbKo = condParts.verbKo || '';
      return `${verbKo}지 않으면`;
    }

    case 'even-if': {
      // Even if + clause → V-더라도
      // "Even if it is hard" → "어렵더라도"
      // 형용사인 경우 바로 -더라도 붙임
      if (condParts.adjectiveKo) {
        return `${condParts.adjectiveKo}더라도`;
      }
      const verbKo = condParts.verbKo || '';
      return `${verbKo}더라도`;
    }

    default:
      return parsed.original;
  }
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 영어 조건절 파싱 (Type 1 전용)
 */
function generateType1ConditionKorean(parts: EnglishClauseParts): string {
  // "it snows" → "눈이 오면"
  if (parts.subjectKo === '그것' && parts.weatherVerb) {
    const weatherNoun = parts.weatherVerb === 'snow' ? '눈' : '비';
    return `${weatherNoun}이 오면`;
  }
  return parts.verbKo ? `${parts.verbKo}면` : '';
}

/**
 * 영어 조건절 파싱 (Type 2 전용)
 */
function generateType2ConditionKorean(parts: EnglishClauseParts): string {
  // "I were you" → "내가 너라면"
  if (parts.complement) {
    const subjectKo = parts.subjectKo || '나';
    const complementKo = getKoreanSubject(parts.complement.toLowerCase());
    // 나 + 가 → 내가 (특수 처리)
    const subjectWithParticle = subjectKo === '나' ? '내가' : `${subjectKo}가`;
    return `${subjectWithParticle} ${complementKo}라면`;
  }
  return parts.verbKo ? `${parts.subjectKo || ''}${parts.verbKo}라면` : '';
}

/**
 * 영어 주어를 한국어로 변환 (조사 처리 포함)
 */
export function getKoreanSubject(en: string): string {
  const subjectMap: Record<string, string> = {
    i: '나',
    you: '너',
    he: '그',
    she: '그녀',
    it: '그것',
    we: '우리',
    they: '그들',
  };
  return subjectMap[en] || EN_KO[en] || en;
}

/**
 * 영어 조건절 파싱
 */
export function parseEnglishConditionClause(clause: string): EnglishClauseParts {
  const words = clause.split(/\s+/);
  const result: EnglishClauseParts = {};

  // 주어 찾기
  const subjectMatch = clause.match(/^(I|you|he|she|it|we|they)\s+/i);
  if (subjectMatch) {
    result.subject = subjectMatch[1];
    result.subjectKo = getKoreanSubject(subjectMatch[1].toLowerCase());
  }

  // "it snows/rains" 날씨 패턴
  if (/\bit\s+(snows?|rains?)/i.test(clause)) {
    result.subjectKo = '그것';
    result.weatherVerb = clause.match(/snows?/i) ? 'snow' : 'rain';
    return result;
  }

  // "I were you" 패턴 (Type 2)
  const wereMatch = clause.match(/^(\w+)\s+were\s+(\w+)$/i);
  if (wereMatch) {
    result.subject = wereMatch[1];
    result.subjectKo = getKoreanSubject(wereMatch[1].toLowerCase());
    result.complement = wereMatch[2];
    return result;
  }

  // "I had known" 패턴 (Type 3)
  const hadMatch = clause.match(/^(\w+)\s+had\s+(\w+)$/i);
  if (hadMatch) {
    result.subject = hadMatch[1];
    result.subjectKo = getKoreanSubject(hadMatch[1].toLowerCase());
    const pp = hadMatch[2].toLowerCase();
    // 과거분사 → 동사 원형 → 한국어
    const baseVerb = ppToBase(pp);
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    return result;
  }

  // "you study" 일반 패턴
  const generalMatch = clause.match(/^(\w+)\s+(\w+)$/i);
  if (generalMatch) {
    result.subject = generalMatch[1];
    result.subjectKo = getKoreanSubject(generalMatch[1].toLowerCase());
    const verb = generalMatch[2].toLowerCase();
    // 3인칭 단수 -s 제거
    const baseVerb = verb.endsWith('s') ? verb.slice(0, -1) : verb;
    result.verb = baseVerb;
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    return result;
  }

  // "you hurry" (Unless용)
  if (words.length >= 2) {
    result.subject = words[0];
    result.subjectKo = getKoreanSubject(words[0].toLowerCase());
    const verb = words[1].toLowerCase();
    result.verb = verb;
    result.verbKo = removeKoDa(EN_KO[verb] || verb);
  }

  // "it is hard" (Even if용)
  const isMatch = clause.match(/^it\s+is\s+(\w+)$/i);
  if (isMatch) {
    const adj = isMatch[1].toLowerCase();
    result.adjectiveKo = removeKoDa(EN_KO[adj] || adj);
    return result;
  }

  return result;
}

/**
 * 영어 결과절 파싱
 */
export function parseEnglishResultClause(
  clause: string,
  condType?: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if',
): EnglishClauseParts {
  const result: EnglishClauseParts = {};

  // Type 1: "I will stay home"
  const willMatch = clause.match(/^(\w+)\s+will\s+(.+)$/i);
  if (willMatch && condType === 'type1') {
    result.subject = willMatch[1];
    result.subjectKo = getKoreanSubject(willMatch[1].toLowerCase());
    // "stay home" 파싱
    const verbPart = willMatch[2].trim();
    const verbWords = verbPart.split(/\s+/);
    if (verbWords.length >= 2) {
      const verb = verbWords[0].toLowerCase();
      const obj = verbWords.slice(1).join(' ');
      result.verb = verb;
      result.verbKo = removeKoDa(EN_KO[verb] || verb);
      result.objectKo = EN_KO[obj.toLowerCase()] || '';
      // "stay home" → "집에 있" (특수 처리)
      if (verb === 'stay' && obj.toLowerCase() === 'home') {
        result.objectKo = '집에 ';
        result.verbKo = '있';
      }
    } else {
      result.verb = verbWords[0].toLowerCase();
      result.verbKo = removeKoDa(EN_KO[verbWords[0].toLowerCase()] || verbWords[0]);
    }
    return result;
  }

  // Type 2: "I would go"
  const wouldMatch = clause.match(/^(\w+)\s+would\s+(\w+)$/i);
  if (wouldMatch && condType === 'type2') {
    result.subject = wouldMatch[1];
    result.subjectKo = getKoreanSubject(wouldMatch[1].toLowerCase());
    result.verb = wouldMatch[2].toLowerCase();
    result.verbKo = removeKoDa(EN_KO[wouldMatch[2].toLowerCase()] || wouldMatch[2]);
    return result;
  }

  // Type 3: "I would have helped"
  const wouldHaveMatch = clause.match(/^(\w+)\s+would\s+have\s+(\w+)$/i);
  if (wouldHaveMatch && condType === 'type3') {
    result.subject = wouldHaveMatch[1];
    result.subjectKo = getKoreanSubject(wouldHaveMatch[1].toLowerCase());
    const pp = wouldHaveMatch[2].toLowerCase();
    const baseVerb = ppToBase(pp);
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    // 도왔 (돕 + 았) 처리 - '돕' 어간 사용
    if (baseVerb === 'help') {
      result.verbKo = '도';
    }
    return result;
  }

  // Type 0: "you learn"
  const generalMatch = clause.match(/^(\w+)\s+(\w+)$/i);
  if (generalMatch) {
    result.subject = generalMatch[1];
    result.subjectKo = getKoreanSubject(generalMatch[1].toLowerCase());
    const verb = generalMatch[2].toLowerCase();
    result.verb = verb;
    result.verbKo = removeKoDa(EN_KO[verb] || verb);
    return result;
  }

  return result;
}
