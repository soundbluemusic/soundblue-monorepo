// ========================================
// Korean to English Engine - 한→영 자소 기반 번역
// ========================================

import { getEnglishTense, matchEnding } from '../dictionary/endings';
import { isAdjective, translateStemKoToEn } from '../dictionary/stems';
import { composeFromJaso, decomposeAll, removeEndingPattern } from '../jaso/hangul-jaso';

export interface KoToEnResult {
  original: string; // 원본
  stem: string; // 어간
  ending: string; // 어미
  englishStem: string; // 영어 어간
  englishForm: string; // 영어 활용형
  translated: string; // 최종 번역
}

/**
 * 한국어 → 영어 번역 (자소 기반)
 *
 * @example
 * translateKoToEn('먹었다') → 'ate'
 * translateKoToEn('행복했다') → 'was happy'
 */
export function translateKoToEn(text: string): string {
  const result = translateKoToEnDetailed(text);
  return result?.translated || text;
}

/**
 * 한국어 → 영어 번역 (상세 정보 포함)
 */
export function translateKoToEnDetailed(text: string): KoToEnResult | null {
  // 1. 자소 분해
  const jasoArr = decomposeAll(text);
  if (jasoArr.length === 0) return null;

  // 2. 어미 패턴 매칭
  const endingPattern = matchEnding(jasoArr);
  if (!endingPattern) {
    // 어미가 없으면 어간 그대로 번역
    const englishStem = translateStemKoToEn(text);
    return {
      original: text,
      stem: text,
      ending: '',
      englishStem: englishStem || text,
      englishForm: englishStem || text,
      translated: englishStem || text,
    };
  }

  // 3. 어간 추출 (어미 제거)
  const stemJaso = removeEndingPattern(jasoArr, endingPattern.jaso);
  const koreanStem = composeFromJaso(stemJaso);

  // 4. 어간 번역
  const englishStem = translateStemKoToEn(koreanStem);
  if (!englishStem) {
    // 어간을 찾을 수 없으면 원본 반환
    return {
      original: text,
      stem: koreanStem,
      ending: text.slice(koreanStem.length),
      englishStem: koreanStem,
      englishForm: koreanStem,
      translated: text,
    };
  }

  // 5. 영어 시제 적용
  const englishForm = applyEnglishTense(englishStem, endingPattern, koreanStem);

  // 6. 부정형 처리
  let translated = englishForm;
  if (endingPattern.negative) {
    translated = `do not ${englishStem}`;
    if (endingPattern.tense === 'past') {
      translated = `did not ${englishStem}`;
    }
  }

  // 7. 의문형 처리
  if (endingPattern.question && !endingPattern.negative) {
    if (endingPattern.tense === 'past') {
      translated = `did ${englishStem}`;
    } else if (endingPattern.tense === 'future') {
      translated = `will ${englishStem}`;
    } else {
      translated = `do ${englishStem}`;
    }
  }

  // 8. 형용사 처리 (be 동사 추가)
  if (isAdjective(koreanStem) && !endingPattern.negative && !endingPattern.question) {
    if (endingPattern.tense === 'past') {
      translated = `was ${englishStem}`;
    } else if (endingPattern.tense === 'future') {
      translated = `will be ${englishStem}`;
    } else if (endingPattern.tense === 'progressive') {
      translated = `is being ${englishStem}`;
    } else {
      translated = `is ${englishStem}`;
    }
  }

  return {
    original: text,
    stem: koreanStem,
    ending: text.slice(koreanStem.length),
    englishStem,
    englishForm,
    translated,
  };
}

/**
 * 영어 시제 적용
 */
function applyEnglishTense(
  verb: string,
  endingPattern: { tense?: string; progressive?: boolean },
  koreanStem: string,
): string {
  // biome-ignore lint/suspicious/noExplicitAny: Ending pattern type mismatch - to be fixed later
  const tense = getEnglishTense(endingPattern as any);

  // 형용사는 시제 변화 없음
  if (isAdjective(koreanStem)) {
    return verb;
  }

  if (tense === 'past') {
    return conjugatePast(verb);
  }

  if (tense === 'progressive') {
    return conjugateProgressive(verb);
  }

  if (tense === 'future') {
    return `will ${verb}`;
  }

  return verb; // present
}

/**
 * 과거형 변환 (간단 버전, 나중에 불규칙 동사 추가)
 */
function conjugatePast(verb: string): string {
  // 불규칙 동사 (하드코딩 - 나중에 dictionary/exceptions로 이동)
  const irregulars: Record<string, string> = {
    go: 'went',
    eat: 'ate',
    see: 'saw',
    come: 'came',
    take: 'took',
    make: 'made',
    get: 'got',
    give: 'gave',
    know: 'knew',
    think: 'thought',
    find: 'found',
    say: 'said',
    tell: 'told',
    feel: 'felt',
    leave: 'left',
    meet: 'met',
    sit: 'sat',
    stand: 'stood',
    hear: 'heard',
    run: 'ran',
    write: 'wrote',
    read: 'read',
    speak: 'spoke',
    break: 'broke',
    buy: 'bought',
    bring: 'brought',
    teach: 'taught',
    catch: 'caught',
    fight: 'fought',
    sleep: 'slept',
    win: 'won',
    lose: 'lost',
    send: 'sent',
    spend: 'spent',
    build: 'built',
    lend: 'lent',
    bend: 'bent',
    throw: 'threw',
    grow: 'grew',
    blow: 'blew',
    fly: 'flew',
    draw: 'drew',
    fall: 'fell',
    sell: 'sold',
    hold: 'held',
    understand: 'understood',
    forget: 'forgot',
    begin: 'began',
    drink: 'drank',
    sing: 'sang',
    swim: 'swam',
    ring: 'rang',
  };

  if (irregulars[verb]) {
    return irregulars[verb];
  }

  // 규칙 동사
  if (verb.endsWith('e')) {
    return `${verb}d`;
  }

  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }

  // 단모음 + 단자음 → 자음 중복 + ed
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ed`;
  }

  return `${verb}ed`;
}

/**
 * 진행형 변환
 */
function conjugateProgressive(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee') && !verb.endsWith('ye')) {
    return `${verb.slice(0, -1)}ing`;
  }

  // 단모음 + 단자음 → 자음 중복 + ing
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }

  return `${verb}ing`;
}

/**
 * 3인칭 단수 현재형
 */
function _conjugateThirdPerson(verb: string): string {
  if (
    verb.endsWith('s') ||
    verb.endsWith('x') ||
    verb.endsWith('z') ||
    verb.endsWith('ch') ||
    verb.endsWith('sh')
  ) {
    return `${verb}es`;
  }

  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  return `${verb}s`;
}

/**
 * 여러 단어 번역 (공백으로 구분)
 */
export function translateKoToEnMultiple(text: string): string {
  const words = text.split(/\s+/);
  const translated = words.map((word) => translateKoToEn(word));
  return translated.join(' ');
}
