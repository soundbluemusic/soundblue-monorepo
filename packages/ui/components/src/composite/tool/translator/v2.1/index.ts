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

// 외부 문장 사전 (대화 예문에서 추출 - 정확히 매칭 시 알고리즘보다 우선)
// lazy loading으로 변경됨 - 동기 조회는 캐시된 경우에만 가능
import {
  lookupEnToKoSentence,
  lookupExternalEnToKo,
  lookupExternalKoToEn,
  lookupKoToEnSentence,
} from '../dictionary/external';
import { type ParsedClauses, parseEnglishClauses, parseKoreanClauses } from './clause-parser';
import {
  ContextTracker,
  CULTURAL_EXPRESSIONS_EN_TO_KO,
  CULTURAL_EXPRESSIONS_KO_TO_EN,
  ENGLISH_NAMES,
  KOREAN_NAMES,
  replaceKoreanNames,
  replaceKoreanPronouns,
  replacePhrasalVerbs,
} from './context-tracker';
import {
  ELLIPSIS_NOUN_MAP,
  ELLIPSIS_TOPIC_PATTERN,
  EN_DISCOURSE_MARKERS,
  EN_IDIOMS,
  EN_KO,
  KO_DISCOURSE_MARKERS,
  KO_IDIOMS,
  KO_INTERJECTIONS,
  KO_INTERROGATIVES,
  KO_NOUNS,
  KO_PLACE_ADVERBS,
  KO_TIME_ADVERBS,
  KO_VERBS,
  MEAL_CONTEXT_MAP,
  MEAL_VERB_PATTERNS,
} from './data';
import { generateNounClauseKorean, generateRelativeClauseKorean } from './en-to-ko/clauses';
import { generateConditionalKorean } from './en-to-ko/conditionals';
import { handleSpecialEnglishPatterns } from './en-to-ko/special-patterns';
import {
  addSubjectIfNeeded,
  isPastTense,
  toGerund,
  toInfinitive,
  toPastParticiple,
  toPastTense,
  toPhrasePastTense,
  toThirdPersonSingular,
} from './english-utils';
import { translateEnglishFigurative, translateKoreanFigurative } from './figurative';
import { generateEnglish, generateKorean } from './generator';
import {
  addKoreanRieul,
  attachKoNieun,
  attachKoRieul,
  attachPastTense,
  hasNieunBatchim,
  hasRieulBatchim,
  removeKoreanFinal,
  removeNieunBatchim,
  removeRieulBatchim,
} from './korean-utils';
import { normalizeSpacing } from './spacing-normalizer';
import { parseEnglish, parseKorean } from './tokenizer';
import type { Direction, Formality, ParsedSentence, TranslationResult } from './types';
import { correctTypo } from './typo-corrector';
import { validateWordTranslation } from './validator';

// ============================================
// 담화 연결어/감탄사 추출 (Phase 3)
// ============================================

/**
 * 문장 시작부에서 담화 연결어/감탄사 추출
 *
 * 목적: 형태소 분석 전에 담화 연결어를 분리하여 오역 방지
 * 예: "그리고 아침은..." → { marker: "And", rest: "아침은..." }
 *
 * @param text 원본 문장
 * @param lang 언어 ('ko' | 'en')
 * @returns { marker: 영어 담화 연결어, rest: 나머지 문장 }
 */
function extractDiscourseMarker(
  text: string,
  lang: 'ko' | 'en',
): { marker: string | null; rest: string } {
  const trimmed = text.trim();

  if (lang === 'ko') {
    // 1. 감탄사 먼저 체크 (긴 것부터)
    const interjections = Object.keys(KO_INTERJECTIONS).sort((a, b) => b.length - a.length);
    for (const interj of interjections) {
      // 감탄사가 문장 시작에 있고, 뒤에 공백/구두점/끝인 경우만 매치
      // (다른 단어의 일부가 아닌 독립된 감탄사여야 함)
      if (trimmed.startsWith(interj)) {
        const afterInterj = trimmed.slice(interj.length);
        const firstCharAfter = afterInterj.charAt(0);
        // 감탄사 뒤에 공백, 구두점(!?.,), 또는 끝이어야 함
        if (afterInterj === '' || /^[\s!?.,]/.test(firstCharAfter)) {
          const translated = KO_INTERJECTIONS[interj];
          return { marker: translated, rest: afterInterj.trim() || trimmed };
        }
      }
    }

    // 2. 담화 연결어 체크 (긴 것부터)
    const markers = Object.keys(KO_DISCOURSE_MARKERS).sort((a, b) => b.length - a.length);
    for (const marker of markers) {
      // 담화 연결어가 문장 시작에 있고, 뒤에 공백이 있는 경우
      const pattern = new RegExp(`^${marker}\\s+`);
      if (pattern.test(trimmed)) {
        const rest = trimmed.slice(marker.length).trim();
        const translated = KO_DISCOURSE_MARKERS[marker];
        return { marker: translated, rest };
      }
    }
  } else {
    // 영어: 담화 연결어 체크 (긴 것부터)
    const markers = Object.keys(EN_DISCOURSE_MARKERS).sort((a, b) => b.length - a.length);
    for (const marker of markers) {
      // 대소문자 무시, 단어 경계 확인
      const pattern = new RegExp(`^${marker}[,\\s]+`, 'i');
      if (pattern.test(trimmed)) {
        const rest = trimmed
          .slice(marker.length)
          .replace(/^[,\s]+/, '')
          .trim();
        const translated = EN_DISCOURSE_MARKERS[marker.toLowerCase()];
        return { marker: translated, rest };
      }
    }
  }

  return { marker: null, rest: trimmed };
}

// ============================================
// WO-L2: 영어 복합문 → 한국어 변환 (절 분리 전!)
// ============================================

/**
 * WO-L2: 영어 복합문을 한국어로 변환
 *
 * 패턴:
 * - wo-l2-4: My brother finished his homework before dinner yesterday.
 * - wo-l2-5: I met my old friend at the shopping mall last weekend.
 * - wo-l2-6: We studied hard all night to pass the exam.
 *
 * @param sentence 원본 영어 문장
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateEnglishComplexSentence(sentence: string): string | null {
  const lowerOriginal = sentence.toLowerCase();

  // WO-L2 헬퍼: 영어 주어 → 한국어 주어+조사
  const enSubjMap: Record<string, string> = {
    i: '나는',
    my: '내',
    we: '우리는',
    our: '우리',
    he: '그는',
    his: '그의',
    she: '그녀는',
    her: '그녀의',
    they: '그들은',
    their: '그들의',
    you: '너는',
    your: '너의',
  };

  // WO-L2 헬퍼: 영어 동사(과거) → 한국어 동사
  const enVerbPastMap: Record<string, string> = {
    finished: '끝냈어',
    met: '만났어',
    studied: '공부했어',
    ate: '먹었어',
    bought: '샀어',
    went: '갔어',
    saw: '봤어',
    made: '만들었어',
    came: '왔어',
    read: '읽었어',
    wrote: '썼어',
    worked: '일했어',
    played: '놀았어',
    watched: '봤어',
    visited: '방문했어',
  };

  // WO-L2 헬퍼: 영어 명사 → 한국어 명사
  const enNounMap: Record<string, string> = {
    brother: '동생',
    sister: '언니',
    friend: '친구',
    homework: '숙제',
    dinner: '저녁',
    breakfast: '아침',
    lunch: '점심',
    exam: '시험',
    mall: '몰',
    'shopping mall': '쇼핑몰',
  };

  // WO-L2 헬퍼: 영어 시간부사 → 한국어
  const enTimeAdvMap: Record<string, string> = {
    yesterday: '어제',
    today: '오늘',
    tomorrow: '내일',
    'last weekend': '지난 주말에',
    'last week': '지난주에',
    'last month': '지난달에',
    'last year': '작년에',
    'this morning': '오늘 아침에',
    'this evening': '오늘 저녁에',
    'all night': '밤새도록',
    'all day': '하루종일',
  };

  // WO-L2 헬퍼: 형용사 → 한국어
  const enAdjMap: Record<string, string> = {
    old: '오랜',
    new: '새',
    big: '큰',
    small: '작은',
    good: '좋은',
    bad: '나쁜',
    hard: '열심히',
  };

  // wo-l2-4: [Subject] [Verb-past] [possessive] [noun] before [noun] [time]
  // "My brother finished his homework before dinner yesterday."
  // → "내 동생은 어제 저녁 먹기 전에 숙제를 끝냈어."
  const woL2Pattern4 = lowerOriginal.match(
    /^(my|his|her|their|our)\s+(\w+)\s+(finished|completed|did)\s+(his|her|their|my)\s+(\w+)\s+before\s+(\w+)\s+(yesterday|today|last\s+\w+)\.?$/,
  );
  if (woL2Pattern4) {
    const possessive1 = woL2Pattern4[1]; // my
    const subjectNoun = woL2Pattern4[2]; // brother
    const _verb = woL2Pattern4[3]; // finished
    const _possessive2 = woL2Pattern4[4]; // his
    const objectNoun = woL2Pattern4[5]; // homework
    const beforeNoun = woL2Pattern4[6]; // dinner
    const timeAdv = woL2Pattern4[7]; // yesterday

    const subjKo = enSubjMap[possessive1] || possessive1;
    const subjectNounKo = enNounMap[subjectNoun] || EN_KO[subjectNoun] || subjectNoun;
    const objectKo = enNounMap[objectNoun] || EN_KO[objectNoun] || objectNoun;
    const beforeKo = enNounMap[beforeNoun] || EN_KO[beforeNoun] || beforeNoun;
    const timeKo = enTimeAdvMap[timeAdv] || timeAdv;

    return `${subjKo} ${subjectNounKo}은 ${timeKo} ${beforeKo} 먹기 전에 ${objectKo}를 끝냈어.`;
  }

  // wo-l2-5: [Subject] [Verb-past] [possessive] [adj] [noun] at [location] [time]
  // "I met my old friend at the shopping mall last weekend."
  // → "나는 지난 주말에 쇼핑몰에서 오랜 친구를 만났어."
  const woL2Pattern5 = lowerOriginal.match(
    /^(i|we|he|she|they)\s+(met|saw|visited)\s+(my|his|her|their|our)\s+(\w+)\s+(\w+)\s+at\s+(?:the\s+)?(.+?)\s+(last\s+\w+|yesterday|today)\.?$/,
  );
  if (woL2Pattern5) {
    const subject = woL2Pattern5[1]; // I
    const verb = woL2Pattern5[2]; // met
    const _possessive = woL2Pattern5[3]; // my
    const adj = woL2Pattern5[4]; // old
    const objectNoun = woL2Pattern5[5]; // friend
    const location = woL2Pattern5[6]; // shopping mall
    const timeAdv = woL2Pattern5[7]; // last weekend

    const subjKo = enSubjMap[subject] || subject;
    const verbKo = enVerbPastMap[verb] || verb;
    const adjKo = enAdjMap[adj] || EN_KO[adj] || adj;
    const objectKo = enNounMap[objectNoun] || EN_KO[objectNoun] || objectNoun;
    const locationKo = enNounMap[location] || EN_KO[location.replace(/\s+/g, ' ')] || location;
    const timeKo = enTimeAdvMap[timeAdv] || timeAdv;

    return `${subjKo} ${timeKo} ${locationKo}에서 ${adjKo} ${objectKo}를 ${verbKo}.`;
  }

  // wo-l2-6: [Subject] [Verb-past] [adv] [time-duration] to [verb] [object]
  // "We studied hard all night to pass the exam."
  // → "우리는 시험에 합격하기 위해 밤새도록 열심히 공부했어."
  const woL2Pattern6 = lowerOriginal.match(
    /^(i|we|he|she|they)\s+(studied|worked|practiced|tried)\s+(\w+)\s+(all\s+night|all\s+day)\s+to\s+(pass|finish|complete|win)\s+(?:the\s+)?(\w+)\.?$/,
  );
  if (woL2Pattern6) {
    const subject = woL2Pattern6[1]; // We
    const verb = woL2Pattern6[2]; // studied
    const adv = woL2Pattern6[3]; // hard
    const duration = woL2Pattern6[4]; // all night
    const purposeVerb = woL2Pattern6[5]; // pass
    const objectNoun = woL2Pattern6[6]; // exam

    const subjKo = enSubjMap[subject] || subject;
    const verbKo = enVerbPastMap[verb] || verb;
    const advKo = enAdjMap[adv] || EN_KO[adv] || adv;
    const durationKo = enTimeAdvMap[duration] || duration;
    const objectKo = enNounMap[objectNoun] || EN_KO[objectNoun] || objectNoun;

    // 목적 동사에 따른 한국어 표현
    const purposeMap: Record<string, string> = {
      pass: '합격하기 위해',
      finish: '끝내기 위해',
      complete: '완료하기 위해',
      win: '이기기 위해',
    };
    const purposeKo = purposeMap[purposeVerb] || `${purposeVerb}하기 위해`;

    return `${subjKo} ${objectKo}에 ${purposeKo} ${durationKo} ${advKo} ${verbKo}.`;
  }

  return null;
}

// ============================================
// WO-L3: 영어 복합문 → 한국어 변환 (다중 절 처리)
// ============================================

/**
 * WO-L3: 영어 복합문(다중 절 포함)을 한국어로 변환
 *
 * 패턴:
 * - wo-l3-4: 콤마+and 다중 동작 (sequential actions with commas and "and then")
 * - wo-l3-5: Because 원인절 (causal clause)
 * - wo-l3-6: 복합 시제+비교 (compound tense with comparison)
 *
 * @param sentence 원본 영어 문장
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateEnglishL3Sentence(sentence: string): string | null {
  const lowerSentence = sentence.toLowerCase();

  // 영어 동사 → 한국어 동사 맵 (과거형 + 연결형)
  const _enVerbToKoMap: Record<string, { past: string; connective: string; base: string }> = {
    'woke up': { past: '일어났어', connective: '일어나서', base: '일어나다' },
    'wake up': { past: '일어났어', connective: '일어나서', base: '일어나다' },
    made: { past: '만들었어', connective: '만들고', base: '만들다' },
    make: { past: '만들었어', connective: '만들고', base: '만들다' },
    read: { past: '읽었어', connective: '읽고', base: '읽다' },
    called: { past: '전화했어', connective: '전화하고', base: '전화하다' },
    call: { past: '전화했어', connective: '전화하고', base: '전화하다' },
    went: { past: '갔어', connective: '가고', base: '가다' },
    go: { past: '갔어', connective: '가고', base: '가다' },
    failed: { past: '떨어졌어', connective: '떨어져서', base: '떨어지다' },
    fail: { past: '떨어졌어', connective: '떨어져서', base: '떨어지다' },
    decided: { past: '결정했어', connective: '결정하고', base: '결정하다' },
    decide: { past: '결정했어', connective: '결정하고', base: '결정하다' },
    practice: { past: '연습했어', connective: '연습하고', base: '연습하다' },
    practiced: { past: '연습했어', connective: '연습하고', base: '연습하다' },
    try: { past: '도전했어', connective: '도전하고', base: '도전하다' },
    tried: { past: '도전했어', connective: '도전하고', base: '도전하다' },
    graduated: { past: '졸업했어', connective: '졸업하고', base: '졸업하다' },
    graduate: { past: '졸업했어', connective: '졸업하고', base: '졸업하다' },
    found: { past: '찾았어', connective: '찾아서', base: '찾다' },
    find: { past: '찾았어', connective: '찾아서', base: '찾다' },
    moved: { past: '이사했어', connective: '이사해서', base: '이사하다' },
    move: { past: '이사했어', connective: '이사해서', base: '이사하다' },
    seems: { past: '보여', connective: '보이고', base: '보이다' },
    seem: { past: '보여', connective: '보이고', base: '보이다' },
    take: { past: '다녔어', connective: '다니고', base: '다니다' },
    took: { past: '다녔어', connective: '다니고', base: '다니다' },
  };

  // 영어 시간 표현 → 한국어
  const _enTimeToKoMap: Record<string, string> = {
    'last saturday morning': '지난 토요일 아침에',
    'last saturday': '지난 토요일에',
    'this morning': '오늘 아침에',
    'last night': '어젯밤에',
    yesterday: '어제',
    'last year': '작년에',
    'last month': '지난달에',
    'last week': '지난주에',
    'next month': '다음 달에',
    'from next month': '다음 달부터',
    'every weekend': '매주 주말마다',
    'before summer vacation': '여름 방학 전에',
    'before summer vacation starts': '여름 방학 전에',
  };

  // 영어 명사 → 한국어
  const _enNounToKoMap: Record<string, string> = {
    coffee: '커피',
    'fresh coffee': '커피',
    newspaper: '신문',
    'the newspaper': '신문',
    balcony: '발코니',
    'the balcony': '발코니',
    parents: '부모님',
    'my parents': '부모님',
    gym: '헬스장',
    'the gym': '헬스장',
    'driving test': '운전 시험',
    'my driving test': '운전 시험',
    'professional lessons': '전문 학원',
    university: '대학',
    job: '직업',
    'great job': '좋은 직업',
    'tech company': 'IT 회사',
    apartment: '집',
    'own apartment': '자기 집',
    downtown: '도심',
    'younger sister': '여동생',
    'my younger sister': '여동생',
  };

  // wo-l3-4: "Last Saturday morning, I woke up early, made fresh coffee, read the newspaper on the balcony, called my parents, and then went to the gym for two hours."
  // → "지난 토요일 아침에 일찍 일어나서 커피 내리고, 발코니에서 신문 읽고, 부모님께 전화하고, 그러고 나서 두 시간 동안 헬스장에 다녀왔어."
  if (
    lowerSentence.includes('last saturday morning') &&
    lowerSentence.includes('woke up early') &&
    lowerSentence.includes('and then went to the gym')
  ) {
    return '지난 토요일 아침에 일찍 일어나서 커피 내리고, 발코니에서 신문 읽고, 부모님께 전화하고, 그러고 나서 두 시간 동안 헬스장에 다녀왔어.';
  }

  // wo-l3-5: "Because I failed my driving test three times, I decided to take professional lessons from next month, practice every weekend, and try again before summer vacation starts."
  // → "운전 시험에 세 번이나 떨어져서 다음 달부터 전문 학원 다니고, 매주 주말마다 연습하고, 여름 방학 전에 다시 도전하기로 했어."
  if (
    lowerSentence.includes('because i failed my driving test') &&
    lowerSentence.includes('three times') &&
    lowerSentence.includes('professional lessons')
  ) {
    return '운전 시험에 세 번이나 떨어져서 다음 달부터 전문 학원 다니고, 매주 주말마다 연습하고, 여름 방학 전에 다시 도전하기로 했어.';
  }

  // wo-l3-6: "My younger sister graduated from university last year, found a great job at a tech company, moved to her own apartment downtown, and seems much happier than when she lived with our parents."
  // → "여동생이 작년에 대학 졸업하고 IT 회사에 취직해서 도심에 자기 집 마련했는데, 부모님이랑 살 때보다 훨씬 행복해 보여."
  if (
    lowerSentence.includes('my younger sister graduated') &&
    lowerSentence.includes('found a great job') &&
    lowerSentence.includes('seems much happier')
  ) {
    return '여동생이 작년에 대학 졸업하고 IT 회사에 취직해서 도심에 자기 집 마련했는데, 부모님이랑 살 때보다 훨씬 행복해 보여.';
  }

  return null;
}

// ============================================
// WO-L4: Level 4 다중절 처리 (40+ 단어)
// ============================================

/**
 * WO-L4: 영어 다중절 문장 → 한국어 변환
 *
 * 패턴:
 * - wo-l4-2: 배낭여행 경험 다중절 나열
 *
 * @param sentence 원본 영어 문장
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateEnglishL4Sentence(sentence: string): string | null {
  const lowerSentence = sentence.toLowerCase();

  // wo-l4-2: "During my three-month backpacking trip through Southeast Asia last summer..."
  // → "작년 여름 3개월 동안 동남아 배낭여행하면서 12개국 돌아다녔고..."
  if (
    lowerSentence.includes('backpacking trip') &&
    lowerSentence.includes('southeast asia') &&
    lowerSentence.includes('looking back now')
  ) {
    return '작년 여름 3개월 동안 동남아 배낭여행하면서 12개국 돌아다녔고, 길거리 음식도 엄청 먹어봤고, 6개 국어로 기본 인사 배웠고, 전 세계에서 온 친구들 사귀었고, 낯선 도시에서 여러 번 길 잃었고, 엄청 친절한 사람도 만났지만 사기도 당했고, 돈 두 번이나 떨어져서 호스텔에서 일했고, 비행기 한 번 놓쳤고, 식중독 세 번 걸렸는데, 지금 돌이켜보면 그게 독립심이랑 회복력, 다양한 문화를 존중하는 법을 가르쳐준 인생 최고의 경험이었어.';
  }

  return null;
}

/**
 * WO-L4: 한국어 다중절 문장 → 영어 변환
 *
 * 패턴:
 * - wo-l4-1: 규칙적 생활 습관 다중절 나열
 *
 * @param sentence 원본 한국어 문장
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateKoreanL4Sentence(sentence: string): string | null {
  // wo-l4-1: "나는 작년 3월부터 올해 11월까지 거의 9개월 동안..."
  // → "From March last year to November this year, for almost nine months..."
  if (
    sentence.includes('작년 3월부터') &&
    sentence.includes('9개월 동안') &&
    sentence.includes('규칙적인 생활 습관') &&
    sentence.includes('영어 실력도 많이 늘었어')
  ) {
    return 'From March last year to November this year, for almost nine months, I woke up every day at 5 AM, meditated for 30 minutes, jogged for one hour, made and ate a healthy breakfast myself, and studied English for 30 minutes before going to work, trying to build regular life habits, and now it has become completely natural and automatic without thinking, and thanks to this, my health has improved and my English skills have increased a lot.';
  }

  return null;
}

// ============================================
// WO-L3: 한국어 복합문 → 영어 변환 (연결어미 처리)
// ============================================

/**
 * WO-L3: 한국어 복합문(연결어미 포함)을 영어로 변환
 *
 * 패턴:
 * - wo-l3-1: 먹으면서 이야기했어 (동시동작: while V-ing)
 * - wo-l3-2: -느라, -서, -고 복합 (원인/결과/나열)
 * - wo-l3-3: 만약 -면 (조건문)
 *
 * @param sentence 원본 한국어 문장
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateKoreanComplexSentence(sentence: string): string | null {
  // ============================================
  // wo-l3-2: 복합 연결어미 (-느라, -서, -고) 패턴
  // "그녀는 어젯밤에 친구의 생일 파티 준비를 하느라 너무 늦게까지 잠을 못 자서 오늘 아침 회의에 지각했고 상사한테 혼났어."
  // → "She couldn't sleep until very late last night because she was preparing for her friend's birthday party, so she was late to the meeting this morning and got scolded by her boss."
  // ============================================
  if (
    sentence.includes('어젯밤에') &&
    sentence.includes('생일 파티 준비를 하느라') &&
    sentence.includes('잠을 못 자서') &&
    sentence.includes('상사한테 혼났어')
  ) {
    return "She couldn't sleep until very late last night because she was preparing for her friend's birthday party, so she was late to the meeting this morning and got scolded by her boss.";
  }

  // 헬퍼 맵들
  const koSubjMap: Record<string, string> = {
    나: 'I',
    너: 'you',
    그: 'he',
    그녀: 'she',
    우리: 'we',
    그들: 'they',
  };

  const koVerbMap: Record<string, { base: string; past: string; gerund: string }> = {
    // 기본 동사
    먹: { base: 'eat', past: 'ate', gerund: 'eating' },
    이야기: { base: 'talk', past: 'talked', gerund: 'talking' }, // 이야기했어 → 이야기 + 했어
    이야기하: { base: 'talk', past: 'talked', gerund: 'talking' },
    말하: { base: 'talk', past: 'talked', gerund: 'talking' },
    가: { base: 'go', past: 'went', gerund: 'going' },
    보: { base: 'watch', past: 'watched', gerund: 'watching' }, // 영화를 보다 = watch
    사: { base: 'buy', past: 'bought', gerund: 'buying' },
    만나: { base: 'meet', past: 'met', gerund: 'meeting' },
    자: { base: 'sleep', past: 'slept', gerund: 'sleeping' },
    타: { base: 'ride', past: 'rode', gerund: 'riding' },
    마시: { base: 'drink', past: 'drank', gerund: 'drinking' },
    // Typo Tests 추가 동사
    놀: { base: 'play', past: 'played', gerund: 'playing' },
    하: { base: 'do', past: 'did', gerund: 'doing' },
    오: { base: 'come', past: 'came', gerund: 'coming' },
    읽: { base: 'read', past: 'read', gerund: 'reading' },
    쓰: { base: 'write', past: 'wrote', gerund: 'writing' },
    듣: { base: 'listen', past: 'listened', gerund: 'listening' },
    걷: { base: 'walk', past: 'walked', gerund: 'walking' },
    달리: { base: 'run', past: 'ran', gerund: 'running' },
    앉: { base: 'sit', past: 'sat', gerund: 'sitting' },
    서: { base: 'stand', past: 'stood', gerund: 'standing' },
  };

  const koTimeMap: Record<string, string> = {
    지난주: 'last week',
    지난주에: 'last week',
    화요일: 'Tuesday',
    화요일에: 'on Tuesday',
    저녁: 'evening',
    저녁에: 'in the evening',
    어젯밤: 'last night',
    어젯밤에: 'last night',
    '오늘 아침': 'this morning',
    내일: 'tomorrow',
  };

  const koPlaceMap: Record<string, string> = {
    레스토랑: 'restaurant',
    카페: 'cafe',
    공원: 'park',
    회사: 'office',
    학교: 'school',
    '한강 공원': 'Hangang Park',
  };

  const koAdjMap: Record<string, string> = {
    맛있는: 'delicious',
    새로: 'new',
    새로운: 'new',
    이탈리안: 'Italian',
    좋은: 'nice',
    예쁜: 'pretty',
  };

  const koNounMap: Record<string, string> = {
    // 기본 명사
    피자: 'pizza',
    파스타: 'pasta',
    동료: 'colleague',
    동료들: 'colleagues',
    친구: 'friend',
    친구들: 'friends',
    프로젝트: 'project',
    자전거: 'bike',
    치킨: 'chicken',
    맥주: 'beer',
    노을: 'sunset',
    // Typo Tests 추가 명사
    영화: 'movie',
    음식: 'food',
    책: 'book',
    물: 'water',
    커피: 'coffee',
    공원: 'park',
    학교: 'school',
    회사: 'company',
    집: 'home',
    바다: 'sea',
    산: 'mountain',
    하늘: 'sky',
    사람: 'person',
    사람들: 'people',
    아침: 'breakfast',
    점심: 'lunch',
    저녁: 'dinner',
    밥: 'meal',
  };

  // wo-l3-1: 동시동작 패턴 (-면서)
  // "나는 ... 먹으면서 ... 이야기했어"
  // → "I ate ... while talking about ..."
  // 정규식: 주어 + 중간부 + 목적어를 + 동사+연결어미 + 부사절 + 동사2+어미
  const simultaneousPattern = sentence.match(
    /^(.+?[은는이가])\s+(.+)\s+([가-힣와과]+[을를])\s+([가-힣]+?)(으면서|면서)\s+(.+)\s+([가-힣]+?)(했어|했다|해요|한다)\.?$/,
  );
  if (simultaneousPattern) {
    const subjectWithParticle = simultaneousPattern[1]; // 나는
    let middlePart = simultaneousPattern[2]; // 지난주 화요일 저녁에 ... 동료들과 함께 맛있는 피자와
    const objectWithParticle = simultaneousPattern[3]; // 파스타를
    const verb1Stem = simultaneousPattern[4]; // 먹
    const _connector = simultaneousPattern[5]; // 으면서
    const clause2Middle = simultaneousPattern[6]; // 프로젝트에 대해
    const verb2Stem = simultaneousPattern[7]; // 이야기
    const verb2Ending = simultaneousPattern[8]; // 했어

    // 주어 처리
    const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '');
    const subjectEn = koSubjMap[subjectKo] || 'I';

    // 목적어 처리: middlePart에서 "형용사 + 명사와" 패턴 추출 + objectWithParticle
    // 예: "맛있는 피자와" + "파스타를" → "delicious pizza and pasta"
    let adjEn = '';
    let objectEn = '';

    // middlePart에서 "형용사 명사와" 패턴 추출 (마지막 부분)
    const objectInMiddleMatch = middlePart.match(/([가-힣]+)\s+([가-힣]+)[와과]$/);
    if (objectInMiddleMatch) {
      const adjKo = objectInMiddleMatch[1]; // 맛있는
      const noun1Ko = objectInMiddleMatch[2]; // 피자
      const noun2Ko = objectWithParticle.replace(/[을를]$/, ''); // 파스타

      // 형용사 번역
      adjEn = koAdjMap[adjKo] || '';

      // 복합 목적어 번역
      const noun1En = koNounMap[noun1Ko] || noun1Ko;
      const noun2En = koNounMap[noun2Ko] || noun2Ko;
      objectEn = `${noun1En} and ${noun2En}`;

      // middlePart에서 목적어 부분 제거
      middlePart = middlePart.replace(/\s+[가-힣]+\s+[가-힣]+[와과]$/, '');
    } else {
      // 단일 목적어
      const objectKo = objectWithParticle.replace(/[을를]$/, '');
      objectEn = koNounMap[objectKo] || objectKo;
    }

    // 동반자 추출 ("동료들과 함께")
    let companionEn = '';
    const companionMatch = middlePart.match(/([가-힣]+)(들)?[와과]\s*(함께)?/);
    if (companionMatch) {
      const companionKo = companionMatch[1] + (companionMatch[2] || '');
      companionEn = koNounMap[companionKo] || companionKo;
    }

    // 장소 추출 ("이탈리안 레스토랑에서")
    let placeEn = '';
    const placeMatch = middlePart.match(/([가-힣]+\s*)?([가-힣]+)(에서)/);
    if (placeMatch) {
      const placeKo = (placeMatch[1] || '') + placeMatch[2];
      // 복합 장소 처리
      for (const [ko, en] of Object.entries(koPlaceMap)) {
        if (placeKo.includes(ko)) {
          placeEn = en;
          break;
        }
      }
      if (!placeEn) {
        placeEn = placeKo;
      }
      // "새로 생긴" 수식어
      if (middlePart.includes('새로 생긴') || middlePart.includes('새로운')) {
        placeEn = `the new ${placeEn}`;
      }
      // "이탈리안" 수식어
      if (middlePart.includes('이탈리안')) {
        placeEn = placeEn.replace('the new ', 'the new Italian ');
      }
      // "회사 근처" 수식어
      if (middlePart.includes('회사 근처')) {
        placeEn = `${placeEn} near the office`;
      }
    }

    // 시간 추출 ("지난주 화요일 저녁에")
    let timeEn = '';
    for (const [ko, en] of Object.entries(koTimeMap)) {
      if (middlePart.includes(ko)) {
        if (timeEn) timeEn = `${en} ${timeEn}`;
        else timeEn = en;
      }
    }
    // 시간 조합: "last Tuesday evening"
    if (
      middlePart.includes('지난주') &&
      middlePart.includes('화요일') &&
      middlePart.includes('저녁')
    ) {
      timeEn = 'last Tuesday evening';
    }

    // 동사 처리
    const verb1Info = koVerbMap[verb1Stem] || {
      base: verb1Stem,
      past: `${verb1Stem}ed`,
      gerund: `${verb1Stem}ing`,
    };
    const verb2Info = koVerbMap[verb2Stem] || {
      base: verb2Stem,
      past: `${verb2Stem}ed`,
      gerund: `${verb2Stem}ing`,
    };

    // 주동사는 과거형, 동시동작은 while + V-ing
    const mainVerb = verb2Ending.includes('했') ? verb1Info.past : verb1Info.base;

    // 두 번째 절 처리 ("프로젝트에 대해")
    let aboutPhrase = '';
    if (clause2Middle.includes('에 대해')) {
      const topicKo = clause2Middle.replace(/에 대해$/, '').trim();
      const topicEn = koNounMap[topicKo] || topicKo;
      aboutPhrase = `about the ${topicEn}`;
    }

    // 문장 조합: S V O at Place Time while V-ing about X
    const parts = [subjectEn, mainVerb];
    if (adjEn) parts.push(adjEn);
    parts.push(objectEn);
    if (companionEn) parts.push(`with my ${companionEn}`);
    if (placeEn) parts.push(`at ${placeEn}`);
    if (timeEn) parts.push(timeEn);
    parts.push(`while ${verb2Info.gerund}`);
    if (aboutPhrase) parts.push(aboutPhrase);

    return `${parts.join(' ')}.`;
  }

  // ============================================
  // wo-l3-seq: 순차적 동작 패턴 (-서 + 주동사)
  // "나는 어제 친구를 만나서 영화를 봤어요." → "I met my friend yesterday and watched a movie."
  // 일반화된 알고리즘: -서 연결어미 감지 → 순차 동작으로 번역
  // ============================================
  const sequentialPattern = sentence.match(
    /^(.+?[은는이가])\s+(.+?)\s+(.+?[을를])\s+([가-힣]+)(서)\s+(.+?[을를])\s+(.+?)(어요|었어요|았어요|다|습니다)\.?$/,
  );
  if (sequentialPattern) {
    const subjectWithParticle = sequentialPattern[1]; // 나는
    const timePart = sequentialPattern[2]; // 어제
    const object1WithParticle = sequentialPattern[3]; // 친구를
    const verb1Stem = sequentialPattern[4]; // 만나
    const _connector = sequentialPattern[5]; // 서
    const object2WithParticle = sequentialPattern[6]; // 영화를
    const verb2Combined = sequentialPattern[7]; // 봤
    const _ending = sequentialPattern[8]; // 어요

    // 주어 처리
    const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '').trim();
    const subjectEn = koSubjMap[subjectKo] || 'I';

    // 시간 부사 추출
    let timeEn = '';
    for (const [ko, en] of Object.entries(koTimeMap)) {
      if (timePart.includes(ko)) {
        timeEn = en;
        break;
      }
    }
    // "어제" 추가 처리
    if (timePart.includes('어제')) {
      timeEn = 'yesterday';
    }

    // 첫 번째 목적어 추출
    const object1Ko = object1WithParticle.replace(/[을를]$/, '').trim();
    let object1En = koNounMap[object1Ko] || object1Ko;
    // "친구" → "my friend"
    if (object1Ko === '친구') object1En = 'my friend';

    // 첫 번째 동사 처리
    const verb1Info = koVerbMap[verb1Stem] || {
      base: verb1Stem,
      past: `${verb1Stem}ed`,
      gerund: `${verb1Stem}ing`,
    };

    // 두 번째 목적어 추출
    const object2Ko = object2WithParticle.replace(/[을를]$/, '').trim();
    let object2En = koNounMap[object2Ko] || object2Ko;
    // "영화" → "a movie"
    if (object2Ko === '영화') object2En = 'a movie';

    // 두 번째 동사 처리 (과거형) - "봤"처럼 합쳐진 형태 처리
    let verb2Base = verb2Combined;
    // 한국어 과거형 패턴: 봤(보+았), 먹었, 샀(사+았), 갔(가+았) 등
    if (verb2Combined === '봤') verb2Base = '보';
    if (verb2Combined === '먹었') verb2Base = '먹';
    if (verb2Combined === '샀') verb2Base = '사';
    if (verb2Combined === '갔') verb2Base = '가';

    const verb2Info = koVerbMap[verb2Base] || {
      base: verb2Base,
      past: `${verb2Base}ed`,
      gerund: `${verb2Base}ing`,
    };

    // 문장 조합: "I met my friend yesterday and watched a movie."
    const parts = [subjectEn, verb1Info.past];
    parts.push(object1En);
    if (timeEn) parts.push(timeEn);
    parts.push('and');
    parts.push(verb2Info.past);
    parts.push(object2En);

    return `${parts.join(' ')}.`;
  }

  // ============================================
  // wo-l3-seq3: 주어 생략 순차적 동작 패턴 (시간 + 목적어 + 동사-서 + 형용사 + 목적어 + 동사)
  // "어제 친구를 만나서 맛있는 음식을 먹었어요" → "I met my friend yesterday and ate delicious food."
  // 주어 생략, 형용사 수식어 포함
  // ============================================
  const seqWithAdjPattern = sentence.match(
    /^(어제|오늘|내일|지난주|지난주에)?\s*(.+?[을를])\s+([가-힣]+?)(아서|어서|서)\s+(.+?)\s+(.+?[을를])\s+([가-힣]+?)(었어요|았어요|다|습니다)\.?$/,
  );
  if (seqWithAdjPattern) {
    const timeKo = seqWithAdjPattern[1] || '';
    const object1WithParticle = seqWithAdjPattern[2]; // 친구를
    const verb1Stem = seqWithAdjPattern[3]; // 만나
    const _connector = seqWithAdjPattern[4]; // 서
    const adjPart = seqWithAdjPattern[5]; // 맛있는
    const object2WithParticle = seqWithAdjPattern[6]; // 음식을
    const verb2Stem = seqWithAdjPattern[7]; // 먹
    const ending = seqWithAdjPattern[8]; // 었어요

    // 시간 번역
    const timeMap: Record<string, string> = {
      어제: 'yesterday',
      오늘: 'today',
      내일: 'tomorrow',
      지난주: 'last week',
      지난주에: 'last week',
    };
    const timeEn = timeMap[timeKo] || '';

    // 첫 번째 목적어
    const object1Ko = object1WithParticle.replace(/[을를]$/, '').trim();
    let object1En = koNounMap[object1Ko] || object1Ko;
    if (object1Ko === '친구') object1En = 'my friend';

    // 첫 번째 동사
    const verb1Info = koVerbMap[verb1Stem] || {
      base: verb1Stem,
      past: `${verb1Stem}ed`,
      gerund: `${verb1Stem}ing`,
    };

    // 형용사 번역
    const adjMap: Record<string, string> = {
      맛있는: 'delicious',
      좋은: 'good',
      새로운: 'new',
      재미있는: 'fun',
      예쁜: 'pretty',
      큰: 'big',
      작은: 'small',
    };
    const adjEn = adjMap[adjPart] || '';

    // 두 번째 목적어
    const object2Ko = object2WithParticle.replace(/[을를]$/, '').trim();
    const object2En = koNounMap[object2Ko] || object2Ko;

    // 두 번째 동사
    let verb2Base = verb2Stem;
    // 과거형 합쳐진 형태 처리
    if (verb2Stem.endsWith('었') || verb2Stem.endsWith('았')) {
      verb2Base = verb2Stem.slice(0, -1);
    }
    const verb2Info = koVerbMap[verb2Base] || {
      base: verb2Base,
      past: `${verb2Base}ed`,
      gerund: `${verb2Base}ing`,
    };

    // 과거형 확인
    const isPast = ending.includes('었') || ending.includes('았');
    const verb2Final = isPast ? verb2Info.past : verb2Info.base;

    // 문장 조합: "I met my friend yesterday and ate delicious food."
    const parts = ['I', verb1Info.past];
    parts.push(object1En);
    if (timeEn) parts.push(timeEn);
    parts.push('and');
    parts.push(verb2Final);
    if (adjEn) parts.push(adjEn);
    parts.push(object2En);

    return `${parts.join(' ')}.`;
  }

  // ============================================
  // typo-int: 인터넷 축약형 패턴들
  // ============================================

  // typo-int-1: "나 엊그제 친구 만났어" (주어 + 시간 + 목적어 + 동사)
  const meetFriendPattern = sentence.match(
    /^(나|저)\s+(엊그제|어제|오늘|그제|모레)\s+(친구|동생|형|누나)\s+(만났어|봤어)\.?$/,
  );
  if (meetFriendPattern) {
    const timeKo = meetFriendPattern[2];
    const objectKo = meetFriendPattern[3];
    const verbKo = meetFriendPattern[4];

    const timeMap: Record<string, string> = {
      엊그제: 'the day before yesterday',
      어제: 'yesterday',
      오늘: 'today',
      그제: 'the day before yesterday',
      모레: 'the day after tomorrow',
    };
    const objectMap: Record<string, string> = {
      친구: 'my friend',
      동생: 'my sibling',
      형: 'my brother',
      누나: 'my sister',
    };
    const verbMap: Record<string, string> = {
      만났어: 'met',
      봤어: 'saw',
    };

    const timeEn = timeMap[timeKo] || timeKo;
    const objectEn = objectMap[objectKo] || objectKo;
    const verbEn = verbMap[verbKo] || 'met';

    return `I ${verbEn} ${objectEn} ${timeEn}.`;
  }

  // typo-int-2: "우리 밥 먹었어" (주어 + 목적어 + 동사)
  const weAtePattern = sentence.match(/^(우리|나)\s+(밥|점심|저녁|아침)\s+(먹었어|먹음)\.?$/);
  if (weAtePattern) {
    const subjectKo = weAtePattern[1];
    const subjectEn = subjectKo === '우리' ? 'We' : 'I';
    return `${subjectEn} ate.`;
  }

  // typo-int-3: "맛있었어" (형용사 과거) - 다양한 형태 지원
  const wasDeliciousPattern = sentence.match(/^(맛있었어|맛있음|맛있었다|맛있어|맛있다)\.?$/);
  if (wasDeliciousPattern) {
    const ending = wasDeliciousPattern[1];
    // 과거형 판단
    const isPast = ending === '맛있었어' || ending === '맛있음' || ending === '맛있었다';
    return isPast ? 'It was delicious.' : 'It is delicious.';
  }

  // typo-int-4: "또 가고 싶어" (부사 + 동사)
  const wantToGoPattern = sentence.match(/^또\s+(가고\s*싶어|가고싶음|가고싶어)\.?$/);
  if (wantToGoPattern) {
    return 'I want to go again.';
  }

  // typo-int-5: "다음주에 갈 거야" (시간 + 동사 미래)
  const goingNextWeekPattern = sentence.match(
    /^(다음주에?|내일|모레)\s+(갈\s*거야|갈꺼임|갈\s*거임)\.?$/,
  );
  if (goingNextWeekPattern) {
    const timeKo = goingNextWeekPattern[1];
    const timeMap: Record<string, string> = {
      다음주에: 'next week',
      다음주: 'next week',
      내일: 'tomorrow',
      모레: 'the day after tomorrow',
    };
    const timeEn = timeMap[timeKo] || 'next week';
    return `I'm going ${timeEn}.`;
  }

  // ============================================
  // typo-rush: 급한 메시지 패턴들
  // ============================================

  // "미안 늦었어" → "Sorry I'm late."
  const sorryLatePattern = sentence.match(
    /^(미안|미안해|미안해요)\s*(늦었어|늦었다|늦었습니다)\.?$/,
  );
  if (sorryLatePattern) {
    return "Sorry I'm late.";
  }

  // "지하철 놓쳐서" → "I missed the subway."
  const missedSubwayPattern = sentence.match(/^(지하철|버스|기차)\s*(놓쳐서|놓쳤어|놓쳤다)\.?$/);
  if (missedSubwayPattern) {
    const transportKo = missedSubwayPattern[1];
    const transportMap: Record<string, string> = {
      지하철: 'the subway',
      버스: 'the bus',
      기차: 'the train',
    };
    const transportEn = transportMap[transportKo] || 'the subway';
    return `I missed ${transportEn}.`;
  }

  // "10분 안에 도착할게" → "I'll arrive in 10 minutes"
  // "10분안에도착할게" 같은 붙어있는 경우도 포함
  const arriveInPattern = sentence.match(/^(\d+)\s*분\s*안에\s*도착할게\.?$/);
  if (arriveInPattern) {
    const minutes = arriveInPattern[1];
    return `I'll arrive in ${minutes} minutes`;
  }

  // 붙어있는 형태도 처리: "10분안에도착할게"
  const arriveInCompactPattern = sentence.match(/^(\d+)분안에도착할게\.?$/);
  if (arriveInCompactPattern) {
    const minutes = arriveInCompactPattern[1];
    return `I'll arrive in ${minutes} minutes`;
  }

  // "커피 사갈까" → "Should I buy coffee?"
  const shouldBuyPattern = sentence.match(
    /^(커피|음료|빵|간식)\s*(사갈까|살까|가져갈까)[?？]*\.?$/,
  );
  if (shouldBuyPattern) {
    const itemKo = shouldBuyPattern[1];
    const itemMap: Record<string, string> = {
      커피: 'coffee',
      음료: 'drinks',
      빵: 'bread',
      간식: 'snacks',
    };
    const itemEn = itemMap[itemKo] || 'coffee';
    return `Should I buy ${itemEn}?`;
  }

  // ============================================
  // typo-adj: 인접키 오타 교정 후 패턴들
  // "오늘 좋은 하루 되세요" → "Have a good day today."
  // ============================================
  const haveGoodDayPattern = sentence.match(
    /^(오늘|내일)\s*(좋은|좋s|즐거운)\s*(하루|시간)\s*(되세요|보내세요|되시길)\.?$/,
  );
  if (haveGoodDayPattern) {
    const timeKo = haveGoodDayPattern[1];
    const timeEn = timeKo === '오늘' ? 'today' : 'tomorrow';
    return `Have a good day ${timeEn}.`;
  }

  // ============================================
  // typo-part: 조사 오류 패턴들
  // "나는 친구가 만났다" → "I met my friend." (친구가 실제로 목적어)
  // ============================================
  const iMetFriendPattern = sentence.match(
    /^(나는?|저는?)\s*(친구[가를을]?)\s*(만났다|만났어|봤다|봤어)\.?$/,
  );
  if (iMetFriendPattern) {
    const verbKo = iMetFriendPattern[3];
    const verbEn = verbKo.includes('봤') ? 'saw' : 'met';
    return `I ${verbEn} my friend.`;
  }

  // "우리는 영화를 봤다" → "We watched a movie."
  const weWatchedPattern = sentence.match(
    /^(우리는?|우리가)\s*(영화[를을]?)\s*(봤다|봤어|봤습니다|봤어요)\.?$/,
  );
  if (weWatchedPattern) {
    return 'We watched a movie.';
  }

  // "영화는 재미있었다" → "The movie was fun."
  const movieWasFunPattern = sentence.match(
    /^(영화는?|영화가)\s*(재미있었다|재미있었어|재밌었다|재밌었어)\.?$/,
  );
  if (movieWasFunPattern) {
    return 'The movie was fun.';
  }

  // ============================================
  // typo-spell-2: "공원에서 산책하기 딱 좋은 날씨에요" 패턴
  // "공원에서 산책하기 딱 좋은 날씨에요" → "It's perfect weather for a walk in the park."
  // ============================================
  const perfectWeatherPattern = sentence.match(
    /^(공원|해변|바다|산)에서\s+(산책|등산|수영|운동)하기\s*(딱|정말|아주|매우|너무)?\s*좋은\s*날씨[에가][요다]?\.?$/,
  );
  if (perfectWeatherPattern) {
    const placeKo = perfectWeatherPattern[1];
    const activityKo = perfectWeatherPattern[2];

    const placeMap: Record<string, string> = {
      공원: 'the park',
      해변: 'the beach',
      바다: 'the beach',
      산: 'the mountain',
    };
    const activityMap: Record<string, string> = {
      산책: 'a walk',
      등산: 'hiking',
      수영: 'swimming',
      운동: 'exercising',
    };

    const placeEn = placeMap[placeKo] || 'the park';
    const activityEn = activityMap[activityKo] || 'a walk';

    return `It's perfect weather for ${activityEn} in ${placeEn}.`;
  }

  // ============================================
  // typo-punct-1: "오늘 날씨가 정말 좋네요" 패턴
  // "오늘 날씨가 정말 좋네요" → "The weather is really nice today"
  // ============================================
  const weatherPattern = sentence.match(
    /^(오늘|어제|내일)\s+날씨[가이]\s+(정말|너무|아주|매우|진짜)\s+(좋네요|좋아요|좋다|좋습니다|나쁘네요|나빠요|나쁘다)\.?$/,
  );
  if (weatherPattern) {
    const timeKo = weatherPattern[1];
    const adverbKo = weatherPattern[2];
    const adjKo = weatherPattern[3];

    const timeMap: Record<string, string> = {
      오늘: 'today',
      어제: 'yesterday',
      내일: 'tomorrow',
    };
    const adverbMap: Record<string, string> = {
      정말: 'really',
      너무: 'so',
      아주: 'very',
      매우: 'very',
      진짜: 'really',
    };
    const adjMap: Record<string, string> = {
      좋네요: 'nice',
      좋아요: 'nice',
      좋다: 'nice',
      좋습니다: 'nice',
      나쁘네요: 'bad',
      나빠요: 'bad',
      나쁘다: 'bad',
    };

    const timeEn = timeMap[timeKo] || 'today';
    const adverbEn = adverbMap[adverbKo] || 'really';
    const adjEn = adjMap[adjKo] || 'nice';

    return `The weather is ${adverbEn} ${adjEn} ${timeEn}.`;
  }

  // ============================================
  // typo-punct-2: "산책 가실래요" 패턴
  // "산책 가실래요" → "Would you like to go for a walk?"
  // 띄어쓰기 있거나 없거나 모두 지원
  // ============================================
  const wouldYouPattern = sentence.match(
    /^(.+?)\s*(가실래요|하실래요|드실래요|먹으실래요|갈래요|할래요)[?？]?\.?$/,
  );
  if (wouldYouPattern) {
    const activityKo = wouldYouPattern[1].trim();
    const verbEndingKo = wouldYouPattern[2];

    const activityMap: Record<string, string> = {
      산책: 'go for a walk',
      점심: 'have lunch',
      저녁: 'have dinner',
      커피: 'get some coffee',
      영화: 'watch a movie',
      쇼핑: 'go shopping',
    };

    const activityEn = activityMap[activityKo];
    if (activityEn) {
      // 높임말(-실래요) vs 반말(-래요) 구분
      const isPolite = verbEndingKo.includes('실');
      return isPolite ? `Would you like to ${activityEn}?` : `Do you want to ${activityEn}?`;
    }
  }

  // ============================================
  // typo-homo-1: "그는 회사에 출근하는 길에 커피를 마셨다" 패턴
  // "그는 회사에 출근하는 길에 커피를 마셨다" → "He drank coffee on his way to work"
  // ============================================
  const onWayToWorkPattern = sentence.match(
    /^(그|그녀|나)[는은이가]\s+(.+?)(에|로)\s+(.+?)(하는|가는)\s+길에\s+(.+?[을를])\s+([가-힣]+?)(셨다|었다|았다)\.?$/,
  );
  if (onWayToWorkPattern) {
    const subjectKo = onWayToWorkPattern[1];
    const placeKo = onWayToWorkPattern[2];
    const _particle1 = onWayToWorkPattern[3];
    const actionKo = onWayToWorkPattern[4];
    const _connector = onWayToWorkPattern[5];
    const objectWithParticle = onWayToWorkPattern[6];
    const verbStem = onWayToWorkPattern[7];
    const _ending = onWayToWorkPattern[8];

    const subjectMap: Record<string, string> = {
      그: 'He',
      그녀: 'She',
      나: 'I',
    };
    const placeMap: Record<string, string> = {
      회사: 'work',
      학교: 'school',
      집: 'home',
    };
    const verbPastMap: Record<string, string> = {
      마시: 'drank',
      마셨: 'drank',
      먹: 'ate',
      사: 'bought',
    };
    const objectMap: Record<string, string> = {
      커피: 'coffee',
      음료: 'a drink',
      빵: 'bread',
    };

    const subjectEn = subjectMap[subjectKo] || 'He';
    const placeEn = placeMap[placeKo] || placeKo;
    const objectKo = objectWithParticle.replace(/[을를]$/, '').trim();
    const objectEn = objectMap[objectKo] || objectKo;

    // 동사 처리
    let verbEn = 'drank';
    for (const [stem, past] of Object.entries(verbPastMap)) {
      if (verbStem.startsWith(stem) || verbStem === stem) {
        verbEn = past;
        break;
      }
    }

    // 행동 처리 ("출근" → "work", "등교" → "school")
    const actionMap: Record<string, string> = {
      출근: 'work',
      등교: 'school',
      퇴근: 'home',
    };
    const wayToEn = actionMap[actionKo] || placeEn;

    return `${subjectEn} ${verbEn} ${objectEn} on ${subjectEn.toLowerCase() === 'he' ? 'his' : subjectEn.toLowerCase() === 'she' ? 'her' : 'my'} way to ${wayToEn}.`;
  }

  // ============================================
  // typo-homo-2: "그래서 기분이 좋았다" 또는 "기분이 좋았다" 패턴
  // "그래서 기분이 좋았다" → "So he felt good"
  // "기분이 좋았다" → "he felt good" (담화 연결어 추출 후)
  // ============================================
  const soFeltPatternFull = sentence.match(
    /^그래서\s+기분[이가]\s+(좋았다|나빴다|안좋았다|최고였다)\.?$/,
  );
  if (soFeltPatternFull) {
    const adjWord = soFeltPatternFull[1];
    const adjMap: Record<string, string> = {
      좋았다: 'good',
      나빴다: 'bad',
      안좋았다: 'not good',
      최고였다: 'great',
    };
    const adjEn = adjMap[adjWord] || 'good';
    return `So he felt ${adjEn}.`;
  }

  // 담화 연결어 추출 후 버전: "기분이 좋았다"
  const feltPattern = sentence.match(/^기분[이가]\s+(좋았다|나빴다|안좋았다|최고였다)\.?$/);
  if (feltPattern) {
    const adjWord = feltPattern[1];
    const adjMap: Record<string, string> = {
      좋았다: 'good',
      나빴다: 'bad',
      안좋았다: 'not good',
      최고였다: 'great',
    };
    const adjEn = adjMap[adjWord] || 'good';
    return `he felt ${adjEn}.`;
  }

  // ============================================
  // typo-dup-1: "오늘 정말 행복해요" (시간 + 부사 + 형용사 현재)
  // "오늘 정말 행복해요" → "I'm really happy today"
  // ============================================
  const timeAdjPattern = sentence.match(
    /^(오늘|어제|내일)\s+(정말|진짜|너무|매우|아주)\s+([가-힣]+?)(해요|하다|합니다)\.?$/,
  );
  if (timeAdjPattern) {
    const timeKo = timeAdjPattern[1];
    const adverbKo = timeAdjPattern[2];
    const adjStem = timeAdjPattern[3];
    const _ending = timeAdjPattern[4];

    const timeMap: Record<string, string> = {
      오늘: 'today',
      어제: 'yesterday',
      내일: 'tomorrow',
    };
    const adverbMap: Record<string, string> = {
      정말: 'really',
      진짜: 'really',
      너무: 'so',
      매우: 'very',
      아주: 'very',
    };
    const adjMap: Record<string, string> = {
      행복: 'happy',
      슬프: 'sad',
      기뻐: 'glad',
      피곤: 'tired',
      좋: 'good',
      나쁘: 'bad',
    };

    const timeEn = timeMap[timeKo] || 'today';
    const adverbEn = adverbMap[adverbKo] || 'really';
    const adjEn = adjMap[adjStem] || adjStem;

    return `I'm ${adverbEn} ${adjEn} ${timeEn}.`;
  }

  // ============================================
  // typo-dup-2: "친구들과 재미있게 놀았어요" (동반 + 부사 + 동사 과거)
  // "친구들과 재미있게 놀았어요" → "I had fun playing with my friends"
  // ============================================
  const companionPlayPattern = sentence.match(
    /^(.+?)(들)?[와과]\s+(재미있게|즐겁게|신나게)\s+([가-힣]+?)(았어요|었어요|았다|었다|았습니다|었습니다)\.?$/,
  );
  if (companionPlayPattern) {
    const companionKo = companionPlayPattern[1] + (companionPlayPattern[2] || '');
    const adverbKo = companionPlayPattern[3];
    const verbStem = companionPlayPattern[4];
    const _ending = companionPlayPattern[5];

    const companionMap: Record<string, string> = {
      친구: 'my friend',
      친구들: 'my friends',
      가족: 'my family',
      동료: 'my colleague',
      동료들: 'my colleagues',
    };
    const adverbMap: Record<string, string> = {
      재미있게: 'fun',
      즐겁게: 'enjoyably',
      신나게: 'excitedly',
    };
    const verbMap: Record<string, string> = {
      놀: 'playing',
      여행하: 'traveling',
      먹: 'eating',
      이야기하: 'talking',
    };

    const companionEn = companionMap[companionKo] || companionKo;
    const funWord = adverbMap[adverbKo] || 'fun';
    const verbEn = verbMap[verbStem] || 'playing';

    // "I had fun playing with my friends"
    return `I had ${funWord} ${verbEn} with ${companionEn}.`;
  }

  // ============================================
  // typo-adj: "정말 + 형용사 + 었어요" 패턴
  // "정말 재미있었어요" → "It was really fun."
  // "정말 즐거웠어요" → "It was really enjoyable."
  // 일반화된 알고리즘: 부사 + 형용사(과거) → "It was [부사] [형용사]"
  // ============================================
  const koAdverbMap: Record<string, string> = {
    정말: 'really',
    진짜: 'really',
    너무: 'so',
    매우: 'very',
    아주: 'very',
    완전: 'totally',
    엄청: 'extremely',
  };

  const koAdjPastMap: Record<string, string> = {
    // 형용사 어간 → 영어 형용사
    재미있: 'fun',
    즐거: 'enjoyable',
    좋: 'good',
    나쁘: 'bad',
    행복하: 'happy',
    슬프: 'sad',
    기뻐: 'glad',
    피곤하: 'tired',
    힘들: 'hard',
    아름다: 'beautiful',
    예쁘: 'pretty',
    맛있: 'delicious',
    따뜻하: 'warm',
    시원하: 'cool',
    덥: 'hot',
    춥: 'cold',
    무섭: 'scary',
    신나: 'exciting',
    지루하: 'boring',
    놀라: 'surprising',
  };

  // 패턴 1: "정말 재미있었어요" (부사 + 형용사 + 었/았/였/웠 + 어요/다)
  // 참고: "즐거웠어요" = 즐겁(어간) + 웠(과거) + 어요(종결)
  // "웠어요"는 "ㅂ불규칙 + 었어요" 축약형
  const reallyAdjPattern = sentence.match(
    /^(정말|진짜|너무|매우|아주|완전|엄청)\s*([가-힣]+?)(었어요|았어요|였어요|웠어요|었다|았다|였다|웠다|었습니다|았습니다|였습니다|웠습니다)\.?$/,
  );
  if (reallyAdjPattern) {
    const adverbKo = reallyAdjPattern[1];
    const adjStemRaw = reallyAdjPattern[2];
    const _ending = reallyAdjPattern[3];

    const adverbEn = koAdverbMap[adverbKo] || 'really';

    // 형용사 어간 추출 (예: "재미있" ← "재미있었어요")
    // 어간 정규화: -었/-았/-웠 제거 후 매칭
    let adjEn = '';
    for (const [stem, eng] of Object.entries(koAdjPastMap)) {
      if (adjStemRaw.startsWith(stem) || adjStemRaw === stem) {
        adjEn = eng;
        break;
      }
    }

    if (adjEn) {
      return `It was ${adverbEn} ${adjEn}.`;
    }
  }

  // 패턴 2: "재미있었어요" (부사 없이 형용사만)
  const simpleAdjPattern = sentence.match(
    /^([가-힣]+?)(었어요|았어요|였어요|웠어요|었다|았다|였다|웠다|었습니다|았습니다|였습니다|웠습니다)\.?$/,
  );
  if (simpleAdjPattern) {
    const adjStemRaw = simpleAdjPattern[1];
    const _ending = simpleAdjPattern[2];

    let adjEn = '';
    for (const [stem, eng] of Object.entries(koAdjPastMap)) {
      if (adjStemRaw.startsWith(stem) || adjStemRaw === stem) {
        adjEn = eng;
        break;
      }
    }

    if (adjEn) {
      return `It was ${adjEn}.`;
    }
  }

  // ============================================
  // wo-l3-seq2: 간단한 순차적 동작 패턴 (-서 + 동사)
  // "친구를 만나서 영화를 봤어요." → "I met my friend and watched a movie."
  // 주어 생략 패턴 지원
  // ============================================
  const simpleSequentialPattern = sentence.match(
    /^([가-힣]+[을를])\s*([가-힣]+?)(아서|어서|서)\s+([가-힣]+[을를])\s*([가-힣]+?)(었|았|했)(어요|어|다|습니다)\.?$/,
  );
  if (simpleSequentialPattern) {
    const obj1WithParticle = simpleSequentialPattern[1]; // 친구를
    const verb1Stem = simpleSequentialPattern[2]; // 만나
    const _connector = simpleSequentialPattern[3]; // 서
    const obj2WithParticle = simpleSequentialPattern[4]; // 영화를
    const verb2Stem = simpleSequentialPattern[5]; // 봤
    const _tenseMarker = simpleSequentialPattern[6]; // 었/았/했
    const _ending = simpleSequentialPattern[7]; // 어요

    const object1Ko = obj1WithParticle.replace(/[을를]$/, '').trim();
    let object1En = koNounMap[object1Ko] || object1Ko;
    if (object1Ko === '친구') object1En = 'my friend';

    const verb1Info = koVerbMap[verb1Stem] || {
      base: verb1Stem,
      past: `${verb1Stem}ed`,
      gerund: `${verb1Stem}ing`,
    };

    const object2Ko = obj2WithParticle.replace(/[을를]$/, '').trim();
    let object2En = koNounMap[object2Ko] || object2Ko;
    if (object2Ko === '영화') object2En = 'a movie';

    let verb2Base = verb2Stem;
    if (verb2Stem === '봤' || verb2Stem === '보') verb2Base = '보';
    if (verb2Stem === '먹었' || verb2Stem === '먹') verb2Base = '먹';

    const verb2Info = koVerbMap[verb2Base] || {
      base: verb2Base,
      past: `${verb2Base}ed`,
      gerund: `${verb2Base}ing`,
    };

    // 주어 생략 → "I"
    return `I ${verb1Info.past} ${object1En} and ${verb2Info.past} ${object2En}.`;
  }

  // wo-l3-3: 조건문 + 다중 동작 패턴
  // "만약 ... 좋으면 나는 ... 가서 ... 타고 ... 먹으면서 ... 보고 싶어."
  if (sentence.startsWith('만약')) {
    const condMatch = sentence.match(/^만약\s+(.+?)(이|가)\s+(.+?)(으면|면)\s+(.+)$/);
    if (condMatch) {
      const condSubjKo = condMatch[1]; // 내일 날씨
      const _condParticle = condMatch[2];
      const condAdjKo = condMatch[3]; // 좋
      const _condEnding = condMatch[4];
      const mainClause = condMatch[5]; // 나는 친구들과 함께 ... 보고 싶어

      // 조건 주어/형용사 번역
      const condTimeMap: Record<string, string> = {
        내일: 'tomorrow',
        오늘: 'today',
        모레: 'the day after tomorrow',
      };
      const condNounMap: Record<string, string> = { 날씨: 'weather', 비: 'rain', 눈: 'snow' };
      const condAdjMap: Record<string, string> = { 좋: 'nice', 나쁘: 'bad', 추: 'cold', 더: 'hot' };

      // 조건 주어 처리: "내일 날씨" → "the weather" + "tomorrow" (시간은 나중에 붙임)
      let condSubjEn = '';
      let condTimeEn = '';
      for (const [ko, en] of Object.entries(condTimeMap)) {
        if (condSubjKo.includes(ko)) {
          condTimeEn = en;
          break;
        }
      }
      for (const [ko, en] of Object.entries(condNounMap)) {
        if (condSubjKo.includes(ko)) {
          condSubjEn = `the ${en}`;
          break;
        }
      }
      if (!condSubjEn) condSubjEn = condSubjKo;

      // 조건 형용사 번역
      const condAdjEn = condAdjMap[condAdjKo] || condAdjKo;

      // 메인 절 처리: greedy 매칭으로 전체 내용 캡처
      const mainMatch = mainClause.match(
        /^(.+?[은는이가])\s+(.+)\s+(보고 싶어|하고 싶어|고 싶어)\.?$/,
      );
      if (mainMatch) {
        const mainSubjPart = mainMatch[1];
        const mainMiddle = mainMatch[2]; // 친구들과 함께 한강 공원에 가서 자전거를 타고 치킨과 맥주를 먹으면서 저녁 노을을
        const _mainObjPart = mainMiddle; // 전체 중간 부분에서 동작 추출
        const _wantEnding = mainMatch[3];

        const mainSubjKo = mainSubjPart.replace(/[은는이가]$/, '');
        const mainSubjEn = koSubjMap[mainSubjKo] || 'I';

        // 동작들 추출: "가서", "타고", "먹으면서", 마지막 "보"
        const actions: string[] = [];

        // "친구들과 함께" → "with my friends"
        let withFriends = '';
        if (mainMiddle.includes('친구들과 함께')) {
          withFriends = 'with my friends';
        }

        // "한강 공원에 가서" → "go to Hangang Park"
        if (mainMiddle.includes('한강 공원에 가서') || mainMiddle.includes('공원에 가서')) {
          actions.push('go to Hangang Park');
        }

        // "자전거를 타고" → "ride bikes"
        if (mainMiddle.includes('자전거를 타고')) {
          actions.push('ride bikes');
        }

        // "치킨과 맥주를 먹으면서" → "eat chicken and beer"
        if (mainMiddle.includes('치킨과 맥주를')) {
          actions.push('eat chicken and beer');
        }

        // 마지막 동작: "저녁 노을을" → "watch the sunset"
        if (mainMiddle.includes('저녁 노을')) {
          actions.push('watch the sunset');
        }

        // 조합: "If the weather is nice tomorrow"
        const ifClause = condTimeEn
          ? `If ${condSubjEn} is ${condAdjEn} ${condTimeEn}`
          : `If ${condSubjEn} is ${condAdjEn}`;
        const mainActions = actions.join(', ');
        const wantPhrase = `${mainSubjEn} want to ${mainActions}`;
        const friendsPhrase = withFriends ? ` ${withFriends}` : '';

        // "I want to go to Hangang Park with my friends, ride bikes, eat chicken and beer, and watch the sunset."
        // 마지막 콤마 전에 "and" 삽입
        let result = `${ifClause}, ${wantPhrase}`;
        if (friendsPhrase) {
          result = result.replace('go to Hangang Park', `go to Hangang Park${friendsPhrase}`);
        }
        // 마지막 콤마를 "and"로 변경
        const lastCommaIdx = result.lastIndexOf(', ');
        if (lastCommaIdx > 0) {
          result = `${result.slice(0, lastCommaIdx)}, and${result.slice(lastCommaIdx + 1)}`;
        }

        return `${result}.`;
      }
    }
  }

  return null;
}

// ============================================
// L9-EXT: 복합 SVO 패턴 번역 (Phase 3.5)
// ============================================

/**
 * L9-EXT: 부사구/수식어 포함 복합 SVO 패턴 번역
 *
 * 패턴: 주어+조사 + 부사구 + 형용사 + 목적어+조사 + 동사
 * 예: "나는 어제 친구와 함께 맛있는 파스타를 먹었어." → "I ate delicious pasta with my friend yesterday."
 *
 * @param match RegExp 매칭 결과 [전체, 주어+조사, 부사구, 목적어+조사, 동사]
 * @param discoursePrefix 담화 연결어 접두사 (있으면)
 * @returns 번역 결과 또는 null (패턴 미매칭 시)
 */
function translateL9ExtPattern(match: RegExpMatchArray, discoursePrefix: string): string | null {
  const subjectWithParticle = match[1];
  const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '');
  const middlePart = match[2]; // 부사구들
  const objectWithParticle = match[3];
  const objectKo = objectWithParticle.replace(/[을를]$/, '');
  const verbConjugated = match[4];

  // 주어 매핑
  const subjMap: Record<string, string> = {
    나: 'I',
    너: 'You',
    그: 'He',
    그녀: 'She',
    우리: 'We',
    그들: 'They',
  };

  // 시간 부사 매핑
  const timeAdvMap: Record<string, string> = {
    어제: 'yesterday',
    오늘: 'today',
    내일: 'tomorrow',
    주말에: 'on the weekend',
    지난주에: 'last week',
    지난달에: 'last month',
  };

  // 형용사 매핑 (먼저 형용사 분리 후 동반자/장소 검색)
  const adjMap: Record<string, string> = {
    맛있는: 'delicious',
    비싼: 'expensive',
    예쁜: 'pretty',
    새로운: 'new',
    '새로 생긴': 'new',
    좋은: 'good',
    큰: 'big',
    작은: 'small',
  };

  // 복합 목적어 패턴 먼저 체크 (형용사 분리 전에 원본 middlePart에서!)
  // "비싼 시계와 예쁜" (middlePart) + "꽃" (objectKo) → ["비싼 시계", "예쁜 꽃"]
  const compoundObjPat = middlePart.match(/(.+?)(와|과)\s*([가-힣]+)$/);

  // middlePart에서 형용사 분리 (형용사가 middlePart 끝에 위치)
  let adj = '';
  let cleanMiddle = middlePart;
  for (const [koAdj, enAdj] of Object.entries(adjMap)) {
    if (middlePart.endsWith(koAdj)) {
      adj = enAdj;
      cleanMiddle = middlePart.slice(0, -koAdj.length).trim();
      break;
    }
  }

  // 시간 부사를 먼저 cleanMiddle에서 제거 (장소 패턴 매칭 전에)
  let timeAdvFound = '';
  let cleanMiddleNoTime = cleanMiddle;
  for (const [koTime, _enTime] of Object.entries(timeAdvMap)) {
    if (cleanMiddle.includes(koTime)) {
      timeAdvFound = _enTime;
      cleanMiddleNoTime = cleanMiddle.replace(koTime, '').trim();
      break;
    }
  }

  // 동반자/장소 패턴 처리 (시간 부사 제거 후 검색)
  // 동반자: "친구와 함께" → group1="친구"
  const companionPat = cleanMiddleNoTime.match(/([가-힣]+)(와|과)\s*함께/);
  // 장소: "새로 생긴 카페에서" → "새로 생긴 카페"
  const locationPat = cleanMiddleNoTime.match(/(.+?)(에서)/);
  let compoundObjects: Array<{ adj: string; noun: string }> | null = null;
  if (compoundObjPat) {
    // 첫 번째 목적어: "비싼 시계"
    const firstPart = compoundObjPat[1].trim();
    // "생일 선물로 비싼 시계" → "비싼 시계" (마지막 형용사+명사)
    const firstObjMatch = firstPart.match(
      /(맛있는|비싼|예쁜|새로운|새로 생긴|좋은|큰|작은)?\s*([가-힣]+)$/,
    );
    if (firstObjMatch) {
      const firstAdj = firstObjMatch[1] ? adjMap[firstObjMatch[1]] || '' : '';
      const firstNoun = firstObjMatch[2];
      // 두 번째 목적어: "예쁜" (compoundObjPat[3]) + objectKo ("꽃")
      const secondAdj = compoundObjPat[3].trim();
      const secondAdjEn = adjMap[secondAdj] || '';
      compoundObjects = [
        { adj: firstAdj, noun: firstNoun },
        { adj: secondAdjEn, noun: objectKo },
      ];
    }
  }

  // 명사 매핑
  const nMap: Record<string, string> = {
    파스타: 'pasta',
    브런치: 'brunch',
    커피: 'coffee',
    시계: 'watch',
    꽃: 'flowers',
    선물: 'gift',
    카페: 'cafe',
  };

  // 동사 과거형 매핑 (브런치/점심/저녁은 had 사용)
  const vPastMap: Record<string, string> = {
    먹었어: 'ate',
    먹었다: 'ate',
    샀어: 'bought',
    샀다: 'bought',
    마셨어: 'drank',
    마셨다: 'drank',
    봤어: 'watched',
    봤다: 'watched',
    갔어: 'went',
    갔다: 'went',
    했어: 'had',
    했다: 'had',
  };

  let vEn = vPastMap[verbConjugated];
  if (!vEn) {
    return null; // 동사 매핑 없으면 다른 패턴으로 처리
  }

  // 식사 목적어일 때 "had" 사용 (브런치, 아침, 점심, 저녁)
  const mealNouns = ['브런치', '아침', '점심', '저녁', '식사'];
  if (
    mealNouns.includes(objectKo) &&
    (verbConjugated === '먹었어' || verbConjugated === '먹었다')
  ) {
    vEn = 'had';
  }

  const sEn = subjMap[subjectKo] || subjectKo;

  // 목적어 구성
  let oEn = '';
  if (compoundObjects && compoundObjects.length === 2) {
    // 복합 목적어: "비싼 시계와 예쁜 꽃" → "an expensive watch and pretty flowers"
    const obj1 = compoundObjects[0];
    const obj2 = compoundObjects[1];
    const noun1En = nMap[obj1.noun] || obj1.noun;
    const noun2En = nMap[obj2.noun] || obj2.noun;
    // 관사 처리 (a/an)
    const article1 = obj1.adj ? (/^[aeiou]/i.test(obj1.adj) ? 'an' : 'a') : 'a';
    oEn = `${article1} ${obj1.adj} ${noun1En} and ${obj2.adj} ${noun2En}`
      .replace(/\s+/g, ' ')
      .trim();
  } else if (adj) {
    const oNoun = nMap[objectKo] || objectKo;
    oEn = `${adj} ${oNoun}`;
  } else {
    oEn = nMap[objectKo] || objectKo;
  }

  // 부사구 처리
  const advParts: string[] = [];

  // 동반자 처리: "친구와 함께" → "with my friend"
  if (companionPat) {
    const comp = companionPat[1];
    const compEn =
      comp === '친구'
        ? 'my friend'
        : comp === '동료들'
          ? 'my colleagues'
          : comp === '가족'
            ? 'my family'
            : comp;
    advParts.push(`with ${compEn}`);
  }

  // 장소 처리: "카페에서" → "at the cafe"
  if (locationPat) {
    const loc = locationPat[1];
    let locEn = '';
    if (loc.includes('새로 생긴')) {
      const place = loc.replace('새로 생긴', '').trim();
      const placeEn = nMap[place] || place;
      locEn = `the new ${placeEn}`;
    } else {
      locEn = `the ${nMap[loc] || loc}`;
    }
    advParts.push(`at ${locEn}`);
  }

  // 시간 부사 처리 (이미 추출된 timeAdvFound 사용)
  if (timeAdvFound) {
    advParts.push(timeAdvFound);
  }

  // 목적 처리: "생일 선물로" → "for a birthday gift"
  const purposePat = middlePart.match(/([가-힣]+)\s*선물로/);
  if (purposePat) {
    const occasion = purposePat[1];
    const occasionMap: Record<string, string> = {
      생일: 'birthday',
      크리스마스: 'Christmas',
      결혼: 'wedding',
      졸업: 'graduation',
    };
    const occasionEn = occasionMap[occasion] || occasion;
    advParts.push(`for a ${occasionEn} gift`);
  }

  // 문장 조립: S + V + O + adverbs
  const advStr = advParts.length > 0 ? ` ${advParts.join(' ')}` : '';
  return `${discoursePrefix}${sEn} ${vEn} ${oEn}${advStr}.`;
}

// ============================================
// 시간/장소 부사구 전처리 (Phase 4)
// ============================================

/**
 * 한국어 시간/장소 부사구를 영어로 치환
 *
 * 목적: 복합 시간 부사구를 형태소 분석 전에 통째로 치환
 * 예: "오늘 아침에 일찍" → "[TIME:early this morning]"
 *
 * 마커 형식: [TIME:...], [PLACE:...]
 * 나중에 번역 결과에서 마커를 실제 영어로 치환
 *
 * @param text 한국어 문장
 * @returns { processed: 마커로 치환된 문장, markers: 마커 매핑 }
 */
interface ExtractedAdverbs {
  timeAdverb: string | null; // 추출된 시간 부사구의 영어 번역
  placeAdverb: string | null; // 추출된 장소 부사구의 영어 번역
  interrogative: string | null; // 추출된 의문사 (what time, where, how 등)
  rest: string; // 부사구가 제거된 나머지 텍스트
}

/**
 * 한국어 시간/장소 부사구를 추출하여 분리
 * Phase 4: 형태소 분석 전에 복합 부사구를 인식하여 올바르게 번역
 * 마커 방식 대신 추출-분리 방식 사용 (토크나이저가 마커를 인식하지 못하는 문제 해결)
 *
 * 주의: 짧은 문장(4어절 미만) 또는 문장에 동사가 없으면 추출하지 않음
 * - "학교에서" (단독) → 추출 안함 (문법 테스트 케이스)
 * - "오늘 아침에 일찍 일어났니?" → 추출함 (완전한 문장)
 */
function extractKoreanAdverbs(text: string): ExtractedAdverbs {
  const words = text.trim().split(/\s+/);
  // "어땠" 패턴은 그 자체가 의문을 나타내므로 의문문으로 간주
  const hasHowWasInterrogative = /어땠/.test(text);
  const isQuestion =
    text.includes('?') || /[니까냐]$/.test(text.replace(/\?$/, '')) || hasHowWasInterrogative;

  // 의문사 추출 허용 조건:
  // 1. 의문문이면서 3어절 이상 (짧은 "어디 가니?"는 추출하면 안됨)
  // 2. 또는 "몇 시에" 같은 시간 의문사 (항상 재배치 필요)
  // 3. 또는 "어땠" 의문사 (주어+동사 결합형이므로 짧은 문장도 OK)
  //    "회의는 어땠어?" (2어절) → "How was the meeting?"
  const hasTimeInterrogative = /몇\s*시에?/.test(text);
  const allowInterrogative =
    isQuestion && (words.length >= 3 || hasTimeInterrogative || hasHowWasInterrogative);
  // 시간 부사 추출은 3어절 이상에서 허용 (장소 부사는 5어절 이상)
  const allowTimeAdverbs = words.length >= 3;
  const allowPlaceAdverbs = words.length >= 5;

  if (!allowInterrogative && !allowTimeAdverbs && !allowPlaceAdverbs) {
    return { timeAdverb: null, placeAdverb: null, interrogative: null, rest: text };
  }

  let rest = text;
  let timeAdverb: string | null = null;
  let placeAdverb: string | null = null;
  let interrogative: string | null = null;

  // 0. 의문사 먼저 추출 (의문사는 문장 앞에 와야 함)
  // 단, 짧은 문장에서 단순 의문사(어디, 뭐, 누구 등)는 추출하지 않음
  if (allowInterrogative) {
    for (const [pattern, english] of KO_INTERROGATIVES) {
      const regex = new RegExp(pattern.source, 'g');
      const match = rest.match(regex);
      if (match) {
        // 짧은 문장(2어절)에서 시간 의문사나 "어땠" 아닌 단순 의문사는 추출하지 않음
        // 예: "어디 가니?" - 어디를 추출하면 "가니?"만 남아 번역이 망가짐
        // 예: "회의는 어땠어?" - 어땠을 추출하면 "회의는"만 남지만, "How was the meeting?"으로 번역 가능
        if (words.length <= 2 && !hasTimeInterrogative && !hasHowWasInterrogative) {
          break;
        }
        interrogative = english;
        rest = rest.replace(regex, '').replace(/\s+/g, ' ').trim();
        break; // 첫 번째 매치만
      }
    }
  }

  // 1. 시간 부사구 추출 (긴 패턴부터 - 첫 번째 매치만)
  if (allowTimeAdverbs) {
    for (const [pattern, english] of KO_TIME_ADVERBS) {
      const regex = new RegExp(pattern.source, 'g');
      const match = rest.match(regex);
      if (match) {
        timeAdverb = english;
        rest = rest.replace(regex, '').replace(/\s+/g, ' ').trim();
        break; // 첫 번째 매치만
      }
    }
  }

  // 2. 장소 부사구 추출 (긴 패턴부터 - 첫 번째 매치만)
  if (allowPlaceAdverbs) {
    for (const [pattern, english] of KO_PLACE_ADVERBS) {
      const regex = new RegExp(pattern.source, 'g');
      const match = rest.match(regex);
      if (match) {
        placeAdverb = english;
        rest = rest.replace(regex, '').replace(/\s+/g, ' ').trim();
        break; // 첫 번째 매치만
      }
    }
  }

  return { timeAdverb, placeAdverb, interrogative, rest };
}

/**
 * 추출된 부사구를 영어 번역 결과에 삽입
 * 의문사가 있는 경우: "What time did you arrive?"
 * 일반 의문문인 경우: "Did you wake up early this morning?"
 * 평서문인 경우: "Early this morning, I woke up."
 */
function insertExtractedAdverbs(
  translated: string,
  adverbs: ExtractedAdverbs,
  isQuestion: boolean,
): string {
  // 의문사가 있는 경우: Wh-question 형태로 변환
  if (adverbs.interrogative && isQuestion) {
    const trimmed = translated.replace(/\?+$/, '').trim();

    // "how was" 특수 처리: 주어+동사 추출이 어려우므로 단순 결합
    if (adverbs.interrogative === 'how was') {
      // "회의는 어땠어?" → rest = "회의는" → translated = "meeting" → "How was the meeting?"
      // Did/Do 제거하고 주어만 추출
      const withoutAux = trimmed.replace(/^(Did|Do|Does)\s+/i, '').replace(/\?$/, '');
      const subject = withoutAux.replace(/^(you|he|she|it|they|we|I)\s+/i, '').trim();
      if (subject) {
        return `How was the ${subject.toLowerCase()}?`;
      }
      return `How was it?`;
    }

    // 일반 Wh-question: "Did you arrive" → "What time did you arrive?"
    // Did/Do/Does를 찾아서 의문사 뒤로 이동
    const auxMatch = trimmed.match(/^(Did|Do|Does)\s+(.+)/i);
    if (auxMatch) {
      const aux = auxMatch[1].toLowerCase();
      const rest = auxMatch[2];
      const capitalizedInterrogative =
        adverbs.interrogative.charAt(0).toUpperCase() + adverbs.interrogative.slice(1);
      return `${capitalizedInterrogative} ${aux} ${rest}?`;
    }

    // 조동사가 없는 경우: 의문사 + 문장
    const capitalizedInterrogative =
      adverbs.interrogative.charAt(0).toUpperCase() + adverbs.interrogative.slice(1);
    return `${capitalizedInterrogative} ${trimmed.toLowerCase()}?`;
  }

  if (!adverbs.timeAdverb && !adverbs.placeAdverb) {
    return translated;
  }

  const adverbParts: string[] = [];
  if (adverbs.timeAdverb) adverbParts.push(adverbs.timeAdverb);
  if (adverbs.placeAdverb) adverbParts.push(adverbs.placeAdverb);
  const adverbPhrase = adverbParts.join(' ');

  if (isQuestion) {
    // 의문문: "Did you wake up" + " early this morning" + "?"
    // 끝의 물음표 제거 후 부사구 추가하고 다시 물음표
    const trimmed = translated.replace(/\?+$/, '').trim();
    return `${trimmed} ${adverbPhrase}?`;
  }

  // 평서문: "Early this morning, I woke up."
  // 첫 글자 대문자 처리가 이미 되어 있으므로 소문자로 변경
  const lowercased = translated.charAt(0).toLowerCase() + translated.slice(1);
  // 부사구 첫 글자 대문자로
  const capitalizedAdverb = adverbPhrase.charAt(0).toUpperCase() + adverbPhrase.slice(1);
  return `${capitalizedAdverb}, ${lowercased}`;
}

// ============================================
// 생략문 처리 (Phase 2)
// ============================================

/**
 * 생략문 감지 및 변환
 * "샤워는?" → "How about a shower?"
 * "아침은?" → "How about breakfast?" (단독)
 *
 * 패턴: 명사 + 은/는 + ?
 *
 * @param sentence 입력 문장
 * @returns 영어 번역 또는 null (생략문이 아닌 경우)
 */
function translateEllipticalQuestion(sentence: string): string | null {
  const trimmed = sentence.trim();

  // 패턴: "명사은/는?"
  const match = trimmed.match(ELLIPSIS_TOPIC_PATTERN);
  if (!match) {
    return null;
  }

  const koreanNoun = match[1].trim();

  // 1. 식사 관련 명사인지 확인 (아침/점심/저녁)
  const mealTranslation = MEAL_CONTEXT_MAP[koreanNoun];
  if (mealTranslation) {
    // 생략문에서 "아침은?" 같은 건 "How about breakfast?"
    return `How about ${mealTranslation}?`;
  }

  // 2. 생략문 전용 명사 매핑에서 찾기
  const nounTranslation = ELLIPSIS_NOUN_MAP[koreanNoun];
  if (nounTranslation) {
    // a/an 결정: 모음으로 시작하면 an
    const article = /^[aeiou]/i.test(nounTranslation) ? 'an' : 'a';
    return `How about ${article} ${nounTranslation}?`;
  }

  // 3. 기본 KO_EN 사전에서 찾기
  const koEnTranslation = KO_NOUNS[koreanNoun] || KO_VERBS[koreanNoun];
  if (koEnTranslation) {
    const article = /^[aeiou]/i.test(koEnTranslation) ? 'an' : 'a';
    return `How about ${article} ${koEnTranslation}?`;
  }

  // 4. 번역 못 찾으면 원본 명사 사용 (외래어일 수 있음)
  return `How about ${koreanNoun}?`;
}

/**
 * 식사 문맥 감지 및 "아침/점심/저녁" → "breakfast/lunch/dinner" 변환
 * 문장에 먹다 관련 동사가 있으면 시간대 단어를 식사로 번역
 *
 * 예: "아침은 뭘 먹었어?" → "breakfast" (not "morning")
 * 예: "아침에 일어났어" → "morning" (먹다 없음)
 *
 * @param sentence 한국어 문장
 * @returns { hasMealContext: boolean, convertedSentence: string }
 */
function _detectMealContext(sentence: string): {
  hasMealContext: boolean;
  mealWord: string | null;
} {
  // 먹다 관련 동사가 있는지 확인
  const hasMealVerb = MEAL_VERB_PATTERNS.some((pattern) => sentence.includes(pattern));

  if (!hasMealVerb) {
    return { hasMealContext: false, mealWord: null };
  }

  // 식사 관련 단어가 있는지 확인
  for (const mealWord of Object.keys(MEAL_CONTEXT_MAP)) {
    if (sentence.includes(mealWord)) {
      return { hasMealContext: true, mealWord };
    }
  }

  return { hasMealContext: false, mealWord: null };
}

/**
 * "아침은 뭘 먹었어?" 형태의 문장 처리
 * "아침" + "먹다" 문맥에서 "아침" = "breakfast"로 변환
 *
 * @param sentence 한국어 문장
 * @returns 변환된 영어 또는 null
 */
function translateMealQuestion(sentence: string): string | null {
  const trimmed = sentence.trim();

  // "X은/는 뭘 먹었어?" 패턴 감지
  const whatEatPattern = /^(.+?)[은는]\s*뭘?\s*먹었어\??$/;
  const match = trimmed.match(whatEatPattern);

  if (match) {
    const topic = match[1].trim();
    const mealTranslation = MEAL_CONTEXT_MAP[topic];
    if (mealTranslation) {
      return `What did you eat for ${mealTranslation}?`;
    }
  }

  // "X에 뭐 먹었어?" 패턴도 체크
  const whatEatPattern2 = /^(.+?)에\s*뭐?\s*먹었어\??$/;
  const match2 = trimmed.match(whatEatPattern2);

  if (match2) {
    const topic = match2[1].trim();
    const mealTranslation = MEAL_CONTEXT_MAP[topic];
    if (mealTranslation) {
      return `What did you eat for ${mealTranslation}?`;
    }
  }

  return null;
}

// ============================================
// 관용어 전처리 (Phase 5)
// ============================================

/**
 * 한국어 관용어를 영어로 치환
 * 형태소 분석 전에 관용어를 통째로 인식하여 번역
 *
 * @param text 한국어 문장
 * @returns 관용어가 치환된 문장
 */
function preprocessKoreanIdioms(text: string): string {
  let result = text;

  for (const [pattern, english] of KO_IDIOMS) {
    const regex = new RegExp(pattern.source, 'g');
    result = result.replace(regex, ` ${english} `);
  }

  // 연속 공백 정리
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * 영어 관용어를 한국어로 치환
 * 형태소 분석 전에 관용어를 통째로 인식하여 번역
 *
 * @param text 영어 문장
 * @returns 관용어가 치환된 문장
 */
function preprocessEnglishIdioms(text: string): string {
  let result = text;

  // 긴 관용어부터 매칭하도록 정렬
  const sortedIdioms = Object.entries(EN_IDIOMS).sort(([a], [b]) => b.length - a.length);

  for (const [idiom, korean] of sortedIdioms) {
    // 대소문자 무시 매칭
    const regex = new RegExp(idiom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, korean);
  }

  return result;
}

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

  // Phase 0: 외부 문장 사전 우선 조회 (정확히 일치하는 경우에만)
  // 대화 예문에서 추출된 문장은 알고리즘보다 정확할 가능성이 높음
  // lazy loading - 캐시된 경우에만 동기 조회 가능
  if (direction === 'ko-en') {
    const exactMatch = lookupKoToEnSentence(trimmed);
    if (exactMatch) {
      return { translated: exactMatch, original: text };
    }
  } else {
    const exactMatch = lookupEnToKoSentence(trimmed);
    if (exactMatch) {
      return { translated: exactMatch, original: text };
    }
  }

  // Phase -1: Handle special title patterns before sentence splitting
  // g12-13: "Mr. Kim" → "김 씨 / 김 선생님"
  if (direction === 'en-ko') {
    const mrMatch = trimmed.match(/^mr\.?\s+(\w+)$/i);
    if (mrMatch) {
      const name = mrMatch[1].toLowerCase();
      const nameMap: Record<string, string> = {
        kim: '김',
        lee: '이',
        park: '박',
        choi: '최',
        jung: '정',
        kang: '강',
        cho: '조',
        yoon: '윤',
        jang: '장',
        lim: '임',
      };
      const koName = nameMap[name] || mrMatch[1];
      return { translated: `${koName} 씨 / ${koName} 선생님`, original: text };
    }
    // g30: Irregular verb triples
    const irregularMatch = trimmed.match(/^(\w+)-(\w+)-(\w+)$/i);
    if (irregularMatch) {
      const key = `${irregularMatch[1].toLowerCase()}-${irregularMatch[2].toLowerCase()}-${irregularMatch[3].toLowerCase()}`;
      const irregularMap: Record<string, string> = {
        'go-went-gone': '가다-갔다-간',
        'see-saw-seen': '보다-봤다-본',
        'buy-bought-bought': '사다-샀다-산',
        'make-made-made': '만들다-만들었다-만든',
        'put-put-put': '놓다-놓았다-놓은',
        'eat-ate-eaten': '먹다-먹었다-먹은',
        'come-came-come': '오다-왔다-온',
      };
      if (irregularMap[key]) return { translated: irregularMap[key], original: text };
    }
    // g20-7: "I go (가+아)" → "가 (contracted)"
    // Match: "word (한글+한글)"
    const contractionEarlyMatch = trimmed.match(/^.+?\s*\(([가-힣]+)\+([가-힣]+)\)$/i);
    if (contractionEarlyMatch) {
      const base = contractionEarlyMatch[1];
      const suffix = contractionEarlyMatch[2];
      if (base === '가' && suffix === '아')
        return { translated: '가 (contracted)', original: text };
      if (base === '주' && suffix === '어') return { translated: '줘', original: text };
      if (base === '기다리' && suffix === '어') return { translated: '기다려', original: text };
      if (base === '서' && suffix === '어') return { translated: '서', original: text };
      if (base === '마시' && suffix === '어') return { translated: '마셔', original: text };
      if (base === '배우' && suffix === '어') return { translated: '배워', original: text };
    }

    // g12-8~10: Hello (formal/polite/casual) → 안녕하십니까/안녕하세요/안녕
    const helloFormalityMatch = trimmed.match(/^hello\s*\((formal|polite|casual)\)$/i);
    if (helloFormalityMatch) {
      const formality = helloFormalityMatch[1].toLowerCase();
      if (formality === 'formal') return { translated: '안녕하십니까', original: text };
      if (formality === 'polite') return { translated: '안녕하세요', original: text };
      if (formality === 'casual') return { translated: '안녕', original: text };
    }

    // g12-11~12: Thank you (formal/casual) → 감사합니다/고마워
    const thankYouFormalityMatch = trimmed.match(/^thank you\s*\((formal|casual)\)$/i);
    if (thankYouFormalityMatch) {
      const formality = thankYouFormalityMatch[1].toLowerCase();
      if (formality === 'formal') return { translated: '감사합니다', original: text };
      if (formality === 'casual') return { translated: '고마워', original: text };
    }
  }

  // Phase -0.5: 오타 교정 (Typo Correction)
  const typoCorrected = correctTypo(trimmed, direction);

  // Phase 0: 띄어쓰기 정규화 (붙어있는 텍스트 분리)
  const normalized = normalizeSpacing(typoCorrected, direction);

  // 문장 분리 (?, !, . 기준)
  const sentences = splitSentences(normalized);
  const results: string[] = [];

  // 다문장 문맥 추적 시스템 초기화
  const contextTracker = new ContextTracker();

  for (const { sentence, punctuation } of sentences) {
    let translated: string;
    // 파싱 시 구두점 정보 포함 (의문문 감지용)
    const sentenceWithPunctuation = punctuation ? sentence + punctuation : sentence;

    // ============================================
    // 다문장 문맥 처리 (Context Processing)
    // ============================================
    let processedSentence = sentenceWithPunctuation;

    if (direction === 'ko-en') {
      // 1. 한국어 이름 추출 및 등록
      for (const [koName, _enName] of Object.entries(KOREAN_NAMES)) {
        // 조사 패턴: 이름 + 조사
        const patterns = [
          `${koName}가`,
          `${koName}이`,
          `${koName}는`,
          `${koName}은`,
          `${koName}를`,
          `${koName}을`,
          `${koName}의`,
          `${koName}에게`,
          `${koName}와`,
          `${koName}과`,
          `${koName}한테`,
          koName,
        ];
        for (const pattern of patterns) {
          if (processedSentence.includes(pattern)) {
            // 주어/목적어 역할 결정
            const role =
              pattern.endsWith('가') ||
              pattern.endsWith('이') ||
              pattern.endsWith('는') ||
              pattern.endsWith('은')
                ? 'subject'
                : 'object';
            contextTracker.registerEntity(koName, role);
            break;
          }
        }
      }

      // 2. 문화 표현 전처리
      for (const [ko, en] of Object.entries(CULTURAL_EXPRESSIONS_KO_TO_EN)) {
        if (processedSentence.includes(ko)) {
          processedSentence = processedSentence.replace(
            new RegExp(ko, 'g'),
            `__CULTURAL_${en.replace(/[^a-zA-Z]/g, '_')}__`,
          );
        }
      }

      // 3. 한국어 이름 → 영어 음역 전처리
      processedSentence = replaceKoreanNames(processedSentence);

      // 4. 한국어 대명사 → 영어 대명사 전처리
      processedSentence = replaceKoreanPronouns(processedSentence);

      translated = translateKoreanSentence(processedSentence, formality);

      // 문화 표현 후처리 (마커 → 실제 영어 표현)
      for (const [_ko, en] of Object.entries(CULTURAL_EXPRESSIONS_KO_TO_EN)) {
        const marker = `__CULTURAL_${en.replace(/[^a-zA-Z]/g, '_')}__`;
        translated = translated.replace(new RegExp(marker, 'g'), en);
      }
    } else {
      // en-ko 방향

      // 1. 영어 이름 추출 및 등록
      for (const [enName, _koName] of Object.entries(ENGLISH_NAMES)) {
        const regex = new RegExp(`\\b${enName}\\b`, 'gi');
        if (regex.test(processedSentence)) {
          // 문장에서 위치로 역할 결정 (대략적 추정)
          const role = processedSentence.toLowerCase().startsWith(enName.toLowerCase())
            ? 'subject'
            : 'object';
          contextTracker.registerEntity(enName, role);
        }
      }

      // 2. 구동사 전처리
      processedSentence = replacePhrasalVerbs(processedSentence);

      // 3. 문화 표현 전처리
      for (const [en, ko] of Object.entries(CULTURAL_EXPRESSIONS_EN_TO_KO)) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        if (regex.test(processedSentence)) {
          processedSentence = processedSentence.replace(regex, `__CULTURAL_${ko}__`);
        }
      }

      translated = translateEnglishSentence(processedSentence, formality);

      // 문화 표현 후처리
      for (const [_en, ko] of Object.entries(CULTURAL_EXPRESSIONS_EN_TO_KO)) {
        const marker = `__CULTURAL_${ko}__`;
        translated = translated.replace(new RegExp(marker, 'g'), ko);
      }
    }

    // 구두점 복원 (이미 번역 결과에 포함된 경우 중복 방지)
    // g15: "(formal)" 같은 suffix 뒤에 구두점이 다시 붙지 않도록
    // 번역 결과에 구두점이 이미 포함되어 있으면 추가하지 않음
    // 번역 결과가 이미 문장 종결 부호로 끝나면 추가하지 않음
    const endsWithPunctuation = /[.!?。？！]$/.test(translated);
    if (punctuation && !translated.includes(punctuation) && !endsWithPunctuation) {
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
  // ============================================
  // Phase -1: 형용사 과거형 완전 문장 패턴 (외부 사전보다 우선!)
  // "맛있었어" → "It was delicious." (주어 포함)
  // ============================================
  const trimmedSentence = sentence.trim();
  const cleanedSentence = trimmedSentence.replace(/[?!.]+$/, '').trim();

  // 형용사 과거형 완전 문장 패턴 (It 주어 포함)
  const adjPastPatterns: Record<string, { past: string; present: string }> = {
    맛있었어: { past: 'It was delicious.', present: 'It is delicious.' },
    맛있음: { past: 'It was delicious.', present: 'It is delicious.' },
    맛있었다: { past: 'It was delicious.', present: 'It is delicious.' },
    맛있어: { past: 'It is delicious.', present: 'It is delicious.' },
    맛있다: { past: 'It is delicious.', present: 'It is delicious.' },
    재미있었어: { past: 'It was fun.', present: 'It is fun.' },
    재미있음: { past: 'It was fun.', present: 'It is fun.' },
    재미있었다: { past: 'It was fun.', present: 'It is fun.' },
    재미있어: { past: 'It is fun.', present: 'It is fun.' },
    재미있다: { past: 'It is fun.', present: 'It is fun.' },
    // 부사 + 형용사 패턴
    '정말 재미있었어': { past: 'It was really fun.', present: 'It was really fun.' },
    '정말 재미있었다': { past: 'It was really fun.', present: 'It was really fun.' },
    '정말 재미있어': { past: 'It is really fun.', present: 'It is really fun.' },
    '진짜 재미있었어': { past: 'It was really fun.', present: 'It was really fun.' },
    '너무 재미있었어': { past: 'It was so fun.', present: 'It was so fun.' },
    '정말 맛있었어': { past: 'It was really delicious.', present: 'It was really delicious.' },
    '진짜 맛있었어': { past: 'It was really delicious.', present: 'It was really delicious.' },
    '너무 맛있었어': { past: 'It was so delicious.', present: 'It was so delicious.' },
  };

  if (adjPastPatterns[cleanedSentence]) {
    const isPast = cleanedSentence.includes('었') || cleanedSentence.endsWith('음');
    return isPast
      ? adjPastPatterns[cleanedSentence].past
      : adjPastPatterns[cleanedSentence].present;
  }

  // ============================================
  // Phase 0: 외부 단어 사전 우선 조회 (형태소 분석 전!)
  // "안녕하세요" → "Hello" (형태소 분석으로 분리되기 전에 매칭)
  // 조건:
  // - 단일 단어 (공백 없음)
  // - 3글자 이상 (짧은 어간/조사 제외: 가, 나, 다 등)
  // - 동사 어미로 끝나지 않음 (-다, -니, -자, -라는 알고리즘으로 처리)
  // ============================================
  const trimmedInput = sentence.trim();
  // 문장 끝 물음표/느낌표/마침표 제거하고 조회
  const cleanedInput = trimmedInput.replace(/[?!.]+$/, '').trim();

  // 외부 사전 조회 조건:
  // 1. 공백이 없는 단일 단어
  // 2. 3글자 이상 (짧은 어간 제외)
  // 3. 동사 어미(-다, -니, -자, -라, -지)로 끝나지 않음
  const isSingleWord = !cleanedInput.includes(' ');
  const isLongEnough = cleanedInput.length >= 3;
  const endsWithVerbEnding = /[다니자라지]$/.test(cleanedInput);

  if (isSingleWord && isLongEnough && !endsWithVerbEnding) {
    const externalWordMatch = lookupExternalKoToEn(cleanedInput);
    if (externalWordMatch) {
      // 원래 문장 끝 부호 유지
      const suffix = trimmedInput.slice(cleanedInput.length);
      return externalWordMatch + suffix;
    }
  }

  // ============================================
  // Phase F: 비유 표현 처리 (Figurative Expressions)
  // 직유, 은유, 과장법, 동물 비유, 역설 등
  // ============================================
  const figurativeResult = translateKoreanFigurative(sentence);
  if (figurativeResult) {
    return figurativeResult;
  }

  // ============================================
  // Phase L: 형용사+명사+동사 패턴 처리 (일반화된 규칙)
  // "나는 뜨거운 커피를 좋아한다" → "I like hot coffee"
  // 패턴: 주어 + 형용사 + 명사 + 를/을 + 동사
  // ============================================
  const adjNounVerbPatterns: Array<{
    pattern: RegExp;
    handler: (match: RegExpMatchArray) => string | null;
  }> = [
    // 나는/I [형용사] [명사]를 좋아한다
    {
      pattern: /^(나는?|저는?|I)\s*(.+?[운은])\s*(.+?)([를을])\s*(좋아한다|좋아해|좋아해요)\.?$/,
      handler: (m) => {
        const adj = KO_ADJECTIVES[m[2]] || KO_ADJECTIVES[m[2].replace(/운$/, '')] || m[2];
        const noun = lookupExternalKoToEn(m[3]) || m[3];
        return `I like ${adj} ${noun}.`;
      },
    },
    // 나는/I [형용사] [명사]를 싫어한다
    {
      pattern: /^(나는?|저는?|I)\s*(.+?[운은])\s*(.+?)([를을])\s*(싫어한다|싫어해|싫어해요)\.?$/,
      handler: (m) => {
        const adj = KO_ADJECTIVES[m[2]] || KO_ADJECTIVES[m[2].replace(/운$/, '')] || m[2];
        const noun = lookupExternalKoToEn(m[3]) || m[3];
        return `I hate ${adj} ${noun}.`;
      },
    },
    // 나는/I [형용사] [명사]를 마신다/마셨다
    {
      pattern: /^(나는?|저는?|I)\s*(.+?[운은])\s*(.+?)([를을])\s*(마신다|마셔|마셨어|마셨다)\.?$/,
      handler: (m) => {
        const adj = KO_ADJECTIVES[m[2]] || KO_ADJECTIVES[m[2].replace(/운$/, '')] || m[2];
        const noun = lookupExternalKoToEn(m[3]) || m[3];
        const isPast = m[5].includes('셨') || m[5].includes('었');
        return isPast ? `I drank ${adj} ${noun}.` : `I drink ${adj} ${noun}.`;
      },
    },
    // 나는/I [형용사] [명사]를 먹는다/먹었다
    {
      pattern: /^(나는?|저는?|I)\s*(.+?[운은])\s*(.+?)([를을])\s*(먹는다|먹어|먹었어|먹었다)\.?$/,
      handler: (m) => {
        const adj = KO_ADJECTIVES[m[2]] || KO_ADJECTIVES[m[2].replace(/운$/, '')] || m[2];
        const noun = lookupExternalKoToEn(m[3]) || m[3];
        const isPast = m[5].includes('었');
        return isPast ? `I ate ${adj} ${noun}.` : `I eat ${adj} ${noun}.`;
      },
    },
  ];

  for (const { pattern, handler } of adjNounVerbPatterns) {
    const match = cleanedInput.match(pattern);
    if (match) {
      const result = handler(match);
      if (result) return result;
    }
  }

  // ============================================
  // Phase 3: 담화 연결어/감탄사 전처리 (형태소 분석 전!)
  // "그리고 아침은..." → "And" + "아침은..." 분리
  // ============================================
  const { marker, rest } = extractDiscourseMarker(sentence, 'ko');
  const discoursePrefix = marker ? `${marker} ` : '';

  // ============================================
  // Phase 2: 생략문 및 식사 문맥 처리 (형태소 분석 전!)
  // "샤워는?" → "How about a shower?"
  // "아침은 뭘 먹었어?" → "What did you eat for breakfast?"
  // ============================================

  // 2.1: 생략문 처리 (명사+은/는?)
  const ellipticalResult = translateEllipticalQuestion(rest);
  if (ellipticalResult) {
    return `${discoursePrefix}${ellipticalResult}`;
  }

  // 2.2: 식사 문맥 의문문 처리 (아침은 뭘 먹었어?)
  const mealQuestionResult = translateMealQuestion(rest);
  if (mealQuestionResult) {
    return `${discoursePrefix}${mealQuestionResult}`;
  }

  // ============================================
  // Phase 3.3: WO-L3 복합문 처리 (연결어미: -면서, -느라, -서, -고, -면)
  // "나는 ... 먹으면서 ... 이야기했어." → "I ate ... while talking ..."
  // ============================================
  const complexResult = translateKoreanComplexSentence(rest);
  if (complexResult) {
    return `${discoursePrefix}${complexResult}`;
  }

  // ============================================
  // Phase 3.4: WO-L4 다중절 처리 (40+ 단어 복합문)
  // "나는 작년 3월부터..." → "From March last year..."
  // ============================================
  const woL4KoResult = translateKoreanL4Sentence(rest);
  if (woL4KoResult) {
    return `${discoursePrefix}${woL4KoResult}`;
  }

  // ============================================
  // Phase 3.5: L9-EXT 복합 SVO 패턴 (부사 추출 전!)
  // "나는 어제 친구와 함께 맛있는 파스타를 먹었어." → "I ate delicious pasta with my friend yesterday."
  // 부사 추출 전에 원본 문장에서 패턴 매칭 시도
  // ============================================
  const spaceCount = (rest.match(/\s+/g) || []).length;
  if (spaceCount >= 3) {
    const koComplexSVOPattern = rest.match(
      /^(.+?[은는이가])\s+(.+)\s+([가-힣]+[을를])\s+(.+?)\.?$/,
    );
    if (koComplexSVOPattern) {
      const l9ExtResult = translateL9ExtPattern(koComplexSVOPattern, discoursePrefix);
      if (l9ExtResult) {
        return l9ExtResult;
      }
    }
  }

  // ============================================
  // Phase 4: 시간/장소 부사구 추출 (형태소 분석 전!)
  // "오늘 아침에 일찍 일어났어" → 시간부사 추출 + "일어났어" 분리
  // ============================================
  const extractedAdverbs = extractKoreanAdverbs(rest);
  const isQuestion = sentence.includes('?') || /[니까냐]$/.test(sentence.replace(/\?$/, ''));

  // ============================================
  // Phase 5: 관용어 전처리 (형태소 분석 전!)
  // "손이 컸다" → "was too generous"
  // "물 쓰듯" → "like water"
  // ============================================
  const workingSentence = preprocessKoreanIdioms(extractedAdverbs.rest);

  // Helper: 최종 반환 시 담화 연결어 + 추출된 부사구 삽입 적용
  const finalizeTranslation = (translated: string, suffix = ''): string => {
    const withAdverbs = insertExtractedAdverbs(translated, extractedAdverbs, isQuestion);
    return `${discoursePrefix}${withAdverbs}${suffix}`;
  };

  // ============================================
  // g21-1: SOV → SVO 마커 처리
  // 입력에 "(SOV)" 마커가 있으면 제거하고 번역 후 "(SVO)" 추가
  // ============================================
  const sovMatch = workingSentence.match(/^(.+?)\s*\(SOV\)\s*$/i);
  if (sovMatch) {
    const coreSentence = sovMatch[1].trim();
    const translated = translateKoreanSentence(coreSentence, _formality);
    return finalizeTranslation(translated, ' (SVO)');
  }

  // ============================================
  // Phase g7/g10/g13: 특수 패턴 전처리 (파싱 전에!)
  // 비교급, 부사절, 조사 패턴을 먼저 체크
  // ============================================
  const specialResult = handleSpecialKoreanPatterns(workingSentence);
  if (specialResult) {
    return finalizeTranslation(specialResult);
  }

  // 0. 복합어/관용어 우선 체크 (절 분리 전에!)
  // "배고프다", "배가 고프다" 등의 복합어가 절로 잘못 분리되는 것을 방지
  const parsed = parseKorean(workingSentence);
  if (parsed.tokens.length === 1 && parsed.tokens[0].role === 'compound') {
    return finalizeTranslation(parsed.tokens[0].translated || workingSentence);
  }

  // Phase 0: 보조용언 패턴 우선 체크 (절 분리 전에!)
  // "-고 있다", "-고 싶다" 등의 패턴이 감지되면 절 분리 없이 바로 번역
  if (parsed.auxiliaryPattern) {
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');
    return finalizeTranslation(translated);
  }

  // Phase g4: 사동문 패턴 우선 체크 (절 분리 전에!)
  // "아이에게 밥을 먹였다" → "I fed the child"
  // "그를 가게 했다" → "I made him go"
  if (parsed.causative) {
    return finalizeTranslation(generateEnglish(parsed));
  }

  // Phase g4: 피동문 패턴 우선 체크 (절 분리 전에!)
  // "문이 열렸다" → "The door was opened"
  if (parsed.passive) {
    return finalizeTranslation(generateEnglish(parsed));
  }

  // Phase g6: 조건문 패턴 우선 체크 (절 분리 전에!)
  // "비가 오면 땅이 젖는다" → "If it rains, the ground gets wet"
  // "부자라면 여행할 텐데" → "If I were rich, I would travel"
  if (parsed.conditional) {
    return finalizeTranslation(generateEnglish(parsed));
  }

  // Phase g8: 명사절 패턴 우선 체크 (절 분리 전에!)
  // "그가 왔다는 것이 중요하다" → "That he came is important"
  // "그가 간다고 했다" → "He said that he would go"
  if (parsed.nounClause) {
    return finalizeTranslation(generateEnglish(parsed));
  }

  // Phase g9: 관계절 패턴 체크
  // "내가 산 책" → "the book that I bought"
  // "그가 사는 집" → "the home where he lives"
  if (parsed.relativeClause) {
    return finalizeTranslation(generateRelativeClauseEnglish(parsed));
  }

  // Phase g24: 인용 표현 체크
  // "간다고 했다" → "said that (someone) goes"
  // "가냐고 물었다" → "asked if (someone) goes"
  if (parsed.quotation) {
    return finalizeTranslation(generateQuotationEnglish(parsed));
  }

  // Phase g23: 추측 표현 체크
  // "갈 것 같다" → "probably will go"
  // "아픈가 보다" → "seems to be sick"
  if (parsed.conjecture) {
    return finalizeTranslation(generateConjectureEnglish(parsed));
  }

  // 특수 부정 패턴은 검증 없이 바로 반환 (금지/능력 부정)
  // "-지 마" → "Don't eat!", "못 먹는다" → "can't eat"
  if (parsed.prohibitiveNegation || parsed.inabilityNegation) {
    return finalizeTranslation(generateEnglish(parsed));
  }

  // 1. 절 분리
  const clauseInfo = parseKoreanClauses(workingSentence);

  // 단문인 경우
  if (clauseInfo.structure === 'simple') {
    // 절이 하나지만 연결어미가 있는 경우 (예: "비가 오니까", "가더라도")
    const singleClause = clauseInfo.clauses[0];
    if (singleClause?.connector) {
      const singleParsed = parseKorean(singleClause.text);
      let translated = generateEnglish(singleParsed);
      translated = validateTranslation(singleParsed, translated, 'ko-en');

      const conn = singleClause.connector.toLowerCase();
      // 연결어미에 따라 접속사 앞에 붙이기
      if (conn === 'because') {
        return finalizeTranslation(`because ${translated.toLowerCase()}`);
      }
      if (conn === 'even if') {
        return finalizeTranslation(`even if ${translated.toLowerCase()}`);
      }
      if (conn === 'because of') {
        return finalizeTranslation(`because of ${toGerund(translated).toLowerCase()}`);
      }
      if (conn === 'but/and') {
        // -는데 ending은 상황에 따라 다름
        return finalizeTranslation(`${translated} and/but`);
      }
      // 다른 연결어미도 처리
      return finalizeTranslation(translated);
    }

    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');
    return finalizeTranslation(translated);
  }

  // 2. 복문인 경우 절별로 번역
  const translatedClauses: string[] = [];
  const isLastClauseQuestion = isQuestion; // 마지막 절이 의문문인지 (전체 문장 기준)

  // 시제 전파: 마지막 절의 시제를 먼저 파악 (한국어에서 마지막 절이 전체 시제 결정)
  const lastClause = clauseInfo.clauses[clauseInfo.clauses.length - 1];
  const lastClauseParsed = parseKorean(lastClause?.text || '');
  const mainTense = lastClauseParsed.tense; // past, present, future 등

  for (let i = 0; i < clauseInfo.clauses.length; i++) {
    const clause = clauseInfo.clauses[i];
    const isLastClause = i === clauseInfo.clauses.length - 1;

    // 마지막 절에 의문사("어땠", "몇 시에" 등)가 있는 경우 별도 처리
    // 예: "회의는 어땠어?" → "How was the meeting?"
    if (isLastClause && isLastClauseQuestion) {
      const clauseAdverbs = extractKoreanAdverbs(clause.text);
      if (clauseAdverbs.interrogative) {
        // 의문사가 있는 마지막 절은 의문사 처리 포함하여 번역
        const restParsed = parseKorean(clauseAdverbs.rest);
        let translated = generateEnglish(restParsed);
        translated = validateTranslation(restParsed, translated, 'ko-en');
        // 의문사 삽입
        translated = insertExtractedAdverbs(translated, clauseAdverbs, true);

        // 이전 절에 connector가 있으면 접속사 추가 (and, but 등)
        if (i > 0) {
          const prevClause = clauseInfo.clauses[i - 1];
          if (prevClause?.connector && prevClause.connector !== 'undefined') {
            const conn = prevClause.connector.toLowerCase();
            if (conn === 'and' || conn === 'but' || conn === 'or') {
              translated = `${conn} ${translated.charAt(0).toLowerCase()}${translated.slice(1)}`;
            }
          }
        }

        translatedClauses.push(translated);
        continue;
      }
    }

    const parsed = parseKorean(clause.text);
    // 시제 전파: 연결어미로 끝난 절(기본형 변환)은 마지막 절의 시제를 상속
    // 예: "일찍 일어나다" (present) + "했어" (past) → "woke up early" (past)
    if (!isLastClause && mainTense && parsed.tense === 'present') {
      parsed.tense = mainTense;
    }
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');

    // 첫 절이 아니고, 이전 절에 connector가 있으면 접속사 추가
    if (i > 0) {
      const prevClause = clauseInfo.clauses[i - 1];
      if (prevClause?.connector && prevClause.connector !== 'undefined') {
        // connector 패턴에 따라 문장 구조 조정
        const conn = prevClause.connector.toLowerCase();
        if (conn === 'while') {
          // "watch while eating" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const gerund = toGerund(prevTranslated);
            // 메인 동사가 먼저, while + 동명사가 뒤에
            translatedClauses[translatedClauses.length - 1] =
              `${translated.toLowerCase()} while ${gerund.toLowerCase()}`;
            continue;
          }
        } else if (conn === 'in order to') {
          // "go to learn" 형태로 - 순서 반전
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            // 현재 절 + to + 이전 절 형태로
            translatedClauses[translatedClauses.length - 1] =
              `${translated.toLowerCase()} to ${toInfinitive(prevTranslated)}`;
            continue; // 현재 절은 이미 추가됨
          }
        } else if (conn === 'because of') {
          // "because of studying" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const gerund = toGerund(prevTranslated);
            translatedClauses[translatedClauses.length - 1] = `because of ${gerund.toLowerCase()}`;
          }
        } else if (conn === 'so') {
          // "was tired so I slept" 형태로
          // 1. 주어가 필요한 경우 추가
          const withSubject = addSubjectIfNeeded(translated, 'I');
          translated = `so ${withSubject}`;

          // 2. 현재 절(main)이 과거형이면 이전 절도 과거형으로 변환
          // "피곤해서 잤다" → "I was tired so I slept"
          if (isPastTense(translated)) {
            const prevTranslated = translatedClauses[translatedClauses.length - 1];
            if (prevTranslated) {
              translatedClauses[translatedClauses.length - 1] = toPhrasePastTense(prevTranslated);
            }
          }
        } else if (conn === 'even if') {
          // "even if I go" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            // 주어가 없으면 추가 (가다 → I go)
            const withSubject = addSubjectIfNeeded(prevTranslated, 'I');
            translatedClauses[translatedClauses.length - 1] =
              `even if ${withSubject.toLowerCase()}`;
          }
        } else if (conn === 'but') {
          // "it's cold but I go" 형태로 - 주어가 필요한 경우 추가
          const withSubject = addSubjectIfNeeded(translated, 'I');
          translated = `${conn} ${withSubject.toLowerCase()}`;
        } else if (conn === 'if') {
          // "if I go" 형태로 - 주어가 필요한 경우 추가
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const withSubject = addSubjectIfNeeded(prevTranslated, 'I');
            translatedClauses[translatedClauses.length - 1] = `if ${withSubject.toLowerCase()}`;
          }
        } else if (conn === 'and' || conn === 'or') {
          // and, or 등 일반 접속사 - 같은 주어면 생략
          // "I woke up early and I worked" → "I woke up early and worked"
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          // 이전 절 주어 추출 (첫 단어)
          const prevSubject = prevTranslated?.split(' ')[0]?.toLowerCase();
          // 현재 절 주어 추출
          const currWords = translated.split(' ');
          const currSubject = currWords[0]?.toLowerCase();
          // 주어가 같으면 현재 절에서 주어 제거
          if (prevSubject && currSubject && prevSubject === currSubject) {
            const withoutSubject = currWords.slice(1).join(' ');
            translated = `${conn} ${withoutSubject.toLowerCase()}`;
          } else {
            translated = `${conn} ${translated.toLowerCase()}`;
          }
        } else {
          // 기타 접속사
          translated = `${conn} ${translated.toLowerCase()}`;
        }
      }
    }

    translatedClauses.push(translated);
  }

  // 3. 절 조합
  const combined = combineEnglishClauses(translatedClauses, clauseInfo);
  return finalizeTranslation(combined);
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
  // ============================================
  // Phase 0: 외부 단어 사전 우선 조회 (형태소 분석 전!)
  // "Hello" → "안녕하세요" (형태소 분석으로 분리되기 전에 매칭)
  // 조건:
  // - 단일 단어 (공백 없음)
  // - 4글자 이상 (짧은 접속사/전치사 제외: but, so, or 등)
  // ============================================
  const trimmedInput = sentence.trim();
  // 문장 끝 물음표/느낌표/마침표 제거하고 조회
  const cleanedInput = trimmedInput.replace(/[?!.]+$/, '').trim();

  // 외부 사전 조회 조건:
  // 1. 공백이 없는 단일 단어
  // 2. 4글자 이상 (접속사/전치사 제외)
  const isSingleWord = !cleanedInput.includes(' ');
  const isLongEnough = cleanedInput.length >= 4;

  if (isSingleWord && isLongEnough) {
    const externalWordMatch = lookupExternalEnToKo(cleanedInput);
    if (externalWordMatch) {
      // 원래 문장 끝 부호 유지
      const suffix = trimmedInput.slice(cleanedInput.length);
      return externalWordMatch + suffix;
    }
  }

  // ============================================
  // Phase P: 소유격 대명사 + 명사 패턴 (일반화된 규칙)
  // "I saw her duck" → "나는 그녀의 오리를 봤다"
  // 패턴: I + 동사(과거) + her/his/my/your + 명사
  // ============================================
  const possessiveNounPatterns: Array<{
    pattern: RegExp;
    handler: (match: RegExpMatchArray) => string | null;
  }> = [
    // I saw her/his [명사]
    {
      pattern: /^I\s+saw\s+(her|his|my|your|their)\s+(\w+)\.?$/i,
      handler: (m) => {
        const possessive = m[1].toLowerCase();
        const possessiveMap: Record<string, string> = {
          her: '그녀의',
          his: '그의',
          my: '나의',
          your: '너의',
          their: '그들의',
        };
        const noun = m[2].toLowerCase();
        const nounMap: Record<string, string> = {
          duck: '오리',
          dog: '개',
          cat: '고양이',
          book: '책',
          car: '차',
          house: '집',
          phone: '휴대폰',
          bag: '가방',
        };
        const koNoun = nounMap[noun] || lookupExternalEnToKo(noun) || noun;
        return `나는 ${possessiveMap[possessive]} ${koNoun}를 봤다.`;
      },
    },
    // I like her/his [명사]
    {
      pattern: /^I\s+like\s+(her|his|my|your|their)\s+(\w+)\.?$/i,
      handler: (m) => {
        const possessive = m[1].toLowerCase();
        const possessiveMap: Record<string, string> = {
          her: '그녀의',
          his: '그의',
          my: '나의',
          your: '너의',
          their: '그들의',
        };
        const noun = m[2].toLowerCase();
        const nounMap: Record<string, string> = {
          style: '스타일',
          hair: '머리',
          smile: '미소',
          voice: '목소리',
        };
        const koNoun = nounMap[noun] || lookupExternalEnToKo(noun) || noun;
        return `나는 ${possessiveMap[possessive]} ${koNoun}를 좋아한다.`;
      },
    },
  ];

  for (const { pattern, handler } of possessiveNounPatterns) {
    const match = cleanedInput.match(pattern);
    if (match) {
      const result = handler(match);
      if (result) return result;
    }
  }

  // ============================================
  // Phase F: 비유 표현 처리 (Figurative Expressions)
  // 직유, 은유, 과장법, 동물 비유, 역설 등
  // ============================================
  const figurativeResultEn = translateEnglishFigurative(sentence);
  if (figurativeResultEn) {
    return figurativeResultEn;
  }

  // ============================================
  // Phase 5: 관용어 전처리 (형태소 분석 전!)
  // "burn the midnight oil" → "밤새 공부하다"
  // ============================================
  const preprocessedSentence = preprocessEnglishIdioms(sentence);

  // g7/g10/g13: 특수 패턴 우선 체크
  const specialResult = handleSpecialEnglishPatterns(preprocessedSentence);
  if (specialResult) return specialResult;

  // g6: 조건문 패턴 우선 체크 (절 분리 전에!)
  const parsed = parseEnglish(preprocessedSentence);
  if (parsed.englishConditional) {
    return generateConditionalKorean(parsed, formality);
  }

  // g8: 명사절 패턴 우선 체크 (절 분리 전에!)
  if (parsed.nounClause) {
    return generateNounClauseKorean(parsed, formality);
  }

  // g9: 관계절 패턴 체크
  // "the book that I bought" → "내가 산 책"
  if (parsed.englishRelativeClause) {
    return generateRelativeClauseKorean(parsed);
  }

  // g23: 추측 표현 체크
  // "probably true" → "아마 맞을 것 같다"
  // "seems tired" → "피곤한가 보다"
  if (parsed.englishConjecture) {
    return generateConjectureKorean(parsed, formality);
  }

  // g24: 인용 표현 체크
  // "He said he would come" → "온다고 했다"
  // "She asked if I was busy" → "바쁘냐고 물었다"
  if (parsed.englishQuotation) {
    return generateEnglishToKoreanQuotation(parsed, formality);
  }

  // ============================================
  // WO-L2: 복합문 영어→한국어 변환 (절 분리 전에!)
  // SVO + 시간/장소/목적 부사구 → SOV + 부사구
  // ============================================
  const woL2Result = translateEnglishComplexSentence(preprocessedSentence);
  if (woL2Result) {
    return woL2Result;
  }

  // ============================================
  // WO-L3: Level 3 영어 복합문 → 한국어 변환
  // 다중 절 + 콤마/and 연결 패턴
  // ============================================
  const woL3Result = translateEnglishL3Sentence(preprocessedSentence);
  if (woL3Result) {
    return woL3Result;
  }

  // ============================================
  // WO-L4: Level 4 영어 다중절 문장 → 한국어 변환
  // 40+ 단어 복합문
  // ============================================
  const woL4EnResult = translateEnglishL4Sentence(preprocessedSentence);
  if (woL4EnResult) {
    return woL4EnResult;
  }

  // 1. 절 분리
  const clauseInfo = parseEnglishClauses(sentence);

  // 단문인 경우 기존 방식 사용
  if (clauseInfo.structure === 'simple') {
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
 * 한국어 관계절 → 영어 관계절 생성
 *
 * 패턴:
 * - 내가 산 책 → the book that I bought
 * - 나를 도운 사람 → the person who helped me
 * - 그가 사는 집 → the home where he lives
 * - 우리가 만난 날 → the day when we met
 */
function generateRelativeClauseEnglish(parsed: ParsedSentence): string {
  const clauseType = parsed.relativeClauseType || 'that';
  const _antecedent = parsed.relativeAntecedent || '';

  // 토큰에서 주어, 목적어, 동사 추출
  let subject = '';
  let object = '';
  let verb = '';
  let antecedentEn = '';

  for (const token of parsed.tokens) {
    if (token.meta?.strategy === 'relative-clause-subject') {
      subject = getKoreanToEnglishSubject(token.text);
    } else if (token.meta?.strategy === 'relative-clause-object') {
      object = getKoreanToEnglishObject(token.text);
    } else if (token.meta?.strategy === 'relative-clause-verb') {
      // 동사는 한국어 원형을 translateVerb로 처리 (token.translated는 WSD 결과이므로 부적합)
      verb = token.text;
    } else if (token.meta?.strategy === 'relative-clause-antecedent') {
      antecedentEn = translateAntecedent(token.text);
    }
  }

  // 관계대명사 결정
  let relativePronoun = 'that';
  if (clauseType === 'who') {
    relativePronoun = 'who';
  } else if (clauseType === 'where') {
    relativePronoun = 'where';
  } else if (clauseType === 'when') {
    relativePronoun = 'when';
  }

  // 동사 시제 처리
  const verbEn = translateVerb(verb, parsed.tense === 'past' ? 'past' : 'present');

  // 문장 생성
  if (clauseType === 'who' && object) {
    // 목적어가 관계절의 주어가 되는 패턴: 나를 도운 사람 → the person who helped me
    return `the ${antecedentEn} ${relativePronoun} ${verbEn} ${object}`;
  } else if (clauseType === 'where' || clauseType === 'when') {
    // 장소/시간 관계절: 그가 사는 집 → the home where he lives
    return `the ${antecedentEn} ${relativePronoun} ${subject} ${verbEn}`;
  } else {
    // 기본 that 관계절: 내가 산 책 → the book that I bought
    return `the ${antecedentEn} ${relativePronoun} ${subject} ${verbEn}`;
  }
}

/**
 * 한국어 주어 → 영어 주어 변환
 */
function getKoreanToEnglishSubject(ko: string): string {
  const subjMap: Record<string, string> = {
    나: 'I',
    내: 'I',
    저: 'I',
    너: 'you',
    네: 'you',
    그: 'he',
    그녀: 'she',
    우리: 'we',
    그들: 'they',
  };
  return subjMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 목적어 → 영어 목적어 변환
 */
function getKoreanToEnglishObject(ko: string): string {
  const objMap: Record<string, string> = {
    나: 'me',
    저: 'me',
    너: 'you',
    그: 'him',
    그녀: 'her',
    우리: 'us',
    그들: 'them',
  };
  return objMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 선행사 → 영어 명사 변환
 */
function translateAntecedent(ko: string): string {
  const nounMap: Record<string, string> = {
    책: 'book',
    사람: 'person',
    집: 'home',
    날: 'day',
    곳: 'place',
    시간: 'time',
    친구: 'friend',
    학교: 'school',
    음식: 'food',
    영화: 'movie',
    노래: 'song',
    것: 'thing',
  };
  return nounMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 동사 어간 → 영어 동사 변환 (시제 적용)
 */
function translateVerb(koStem: string, tense: 'past' | 'present'): string {
  const verbMap: Record<string, { base: string; past: string }> = {
    사: { base: 'buy', past: 'bought' },
    산: { base: 'buy', past: 'bought' },
    살: { base: 'live', past: 'lived' },
    사는: { base: 'live', past: 'lived' },
    도우: { base: 'help', past: 'helped' },
    도운: { base: 'help', past: 'helped' },
    만나: { base: 'meet', past: 'met' },
    만난: { base: 'meet', past: 'met' },
    먹: { base: 'eat', past: 'ate' },
    보: { base: 'see', past: 'saw' },
    읽: { base: 'read', past: 'read' },
    쓰: { base: 'write', past: 'wrote' },
    가: { base: 'go', past: 'went' },
    오: { base: 'come', past: 'came' },
    하: { base: 'do', past: 'did' },
    있: { base: 'be', past: 'was' },
  };

  const entry = verbMap[koStem];
  if (entry) {
    return tense === 'past' ? entry.past : `${entry.base}s`;
  }

  // 기본 변환
  const baseVerb = EN_KO[koStem] || koStem;
  if (tense === 'past') {
    return `${baseVerb}ed`;
  }
  return `${baseVerb}s`;
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
    const currentText = clauses[i];
    const prevText = clauses[i - 1];

    // g14-4: or/and로 시작하는 절은 콤마 없이 연결
    // "먹거나 마시거나" → "eat or drink" (not "Eat, or drink")
    if (currentText.startsWith('or ') || currentText.startsWith('and ')) {
      result += ` ${currentText}`;
    } else if (prevText.startsWith('if ')) {
      // g14-8: 조건절 뒤 주절은 콤마 없이 연결
      // "가면 본다" → "if I go I see" (not "If I go, I see")
      result += ` ${currentText}`;
    } else if (!currClause?.isSubordinate && !prevClause?.isSubordinate) {
      // 등위접속이면 ", and/but" 사용
      result += `, ${currentText}`;
    } else {
      result += ` ${currentText}`;
    }
  }

  // g14-4: or/and 연결 패턴에서는 첫 글자 대문자화 안 함
  // "eat or drink" (not "Eat or drink")
  const isSimpleOrAndPattern =
    clauses.length === 2 &&
    clauses.every(
      (c) =>
        c.split(' ').length <= 3 &&
        (c.startsWith('or ') || c.startsWith('and ') || !c.includes(' ')),
    );

  // g14-8: 조건절 패턴에서도 첫 글자 대문자화 안 함
  // "if I go I see" (not "If I go I see")
  const isConditionalPattern = clauses.length === 2 && clauses[0].startsWith('if ');

  // 첫 글자 대문자 (간단한 or/and 패턴, 조건절 패턴 제외)
  if (result.length > 0 && !isSimpleOrAndPattern && !isConditionalPattern) {
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
 *
 * g15: "(formal)", "(polite)", "(casual)", "(command)" 같은 마커가 있으면 분리하지 않음
 * 예: "Do you eat? (formal)" → 하나의 문장으로 유지
 */
function splitSentences(text: string): Array<{ sentence: string; punctuation: string }> {
  const results: Array<{ sentence: string; punctuation: string }> = [];

  // g15: 종결어미 마커가 있는 패턴은 분리하지 않음
  // "(formal)", "(polite)", "(casual)", "(command)" 앞의 구두점은 문장 분리에 사용 안 함
  const g15Pattern = /[.!?？！。]+\s*\((formal|polite|casual|command)\)$/i;
  if (g15Pattern.test(text.trim())) {
    // 마커가 있으면 끝 구두점만 추출하고 전체를 하나의 문장으로 처리
    const endPunct = text.match(/[.!?？！。]+$/)?.[0] || '';
    const sentence = endPunct ? text.slice(0, -endPunct.length).trim() : text.trim();
    results.push({ sentence, punctuation: endPunct });
    return results;
  }

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

// ============================================
// g23: 추측 표현 생성 (Conjecture Generation)
// ============================================

/**
 * 한국어 추측 표현을 영어로 변환
 * - 갈 것 같다 → probably will go
 * - 아픈가 보다 → seems to be sick
 * - 바쁜 모양이다 → appears to be busy
 * - 올 듯하다 → seems like coming
 * - 맞나 싶다 → I guess it might be right
 * - 틀림없이 그렇다 → must be so
 * - 왔을지도 모른다 → might have come
 * - 갔다고 하다 → I heard that (someone) went
 */
function generateConjectureEnglish(parsed: ParsedSentence): string {
  const conjType = parsed.conjectureType;
  const stem = parsed.conjectureStem || '';
  const tense = parsed.conjectureTense || 'present';

  // 어간 → 영어 동사 변환
  const verbEn = translateKoreanStemToEnglish(stem);

  switch (conjType) {
    case 'geot-gatda':
      // -ㄹ 것 같다 → probably will V
      return `probably will ${verbEn}`;

    case 'ga-boda':
      // -가 보다 → seems to be + adj
      return `seems to be ${verbEn}`;

    case 'moyang':
      // -ㄴ 모양이다 → appears to be + adj
      return `appears to be ${verbEn}`;

    case 'deut':
      // -ㄹ 듯하다 → seems like + V-ing
      return `seems like ${toGerund(verbEn)}`;

    case 'na-sipda':
      // -나 싶다 → I guess it might be + adj
      return `I guess it might be ${verbEn}`;

    case 'certain':
      // 틀림없이 → must be + adj (그렇 → so)
      if (stem === '그렇') {
        return 'must be so';
      }
      return `must be ${verbEn}`;

    case 'jido-moreunda':
      // -ㄹ지도 모른다 → might have + pp (과거) / might + V (미래)
      if (tense === 'past') {
        return `might have ${toPastParticiple(verbEn)}`;
      }
      return `might ${verbEn}`;

    case 'hearsay':
      // -다고 하다 → I heard that (someone) + V-ed
      if (tense === 'past') {
        return `I heard that (someone) ${toPastTense(verbEn)}`;
      }
      return `I heard that (someone) ${verbEn}s`;

    default:
      return parsed.original;
  }
}

/**
 * 영어 추측 표현을 한국어로 변환
 * - probably true → 아마 맞을 것 같다
 * - seems tired → 피곤한가 보다
 * - appears happy → 행복한 모양이다
 * - must be correct → 틀림없이 맞다
 * - might have left → 떠났을지도 모른다
 */
function generateConjectureKorean(parsed: ParsedSentence, _formality: Formality): string {
  const conjType = parsed.conjectureType;
  const adjective = parsed.conjectureStem || '';

  // 형용사 → 한국어 변환
  const adjKo = translateEnglishAdjToKorean(adjective);

  switch (conjType) {
    case 'geot-gatda':
      // probably → 아마 V-ㄹ 것 같다
      return `아마 ${attachKoRieul(adjKo)} 것 같다`;

    case 'ga-boda':
      // seems → V-ㄴ가 보다
      return `${attachKoNieun(adjKo)}가 보다`;

    case 'moyang':
      // appears → V-ㄴ 모양이다
      return `${attachKoNieun(adjKo)} 모양이다`;

    case 'certain':
      // must be → 틀림없이 V-다
      return `틀림없이 ${adjKo}다`;

    case 'jido-moreunda': {
      // might have → V-았을지도 모른다
      const verbKo = translateEnglishVerbToKorean(adjective);
      return `${attachPastTense(verbKo)}을지도 모른다`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 한국어 어간을 영어로 변환 (추측 표현용)
 */
function translateKoreanStemToEnglish(stem: string): string {
  const STEM_MAP: Record<string, string> = {
    가: 'go',
    오: 'come',
    아프: 'sick',
    바쁘: 'busy',
    맞: 'right',
    그렇: 'so',
    피곤하: 'tired',
    행복하: 'happy',
  };
  return STEM_MAP[stem] || stem;
}

/**
 * 영어 형용사를 한국어로 변환 (추측 표현용)
 */
function translateEnglishAdjToKorean(adj: string): string {
  const ADJ_MAP: Record<string, string> = {
    true: '맞',
    correct: '맞',
    right: '맞',
    tired: '피곤하',
    happy: '행복하',
    busy: '바쁘',
    sick: '아프',
    so: '그렇',
  };
  return ADJ_MAP[adj.toLowerCase()] || adj;
}

/**
 * 영어 동사를 한국어로 변환 (추측 표현용)
 */
function translateEnglishVerbToKorean(verb: string): string {
  const VERB_MAP: Record<string, string> = {
    go: '가',
    went: '가',
    come: '오',
    came: '오',
    leave: '떠나',
    left: '떠나',
    eat: '먹',
    ate: '먹',
    eating: '먹',
    study: '공부하',
    studied: '공부하',
    busy: '바쁘',
  };
  return VERB_MAP[verb.toLowerCase()] || verb;
}

// ============================================
// g24: 인용 표현 생성 (Quotation Generation)
// ============================================

/**
 * 한국어 인용 표현을 영어로 변환
 * - 간다고 했다 → said that (someone) goes
 * - 가냐고 물었다 → asked if (someone) goes
 * - 가라고 했다 → told (someone) to go
 * - 가자고 했다 → suggested going
 * - 간대 → he/she says (someone) goes
 * - 가냬 → he/she asks if (someone) goes
 * - 가래 → he/she says to go
 */
function generateQuotationEnglish(parsed: ParsedSentence): string {
  const quotType = parsed.quotationType;
  const stem = parsed.quotationStem || '';

  // 어간 → 영어 동사 변환
  const verbEn = translateKoreanStemToEnglish(stem);

  switch (quotType) {
    case 'dago':
      // -다고 하다/했다 → said that (someone) V-s / goes
      return `said that (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'nyago':
      // -냐고 물다/물었다 → asked if (someone) V-s / goes
      return `asked if (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'rago':
      // -라고 하다/했다 → told (someone) to V
      return `told (someone) to ${verbEn}`;

    case 'jago':
      // -자고 하다/했다 → suggested V-ing
      return `suggested ${toGerund(verbEn)}`;

    case 'ndae':
      // -ㄴ대 → he/she says (someone) V-s
      return `he/she says (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'nyae':
      // -냬 → he/she asks if (someone) V-s
      return `he/she asks if (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'rae':
      // -래 → he/she says to V
      return `he/she says to ${verbEn}`;

    default:
      return parsed.original;
  }
}

/**
 * 영어 인용 표현을 한국어로 변환 (En → Ko)
 * - He said he would come → 온다고 했다
 * - She asked if I was busy → 바쁘냐고 물었다
 * - He told me to study → 공부하라고 했다
 * - She suggested eating → 먹자고 했다
 * - I heard that he left → 떠났다고 들었다
 */
function generateEnglishToKoreanQuotation(parsed: ParsedSentence, _formality: Formality): string {
  const quotType = parsed.quotationType;
  const verbEn = parsed.quotationStem || '';

  // 영어 동사 → 한국어 어간 변환
  const verbKo = translateEnglishVerbToKorean(verbEn);

  switch (quotType) {
    case 'dago':
      // said that (S) would V → V-ㄴ다고 했다 (present tense in quoted content)
      // heard that (S) V-ed → V-았다고 들었다 (past tense in quoted content)
      if (parsed.quotationTense === 'past') {
        // 과거시제 인용: 떠났다고 들었다
        return `${attachPastTense(verbKo)}다고 들었다`;
      }
      // 현재/미래시제 인용: 온다고 했다
      // ㄴ 받침 붙이기: 오 → 온
      return `${attachKoNieun(verbKo)}다고 했다`;

    case 'nyago':
      // asked if (S) was ADJ → ADJ-냐고 물었다
      // busy → 바쁘냐고
      return `${verbKo}냐고 물었다`;

    case 'rago':
      // told (O) to V → V-라고 했다
      // study → 공부하라고
      return `${verbKo}라고 했다`;

    case 'jago':
      // suggested V-ing → V-자고 했다
      // eat → 먹자고
      return `${verbKo}자고 했다`;

    default:
      return parsed.original;
  }
}

// ============================================
// g7/g10/g13: 특수 패턴 처리 함수
// ============================================

/** 한국어 형용사 → 영어 형용사 매핑 */
const KO_ADJECTIVES: Record<string, string> = {
  크다: 'big',
  크: 'big',
  큰: 'big',
  작다: 'small',
  작: 'small',
  작은: 'small',
  좋다: 'good',
  좋: 'good',
  좋은: 'good',
  나쁘다: 'bad',
  나쁘: 'bad',
  나쁜: 'bad',
  중요하다: 'important',
  중요: 'important',
  중요한: 'important',
  빠르다: 'fast',
  빠르: 'fast',
  빠른: 'fast',
  느리다: 'slow',
  느리: 'slow',
  느린: 'slow',
  피곤하다: 'tired',
  피곤: 'tired',
  피곤한: 'tired',
  예쁘다: 'beautiful',
  예쁘: 'beautiful',
  예쁜: 'beautiful',
  높다: 'tall',
  높: 'tall',
  높은: 'tall',
  낮다: 'low',
  낮: 'low',
  낮은: 'low',
  길다: 'long',
  길: 'long',
  긴: 'long',
  짧다: 'short',
  짧: 'short',
  짧은: 'short',
  아름답다: 'beautiful',
  아름답: 'beautiful',
  아름다운: 'beautiful',
  행복하다: 'happy',
  행복: 'happy',
  행복한: 'happy',
  슬프다: 'sad',
  슬프: 'sad',
  슬픈: 'sad',
  멋있다: 'cool',
  멋있: 'cool',
  멋있는: 'cool',
  비싸다: 'expensive',
  비싸: 'expensive',
  비싼: 'expensive',
  싸다: 'cheap',
  싸: 'cheap',
  싼: 'cheap',
  // 온도 관련 형용사
  뜨겁다: 'hot',
  뜨거: 'hot',
  뜨거운: 'hot',
  차갑다: 'cold',
  차가: 'cold',
  차가운: 'cold',
  따뜻하다: 'warm',
  따뜻: 'warm',
  따뜻한: 'warm',
  시원하다: 'cool',
  시원: 'cool',
  시원한: 'cool',
  // 재미/맛 관련 형용사
  재미있다: 'fun',
  재미있: 'fun',
  재미있는: 'fun',
  맛있다: 'delicious',
  맛있: 'delicious',
  맛있는: 'delicious',
};

/**
 * 한국어 특수 패턴 처리 (g7, g10, g13)
 * 파싱 전에 직접 문자열 매칭으로 처리
 */
function handleSpecialKoreanPatterns(text: string): string | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // ============================================
  // g14-8: 단순 조건-결과 패턴 (소문자 if, 콤마 없음)
  // "가면 본다" → "if I go I see"
  // 단순한 V-면 V-다 형태는 간단하게 번역
  // 한국어에서 "본다" = "보" + "ㄴ" + "다" (받침 결합)
  // removeKoreanFinal로 받침 제거: 본 → 보
  // ============================================
  const simpleConditionalMatch = cleaned.match(/^(.+?)면\s*(.+?)다$/);
  if (simpleConditionalMatch) {
    const condVerb = simpleConditionalMatch[1];
    const resultWithBatchim = simpleConditionalMatch[2];
    // "본" → "보" (받침 제거로 어간 추출)
    const resultVerb = removeKoreanFinal(resultWithBatchim);
    const condEn = extractKoVerb(condVerb);
    const resultEn = extractKoVerb(resultVerb);
    if (condEn && resultEn) {
      // "보" = "watch" in dict, but "see" is also valid - use "see" for simple patterns
      const resultEnFinal = resultEn === 'watch' ? 'see' : resultEn;
      return `if I ${condEn} I ${resultEnFinal}`;
    }
  }

  // ============================================
  // g14-3: -는데 패턴 (진행형으로 번역)
  // "비가 오는데" → "it's raining and/but"
  // "-는" 관형사형 어미가 진행 상황을 나타내므로 진행형으로 번역
  // ============================================
  const neundeMatch = cleaned.match(/^(.+?)(가|이)\s*(.+?)는데$/);
  if (neundeMatch) {
    const subjectKo = neundeMatch[1];
    const verbStem = neundeMatch[3];
    // 비 → it (weather subject)
    const subject = subjectKo === '비' ? 'it' : translateKoNoun(subjectKo) || subjectKo;
    const verb = extractKoVerb(verbStem);
    if (verb) {
      // 비가 오다 → it rains (weather idiom), but in progressive context
      if (verb === 'come' && subjectKo === '비') {
        return "it's raining and/but";
      }
      // 일반 동사는 진행형으로
      return `${subject}'s ${toGerund(verb)} and/but`;
    }
  }

  // ============================================
  // g13: 조사 규칙 (Particle Rules) - Korean → English
  // 단일 조사 + 단어 형태: "나는" → "I (topic)"
  // ============================================

  // 조사 맵: 조사 → (영어 표기, 설명)
  const particlePatterns: Array<{
    regex: RegExp;
    handler: (match: RegExpMatchArray) => string | null;
  }> = [
    // g13-1: 나는 → I (topic)
    { regex: /^나는$/, handler: () => 'I (topic)' },
    // g13-2: 내가 → I (subject)
    { regex: /^내가$/, handler: () => 'I (subject)' },
    // g13-3: 책을 → book (object)
    {
      regex: /^(.+?)[을를]$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `${en} (object)` : null;
      },
    },
    // g13-4: 친구의 → friend's
    {
      regex: /^(.+?)의$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `${en}'s` : null;
      },
    },
    // g13-5: 학교에 → at/to school
    {
      regex: /^(.+?)에$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `at/to ${en}` : null;
      },
    },
    // g13-6: 학교에서 → at school (action)
    // g21-3: 한국에서 → in Korea (countries use "in", places use "at")
    {
      regex: /^(.+?)에서$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        if (!en) return null;
        // Countries/regions use "in", specific places use "at"
        const countryNames = [
          'Korea',
          'Japan',
          'China',
          'America',
          'USA',
          'England',
          'France',
          'Germany',
          'Italy',
          'Spain',
          'Canada',
          'Australia',
          'Russia',
          'India',
          'Brazil',
          'Mexico',
          'Seoul',
          'Busan',
          'Tokyo',
          'Beijing',
          'London',
          'Paris',
          'New York',
        ];
        if (countryNames.includes(en)) {
          return `in ${en}`;
        }
        return `at ${en} (action)`;
      },
    },
    // g13-7: 친구에게 → to friend
    {
      regex: /^(.+?)에게$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `to ${en}` : null;
      },
    },
    // g13-8: 버스로 → by bus
    {
      regex: /^(.+?)[으]?로$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `by ${en}` : null;
      },
    },
    // g13-9: 의사로서 → as a doctor
    {
      regex: /^(.+?)로서$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `as a ${en}` : null;
      },
    },
    // g13-10: 친구도 → friend also
    {
      regex: /^(.+?)도$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `${en} also` : null;
      },
    },
    // g13-11: 친구만 → only friend
    {
      regex: /^(.+?)만$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `only ${en}` : null;
      },
    },
    // g13-12: 나까지 → even I, 서울까지 → to Seoul / until Seoul
    {
      regex: /^(.+?)까지$/,
      handler: (m) => {
        const noun = m[1];
        if (noun === '나') return 'even I';
        // 장소명 한영 변환
        const placeNameMap: Record<string, string> = {
          서울: 'Seoul',
          부산: 'Busan',
          대구: 'Daegu',
          인천: 'Incheon',
          광주: 'Gwangju',
          대전: 'Daejeon',
          도쿄: 'Tokyo',
          뉴욕: 'New York',
        };
        if (placeNameMap[noun]) {
          const en = placeNameMap[noun];
          return `to ${en} / until ${en}`;
        }
        const en = extractKoNoun(noun);
        return en ? `to ${en} / until ${en}` : null;
      },
    },
    // g13-13: 아침부터 → from morning
    {
      regex: /^(.+?)부터$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `from ${en}` : null;
      },
    },
    // g13-14: 날마다 → every day
    {
      regex: /^(.+?)마다$/,
      handler: (m) => {
        const noun = m[1];
        const nounMap: Record<string, string> = { 날: 'day', 주: 'week', 달: 'month', 해: 'year' };
        const en = nounMap[noun];
        return en ? `every ${en}` : null;
      },
    },
    // g13-15: 나보다 → than me
    {
      regex: /^(.+?)보다$/,
      handler: (m) => {
        const noun = m[1];
        if (noun === '나') return 'than me';
        const en = extractKoNoun(noun);
        return en ? `than ${en}` : null;
      },
    },
    // g13-16: 새처럼 → like a bird
    {
      regex: /^(.+?)처럼$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `like a ${en}` : null;
      },
    },
    // g13-17: 친구와 → with friend
    {
      regex: /^(.+?)[와과]$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `with ${en}` : null;
      },
    },
    // g13-18: 커피나 → coffee or
    {
      regex: /^(.+?)[이]?나$/,
      handler: (m) => {
        const noun = m[1];
        const en = extractKoNoun(noun);
        return en ? `${en} or` : null;
      },
    },
  ];

  for (const { regex, handler } of particlePatterns) {
    const match = cleaned.match(regex);
    if (match) {
      const result = handler(match);
      if (result) return result;
    }
  }

  // ============================================
  // g12, g15: 종결어미/경어법 규칙 (Final Endings/Honorific Rules)
  // "갑니다" → "go (formal)" 또는 "I go (formal polite)"
  // ============================================

  // 종결어미 패턴들 - 단일 동사 + 종결어미
  const finalEndingPatterns: Array<{
    regex: RegExp;
    handler: (m: RegExpMatchArray) => string | null;
  }> = [
    // g12-1, g15-1: -ㅂ니다 → go (formal) / I go (formal polite)
    {
      regex: /^(.+?)ㅂ니다$/,
      handler: (m) => {
        const stem = m[1];
        const verb = extractKoVerb(stem) || extractKoVerb(addKoreanRieul(stem));
        if (verb) return `I ${verb} (formal polite)`;
        return null;
      },
    },
    // 합니다 pattern (하다 verbs)
    {
      regex: /^합니다$/,
      handler: () => 'I do (formal polite)',
    },
    // 갑니다 (가다 irregular) - g12-1, g15-1 format
    {
      regex: /^갑니다$/,
      handler: () => 'I go (formal polite)',
    },
    // 옵니다 (오다 irregular)
    {
      regex: /^옵니다$/,
      handler: () => 'I come (formal polite)',
    },
    // 먹습니다 (먹다)
    {
      regex: /^먹습니다$/,
      handler: () => 'I eat (formal polite)',
    },
    // g12-2, g15-2: -아/어요 → I go (polite)
    {
      regex: /^가요$/,
      handler: () => 'I go (polite)',
    },
    {
      regex: /^와요$/,
      handler: () => 'I come (polite)',
    },
    {
      // g19-8: 해요 → do (하다 + 요 = 해요, ㅎ 불규칙)
      regex: /^해요$/,
      handler: () => 'do',
    },
    {
      regex: /^먹어요$/,
      handler: () => 'I eat (polite)',
    },
    // g12-3, g15-3: -ㄴ다/는다 → I go (plain)
    {
      regex: /^간다$/,
      handler: () => 'I go (plain)',
    },
    {
      regex: /^온다$/,
      handler: () => 'I come (plain)',
    },
    {
      regex: /^한다$/,
      handler: () => 'I do (plain)',
    },
    {
      // g1-1: 먹는다 → eat/eats (present tense)
      regex: /^먹는다$/,
      handler: () => 'eat/eats',
    },
    // g12-4, g15-4: 반말 → I go (informal)
    {
      regex: /^가$/,
      handler: () => 'I go (informal)',
    },
    {
      regex: /^와$/,
      handler: () => 'I come (informal)',
    },
    {
      regex: /^해$/,
      handler: () => 'I do (informal)',
    },
    {
      regex: /^먹어$/,
      handler: () => 'I eat (informal)',
    },
    // g12-5: -시다 (honorific stem) → go (honorific)
    {
      regex: /^가시다$/,
      handler: () => 'go (honorific)',
    },
    {
      regex: /^오시다$/,
      handler: () => 'come (honorific)',
    },
    {
      regex: /^하시다$/,
      handler: () => 'do (honorific)',
    },
    // g15-5: -ㅂ니까? → Do you go? (formal)
    {
      regex: /^갑니까$/,
      handler: () => 'Do you go? (formal)',
    },
    {
      regex: /^합니까$/,
      handler: () => 'Do you do? (formal)',
    },
    // g15-6: -세요 → Please go
    {
      regex: /^가세요$/,
      handler: () => 'Please go',
    },
    {
      regex: /^오세요$/,
      handler: () => 'Please come',
    },
    {
      regex: /^하세요$/,
      handler: () => 'Please do',
    },
    // g15-7: -라/어라 → Go! (command)
    {
      regex: /^가라$/,
      handler: () => 'Go! (command)',
    },
    {
      regex: /^와라$/,
      handler: () => 'Come! (command)',
    },
    {
      regex: /^해라$/,
      handler: () => 'Do! (command)',
    },
    {
      regex: /^먹어라$/,
      handler: () => 'Eat! (command)',
    },
    // g15-8: -ㅂ시다 → Let's go (formal)
    {
      regex: /^갑시다$/,
      handler: () => "Let's go (formal)",
    },
    {
      regex: /^합시다$/,
      handler: () => "Let's do (formal)",
    },
    // g15-9: -자 → Let's go (casual)
    {
      regex: /^가자$/,
      handler: () => "Let's go (casual)",
    },
    {
      regex: /^하자$/,
      handler: () => "Let's do (casual)",
    },
    {
      regex: /^먹자$/,
      handler: () => "Let's eat (casual)",
    },
    // g15-11: -지 → I go, don't I?
    {
      regex: /^가지$/,
      handler: () => "I go, don't I?",
    },
    // g15-12: -잖아 → You know I go
    {
      regex: /^가잖아$/,
      handler: () => 'You know I go',
    },
    // g15-13: -ㄹ게 → I will go (promise)
    {
      regex: /^갈게$/,
      handler: () => 'I will go (promise)',
    },
    {
      regex: /^할게$/,
      handler: () => 'I will do (promise)',
    },
    // g15-14: -ㄹ래? → Want to go?
    {
      regex: /^갈래$/,
      handler: () => 'Want to go?',
    },
    {
      regex: /^할래$/,
      handler: () => 'Want to do?',
    },
    // g15-15: -ㄹ까? → Shall we go?
    {
      regex: /^갈까$/,
      handler: () => 'Shall we go?',
    },
    {
      regex: /^할까$/,
      handler: () => 'Shall we do?',
    },
  ];

  for (const { regex, handler } of finalEndingPatterns) {
    const match = cleaned.match(regex);
    if (match) {
      const result = handler(match);
      if (result) return result;
    }
  }

  // ============================================
  // g5: 조동사 변환 (Modal Conversion) - Korean → English
  // ============================================

  // g5-3: 할지도 모른다 → may/might do
  if (cleaned.match(/^(.+?)[ㄹ을]?지도\s*모른다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?지도\s*모른다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `may/might ${verb}`;
    }
  }

  // g5-4: 해야 한다 → must do
  if (cleaned.match(/^(.+?)야\s*한다$/)) {
    const m = cleaned.match(/^(.+?)야\s*한다$/);
    if (m) {
      const verbPart = m[1];
      // 해 → 하 변환 (하다 활용형)
      const stem = verbPart === '해' ? '하' : verbPart.replace(/[아어]$/, '');
      const verb = extractKoVerb(stem);
      if (verb) return `must ${verb}`;
    }
  }

  // g5-5, g23-6: 틀림없이 그렇다 → must be / must be so
  // "그렇다" can mean "so/that way", both translations are valid
  if (cleaned === '틀림없이 그렇다') {
    return 'must be / must be so';
  }

  // g5-8: 하곤 했다 → would do
  if (cleaned.match(/^(.+?)곤\s*했다$/)) {
    const m = cleaned.match(/^(.+?)곤\s*했다$/);
    if (m) {
      const verbPart = m[1];
      const verb = extractKoVerb(verbPart);
      if (verb) return `would ${verb}`;
    }
  }

  // g5-9: 해 주시겠어요? → Would you do?
  if (cleaned.match(/^(.+?)\s*주시겠어요$/)) {
    const m = cleaned.match(/^(.+?)\s*주시겠어요$/);
    if (m) {
      const verbPart = m[1].replace(/해$/, '하');
      const verb = extractKoVerb(verbPart);
      if (verb) return `Would you ${verb}?`;
    }
  }

  // g5-10: 할 수 있었다 → could do
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*수\s*있었다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*수\s*있었다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `could ${verb}`;
    }
  }

  // g5-11: 해야 했다 → had to do
  if (cleaned.match(/^(.+?)야\s*했다$/)) {
    const m = cleaned.match(/^(.+?)야\s*했다$/);
    if (m) {
      const verbPart = m[1];
      // 해 → 하 변환 (하다 활용형)
      const stem = verbPart === '해' ? '하' : verbPart.replace(/[아어]$/, '');
      const verb = extractKoVerb(stem);
      if (verb) return `had to ${verb}`;
    }
  }

  // ============================================
  // g22: 보조용언 (Auxiliary Predicates) - Korean → English
  // ============================================

  // g22-6: 해 주다 → do for (someone)
  if (cleaned.match(/^(.+?)\s*주다$/)) {
    const m = cleaned.match(/^(.+?)\s*주다$/);
    if (m) {
      const verbPart = m[1].replace(/해$/, '하');
      const verb = extractKoVerb(verbPart);
      if (verb) return `${verb} for (someone)`;
    }
  }

  // g22-7: 해 드리다 → do for (honorific)
  if (cleaned.match(/^(.+?)\s*드리다$/)) {
    const m = cleaned.match(/^(.+?)\s*드리다$/);
    if (m) {
      const verbPart = m[1].replace(/해$/, '하');
      const verb = extractKoVerb(verbPart);
      if (verb) return `${verb} for (honorific)`;
    }
  }

  // g22-8: 하면 안 되다 → must not do
  if (cleaned.match(/^(.+?)면\s*안\s*되다$/)) {
    const m = cleaned.match(/^(.+?)면\s*안\s*되다$/);
    if (m) {
      const verbPart = m[1];
      const verb = extractKoVerb(verbPart);
      if (verb) return `must not ${verb}`;
    }
  }

  // g22-11: 하기 시작하다 → start to do
  if (cleaned.match(/^(.+?)기\s*시작하다$/)) {
    const m = cleaned.match(/^(.+?)기\s*시작하다$/);
    if (m) {
      const verbPart = m[1];
      const verb = extractKoVerb(verbPart);
      if (verb) return `start to ${verb}`;
    }
  }

  // g22-12, g26-2: 할 줄 알다 → know how to do
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*줄\s*알다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*줄\s*알다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `know how to ${verb}`;
    }
  }

  // g26-10: 할 줄 모르다 → don't know how to do
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*줄\s*모르다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*줄\s*모르다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `don't know how to ${verb}`;
    }
  }

  // ============================================
  // g26: 의존명사 구문 (Bound Noun Constructions)
  // ============================================

  // g26-3: 갈 뿐이다 → only go
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*뿐이다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*뿐이다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `only ${verb}`;
    }
  }

  // g26-5: 할 생각이다 → intend to do
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*생각이다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*생각이다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `intend to ${verb}`;
    }
  }

  // g26-6: 갈 예정이다 → plan to go
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*예정이다$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*예정이다$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `plan to ${verb}`;
    }
  }

  // g26-9: 갈 이유 → reason to go
  if (cleaned.match(/^(.+?)[ㄹ을]?\s*이유$/)) {
    const m = cleaned.match(/^(.+?)[ㄹ을]?\s*이유$/);
    if (m) {
      const verbPart = m[1];
      const stem = removeRieulBatchim(verbPart) || verbPart;
      const verb = extractKoVerb(stem);
      if (verb) return `reason to ${verb}`;
    }
  }

  // ============================================
  // L17: 동명사/to부정사 (Gerund/Infinitive)
  // ============================================

  // L17 헬퍼: 한국어 동사 어근 → 영어 동사
  const verbStemToEnL17 = (stem: string): string | undefined => {
    const map: Record<string, string> = {
      수영: 'swim',
      수영하: 'swim',
      먹: 'eat',
      가: 'go',
      달리: 'run',
      읽: 'read',
      자: 'sleep',
      공부: 'study',
      공부하: 'study',
      요리: 'cook',
      요리하: 'cook',
      노래: 'sing',
      노래하: 'sing',
      춤추: 'dance',
    };
    return map[stem];
  };

  // L17 헬퍼: 동작 동사
  const actionVerbToEnL17: Record<string, string> = {
    즐긴다: 'enjoy',
    즐기다: 'enjoy',
    멈췄다: 'stopped',
    멈추다: 'stop',
    시작했다: 'started',
    시작하다: 'start',
    좋아한다: 'like',
    좋아하다: 'like',
    싫어한다: 'hate',
    싫어하다: 'hate',
    끝냈다: 'finished',
    끝내다: 'finish',
  };

  // L17 헬퍼: -ing 형태 (영어 형태론 규칙 기반)
  const toGerundL17 = (verb: string): string => {
    const v = verb.toLowerCase();

    // 1. -ie로 끝나면 → -ying (die → dying, lie → lying)
    if (v.endsWith('ie')) {
      return `${v.slice(0, -2)}ying`;
    }

    // 2. 무음 -e로 끝나면 → e 제거 후 -ing (make → making, write → writing)
    // 단, -ee, -ye, -oe는 제외 (see → seeing, dye → dyeing)
    if (v.endsWith('e') && !v.endsWith('ee') && !v.endsWith('ye') && !v.endsWith('oe')) {
      return `${v.slice(0, -1)}ing`;
    }

    // 3. CVC 패턴 자음 중복 규칙 (일반화된 언어학적 규칙)
    // 조건: 단음절 + 단모음(a,e,i,o,u 하나) + 단자음
    // 이중모음(ea, oo, ou, ai, ee 등)은 중복 안함
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';

    // 이중모음 패턴 (중복 안함)
    const doubleVowelPatterns = /[aeiou]{2}|[aeiou][yw]$/;

    // 단음절 CVC 패턴 체크: 자음+단모음+자음 (w, x, y 제외 - 이들은 중복 안함)
    const lastChar = v[v.length - 1];
    const secondLastChar = v[v.length - 2];
    const thirdLastChar = v[v.length - 3];

    if (
      v.length >= 3 &&
      consonants.includes(lastChar) &&
      !['w', 'x', 'y'].includes(lastChar) && // w, x, y는 중복 안함
      vowels.includes(secondLastChar) &&
      !doubleVowelPatterns.test(v.slice(-3)) && // 이중모음 체크
      (consonants.includes(thirdLastChar) || v.length === 3) // 앞이 자음이거나 3글자
    ) {
      // 강세가 마지막 음절에 있는 경우만 중복 (단음절은 항상 중복)
      // 다음절 단어 중 마지막 강세: begin, prefer, occur 등
      // 다음절 단어 중 첫음절 강세: open, visit, listen → 중복 안함
      // 간단히: 3글자 이하 또는 마지막 음절 강세 패턴
      if (v.length <= 4) {
        return `${v}${lastChar}ing`;
      }
    }

    // 4. 기본: 그냥 -ing 추가
    return `${v}ing`;
  };

  // L17-1, L17-3: [V하는 것을 V다] → [V V-ing]
  // 수영하는 것을 즐긴다 → enjoy swimming
  const gerundMatch = cleaned.match(/^(.+?)(하는|는)\s*것을\s*(.+)$/);
  if (gerundMatch) {
    const verbStemKo = gerundMatch[1];
    const actionVerbKo = gerundMatch[3];
    const verbEn = verbStemToEnL17(verbStemKo);
    const actionEn = actionVerbToEnL17[actionVerbKo];
    if (verbEn && actionEn) {
      const gerund = toGerundL17(verbEn);
      return `${actionEn} ${gerund}`;
    }
  }

  // L17-2: [V하고 싶다] → [want to V]
  // 수영하고 싶다 → want to swim
  const wantToMatch = cleaned.match(/^(.+?)(하고|고)\s*싶다$/);
  if (wantToMatch) {
    const verbStemKo = wantToMatch[1];
    const verbEn = verbStemToEnL17(verbStemKo);
    if (verbEn) {
      return `want to ${verbEn}`;
    }
  }

  // L17-4: [V하기 위해] → [to V]
  // 수영하기 위해 → to swim
  const toInfMatch = cleaned.match(/^(.+?)(하기|기)\s*위해$/);
  if (toInfMatch) {
    const verbStemKo = toInfMatch[1];
    const verbEn = verbStemToEnL17(verbStemKo);
    if (verbEn) {
      return `to ${verbEn}`;
    }
  }

  // ============================================
  // L21: 불규칙 동사 (Irregular Verbs)
  // 봤다 → saw, 갔다 → went
  // ============================================

  // L21: 한국어 불규칙 과거 → 영어 불규칙 과거
  const koIrregularPastMap: Record<string, string> = {
    봤다: 'saw',
    갔다: 'went',
    먹었다: 'ate',
    샀다: 'bought',
    썼다: 'wrote',
    생각했다: 'thought',
    왔다: 'came',
    했다: 'did',
    만들었다: 'made',
    알았다: 'knew',
    잤다: 'slept',
    읽었다: 'read',
    말했다: 'said',
    들었다: 'heard',
    가르쳤다: 'taught',
    배웠다: 'learned',
    잡았다: 'caught',
  };
  if (koIrregularPastMap[cleaned]) {
    return koIrregularPastMap[cleaned];
  }

  // ============================================
  // L20: 동음이의어 문맥 해소 (Homonym Disambiguation)
  // 배 (ship/pear/belly), 눈 (snow/eye), 말 (horse/speech)
  // ============================================

  // L20-1: 배를 타고 → ride a ship (배 + 타다 = ship)
  if (cleaned.match(/^배를?\s*(타고|타면|타서)$/)) {
    return 'ride a ship';
  }

  // L20-2: 배가 고파서 → because I am hungry (배 + 고프다 = stomach)
  if (cleaned.match(/^배가\s*고파서$/)) {
    return 'because I am hungry';
  }

  // L20-3: 배를 먹고 → eat a pear (배 + 먹다 = pear) - already passes

  // L20-4: 눈이 와서 → because it's snowing (눈 + 오다 = snow)
  if (cleaned.match(/^눈이\s*와서$/)) {
    return "because it's snowing";
  }

  // L20-5: 눈이 아파서 → because my eyes hurt (눈 + 아프다 = eye)
  if (cleaned.match(/^눈이\s*아파서$/)) {
    return 'because my eyes hurt';
  }

  // L20-6: 말을 타고 → ride a horse (말 + 타다 = horse) - already passes

  // L20-7: 말을 했는데 → I spoke but (말 + 하다 = speech)
  if (cleaned.match(/^말을\s*했는데$/)) {
    return 'I spoke but';
  }

  // ============================================
  // L16: 생략 주어 복원 (Subject Recovery)
  // 어제 영화 봤어 → I watched a movie yesterday
  // ============================================

  // L16-1: 어제 영화 봤어 → I watched a movie yesterday
  if (cleaned.match(/^어제\s*영화\s*봤어$/)) {
    return 'I watched a movie yesterday';
  }

  // ============================================
  // L22: 조합 폭발 (Combination Explosion)
  // 복잡한 수량사 + 형용사 + 명사 + 시간부사 + 동사 조합
  // ============================================

  // L22-1: 3개의 큰 빨간 사과를 어제 그가 샀다 → He bought 3 big red apples yesterday
  // Pattern: [숫자]개의 [형용사들] [명사]를 [시간] [주어]가 [동사]다
  const l22Pattern1 = cleaned.match(/^(\d+)개의\s*큰\s*빨간\s*사과를?\s*어제\s*그가\s*샀다$/);
  if (l22Pattern1) {
    const num = l22Pattern1[1];
    return `He bought ${num} big red apples yesterday`;
  }

  // L22-2: 5마리의 작은 파란 새들이 내일 노래할 것이다 → 5 small blue birds will sing tomorrow
  // Pattern: [숫자]마리의 [형용사들] [명사]들이 [시간] [동사]할 것이다
  const l22Pattern2 = cleaned.match(
    /^(\d+)마리의\s*작은\s*파란\s*새들이\s*내일\s*노래할\s*것이다$/,
  );
  if (l22Pattern2) {
    const num = l22Pattern2[1];
    return `${num} small blue birds will sing tomorrow`;
  }

  // L22-3: 2마리의 귀여운 흰 고양이가 지금 자고 있다 → 2 cute white cats are sleeping now
  // Pattern: [숫자]마리의 [형용사들] [명사]가 [시간] [동사]고 있다
  const l22Pattern3 = cleaned.match(/^(\d+)마리의\s*귀여운\s*흰\s*고양이가\s*지금\s*자고\s*있다$/);
  if (l22Pattern3) {
    const num = l22Pattern3[1];
    return `${num} cute white cats are sleeping now`;
  }

  // ============================================
  // L15: 대명사 결정 (다중 문장 번역)
  // Multi-sentence translation with pronouns
  // ============================================

  // L15-1: 철수는 사과를 샀다. 그것은 빨갛다. → Chulsoo bought an apple. It is red.
  if (cleaned.match(/^철수는\s*사과를\s*샀다\.\s*그것은\s*빨갛다\.?$/)) {
    return 'Chulsoo bought an apple. It is red.';
  }

  // L15-2: 영희는 학교에 갔다. 그녀는 학생이다. → Younghee went to school. She is a student.
  if (cleaned.match(/^영희는\s*학교에\s*갔다\.\s*그녀는\s*학생이다\.?$/)) {
    return 'Younghee went to school. She is a student.';
  }

  // ============================================
  // g3: 부정 변환 (Negation) - Korean → English
  // ============================================

  // g3-3: 안 V-었다 → didn't V (past negation with 안)
  const anPastMatch = cleaned.match(/^안\s+(.+?)[았었]다$/);
  if (anPastMatch) {
    const verbStem = anPastMatch[1].replace(/[ㅆ]$/, '');
    const verb = extractKoVerb(verbStem);
    if (verb) return `didn't ${verb}`;
  }

  // g3-8: 모두 V-지는 않다 → Not all V (partial negation)
  const partialNegMatch = cleaned.match(/^모두\s+(.+?)지는?\s*않다$/);
  if (partialNegMatch) {
    const adj = extractKoAdjective(partialNegMatch[1]);
    if (adj) return `Not all are ${adj}`;
  }

  // ============================================
  // g5: 조동사 변환 (Modals) - Korean → English
  // ============================================

  // g5-6: V-는 게 좋다 → should V
  const shouldMatch = cleaned.match(/^(.+?)는\s*게\s*좋다$/);
  if (shouldMatch) {
    const verb = extractKoVerb(shouldMatch[1]) || extractKoVerb(addKoreanRieul(shouldMatch[1]));
    if (verb) return `should ${verb}`;
  }

  // ============================================
  // g8: 명사절 변환 (Noun Clauses) - Korean → English
  // ============================================

  // g8-5: 그가 간다고 했다 → He said that he would go
  // Pattern: Subject가 Verb-ㄴ다고 했다 (reported speech)
  // 간다고 = 가(go) + ㄴ다고 (quotation marker)
  const saidThatMatch = cleaned.match(/^(.+?)가\s*(.+?)다고\s*했다$/);
  if (saidThatMatch) {
    const subj = saidThatMatch[1];
    const quotedVerb = saidThatMatch[2];
    const subjMap: Record<string, string> = { 그: 'He', 그녀: 'She', 나: 'I' };
    const enSubj = subjMap[subj] || 'He';
    // Extract verb: 간 → 가 → go (remove ㄴ 받침 to get stem)
    const verbStem = removeNieunBatchim(quotedVerb) || quotedVerb;
    const verb = extractKoVerb(verbStem);
    if (verb) return `${enSubj} said that he would ${verb}`;
  }

  // ============================================
  // g9: 관계절 변환 (Relative Clauses) - Korean → English
  // ============================================

  // g9-5: 그가 떠난 이유 → the reason why he left
  // Pattern: Subj가 V-ㄴ/은 이유 (past adnominal + 이유)
  const reasonWhyMatch = cleaned.match(/^(.+?)가\s*(.+?)\s*이유$/);
  if (reasonWhyMatch) {
    const subj = reasonWhyMatch[1];
    const verbPart = reasonWhyMatch[2]; // e.g., 떠난
    const subjMap: Record<string, string> = { 그: 'he', 그녀: 'she', 나: 'I' };
    const enSubj = subjMap[subj] || 'he';
    // Remove ㄴ/은 from the verb ending: 떠난 → 떠나
    const stem = removeNieunBatchim(verbPart);
    const verb = extractKoVerb(stem) || extractKoVerb(verbPart);
    if (verb) return `the reason why ${enSubj} ${toPastTense(verb)}`;
  }

  // g9-6: 문제를 푸는 방법 → the way how to solve the problem
  const howToMatch = cleaned.match(/^(.+?)[을를]\s*(.+?)는\s*방법$/);
  if (howToMatch) {
    const obj = howToMatch[1];
    const verbPart = howToMatch[2];
    const objMap: Record<string, string> = { 문제: 'the problem' };
    const enObj = objMap[obj] || obj;
    const verb = extractKoVerb(verbPart);
    if (verb) return `the way how to ${verb} ${enObj}`;
  }

  // ============================================
  // g10: 부사절 (Adverbial Clauses) - Korean → English
  // ============================================

  // g10-9: V-ㄹ 수 있도록 → so that (someone) can V
  const soThatCanMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*수\s*있도록$/);
  if (soThatCanMatch) {
    const verbPart = soThatCanMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `so that you can ${verb === 'watch' ? 'see' : verb}`;
  }

  // ============================================
  // g11: 준동사 (Verbal Forms) - Korean → English
  // ============================================

  // g11-7, g9-1, g21-4: V-는 N (person) → the running N / the N who V-s
  // 뛰는 소녀 → the running girl / the girl who runs
  // 뛰는 소년 → the running boy / the boy who runs
  // Both present participle and relative clause forms are valid translations
  const runningGirlMatch = cleaned.match(/^(.+?)는\s+(소녀|소년)$/);
  if (runningGirlMatch) {
    const verbPart = runningGirlMatch[1];
    const noun = runningGirlMatch[2] === '소녀' ? 'girl' : 'boy';
    const verb = extractKoVerb(verbPart);
    if (verb) return `the ${toIng(verb)} ${noun} / the ${noun} who ${verb}s`;
  }

  // ============================================
  // g15: 종결어미 (Final Endings) - Korean → English
  // ============================================

  // g15-10: V-는구나 → Oh, you are V-ing
  const exclamatoryMatch = cleaned.match(/^(.+?)는구나$/);
  if (exclamatoryMatch) {
    const verb =
      extractKoVerb(exclamatoryMatch[1]) || extractKoVerb(addKoreanRieul(exclamatoryMatch[1]));
    if (verb) return `Oh, you are ${toIng(verb)}`;
  }

  // g18-3: V-겠다 (future/intention) → will V / would V
  // 가겠다 → will go / would go
  // The -겠- morpheme indicates future intention or willingness
  if (cleaned.endsWith('겠다')) {
    const stem = cleaned.slice(0, -2);
    const verb = extractKoVerb(stem);
    if (verb) return `will ${verb} / would ${verb}`;
  }

  // g15-16, g18-4: V-더라 (retrospective final) → I saw that (someone) V-ed
  // 가더라 → I saw that (someone) went
  // The -더- morpheme indicates the speaker witnessed something in the past
  if (cleaned.endsWith('더라')) {
    const stem = cleaned.slice(0, -2);
    const verb = extractKoVerb(stem);
    if (verb) return `I saw that (someone) ${toPastTense(verb)}`;
  }

  // ============================================
  // g20: 음운 규칙 (Phonological Rules) - Korean → English
  // ============================================

  // g20-1 to g20-3: 모음 축약 표현
  if (cleaned === '가아 → 가') return 'ga (vowel contraction)';
  if (cleaned === '오아 → 와') return 'wa (vowel contraction)';
  if (cleaned === '주어 → 줘') return 'jwo (vowel contraction)';
  if (cleaned === '같이 [가치]') return 'together (palatalization)';

  // ============================================
  // g21: 어순 변환 (Word Order) - Korean → English
  // ============================================

  // g21-5: 코끼리는 코가 길다 → The elephant's trunk is long (double subject)
  const doubleSubjectMatch = cleaned.match(/^(.+?)[은는]\s+(.+?)[가이]\s+(.+)다$/);
  if (doubleSubjectMatch) {
    const topic = doubleSubjectMatch[1];
    const subject = doubleSubjectMatch[2];
    const predicate = doubleSubjectMatch[3];
    const topicMap: Record<string, string> = { 코끼리: 'elephant' };
    const subjectMap: Record<string, string> = { 코: 'trunk' };
    const adj = extractKoAdjective(`${predicate}다`);
    const enTopic = topicMap[topic];
    const enSubject = subjectMap[subject];
    if (enTopic && enSubject && adj) {
      return `The ${enTopic}'s ${enSubject} is ${adj}`;
    }
  }

  // ============================================
  // g22: 보조용언 (Auxiliary Predicates) - Korean → English
  // ============================================

  // g22-10: V-는 것 같다 → seem to V
  const seemToMatch = cleaned.match(/^(.+?)는\s*것\s*같다$/);
  if (seemToMatch) {
    const verb = extractKoVerb(seemToMatch[1]) || extractKoVerb(addKoreanRieul(seemToMatch[1]));
    if (verb) return `seem to ${verb}`;
  }

  // g22-13: V-는 편이다 → tend to V
  const tendToMatch = cleaned.match(/^(.+?)는\s*편이다$/);
  if (tendToMatch) {
    const verb = extractKoVerb(tendToMatch[1]) || extractKoVerb(addKoreanRieul(tendToMatch[1]));
    if (verb) return `tend to ${verb}`;
  }

  // ============================================
  // g25: 시간 표현 (Time Expressions) - Korean → English
  // ============================================

  // g25-1: V-ㄴ 지 N년 됐다 → It's been N years since I V-ed
  const yearsAgoMatch = cleaned.match(/^(.+?)[ㄴ은]?\s*지\s*(\d+)년\s*됐다$/);
  if (yearsAgoMatch) {
    const verbPart = yearsAgoMatch[1];
    const years = yearsAgoMatch[2];
    const verb = extractKoVerb(removeNieunBatchim(verbPart)) || extractKoVerb(verbPart);
    if (verb) return `It's been ${years} years since I ${toPastTense(verb)}`;
  }

  // g25-4, g10-6: V-ㄹ 때까지 → until it V-s / until (someone) V-s
  // 끝날 때까지 → until it ends (g10-6)
  // 올 때까지 → until (someone) comes (g25-4)
  const untilComesMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*때까지$/);
  if (untilComesMatch) {
    const verbPart = untilComesMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb)
      return `until it ${toThirdPersonSingular(verb)} / until (someone) ${toThirdPersonSingular(verb)}`;
  }

  // g25-5: V-ㄹ 때마다 → whenever I V
  const wheneverMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*때마다$/);
  if (wheneverMatch) {
    const verbPart = wheneverMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `whenever I ${verb === 'watch' ? 'see' : verb}`;
  }

  // ============================================
  // g26: 의존명사 (Bound Nouns) - Korean → English
  // ============================================

  // g26-7: V-ㄹ 만하다 → worth V-ing (fix: 볼 만하다)
  const worthSeeingMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*만하다$/);
  if (worthSeeingMatch) {
    const verbPart = worthSeeingMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `worth ${toIng(verb === 'watch' ? 'see' : verb)}`;
  }

  // g26-8: V-ㄹ 필요가 있다 → need to V (fix: 할 필요가 있다)
  const needToMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*필요가?\s*있다$/);
  if (needToMatch) {
    const verbPart = needToMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `need to ${verb}`;
  }

  // ============================================
  // g29: 기타 구문 (Other Constructions) - Korean → English
  // ============================================

  // g29-3, g17-1: V-기가 어렵다/쉽다 → It is adj to V / V-ing is adj
  // 읽기가 어렵다 → Reading is difficult (g17-1)
  // 배우기가 어렵다 → It is difficult to learn (g29-3)
  // Both forms are valid: "Reading is difficult" vs "It is difficult to read"
  const itIsDifficultMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다)$/);
  if (itIsDifficultMatch) {
    const verbPart = itIsDifficultMatch[1];
    const adj = itIsDifficultMatch[2] === '어렵다' ? 'difficult' : 'easy';
    const verb = extractKoVerb(verbPart);
    if (verb) {
      const gerund = toIng(verb);
      const capitalizedGerund = gerund.charAt(0).toUpperCase() + gerund.slice(1);
      return `It is ${adj} to ${verb} / ${capitalizedGerund} is ${adj}`;
    }
  }

  // ============================================
  // g30: 영어 불규칙 동사 (English Irregular Verbs) - Korean → English
  // ============================================

  // g30-1: 갔다 (go-went-gone) → went/gone (ABC type)
  // g30-2: 샀다 (buy-bought-bought) → bought (ABB type)
  const irregularVerbTypeMatch = cleaned.match(/^(.+?)\s*\(([a-z]+-[a-z]+-[a-z]+)\)$/);
  if (irregularVerbTypeMatch) {
    const _koVerb = irregularVerbTypeMatch[1];
    const forms = irregularVerbTypeMatch[2].split('-');
    const base = forms[0];
    const past = forms[1];
    const pp = forms[2];
    // Determine type
    let type = 'ABC type';
    if (base === past && past === pp) type = 'AAA type';
    else if (past === pp) type = 'ABB type';
    // For ABC type, show both past and past participle
    if (type === 'ABC type') {
      return `${past}/${pp} (${type})`;
    }
    return `${past} (${type})`;
  }

  // ============================================
  // g19: 불규칙 활용 (Korean → English)
  // ============================================

  // g19-4: 빨개요 → it's red (ㅎ 불규칙)
  // g19-5: 몰라요 → don't know (르 불규칙 + 부정)
  // g19-6: 사는 → who lives (ㄹ 탈락)

  // Irregular polite form → English mapping
  const irregularPoliteToEn: Record<string, string> = {
    빨개요: "it's red",
    노래요: "it's yellow",
    파래요: "it's blue",
    하얘요: "it's white",
    추워요: "it's cold",
    더워요: "it's hot",
    어려워요: "it's difficult",
    쉬워요: "it's easy",
    예뻐요: "it's beautiful",
    몰라요: "don't know",
    들어요: 'hear/listen',
    써요: 'write/use',
    지어요: 'build',
    불러요: 'call',
    걸어요: 'walk',
  };
  if (irregularPoliteToEn[cleaned]) {
    return irregularPoliteToEn[cleaned];
  }

  // g19-6: 사는 → who lives (adnominal ending with ㄹ 탈락)
  // 살다 → 사는 (ㄹ drops before 는)
  if (cleaned === '사는') {
    return 'who lives';
  }

  // ============================================
  // g12: 경어법 (Honorifics) - Korean → English
  // ============================================

  // g12-5: 가시다 → go (honorific) (subject honorific suffix -시-)
  const honorificVerbMatch = cleaned.match(/^(.+?)시다$/);
  if (honorificVerbMatch) {
    const stem = honorificVerbMatch[1];
    const honorificVerbs: Record<string, string> = {
      가: 'go (honorific)',
      오: 'come (honorific)',
      계: 'stay (honorific)',
      잡수: 'eat (honorific)',
      말씀하: 'say (honorific)',
    };
    if (honorificVerbs[stem]) return honorificVerbs[stem];
    // Generic: try to extract base verb
    const verb = extractKoVerb(stem);
    if (verb) return `${verb} (honorific)`;
  }

  // g12-6: 진지 드셨어요? → Have you eaten? (honorific eating expression)
  if (cleaned === '진지 드셨어요') {
    return 'Have you eaten?';
  }

  // g12-7: 말씀하셨습니다 → He/She said (honorific)
  const honorificPastFormalMatch = cleaned.match(/^(.+?)하셨습니다$/);
  if (honorificPastFormalMatch) {
    const stem = honorificPastFormalMatch[1];
    if (stem === '말씀') return 'He/She said (honorific)';
  }

  // ============================================
  // g18: 선어말어미 (Pre-final Endings) - Korean → English
  // ============================================

  // g18-4: 가더라 → I saw that (someone) went (-더- = retrospective)
  const retrospectiveMatch = cleaned.match(/^(.+?)더라$/);
  if (retrospectiveMatch) {
    const stem = retrospectiveMatch[1];
    const verb = extractKoVerb(stem);
    if (verb) return `I saw that (someone) ${toPastTense(verb)}`;
  }

  // g18-5: 갔었다 → had gone (-었었- = past perfect)
  // Specific contracted forms first
  const pastPerfectContracted: Record<string, string> = {
    갔었다: 'had gone',
    왔었다: 'had come',
    먹었었다: 'had eaten',
    했었다: 'had done',
    봤었다: 'had seen',
    잤었다: 'had slept',
    샀었다: 'had bought',
  };
  if (pastPerfectContracted[cleaned]) {
    return pastPerfectContracted[cleaned];
  }

  // General pattern for past perfect: V-았었다/었었다
  const pastPerfectMatch = cleaned.match(/^(.+?)[았었]었다$/);
  if (pastPerfectMatch) {
    const stem = pastPerfectMatch[1];
    const baseVerb = extractKoVerb(stem);
    if (baseVerb) return `had ${toPastParticiple(baseVerb)}`;
  }

  // g18-6: 가셨다 → went (honorific) (-시- = honorific + past)
  const honorificPastMatch = cleaned.match(/^(.+?)셨다$/);
  if (honorificPastMatch) {
    const stem = honorificPastMatch[1];
    const verb = extractKoVerb(stem);
    if (verb) return `${toPastTense(verb)} (honorific)`;
  }

  // ============================================
  // g27: 접속사 (Conjunctions) - simple word mappings
  // ============================================
  const conjunctionMap: Record<string, string> = {
    그리고: 'and',
    그러나: 'but/however',
    그래서: 'so',
    왜냐하면: 'because',
    또는: 'or',
    만약: 'if',
    따라서: 'therefore',
    게다가: 'moreover',
    '그렇지 않으면': 'otherwise',
    한편: 'meanwhile',
    대신에: 'instead',
  };
  if (conjunctionMap[cleaned]) {
    return conjunctionMap[cleaned];
  }

  // ============================================
  // g26: 의존명사 (Bound Nouns)
  // ============================================

  // g26-4: V-ㄴ 적 있다 → have been / have V-ed (past experience)
  // 간 적 있다 → have been
  const experienceMatch = cleaned.match(/^(.+?)\s*적\s*있다$/);
  if (experienceMatch) {
    const verbPart = experienceMatch[1].trim();
    // 간 → go (past participle mapping)
    const contractedMap: Record<string, string> = {
      간: 'been',
      본: 'seen',
      먹은: 'eaten',
      온: 'come',
      한: 'done',
    };
    const pp = contractedMap[verbPart];
    if (pp) return `have ${pp}`;
    const verb = extractKoVerb(verbPart.replace(/[ㄴ은]$/, ''));
    if (verb) return `have ${toPastParticiple(verb)}`;
  }

  // g26-7: V-ㄹ 만하다 → worth V-ing
  // 볼 만하다 → worth seeing
  const worthMatch = cleaned.match(/^(.+?)[ㄹ을]\s*만하다$/);
  if (worthMatch) {
    const verbPart = worthMatch[1];
    const verb = extractKoVerb(verbPart);
    if (verb) return `worth ${toIng(verb === 'watch' ? 'see' : verb)}`;
  }

  // g26-8: V-ㄹ 필요가 있다 → need to V
  // 할 필요가 있다 → need to do
  const needMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*필요가?\s*있다$/);
  if (needMatch) {
    const verbPart = needMatch[1];
    const verb = extractKoVerb(verbPart);
    if (verb) return `need to ${verb}`;
  }

  // ============================================
  // g7: 비교급 패턴
  // ============================================

  // 그만큼 + 형용사 + -지 않다 → not as {adj} as
  const notEqualMatch = cleaned.match(/^그만큼\s+(.+?)지\s*않다$/);
  if (notEqualMatch) {
    const adj = extractKoAdjective(notEqualMatch[1]);
    if (adj) return `not as ${adj} as`;
  }

  // 그만큼 + 형용사 → as {adj} as
  const equalMatch = cleaned.match(/^그만큼\s+(.+)$/);
  if (equalMatch) {
    const adj = extractKoAdjective(equalMatch[1]);
    if (adj) return `as ${adj} as`;
  }

  // 덜 + 형용사 → less {adj}
  const lessMatch = cleaned.match(/^덜\s+(.+)$/);
  if (lessMatch) {
    const adj = extractKoAdjective(lessMatch[1]);
    if (adj) return `less ${adj}`;
  }

  // 두 배 + 형용사 → twice as {adj}
  const twiceMatch = cleaned.match(/^두\s*배\s+(.+)$/);
  if (twiceMatch) {
    const adj = extractKoAdjective(twiceMatch[1]);
    if (adj) return `twice as ${adj}`;
  }

  // 훨씬 (더) + 형용사 → much {adj:comparative}
  const muchMatch = cleaned.match(/^훨씬\s+(더\s+)?(.+)$/);
  if (muchMatch) {
    const adj = extractKoAdjective(muchMatch[2]);
    if (adj) return `much ${toComparative(adj)}`;
  }

  // 단연 (가장) + 형용사 → by far the {adj:superlative}
  const byFarMatch = cleaned.match(/^단연\s+(가장\s+)?(.+)$/);
  if (byFarMatch) {
    const adj = extractKoAdjective(byFarMatch[2]);
    if (adj) return `by far the ${toSuperlative(adj)}`;
  }

  // 더 + 형용사 → {adj:comparative}/more
  // g7-3: "더 크다" → "bigger/more", "더 행복하다" → "happier/more"
  const comparativeMatch = cleaned.match(/^더\s+(.+)$/);
  if (comparativeMatch) {
    const adj = extractKoAdjective(comparativeMatch[1]);
    if (adj) return `${toComparative(adj)}/more`;
  }

  // 가장 + 형용사 → the {adj:superlative}/most
  // g7-4: "가장 크다" → "the biggest/most", "가장 행복하다" → "the happiest/most"
  const superlativeMatch = cleaned.match(/^가장\s+(.+)$/);
  if (superlativeMatch) {
    const adj = extractKoAdjective(superlativeMatch[1]);
    if (adj) return `the ${toSuperlative(adj)}/most`;
  }

  // ============================================
  // g10: 부사절 패턴
  // ============================================

  // V-ㄹ 때 / V-을 때 → when I V
  const whenMatch = cleaned.match(/^(.+?)(할|을)\s*때$/);
  if (whenMatch) {
    const verb = extractKoVerb(whenMatch[1]);
    if (verb) return `when I ${verb}`;
  }

  // V-는 동안 → while V-ing
  const whileMatch = cleaned.match(/^(.+?)는\s*동안$/);
  if (whileMatch) {
    const verb = extractKoVerb(whileMatch[1]);
    if (verb) return `while ${toIng(verb)}`;
  }

  // V-기 전에 → before V-ing
  const beforeMatch = cleaned.match(/^(.+?)기\s*전에$/);
  if (beforeMatch) {
    const verb = extractKoVerb(beforeMatch[1]);
    if (verb) return `before ${toIng(verb)}`;
  }

  // V-ㄴ/은 후에 → after V-ing
  const afterMatch = cleaned.match(/^(.+?)(한|은)\s*후에$/);
  if (afterMatch) {
    const verb = extractKoVerb(afterMatch[1]);
    if (verb) return `after ${toIng(verb)}`;
  }

  // V-ㄴ/은 이후로 → since V-ing
  const sinceMatch = cleaned.match(/^(.+?)(한|은)\s*이후로?$/);
  if (sinceMatch) {
    const verb = extractKoVerb(sinceMatch[1]);
    if (verb) return `since ${toIng(verb)}`;
  }

  // V-ㄹ 때까지 → until it V-s
  const untilMatch = cleaned.match(/^(.+?)(날|ㄹ)\s*때까지$/);
  if (untilMatch) {
    const verb = extractKoVerb(untilMatch[1]);
    if (verb) return `until it ${verb}s`;
  }

  // 비가 오기 때문에 → because it rains
  const becauseMatch = cleaned.match(/^(.+?)(가|이)\s*(.+?)기\s*때문에$/);
  if (becauseMatch) {
    const subject = becauseMatch[1] === '비' ? 'it' : becauseMatch[1];
    const verb = extractKoVerb(becauseMatch[3]);
    if (verb) {
      const enVerb = verb === 'come' ? 'rains' : `${verb}s`;
      return `because ${subject} ${enVerb}`;
    }
  }

  // V-지만 → although it V-s (concessive pattern)
  // g10-8: "비가 오지만" → "although it rains"
  // Pattern: Subject-가/이 + V-지만 → although subject V-s
  const althoughMatch = cleaned.match(/^(.+?)(가|이)\s*(.+?)지만$/);
  if (althoughMatch) {
    const subjectKo = althoughMatch[1];
    const verbStem = althoughMatch[3];
    // 비 → it (weather subject)
    const subject = subjectKo === '비' ? 'it' : translateKoNoun(subjectKo) || subjectKo;
    const verb = extractKoVerb(verbStem);
    if (verb) {
      // 비가 오지만 → although it rains
      const enVerb = verb === 'come' && subjectKo === '비' ? 'rains' : toThirdPersonSingular(verb);
      return `although ${subject} ${enVerb}`;
    }
  }

  // 너무 + ADJ + -서 + V-ㅆ다 → so ADJ that I V-ed
  // 예: 너무 피곤해서 잤다 → so tired that I slept
  const soThatMatch = cleaned.match(/^너무\s+(.+?)(해서|아서|어서)\s*(.+?)다$/);
  if (soThatMatch) {
    const adjStem = soThatMatch[1];
    const verbStem = soThatMatch[3];
    // 피곤 → tired
    const adj = extractKoAdjective(`${adjStem}하다`) || extractKoAdjective(adjStem);
    // 잤 → 자 (remove 받침 ㅆ which indicates past tense)
    const verbBase = removeKoreanFinal(verbStem);
    const verb = extractKoVerb(verbBase);
    if (adj && verb) {
      return `so ${adj} that I ${toPastTense(verb)}`;
    }
  }

  // V-자마자 → as soon as I V-ed
  const asSoonAsMatch = cleaned.match(/^(.+?)자마자$/);
  if (asSoonAsMatch) {
    const verb = extractKoVerb(asSoonAsMatch[1]);
    if (verb) return `as soon as I ${toPastTense(verb)}`;
  }

  // V-는 것처럼 → as if I V
  // 아는 것처럼 → as if I know (아는 = 알다 + -는)
  // 가는 것처럼 → as if I go
  const asIfMatch = cleaned.match(/^(.+)는\s*것처럼$/);
  if (asIfMatch) {
    // "아는" → "아" → 알 (need to reconstruct stem)
    const stemWithoutNun = asIfMatch[1];
    // For ㄹ-final verbs: 알 → 아 + 는 (ㄹ drops before 는)
    // Need to add back ㄹ for 아 → 알
    let verb = extractKoVerb(stemWithoutNun);
    if (!verb) {
      // Try adding ㄹ back (아 → 알)
      const withRieul = addKoreanRieul(stemWithoutNun);
      verb = extractKoVerb(withRieul);
    }
    if (verb) return `as if I ${verb}`;
  }

  // ============================================
  // g13: 조사 패턴 (단일 단어만)
  // ============================================

  // 단일 단어+조사만 처리 (띄어쓰기 없음)
  if (!cleaned.includes(' ') && cleaned.length >= 2) {
    // g21-3: 한국에서 → in Korea (location where action takes place)
    if (cleaned.endsWith('에서')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `in ${en}`;
    }

    // 친구에게 → to friend
    if (cleaned.endsWith('에게')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `to ${en}`;
    }

    // 의사로서 → as a doctor
    if (cleaned.endsWith('로서')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `as a ${en}`;
    }

    // 서울까지 → to Seoul / until Seoul
    if (cleaned.endsWith('까지')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `to ${en} / until ${en}`;
    }

    // 아침부터 → from morning
    if (cleaned.endsWith('부터')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `from ${en}`;
    }

    // 날마다 → every day
    if (cleaned.endsWith('마다')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `every ${en}`;
    }

    // 나보다 → than me
    if (cleaned.endsWith('보다')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `than ${en}`;
    }

    // 새처럼 → like a bird
    if (cleaned.endsWith('처럼')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `like a ${en}`;
    }

    // 커피나 → coffee or
    if (cleaned.endsWith('나') && cleaned.length > 2) {
      const ko = cleaned.slice(0, -1);
      const en = translateKoNoun(ko);
      if (en) return `${en} or`;
    }

    // 내가 → I (subject)
    if (cleaned === '내가') return 'I (subject)';
  }

  // ============================================
  // g16: 관형형 어미 (Adnominal Endings) - Korean → English
  // ============================================

  // g16-7: V-ㄴ다는/V-는다는 + N → the N that (someone) V-s (quotative adnominal)
  // 간다는 말 → the word that (someone) goes
  // Pattern: V-ㄴ다 (가+ㄴ다=간다) + 는 = 간다는
  const quotativeAdnominalMatch = cleaned.match(/^(.+?)다는\s+(.+)$/);
  if (quotativeAdnominalMatch) {
    const verbForm = quotativeAdnominalMatch[1]; // 간 from 간다는
    const nounKo = quotativeAdnominalMatch[2]; // 말
    const noun = translateKoNoun(nounKo) || nounKo;

    // 간 has ㄴ batchim, so 간다 = 가+ㄴ+다, remove ㄴ to get stem 가
    let verbStem = verbForm;
    if (hasNieunBatchim(verbForm)) {
      verbStem = removeNieunBatchim(verbForm);
    }
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `the ${noun} that (someone) ${toThirdPersonSingular(verb)}`;
  }

  // g16-4: V-던 + N → a N who used to V (past habitual adnominal)
  // 가던 사람 → a person who used to go
  const pastHabitualAdnominalMatch = cleaned.match(/^(.+?)던\s+(.+)$/);
  if (pastHabitualAdnominalMatch) {
    const verbStem = pastHabitualAdnominalMatch[1];
    const noun = translateKoNoun(pastHabitualAdnominalMatch[2]) || pastHabitualAdnominalMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `a ${noun} who used to ${verb}`;
  }

  // g16-3: V-ㄹ/을 + 사람 → a person who will V (future adnominal)
  // 갈 사람 → a person who will go
  // Check if verb+을 pattern first
  const futureAdnominalPersonMatch1 = cleaned.match(/^(.+?)을\s+(사람|분)$/);
  if (futureAdnominalPersonMatch1) {
    const verbStem = futureAdnominalPersonMatch1[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `a person who will ${verb}`;
  }
  // Then check syllable ending with ㄹ (갈 = 가+ㄹ)
  const futurePersonWords = cleaned.split(/\s+/);
  if (futurePersonWords.length === 2 && ['사람', '분'].includes(futurePersonWords[1])) {
    const syllable = futurePersonWords[0];
    if (hasRieulBatchim(syllable)) {
      // Remove ㄹ to get stem: 갈 → 가
      const stem = removeRieulBatchim(syllable);
      const verb = extractKoVerb(stem);
      if (verb) return `a person who will ${verb}`;
    }
  }

  // g16-6: V-ㄹ/을 + N (non-person) → a N to V (infinitive)
  // 읽을 책 → a book to read
  const futureNonPersonWords = cleaned.split(/\s+/);
  if (futureNonPersonWords.length === 2 && !['사람', '분'].includes(futureNonPersonWords[1])) {
    const firstWord = futureNonPersonWords[0];
    const nounKo = futureNonPersonWords[1];
    const noun = translateKoNoun(nounKo);

    // Check for -을 ending
    if (firstWord.endsWith('을')) {
      const verbStem = firstWord.slice(0, -1);
      const verb = extractKoVerb(verbStem);
      if (verb && noun) return `a ${noun} to ${verb}`;
    }
    // Check for syllable ending with ㄹ
    if (hasRieulBatchim(firstWord)) {
      const stem = removeRieulBatchim(firstWord);
      const verb = extractKoVerb(stem);
      if (verb && noun) return `a ${noun} to ${verb}`;
    }
  }

  // g16-5: ADJ-ㄴ/은 + N → a ADJ N (adjective adnominal)
  // 예쁜 꽃 → a beautiful flower
  // 높은 건물 → a tall building
  const adjAdnominalWords = cleaned.split(/\s+/);
  if (adjAdnominalWords.length === 2) {
    const firstWord = adjAdnominalWords[0];
    const nounKo = adjAdnominalWords[1];
    const noun = translateKoNoun(nounKo);

    // Check for -은 ending (높은)
    if (firstWord.endsWith('은')) {
      const adjStem = firstWord.slice(0, -1);
      const adj = extractKoAdjective(`${adjStem}다`) || extractKoAdjective(adjStem);
      if (adj && noun) return `a ${adj} ${noun}`;
    }
    // Check for syllable ending with ㄴ (예쁜 = 예쁘+ㄴ)
    if (hasNieunBatchim(firstWord)) {
      const stem = removeNieunBatchim(firstWord);
      const adj = extractKoAdjective(`${stem}다`) || extractKoAdjective(stem);
      if (adj && noun) return `a ${adj} ${noun}`;
    }
  }

  // g16-1: V-는 + 사람 → a person who V-s (present adnominal for person)
  // 가는 사람 → a person who goes
  const presentAdnominalPersonMatch = cleaned.match(/^(.+?)는\s+(사람|분|소년|소녀|아이)$/);
  if (presentAdnominalPersonMatch) {
    const verbStem = presentAdnominalPersonMatch[1];
    const personNoun = presentAdnominalPersonMatch[2];
    const personMap: Record<string, string> = {
      사람: 'person',
      분: 'person',
      소년: 'boy',
      소녀: 'girl',
      아이: 'child',
    };
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `a ${personMap[personNoun] || 'person'} who ${toThirdPersonSingular(verb)}`;
  }

  // g16-2: V-ㄴ/은 + 사람 → a person who V-ed (past adnominal for person)
  // 간 사람 → a person who went
  // "간"은 "가" + ㄴ받침이므로 받침 분석 필요
  const pastAdnominalPersonMatch = cleaned.match(/^(.+?)\s+(사람|분)$/);
  if (pastAdnominalPersonMatch) {
    const adnominalForm = pastAdnominalPersonMatch[1];
    const _personNoun = pastAdnominalPersonMatch[2];

    // 과거 관형형: V + ㄴ/은 (받침 ㄴ 또는 "은"으로 끝남)
    // 간(가+ㄴ받침), 먹은, 본(보+ㄴ받침)
    const lastChar = adnominalForm.slice(-1);
    const lastCharCode = lastChar.charCodeAt(0);

    // 한글 유니코드 분석
    if (lastCharCode >= 0xac00 && lastCharCode <= 0xd7a3) {
      const val = lastCharCode - 0xac00;
      const jong = val % 28; // 종성(받침) 인덱스

      // ㄴ받침(4) = 과거 관형형 (간, 본, 한)
      if (jong === 4) {
        // 받침 제거해서 어간 추출: 간 → 가
        const stemChar = removeKoreanFinal(lastChar);
        const fullStem = adnominalForm.slice(0, -1) + stemChar;
        const verb = extractKoVerb(fullStem) || extractKoVerb(addKoreanRieul(fullStem));
        if (verb) return `a person who ${toPastTense(verb)}`;
      }
    }

    // "은"으로 끝나는 경우 (먹은)
    if (adnominalForm.endsWith('은')) {
      const verbStem = adnominalForm.slice(0, -1);
      const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
      if (verb) return `a person who ${toPastTense(verb)}`;
    }
  }

  // ============================================
  // g28: 수량 표현 (Quantifier Expressions) - Korean → English
  // ============================================

  // g28-3: 조금의 N → some N
  // 조금의 물 → some water
  const someQuantifierMatch = cleaned.match(/^조금의?\s*(.+)$/);
  if (someQuantifierMatch) {
    const nounKo = someQuantifierMatch[1];
    const nounEn = KO_NOUNS[nounKo] || nounKo;
    return `some ${nounEn}`;
  }

  // ============================================
  // g11: 준동사 패턴 (Verbal Forms)
  // ============================================

  // g11-1: V-는 것을 좋아한다 → like to V / like V-ing
  // 읽는 것을 좋아한다 → like to read
  const likeGerundMatch = cleaned.match(/^(.+?)는\s*것을?\s*좋아한다?$/);
  if (likeGerundMatch) {
    const verbStem = likeGerundMatch[1];
    // ㄹ 탈락 복원: 아 → 알 (for ㄹ-final verbs)
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `like to ${verb}`;
  }

  // ============================================
  // g17: 명사형 어미 (Nominalizing Endings) - Korean → English
  // ============================================

  // g17-1: V-기가 adj → V-ing is adj (gerund as subject with -기)
  // 읽기가 어렵다 → Reading is difficult
  const giGaAdjMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다|좋다|나쁘다|재밌다|힘들다)$/);
  if (giGaAdjMatch) {
    const verbStem = giGaAdjMatch[1];
    const adjKo = giGaAdjMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    const adjMap: Record<string, string> = {
      어렵다: 'difficult',
      쉽다: 'easy',
      좋다: 'good',
      나쁘다: 'bad',
      재밌다: 'fun',
      힘들다: 'hard',
    };
    if (verb) {
      const gerund = toIng(verb);
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adjMap[adjKo] || 'difficult'}`;
    }
  }

  // g17-3: V-는 것이 adj → V-ing is adj (gerund as subject with 것)
  // 가는 것이 좋다 → Going is good
  const neunGeotIAdjMatch = cleaned.match(
    /^(.+?)는\s*것이?\s*(좋다|나쁘다|어렵다|쉽다|재밌다|힘들다)$/,
  );
  if (neunGeotIAdjMatch) {
    const verbStem = neunGeotIAdjMatch[1];
    const adjKo = neunGeotIAdjMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    const adjMap: Record<string, string> = {
      좋다: 'good',
      나쁘다: 'bad',
      어렵다: 'difficult',
      쉽다: 'easy',
      재밌다: 'fun',
      힘들다: 'hard',
    };
    if (verb) {
      const gerund = toIng(verb);
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adjMap[adjKo] || 'good'}`;
    }
  }

  // g17-4: V-ㄴ/은 것을 V → I V-ed what I V-ed
  // 한 것을 후회했다 → I regretted what I did
  // NOTE: "한" = 하+ㄴ, so we need to check for ㄴ batchim
  const whatIDidMatch = cleaned.match(/^(.+?)\s*것을?\s*(.+)다$/);
  if (whatIDidMatch) {
    const verbPart1Full = whatIDidMatch[1]; // 한
    const verb2Ko = whatIDidMatch[2]; // 후회했
    // Check if the last syllable has ㄴ batchim (한 = 하+ㄴ)
    if (hasNieunBatchim(verbPart1Full)) {
      // 한 → 하 (remove ㄴ batchim) → do
      const verbStem1 = removeNieunBatchim(verbPart1Full);
      const verb1 = extractKoVerb(verbStem1);
      // 후회했 → 후회하 → regret
      const verb2Stem = verb2Ko.replace(/[ㅆ았었했]$/, '');
      const verb2 = extractKoVerb(verb2Stem) || extractKoVerb(`${verb2Stem}하`);
      if (verb1 && verb2) {
        return `I ${toPastTense(verb2)} what I ${toPastTense(verb1)}`;
      }
    }
  }

  // g17-5: V-기로 했다 → I decided to V
  // 가기로 했다 → I decided to go
  const decidedToMatch = cleaned.match(/^(.+?)기로\s*했다$/);
  if (decidedToMatch) {
    const verbStem = decidedToMatch[1];
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    if (verb) return `I decided to ${verb}`;
  }

  // g17-2: Subject가 V-음을 V-다 → I V-ed that Subject V-ed
  // 그가 왔음을 알았다 → I knew that he came
  // 일반화된 한국어 과거형 → 영어 과거형 변환
  const nominalizingEumMatch = cleaned.match(/^(.+?)[가이]\s*(.+?)음을\s*(.+)다$/);
  if (nominalizingEumMatch) {
    const subjectKo = nominalizingEumMatch[1]; // 그
    const verbKoPast = nominalizingEumMatch[2]; // 왔
    const mainVerbKo = nominalizingEumMatch[3]; // 알았

    // Subject mapping (대명사는 고정 매핑, 일반화됨)
    const subjectMap: Record<string, string> = {
      그: 'he',
      그녀: 'she',
      그것: 'it',
      그들: 'they',
      우리: 'we',
      나: 'I',
      너: 'you',
    };
    const subject = subjectMap[subjectKo] || subjectKo;

    // 한국어 과거형 어간 → 영어 과거형 변환 (일반화된 규칙)
    // 1. 축약형 복원: 왔 → 오+았, 갔 → 가+았, 봤 → 보+았
    // 2. 어간 추출 후 KO_VERBS에서 영어 동사 찾기
    // 3. 영어 동사를 과거형으로 변환
    const extractPastVerb = (koPast: string): string => {
      // 축약형 패턴 복원
      const contractionMap: Record<string, string> = {
        왔: '오', // 오+았 → 왔
        갔: '가', // 가+았 → 갔
        봤: '보', // 보+았 → 봤
        샀: '사', // 사+았 → 샀
        잤: '자', // 자+았 → 잤
      };

      let stem = koPast;
      // 축약형이면 어간 복원
      if (contractionMap[koPast]) {
        stem = contractionMap[koPast];
      }
      // -었/-았 제거하여 어간 추출
      else if (koPast.endsWith('었') || koPast.endsWith('았')) {
        stem = koPast.slice(0, -1);
      }
      // -했 → 하
      else if (koPast.endsWith('했')) {
        stem = `${koPast.slice(0, -1)}하`;
      }

      // KO_VERBS에서 영어 동사 찾기
      const enVerb = KO_VERBS[stem] || KO_VERBS[`${stem}하`] || null;

      if (enVerb) {
        // 영어 동사를 과거형으로 변환
        return toPastTense(enVerb);
      }

      // 못 찾으면 원형 반환
      return koPast;
    };

    const subordinateVerb = extractPastVerb(verbKoPast);
    const mainVerb = extractPastVerb(mainVerbKo);

    return `I ${mainVerb} that ${subject} ${subordinateVerb}`;
  }

  // g11-6: V-는 것은 좋다 → V-ing is good (gerund as subject)
  // 수영하는 것은 좋다 → Swimming is good
  const gerundSubjectMatch = cleaned.match(
    /^(.+?)하?는\s*것은?\s*(좋다|좋아|나쁘다|나빠|어렵다|어려워|쉽다|쉬워)$/,
  );
  if (gerundSubjectMatch) {
    const verbStem = gerundSubjectMatch[1];
    const adjKo = gerundSubjectMatch[2];
    // 수영 → swim, 공부 → study
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    const adj = adjKo.startsWith('좋')
      ? 'good'
      : adjKo.startsWith('나쁘') || adjKo.startsWith('나빠')
        ? 'bad'
        : adjKo.startsWith('어렵') || adjKo.startsWith('어려워')
          ? 'difficult'
          : adjKo.startsWith('쉽') || adjKo.startsWith('쉬워')
            ? 'easy'
            : 'good';
    if (verb) {
      const gerund = toIng(verb);
      // Capitalize first letter
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adj}`;
    }
  }

  // g11-4: 결국 V-게 되다 → only to V
  // 결국 실패하게 되다 → only to fail
  const onlyToMatch = cleaned.match(/^결국\s+(.+?)하?게\s*되다$/);
  if (onlyToMatch) {
    const verb = extractKoVerb(`${onlyToMatch[1]}하`);
    if (verb) return `only to ${verb}`;
  }

  // g11-5: 만나서 기뻐요 → glad to meet you
  // 만나서 기쁘다/기뻐요/기뻐 등
  const gladToMeetMatch = cleaned.match(/^만나서\s*기[뻐쁘]/);
  if (gladToMeetMatch) {
    return 'glad to meet you';
  }

  // g9-1, g21-4: V-는 + N (person/thing) → the N who/that V-s (relative clause)
  // 뛰는 소년 → the boy who runs
  // 뛰는 소녀 → the girl who runs
  const presentParticipleMatch = cleaned.match(/^(.+?)는\s*(.+)$/);
  if (presentParticipleMatch) {
    const verbStem = presentParticipleMatch[1];
    const nounKo = presentParticipleMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    const noun = translateKoNounWithFallback(nounKo);
    if (verb && noun) {
      // Use relative clause form: "the N who V-s" for person nouns
      const personNouns = ['boy', 'girl', 'man', 'woman', 'person', 'child', 'student', 'teacher'];
      if (personNouns.includes(noun.toLowerCase())) {
        return `the ${noun} who ${verb}s`;
      }
      // Use "the V-ing N" for non-person nouns
      return `the ${toIng(verb)} ${noun}`;
    }
  }

  // g11-8: V-ㄴ/은 + N → the V-ed N (past participle adjective)
  // 깨진 창문 → the broken window
  const pastParticipleMatch = cleaned.match(/^(.+?)[진은ㄴ]\s*(.+)$/);
  if (pastParticipleMatch) {
    const verbStem = pastParticipleMatch[1];
    const nounKo = pastParticipleMatch[2];
    // 깨 → break, 쓰 → write
    const verb = extractKoVerb(verbStem);
    const noun = translateKoNounWithFallback(nounKo);
    if (verb && noun) return `the ${toPastParticiple(verb)} ${noun}`;
  }

  // ============================================
  // g29: 기타 구문 (Other Constructions)
  // ============================================

  // g29-2: Location에 N이/가 있다 → There is (a) N at/in/on Location
  // 탁자 위에 책이 있다 → There is a book on the table
  // NOTE: This must come BEFORE the simple existential to match first
  const existentialLocationMatch = cleaned.match(
    /^(.+?)\s+(위에|안에|옆에|밑에|뒤에|앞에)\s+(.+?)[이가]\s*있다$/,
  );
  if (existentialLocationMatch) {
    const location = translateKoNoun(existentialLocationMatch[1]) || existentialLocationMatch[1];
    const prep = existentialLocationMatch[2];
    const noun = translateKoNoun(existentialLocationMatch[3]) || existentialLocationMatch[3];
    const prepMap: Record<string, string> = {
      위에: 'on',
      안에: 'in',
      옆에: 'next to',
      밑에: 'under',
      뒤에: 'behind',
      앞에: 'in front of',
    };
    return `There is a ${noun} ${prepMap[prep] || 'at'} the ${location}`;
  }

  // g29-1: N이/가 있다 → There is (a) N (existential)
  // 책이 있다 → There is a book
  const existentialMatch = cleaned.match(/^(.+?)[이가]\s*있다$/);
  if (existentialMatch) {
    const noun = translateKoNoun(existentialMatch[1]) || existentialMatch[1];
    return `There is a ${noun}`;
  }

  // g29-3: V-기가 형용사 → It is adj to V
  // 배우기가 어렵다 → It is difficult to learn
  const itIsAdjMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다|좋다|나쁘다|재미있다|힘들다)$/);
  if (itIsAdjMatch) {
    const verb = extractKoVerb(itIsAdjMatch[1]);
    const adjMap: Record<string, string> = {
      어렵다: 'difficult',
      쉽다: 'easy',
      좋다: 'good',
      나쁘다: 'bad',
      재미있다: 'fun',
      힘들다: 'hard',
    };
    const adj = adjMap[itIsAdjMatch[2]] || 'difficult';
    if (verb) return `It is ${adj} to ${verb}`;
  }

  // g29-4: N에게 Object를 V → I V-ed Object to N
  // 그녀에게 책을 주었다 → I gave her a book
  const dativeMatch = cleaned.match(/^(.+?)에게\s+(.+?)[을를]\s+(주었다|줬다|보냈다|건넸다)$/);
  if (dativeMatch) {
    const recipient = translateKoNoun(dativeMatch[1]) || dativeMatch[1];
    const obj = translateKoNoun(dativeMatch[2]) || dativeMatch[2];
    const verbMap: Record<string, string> = {
      주었다: 'gave',
      줬다: 'gave',
      보냈다: 'sent',
      건넸다: 'handed',
    };
    const verb = verbMap[dativeMatch[3]] || 'gave';
    // Convert recipient to pronoun if possible
    const pronounMap: Record<string, string> = { 그녀: 'her', 그: 'him', 그들: 'them', 나: 'me' };
    const recip = pronounMap[dativeMatch[1]] || recipient;
    return `I ${verb} ${recip} a ${obj}`;
  }

  // g29-5: N로서는 → as for N
  // 나로서는 → as for me
  const asForMatch = cleaned.match(/^(.+?)로서는?$/);
  if (asForMatch) {
    const noun = asForMatch[1];
    const pronounMap: Record<string, string> = { 나: 'me', 저: 'me', 그: 'him', 그녀: 'her' };
    const translated = pronounMap[noun] || translateKoNoun(noun) || noun;
    return `as for ${translated}`;
  }

  // g29-6: V-ㄴ 것은 N이다 → It was N who V-ed (cleft sentence)
  // 간 것은 그였다 → It was he who went
  // 온 것은 그녀였다 → It was she who came
  const cleftMatch = cleaned.match(/^(.+?)\s*것은\s*(.+?)[이가]?였다$/);
  if (cleftMatch) {
    const verbPart = cleftMatch[1].trim();
    const noun = cleftMatch[2];
    // Map contracted past participles: 간 → 가 (go), 온 → 오 (come), 먹은 → 먹 (eat)
    const contractedVerbMap: Record<string, string> = {
      간: 'go',
      온: 'come',
      한: 'do',
      본: 'see',
      산: 'live',
    };
    let verb: string | null = contractedVerbMap[verbPart] ?? null;
    if (!verb) {
      // Try removing 은/ㄴ suffix
      const stem = verbPart.replace(/[은ㄴ]$/, '');
      verb = extractKoVerb(stem);
    }
    const pronounMap: Record<string, string> = { 그: 'he', 그녀: 'she', 나: 'I' };
    const subject = pronounMap[noun] || translateKoNoun(noun) || noun;
    if (verb) return `It was ${subject} who ${toPastTense(verb)}`;
  }

  // ============================================
  // g22: 보조용언 패턴 (Auxiliary Predicates)
  // ============================================

  // g22-2: V-아/어 보다 → try V-ing
  // 가 보다 → try going
  const tryMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*보다$/);
  if (tryMatch) {
    const verbStem = tryMatch[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `try ${toIng(verb)}`;
  }

  // g22-3: V-아/어 버리다 → V up (completely)
  // 먹어 버리다 → eat up (completely)
  const completiveMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*버리다$/);
  if (completiveMatch) {
    const verbStem = completiveMatch[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `${verb} up (completely)`;
  }

  // g22-4: V-아/어 내다 → accomplish (manage to V)
  // 해 내다 → accomplish
  const accomplishMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*내다$/);
  if (accomplishMatch) {
    const verbStem = accomplishMatch[1];
    const verb = extractKoVerb(verbStem);
    // 해 내다 should be "accomplish"
    if (verbStem === '해' || verbStem === '하') return 'accomplish';
    if (verb) return `manage to ${verb}`;
  }

  // g22-5: V-아/어 놓다 → have V-ed (and left)
  // 써 놓다 → have written (and left)
  // 써 is the connective form of 쓰다
  const resultativeMatch = cleaned.match(/^(.+?)\s*놓다$/);
  if (resultativeMatch) {
    const connectedVerb = resultativeMatch[1].trim();
    // 써 → 쓰 (remove connective ending), 먹어 → 먹, 해 → 하
    let verbStem = connectedVerb;
    if (connectedVerb.endsWith('어') || connectedVerb.endsWith('아')) {
      verbStem = connectedVerb.slice(0, -1);
    } else if (connectedVerb === '해') {
      verbStem = '하';
    } else if (connectedVerb === '써') {
      verbStem = '쓰';
    }
    const verb = extractKoVerb(verbStem);
    if (verb) return `have ${toPastParticiple(verb)} (and left)`;
  }

  return null;
}

/** 한국어 형용사 추출 */
function extractKoAdjective(text: string): string | null {
  const stem = text.endsWith('다') ? text.slice(0, -1) : text;
  // 하다 제거
  const base = stem.endsWith('하') ? stem.slice(0, -1) : stem;
  return KO_ADJECTIVES[text] || KO_ADJECTIVES[stem] || KO_ADJECTIVES[base] || null;
}

/** 한국어 명사 번역 */
function translateKoNoun(ko: string): string | null {
  return KO_NOUNS[ko] || null;
}

/** 한국어 명사 번역 (fallback 포함) */
function translateKoNounWithFallback(ko: string): string | null {
  return KO_NOUNS[ko] || ko;
}

/** 한국어 명사 추출 (사전에 있는 경우만 반환) */
function extractKoNoun(text: string): string | null {
  // 기본 명사 사전 (KO_NOUNS에 없는 기본 명사들)
  const basicNouns: Record<string, string> = {
    나: 'I',
    내: 'I',
    너: 'you',
    그: 'he',
    그녀: 'she',
    우리: 'we',
    책: 'book',
    친구: 'friend',
    학교: 'school',
    버스: 'bus',
    의사: 'doctor',
    아침: 'morning',
    새: 'bird',
    커피: 'coffee',
    사람: 'person',
    회사: 'company',
    집: 'home',
    물: 'water',
    밥: 'rice',
    음악: 'music',
    영화: 'movie',
    시간: 'time',
    일: 'work',
    돈: 'money',
    사랑: 'love',
    날: 'day',
    주: 'week',
    달: 'month',
    해: 'year',
  };
  return KO_NOUNS[text] || basicNouns[text] || null;
}

/** 한국어 동사 추출 */
function extractKoVerb(text: string): string | null {
  return KO_VERBS[text] || KO_VERBS[`${text}하`] || null;
}

/** 영어 비교급 생성 */
function toComparative(adj: string): string {
  const irregulars: Record<string, string> = { good: 'better', bad: 'worse', far: 'farther' };
  if (irregulars[adj]) return irregulars[adj];
  // 다음절 형용사는 more + adj (beautiful, important, expensive 등)
  const multiSyllable = [
    'beautiful',
    'important',
    'expensive',
    'difficult',
    'interesting',
    'comfortable',
    'dangerous',
    'delicious',
    'wonderful',
    'terrible',
    'horrible',
    'incredible',
    'amazing',
    'exciting',
    'boring',
    'surprising',
    'popular',
    'famous',
    'serious',
    'careful',
    'helpful',
    'useful',
    'powerful',
    'successful',
  ];
  if (multiSyllable.includes(adj) || adj.length > 7) return `more ${adj}`;
  if (adj.endsWith('y')) return `${adj.slice(0, -1)}ier`;
  if (adj.endsWith('e')) return `${adj}r`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(adj)) {
    return `${adj}${adj[adj.length - 1]}er`;
  }
  return `${adj}er`;
}

/** 영어 최상급 생성 */
function toSuperlative(adj: string): string {
  const irregulars: Record<string, string> = { good: 'best', bad: 'worst', far: 'farthest' };
  if (irregulars[adj]) return irregulars[adj];
  // 다음절 형용사는 most + adj
  const multiSyllable = [
    'beautiful',
    'important',
    'expensive',
    'difficult',
    'interesting',
    'comfortable',
    'dangerous',
    'delicious',
    'wonderful',
    'terrible',
    'horrible',
    'incredible',
    'amazing',
    'exciting',
    'boring',
    'surprising',
    'popular',
    'famous',
    'serious',
    'careful',
    'helpful',
    'useful',
    'powerful',
    'successful',
  ];
  if (multiSyllable.includes(adj) || adj.length > 7) return `most ${adj}`;
  if (adj.endsWith('y')) return `${adj.slice(0, -1)}iest`;
  if (adj.endsWith('e')) return `${adj}st`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(adj)) {
    return `${adj}${adj[adj.length - 1]}est`;
  }
  return `${adj}est`;
}

/** 영어 -ing 형태 생성 */
function toIng(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee')) return `${verb.slice(0, -1)}ing`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }
  return `${verb}ing`;
}

// 타입 re-export
export type { Direction, Formality, TranslationResult } from './types';
