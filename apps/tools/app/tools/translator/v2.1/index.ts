/**
 * 번역기 v2.1 메인 엔트리
 *
 * 파이프라인:
 * 1. clause-parser: 복문을 단순절로 분리 (Phase 7)
 * 2. tokenizer: 토큰화 + confidence 점수
 * 3. generator: 문장 생성
 * 4. validator: 명사 역번역 검증
 *
 * 설계 원칙:
 * 1. 단순함: 절분리 → 토큰화 → 역할부여 → 어순변환 → 검증 → 출력
 * 2. 데이터 분리: 모든 사전/규칙은 data.ts에
 * 3. 확장성: 새 규칙 추가는 data.ts만 수정
 */

import { type ParsedClauses, parseEnglishClauses, parseKoreanClauses } from './clause-parser';
import { generateEnglish, generateKorean } from './generator';
import { parseEnglish, parseKorean } from './tokenizer';
import type { Direction, Formality, ParsedSentence, TranslationResult } from './types';
import { validateWordTranslation } from './validator';

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

    // Phase 7: 절 분리 시스템
    if (direction === 'ko-en') {
      translated = translateKoreanSentence(sentenceWithPunctuation, formality);
    } else {
      translated = translateEnglishSentence(sentenceWithPunctuation, formality);
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

// ============================================
// Phase 7: 절 기반 번역 시스템
// ============================================

/**
 * 한국어 문장을 절 단위로 분리하여 영어로 번역
 */
function translateKoreanSentence(sentence: string, _formality: Formality): string {
  // 1. 절 분리
  const clauseInfo = parseKoreanClauses(sentence);

  // 단문인 경우 기존 방식 사용
  if (clauseInfo.structure === 'simple') {
    const parsed = parseKorean(sentence);
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');
    return translated;
  }

  // 2. 복문인 경우 절별로 번역
  const translatedClauses: string[] = [];

  for (const clause of clauseInfo.clauses) {
    const parsed = parseKorean(clause.text);
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');

    // 연결사 추가 (영어)
    if (clause.connector && clause.isSubordinate) {
      translated = `${clause.connector} ${translated.toLowerCase()}`;
    }

    translatedClauses.push(translated);
  }

  // 3. 절 조합
  return combineEnglishClauses(translatedClauses, clauseInfo);
}

/**
 * 등위접속사 → 한국어 연결어미 매핑
 */
const COORDINATING_CONNECTOR_MAP: Record<string, string> = {
  and: '-고',
  but: '-지만',
  or: '-거나',
  so: '-아서',
  yet: '-지만',
};

/**
 * 영어 문장을 절 단위로 분리하여 한국어로 번역
 */
function translateEnglishSentence(sentence: string, formality: Formality): string {
  // 1. 절 분리
  const clauseInfo = parseEnglishClauses(sentence);

  // 단문인 경우 기존 방식 사용
  if (clauseInfo.structure === 'simple') {
    const parsed = parseEnglish(sentence);
    let translated = generateKorean(parsed, formality);
    translated = validateTranslation(parsed, translated, 'en-ko');
    return translated;
  }

  // 2. 복문인 경우 절별로 번역
  const translatedClauses: string[] = [];

  for (let i = 0; i < clauseInfo.clauses.length; i++) {
    const clause = clauseInfo.clauses[i];
    const parsed = parseEnglish(clause.text);
    let translated = generateKorean(parsed, formality);
    translated = validateTranslation(parsed, translated, 'en-ko');

    // 연결어미 추가 (한국어)
    if (clause.connectorKo && clause.isSubordinate) {
      // 종속절: 동사 어미를 연결어미로 교체
      translated = applyKoreanConnector(translated, clause.connectorKo);
    }

    // Phase 5.1: 등위접속사 처리 (compound sentence)
    // 마지막 절이 아니고, 다음 절에 등위접속사가 있으면 현재 절에 연결어미 적용
    if (i < clauseInfo.clauses.length - 1) {
      const nextClause = clauseInfo.clauses[i + 1];
      if (nextClause.connector && COORDINATING_CONNECTOR_MAP[nextClause.connector]) {
        const connectorKo = COORDINATING_CONNECTOR_MAP[nextClause.connector];
        translated = applyKoreanConnector(translated, connectorKo);
      }
    }

    translatedClauses.push(translated);
  }

  // 3. 절 조합
  return combineKoreanClauses(translatedClauses, clauseInfo);
}

/**
 * 영어 절들을 조합
 */
function combineEnglishClauses(clauses: string[], info: ParsedClauses): string {
  if (clauses.length === 0) return '';
  if (clauses.length === 1) return clauses[0];

  // 주절과 종속절 구분
  const mainClauses: string[] = [];
  const subordinateClauses: string[] = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = info.clauses[i];
    if (clause?.isSubordinate) {
      subordinateClauses.push(clauses[i]);
    } else {
      mainClauses.push(clauses[i]);
    }
  }

  // 종속절이 앞에, 주절이 뒤에 오는 경우가 많음
  // 하지만 원래 순서를 존중
  let result = clauses[0];
  for (let i = 1; i < clauses.length; i++) {
    const prevClause = info.clauses[i - 1];
    const currClause = info.clauses[i];

    // 등위접속이면 ", and/but" 사용
    if (!currClause?.isSubordinate && !prevClause?.isSubordinate) {
      result += `, ${clauses[i]}`;
    } else {
      result += ` ${clauses[i]}`;
    }
  }

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 한국어 절들을 조합
 */
function combineKoreanClauses(clauses: string[], _info: ParsedClauses): string {
  if (clauses.length === 0) return '';
  if (clauses.length === 1) return clauses[0];

  // 한국어는 종속절이 앞, 주절이 뒤
  // 순서대로 조합
  return clauses.join(' ');
}

/**
 * 한국어 문장에 연결어미 적용
 *
 * 연결어미 형식: "-고", "-지만", "-아서" 등 (하이픈 포함)
 *
 * 규칙:
 * - "간다" + "-고" → "가고" (ㄴ다 제거 + 받침 제거)
 * - "먹는다" + "-고" → "먹고" (는다 제거)
 * - "먹다" + "-고" → "먹고" (다 제거)
 */
function applyKoreanConnector(sentence: string, connector: string): string {
  // 연결어미에서 하이픈 제거
  const cleanConnector = connector.startsWith('-') ? connector.slice(1) : connector;

  // 문장을 어절로 분리
  const words = sentence.split(' ');
  if (words.length === 0) return sentence;

  // 마지막 어절에서 종결어미 제거하고 연결어미 추가
  const lastWord = words[words.length - 1];

  // 종결어미 패턴별 처리
  let stem = lastWord;
  let matched = false;

  // 1. -ㄴ다 패턴 (간다, 온다 등) - 받침 있는 어간 + ㄴ다
  // 간다 = 가 + ㄴ받침 + 다 → 어간 = 가
  if (/[가-힣]다$/.test(lastWord)) {
    const beforeDa = lastWord.slice(0, -1); // '다' 제거
    const lastChar = beforeDa[beforeDa.length - 1];

    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      // 한글 음절 범위 체크
      if (code >= 0xac00 && code <= 0xd7a3) {
        const jong = (code - 0xac00) % 28;

        // ㄴ받침(4) 또는 ㄹ받침(8)이면 종성 제거
        if (jong === 4 || jong === 8) {
          // 종성 제거
          const withoutJong = String.fromCharCode(code - jong);
          stem = beforeDa.slice(0, -1) + withoutJong;
          matched = true;
        } else if (jong === 0) {
          // 받침 없으면 그대로
          stem = beforeDa;
          matched = true;
        }
      }
    }
  }

  // 2. -는다 패턴 (먹는다 등)
  if (!matched && /는다$/.test(lastWord)) {
    stem = lastWord.slice(0, -2); // '는다' 제거
    matched = true;
  }

  // 3. 일반 -다 패턴 (받침 있는 어간)
  if (!matched && /다$/.test(lastWord)) {
    stem = lastWord.slice(0, -1);
    matched = true;
  }

  // 4. 기타 어미 패턴
  if (!matched) {
    const otherPatterns = [
      /어$/, // -어
      /아$/, // -아
      /요$/, // -요
      /니\?$/, // -니?
      /까\?$/, // -까?
    ];

    for (const pattern of otherPatterns) {
      if (pattern.test(lastWord)) {
        stem = lastWord.replace(pattern, '');
        matched = true;
        break;
      }
    }
  }

  // 어간 + 연결어미
  if (matched) {
    words[words.length - 1] = stem + cleanConnector;
    return words.join(' ');
  }

  // 매칭 안 되면 그냥 연결
  return `${sentence} ${cleanConnector}`;
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
// 명사 역번역 검증
// ============================================

/**
 * 번역 결과에서 명사를 역번역 검증
 *
 * 검증 실패한 명사가 있으면 번역된 단어를 원본으로 교체
 *
 * 예시:
 * - "유튜브" → "your tube" (검증 실패) → "유튜브"로 교체
 * - "아이폰" → "eye phone" (검증 실패) → "아이폰"으로 교체
 *
 * @param parsed 파싱된 문장
 * @param translated 번역된 문장
 * @param direction 번역 방향
 * @returns 검증된 번역 결과
 */
function validateTranslation(
  parsed: ParsedSentence,
  translated: string,
  direction: Direction,
): string {
  let result = translated;

  // 명사 토큰만 추출하여 검증
  const nounTokens = parsed.tokens.filter(
    (t) => t.role === 'object' || t.role === 'subject' || t.role === 'unknown',
  );

  for (const token of nounTokens) {
    if (!token.translated || !token.stem) continue;

    const validation = validateWordTranslation(token.stem, token.translated, direction);

    if (!validation.valid) {
      // 검증 실패 → 번역된 단어를 원본으로 교체
      result = result.replace(token.translated, token.stem);

      // confidence 조정
      if (token.confidence !== undefined) {
        token.confidence = Math.min(token.confidence, validation.confidence);
      }
    }
  }

  return result;
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
