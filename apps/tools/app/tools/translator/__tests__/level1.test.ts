// ========================================
// Level 1 Translation Tests
// 기본 문장 양방향 번역 테스트
// ========================================

import { describe, expect, it } from 'vitest';
import { translate } from '../translator-service';

/**
 * Level 1 테스트 케이스
 * - 단순 SVO 문장
 * - 기본 시제 (현재, 과거)
 * - 기본 조사 (은/는, 이/가, 을/를, 에)
 */
const LEVEL_1_CASES = [
  // === 기본 현재형 ===
  { ko: '나는 학교에 간다', en: 'I go to school' },
  { ko: '그녀는 책을 읽는다', en: 'She reads a book' },
  { ko: '고양이가 우유를 마신다', en: 'The cat drinks milk' },
  { ko: '그는 음악을 듣는다', en: 'He listens to music' },

  // === 기본 과거형 ===
  { ko: '나는 밥을 먹었다', en: 'I ate rice' },
  { ko: '그는 학교에 갔다', en: 'He went to school' },
  { ko: '그녀는 집에 왔다', en: 'She came home' },
  { ko: '우리는 영화를 봤다', en: 'We watched a movie' },

  // === 형용사 문장 ===
  { ko: '날씨가 좋다', en: 'The weather is good' },
  { ko: '이 책은 재미있다', en: 'This book is interesting' },

  // === 존재/위치 ===
  { ko: '책이 책상 위에 있다', en: 'The book is on the desk' },
  { ko: '나는 집에 있다', en: 'I am at home' },

  // === 부정문 ===
  { ko: '나는 학교에 가지 않는다', en: 'I do not go to school' },
];

describe('Level 1: Ko → En Translation', () => {
  it.each(LEVEL_1_CASES)('$ko → $en', ({ ko, en }) => {
    const result = translate(ko, 'ko-en');
    // 대소문자 무시, 관사(a/an/the) 유연하게 비교
    const normalizedResult = normalizeEnglish(result);
    const normalizedExpected = normalizeEnglish(en);

    expect(normalizedResult).toBe(normalizedExpected);
  });
});

describe('Level 1: En → Ko Translation', () => {
  it.each(LEVEL_1_CASES)('$en → $ko', ({ ko, en }) => {
    const result = translate(en, 'en-ko');
    // 한국어 비교 (조사 변형 허용)
    const normalizedResult = normalizeKorean(result);
    const normalizedExpected = normalizeKorean(ko);

    expect(normalizedResult).toBe(normalizedExpected);
  });
});

/**
 * 영어 정규화 (비교용)
 * - 소문자 변환
 * - 관사 제거 (a, an, the)
 * - 여러 공백 → 단일 공백
 */
function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(a|an|the)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 한국어 정규화 (비교용)
 * - 조사 변형 통일 (은/는/이/가 → 가, 을/를 → 를)
 * - 주격과 주제격을 모두 '가'로 통일하여 번역 결과 비교 유연화
 */
function normalizeKorean(text: string): string {
  return text
    .replace(/은|는|이|가/g, '가') // 주격/주제격 모두 '가'로 통일
    .replace(/을|를/g, '를')
    .replace(/\s+/g, ' ')
    .trim();
}
