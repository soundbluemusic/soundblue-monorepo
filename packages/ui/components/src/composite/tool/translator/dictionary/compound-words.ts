// ========================================
// Compound Words - 복합어 분석
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 복합어 분해 및 패턴 분석 함수
// ========================================

import { lookupExternalKoToEn } from './external';

// 복합어 정의 인터페이스
export interface CompoundWordEntry {
  translation?: string;
  parts?: string[];
}

// 접미사 패턴 (명사 + 접미사)
export const suffixPatterns: Record<string, { meaning: string; type: string }> = {
  사람: { meaning: 'person', type: 'noun' },
  분: { meaning: 'person (honorific)', type: 'noun' },
  님: { meaning: 'honorific suffix', type: 'suffix' },
  씨: { meaning: 'Mr./Ms.', type: 'suffix' },
  역: { meaning: 'station', type: 'noun' },
  장: { meaning: 'place', type: 'noun' },
  관: { meaning: 'building', type: 'noun' },
  실: { meaning: 'room', type: 'noun' },
  점: { meaning: 'store', type: 'noun' },
  기: { meaning: 'machine/device', type: 'noun' },
  대: { meaning: 'stand/platform', type: 'noun' },
  용: { meaning: 'for use', type: 'suffix' },
  집: { meaning: 'house/shop', type: 'noun' },
  방: { meaning: 'room', type: 'noun' },
  차: { meaning: 'vehicle', type: 'noun' },
  품: { meaning: 'product', type: 'noun' },
  비: { meaning: 'cost/fee', type: 'noun' },
  금: { meaning: 'money/fee', type: 'noun' },
  증: { meaning: 'certificate', type: 'noun' },
  표: { meaning: 'ticket/table', type: 'noun' },
  서: { meaning: 'office/document', type: 'noun' },
  원: { meaning: 'center/institute', type: 'noun' },
  소: { meaning: 'place/center', type: 'noun' },
  가: { meaning: 'artist/specialist', type: 'noun' },
  사: { meaning: 'person/master', type: 'noun' },
};

// 접두사 패턴
export const prefixPatterns: Record<string, { meaning: string; type: string }> = {
  새: { meaning: 'new', type: 'adjective' },
  옛: { meaning: 'old/former', type: 'adjective' },
  헌: { meaning: 'old/used', type: 'adjective' },
  맨: { meaning: 'bare/only', type: 'adjective' },
  첫: { meaning: 'first', type: 'adjective' },
  총: { meaning: 'total/chief', type: 'adjective' },
  대: { meaning: 'big/grand', type: 'adjective' },
  소: { meaning: 'small/minor', type: 'adjective' },
  무: { meaning: 'without/free', type: 'adjective' },
  유: { meaning: 'with/paid', type: 'adjective' },
  비: { meaning: 'non-/un-', type: 'adjective' },
  재: { meaning: 're-/again', type: 'adjective' },
  초: { meaning: 'super/ultra', type: 'adjective' },
  최: { meaning: 'most/best', type: 'adjective' },
  한: { meaning: 'Korean', type: 'adjective' },
  양: { meaning: 'Western', type: 'adjective' },
  중: { meaning: 'Chinese/middle', type: 'adjective' },
  일: { meaning: 'Japanese', type: 'adjective' },
};

/**
 * 복합어 번역 또는 분해 시도
 * 1. external 사전에서 직접 번역 확인 (lazy loading)
 * 2. 접미사 패턴 분석
 * 3. 접두사 패턴 분석
 */
export function tryDecomposeCompound(
  word: string,
): { translation: string } | { parts: string[] } | null {
  // 1. external 사전에서 직접 번역 확인 (lazy loading)
  const directTranslation = lookupExternalKoToEn(word);
  if (directTranslation) {
    return { translation: directTranslation };
  }

  // 2. 접미사 패턴 확인 (일반 분해)
  for (const [suffix, _info] of Object.entries(suffixPatterns)) {
    if (word.endsWith(suffix) && word.length > suffix.length) {
      const prefix = word.slice(0, -suffix.length);
      if (prefix.length >= 1) {
        return { parts: [prefix, suffix] };
      }
    }
  }

  // 3. 접두사 패턴 확인
  for (const [prefix, _info] of Object.entries(prefixPatterns)) {
    if (word.startsWith(prefix) && word.length > prefix.length) {
      const suffixPart = word.slice(prefix.length);
      if (suffixPart.length >= 1) {
        return { parts: [prefix, suffixPart] };
      }
    }
  }

  return null;
}

/**
 * 복합어인지 확인
 */
export function isCompoundWord(word: string): boolean {
  return tryDecomposeCompound(word) !== null;
}

// 하위 호환성을 위한 빈 객체 export
// 실제 데이터는 external에서 통합됨
export const compoundWords: Record<string, CompoundWordEntry> = {};
