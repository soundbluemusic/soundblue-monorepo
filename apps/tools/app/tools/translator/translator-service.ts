/**
 * 번역 서비스 (v2 래퍼)
 */

import type { TranslationDirection } from './settings';
import { translate as translateV2 } from './v2';

/**
 * 번역 함수
 */
export function translate(text: string, direction: TranslationDirection): string {
  return translateV2(text, direction);
}
