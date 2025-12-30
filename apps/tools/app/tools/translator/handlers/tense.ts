// ========================================
// Tense Handler - 시제 처리
// ========================================
// 양방향 통합: ko-en, en-ko 모두 처리
// 기존: handleTenseKoEn + handleTenseEnKo

import { registerHandler } from '../pipeline';
import type { TranslationContext, TranslationDirection } from '../types';

// ========================================
// 시제 관련 상수
// ========================================

/** 시간 부사 (한→영) */
const TIME_ADVERBS_KO_TO_EN: Record<string, string> = {
  어제: 'yesterday',
  오늘: 'today',
  내일: 'tomorrow',
  방금: 'just now',
  지금: 'now',
  매일: 'every day',
  항상: 'always',
  자주: 'often',
  가끔: 'sometimes',
  나중에: 'later',
  이미: 'already',
  벌써: 'already',
};

/** 시간 부사 (영→한) */
const TIME_ADVERBS_EN_TO_KO: Record<string, string> = {
  yesterday: '어제',
  today: '오늘',
  tomorrow: '내일',
  now: '지금',
  'every day': '매일',
  always: '항상',
  often: '자주',
  sometimes: '가끔',
  later: '나중에',
  already: '이미',
};

/** 동사 어간 (한→영) */
const VERB_STEM_KO_TO_EN: Record<string, string> = {
  먹: 'eat',
  가: 'go',
  오: 'come',
  하: 'do',
  보: 'see',
  듣: 'hear',
  자: 'sleep',
  달리: 'run',
  쓰: 'write',
  읽: 'read',
  말하: 'speak',
  사: 'buy',
  팔: 'sell',
  주: 'give',
  받: 'receive',
};

/** 동사 원형 (영→한) */
const VERB_EN_TO_KO: Record<string, string> = {
  eat: '먹',
  go: '가',
  come: '오',
  do: '하',
  see: '보',
  hear: '듣',
  sleep: '자',
  run: '달리',
  write: '쓰',
  read: '읽',
  speak: '말하',
  buy: '사',
  sell: '팔',
  give: '주',
  receive: '받',
};

/** 불규칙 과거형 (영어) */
const IRREGULAR_PAST: Record<string, string> = {
  eat: 'ate',
  go: 'went',
  come: 'came',
  do: 'did',
  see: 'saw',
  hear: 'heard',
  sleep: 'slept',
  run: 'ran',
  write: 'wrote',
  read: 'read',
  speak: 'spoke',
  buy: 'bought',
  sell: 'sold',
  give: 'gave',
  receive: 'received',
};

/** 불규칙 과거형 역매핑 */
const PAST_TO_INFINITIVE: Record<string, string> = Object.fromEntries(
  Object.entries(IRREGULAR_PAST).map(([inf, past]) => [past, inf]),
);

/** 불규칙 과거분사 (영어) */
const IRREGULAR_PAST_PARTICIPLE: Record<string, string> = {
  eat: 'eaten',
  go: 'gone',
  come: 'come',
  do: 'done',
  see: 'seen',
  hear: 'heard',
  sleep: 'slept',
  run: 'run',
  write: 'written',
  read: 'read',
  speak: 'spoken',
  buy: 'bought',
  sell: 'sold',
  give: 'given',
  receive: 'received',
};

// ========================================
// 유틸리티 함수
// ========================================

/** 영어 과거형 얻기 */
function getPastTense(verb: string): string {
  if (IRREGULAR_PAST[verb]) {
    return IRREGULAR_PAST[verb];
  }
  // 규칙 동사
  if (verb.endsWith('e')) {
    return `${verb}d`;
  }
  if (verb.endsWith('y') && !/[aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }
  return `${verb}ed`;
}

/** 영어 과거분사 얻기 */
function getPastParticiple(verb: string): string {
  if (IRREGULAR_PAST_PARTICIPLE[verb]) {
    return IRREGULAR_PAST_PARTICIPLE[verb];
  }
  return getPastTense(verb);
}

/** 영어 현재분사 얻기 */
function getPresentParticiple(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee')) {
    return `${verb.slice(0, -1)}ing`;
  }
  if (verb.endsWith('ie')) {
    return `${verb.slice(0, -2)}ying`;
  }
  // 단모음+단자음 → 자음 중복
  if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxyz]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }
  return `${verb}ing`;
}

// ========================================
// 핸들러
// ========================================

/**
 * 시제 패턴 처리 (양방향)
 *
 * ko-en: "어제 먹었다" → "ate yesterday"
 * en-ko: "ate yesterday" → "어제 먹었다"
 */
export function handleTense(
  text: string,
  direction: TranslationDirection,
  _context?: TranslationContext,
): string | null {
  if (direction === 'ko-en') {
    return handleTenseKoEn(text);
  }
  return handleTenseEnKo(text);
}

/**
 * ko-en: 한국어 시제 → 영어
 */
function handleTenseKoEn(text: string): string | null {
  // 패턴 1: 과거 - "어제 먹었다"
  const pastPattern = text.match(/^(어제|방금)\s*(.+?)(었|았)다$/);
  if (pastPattern) {
    const [, timeWord, verbStem] = pastPattern;
    const timeAdverb = TIME_ADVERBS_KO_TO_EN[timeWord] || timeWord;
    const enVerb = VERB_STEM_KO_TO_EN[verbStem];
    if (enVerb) {
      const pastVerb = getPastTense(enVerb);
      return `${pastVerb} ${timeAdverb}`;
    }
  }

  // 패턴 2: 미래 - "내일 먹을 거야"
  const futurePattern = text.match(/^(내일|나중에)?\s*(.+?)([을를]?\s*거야|ㄹ\s*거야)$/);
  if (futurePattern) {
    const [, timeWord, verbStem] = futurePattern;
    const timeAdverb = timeWord ? TIME_ADVERBS_KO_TO_EN[timeWord] : '';
    const cleanStem = verbStem.replace(/[을를]$/, '');
    const enVerb = VERB_STEM_KO_TO_EN[cleanStem];
    if (enVerb) {
      return timeAdverb ? `will ${enVerb} ${timeAdverb}` : `will ${enVerb}`;
    }
  }

  // 패턴 3: 현재 습관 - "매일 먹는다"
  const habitPattern = text.match(/^(매일|항상|자주|가끔)\s*(.+?)(는다|ㄴ다)$/);
  if (habitPattern) {
    const [, timeWord, verbStem] = habitPattern;
    const timeAdverb = TIME_ADVERBS_KO_TO_EN[timeWord] || timeWord;
    const enVerb = VERB_STEM_KO_TO_EN[verbStem];
    if (enVerb) {
      return `${enVerb} ${timeAdverb}`;
    }
  }

  // 패턴 4: 현재진행 - "지금 먹고 있다"
  const progressivePattern = text.match(/^(지금)?\s*(.+?)고\s*있다$/);
  if (progressivePattern) {
    const [, timeWord, verbStem] = progressivePattern;
    const timeAdverb = timeWord ? TIME_ADVERBS_KO_TO_EN[timeWord] : '';
    const enVerb = VERB_STEM_KO_TO_EN[verbStem];
    if (enVerb) {
      const ingVerb = getPresentParticiple(enVerb);
      return timeAdverb ? `am ${ingVerb} ${timeAdverb}` : `am ${ingVerb}`;
    }
  }

  // 패턴 5: 완료 - "이미 먹었다"
  const perfectPattern = text.match(/^(이미|벌써)\s*(.+?)(었|았)다$/);
  if (perfectPattern) {
    const [, , verbStem] = perfectPattern;
    const enVerb = VERB_STEM_KO_TO_EN[verbStem];
    if (enVerb) {
      const pp = getPastParticiple(enVerb);
      return `have already ${pp}`;
    }
  }

  return null;
}

/**
 * en-ko: 영어 시제 → 한국어
 */
function handleTenseEnKo(text: string): string | null {
  const lowerText = text.toLowerCase();

  // 패턴 1: 과거 - "ate yesterday"
  for (const [past, inf] of Object.entries(PAST_TO_INFINITIVE)) {
    const pastPattern = new RegExp(`^${past}\\s+(yesterday|today)$`, 'i');
    const match = lowerText.match(pastPattern);
    if (match) {
      const timeAdverb = TIME_ADVERBS_EN_TO_KO[match[1]] || match[1];
      const koVerb = VERB_EN_TO_KO[inf];
      if (koVerb) {
        return `${timeAdverb} ${koVerb}었다`;
      }
    }
  }

  // 패턴 2: 미래 - "will eat tomorrow"
  const futurePattern = lowerText.match(/^will\s+(\w+)\s*(tomorrow|today)?$/);
  if (futurePattern) {
    const [, verb, timeWord] = futurePattern;
    const timeAdverb = timeWord ? TIME_ADVERBS_EN_TO_KO[timeWord] : '';
    const koVerb = VERB_EN_TO_KO[verb];
    if (koVerb) {
      return timeAdverb ? `${timeAdverb} ${koVerb}을 거야` : `${koVerb}을 거야`;
    }
  }

  // 패턴 3: 현재 습관 - "eat every day"
  const habitPattern = lowerText.match(/^(\w+)\s+(every day|always|often|sometimes)$/);
  if (habitPattern) {
    const [, verb, timePhrase] = habitPattern;
    const timeAdverb = TIME_ADVERBS_EN_TO_KO[timePhrase] || timePhrase;
    const koVerb = VERB_EN_TO_KO[verb];
    if (koVerb) {
      return `${timeAdverb} ${koVerb}는다`;
    }
  }

  // 패턴 4: 현재진행 - "am eating now"
  const progressivePattern = lowerText.match(/^am\s+(\w+)ing\s*(now)?$/);
  if (progressivePattern) {
    const [, verbBase, timeWord] = progressivePattern;
    const timeAdverb = timeWord ? TIME_ADVERBS_EN_TO_KO[timeWord] : '';
    const koVerb = VERB_EN_TO_KO[verbBase];
    if (koVerb) {
      return timeAdverb ? `${timeAdverb} ${koVerb}고 있다` : `${koVerb}고 있다`;
    }
  }

  // 패턴 5: 완료 - "have already eaten"
  const perfectPattern = lowerText.match(/^have\s+already\s+(\w+)$/);
  if (perfectPattern) {
    const [, pp] = perfectPattern;
    // 과거분사 → 원형 역매핑
    for (const [inf, participle] of Object.entries(IRREGULAR_PAST_PARTICIPLE)) {
      if (participle === pp) {
        const koVerb = VERB_EN_TO_KO[inf];
        if (koVerb) {
          return `이미 ${koVerb}었다`;
        }
      }
    }
  }

  return null;
}

// ========================================
// 핸들러 등록
// ========================================

registerHandler({
  name: 'tense',
  priority: 80, // 시제는 중요한 패턴
  fn: handleTense,
});
