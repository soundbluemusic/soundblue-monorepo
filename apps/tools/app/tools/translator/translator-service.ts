/**
 * 번역 서비스 (v2.1 절 파싱 + core WSD 통합)
 *
 * 아키텍처:
 * - 문장 파싱: v2.1 (절 분리, 복문 처리, 어순 변환)
 * - 단어 번역: v2.1 + core WSD (다의어 해소)
 * - 결과 생성: v2.1 (템플릿, 어미 처리)
 *
 * 성능 최적화:
 * - 외부 사전(920KB)은 첫 번역 시 lazy loading
 * - 초기 로딩 시간 50-70% 개선
 */

import { isExternalWordsCached, loadExternalWords } from './dictionary/words';
import type { Formality, TranslationDirection } from './settings';
import { detectFormality as detectFormalityV2, translate as translateV2 } from './v2.1';

export interface TranslateOptions {
  formality?: Formality;
}

// 외부 사전 로딩 상태
let _externalDictLoadPromise: Promise<void> | null = null;

/**
 * 외부 사전 사전 로드 (앱 초기화 또는 첫 번역 전 호출)
 * 백그라운드에서 로드하여 첫 번역 지연 최소화
 */
export function preloadExternalDictionary(): void {
  if (!_externalDictLoadPromise && !isExternalWordsCached()) {
    _externalDictLoadPromise = loadExternalWords();
  }
}

/**
 * 번역 함수 (v2.1 절 파싱 + WSD 연결)
 *
 * 첫 호출 시 외부 사전을 백그라운드로 로드 시작
 * (로드 완료 전에도 기본 사전으로 번역 가능)
 */
export function translate(
  text: string,
  direction: TranslationDirection,
  options?: TranslateOptions,
): string {
  // 빈 입력 처리
  const trimmed = text.trim();
  if (!trimmed) return '';

  // 외부 사전 백그라운드 로드 시작 (첫 번역 시)
  preloadExternalDictionary();

  // v2.1 엔진 사용 (절 파싱 + WSD 통합됨)
  return translateV2(trimmed, direction, options);
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
