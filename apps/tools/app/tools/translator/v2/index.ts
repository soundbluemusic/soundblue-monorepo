/**
 * 번역기 v2 메인 엔트리
 *
 * 설계 원칙:
 * 1. 단순함: 토큰화 → 역할부여 → 어순변환 → 출력
 * 2. 데이터 분리: 모든 사전/규칙은 data.ts에
 * 3. 확장성: 새 규칙 추가는 data.ts만 수정
 */

import { generateEnglish, generateKorean } from './generator';
import { parseEnglish, parseKorean } from './tokenizer';
import type { Direction, Formality, TranslationResult } from './types';

export interface TranslateOptions {
  formality?: Formality;
}

/**
 * 메인 번역 함수
 */
export function translate(text: string, direction: Direction, options?: TranslateOptions): string {
  const result = translateWithInfo(text, direction, options);
  return result.translated;
}

/**
 * 디버그 정보 포함 번역
 */
export function translateWithInfo(
  text: string,
  direction: Direction,
  options?: TranslateOptions,
): TranslationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translated: '', original: text };
  }

  const formality = options?.formality || 'neutral';

  // 문장 분리 (?, !, . 기준)
  const sentences = splitSentences(trimmed);
  const results: string[] = [];

  for (const { sentence, punctuation } of sentences) {
    let translated: string;
    // 파싱 시 구두점 정보 포함 (의문문 감지용)
    const sentenceWithPunctuation = punctuation ? sentence + punctuation : sentence;

    if (direction === 'ko-en') {
      const parsed = parseKorean(sentenceWithPunctuation);
      translated = generateEnglish(parsed);
    } else {
      const parsed = parseEnglish(sentenceWithPunctuation);
      translated = generateKorean(parsed, formality);
    }

    // 구두점 복원 (이미 번역 결과에 포함된 경우 중복 방지)
    if (punctuation && !translated.endsWith(punctuation)) {
      translated += punctuation;
    }

    results.push(translated);
  }

  return {
    translated: results.join(' '),
    original: text,
  };
}

/**
 * 문장 분리
 */
function splitSentences(text: string): Array<{ sentence: string; punctuation: string }> {
  const results: Array<{ sentence: string; punctuation: string }> = [];

  // 구두점으로 분리
  const parts = text.split(/([.!?？！。]+)/);

  for (let i = 0; i < parts.length; i += 2) {
    const sentence = parts[i]?.trim();
    const punctuation = parts[i + 1] || '';

    if (sentence) {
      results.push({ sentence, punctuation: punctuation.trim() });
    }
  }

  // 분리 안 된 경우 전체를 하나의 문장으로
  if (results.length === 0 && text.trim()) {
    results.push({ sentence: text.trim(), punctuation: '' });
  }

  return results;
}

// 타입 re-export
export type { Direction, TranslationResult } from './types';
