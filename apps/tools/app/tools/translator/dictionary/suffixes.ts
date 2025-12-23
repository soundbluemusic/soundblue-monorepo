// ========================================
// English Suffixes - 영어 접미사 (카테고리별 분류)
// ========================================

export interface SuffixInfo {
  suffix: string;
  pattern: RegExp;
  type: SuffixType;
  category: SuffixCategory;
  ko: string; // Korean equivalent
  restoreRule?: RestoreRule;
}

export type SuffixType = 'verb' | 'noun' | 'adjective' | 'adverb' | 'comparative' | 'superlative';

export type SuffixCategory =
  | 'verb-tense' // 동사 시제
  | 'verb-form' // 동사 형태
  | 'noun-abstract' // 추상명사
  | 'noun-agent' // 행위자
  | 'noun-place' // 장소/상태
  | 'adj-quality' // 형용사-특성
  | 'adj-state' // 형용사-상태
  | 'adj-comparison' // 형용사-비교
  | 'adverb'; // 부사

export type RestoreRule = 'double' | 'e' | 'y-to-i' | 'consonant-y';

// ========================================
// 1. 동사 시제 접미사 (Verb Tense) - 30개
// ========================================

// 과거형 -ed (15개)
export const VERB_PAST_SUFFIXES: SuffixInfo[] = [
  {
    suffix: 'pped',
    pattern: /pped$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // stopped
  {
    suffix: 'tted',
    pattern: /tted$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // chatted
  {
    suffix: 'nned',
    pattern: /nned$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // planned
  {
    suffix: 'mmed',
    pattern: /mmed$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // slammed
  {
    suffix: 'gged',
    pattern: /gged$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // dragged
  {
    suffix: 'rred',
    pattern: /rred$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // stirred
  {
    suffix: 'bbed',
    pattern: /bbed$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // rubbed
  {
    suffix: 'lled',
    pattern: /lled$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // filled
  {
    suffix: 'dded',
    pattern: /dded$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'double',
  }, // added
  {
    suffix: 'ied',
    pattern: /ied$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '었/았',
    restoreRule: 'y-to-i',
  }, // studied
  { suffix: 'd', pattern: /([^e])d$/, type: 'verb', category: 'verb-tense', ko: '었/았', restoreRule: 'e' }, // loved
  { suffix: 'ed', pattern: /ed$/, type: 'verb', category: 'verb-tense', ko: '었/았' }, // walked
];

// 진행형 -ing (10개)
export const VERB_PROGRESSIVE_SUFFIXES: SuffixInfo[] = [
  {
    suffix: 'pping',
    pattern: /pping$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // stopping
  {
    suffix: 'tting',
    pattern: /tting$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // chatting
  {
    suffix: 'nning',
    pattern: /nning$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // planning
  {
    suffix: 'mming',
    pattern: /mming$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // slamming
  {
    suffix: 'gging',
    pattern: /gging$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // dragging
  {
    suffix: 'rring',
    pattern: /rring$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // stirring
  {
    suffix: 'bbing',
    pattern: /bbing$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'double',
  }, // rubbing
  {
    suffix: 'ying',
    pattern: /ying$/,
    type: 'verb',
    category: 'verb-tense',
    ko: '는',
    restoreRule: 'consonant-y',
  }, // studying
  { suffix: 'ing', pattern: /ing$/, type: 'verb', category: 'verb-tense', ko: '는', restoreRule: 'e' }, // loving/making
];

// 3인칭 단수 -s (5개)
export const VERB_THIRD_PERSON_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ies', pattern: /ies$/, type: 'verb', category: 'verb-tense', ko: '다', restoreRule: 'y-to-i' }, // studies
  { suffix: 'es', pattern: /(s|x|z|ch|sh)es$/, type: 'verb', category: 'verb-tense', ko: '다' }, // watches
  { suffix: 's', pattern: /s$/, type: 'verb', category: 'verb-tense', ko: '다' }, // walks
  { suffix: 'ves', pattern: /ves$/, type: 'verb', category: 'verb-tense', ko: '다' }, // halves (f→v)
  { suffix: 'oes', pattern: /oes$/, type: 'verb', category: 'verb-tense', ko: '다' }, // goes
];

// ========================================
// 2. 동사 형태 접미사 (Verb Form) - 5개
// ========================================
export const VERB_FORM_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ize', pattern: /ize$/, type: 'verb', category: 'verb-form', ko: '화하다' }, // realize
  { suffix: 'ise', pattern: /ise$/, type: 'verb', category: 'verb-form', ko: '화하다' }, // realise (British)
  { suffix: 'ify', pattern: /ify$/, type: 'verb', category: 'verb-form', ko: '화하다' }, // simplify
  { suffix: 'fy', pattern: /fy$/, type: 'verb', category: 'verb-form', ko: '화하다' }, // beautify
  { suffix: 'ate', pattern: /ate$/, type: 'verb', category: 'verb-form', ko: '하다' }, // create
  { suffix: 'en', pattern: /en$/, type: 'verb', category: 'verb-form', ko: '하다' }, // widen
];

// ========================================
// 3. 추상명사 접미사 (Abstract Noun) - 15개
// ========================================
export const NOUN_ABSTRACT_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ness', pattern: /ness$/, type: 'noun', category: 'noun-abstract', ko: '함' }, // happiness
  { suffix: 'ment', pattern: /ment$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // development
  { suffix: 'tion', pattern: /tion$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // creation
  { suffix: 'sion', pattern: /sion$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // decision
  { suffix: 'ation', pattern: /ation$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // preparation
  { suffix: 'ity', pattern: /ity$/, type: 'noun', category: 'noun-abstract', ko: '성' }, // ability
  { suffix: 'ty', pattern: /ty$/, type: 'noun', category: 'noun-abstract', ko: '성' }, // safety
  { suffix: 'ance', pattern: /ance$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // acceptance
  { suffix: 'ence', pattern: /ence$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // difference
  { suffix: 'ship', pattern: /ship$/, type: 'noun', category: 'noun-abstract', ko: '관계' }, // friendship
  { suffix: 'hood', pattern: /hood$/, type: 'noun', category: 'noun-abstract', ko: '상태' }, // childhood
  { suffix: 'dom', pattern: /dom$/, type: 'noun', category: 'noun-abstract', ko: '상태' }, // freedom
  { suffix: 'th', pattern: /th$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // growth
  { suffix: 'ure', pattern: /ure$/, type: 'noun', category: 'noun-abstract', ko: '것' }, // culture
  { suffix: 'ism', pattern: /ism$/, type: 'noun', category: 'noun-abstract', ko: '주의' }, // socialism
];

// ========================================
// 4. 행위자 명사 접미사 (Agent Noun) - 10개
// ========================================
export const NOUN_AGENT_SUFFIXES: SuffixInfo[] = [
  { suffix: 'er', pattern: /er$/, type: 'noun', category: 'noun-agent', ko: '하는 사람' }, // teacher
  { suffix: 'or', pattern: /or$/, type: 'noun', category: 'noun-agent', ko: '하는 사람' }, // actor
  { suffix: 'ar', pattern: /ar$/, type: 'noun', category: 'noun-agent', ko: '하는 사람' }, // liar
  { suffix: 'ist', pattern: /ist$/, type: 'noun', category: 'noun-agent', ko: '주의자' }, // artist
  { suffix: 'ian', pattern: /ian$/, type: 'noun', category: 'noun-agent', ko: '사람' }, // musician
  { suffix: 'ant', pattern: /ant$/, type: 'noun', category: 'noun-agent', ko: '하는 것' }, // assistant
  { suffix: 'ent', pattern: /ent$/, type: 'noun', category: 'noun-agent', ko: '하는 것' }, // student
  { suffix: 'ee', pattern: /ee$/, type: 'noun', category: 'noun-agent', ko: '받는 사람' }, // employee
  { suffix: 'eer', pattern: /eer$/, type: 'noun', category: 'noun-agent', ko: '하는 사람' }, // engineer
  { suffix: 'ster', pattern: /ster$/, type: 'noun', category: 'noun-agent', ko: '하는 사람' }, // youngster
];

// ========================================
// 5. 장소/상태 명사 접미사 (Place/State Noun) - 5개
// ========================================
export const NOUN_PLACE_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ry', pattern: /ry$/, type: 'noun', category: 'noun-place', ko: '곳' }, // library
  { suffix: 'ery', pattern: /ery$/, type: 'noun', category: 'noun-place', ko: '곳' }, // bakery
  { suffix: 'ary', pattern: /ary$/, type: 'noun', category: 'noun-place', ko: '곳' }, // library
  { suffix: 'ory', pattern: /ory$/, type: 'noun', category: 'noun-place', ko: '곳' }, // laboratory
  { suffix: 'age', pattern: /age$/, type: 'noun', category: 'noun-place', ko: '것' }, // package
];

// ========================================
// 6. 형용사 특성 접미사 (Adjective Quality) - 15개
// ========================================
export const ADJ_QUALITY_SUFFIXES: SuffixInfo[] = [
  { suffix: 'able', pattern: /able$/, type: 'adjective', category: 'adj-quality', ko: '할 수 있는' }, // readable
  { suffix: 'ible', pattern: /ible$/, type: 'adjective', category: 'adj-quality', ko: '할 수 있는' }, // possible
  { suffix: 'ful', pattern: /ful$/, type: 'adjective', category: 'adj-quality', ko: '가득한' }, // beautiful
  { suffix: 'less', pattern: /less$/, type: 'adjective', category: 'adj-quality', ko: '없는' }, // helpless
  { suffix: 'ous', pattern: /ous$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // famous
  { suffix: 'ious', pattern: /ious$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // curious
  { suffix: 'eous', pattern: /eous$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // gorgeous
  { suffix: 'ive', pattern: /ive$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // active
  { suffix: 'ative', pattern: /ative$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // creative
  { suffix: 'itive', pattern: /itive$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // sensitive
  { suffix: 'al', pattern: /al$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // natural
  { suffix: 'ial', pattern: /ial$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // social
  { suffix: 'ual', pattern: /ual$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // gradual
  { suffix: 'ical', pattern: /ical$/, type: 'adjective', category: 'adj-quality', ko: '한' }, // logical
  { suffix: 'like', pattern: /like$/, type: 'adjective', category: 'adj-quality', ko: '같은' }, // childlike
];

// ========================================
// 7. 형용사 상태 접미사 (Adjective State) - 10개
// ========================================
export const ADJ_STATE_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ant', pattern: /ant$/, type: 'adjective', category: 'adj-state', ko: '한' }, // important
  { suffix: 'ent', pattern: /ent$/, type: 'adjective', category: 'adj-state', ko: '한' }, // different
  { suffix: 'ic', pattern: /ic$/, type: 'adjective', category: 'adj-state', ko: '한' }, // basic
  { suffix: 'ish', pattern: /ish$/, type: 'adjective', category: 'adj-state', ko: '같은' }, // childish
  { suffix: 'y', pattern: /y$/, type: 'adjective', category: 'adj-state', ko: '한' }, // happy
  { suffix: 'en', pattern: /en$/, type: 'adjective', category: 'adj-state', ko: '한' }, // golden
  { suffix: 'ary', pattern: /ary$/, type: 'adjective', category: 'adj-state', ko: '한' }, // necessary
  { suffix: 'ory', pattern: /ory$/, type: 'adjective', category: 'adj-state', ko: '한' }, // satisfactory
  { suffix: 'ate', pattern: /ate$/, type: 'adjective', category: 'adj-state', ko: '한' }, // passionate
  { suffix: 'ite', pattern: /ite$/, type: 'adjective', category: 'adj-state', ko: '한' }, // favorite
];

// ========================================
// 8. 형용사 비교 접미사 (Adjective Comparison) - 5개
// ========================================
export const ADJ_COMPARISON_SUFFIXES: SuffixInfo[] = [
  { suffix: 'er', pattern: /er$/, type: 'comparative', category: 'adj-comparison', ko: '더' }, // bigger
  {
    suffix: 'ier',
    pattern: /ier$/,
    type: 'comparative',
    category: 'adj-comparison',
    ko: '더',
    restoreRule: 'y-to-i',
  }, // happier
  { suffix: 'r', pattern: /r$/, type: 'comparative', category: 'adj-comparison', ko: '더', restoreRule: 'e' }, // larger
  { suffix: 'est', pattern: /est$/, type: 'superlative', category: 'adj-comparison', ko: '가장' }, // biggest
  {
    suffix: 'iest',
    pattern: /iest$/,
    type: 'superlative',
    category: 'adj-comparison',
    ko: '가장',
    restoreRule: 'y-to-i',
  }, // happiest
];

// ========================================
// 9. 부사 접미사 (Adverb) - 10개
// ========================================
export const ADVERB_SUFFIXES: SuffixInfo[] = [
  { suffix: 'ly', pattern: /ly$/, type: 'adverb', category: 'adverb', ko: '하게' }, // quickly
  { suffix: 'ally', pattern: /ally$/, type: 'adverb', category: 'adverb', ko: '하게' }, // basically
  { suffix: 'ically', pattern: /ically$/, type: 'adverb', category: 'adverb', ko: '하게' }, // logically
  { suffix: 'ily', pattern: /ily$/, type: 'adverb', category: 'adverb', ko: '하게', restoreRule: 'y-to-i' }, // happily
  { suffix: 'ably', pattern: /ably$/, type: 'adverb', category: 'adverb', ko: '하게' }, // comfortably
  { suffix: 'ibly', pattern: /ibly$/, type: 'adverb', category: 'adverb', ko: '하게' }, // possibly
  { suffix: 'ously', pattern: /ously$/, type: 'adverb', category: 'adverb', ko: '하게' }, // famously
  { suffix: 'ively', pattern: /ively$/, type: 'adverb', category: 'adverb', ko: '하게' }, // actively
  { suffix: 'ward', pattern: /ward$/, type: 'adverb', category: 'adverb', ko: '쪽으로' }, // forward
  { suffix: 'wise', pattern: /wise$/, type: 'adverb', category: 'adverb', ko: '면에서' }, // likewise
];

// ========================================
// 통합 접미사 목록 (Total: 115개)
// ========================================
export const SUFFIXES: SuffixInfo[] = [
  ...VERB_PAST_SUFFIXES,
  ...VERB_PROGRESSIVE_SUFFIXES,
  ...VERB_THIRD_PERSON_SUFFIXES,
  ...VERB_FORM_SUFFIXES,
  ...NOUN_ABSTRACT_SUFFIXES,
  ...NOUN_AGENT_SUFFIXES,
  ...NOUN_PLACE_SUFFIXES,
  ...ADJ_QUALITY_SUFFIXES,
  ...ADJ_STATE_SUFFIXES,
  ...ADJ_COMPARISON_SUFFIXES,
  ...ADVERB_SUFFIXES,
];

// ========================================
// 카테고리별 접근 맵
// ========================================
export const SUFFIXES_BY_CATEGORY: Record<SuffixCategory, SuffixInfo[]> = {
  'verb-tense': [...VERB_PAST_SUFFIXES, ...VERB_PROGRESSIVE_SUFFIXES, ...VERB_THIRD_PERSON_SUFFIXES],
  'verb-form': VERB_FORM_SUFFIXES,
  'noun-abstract': NOUN_ABSTRACT_SUFFIXES,
  'noun-agent': NOUN_AGENT_SUFFIXES,
  'noun-place': NOUN_PLACE_SUFFIXES,
  'adj-quality': ADJ_QUALITY_SUFFIXES,
  'adj-state': ADJ_STATE_SUFFIXES,
  'adj-comparison': ADJ_COMPARISON_SUFFIXES,
  adverb: ADVERB_SUFFIXES,
};

// ========================================
// Helper Functions
// ========================================

/**
 * 단어에서 접미사 추출
 */
export function extractSuffix(word: string): SuffixInfo | null {
  const lower = word.toLowerCase();

  // 긴 접미사부터 매칭 (greedy)
  const sorted = [...SUFFIXES].sort((a, b) => b.suffix.length - a.suffix.length);

  for (const suffix of sorted) {
    if (suffix.pattern.test(lower) && lower.length > suffix.suffix.length + 2) {
      // 최소 2글자 어간 필요
      return suffix;
    }
  }

  return null;
}

/**
 * 어간 복원 (접미사 제거 후 원래 형태로)
 */
export function restoreStem(word: string, suffix: SuffixInfo): string {
  const lower = word.toLowerCase();
  const stem = lower.replace(suffix.pattern, '');

  if (!suffix.restoreRule) {
    return stem;
  }

  switch (suffix.restoreRule) {
    case 'double': {
      // stopped → stopp → stop
      const lastChar = stem[stem.length - 1];
      if (lastChar && stem.endsWith(lastChar + lastChar)) {
        return stem.slice(0, -1);
      }
      return stem;
    }

    case 'e': {
      // loved → lov → love, making → mak → make
      if (suffix.suffix.startsWith('ing') || suffix.suffix.startsWith('ed')) {
        // e로 끝나는 단어인지 추정
        if (!/[aeiou]$/.test(stem) && !stem.endsWith('ee') && !stem.endsWith('ye')) {
          return `${stem}e`;
        }
      }
      return stem;
    }

    case 'y-to-i': {
      // studied → studi → study, happier → happi → happy
      if (stem.endsWith('i')) {
        return `${stem.slice(0, -1)}y`;
      }
      return stem;
    }

    case 'consonant-y': {
      // studying → study + ing (y 유지)
      return stem;
    }

    default:
      return stem;
  }
}

/**
 * 접미사 한국어 번역
 */
export function translateSuffix(suffix: string): string {
  const info = SUFFIXES.find((s) => s.suffix === suffix);
  return info?.ko || '';
}

/**
 * 카테고리별 접미사 가져오기
 */
export function getSuffixesByCategory(category: SuffixCategory): SuffixInfo[] {
  return SUFFIXES_BY_CATEGORY[category] || [];
}

/**
 * 타입별 접미사 가져오기
 */
export function getSuffixesByType(type: SuffixType): SuffixInfo[] {
  return SUFFIXES.filter((s) => s.type === type);
}

/**
 * 모든 접미사 개수 반환
 */
export function getSuffixCount(): number {
  return SUFFIXES.length;
}

/**
 * 카테고리별 접미사 개수 반환
 */
export function getSuffixCountByCategory(): Record<SuffixCategory, number> {
  return {
    'verb-tense': VERB_PAST_SUFFIXES.length + VERB_PROGRESSIVE_SUFFIXES.length + VERB_THIRD_PERSON_SUFFIXES.length,
    'verb-form': VERB_FORM_SUFFIXES.length,
    'noun-abstract': NOUN_ABSTRACT_SUFFIXES.length,
    'noun-agent': NOUN_AGENT_SUFFIXES.length,
    'noun-place': NOUN_PLACE_SUFFIXES.length,
    'adj-quality': ADJ_QUALITY_SUFFIXES.length,
    'adj-state': ADJ_STATE_SUFFIXES.length,
    'adj-comparison': ADJ_COMPARISON_SUFFIXES.length,
    adverb: ADVERB_SUFFIXES.length,
  };
}
