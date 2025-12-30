/**
 * 번역기 v2 토크나이저
 * 입력 텍스트를 토큰으로 분리하고 역할 부여
 */

import { COUNTERS, ENDINGS, KO_EN, KO_NUMBERS, KO_VERB_MAP, PARTICLES } from './data';
import type { ParsedSentence, Role, SentenceType, Tense, Token } from './types';

// 조사를 길이 역순으로 정렬 (긴 것부터 매칭)
const SORTED_PARTICLES = [...PARTICLES].sort((a, b) => b[0].length - a[0].length);
const SORTED_ENDINGS = [...ENDINGS].sort((a, b) => b[0].length - a[0].length);

/**
 * 한국어 문장 파싱
 */
export function parseKorean(text: string): ParsedSentence {
  const original = text.trim();

  // 1. 문장 유형 감지
  const type = detectSentenceType(original);

  // 2. 구두점 제거
  const cleaned = original.replace(/[.!?？！。]+$/, '').trim();

  // 3. 공백으로 분리 + 숫자+분류사 분리
  const rawWords = cleaned.split(/\s+/).filter(Boolean);
  const words: string[] = [];

  for (const word of rawWords) {
    // 숫자+분류사 패턴 분리 (예: "1개" → "1", "개")
    const numCounterMatch = word.match(/^(\d+)(개|마리|명|권|잔|병|대)$/);
    if (numCounterMatch) {
      words.push(numCounterMatch[1]); // 숫자
      words.push(numCounterMatch[2]); // 분류사
    } else {
      words.push(word);
    }
  }

  // 4. 각 단어를 토큰으로 변환
  const tokens: Token[] = [];
  let sentenceTense: Tense = 'present';
  let negated = false;

  for (const word of words) {
    const token = tokenizeKoreanWord(word);
    tokens.push(token);

    // 시제/부정 정보 수집
    if (token.meta?.tense) sentenceTense = token.meta.tense;
    if (token.meta?.negated) negated = true;
  }

  return {
    original,
    tokens,
    type,
    tense: sentenceTense,
    negated,
  };
}

/**
 * 문장 유형 감지
 */
function detectSentenceType(text: string): SentenceType {
  if (/[?？]/.test(text)) return 'question';
  if (/[!！]/.test(text)) return 'exclamation';
  // 한국어 의문형 어미
  if (/(니|나|까)\s*$/.test(text)) return 'question';
  return 'statement';
}

/**
 * 한국어 단어 토큰화
 */
function tokenizeKoreanWord(word: string): Token {
  // 1. 숫자 체크
  if (/^\d+$/.test(word)) {
    return { text: word, stem: word, role: 'number' };
  }

  // 2. 한국어 숫자 체크
  if (KO_NUMBERS[word] !== undefined) {
    return { text: word, stem: String(KO_NUMBERS[word]), role: 'number' };
  }

  // 3. 분류사 체크
  for (const [counter] of COUNTERS) {
    if (word === counter) {
      return { text: word, stem: word, role: 'counter' };
    }
  }

  // 4. 단어가 사전에 있으면 그대로 사용 (조사 분리 불필요)
  if (KO_EN[word]) {
    const en = KO_EN[word];
    // 감탄사는 대문자로 시작
    const role: Role = /^[A-Z]/.test(en) ? 'adverb' : 'unknown';
    return { text: word, stem: word, role, translated: en };
  }

  // 5. 조사 분리 시도
  let stem = word;
  let particle: string | undefined;
  let role: Role = 'unknown';

  for (const [p, r] of SORTED_PARTICLES) {
    if (word.endsWith(p) && word.length > p.length) {
      stem = word.slice(0, -p.length);
      particle = p;
      role = r === 'subject' || r === 'topic' ? 'subject' : r === 'object' ? 'object' : 'unknown';
      break;
    }
  }

  // 6. 동사 활용형 체크 (갔어 → go, 먹었어 → ate 등)
  let tense: Tense | undefined;
  let negated = false;
  let translated: string | undefined;

  // 어미 분리 후 동사 활용형 확인
  for (const [ending, t] of SORTED_ENDINGS) {
    if (stem.endsWith(ending)) {
      const verbPart = stem.slice(0, -ending.length);
      if (verbPart.length > 0) {
        // 활용형 맵에서 찾기 (갔, 먹었, 했 등)
        const verbInfo = KO_VERB_MAP.get(verbPart);
        if (verbInfo) {
          stem = verbInfo.stem;
          translated = verbInfo.en;
          tense = verbInfo.tense as Tense;
          role = 'verb';
          break;
        }
        // 사전에서 어간 찾기
        if (KO_EN[verbPart]) {
          stem = verbPart;
          translated = KO_EN[verbPart];
          tense = t as Tense;
          role = 'verb';
          break;
        }
      }
    }
  }

  // 7. 활용형이 어미 없이 바로 나온 경우 (갔, 했 등 단독)
  if (!translated) {
    const verbInfo = KO_VERB_MAP.get(stem);
    if (verbInfo) {
      translated = verbInfo.en;
      tense = verbInfo.tense as Tense;
      role = 'verb';
      stem = verbInfo.stem;
    }
  }

  // 8. 부정 체크 (어미에 포함된 경우)
  for (const [_ending] of SORTED_ENDINGS) {
    if (word.includes('않') || word.includes('못')) {
      negated = true;
      break;
    }
  }

  // 9. 부정 접두어 체크
  if (stem.startsWith('안 ') || stem.startsWith('못 ')) {
    negated = true;
    stem = stem.slice(2);
  }

  // 10. 사전에서 번역 찾기 (아직 없으면)
  if (!translated) {
    translated = KO_EN[stem];
  }

  return {
    text: word,
    stem,
    role,
    translated,
    meta: {
      tense,
      negated: negated || undefined,
      particle,
    },
  };
}

/**
 * 영어 문장 파싱
 */
export function parseEnglish(text: string): ParsedSentence {
  const original = text.trim();
  const type = detectSentenceType(original);
  const cleaned = original.replace(/[.!?]+$/, '').trim();

  // 간단한 공백 분리 (영어는 형태소 분석 불필요)
  const words = cleaned.split(/\s+/).filter(Boolean);
  const tokens: Token[] = words.map((word) => ({
    text: word,
    stem: word.toLowerCase(),
    role: 'unknown' as Role,
  }));

  return {
    original,
    tokens,
    type,
    tense: detectEnglishTense(words),
    negated: words.some((w) => /^(not|n't|don't|doesn't|didn't|won't|can't)$/i.test(w)),
  };
}

/**
 * 영어 시제 감지
 */
function detectEnglishTense(words: string[]): Tense {
  const text = words.join(' ').toLowerCase();
  if (/\b(did|was|were|had|\w+ed)\b/.test(text)) return 'past';
  if (/\b(will|going to|'ll)\b/.test(text)) return 'future';
  return 'present';
}
