/**
 * 영어 유틸리티 함수 모음
 * index.ts에서 분리됨 (Phase 3 리팩토링)
 *
 * 영어 동사 조작과 관련된 순수 유틸리티 함수들:
 * - 시제 변환 (과거, 과거분사)
 * - 동사 형태 변환 (동명사, 원형, 3인칭 단수)
 * - 문장 수준 조작 (주어 추가, 과거 시제 확인)
 */

// ============================================
// 문장 수준 유틸리티
// ============================================

/**
 * 문장을 과거 시제로 변환
 * "I'm happy" → "I was happy"
 * "they're" → "they were"
 */
export function toPhrasePastTense(phrase: string): string {
  return phrase
    .replace(/\bI'm\b/g, 'I was')
    .replace(/\bit's\b/gi, 'it was')
    .replace(/\bhe's\b/gi, 'he was')
    .replace(/\bshe's\b/gi, 'she was')
    .replace(/\bwe're\b/gi, 'we were')
    .replace(/\bthey're\b/gi, 'they were')
    .replace(/\byou're\b/gi, 'you were')
    .replace(/\bis\b/g, 'was')
    .replace(/\bare\b/g, 'were');
}

/**
 * 문장이 과거 시제인지 확인
 * "slept", "went", "was" 등
 */
export function isPastTense(phrase: string): boolean {
  const p = phrase.toLowerCase();
  // 과거형 동사 패턴
  const pastIndicators = [
    /\b(slept|went|came|saw|ate|drank|did|had|was|were|got|made|took|gave)\b/,
    /\b\w+ed\b/, // Regular past tense verbs
  ];
  return pastIndicators.some((pattern) => pattern.test(p));
}

/**
 * 문장에 주어가 없으면 추가
 * "go" → "I go", "it's cold" → "it's cold" (이미 주어 있음)
 */
export function addSubjectIfNeeded(phrase: string, subject = 'I'): string {
  const p = phrase.trim().toLowerCase();
  // 이미 주어가 있는 경우
  if (
    p.startsWith("it's ") ||
    p.startsWith('it is ') ||
    p.startsWith('i ') ||
    p.startsWith('you ') ||
    p.startsWith('he ') ||
    p.startsWith('she ') ||
    p.startsWith('we ') ||
    p.startsWith('they ') ||
    p.startsWith('there ') ||
    p.startsWith('this ') ||
    p.startsWith('that ')
  ) {
    return phrase;
  }
  return `${subject} ${phrase}`;
}

// ============================================
// 동사 형태 변환
// ============================================

/**
 * 동사를 동명사(-ing)로 변환
 * eat → eating, go → going, run → running
 */
export function toGerund(verb: string): string {
  const v = verb.toLowerCase().trim();
  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'being',
    have: 'having',
    die: 'dying',
    lie: 'lying',
    tie: 'tying',
  };
  if (irregulars[v]) return irregulars[v];

  // -e로 끝나면 e 제거 + ing (make → making)
  if (v.endsWith('e') && !v.endsWith('ee') && !v.endsWith('ie')) {
    return v.slice(0, -1) + 'ing';
  }
  // -ie로 끝나면 ie → ying (die → dying)
  if (v.endsWith('ie')) {
    return v.slice(0, -2) + 'ying';
  }
  // CVC 패턴 (run, stop, swim) → 자음 중복 + ing
  if (/^[a-z]*[bcdfghjklmnpqrstvwxz][aeiou][bcdfghjklmnpqrstvwxz]$/.test(v) && v.length <= 4) {
    return v + v.slice(-1) + 'ing';
  }
  return v + 'ing';
}

/**
 * 동사를 부정사 형태(to 없이)로 변환
 * learns → learn, goes → go
 */
export function toInfinitive(verb: string): string {
  const v = verb.toLowerCase().trim();
  // 불규칙 동사 - 원형으로
  const irregulars: Record<string, string> = {
    goes: 'go',
    does: 'do',
    has: 'have',
    is: 'be',
    am: 'be',
    are: 'be',
    was: 'be',
    were: 'be',
  };
  if (irregulars[v]) return irregulars[v];

  // -es로 끝나면 (goes, does는 위에서 처리됨)
  if (v.endsWith('ies')) {
    return v.slice(0, -3) + 'y';
  }
  if (v.endsWith('es')) {
    return v.slice(0, -2);
  }
  // -s로 끝나면
  if (v.endsWith('s') && !v.endsWith('ss')) {
    return v.slice(0, -1);
  }
  return v;
}

/**
 * 동사를 3인칭 단수 현재형으로 변환
 * go → goes, do → does, have → has
 */
export function toThirdPersonSingular(verb: string): string {
  const IRREGULAR: Record<string, string> = {
    go: 'goes',
    do: 'does',
    have: 'has',
    be: 'is',
  };
  if (IRREGULAR[verb]) return IRREGULAR[verb];
  // -s, -sh, -ch, -x, -o → +es
  if (/(?:s|sh|ch|x|o)$/.test(verb)) {
    return `${verb}es`;
  }
  // consonant + y → -ies
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }
  return `${verb}s`;
}

// ============================================
// 과거분사 관련
// ============================================

/**
 * 동사를 과거분사 형태로 변환
 * go → gone, eat → eaten, write → written
 */
export function toPastParticiple(verb: string): string {
  const PP_MAP: Record<string, string> = {
    go: 'gone',
    come: 'come',
    leave: 'left',
    eat: 'eaten',
    run: 'run',
    see: 'seen',
    do: 'done',
    have: 'had',
    be: 'been',
    break: 'broken',
    write: 'written',
    speak: 'spoken',
    take: 'taken',
    give: 'given',
    drive: 'driven',
    ride: 'ridden',
    choose: 'chosen',
    freeze: 'frozen',
    steal: 'stolen',
    wake: 'woken',
    wear: 'worn',
    tear: 'torn',
    bear: 'born',
    swear: 'sworn',
    hide: 'hidden',
    bite: 'bitten',
    forget: 'forgotten',
    get: 'gotten',
    fall: 'fallen',
    know: 'known',
    grow: 'grown',
    throw: 'thrown',
    blow: 'blown',
    show: 'shown',
    draw: 'drawn',
    fly: 'flown',
    swim: 'swum',
    sing: 'sung',
    ring: 'rung',
    drink: 'drunk',
    sink: 'sunk',
    begin: 'begun',
  };
  if (PP_MAP[verb]) return PP_MAP[verb];
  // 규칙형: -ed
  if (verb.endsWith('e')) return `${verb}d`;
  return `${verb}ed`;
}

/**
 * 과거분사를 원형으로 변환
 * known → know, gone → go, helped → help
 */
export function ppToBase(pp: string): string {
  // 불규칙 과거분사
  const irregulars: Record<string, string> = {
    known: 'know',
    helped: 'help',
    gone: 'go',
    done: 'do',
    seen: 'see',
    taken: 'take',
    given: 'give',
    eaten: 'eat',
    written: 'write',
    spoken: 'speak',
  };
  if (irregulars[pp]) return irregulars[pp];

  // 규칙 동사: -ed 제거
  if (pp.endsWith('ed')) {
    // doubled consonant: stopped → stop
    if (/([^aeiou])(\1)ed$/.test(pp)) {
      return pp.slice(0, -3);
    }
    // -ied → -y: studied → study
    if (pp.endsWith('ied')) {
      return pp.slice(0, -3) + 'y';
    }
    return pp.slice(0, -2);
  }

  return pp;
}

// ============================================
// 과거 시제
// ============================================

/**
 * 동사를 과거형으로 변환
 * go → went, eat → ate, sleep → slept
 */
export function toPastTense(verb: string): string {
  const PAST_MAP: Record<string, string> = {
    go: 'went',
    come: 'came',
    leave: 'left',
    eat: 'ate',
    run: 'ran',
    see: 'saw',
    do: 'did',
    have: 'had',
    be: 'was',
    sleep: 'slept',
    know: 'knew',
  };
  if (PAST_MAP[verb]) return PAST_MAP[verb];
  // 규칙형: -ed
  if (verb.endsWith('e')) return `${verb}d`;
  // Double final consonant for CVC pattern with stress on last syllable
  // regret → regretted, stop → stopped, plan → planned
  if (
    /[^aeiou][aeiou][bcdfgklmnprstvz]$/.test(verb) &&
    !verb.endsWith('w') &&
    !verb.endsWith('x') &&
    !verb.endsWith('y')
  ) {
    return `${verb}${verb[verb.length - 1]}ed`;
  }
  // Consonant + y → ied (study → studied)
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }
  return `${verb}ed`;
}
