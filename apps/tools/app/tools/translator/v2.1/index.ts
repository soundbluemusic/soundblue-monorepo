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

// ============================================
// 입력 어투 자동 감지
// ============================================

/**
 * 입력 텍스트의 어투를 자동 감지
 *
 * @param text 입력 텍스트
 * @param direction 번역 방향 (어떤 언어인지 판단용)
 * @returns 감지된 어투 (감지 실패 시 null)
 */
export function detectFormality(text: string, direction: Direction): Formality | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 단일 단어 판단 (짧고 어미 패턴 없음)
  // 한국어: 어미 패턴이 있으면 단어가 아님
  // 영어: 공백 없고 짧으면 단어
  if (direction === 'ko-en') {
    // 한국어 입력 → 한국어 어미 분석
    return detectKoreanFormality(trimmed);
  } else {
    // 영어: 공백 없고 짧으면 단어
    const isSingleWord = !trimmed.includes(' ') && trimmed.length < 15;
    if (isSingleWord) {
      return null; // 단어는 어투 없음
    }
    // 영어 입력 → 영어 표현 분석
    return detectEnglishFormality(trimmed);
  }
}

/**
 * 한국어 문장의 어투 감지
 *
 * 어미 패턴 분석:
 * - 합니다/습니다/ㅂ니다/합니까 → literal (번역체)
 * - 해요/세요/어요/아요 → formal (존댓말)
 * - 해~/어~/아~ → friendly (친근체)
 * - 해?/어?/아?/냐?/니? → casual (반말)
 * - 한다/는다/ㄴ다 → neutral (상관없음/서술체)
 */
function detectKoreanFormality(text: string): Formality | null {
  // 마지막 어절 추출 (구두점 제거)
  const cleaned = text.replace(/[.!?？！。~]+$/, '').trim();
  if (!cleaned) return null;

  // ~가 있으면 바로 friendly (길이 무관)
  if (/~/.test(text)) {
    return 'friendly';
  }

  // 단일 단어 감지 (한글만 있고 짧으면서 어미 패턴 없음)
  // 문장이 아닌 경우: 커피, 사과 등
  const hasKoreanEnding =
    /(?:합니다|습니다|ㅂ니다|합니까|습니까|ㅂ니까|해요|세요|어요|아요|에요|예요|죠|지요|네요|래요|을까요|ㄹ까요|해|어|아|지|야|냐|니|래|자|줘|봐|한다|는다|ㄴ다|요)$/.test(
      cleaned,
    );

  if (!hasKoreanEnding && cleaned.length < 10 && !cleaned.includes(' ')) {
    return null; // 단어는 어투 없음
  }

  // 어미 패턴 (우선순위 순 - 더 구체적인 것부터)

  // 1. literal (번역체) - 가장 격식체
  // 니다/니까로 끝나는 패턴 (합니다, 습니다, 갑니다 등)
  if (/(?:니다|니까)$/.test(cleaned)) {
    return 'literal';
  }

  // 2. formal (존댓말) - 해요체
  if (
    /(?:해요|세요|어요|아요|에요|예요|죠|지요|네요|래요|을까요|ㄹ까요|실래요|으실래요|요)$/.test(
      cleaned,
    )
  ) {
    return 'formal';
  }

  // 3. casual (반말) - 해체
  if (/(?:해|어|아|지|야|냐|니|래|자|줘|봐|해봐|해줘|가)$/.test(cleaned)) {
    return 'casual';
  }

  // 4. neutral (서술체) - 한다/는다/ㄴ다
  if (/(?:한다|는다|ㄴ다|다|군|구나|네|로군|로다)$/.test(cleaned)) {
    return 'neutral';
  }

  return null;
}

/**
 * 영어 문장의 어투 감지
 *
 * 표현 패턴 분석:
 * - Would you / Could you / May I → formal
 * - Please / kindly → formal
 * - Hey / Yo / Dude / Man → casual
 * - 일반 문장 → neutral
 *
 * 영어는 한국어만큼 어투 구분이 명확하지 않음
 */
function detectEnglishFormality(text: string): Formality | null {
  const lower = text.toLowerCase();

  // formal 표현
  if (
    /^(would you|could you|may i|might i|shall we|i would like)/i.test(lower) ||
    /\b(please|kindly|respectfully|if you don't mind)\b/i.test(lower)
  ) {
    return 'formal';
  }

  // casual 표현
  if (
    /^(hey|yo|sup|dude|man|bro|sis|girl|buddy)\b/i.test(lower) ||
    /\b(gonna|wanna|gotta|kinda|sorta|lemme|gimme)\b/i.test(lower)
  ) {
    return 'casual';
  }

  // 영어는 대부분 neutral로 처리
  return 'neutral';
}

// 타입 re-export
export type { Direction, Formality, TranslationResult } from './types';
