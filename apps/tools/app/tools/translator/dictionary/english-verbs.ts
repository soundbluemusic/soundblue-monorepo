// ========================================
// English Irregular Verbs - 영어 불규칙 동사
// ========================================

export interface VerbForms {
  base: string; // 원형
  past: string; // 과거형
  pp: string; // 과거분사
  ing: string; // 현재분사
  thirdPerson: string; // 3인칭 단수 현재
}

/**
 * 영어 불규칙 동사 사전
 */
export const irregularVerbs: Record<string, VerbForms> = {
  // === A ===
  be: { base: 'be', past: 'was', pp: 'been', ing: 'being', thirdPerson: 'is' },
  beat: { base: 'beat', past: 'beat', pp: 'beaten', ing: 'beating', thirdPerson: 'beats' },
  become: { base: 'become', past: 'became', pp: 'become', ing: 'becoming', thirdPerson: 'becomes' },
  begin: { base: 'begin', past: 'began', pp: 'begun', ing: 'beginning', thirdPerson: 'begins' },
  break: { base: 'break', past: 'broke', pp: 'broken', ing: 'breaking', thirdPerson: 'breaks' },
  bring: { base: 'bring', past: 'brought', pp: 'brought', ing: 'bringing', thirdPerson: 'brings' },
  build: { base: 'build', past: 'built', pp: 'built', ing: 'building', thirdPerson: 'builds' },
  buy: { base: 'buy', past: 'bought', pp: 'bought', ing: 'buying', thirdPerson: 'buys' },

  // === C ===
  catch: { base: 'catch', past: 'caught', pp: 'caught', ing: 'catching', thirdPerson: 'catches' },
  choose: { base: 'choose', past: 'chose', pp: 'chosen', ing: 'choosing', thirdPerson: 'chooses' },
  come: { base: 'come', past: 'came', pp: 'come', ing: 'coming', thirdPerson: 'comes' },
  cost: { base: 'cost', past: 'cost', pp: 'cost', ing: 'costing', thirdPerson: 'costs' },
  cut: { base: 'cut', past: 'cut', pp: 'cut', ing: 'cutting', thirdPerson: 'cuts' },

  // === D ===
  do: { base: 'do', past: 'did', pp: 'done', ing: 'doing', thirdPerson: 'does' },
  draw: { base: 'draw', past: 'drew', pp: 'drawn', ing: 'drawing', thirdPerson: 'draws' },
  drink: { base: 'drink', past: 'drank', pp: 'drunk', ing: 'drinking', thirdPerson: 'drinks' },
  drive: { base: 'drive', past: 'drove', pp: 'driven', ing: 'driving', thirdPerson: 'drives' },

  // === E ===
  eat: { base: 'eat', past: 'ate', pp: 'eaten', ing: 'eating', thirdPerson: 'eats' },

  // === F ===
  fall: { base: 'fall', past: 'fell', pp: 'fallen', ing: 'falling', thirdPerson: 'falls' },
  feel: { base: 'feel', past: 'felt', pp: 'felt', ing: 'feeling', thirdPerson: 'feels' },
  find: { base: 'find', past: 'found', pp: 'found', ing: 'finding', thirdPerson: 'finds' },
  fly: { base: 'fly', past: 'flew', pp: 'flown', ing: 'flying', thirdPerson: 'flies' },
  forget: {
    base: 'forget',
    past: 'forgot',
    pp: 'forgotten',
    ing: 'forgetting',
    thirdPerson: 'forgets',
  },

  // === G ===
  get: { base: 'get', past: 'got', pp: 'gotten', ing: 'getting', thirdPerson: 'gets' },
  give: { base: 'give', past: 'gave', pp: 'given', ing: 'giving', thirdPerson: 'gives' },
  go: { base: 'go', past: 'went', pp: 'gone', ing: 'going', thirdPerson: 'goes' },
  grow: { base: 'grow', past: 'grew', pp: 'grown', ing: 'growing', thirdPerson: 'grows' },

  // === H ===
  have: { base: 'have', past: 'had', pp: 'had', ing: 'having', thirdPerson: 'has' },
  hear: { base: 'hear', past: 'heard', pp: 'heard', ing: 'hearing', thirdPerson: 'hears' },
  hide: { base: 'hide', past: 'hid', pp: 'hidden', ing: 'hiding', thirdPerson: 'hides' },
  hit: { base: 'hit', past: 'hit', pp: 'hit', ing: 'hitting', thirdPerson: 'hits' },
  hold: { base: 'hold', past: 'held', pp: 'held', ing: 'holding', thirdPerson: 'holds' },
  hurt: { base: 'hurt', past: 'hurt', pp: 'hurt', ing: 'hurting', thirdPerson: 'hurts' },

  // === K ===
  keep: { base: 'keep', past: 'kept', pp: 'kept', ing: 'keeping', thirdPerson: 'keeps' },
  know: { base: 'know', past: 'knew', pp: 'known', ing: 'knowing', thirdPerson: 'knows' },

  // === L ===
  lead: { base: 'lead', past: 'led', pp: 'led', ing: 'leading', thirdPerson: 'leads' },
  learn: { base: 'learn', past: 'learned', pp: 'learned', ing: 'learning', thirdPerson: 'learns' },
  leave: { base: 'leave', past: 'left', pp: 'left', ing: 'leaving', thirdPerson: 'leaves' },
  let: { base: 'let', past: 'let', pp: 'let', ing: 'letting', thirdPerson: 'lets' },
  lie: { base: 'lie', past: 'lay', pp: 'lain', ing: 'lying', thirdPerson: 'lies' },
  lose: { base: 'lose', past: 'lost', pp: 'lost', ing: 'losing', thirdPerson: 'loses' },

  // === M ===
  make: { base: 'make', past: 'made', pp: 'made', ing: 'making', thirdPerson: 'makes' },
  mean: { base: 'mean', past: 'meant', pp: 'meant', ing: 'meaning', thirdPerson: 'means' },
  meet: { base: 'meet', past: 'met', pp: 'met', ing: 'meeting', thirdPerson: 'meets' },

  // === P ===
  pay: { base: 'pay', past: 'paid', pp: 'paid', ing: 'paying', thirdPerson: 'pays' },
  put: { base: 'put', past: 'put', pp: 'put', ing: 'putting', thirdPerson: 'puts' },

  // === R ===
  read: { base: 'read', past: 'read', pp: 'read', ing: 'reading', thirdPerson: 'reads' },
  ride: { base: 'ride', past: 'rode', pp: 'ridden', ing: 'riding', thirdPerson: 'rides' },
  ring: { base: 'ring', past: 'rang', pp: 'rung', ing: 'ringing', thirdPerson: 'rings' },
  rise: { base: 'rise', past: 'rose', pp: 'risen', ing: 'rising', thirdPerson: 'rises' },
  run: { base: 'run', past: 'ran', pp: 'run', ing: 'running', thirdPerson: 'runs' },

  // === S ===
  say: { base: 'say', past: 'said', pp: 'said', ing: 'saying', thirdPerson: 'says' },
  see: { base: 'see', past: 'saw', pp: 'seen', ing: 'seeing', thirdPerson: 'sees' },
  sell: { base: 'sell', past: 'sold', pp: 'sold', ing: 'selling', thirdPerson: 'sells' },
  send: { base: 'send', past: 'sent', pp: 'sent', ing: 'sending', thirdPerson: 'sends' },
  set: { base: 'set', past: 'set', pp: 'set', ing: 'setting', thirdPerson: 'sets' },
  shake: { base: 'shake', past: 'shook', pp: 'shaken', ing: 'shaking', thirdPerson: 'shakes' },
  shine: { base: 'shine', past: 'shone', pp: 'shone', ing: 'shining', thirdPerson: 'shines' },
  show: { base: 'show', past: 'showed', pp: 'shown', ing: 'showing', thirdPerson: 'shows' },
  shut: { base: 'shut', past: 'shut', pp: 'shut', ing: 'shutting', thirdPerson: 'shuts' },
  sing: { base: 'sing', past: 'sang', pp: 'sung', ing: 'singing', thirdPerson: 'sings' },
  sit: { base: 'sit', past: 'sat', pp: 'sat', ing: 'sitting', thirdPerson: 'sits' },
  sleep: { base: 'sleep', past: 'slept', pp: 'slept', ing: 'sleeping', thirdPerson: 'sleeps' },
  speak: { base: 'speak', past: 'spoke', pp: 'spoken', ing: 'speaking', thirdPerson: 'speaks' },
  spend: { base: 'spend', past: 'spent', pp: 'spent', ing: 'spending', thirdPerson: 'spends' },
  stand: { base: 'stand', past: 'stood', pp: 'stood', ing: 'standing', thirdPerson: 'stands' },
  steal: { base: 'steal', past: 'stole', pp: 'stolen', ing: 'stealing', thirdPerson: 'steals' },
  swim: { base: 'swim', past: 'swam', pp: 'swum', ing: 'swimming', thirdPerson: 'swims' },

  // === T ===
  take: { base: 'take', past: 'took', pp: 'taken', ing: 'taking', thirdPerson: 'takes' },
  teach: { base: 'teach', past: 'taught', pp: 'taught', ing: 'teaching', thirdPerson: 'teaches' },
  tell: { base: 'tell', past: 'told', pp: 'told', ing: 'telling', thirdPerson: 'tells' },
  think: { base: 'think', past: 'thought', pp: 'thought', ing: 'thinking', thirdPerson: 'thinks' },
  throw: { base: 'throw', past: 'threw', pp: 'thrown', ing: 'throwing', thirdPerson: 'throws' },

  // === U ===
  understand: {
    base: 'understand',
    past: 'understood',
    pp: 'understood',
    ing: 'understanding',
    thirdPerson: 'understands',
  },

  // === W ===
  wake: { base: 'wake', past: 'woke', pp: 'woken', ing: 'waking', thirdPerson: 'wakes' },
  wear: { base: 'wear', past: 'wore', pp: 'worn', ing: 'wearing', thirdPerson: 'wears' },
  win: { base: 'win', past: 'won', pp: 'won', ing: 'winning', thirdPerson: 'wins' },
  write: { base: 'write', past: 'wrote', pp: 'written', ing: 'writing', thirdPerson: 'writes' },
};

/**
 * 영어 동사 시제 변환
 */
export function conjugateEnglishVerb(
  verb: string,
  tense: 'present' | 'past' | 'future' | 'progressive',
  subject?: string,
): string {
  const lowerVerb = verb.toLowerCase();
  const irregular = irregularVerbs[lowerVerb];

  switch (tense) {
    case 'past':
      if (irregular) {
        return irregular.past;
      }
      // 규칙 동사 과거형
      return makeRegularPast(verb);

    case 'future':
      return `will ${verb}`;

    case 'progressive':
      if (irregular) {
        return irregular.ing;
      }
      return makeProgressiveForm(verb);
    default:
      // 3인칭 단수 처리
      if (subject && isThirdPersonSingular(subject)) {
        if (irregular) {
          return irregular.thirdPerson;
        }
        return makeThirdPersonSingular(verb);
      }
      return verb;
  }
}

/**
 * 규칙 동사 과거형 생성
 */
function makeRegularPast(verb: string): string {
  if (verb.endsWith('e')) {
    return `${verb}d`;
  }
  const secondLastChar = verb[verb.length - 2] ?? '';
  if (verb.endsWith('y') && !isVowel(secondLastChar)) {
    return `${verb.slice(0, -1)}ied`;
  }
  // 단모음 + 단자음 → 자음 중복
  if (shouldDoubleConsonant(verb)) {
    return `${verb}${verb[verb.length - 1] ?? ''}ed`;
  }
  return `${verb}ed`;
}

/**
 * 현재진행형 생성
 */
function makeProgressiveForm(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee')) {
    return `${verb.slice(0, -1)}ing`;
  }
  if (verb.endsWith('ie')) {
    return `${verb.slice(0, -2)}ying`;
  }
  if (shouldDoubleConsonant(verb)) {
    return `${verb}${verb[verb.length - 1] ?? ''}ing`;
  }
  return `${verb}ing`;
}

/**
 * 3인칭 단수 현재형 생성
 */
function makeThirdPersonSingular(verb: string): string {
  if (
    verb.endsWith('s') ||
    verb.endsWith('sh') ||
    verb.endsWith('ch') ||
    verb.endsWith('x') ||
    verb.endsWith('o')
  ) {
    return `${verb}es`;
  }
  const secondLastChar = verb[verb.length - 2] ?? '';
  if (verb.endsWith('y') && !isVowel(secondLastChar)) {
    return `${verb.slice(0, -1)}ies`;
  }
  return `${verb}s`;
}

/**
 * 3인칭 단수 주어인지 확인
 */
function isThirdPersonSingular(subject: string): boolean {
  const lower = subject.toLowerCase();
  return lower === 'he' || lower === 'she' || lower === 'it';
}

/**
 * 모음인지 확인
 */
function isVowel(char: string): boolean {
  return 'aeiou'.includes(char?.toLowerCase() ?? '');
}

/**
 * 자음 중복 필요 여부
 * stop → stopped, run → running
 */
function shouldDoubleConsonant(verb: string): boolean {
  if (verb.length < 2) return false;

  const lastChar = verb[verb.length - 1] ?? '';
  const secondLastChar = verb[verb.length - 2] ?? '';

  // 마지막이 자음이고, 그 앞이 단모음인 경우
  if (!isVowel(lastChar) && isVowel(secondLastChar)) {
    // 2음절 이상이고 마지막 음절에 강세가 있는 경우 (간단히 처리)
    // w, x, y로 끝나는 경우는 제외
    if ('wxy'.includes(lastChar)) return false;

    // 짧은 단어 (1음절)
    if (verb.length <= 3) return true;
  }

  return false;
}
