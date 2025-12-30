/**
 * 번역기 v2 생성기
 * 분석된 토큰을 목표 언어로 재조립
 */

import { COUNTERS, EN_KO, IDIOMS_EN_KO, IDIOMS_KO_EN, KO_EN, VERB_PAST } from './data';
import type { ParsedSentence, Tense, Token } from './types';

/**
 * "명사 숫자 분류사" 패턴 감지
 * 예: "사과 1개" → "1 apple", "고양이 5마리" → "5 cats"
 */
function detectCounterPattern(tokens: Token[]): string | null {
  // 토큰이 2~3개이고, 숫자와 분류사가 포함된 경우
  if (tokens.length < 2 || tokens.length > 3) return null;

  let noun: string | null = null;
  let num: number | null = null;
  let counter: string | null = null;

  for (const token of tokens) {
    if (token.role === 'number') {
      num = parseInt(token.stem, 10);
    } else if (token.role === 'counter') {
      counter = token.text;
    } else if (token.translated || KO_EN[token.stem]) {
      noun = token.translated || KO_EN[token.stem];
    }
  }

  // 숫자와 명사가 있어야 함
  if (num === null || !noun) return null;

  // 분류사 정보로 복수형 결정
  const counterInfo = counter ? COUNTERS.find(([c]) => c === counter) : null;

  if (num === 1) {
    // 단수
    return `${num} ${noun}`;
  } else {
    // 복수
    const suffix = counterInfo ? counterInfo[2] : 's';
    // 특수 복수형 (person → people 등)
    if (counterInfo && counterInfo[2] === 'people' && num !== 1) {
      return `${num} people`;
    }
    return `${num} ${noun}${suffix}`;
  }
}

/**
 * 한→영 생성
 */
export function generateEnglish(parsed: ParsedSentence): string {
  // 1. 관용구 체크 (통문장)
  const idiom = IDIOMS_KO_EN[parsed.original.replace(/[.!?？！。]+$/, '').trim()];
  if (idiom) return idiom;

  // 2. 숫자+분류사 패턴 감지 (명사 숫자 분류사 순서)
  // "사과 1개", "고양이 5마리" 패턴
  const counterPattern = detectCounterPattern(parsed.tokens);
  if (counterPattern) {
    return counterPattern;
  }

  // 3. 역할별 토큰 분류
  const subjects: Token[] = [];
  const objects: Token[] = [];
  const verbs: Token[] = [];
  const adverbs: Token[] = [];
  const locations: Token[] = []; // 에, 에서 조사
  const others: Token[] = [];
  const numbers: Token[] = [];
  const counters: Token[] = [];

  for (const token of parsed.tokens) {
    switch (token.role) {
      case 'subject':
        subjects.push(token);
        break;
      case 'object':
        objects.push(token);
        break;
      case 'verb':
        verbs.push(token);
        break;
      case 'adverb':
        adverbs.push(token);
        break;
      case 'number':
        numbers.push(token);
        break;
      case 'counter':
        counters.push(token);
        break;
      default:
        // 위치 조사 체크
        if (token.meta?.particle === '에' || token.meta?.particle === '에서') {
          locations.push(token);
        } else {
          others.push(token);
        }
        break;
    }
  }

  // 4. 역할 기반 숫자+분류사 패턴 (fallback)
  if (numbers.length > 0 && counters.length > 0) {
    return generateCounterPhrase(numbers, counters, others);
  }

  // 4. SVO 어순으로 재조립
  const parts: string[] = [];

  // 주어
  if (subjects.length > 0) {
    parts.push(translateTokens(subjects));
  }

  // 동사 (시제 적용)
  if (verbs.length > 0) {
    const verb = verbs[0];
    let verbEn = verb.translated || KO_EN[verb.stem] || verb.stem;

    // 부정문
    if (parsed.negated || verb.meta?.negated) {
      verbEn = applyNegation(verbEn, parsed.tense);
    } else {
      verbEn = applyTense(verbEn, parsed.tense);
    }

    parts.push(verbEn);
  }

  // 목적어
  if (objects.length > 0) {
    parts.push(translateTokens(objects));
  }

  // 위치/장소 (to school, at home 등)
  if (locations.length > 0) {
    for (const loc of locations) {
      const noun = loc.translated || KO_EN[loc.stem] || loc.stem;
      const prep = loc.meta?.particle === '에서' ? 'at' : 'to';
      parts.push(`${prep} ${noun}`);
    }
  }

  // 부사 (문장 끝)
  if (adverbs.length > 0) {
    parts.push(translateTokens(adverbs));
  }

  // 기타 (미분류)
  if (others.length > 0 && parts.length === 0) {
    parts.push(translateTokens(others));
  }

  let result = parts.filter(Boolean).join(' ');

  // 5. 문장 유형에 따른 후처리
  if (parsed.type === 'question' && !result.endsWith('?')) {
    // 의문문 어순 조정 (간단한 경우)
    if (subjects.length > 0 && verbs.length > 0) {
      const subj = translateTokens(subjects);
      const verb = verbs[0].translated || KO_EN[verbs[0].stem] || verbs[0].stem;
      const obj = objects.length > 0 ? translateTokens(objects) : '';
      const loc =
        locations.length > 0
          ? locations
              .map((l) => {
                const noun = l.translated || KO_EN[l.stem] || l.stem;
                const prep = l.meta?.particle === '에서' ? 'at' : 'to';
                return `${prep} ${noun}`;
              })
              .join(' ')
          : '';

      if (parsed.tense === 'past') {
        result = `Did ${subj.toLowerCase()} ${verb}${obj ? ` ${obj}` : ''}${loc ? ` ${loc}` : ''}`;
      } else {
        result = `Do ${subj.toLowerCase()} ${verb}${obj ? ` ${obj}` : ''}${loc ? ` ${loc}` : ''}`;
      }
    }
  }

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 숫자+분류사 구문 생성
 */
function generateCounterPhrase(numbers: Token[], counters: Token[], nouns: Token[]): string {
  const num = parseInt(numbers[0].stem, 10);
  const counter = counters[0].text;
  const noun = nouns.length > 0 ? nouns[0].translated || KO_EN[nouns[0].stem] || nouns[0].stem : '';

  // 분류사 정보 찾기
  const counterInfo = COUNTERS.find(([c]) => c === counter);

  if (counterInfo) {
    const [, singular, plural] = counterInfo;
    if (num === 1) {
      return `${num} ${noun}${singular}`;
    } else {
      return `${num} ${noun}${plural}`;
    }
  }

  return `${num} ${noun}`;
}

/**
 * 토큰 배열을 영어로 번역
 */
function translateTokens(tokens: Token[]): string {
  return tokens.map((t) => t.translated || KO_EN[t.stem] || t.stem).join(' ');
}

/**
 * 시제 적용
 */
function applyTense(verb: string, tense: Tense): string {
  if (tense === 'past') {
    // 불규칙 동사 확인
    const irregular = VERB_PAST.get(verb);
    if (irregular) return irregular;
    // 규칙 동사
    if (verb.endsWith('e')) return `${verb}d`;
    if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
    return `${verb}ed`;
  }
  return verb;
}

/**
 * 부정문 생성
 */
function applyNegation(verb: string, tense: Tense): string {
  if (tense === 'past') {
    return `didn't ${verb}`;
  }
  return `don't ${verb}`;
}

/**
 * 영→한 생성
 */
export function generateKorean(parsed: ParsedSentence): string {
  // 1. 관용구 체크
  const normalized = parsed.original
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .trim();
  const idiom = IDIOMS_EN_KO[normalized];
  if (idiom) return idiom;

  // 2. 단어별 번역 후 조합
  const parts = parsed.tokens
    .map((token) => {
      const ko = EN_KO[token.stem] || token.text;
      return ko;
    })
    .filter(Boolean);

  return parts.join(' ');
}
