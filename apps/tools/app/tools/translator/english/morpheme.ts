// ========================================
// English Morpheme Analyzer - 영어 형태소 분해기
// Decomposes English words into prefix + stem + suffix
// ========================================

export interface PrefixInfo {
  prefix: string;
  meaning: string;
  ko: string; // Korean equivalent
}

export interface SuffixInfo {
  pattern: RegExp;
  type: 'verb' | 'noun' | 'adjective' | 'adverb' | 'comparative' | 'superlative';
  remove: number; // How many characters to remove from end
  restoreRule?: 'double' | 'e' | 'y-to-i' | 'consonant-y'; // Stem restoration rules
  ko?: string; // Korean equivalent
}

export interface MorphemeResult {
  prefix: string;
  stem: string;
  suffix: string;
  type: string;
  original: string;
}

// ========================================
// 50 English Prefixes
// ========================================

export const PREFIXES: PrefixInfo[] = [
  { prefix: 'un', meaning: 'not', ko: '불' },
  { prefix: 're', meaning: 'again', ko: '재' },
  { prefix: 'pre', meaning: 'before', ko: '사전' },
  { prefix: 'post', meaning: 'after', ko: '사후' },
  { prefix: 'dis', meaning: 'not/opposite', ko: '불' },
  { prefix: 'mis', meaning: 'wrong', ko: '오' },
  { prefix: 'anti', meaning: 'against', ko: '반' },
  { prefix: 'de', meaning: 'reverse', ko: '탈' },
  { prefix: 'over', meaning: 'too much', ko: '과' },
  { prefix: 'under', meaning: 'too little', ko: '미' },
  { prefix: 'sub', meaning: 'under', ko: '하위' },
  { prefix: 'super', meaning: 'above', ko: '초' },
  { prefix: 'inter', meaning: 'between', ko: '상호' },
  { prefix: 'trans', meaning: 'across', ko: '횡단' },
  { prefix: 'ex', meaning: 'out/former', ko: '외' },
  { prefix: 'in', meaning: 'not', ko: '불' },
  { prefix: 'im', meaning: 'not', ko: '불' },
  { prefix: 'il', meaning: 'not', ko: '불' },
  { prefix: 'ir', meaning: 'not', ko: '불' },
  { prefix: 'en', meaning: 'make', ko: '화' },
  { prefix: 'em', meaning: 'make', ko: '화' },
  { prefix: 'co', meaning: 'with', ko: '공' },
  { prefix: 'con', meaning: 'with', ko: '공' },
  { prefix: 'com', meaning: 'with', ko: '공' },
  { prefix: 'semi', meaning: 'half', ko: '반' },
  { prefix: 'multi', meaning: 'many', ko: '다' },
  { prefix: 'auto', meaning: 'self', ko: '자동' },
  { prefix: 'bi', meaning: 'two', ko: '이' },
  { prefix: 'tri', meaning: 'three', ko: '삼' },
  { prefix: 'uni', meaning: 'one', ko: '단일' },
  { prefix: 'mono', meaning: 'one', ko: '단' },
  { prefix: 'poly', meaning: 'many', ko: '다' },
  { prefix: 'macro', meaning: 'large', ko: '거대' },
  { prefix: 'micro', meaning: 'small', ko: '미세' },
  { prefix: 'mega', meaning: 'large', ko: '메가' },
  { prefix: 'mini', meaning: 'small', ko: '미니' },
  { prefix: 'neo', meaning: 'new', ko: '신' },
  { prefix: 'proto', meaning: 'first', ko: '원시' },
  { prefix: 'pseudo', meaning: 'false', ko: '가짜' },
  { prefix: 'quasi', meaning: 'seeming', ko: '준' },
  { prefix: 'non', meaning: 'not', ko: '무' },
  { prefix: 'mal', meaning: 'bad', ko: '악' },
  { prefix: 'bene', meaning: 'good', ko: '선' },
  { prefix: 'fore', meaning: 'before', ko: '전방' },
  { prefix: 'mid', meaning: 'middle', ko: '중간' },
  { prefix: 'out', meaning: 'beyond', ko: '초과' },
  { prefix: 'counter', meaning: 'against', ko: '반' },
  { prefix: 'hyper', meaning: 'over', ko: '초' },
  { prefix: 'hypo', meaning: 'under', ko: '저' },
  { prefix: 'meta', meaning: 'beyond', ko: '초' },
];

// ========================================
// 100 English Suffixes
// ========================================

export const SUFFIXES: SuffixInfo[] = [
  // Verb suffixes - Past tense
  { pattern: /pped$/, type: 'verb', remove: 3, restoreRule: 'double', ko: '었/았' }, // stopped → stopp → stop
  { pattern: /tted$/, type: 'verb', remove: 3, restoreRule: 'double', ko: '었/았' }, // chatted → chatt → chat
  { pattern: /nned$/, type: 'verb', remove: 3, restoreRule: 'double', ko: '었/았' }, // planned → plann → plan
  { pattern: /mmed$/, type: 'verb', remove: 3, restoreRule: 'double', ko: '었/았' }, // slammed → slamm → slam
  { pattern: /gged$/, type: 'verb', remove: 3, restoreRule: 'double', ko: '었/았' }, // dragged → dragg → drag
  { pattern: /ied$/, type: 'verb', remove: 2, restoreRule: 'y-to-i', ko: '었/았' }, // studied → studi → study
  { pattern: /ed$/, type: 'verb', remove: 2, ko: '었/았' }, // walked → walk

  // Verb suffixes - Progressive
  { pattern: /pping$/, type: 'verb', remove: 4, restoreRule: 'double', ko: '고 있는' }, // stopping → stopp → stop
  { pattern: /tting$/, type: 'verb', remove: 4, restoreRule: 'double', ko: '고 있는' }, // sitting → sitt → sit
  { pattern: /nning$/, type: 'verb', remove: 4, restoreRule: 'double', ko: '고 있는' }, // running → runn → run
  { pattern: /mming$/, type: 'verb', remove: 4, restoreRule: 'double', ko: '고 있는' }, // swimming → swimm → swim
  { pattern: /gging$/, type: 'verb', remove: 4, restoreRule: 'double', ko: '고 있는' }, // digging → digg → dig
  { pattern: /ying$/, type: 'verb', remove: 3, ko: '고 있는' }, // studying → study (no restoration)
  { pattern: /ing$/, type: 'verb', remove: 3, restoreRule: 'e', ko: '고 있는' }, // making → mak → make

  // Verb suffixes - 3rd person singular
  { pattern: /ies$/, type: 'verb', remove: 2, restoreRule: 'y-to-i', ko: '는다' }, // studies → studi → study
  { pattern: /sses$/, type: 'verb', remove: 2, ko: '는다' }, // passes → pass
  { pattern: /ches$/, type: 'verb', remove: 2, ko: '는다' }, // watches → watch
  { pattern: /shes$/, type: 'verb', remove: 2, ko: '는다' }, // washes → wash
  { pattern: /xes$/, type: 'verb', remove: 2, ko: '는다' }, // fixes → fix
  { pattern: /zes$/, type: 'verb', remove: 2, ko: '는다' }, // buzzes → buzz
  { pattern: /s$/, type: 'verb', remove: 1, ko: '는다' }, // walks → walk

  // Verb formation suffixes
  { pattern: /ized$/, type: 'verb', remove: 4, ko: '화했다' }, // modernized → modern
  { pattern: /ised$/, type: 'verb', remove: 4, ko: '화했다' }, // modernised → modern
  { pattern: /ize$/, type: 'verb', remove: 3, ko: '화하다' }, // modernize → modern
  { pattern: /ise$/, type: 'verb', remove: 3, ko: '화하다' }, // modernise → modern
  { pattern: /ified$/, type: 'verb', remove: 5, restoreRule: 'consonant-y', ko: '화했다' }, // purified → purify → pure
  { pattern: /ify$/, type: 'verb', remove: 3, ko: '화하다' }, // purify → pure
  { pattern: /ated$/, type: 'verb', remove: 4, ko: '했다' }, // activated → activate
  { pattern: /ate$/, type: 'verb', remove: 3, ko: '하다' }, // activate → active
  { pattern: /ened$/, type: 'verb', remove: 4, ko: '했다' }, // weakened → weak
  { pattern: /en$/, type: 'verb', remove: 2, ko: '하다' }, // weaken → weak

  // Noun suffixes - Common endings
  { pattern: /ation$/, type: 'noun', remove: 5, restoreRule: 'e', ko: '화' }, // creation → create
  { pattern: /tion$/, type: 'noun', remove: 4, restoreRule: 'e', ko: '것' }, // action → act
  { pattern: /sion$/, type: 'noun', remove: 4, ko: '것' }, // decision → decide
  { pattern: /ment$/, type: 'noun', remove: 4, ko: '것' }, // movement → move
  { pattern: /ness$/, type: 'noun', remove: 4, ko: '함' }, // happiness → happy
  { pattern: /ity$/, type: 'noun', remove: 3, ko: '성' }, // ability → able
  { pattern: /ance$/, type: 'noun', remove: 4, ko: '함' }, // acceptance → accept
  { pattern: /ence$/, type: 'noun', remove: 4, ko: '함' }, // difference → differ
  { pattern: /ancy$/, type: 'noun', remove: 4, ko: '성' }, // vacancy → vacant
  { pattern: /ency$/, type: 'noun', remove: 4, ko: '성' }, //ency → ent
  { pattern: /dom$/, type: 'noun', remove: 3, ko: '권' }, // freedom → free
  { pattern: /hood$/, type: 'noun', remove: 4, ko: '시절' }, // childhood → child
  { pattern: /ship$/, type: 'noun', remove: 4, ko: '관계' }, // friendship → friend
  { pattern: /ism$/, type: 'noun', remove: 3, ko: '주의' }, // capitalism → capital
  { pattern: /age$/, type: 'noun', remove: 3, ko: '것' }, // storage → store
  { pattern: /ure$/, type: 'noun', remove: 3, ko: '것' }, // closure → close
  { pattern: /ery$/, type: 'noun', remove: 3, ko: '곳' }, // bakery → bake
  { pattern: /ry$/, type: 'noun', remove: 2, ko: '것' }, // jewelry → jewel
  { pattern: /ty$/, type: 'noun', remove: 2, ko: '성' }, // safety → safe
  { pattern: /cy$/, type: 'noun', remove: 2, ko: '성' }, // accuracy → accurate

  // Noun suffixes - Agent nouns
  { pattern: /ier$/, type: 'noun', remove: 2, restoreRule: 'consonant-y', ko: '하는 사람' }, // carrier → carri → carry
  { pattern: /er$/, type: 'noun', remove: 2, restoreRule: 'e', ko: '하는 사람' }, // maker → make
  { pattern: /or$/, type: 'noun', remove: 2, ko: '하는 사람' }, // actor → act
  { pattern: /ist$/, type: 'noun', remove: 3, ko: '전문가' }, // artist → art
  { pattern: /ant$/, type: 'noun', remove: 3, ko: '하는 사람' }, // participant → participate
  { pattern: /ent$/, type: 'noun', remove: 3, ko: '하는 사람' }, // student → study

  // Noun suffixes - Diminutive
  { pattern: /let$/, type: 'noun', remove: 3, ko: '작은' }, // booklet → book
  { pattern: /ling$/, type: 'noun', remove: 4, ko: '작은' }, // duckling → duck
  { pattern: /ette$/, type: 'noun', remove: 4, ko: '작은' }, // kitchenette → kitchen

  // Adjective suffixes
  { pattern: /ful$/, type: 'adjective', remove: 3, ko: '한' }, // beautiful → beauty
  { pattern: /less$/, type: 'adjective', remove: 4, ko: '없는' }, // helpless → help
  { pattern: /able$/, type: 'adjective', remove: 4, restoreRule: 'e', ko: '할 수 있는' }, // readable → read
  { pattern: /ible$/, type: 'adjective', remove: 4, ko: '할 수 있는' }, // visible → vis
  { pattern: /ous$/, type: 'adjective', remove: 3, ko: '한' }, // famous → fame
  { pattern: /ious$/, type: 'adjective', remove: 4, ko: '한' }, // curious → cure
  { pattern: /eous$/, type: 'adjective', remove: 4, ko: '한' }, // gorgeous → gorge
  { pattern: /al$/, type: 'adjective', remove: 2, ko: '한' }, // national → nation
  { pattern: /ial$/, type: 'adjective', remove: 3, ko: '한' }, // social → society
  { pattern: /ical$/, type: 'adjective', remove: 4, ko: '한' }, // musical → music
  { pattern: /ic$/, type: 'adjective', remove: 2, ko: '한' }, // electric → electricity
  { pattern: /ive$/, type: 'adjective', remove: 3, restoreRule: 'e', ko: '한' }, // active → act
  { pattern: /ative$/, type: 'adjective', remove: 5, ko: '한' }, // creative → create
  { pattern: /ish$/, type: 'adjective', remove: 3, ko: '한' }, // childish → child
  { pattern: /some$/, type: 'adjective', remove: 4, ko: '한' }, // handsome → hand
  { pattern: /like$/, type: 'adjective', remove: 4, ko: '같은' }, // childlike → child
  { pattern: /ary$/, type: 'adjective', remove: 3, ko: '한' }, // elementary → element
  { pattern: /ory$/, type: 'adjective', remove: 3, ko: '한' }, // sensory → sense
  { pattern: /ant$/, type: 'adjective', remove: 3, ko: '한' }, // pleasant → please
  { pattern: /ent$/, type: 'adjective', remove: 3, ko: '한' }, // different → differ

  // Adjective suffixes - y ending
  { pattern: /ily$/, type: 'adjective', remove: 2, restoreRule: 'y-to-i', ko: '하게' }, // happily → happi → happy
  { pattern: /y$/, type: 'adjective', remove: 1, ko: '한' }, // sunny → sun

  // Adverb suffixes
  { pattern: /ally$/, type: 'adverb', remove: 4, ko: '하게' }, // basically → basic
  { pattern: /ily$/, type: 'adverb', remove: 2, restoreRule: 'y-to-i', ko: '하게' }, // happily → happi → happy
  { pattern: /ly$/, type: 'adverb', remove: 2, ko: '하게' }, // quickly → quick

  // Comparative and Superlative
  { pattern: /ier$/, type: 'comparative', remove: 2, restoreRule: 'y-to-i', ko: '더' }, // happier → happi → happy
  { pattern: /iest$/, type: 'superlative', remove: 3, restoreRule: 'y-to-i', ko: '가장' }, // happiest → happi → happy
  { pattern: /er$/, type: 'comparative', remove: 2, restoreRule: 'e', ko: '더' }, // larger → large
  { pattern: /est$/, type: 'superlative', remove: 3, restoreRule: 'e', ko: '가장' }, // largest → large
];

// ========================================
// Irregular Verb Mappings (200 entries)
// ========================================

export const IRREGULAR_VERBS: Record<string, string> = {
  // Common irregular past tense forms
  went: 'go',
  gone: 'go',
  ate: 'eat',
  eaten: 'eat',
  was: 'be',
  were: 'be',
  been: 'be',
  had: 'have',
  did: 'do',
  done: 'do',
  said: 'say',
  made: 'make',
  came: 'come',
  saw: 'see',
  seen: 'see',
  got: 'get',
  gotten: 'get',
  gave: 'give',
  given: 'give',
  took: 'take',
  taken: 'take',
  knew: 'know',
  known: 'know',
  found: 'find',
  thought: 'think',
  told: 'tell',
  became: 'become',
  left: 'leave',
  felt: 'feel',
  brought: 'bring',
  began: 'begin',
  begun: 'begin',
  kept: 'keep',
  held: 'hold',
  wrote: 'write',
  written: 'write',
  stood: 'stand',
  heard: 'hear',
  let: 'let',
  meant: 'mean',
  set: 'set',
  met: 'meet',
  ran: 'run',
  paid: 'pay',
  sat: 'sit',
  spoke: 'speak',
  spoken: 'speak',
  lay: 'lie',
  lain: 'lie',
  led: 'lead',
  read: 'read',
  grew: 'grow',
  grown: 'grow',
  lost: 'lose',
  fell: 'fall',
  fallen: 'fall',
  sent: 'send',
  built: 'build',
  understood: 'understand',
  drew: 'draw',
  drawn: 'draw',
  broke: 'break',
  broken: 'break',
  spent: 'spend',
  cut: 'cut',
  rose: 'rise',
  risen: 'rise',
  drove: 'drive',
  driven: 'drive',
  bought: 'buy',
  wore: 'wear',
  worn: 'wear',
  chose: 'choose',
  chosen: 'choose',
  sought: 'seek',
  caught: 'catch',
  threw: 'throw',
  thrown: 'throw',
  flew: 'fly',
  flown: 'fly',
  forgot: 'forget',
  forgotten: 'forget',
  rode: 'ride',
  ridden: 'ride',
  drank: 'drink',
  drunk: 'drink',
  sang: 'sing',
  sung: 'sing',
  swam: 'swim',
  swum: 'swim',
  rang: 'ring',
  rung: 'ring',
  bore: 'bear',
  born: 'bear',
  borne: 'bear',
  tore: 'tear',
  torn: 'tear',
  stole: 'steal',
  stolen: 'steal',
  froze: 'freeze',
  frozen: 'freeze',
  bit: 'bite',
  bitten: 'bite',
  hid: 'hide',
  hidden: 'hide',
  won: 'win',
  shook: 'shake',
  shaken: 'shake',
  fought: 'fight',
  fed: 'feed',
  slept: 'sleep',
  swept: 'sweep',
  wept: 'weep',
  crept: 'creep',
  bent: 'bend',
  lent: 'lend',
  taught: 'teach',
  sold: 'sell',
  dealt: 'deal',
  burnt: 'burn',
  burned: 'burn',
  learned: 'learn',
  learnt: 'learn',
  hung: 'hang',
  struck: 'strike',
  stuck: 'stick',
  dug: 'dig',
  swung: 'swing',
  slid: 'slide',
  shot: 'shoot',
  shone: 'shine',
  shined: 'shine',
  quit: 'quit',
  spread: 'spread',
  split: 'split',
  shut: 'shut',
  hurt: 'hurt',
  cast: 'cast',
  cost: 'cost',
  put: 'put',
  hit: 'hit',
  bet: 'bet',
  broadcast: 'broadcast',
  burst: 'burst',
  forecast: 'forecast',
  shed: 'shed',
  wed: 'wed',
  wet: 'wet',
  woke: 'wake',
  woken: 'wake',
  blew: 'blow',
  blown: 'blow',
  forbade: 'forbid',
  forbidden: 'forbid',
  forgave: 'forgive',
  forgiven: 'forgive',
  bound: 'bind',
  wound: 'wind',
  ground: 'grind',
  spun: 'spin',
  sank: 'sink',
  sunk: 'sink',
  shrank: 'shrink',
  shrunk: 'shrink',
  sprang: 'spring',
  sprung: 'spring',
  stank: 'stink',
  stung: 'sting',
  strung: 'string',
  strove: 'strive',
  striven: 'strive',
  swore: 'swear',
  sworn: 'swear',
  arose: 'arise',
  arisen: 'arise',
  awoke: 'awake',
  awoken: 'awake',
  mistook: 'mistake',
  mistaken: 'mistake',
  overcame: 'overcome',
  oversaw: 'oversee',
  overseen: 'oversee',
  overtook: 'overtake',
  overtaken: 'overtake',
  withdrew: 'withdraw',
  withdrawn: 'withdraw',
  withstood: 'withstand',
  underwent: 'undergo',
  undergone: 'undergo',
  undertook: 'undertake',
  undertaken: 'undertake',
  forbore: 'forbear',
  forborne: 'forbear',
  foresaw: 'foresee',
  foreseen: 'foresee',
  foretold: 'foretell',
  outgrew: 'outgrow',
  outgrown: 'outgrow',
  outran: 'outrun',
  outsold: 'outsell',
  overate: 'overeat',
  overeaten: 'overeat',
  overdid: 'overdo',
  overdone: 'overdo',
  overpaid: 'overpay',
  overrode: 'override',
  overridden: 'override',
  rebuilt: 'rebuild',
  redid: 'redo',
  redone: 'redo',
  remade: 'remake',
  repaid: 'repay',
  reset: 'reset',
  resold: 'resell',
  retold: 'retell',
  rewound: 'rewind',
  rewrote: 'rewrite',
  rewritten: 'rewrite',
  unbent: 'unbend',
  unbound: 'unbind',
  undid: 'undo',
  undone: 'undo',
  unwound: 'unwind',
};

// ========================================
// Helper Functions
// ========================================

/**
 * Remove doubled consonant from stem
 * "stopped" → "stopp" → "stop"
 */
function removeDuplicateConsonant(stem: string): string {
  if (stem.length < 2) return stem;
  const lastTwo = stem.slice(-2);
  if (lastTwo[0] === lastTwo[1] && isConsonant(lastTwo[0])) {
    return stem.slice(0, -1);
  }
  return stem;
}

/**
 * Restore 'e' if needed
 * "making" → "mak" → "make"
 * Only restore if stem follows CVC pattern where final C is k, c, g, v, z, th
 */
function restoreE(stem: string): string {
  if (stem.length < 2 || stem.endsWith('e')) {
    return stem;
  }

  // Check if stem ends with specific consonants that commonly have silent 'e'
  // mak→make, tak→take, giv→give, lov→love, writ→write, etc.
  const lastChar = stem[stem.length - 1];
  const beforeLast = stem[stem.length - 2];

  // Pattern: ends with single consonant after single vowel
  // AND the consonant is one that commonly has silent e
  const silentEConsonants = ['k', 'c', 'g', 'v', 'z', 't', 'd', 'n', 'l', 'r', 'b', 'm', 'p'];

  if (
    lastChar &&
    beforeLast &&
    isConsonant(lastChar) &&
    isVowel(beforeLast) &&
    silentEConsonants.includes(lastChar)
  ) {
    // Check if it's a CVC pattern
    if (stem.length >= 3) {
      const thirdLast = stem[stem.length - 3];
      if (thirdLast && isConsonant(thirdLast)) {
        return stem + 'e';
      }
    }
  }

  return stem;
}

/**
 * Restore 'y' from 'i'
 * "studied" → "studi" → "study"
 */
function restoreY(stem: string): string {
  if (stem.endsWith('i') && stem.length > 2) {
    const beforeI = stem[stem.length - 2];
    if (beforeI && isConsonant(beforeI)) {
      return stem.slice(0, -1) + 'y';
    }
  }
  return stem;
}

/**
 * Check if character is consonant
 */
function isConsonant(char: string): boolean {
  return Boolean(char && !/[aeiou]/i.test(char));
}

/**
 * Check if character is vowel
 */
function isVowel(char: string): boolean {
  return Boolean(char && /[aeiou]/i.test(char));
}

/**
 * Apply restoration rule to stem
 */
function restoreStem(stem: string, rule?: string): string {
  if (!rule) return stem;

  switch (rule) {
    case 'double':
      return removeDuplicateConsonant(stem);
    case 'e':
      return restoreE(stem);
    case 'y-to-i':
      return restoreY(stem);
    case 'consonant-y':
      // For -ify → -ification cases
      if (stem.endsWith('i')) {
        return stem.slice(0, -1) + 'y';
      }
      return stem;
    default:
      return stem;
  }
}

// ========================================
// Main Functions
// ========================================

/**
 * Decompose English word into morphemes
 * Examples:
 *   "unhappiness" → { prefix: "un", stem: "happy", suffix: "ness", type: "noun" }
 *   "stopped" → { prefix: "", stem: "stop", suffix: "ed", type: "verb" }
 */
export function decomposeEnglish(word: string): MorphemeResult {
  const original = word.toLowerCase();
  let remaining = original;
  let prefix = '';
  let suffix = '';
  let type = '';

  // Step 1: Check irregular verbs first
  if (IRREGULAR_VERBS[original]) {
    return {
      prefix: '',
      stem: IRREGULAR_VERBS[original],
      suffix: original,
      type: 'verb-irregular',
      original,
    };
  }

  // Step 2: Extract prefix (sort by length descending to match longest first)
  const sortedPrefixes = [...PREFIXES].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const { prefix: p } of sortedPrefixes) {
    if (remaining.startsWith(p) && remaining.length > p.length + 2) {
      // Ensure there's a stem left
      prefix = p;
      remaining = remaining.slice(p.length);
      break;
    }
  }

  // Step 3: Extract suffix (sort by pattern specificity)
  const sortedSuffixes = [...SUFFIXES].sort((a, b) => {
    // Longer patterns first for better matching
    const aLen = a.pattern.source.length;
    const bLen = b.pattern.source.length;
    return bLen - aLen;
  });

  for (const suffixInfo of sortedSuffixes) {
    if (suffixInfo.pattern.test(remaining)) {
      const match = remaining.match(suffixInfo.pattern);
      if (match) {
        suffix = match[0];
        type = suffixInfo.type;
        remaining = remaining.slice(0, -suffixInfo.remove);

        // Apply restoration rule
        remaining = restoreStem(remaining, suffixInfo.restoreRule);
        break;
      }
    }
  }

  return {
    prefix,
    stem: remaining,
    suffix,
    type: type || 'word',
    original,
  };
}

/**
 * Compose English word from morphemes
 * Examples:
 *   { prefix: "un", stem: "happy", suffix: "ness" } → "unhappiness"
 */
export function composeEnglish(parts: { prefix?: string; stem: string; suffix?: string }): string {
  let result = parts.stem;

  // Apply suffix with proper rules
  if (parts.suffix) {
    const suffixInfo = SUFFIXES.find((s) => s.pattern.source.includes(parts.suffix!));
    if (suffixInfo) {
      // Apply transformation based on suffix type
      if (suffixInfo.restoreRule === 'double') {
        // Double final consonant: stop → stopped
        const lastChar = result[result.length - 1];
        if (lastChar && isConsonant(lastChar)) {
          const beforeLast = result[result.length - 2];
          if (beforeLast && isVowel(beforeLast)) {
            result += lastChar; // Double it
          }
        }
      } else if (suffixInfo.restoreRule === 'e') {
        // Remove silent e: make → making
        if (result.endsWith('e')) {
          result = result.slice(0, -1);
        }
      } else if (suffixInfo.restoreRule === 'y-to-i') {
        // Change y to i: study → studied
        if (result.endsWith('y')) {
          result = result.slice(0, -1) + 'i';
        }
      }
    }
    result += parts.suffix;
  }

  // Add prefix
  if (parts.prefix) {
    result = parts.prefix + result;
  }

  return result;
}

/**
 * Get all possible decompositions for a word
 * (Some words can be decomposed in multiple ways)
 */
export function getAllDecompositions(word: string): MorphemeResult[] {
  const results: MorphemeResult[] = [];
  const primary = decomposeEnglish(word);
  results.push(primary);

  // Try without prefix
  if (primary.prefix) {
    const withoutPrefix = decomposeEnglish(primary.stem + primary.suffix);
    if (withoutPrefix.stem !== primary.stem) {
      results.push(withoutPrefix);
    }
  }

  return results;
}

/**
 * Check if a word is likely a valid English word
 * (Basic heuristic - can be improved with dictionary)
 */
export function isLikelyEnglishWord(word: string): boolean {
  // Too short
  if (word.length < 2) return false;

  // Must contain at least one vowel
  if (!/[aeiou]/i.test(word)) return false;

  // Too many consecutive consonants
  if (/[^aeiou]{5,}/i.test(word)) return false;

  return true;
}

/**
 * Extract stem from any English word form
 */
export function extractStem(word: string): string {
  return decomposeEnglish(word).stem;
}

/**
 * Get Korean translation hint for suffix
 */
export function getSuffixKorean(suffix: string): string | undefined {
  const suffixInfo = SUFFIXES.find((s) => s.pattern.source.includes(suffix));
  return suffixInfo?.ko;
}

/**
 * Get Korean translation hint for prefix
 */
export function getPrefixKorean(prefix: string): string | undefined {
  return PREFIXES.find((p) => p.prefix === prefix)?.ko;
}
