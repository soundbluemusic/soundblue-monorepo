// ========================================
// Compose - 한글 자모 조합
// ========================================

import type { Jamo } from '../types';
import {
  CHO_LIST,
  HANGUL_BASE,
  JONG_COUNT,
  JONG_LIST,
  JUNG_LIST,
  SYLLABLE_PER_CHO,
} from './constants';

/**
 * 자모를 한글 음절로 조합
 * { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' } → '한'
 */
export function compose(jamo: Jamo): string | null {
  const choIndex = CHO_LIST.indexOf(jamo.cho as (typeof CHO_LIST)[number]);
  const jungIndex = JUNG_LIST.indexOf(jamo.jung as (typeof JUNG_LIST)[number]);
  const jongIndex = jamo.jong ? JONG_LIST.indexOf(jamo.jong as (typeof JONG_LIST)[number]) : 0;

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
    return null;
  }

  const code = HANGUL_BASE + choIndex * SYLLABLE_PER_CHO + jungIndex * JONG_COUNT + jongIndex;
  return String.fromCharCode(code);
}
