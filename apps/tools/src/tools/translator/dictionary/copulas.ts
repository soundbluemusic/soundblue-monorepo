// ========================================
// Copulas - 서술격 조사 (이다/아니다)
// ========================================

export interface CopulaInfo {
  type: 'positive' | 'negative'; // 이다 / 아니다
  tense: 'present' | 'past' | 'future';
  formality: 'formal' | 'polite' | 'casual';
  en: string;
}

/**
 * 서술격 조사 사전
 * "이다" 계열 - be 동사
 */
export const copulas: Record<string, CopulaInfo> = {
  // === 긍정 (이다) - 현재 ===
  입니다: { type: 'positive', tense: 'present', formality: 'formal', en: 'is' },
  이에요: { type: 'positive', tense: 'present', formality: 'polite', en: 'is' },
  예요: { type: 'positive', tense: 'present', formality: 'polite', en: 'is' },
  이야: { type: 'positive', tense: 'present', formality: 'casual', en: 'is' },
  야: { type: 'positive', tense: 'present', formality: 'casual', en: 'is' },
  이다: { type: 'positive', tense: 'present', formality: 'casual', en: 'is' },

  // === 긍정 (이다) - 과거 ===
  이었습니다: { type: 'positive', tense: 'past', formality: 'formal', en: 'was' },
  였습니다: { type: 'positive', tense: 'past', formality: 'formal', en: 'was' },
  이었어요: { type: 'positive', tense: 'past', formality: 'polite', en: 'was' },
  였어요: { type: 'positive', tense: 'past', formality: 'polite', en: 'was' },
  이었어: { type: 'positive', tense: 'past', formality: 'casual', en: 'was' },
  였어: { type: 'positive', tense: 'past', formality: 'casual', en: 'was' },

  // === 부정 (아니다) - 현재 ===
  아닙니다: { type: 'negative', tense: 'present', formality: 'formal', en: 'is not' },
  아니에요: { type: 'negative', tense: 'present', formality: 'polite', en: 'is not' },
  아니야: { type: 'negative', tense: 'present', formality: 'casual', en: 'is not' },

  // === 부정 (아니다) - 과거 ===
  아니었습니다: { type: 'negative', tense: 'past', formality: 'formal', en: 'was not' },
  아니었어요: { type: 'negative', tense: 'past', formality: 'polite', en: 'was not' },
  아니었어: { type: 'negative', tense: 'past', formality: 'casual', en: 'was not' },
};

// 서술격 조사 목록 (길이순 정렬 - 긴 것 먼저 매칭)
export const copulaList = Object.keys(copulas).sort((a, b) => b.length - a.length);

/**
 * 서술격 조사 추출 시도
 * '학생입니다' → { noun: '학생', copula: '입니다' }
 */
export function tryExtractCopula(
  word: string,
): { noun: string; copula: string; info: CopulaInfo } | null {
  for (const c of copulaList) {
    if (word.endsWith(c) && word.length > c.length) {
      const info = copulas[c];
      if (!info) continue;

      const noun = word.slice(0, -c.length);
      return {
        noun,
        copula: c,
        info,
      };
    }
  }
  return null;
}

/**
 * 주어에 따른 be 동사 선택
 */
export function selectBeVerb(subject: string, tense: 'present' | 'past'): string {
  const lowerSubject = subject.toLowerCase();

  if (tense === 'past') {
    if (
      lowerSubject === 'i' ||
      lowerSubject === 'he' ||
      lowerSubject === 'she' ||
      lowerSubject === 'it'
    ) {
      return 'was';
    }
    return 'were';
  }

  // present
  if (lowerSubject === 'i') {
    return 'am';
  }
  if (lowerSubject === 'he' || lowerSubject === 'she' || lowerSubject === 'it') {
    return 'is';
  }
  return 'are';
}
