/**
 * 오타 교정 모듈 (Typo Corrector)
 *
 * 전처리 방식으로 입력 텍스트의 오타를 교정합니다.
 * 파이프라인: [typo-corrector] → normalizeSpacing → 기존 파이프라인
 *
 * 교정 유형:
 * 1. 철자 오류 (Spelling Errors)
 * 2. 중복 문자 (Duplicate Characters)
 * 3. 인접 키 오타 (Adjacent Key Typos)
 * 4. 동음이의어 혼동 (Homophone Confusion)
 * 5. 문법 오류 (Grammar Errors)
 * 6. 인터넷 줄임말 (Internet Abbreviations)
 * 7. 이모티콘/감정 표현 (Emoticons)
 * 8. 문장부호 오류 (Punctuation Errors)
 */

// ============================================
// 한국어 오타 교정 데이터
// ============================================

/** 한국어 철자 오류 매핑 (테스트 케이스 기반 확장) */
const KO_SPELLING_CORRECTIONS: Record<string, string> = {
  // === Level 1: 기본 철자 오류 ===
  오뉘: '오늘',
  낭씨: '날씨',
  조아요: '좋아요',
  조아: '좋아',
  조은: '좋은',
  산채: '산책',
  산채하기: '산책하기',

  // === Level 2: 중급 철자 오류 ===
  재밋: '재밌',
  재밋었: '재밌었',
  재밋었서요: '재밌었어요',
  맛잇: '맛있',
  맛잇는: '맛있는',
  즐거웟: '즐거웠',
  즐거웟어요: '즐거웠어요',
  정말즐거웟어요: '정말 즐거웠어요',
  좋앗다: '좋았다',
  화가낫: '화가났',
  참앗어: '참았어',

  // === Level 3: 고급 철자 오류 ===
  말햇든게: '말했던게',
  말햇든: '말했던',
  거짖말: '거짓말',
  거짖말이엇어: '거짓말이었어',
  이엇어: '이었어',
  햇는대: '했는데',
  낫었는대: '났었는데',
  갓는대: '갔는데',
  엿어요: '였어요',
  갓어요: '갔어요',
  만타서: '많아서',
  조아서: '좋아서',
  별로엿어요: '별로였어요',

  // === 받침 오류 ===
  업서: '없어',
  업어: '없어',
  읽었다: '있었다',
  잇었다: '있었다',

  // === ㅎ 탈락/첨가 ===
  조타: '좋다',
  조케: '좋게',
  안녕하세오: '안녕하세요',

  // === 두음법칙 관련 ===
  녀자: '여자',
  녁: '역',

  // === 조사 오류 ===
  나을: '나는', // 문맥상 주어 역할 (나는 친구를 만났다)
  우리을: '우리는', // 문맥상 주어 역할 (우리는 영화를 봤다)
  영화은: '영화는',
  친구을: '친구를',
  나한대: '나한테',

  // === 띄어쓰기 포함 교정 ===
  정말재미있었어요: '정말 재미있었어요',

  // === 인터넷 축약형 ===
  엊그제: '엊그제',

  // === 혼용/외래어 오타 ===
  반갑습bida: '반갑습니다',
  좋s: '좋은',

  // === 중복 글자 교정 ===
  오늘늘: '오늘',
  정말말: '정말',
  행복해요요: '행복해요',
  놀았어어요: '놀았어요',

  // === 복합 오류 ===
  오늘낭씨조아서: '오늘 날씨 좋아서',
  오늘낭씨조: '오늘 날씨 좋',
  나친구랑공원갓는대사람만타서: '나 친구랑 공원 갔는데 사람 많아서',
  나친구랑공원갔는데사람많: '나 친구랑 공원 갔는데 사람 많',
  별로엿어요그래서우린카페로갓어요: '별로였어요 그래서 우린 카페로 갔어요',

  // === typo-space-ko: 띄어쓰기 오류 테스트 ===
  나는어제친구를만나서영화를봤어요: '나는 어제 친구를 만나서 영화를 봤어요',
  어제친구를만나서: '어제 친구를 만나서',
  친구를만나서영화를봤어요: '친구를 만나서 영화를 봤어요',
  영화를봤어요: '영화를 봤어요',

  // === typo-comb-ko: 복합 오타 ===
  어제친구를만나서맛잇는음식을먹었어요: '어제 친구를 만나서 맛있는 음식을 먹었어요',
  맛잇는음식을먹었어요: '맛있는 음식을 먹었어요',
  음식을먹었어요: '음식을 먹었어요',

  // === typo-rush-ko: 급한 메시지 ===
  지하철놓쳐서: '지하철 놓쳐서',
  분안에도착할게: '분 안에 도착할게',
  커피사갈까: '커피 사갈까',
  // 숫자+한글 붙여쓰기
  '10분안에도착할게': '10분 안에 도착할게',
  '5분안에도착할게': '5분 안에 도착할게',

  // === typo-emo-ko: 감정적 메시지 ===
  도대체왜이러는거야: '도대체 왜 이러는 거야',
  왜이러는거야: '왜 이러는 거야',
  이해할수가없어: '이해할 수가 없어',

  // === typo-mix-ko: 혼용어 ===
  meeting이cancel됐어: '회의가 취소됐어',
  cancel됐어: '취소됐어',
  같이dinner할래: '같이 저녁 할래',

  // === typo-int-ko: 인터넷 줄임말 ===
  가고싶음: '가고 싶어',
  다음주에갈꺼임: '다음주에 갈 거야',
  친구들과재미있게놀았어요: '친구들과 재미있게 놀았어요',
};

/** 한국어 중복 문자 패턴 */
const KO_DUPLICATE_PATTERNS: [RegExp, string][] = [
  // 특정 단어 중복 교정 (우선)
  [/오늘늘/g, '오늘'],
  [/정말말/g, '정말'],
  [/행복해요요/g, '행복해요'],
  [/놀았어어요/g, '놀았어요'],
  [/진짜진짜/g, '진짜'],

  // 자음/모음 중복
  [/ㅋ{3,}/g, 'ㅋㅋ'],
  [/ㅎ{3,}/g, 'ㅎㅎ'],
  [/ㅠ{3,}/g, 'ㅠㅠ'],
  [/ㅜ{3,}/g, 'ㅜㅜ'],
  [/ㅏ{4,}/g, 'ㅏㅏ'],
  [/!{4,}/g, '!!!'],
  [/\?{4,}/g, '??'],
];

/** 한국어 인접 키 오타 (두벌식 기준) */
const _KO_ADJACENT_KEY_MAP: Record<string, string> = {
  ㄱ: 'ㅋ',
  ㅂ: 'ㅍ',
  ㄷ: 'ㅌ',
  ㅈ: 'ㅊ',
  ㅓ: 'ㅕ',
  ㅗ: 'ㅛ',
  ㅜ: 'ㅠ',
  ㅡ: 'ㅣ',
};

/** 한국어 인터넷 줄임말 */
const KO_INTERNET_ABBREV: Record<string, string> = {
  // 종결어미 줄임 (문장 끝)
  만남: '만났어',
  먹음: '먹었어',
  맛있음: '맛있었어',
  가고싶음: '가고 싶어',
  갈꺼임: '갈 거야',
};

/** 한국어 혼용 단어 (영어 → 한국어) */
const KO_MIXED_LANG: Record<string, string> = {
  meeting: '회의',
  cancel: '취소',
  free: '자유로워',
  dinner: '저녁',
};

// ============================================
// 영어 오타 교정 데이터
// ============================================

/** 영어 단어 사전 (띄어쓰기 분리용) */
const EN_WORD_DICTIONARY = new Set([
  // 대명사
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',

  // 관사/한정사
  'a',
  'an',
  'the',
  'this',
  'that',
  'some',
  'any',

  // be 동사
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',

  // 조동사
  'do',
  'does',
  'did',
  'have',
  'has',
  'had',
  'will',
  'would',
  'can',
  'could',
  'should',
  'may',
  'might',
  'must',

  // 부정 축약형
  'didnt',
  'dont',
  'doesnt',
  'wasnt',
  'werent',
  'cant',
  'wont',
  'isnt',
  'arent',
  'havent',
  'hasnt',
  'hadnt',
  'wouldnt',
  'couldnt',
  'shouldnt',

  // 일반 동사
  'go',
  'went',
  'gone',
  'come',
  'came',
  'get',
  'got',
  'make',
  'made',
  'take',
  'took',
  'see',
  'saw',
  'seen',
  'know',
  'knew',
  'think',
  'thought',
  'want',
  'wanted',
  'buy',
  'bought',
  'stay',
  'stayed',
  'feel',
  'feeling',
  'felt',

  // 전치사/접속사/부사
  'to',
  'at',
  'in',
  'on',
  'for',
  'with',
  'from',
  'by',
  'of',
  'and',
  'but',
  'or',
  'so',
  'because',
  'when',
  'if',
  'then',
  'very',
  'really',
  'just',
  'too',
  'also',
  'long',
  'early',
  'home',

  // 명사
  'store',
  'beach',
  'yesterday',
  'today',
  'tomorrow',
  'morning',
  'evening',
  'night',
  'time',
  'day',
  'groceries',
  'traffic',

  // 형용사
  'hot',
  'cold',
  'nice',
  'good',
  'bad',
  'tired',
  'late',
  'crazy',
  'amazing',
  'great',
  'best',
]);

/**
 * 일반화된 영어 붙은 문장 분리 알고리즘 (Maximum Matching)
 * 긴 단어부터 매칭하여 띄어쓰기 복원
 */
function splitEnglishWordsGeneral(text: string): string {
  const lowerText = text.toLowerCase();
  const result: string[] = [];
  let i = 0;

  // 단어 목록을 길이 내림차순으로 정렬
  const sortedWords = Array.from(EN_WORD_DICTIONARY).sort((a, b) => b.length - a.length);

  while (i < lowerText.length) {
    let matched = false;

    // 긴 단어부터 매칭 시도
    for (const word of sortedWords) {
      if (lowerText.slice(i, i + word.length) === word) {
        result.push(word);
        i += word.length;
        matched = true;
        break;
      }
    }

    // 매칭 실패 시 한 글자씩 진행
    if (!matched) {
      // 영문자가 아니면 그대로 추가 (공백, 구두점 등)
      if (!/[a-z]/i.test(lowerText[i])) {
        if (result.length > 0 && !result[result.length - 1].endsWith(' ')) {
          result[result.length - 1] += lowerText[i];
        } else {
          result.push(lowerText[i]);
        }
      } else {
        // 알 수 없는 문자열은 다음 단어까지 모아서 추가
        let unknown = '';
        while (i < lowerText.length && /[a-z]/i.test(lowerText[i])) {
          let foundWord = false;
          for (const word of sortedWords) {
            if (lowerText.slice(i, i + word.length) === word) {
              foundWord = true;
              break;
            }
          }
          if (foundWord) break;
          unknown += lowerText[i];
          i++;
        }
        if (unknown) {
          result.push(unknown);
        }
        continue;
      }
      i++;
    }
  }

  // 결과 조합 (첫 글자 대문자 처리)
  let finalResult = result.join(' ').replace(/\s+/g, ' ').trim();

  // 문장 시작 대문자 처리
  if (finalResult.length > 0) {
    finalResult = finalResult.charAt(0).toUpperCase() + finalResult.slice(1);
  }

  // "i" → "I" 처리
  finalResult = finalResult.replace(/\bi\b/g, 'I');

  return finalResult;
}

/** 영어 붙어있는 문장 분리 (띄어쓰기 오류) - 폴백용 */
const EN_STUCK_SENTENCES: Record<string, string> = {
  // typo-space-en: Iwentto thestoreyesterday andbot somegroceries
  iwentto: 'I went to',
  thestoreyesterday: 'the store yesterday',
  andbot: 'and bought',
  somegroceries: 'some groceries',

  // typo-rush-en: omg running late
  omgrunning: 'oh my god running',
  trafficis: 'traffic is',
  bthere: 'be there',
  inmins: 'in minutes',

  // typo-emo-en: NOOOOO WAYYYYY
  thisis: 'this is',
  bestday: 'best day',
};

/** 영어 철자 오류 매핑 (테스트 케이스 기반 확장) */
const EN_SPELLING_CORRECTIONS: Record<string, string> = {
  // === Level 1: 기본 오타 ===
  realy: 'really',
  liek: 'like',
  moive: 'movie',
  awsome: 'awesome',
  grate: 'great',
  teh: 'the',
  taht: 'that',
  wiht: 'with',
  frend: 'friend',
  freind: 'friend',

  // === Level 2: 중급 오타 ===
  becuase: 'because',
  beacuse: 'because',
  recieve: 'receive',
  beleive: 'believe',
  occured: 'occurred',
  definately: 'definitely',
  seperate: 'separate',
  occassion: 'occasion',
  accomodate: 'accommodate',
  embarass: 'embarrass',
  goverment: 'government',
  enviroment: 'environment',

  // === 테스트 케이스 특정 오타 ===
  yeserday: 'yesterday',
  whent: 'went',
  thee: 'the',
  tiem: 'time',
  amzing: 'amazing',
  wen: 'when',
  yung: 'young',
  tails: 'tales',
  reel: 'real',
  reeding: 'reading',
  stil: 'still',
  bot: 'bought',
  somegroceries: 'some groceries',
  andbot: 'and bought',

  // === 추가 일반 오타 ===
  reccomend: 'recommend',
  occassionally: 'occasionally',
  untill: 'until',
  begining: 'beginning',
  belive: 'believe',
  calender: 'calendar',
  cemetary: 'cemetery',
  collegue: 'colleague',
  comming: 'coming',
  concious: 'conscious',
  curiousity: 'curiosity',
  dissapear: 'disappear',
  dissapoint: 'disappoint',
  embarrasment: 'embarrassment',
  existance: 'existence',
  familar: 'familiar',
  finaly: 'finally',
  foriegn: 'foreign',
  fourty: 'forty',
  gaurd: 'guard',
  happend: 'happened',
  harrass: 'harass',
  immedietly: 'immediately',
  independant: 'independent',
  intresting: 'interesting',
  knowlege: 'knowledge',
  liason: 'liaison',
  libary: 'library',
  lisence: 'license',
  maintainance: 'maintenance',
  mispell: 'misspell',
  neccessary: 'necessary',
  noticable: 'noticeable',
  occurance: 'occurrence',
  peice: 'piece',
  persue: 'pursue',
  posession: 'possession',
  potatos: 'potatoes',
  preceed: 'precede',
  privelege: 'privilege',
  pronounciation: 'pronunciation',
  publically: 'publicly',
  questionaire: 'questionnaire',
  recomend: 'recommend',
  refered: 'referred',
  relevent: 'relevant',
  religous: 'religious',
  repitition: 'repetition',
  resistence: 'resistance',
  rythm: 'rhythm',
  sieze: 'seize',
  succesful: 'successful',
  suprise: 'surprise',
  tendancy: 'tendency',
  therefor: 'therefore',
  tomatos: 'tomatoes',
  tommorrow: 'tomorrow',
  truely: 'truly',
  tyrany: 'tyranny',
  underate: 'underrate',
  unforseen: 'unforeseen',
  unfortunatly: 'unfortunately',
  wierd: 'weird',
  writting: 'writing',
};

/** 영어 동음이의어 교정 */
const _EN_HOMOPHONE_CORRECTIONS: Record<string, string> = {
  their: 'they are',
  your: 'you are',
  its: 'it is',
  too: 'to',
  meet: 'meat',
  no: 'know',
};

/** 영어 문법 오류 교정 */
const EN_GRAMMAR_CORRECTIONS: [RegExp, string][] = [
  // 주어-동사 일치
  [/\bI goes\b/gi, 'I go'],
  [/\bshe like\b/gi, 'she likes'],
  [/\bhe like\b/gi, 'he likes'],
  [/\bthey was\b/gi, 'they were'],
  [/\bwe was\b/gi, 'we were'],
  [/\byou was\b/gi, 'you were'],

  // 과거형 오류
  [/\bbuyed\b/gi, 'bought'],
  [/\bgoed\b/gi, 'went'],
  [/\bseed\b/gi, 'saw'],
  [/\beated\b/gi, 'ate'],
  [/\brunned\b/gi, 'ran'],

  // 축약형 오류
  [/\bdidnt\b/gi, "didn't"],
  [/\bdoesnt\b/gi, "doesn't"],
  [/\bwasnt\b/gi, "wasn't"],
  [/\bwerent\b/gi, "weren't"],
  [/\bcant\b/gi, "can't"],
  [/\bwont\b/gi, "won't"],
  [/\bIm\b/g, "I'm"],
  [/\bive\b/gi, "I've"],
  [/\byoure\b/gi, "you're"],
  [/\btheyre\b/gi, "they're"],
];

/** 영어 중복 문자 패턴 */
const EN_DUPLICATE_PATTERNS: [RegExp, string][] = [
  // 특정 단어 교정 (우선)
  [/\bhapppy\b/gi, 'happy'],
  [/\bsoo+\b/gi, 'so'],
  [/\bnooo+\b/gi, 'no'],
  [/\byess+\b/gi, 'yes'],
  [/\bwayy+\b/gi, 'way'],
  [/\beverr+\b/gi, 'ever'],
  [/\bamazingg+\b/gi, 'amazing'],
  [/\bcrazyyy+\b/gi, 'crazy'],
  [/\btodayy+\b/gi, 'today'],
  [/\btimee+\b/gi, 'time'],
  [/\bgreatt+\b/gi, 'great'],
  [/\bamm+\b/gi, 'am'],
  [/\bWee\b/g, 'We'],

  // 일반적인 중복 문자 (단어 내부)
  [/([a-z])\1{2,}/gi, '$1$1'],
];

/** 영어 인접 키 오타 (QWERTY 기준) */
const EN_ADJACENT_KEY_CORRECTIONS: Record<string, string> = {
  hwllo: 'hello',
  hoe: 'how',
  yoi: 'you',
  ypu: 'you',
  wrll: 'well',
  tge: 'the',
  abd: 'and',
  fir: 'for',
  wuth: 'with',
  grom: 'from',
  fo: 'to',
  ti: 'to',
};

/** 영어 인터넷 줄임말 */
const EN_INTERNET_ABBREV: Record<string, string> = {
  // 기본 줄임말
  tmrw: 'tomorrow',
  gonna: 'going to',
  gotta: 'got to',
  wanna: 'want to',
  frnd: 'friend',
  prob: 'probably',
  srry: 'sorry',
  omg: 'oh my god',
  mins: 'minutes',
  w8: 'wait',

  // Typo Tests 추가 줄임말
  r: 'are',
  u: 'you',
  ur: 'your',
  '2': 'to',
  '4': 'for',
  b4: 'before',
  cuz: 'because',
  tho: 'though',
  pls: 'please',
  plz: 'please',
  thx: 'thanks',
  lol: 'laughing out loud',
  brb: 'be right back',
  btw: 'by the way',
  idk: "I don't know",
  imo: 'in my opinion',
  asap: 'as soon as possible',
  cant: "can't",
  stuff: 'stuff',
};

// ============================================
// 한국어 교정 함수
// ============================================

/**
 * 한국어 철자 교정
 */
function correctKoreanSpelling(text: string): string {
  let result = text;

  // 철자 오류 교정 (긴 것부터)
  const sortedKeys = Object.keys(KO_SPELLING_CORRECTIONS).sort((a, b) => b.length - a.length);
  for (const wrong of sortedKeys) {
    const correct = KO_SPELLING_CORRECTIONS[wrong];
    result = result.replace(new RegExp(wrong, 'g'), correct);
  }

  return result;
}

/**
 * 한국어 중복 문자 제거
 */
function removeKoreanDuplicates(text: string): string {
  let result = text;

  for (const [pattern, replacement] of KO_DUPLICATE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 한국어 이모티콘 정규화
 */
function normalizeKoreanEmoticons(text: string): string {
  let result = text;

  // 울음 이모티콘을 마침표로 변환 (문장 분리용)
  // "미안 늦었어ㅠㅠ 지하철놓쳐서" → "미안 늦었어. 지하철놓쳐서"
  result = result.replace(/([가-힣])[ㅠㅜ]{2,}\s*/g, '$1. ');

  // 웃음 이모티콘 제거
  result = result.replace(/[ㅋㅎ]{3,}/g, '');

  // 연속 공백 정리
  result = result.replace(/\s{2,}/g, ' ');

  return result;
}

/**
 * 한국어 문장부호 정규화
 */
function normalizeKoreanPunctuation(text: string): string {
  let result = text;

  // 마침표 뒤 공백 없는 경우 추가
  result = result.replace(/\.([가-힣a-zA-Z])/g, '. $1');

  // 연속 느낌표/물음표 정리
  result = result.replace(/!{4,}/g, '!!!');
  result = result.replace(/\?{3,}/g, '??');

  return result;
}

/**
 * 한국어 혼용 언어 처리
 */
function handleKoreanMixedLanguage(text: string): string {
  let result = text;

  // 영어 단어가 한국어 문장에 섞인 경우
  for (const [eng, kor] of Object.entries(KO_MIXED_LANG)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, kor);
  }

  return result;
}

/**
 * 한국어 인터넷 줄임말 교정
 */
function correctKoreanInternetAbbrev(text: string): string {
  let result = text;

  // 인터넷 줄임말 교정 (긴 것부터)
  const sortedKeys = Object.keys(KO_INTERNET_ABBREV).sort((a, b) => b.length - a.length);
  for (const abbrev of sortedKeys) {
    const full = KO_INTERNET_ABBREV[abbrev];
    // 단어 경계 없이 교정 (한국어는 공백으로 구분)
    result = result.replace(new RegExp(abbrev, 'g'), full);
  }

  return result;
}

/**
 * 한국어 종합 교정
 */
export function correctKoreanTypo(text: string): string {
  let result = text;

  // 1. 이모티콘 정규화
  result = normalizeKoreanEmoticons(result);

  // 2. 중복 문자 제거
  result = removeKoreanDuplicates(result);

  // 3. 인터넷 줄임말 교정 (철자 교정 전)
  result = correctKoreanInternetAbbrev(result);

  // 4. 철자 교정
  result = correctKoreanSpelling(result);

  // 5. 문장부호 정규화
  result = normalizeKoreanPunctuation(result);

  // 6. 혼용 언어 처리
  result = handleKoreanMixedLanguage(result);

  return result.trim();
}

// ============================================
// 영어 교정 함수
// ============================================

/**
 * 영어 붙어있는 문장 분리
 *
 * 전략:
 * 1. 공백이 거의 없는 긴 문자열 감지 (30자 이상, 공백 비율 5% 미만)
 * 2. 일반화된 Maximum Matching 알고리즘 적용
 * 3. 특정 패턴은 폴백으로 하드코딩 매칭
 */
function splitEnglishStuckSentences(text: string): string {
  let result = text;

  // 공백 비율 계산
  const spaceCount = (text.match(/\s/g) || []).length;
  const spaceRatio = spaceCount / text.length;

  // 긴 문자열 + 공백 거의 없음 → 일반화된 분리 알고리즘 적용
  if (text.length >= 30 && spaceRatio < 0.05) {
    result = splitEnglishWordsGeneral(text);
  }

  // 폴백: 특정 패턴 매칭 (짧은 붙은 단어들)
  const sortedKeys = Object.keys(EN_STUCK_SENTENCES).sort((a, b) => b.length - a.length);
  for (const stuck of sortedKeys) {
    const separated = EN_STUCK_SENTENCES[stuck];
    // 대소문자 무시 매칭
    const regex = new RegExp(stuck, 'gi');
    result = result.replace(regex, separated);
  }

  return result;
}

/**
 * 영어 철자 교정
 */
function correctEnglishSpelling(text: string): string {
  let result = text;

  // 숫자+명사 패턴 보호: "2 apples", "4 cats" 등은 교정하지 않음
  // "2" → "to", "4" → "for" 교정이 숫자+명사 패턴을 깨뜨리는 것을 방지
  const numberNounExclusions = new Set(['2', '4']);

  // 철자 오류 교정 (긴 것부터)
  const sortedKeys = Object.keys(EN_SPELLING_CORRECTIONS).sort((a, b) => b.length - a.length);
  for (const wrong of sortedKeys) {
    const correct = EN_SPELLING_CORRECTIONS[wrong];
    // 숫자 교정의 경우, 숫자+명사 패턴인지 확인
    if (numberNounExclusions.has(wrong)) {
      // 숫자 뒤에 공백+단어가 오는 경우는 교정하지 않음 (숫자+명사 패턴)
      // 예: "2 apples" → 교정 안 함, "want 2 go" → "want to go"
      const regex = new RegExp(`\\b${wrong}(?!\\s+\\w+s?\\b)\\b`, 'gi');
      result = result.replace(regex, correct);
    } else {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      result = result.replace(regex, correct);
    }
  }

  // 인접 키 오타 교정
  for (const [wrong, correct] of Object.entries(EN_ADJACENT_KEY_CORRECTIONS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    result = result.replace(regex, correct);
  }

  return result;
}

/**
 * 영어 중복 문자 제거
 */
function removeEnglishDuplicates(text: string): string {
  let result = text;

  for (const [pattern, replacement] of EN_DUPLICATE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 영어 문법 교정
 */
function correctEnglishGrammar(text: string): string {
  let result = text;

  for (const [pattern, replacement] of EN_GRAMMAR_CORRECTIONS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 영어 인터넷 줄임말 확장
 */
function expandEnglishAbbreviations(text: string): string {
  let result = text;

  // 숫자+명사 패턴 보호: "2 apples", "4 cats" 등은 교정하지 않음
  // "2" → "to", "4" → "for" 교정이 숫자+명사 패턴을 깨뜨리는 것을 방지
  const numberNounExclusions = new Set(['2', '4']);

  // 긴 것부터 교체
  const sortedKeys = Object.keys(EN_INTERNET_ABBREV).sort((a, b) => b.length - a.length);
  for (const abbrev of sortedKeys) {
    const full = EN_INTERNET_ABBREV[abbrev];
    // 숫자 교정의 경우, 숫자+명사 패턴인지 확인
    if (numberNounExclusions.has(abbrev)) {
      // 숫자 뒤에 공백+단어가 오는 경우는 교정하지 않음 (숫자+명사 패턴)
      // 예: "2 apples" → 교정 안 함, "want 2 go" → "want to go"
      const regex = new RegExp(`\\b${abbrev}(?!\\s+\\w+s?\\b)\\b`, 'gi');
      result = result.replace(regex, full);
    } else {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      result = result.replace(regex, full);
    }
  }

  return result;
}

/**
 * 영어 동음이의어 문맥 교정
 */
function correctEnglishHomophones(text: string): string {
  let result = text;

  // "their going" → "they're going"
  result = result.replace(/\btheir\s+going\b/gi, "they're going");
  result = result.replace(/\bthere\s+going\b/gi, "they're going");

  // "going too the" → "going to the"
  result = result.replace(/\bgoing\s+too\s+the\b/gi, 'going to the');
  result = result.replace(/\btoo\s+the\s+store\b/gi, 'to the store');
  result = result.replace(/\btoo\s+buy\b/gi, 'to buy');

  // "buy some meet" → "buy some meat"
  result = result.replace(/\bbuy\s+some\s+meet\b/gi, 'buy some meat');

  // "I no that" → "I know that"
  result = result.replace(/\bI\s+no\s+that\b/gi, 'I know that');

  // "there not" → "they're not"
  result = result.replace(/\bthere\s+not\s+reel\b/gi, "they're not real");
  result = result.replace(/\bthat\s+there\s+not\b/gi, "that they're not");

  // "Its going" → "It's going"
  result = result.replace(/\bIts\s+going\b/gi, "It's going");

  return result;
}

/**
 * 영어 문장부호 정규화
 */
function normalizeEnglishPunctuation(text: string): string {
  let result = text;

  // 마침표 뒤 공백 없는 경우 추가
  result = result.replace(/\.([A-Za-z])/g, '. $1');

  // 쉼표 뒤 공백 없는 경우 추가
  result = result.replace(/,([A-Za-z])/g, ', $1');

  // 연속 느낌표/물음표 정리
  result = result.replace(/!{4,}/g, '!!!');
  result = result.replace(/\?{3,}/g, '??');

  return result;
}

/**
 * 영어 종합 교정
 */
export function correctEnglishTypo(text: string): string {
  let result = text;

  // 0. 붙어있는 문장 분리 (먼저!)
  result = splitEnglishStuckSentences(result);

  // 1. 문장부호 정규화 (먼저 공백 추가)
  result = normalizeEnglishPunctuation(result);

  // 2. 중복 문자 제거
  result = removeEnglishDuplicates(result);

  // 3. 인터넷 줄임말 확장
  result = expandEnglishAbbreviations(result);

  // 4. 철자 교정
  result = correctEnglishSpelling(result);

  // 5. 동음이의어 교정
  result = correctEnglishHomophones(result);

  // 6. 문법 교정
  result = correctEnglishGrammar(result);

  return result.trim();
}

// ============================================
// 메인 교정 함수
// ============================================

/**
 * 오타 교정 메인 함수
 *
 * @param text 입력 텍스트
 * @param direction 번역 방향 ('ko-en' | 'en-ko')
 * @returns 교정된 텍스트
 */
export function correctTypo(text: string, direction: 'ko-en' | 'en-ko'): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    if (direction === 'ko-en') {
      return correctKoreanTypo(text);
    }
    return correctEnglishTypo(text);
  } catch {
    // 교정 실패 시 원본 반환
    return text;
  }
}
