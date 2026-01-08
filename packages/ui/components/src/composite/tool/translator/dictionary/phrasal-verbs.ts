// ========================================
// Phrasal Verbs Dictionary - 구동사 사전
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 구동사 번역 함수
// ========================================

import { lookupExternalEnToKo } from './external';

// 흔한 구동사 패턴 (동사 + 전치사/부사)
const PHRASAL_VERB_PARTICLES = [
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'away',
  'back',
  'through',
  'around',
  'along',
  'about',
  'across',
  'after',
  'ahead',
  'apart',
  'aside',
  'by',
  'forward',
  'together',
];

/**
 * 구동사인지 판단
 */
export function isPhrasalVerb(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 2) return false;

  // 마지막 단어가 particle인지 확인
  const lastWord = words[words.length - 1];
  return PHRASAL_VERB_PARTICLES.includes(lastWord);
}

/**
 * 구동사 조회 (영→한, lazy loading)
 */
export function lookupPhrasalVerb(phrasal: string): string | null {
  return lookupExternalEnToKo(phrasal);
}

/**
 * 문장에서 구동사 번역
 * external 사전을 사용하여 구동사를 한국어로 변환 (lazy loading)
 */
export function translatePhrasalVerbs(text: string): { translated: string; found: boolean } {
  let result = text.toLowerCase();
  let found = false;

  // 2-3단어 구동사 패턴 찾기
  for (const particle of PHRASAL_VERB_PARTICLES) {
    // "verb + particle" 패턴
    const pattern = new RegExp(`\\b(\\w+)\\s+${particle}\\b`, 'gi');
    const matches = result.matchAll(pattern);

    for (const match of matches) {
      const fullPhrasal = match[0].toLowerCase();
      const translation = lookupExternalEnToKo(fullPhrasal);
      if (translation) {
        result = result.replace(new RegExp(`\\b${fullPhrasal}\\b`, 'gi'), translation);
        found = true;
      }
    }
  }

  return { translated: result, found };
}

// 하위 호환성을 위한 빈 객체 export
// 실제 데이터는 external에서 통합됨
export const phrasalVerbs: Record<string, string> = {};
export const phrasalVerbList: string[] = [];
