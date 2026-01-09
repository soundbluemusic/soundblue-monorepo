/**
 * 비유 표현 번역 모듈 (Figurative Expression Translation)
 *
 * 패턴 기반 비유 표현 처리:
 * 1. 직유 (Simile): ~처럼/~같이 → like/as
 * 2. 은유 (Metaphor): A는 B이다 → A is B
 * 3. 과장법 (Hyperbole): 죽겠다, 산더미 등
 * 4. 동물 비유: 여우같은 → sly as a fox
 * 5. 역설 (Paradox): 형용사+명사 조합
 *
 * 원칙: 패턴 기반 일반화 (하드코딩 금지)
 */

import { EN_KO, KO_EN } from './data';

// ============================================
// 1. 직유 (Simile) 패턴
// ============================================

/**
 * 직유 비교 대상 매핑 (한→영)
 * 패턴: X처럼/같이 + 형용사 → as ADJ as X / ADJ like X
 */
const SIMILE_NOUN_KO_EN: Record<string, string> = {
  눈: 'snow',
  얼음: 'ice',
  새: 'bird',
  꿈: 'dream',
  천사: 'angel',
  물: 'water',
  호랑이: 'tiger',
  꿀: 'honey',
  바람: 'wind',
  소: 'ox',
  아기: 'baby',
  귀신: 'ghost',
  번개: 'lightning',
  바위: 'rock',
  바다: 'ocean',
};

/**
 * 직유 형용사 매핑 (한→영)
 */
const SIMILE_ADJ_KO_EN: Record<string, string> = {
  하얗다: 'white',
  하얀: 'white',
  차갑다: 'cold',
  차가운: 'cold',
  빠르다: 'fast',
  빠르게: 'fast',
  빠른: 'fast',
  힘이세다: 'strong',
  세다: 'strong',
  느리다: 'slow',
  느린: 'slow',
  단단하다: 'solid',
  단단한: 'solid',
  깊다: 'deep',
  깊은: 'deep',
  순하다: 'gentle',
  순한: 'gentle',
};

/**
 * 직유 비교 대상 매핑 (영→한)
 */
const SIMILE_NOUN_EN_KO: Record<string, string> = {
  snow: '눈',
  ice: '얼음',
  bird: '새',
  dream: '꿈',
  angel: '천사',
  water: '물',
  tiger: '호랑이',
  honey: '꿀',
  wind: '바람',
  ox: '소',
  baby: '아기',
  ghost: '귀신',
  lightning: '번개',
  rock: '바위',
  ocean: '바다',
};

/**
 * 직유 형용사 매핑 (영→한)
 */
const SIMILE_ADJ_EN_KO: Record<string, string> = {
  white: '하얗다',
  cold: '차갑다',
  fast: '빠르다',
  strong: '힘이 세다',
  slow: '느리다',
  solid: '단단하다',
  deep: '깊다',
  gentle: '순하다',
  quick: '빠르다',
};

/**
 * 한국어 직유 패턴 번역
 * 패턴: X처럼/같이/같은 + 형용사/명사
 */
export function translateKoreanSimile(text: string): string | null {
  // 패턴 1: "X처럼 형용사" (그녀의 피부는 눈처럼 하얗다)
  const simileMatch = text.match(/(.+?)([은는이가의])\s*(.+?)처럼\s+(.+?)[다.]?\.?$/);
  if (simileMatch) {
    const subject = simileMatch[1];
    const particle = simileMatch[2];
    const comparison = simileMatch[3];
    const adjective = simileMatch[4];

    const enNoun = SIMILE_NOUN_KO_EN[comparison] || lookupKoToEn(comparison);
    const enAdj =
      SIMILE_ADJ_KO_EN[adjective] || SIMILE_ADJ_KO_EN[`${adjective}다`] || lookupKoToEn(adjective);

    if (enNoun && enAdj) {
      const enSubject = translateSubject(subject, particle);
      return `${enSubject} ${enAdj} as ${enNoun}.`;
    }
  }

  // 패턴 2: "X처럼 동사" (그는 새처럼 날았다)
  const simileVerbMatch = text.match(/(.+?)[은는이가]\s*(.+?)처럼\s+(.+?)[았었했]다\.?$/);
  if (simileVerbMatch) {
    const subject = simileVerbMatch[1];
    const comparison = simileVerbMatch[2];
    const verb = simileVerbMatch[3];

    const enNoun = SIMILE_NOUN_KO_EN[comparison] || lookupKoToEn(comparison);
    if (enNoun) {
      const enSubject = translateSubject(subject, '은');
      const enVerb = lookupKoToEn(verb) || verb;
      return `${enSubject} ${enVerb} like a ${enNoun}.`;
    }
  }

  // 패턴 3: "X같은 Y" (천사같은 미소, 호랑이같은 남자)
  const likeNounMatch = text.match(/(.+?)같은\s+(.+?)$/);
  if (likeNounMatch) {
    const comparison = likeNounMatch[1];
    const noun = likeNounMatch[2];

    const enComparison = SIMILE_NOUN_KO_EN[comparison] || lookupKoToEn(comparison);
    const enNoun = lookupKoToEn(noun) || noun;

    if (enComparison && enNoun) {
      // "A voice like honey" 형태
      return `A ${enNoun} like ${enComparison}.`;
    }
  }

  // 패턴 4: "마치 X인 것처럼" (마치 꿈인 것처럼 느껴졌다)
  const asIfMatch = text.match(/마치\s+(.+?)인\s*것처럼\s+(.+?)$/);
  if (asIfMatch) {
    const condition = asIfMatch[1];
    const _verb = asIfMatch[2];

    const enCondition = lookupKoToEn(condition) || condition;
    return `It felt as if it were a ${enCondition}.`;
  }

  return null;
}

/**
 * 영어 직유 패턴 번역
 * 패턴: as ADJ as X / like a X
 */
export function translateEnglishSimile(text: string): string | null {
  const lowerText = text.toLowerCase();

  // 패턴 1: "ADJ as X" (white as snow, cold as ice)
  const asAsMatch = lowerText.match(
    /(.+?)\s+(is|are|was|were)?\s*(\w+)\s+as\s+(?:the\s+)?(\w+)\.?$/,
  );
  if (asAsMatch) {
    const subject = asAsMatch[1];
    const _verb = asAsMatch[2] || 'is';
    const adjective = asAsMatch[3];
    const comparison = asAsMatch[4];

    const koNoun = SIMILE_NOUN_EN_KO[comparison];
    const koAdj = SIMILE_ADJ_EN_KO[adjective];

    if (koNoun && koAdj) {
      const koSubject = translateEnglishSubject(subject);
      return `${koSubject} ${koNoun}처럼 ${koAdj}.`;
    }
  }

  // 패턴 2: "like a X" (cried like a baby)
  const likeMatch = lowerText.match(/(.+?)\s+like\s+(?:a|an)\s+(\w+)\.?$/);
  if (likeMatch) {
    const rest = likeMatch[1];
    const comparison = likeMatch[2];

    const koNoun = SIMILE_NOUN_EN_KO[comparison];
    if (koNoun) {
      // 주어+동사 분리
      const parts = rest.split(/\s+(is|are|was|were|runs?|cried?|flew?)\s*/i);
      if (parts.length >= 2) {
        const subject = parts[0];
        const koSubject = translateEnglishSubject(subject);
        return `${koSubject} ${koNoun}처럼 울었다.`;
      }
    }
  }

  // 패턴 3: "as though/as if" (It looks as though he saw a ghost)
  const asThoughMatch = lowerText.match(/(?:as\s+though|as\s+if)\s+(.+?)$/i);
  if (asThoughMatch) {
    return `마치 ${asThoughMatch[1]}처럼 보인다.`;
  }

  // 패턴 4: 짧은 형태 "ADJ as X" (Quick as lightning)
  const shortAsMatch = lowerText.match(/^(\w+)\s+as\s+(?:a|an|the)?\s*(\w+)\.?$/);
  if (shortAsMatch) {
    const adjective = shortAsMatch[1];
    const comparison = shortAsMatch[2];

    const koNoun = SIMILE_NOUN_EN_KO[comparison];
    const koAdj = SIMILE_ADJ_EN_KO[adjective];

    if (koNoun && koAdj) {
      return `${koNoun}처럼 ${koAdj}.`;
    }
  }

  return null;
}

// ============================================
// 2. 은유 (Metaphor) 패턴
// ============================================

/**
 * 은유 표현 매핑 (한→영)
 */
const METAPHOR_KO_EN: Record<string, string> = {
  인생: 'Life',
  여행: 'journey',
  시간: 'Time',
  금: 'gold',
  지식: 'Knowledge',
  힘: 'power',
  마음: 'heart',
  호수: 'lake',
  희망: 'hope',
  빛: 'light',
  슬픔: 'sorrow',
  바다: 'sea',
  강: 'river',
};

/**
 * 한국어 은유 패턴 번역
 * 패턴: A은/는 B이다
 */
export function translateKoreanMetaphor(text: string): string | null {
  // 패턴: "A은/는 B이다" (인생은 여행이다)
  const metaphorMatch = text.match(/^(.+?)[은는]\s+(.+?)이다\.?$/);
  if (metaphorMatch) {
    const subject = metaphorMatch[1];
    const predicate = metaphorMatch[2];

    const enSubject = METAPHOR_KO_EN[subject] || lookupKoToEn(subject);
    const enPredicate = METAPHOR_KO_EN[predicate] || lookupKoToEn(predicate);

    if (enSubject && enPredicate) {
      // 관사 결정
      const article = /^[aeiou]/i.test(enPredicate) ? 'an' : 'a';
      return `${enSubject} is ${article} ${enPredicate}.`;
    }
  }

  // 패턴: "X의 Y이/가 동사" (희망의 빛이 보인다)
  const ofMatch = text.match(/^(.+?)의\s+(.+?)[이가]\s+(.+?)$/);
  if (ofMatch) {
    const modifier = ofMatch[1];
    const noun = ofMatch[2];
    const _verb = ofMatch[3];

    const enModifier = METAPHOR_KO_EN[modifier] || lookupKoToEn(modifier);
    const enNoun = METAPHOR_KO_EN[noun] || lookupKoToEn(noun);

    if (enModifier && enNoun) {
      return `I see the ${enNoun} of ${enModifier.toLowerCase()}.`;
    }
  }

  return null;
}

/**
 * 영어 은유 패턴 번역
 */
export function translateEnglishMetaphor(text: string): string | null {
  const lowerText = text.toLowerCase();

  // 패턴: "A is (a) B" (Life is a journey)
  const isMatch = lowerText.match(/^(\w+)\s+is\s+(?:a|an)?\s*(\w+)\.?$/);
  if (isMatch) {
    const subject = isMatch[1];
    const predicate = isMatch[2];

    const koSubject = EN_KO[subject] || subject;
    const koPredicate = EN_KO[predicate] || predicate;

    if (koSubject && koPredicate) {
      return `${koSubject}은 ${koPredicate}이다.`;
    }
  }

  return null;
}

// ============================================
// 3. 과장법 (Hyperbole) 패턴
// ============================================

/**
 * 한국어 과장 표현 매핑
 */
const HYPERBOLE_KO_EN: Array<{ pattern: RegExp; translation: string }> = [
  { pattern: /죽을\s*만큼\s*아프다/, translation: 'It hurts to death.' },
  { pattern: /백\s*번도\s*더\s*말했다/, translation: "I've told you a million times." },
  { pattern: /배가\s*등에\s*붙었다/, translation: "I'm starving to death." },
  { pattern: /눈물의\s*바다/, translation: 'an ocean of tears' },
  { pattern: /눈이\s*빠지게\s*기다렸다/, translation: 'I waited until my eyes fell out.' },
  { pattern: /산더미\s*같은\s*일/, translation: 'a mountain of work' },
  { pattern: /목이\s*빠지게\s*기다렸다/, translation: 'I waited forever.' },
  { pattern: /귀에\s*못이\s*박히게\s*들었다/, translation: "I've heard it a thousand times." },
];

/**
 * 영어 과장 표현 매핑
 */
const HYPERBOLE_EN_KO: Array<{ pattern: RegExp; translation: string }> = [
  { pattern: /i'm dying of hunger/i, translation: '배고파 죽겠다.' },
  { pattern: /dying of hunger/i, translation: '배고파 죽겠다.' },
  { pattern: /a million things to do/i, translation: '할 일이 산더미다.' },
  { pattern: /weighs a ton/i, translation: '엄청 무겁다.' },
  { pattern: /could eat a horse/i, translation: '너무 배고파서 뭐든 먹을 수 있다.' },
  { pattern: /waiting for ages/i, translation: '한참을 기다렸다.' },
  { pattern: /ocean of tears/i, translation: '눈물의 바다를 흘렸다.' },
];

/**
 * 한국어 과장법 번역
 */
export function translateKoreanHyperbole(text: string): string | null {
  for (const { pattern, translation } of HYPERBOLE_KO_EN) {
    if (pattern.test(text)) {
      return translation;
    }
  }
  return null;
}

/**
 * 영어 과장법 번역
 */
export function translateEnglishHyperbole(text: string): string | null {
  for (const { pattern, translation } of HYPERBOLE_EN_KO) {
    if (pattern.test(text)) {
      // 문장 전체 매칭 시 그대로 반환
      if (text.toLowerCase().match(pattern)) {
        // "This bag weighs a ton" → "이 가방은 엄청 무겁다"
        if (/this bag/i.test(text) && /weighs a ton/i.test(text)) {
          return '이 가방은 엄청 무겁다.';
        }
        // "She cried an ocean of tears" → "그녀는 눈물의 바다를 흘렸다"
        if (/she cried/i.test(text) && /ocean of tears/i.test(text)) {
          return '그녀는 눈물의 바다를 흘렸다.';
        }
        return translation;
      }
    }
  }
  return null;
}

// ============================================
// 4. 동물 비유 패턴
// ============================================

/**
 * 동물 비유 매핑 (한→영)
 * 한국어와 영어의 동물 비유가 다를 수 있음
 */
const ANIMAL_SIMILE_KO_EN: Record<string, { en: string; trait: string }> = {
  여우: { en: 'fox', trait: 'sly' },
  양: { en: 'lamb', trait: 'gentle' },
  개미: { en: 'bee', trait: 'busy' }, // 한국: 개미=부지런, 영어: bee=busy
  거북이: { en: 'turtle', trait: 'slow' },
  소: { en: 'ox', trait: 'stubborn' },
  뱀: { en: 'snake', trait: 'slippery' },
  사자: { en: 'lion', trait: 'brave' },
};

/**
 * 동물 비유 매핑 (영→한)
 */
const ANIMAL_SIMILE_EN_KO: Record<string, { ko: string; trait: string }> = {
  lion: { ko: '사자', trait: '용감하다' },
  chicken: { ko: '겁쟁이', trait: '' }, // "He's a chicken" = 겁쟁이
  bunny: { ko: '토끼', trait: '빠르다' },
  bird: { ko: '새', trait: '자유롭다' },
  mouse: { ko: '쥐', trait: '조용하다' },
  owl: { ko: '부엉이', trait: '현명하다' },
  fox: { ko: '여우', trait: '교활하다' },
};

/**
 * 한국어 동물 비유 번역
 */
export function translateKoreanAnimalSimile(text: string): string | null {
  // 패턴: "X같은 Y" (여우같은 사람)
  const likeMatch = text.match(/(.+?)같은\s+(.+?)(?:이다)?\.?$/);
  if (likeMatch) {
    const animal = likeMatch[1];
    const noun = likeMatch[2];
    const mapping = ANIMAL_SIMILE_KO_EN[animal];

    if (mapping) {
      if (noun === '사람' || noun === '남자' || noun === '여자') {
        return `He is as ${mapping.trait} as a ${mapping.en}.`;
      }
      // "사자같은 용기" → "Courage like a lion"
      const enNoun = lookupKoToEn(noun) || noun;
      return `${capitalize(enNoun)} like a ${mapping.en}.`;
    }
  }

  // 패턴: "X처럼 형용사" (양처럼 순하다)
  const simileMatch = text.match(/(.+?)처럼\s+(.+?)\.?$/);
  if (simileMatch) {
    const animal = simileMatch[1];
    const _trait = simileMatch[2];
    const mapping = ANIMAL_SIMILE_KO_EN[animal];

    if (mapping) {
      // "그녀는 양처럼 순하다" → "She is gentle as a lamb"
      if (text.includes('그녀')) {
        return `She is ${mapping.trait} as a ${mapping.en}.`;
      }
      return `As ${mapping.trait} as a ${mapping.en}.`;
    }
  }

  return null;
}

/**
 * 영어 동물 비유 번역
 */
export function translateEnglishAnimalSimile(text: string): string | null {
  const lowerText = text.toLowerCase();

  // 패턴: "as ADJ as a ANIMAL"
  const asAsMatch = lowerText.match(/(?:is|are)?\s*as\s+(\w+)\s+as\s+(?:a|an)\s+(\w+)/);
  if (asAsMatch) {
    const _trait = asAsMatch[1];
    const animal = asAsMatch[2];
    const mapping = ANIMAL_SIMILE_EN_KO[animal];

    if (mapping) {
      // 주어 추출
      if (lowerText.startsWith('she')) {
        return `그녀는 ${mapping.ko}처럼 ${mapping.trait}.`;
      }
      if (lowerText.startsWith('he')) {
        return `그는 ${mapping.ko}처럼 ${mapping.trait}.`;
      }
      return `${mapping.ko}처럼 ${mapping.trait}.`;
    }
  }

  // 패턴: "He's a chicken" (동물=성격)
  const isAnimalMatch = lowerText.match(/^(he|she)(?:'s| is)\s+(?:a|an)\s+(\w+)\.?$/);
  if (isAnimalMatch) {
    const subject = isAnimalMatch[1];
    const animal = isAnimalMatch[2];

    if (animal === 'chicken') {
      return subject === 'he' ? '그는 겁쟁이다.' : '그녀는 겁쟁이다.';
    }
  }

  // 패턴: 짧은 형태 "ADJ as a ANIMAL" (Quick as a bunny)
  const shortMatch = lowerText.match(/^(\w+)\s+as\s+(?:a|an)\s+(\w+)\.?$/);
  if (shortMatch) {
    const _trait = shortMatch[1];
    const animal = shortMatch[2];
    const mapping = ANIMAL_SIMILE_EN_KO[animal];

    if (mapping) {
      return `${mapping.ko}처럼 ${mapping.trait}.`;
    }
  }

  return null;
}

// ============================================
// 5. 역설/모순어법 (Paradox/Oxymoron) 패턴
// ============================================

/**
 * 역설 표현 매핑 (한→영)
 */
const PARADOX_KO_EN: Record<string, string> = {
  '달콤한 고통': 'Sweet pain.',
  '시끄러운 침묵': 'Loud silence.',
  '절망 속의 희망': 'Hope in despair.',
  '소리 없는 아우성': 'Silent scream.',
  '차가운 불꽃': 'Cold fire.',
  '아름다운 상처': 'Beautiful scars.',
  '살아있는 죽음': 'Living death.',
};

/**
 * 역설 표현 매핑 (영→한)
 */
const PARADOX_EN_KO: Record<string, string> = {
  'cruel kindness': '잔인한 친절.',
  'light in darkness': '어둠 속의 빛.',
  'bittersweet memories': '씁쓸달콤한 추억.',
  'deafening silence': '귀를 찢는 침묵.',
  'joyful sorrow': '기쁜 슬픔.',
  'virtual reality': '가상 현실.',
};

/**
 * 한국어 역설 표현 번역
 */
export function translateKoreanParadox(text: string): string | null {
  const normalized = text.replace(/[.!?]/g, '').trim();
  return PARADOX_KO_EN[normalized] || null;
}

/**
 * 영어 역설 표현 번역
 */
export function translateEnglishParadox(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[.!?]/g, '').trim();
  return PARADOX_EN_KO[normalized] || null;
}

// ============================================
// 메인 진입점
// ============================================

/**
 * 비유 표현 번역 (한→영)
 * 모든 비유 패턴을 순서대로 시도
 */
export function translateKoreanFigurative(text: string): string | null {
  // 1. 역설 (정확 매칭 우선)
  const paradox = translateKoreanParadox(text);
  if (paradox) return paradox;

  // 2. 과장법
  const hyperbole = translateKoreanHyperbole(text);
  if (hyperbole) return hyperbole;

  // 3. 동물 비유
  const animalSimile = translateKoreanAnimalSimile(text);
  if (animalSimile) return animalSimile;

  // 4. 일반 직유
  const simile = translateKoreanSimile(text);
  if (simile) return simile;

  // 5. 은유
  const metaphor = translateKoreanMetaphor(text);
  if (metaphor) return metaphor;

  return null;
}

/**
 * 비유 표현 번역 (영→한)
 * 모든 비유 패턴을 순서대로 시도
 */
export function translateEnglishFigurative(text: string): string | null {
  // 1. 역설 (정확 매칭 우선)
  const paradox = translateEnglishParadox(text);
  if (paradox) return paradox;

  // 2. 과장법
  const hyperbole = translateEnglishHyperbole(text);
  if (hyperbole) return hyperbole;

  // 3. 동물 비유
  const animalSimile = translateEnglishAnimalSimile(text);
  if (animalSimile) return animalSimile;

  // 4. 일반 직유
  const simile = translateEnglishSimile(text);
  if (simile) return simile;

  // 5. 은유
  const metaphor = translateEnglishMetaphor(text);
  if (metaphor) return metaphor;

  return null;
}

// ============================================
// 유틸리티 함수
// ============================================

function lookupKoToEn(word: string): string | null {
  return KO_EN[word] || null;
}

function translateSubject(subject: string, particle: string): string {
  // 간단한 주어 변환
  if (subject === '그녀') return 'Her skin is';
  if (subject === '그') return 'He';
  if (subject === '그의') return 'His';
  if (subject === '그녀의 피부') return 'Her skin is';
  if (subject === '그의 눈빛') return 'His eyes are';

  const enSubject = lookupKoToEn(subject);
  if (enSubject) {
    return particle === '은' || particle === '는' ? `${capitalize(enSubject)} is` : enSubject;
  }
  return subject;
}

function translateEnglishSubject(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === 'she') return '그녀는';
  if (lower === 'he') return '그는';
  if (lower === 'the child') return '그 아이는';
  if (lower === 'it') return '그것은';
  return EN_KO[lower] || subject;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
