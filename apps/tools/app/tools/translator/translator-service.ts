/**
 * 번역 서비스 (v2.1 래퍼)
 */

import type { Formality, TranslationDirection } from './settings';
import { detectFormality as detectFormalityV2, translate as translateV2 } from './v2.1';

export interface TranslateOptions {
  formality?: Formality;
}

/**
 * 번역 함수
 */
export function translate(
  text: string,
  direction: TranslationDirection,
  options?: TranslateOptions,
): string {
  return translateV2(text, direction, options);
}

/**
 * 입력 텍스트의 어투를 자동 감지
 *
 * @param text 입력 텍스트
 * @param direction 번역 방향
 * @returns 감지된 어투 (감지 실패 시 null)
 */
export function detectFormality(text: string, direction: TranslationDirection): Formality | null {
  return detectFormalityV2(text, direction);
}
