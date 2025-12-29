// ========================================
// English Morpheme Engine - 영어 형태소 분해/조합
// ========================================

import {
  extractPrefix,
  getPrefixInfo,
  type PrefixInfo,
  translatePrefix,
} from '../../dictionary/morphology/english-prefixes';
import {
  extractSuffix,
  restoreStem,
  type SuffixInfo,
  translateSuffix,
} from '../../dictionary/morphology/english-suffixes';

export interface EnglishMorpheme {
  prefix: string; // un, re, pre...
  stem: string; // happy, write, eat...
  suffix: string; // ness, ing, ed...
  original: string;
  prefixInfo?: PrefixInfo;
  suffixInfo?: SuffixInfo;
}

/**
 * 영어 단어를 형태소로 분해
 * unhappiness → {prefix: 'un', stem: 'happy', suffix: 'ness'}
 */
export function decomposeEnglish(word: string): EnglishMorpheme {
  // 1. 접두사 추출
  const prefix = extractPrefix(word);
  const remaining = prefix ? word.slice(prefix.length) : word;

  // 2. 접미사 추출
  const suffixInfo = extractSuffix(remaining);
  const suffix = suffixInfo?.suffix || '';

  // 3. 어간 복원
  const stem = suffixInfo ? restoreStem(remaining, suffixInfo) : remaining;

  // 4. 접두사 정보
  const prefixInfo = prefix ? getPrefixInfo(prefix) : undefined;

  return {
    prefix: prefix || '',
    stem,
    suffix,
    original: word,
    prefixInfo: prefixInfo || undefined,
    suffixInfo: suffixInfo || undefined,
  };
}

/**
 * 형태소를 영어 단어로 조합
 * {prefix: 'un', stem: 'happy', suffix: 'ness'} → unhappiness
 */
export function composeEnglish(morpheme: EnglishMorpheme): string {
  return morpheme.prefix + morpheme.stem + morpheme.suffix;
}

/**
 * 영어 형태소를 한국어로 번역 (어간 사전 없이 접사만)
 * {prefix: 'un', stem: 'happy', suffix: 'ness'} → '불' + 'happy' + '함'
 */
export function translateEnglishMorpheme(
  morpheme: EnglishMorpheme,
  stemTranslation?: string,
): string {
  const koPrefix = translatePrefix(morpheme.prefix);
  const koStem = stemTranslation || morpheme.stem;
  const koSuffix = translateSuffix(morpheme.suffix);

  return koPrefix + koStem + koSuffix;
}

/**
 * 여러 분해 결과 반환 (애매한 경우 대비)
 * reading → [{stem: 'read', suffix: 'ing'}, {stem: 'reading', suffix: ''}]
 */
export function getAllDecompositions(word: string): EnglishMorpheme[] {
  const results: EnglishMorpheme[] = [];

  // 1. 접두사 + 접미사 분해
  results.push(decomposeEnglish(word));

  // 2. 접미사만 분해
  const suffixOnly = extractSuffix(word);
  if (suffixOnly) {
    const stem = restoreStem(word, suffixOnly);
    results.push({
      prefix: '',
      stem,
      suffix: suffixOnly.suffix,
      original: word,
      suffixInfo: suffixOnly,
    });
  }

  // 3. 원본 그대로
  if (results.length === 1 && !results[0]?.prefix && !results[0]?.suffix) {
    return results;
  }

  results.push({
    prefix: '',
    stem: word,
    suffix: '',
    original: word,
  });

  return results;
}

/**
 * 영어 단어 여부 추정 (휴리스틱)
 */
export function isLikelyEnglishWord(word: string): boolean {
  // 알파벳만 포함
  if (!/^[a-zA-Z]+$/.test(word)) {
    return false;
  }

  // 너무 짧음
  if (word.length < 2) {
    return false;
  }

  // 모음이 없음
  if (!/[aeiouAEIOU]/.test(word)) {
    return false;
  }

  return true;
}

/**
 * 어간 추출 (접두사 + 접미사 제거)
 */
export function extractStem(word: string): string {
  const morpheme = decomposeEnglish(word);
  return morpheme.stem;
}

/**
 * 접두사 한국어 변환
 */
export function getPrefixKorean(prefix: string): string {
  return translatePrefix(prefix);
}

/**
 * 접미사 한국어 변환
 */
export function getSuffixKorean(suffix: string): string {
  return translateSuffix(suffix);
}
