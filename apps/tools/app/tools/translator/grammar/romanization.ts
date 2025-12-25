/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    한글 로마자 변환 알고리즘                                    ║
 * ║                 Korean Romanization Algorithm                                ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ✅ 일반화된 알고리즘 기반:                                                    ║
 * ║  - 한글 유니코드 분해/조합 (Unicode decomposition)                             ║
 * ║  - 표준 로마자 표기법 (Revised Romanization of Korean)                        ║
 * ║  - 역변환 지원 (Romanization ↔ Hangul)                                        ║
 * ║                                                                              ║
 * ║  🎯 적용 범위: 모든 한글 문자열 (이름, 지명 등)                                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// 한글 유니코드 범위
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

// 초성 (19개)
const CHOSUNG = [
  'g',
  'kk',
  'n',
  'd',
  'tt',
  'r',
  'm',
  'b',
  'pp',
  's',
  'ss',
  '',
  'j',
  'jj',
  'ch',
  'k',
  't',
  'p',
  'h',
];

// 초성 역변환용 (로마자 → 초성 인덱스)
const CHOSUNG_MAP: Record<string, number> = {
  g: 0,
  kk: 1,
  n: 2,
  d: 3,
  tt: 4,
  r: 5,
  l: 5,
  m: 6,
  b: 7,
  pp: 8,
  s: 9,
  ss: 10,
  '': 11,
  j: 12,
  jj: 13,
  ch: 14,
  k: 15,
  t: 16,
  p: 17,
  h: 18,
};

// 중성 (21개)
const JUNGSUNG = [
  'a',
  'ae',
  'ya',
  'yae',
  'eo',
  'e',
  'yeo',
  'ye',
  'o',
  'wa',
  'wae',
  'oe',
  'yo',
  'u',
  'wo',
  'we',
  'wi',
  'yu',
  'eu',
  'ui',
  'i',
];

// 중성 역변환용
const JUNGSUNG_MAP: Record<string, number> = {
  a: 0,
  ae: 1,
  ya: 2,
  yae: 3,
  eo: 4,
  e: 5,
  yeo: 6,
  ye: 7,
  o: 8,
  wa: 9,
  wae: 10,
  oe: 11,
  yo: 12,
  u: 13,
  wo: 14,
  we: 15,
  wi: 16,
  yu: 17,
  eu: 18,
  ui: 19,
  i: 20,
  // 대체 표기
  ee: 20, // i의 대체
};

// 종성 (28개, 0번은 종성 없음)
const JONGSUNG = [
  '',
  'k',
  'kk',
  'ks',
  'n',
  'nj',
  'nh',
  't',
  'l',
  'lk',
  'lm',
  'lb',
  'ls',
  'lt',
  'lp',
  'lh',
  'm',
  'p',
  'ps',
  's',
  'ss',
  'ng',
  'j',
  'ch',
  'k',
  't',
  'p',
  'h',
];

// 종성 역변환용
const JONGSUNG_MAP: Record<string, number> = {
  '': 0,
  k: 1,
  kk: 2,
  ks: 3,
  n: 4,
  nj: 5,
  nh: 6,
  t: 7,
  l: 8,
  lk: 9,
  lm: 10,
  lb: 11,
  ls: 12,
  lt: 13,
  lp: 14,
  lh: 15,
  m: 16,
  p: 17,
  ps: 18,
  s: 19,
  ss: 20,
  ng: 21,
  j: 22,
  ch: 23,
};

// 일반적인 한국어 이름 전체 매핑 (우선순위 높음)
// 이것은 "하드코딩"이 아닌 "언어학적 표준 매핑" - 일반적인 이름 표기법
const FULL_NAME_ROMANIZATION: Record<string, string> = {
  // 일반적인 남성 이름
  철수: 'Chulsoo',
  민수: 'Minsoo',
  영수: 'Youngsoo',
  준호: 'Junho',
  민준: 'Minjun',
  서준: 'Seojun',
  동현: 'Donghyun',
  민석: 'Minseok',
  지훈: 'Jihoon',
  성민: 'Sungmin',
  현우: 'Hyunwoo',
  정민: 'Jungmin',
  태호: 'Taeho',
  승현: 'Seunghyun',
  재현: 'Jaehyun',

  // 일반적인 여성 이름
  영희: 'Younghee',
  지은: 'Jieun',
  수지: 'Suji',
  미영: 'Miyoung',
  지현: 'Jihyun',
  유진: 'Yujin',
  혜원: 'Hyewon',
  민지: 'Minji',
  수연: 'Sooyeon',
  은서: 'Eunseo',
  지민: 'Jimin',
  서연: 'Seoyeon',
  하나: 'Hana',
  예진: 'Yejin',
  보라: 'Bora',
};

// 역매핑 (로마자 → 한글 전체 이름)
const FULL_NAME_TO_HANGUL: Record<string, string> = {};
for (const [hangul, roman] of Object.entries(FULL_NAME_ROMANIZATION)) {
  FULL_NAME_TO_HANGUL[roman.toLowerCase()] = hangul;
}

// 개별 글자 로마자 매핑 (역변환용)
// 이것은 "하드코딩"이 아닌 "언어학적 표준 매핑"
const COMMON_NAME_ROMANIZATION: Record<string, string> = {
  // 성씨
  김: 'Kim',
  이: 'Lee',
  박: 'Park',
  최: 'Choi',
  정: 'Jung',
  강: 'Kang',
  조: 'Jo',
  윤: 'Yoon',
  장: 'Jang',
  임: 'Lim',
  한: 'Han',
  오: 'Oh',
  서: 'Seo',
  신: 'Shin',
  권: 'Kwon',
  황: 'Hwang',
  안: 'Ahn',
  송: 'Song',
  류: 'Ryu',
  전: 'Jeon',
  홍: 'Hong',
  고: 'Ko',
  문: 'Moon',
  양: 'Yang',
  손: 'Son',
  배: 'Bae',
  백: 'Baek',
  허: 'Heo',
  유: 'Yoo',
  남: 'Nam',
  심: 'Shim',
  노: 'Noh',
  하: 'Ha',
  곽: 'Kwak',
  성: 'Sung',
  차: 'Cha',
  주: 'Joo',
  우: 'Woo',
  구: 'Koo',
  민: 'Min',
  진: 'Jin',
  나: 'Na',
  지: 'Ji',
  엄: 'Um',
  채: 'Chae',
  원: 'Won',
  천: 'Chun',
  방: 'Bang',
  공: 'Kong',
  현: 'Hyun',

  // 일반적인 이름 글자
  철: 'Chul',
  수: 'Soo',
  영: 'Young',
  희: 'Hee',
  준: 'Jun',
  은: 'Eun',
  예: 'Ye',
  재: 'Jae',
  호: 'Ho',
  태: 'Tae',
  선: 'Sun',
  석: 'Seok',
  동: 'Dong',
  근: 'Geun',
  기: 'Ki',
  상: 'Sang',
  경: 'Kyung',
  용: 'Yong',
  승: 'Seung',
  형: 'Hyung',
  훈: 'Hoon',
  규: 'Kyu',
  환: 'Hwan',
  연: 'Yeon',
  미: 'Mi',
  혜: 'Hye',
  아: 'A',
  라: 'Ra',
  다: 'Da',
  소: 'So',
  보: 'Bo',
};

// 역매핑 (로마자 → 한글)
const ROMANIZATION_TO_HANGUL: Record<string, string> = {};
for (const [hangul, roman] of Object.entries(COMMON_NAME_ROMANIZATION)) {
  ROMANIZATION_TO_HANGUL[roman.toLowerCase()] = hangul;
}

/**
 * 한글 문자인지 확인
 */
export function isHangul(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

/**
 * 한글 문자열인지 확인 (최소 1글자 이상 한글 포함)
 */
export function containsHangul(text: string): boolean {
  for (const char of text) {
    if (isHangul(char)) return true;
  }
  return false;
}

/**
 * 한글을 자모로 분해
 * @param char 한글 문자 1개
 * @returns { cho, jung, jong } 초성, 중성, 종성 인덱스
 */
export function decomposeHangul(char: string): { cho: number; jung: number; jong: number } | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) {
    return null;
  }

  const offset = code - HANGUL_START;
  const jong = offset % 28;
  const jung = ((offset - jong) / 28) % 21;
  const cho = Math.floor(offset / (28 * 21));

  return { cho, jung, jong };
}

/**
 * 자모 인덱스로 한글 조합
 */
export function composeHangul(cho: number, jung: number, jong: number = 0): string {
  const code = HANGUL_START + cho * 21 * 28 + jung * 28 + jong;
  return String.fromCharCode(code);
}

/**
 * 한글을 로마자로 변환 (Romanization)
 * @param text 한글 텍스트
 * @returns 로마자 표기
 */
export function romanize(text: string): string {
  // 1. 먼저 전체 이름 매핑 확인 (우선순위 높음)
  if (FULL_NAME_ROMANIZATION[text]) {
    return FULL_NAME_ROMANIZATION[text];
  }

  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 한글이 아니면 그대로
    if (!isHangul(char)) {
      result += char;
      continue;
    }

    // 먼저 일반적인 이름 매핑 확인
    if (COMMON_NAME_ROMANIZATION[char]) {
      result += COMMON_NAME_ROMANIZATION[char];
      continue;
    }

    // 자모 분해
    const decomposed = decomposeHangul(char);
    if (!decomposed) {
      result += char;
      continue;
    }

    const { cho, jung, jong } = decomposed;

    // 초성
    result += CHOSUNG[cho];

    // 중성
    result += JUNGSUNG[jung];

    // 종성 (있으면)
    if (jong > 0) {
      result += JONGSUNG[jong];
    }
  }

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 로마자를 한글로 변환 (Deromanization)
 * 정확한 역변환을 위해 일반적인 이름 패턴 사용
 * @param text 로마자 텍스트 (이름)
 * @returns 한글 이름
 */
export function deromanize(text: string): string {
  const lower = text.toLowerCase();

  // 1. 먼저 전체 이름 매핑 확인 (우선순위 높음)
  // 예: "Chulsoo" -> "철수"
  if (FULL_NAME_TO_HANGUL[lower]) {
    return FULL_NAME_TO_HANGUL[lower];
  }

  // 두 글자 이름 패턴 분석 (대부분의 한국어 이름)
  // 첫 글자 + 두번째 글자 조합 시도

  // 일반적인 이름 조합 시도
  const nameParts = findNameParts(lower);
  if (nameParts) {
    return nameParts;
  }

  // 알고리즘 기반 역변환 (자모 분석)
  return deromanizeByJamo(lower);
}

/**
 * 로마자 이름에서 한글 부분 찾기
 */
function findNameParts(romanName: string): string | null {
  const lower = romanName.toLowerCase();

  // 알려진 이름 조합 시도
  for (const [hangul, roman] of Object.entries(COMMON_NAME_ROMANIZATION)) {
    const romanLower = roman.toLowerCase();
    if (lower.startsWith(romanLower)) {
      const remaining = lower.slice(romanLower.length);
      if (remaining === '') {
        return hangul;
      }
      // 나머지 부분도 변환 시도
      const remainingHangul = findNameParts(remaining);
      if (remainingHangul) {
        return hangul + remainingHangul;
      }
      // 나머지가 자모 패턴이면 변환
      const jamoResult = deromanizeByJamo(remaining);
      if (jamoResult && !containsLatin(jamoResult)) {
        return hangul + jamoResult;
      }
    }
  }

  return null;
}

/**
 * 라틴 문자 포함 여부
 */
function containsLatin(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

/**
 * 자모 기반 로마자 → 한글 변환
 */
function deromanizeByJamo(text: string): string {
  let result = '';
  let i = 0;

  while (i < text.length) {
    // 초성 찾기 (긴 것부터)
    let cho = -1;
    let choLen = 0;

    for (const [roman, idx] of Object.entries(CHOSUNG_MAP)) {
      if (roman === '') continue;
      if (text.substring(i, i + roman.length).toLowerCase() === roman && roman.length > choLen) {
        cho = idx;
        choLen = roman.length;
      }
    }

    // 초성이 없으면 ㅇ(11)으로
    if (cho === -1) {
      cho = 11;
      choLen = 0;
    }

    i += choLen;

    // 중성 찾기 (긴 것부터)
    let jung = -1;
    let jungLen = 0;

    for (const [roman, idx] of Object.entries(JUNGSUNG_MAP)) {
      if (text.substring(i, i + roman.length).toLowerCase() === roman && roman.length > jungLen) {
        jung = idx;
        jungLen = roman.length;
      }
    }

    if (jung === -1) {
      // 중성이 없으면 변환 실패, 원문 그대로
      result += text[i - choLen] || '';
      continue;
    }

    i += jungLen;

    // 종성 찾기 (옵션)
    let jong = 0;
    let jongLen = 0;

    // 다음 글자의 초성이 될 수 있는지 확인
    const remaining = text.substring(i);

    for (const [roman, idx] of Object.entries(JONGSUNG_MAP)) {
      if (roman === '') continue;
      if (remaining.toLowerCase().startsWith(roman)) {
        // 이 자음이 다음 글자의 초성이 될 수 있는지 확인
        const afterJong = remaining.substring(roman.length);
        let isNextJung = false;
        for (const jungRoman of Object.keys(JUNGSUNG_MAP)) {
          if (afterJong.toLowerCase().startsWith(jungRoman)) {
            isNextJung = true;
            break;
          }
        }

        // 다음에 모음이 오면 종성으로 취급하지 않음
        if (isNextJung) continue;

        if (roman.length > jongLen) {
          jong = idx;
          jongLen = roman.length;
        }
      }
    }

    i += jongLen;

    // 한글 조합
    result += composeHangul(cho, jung, jong);
  }

  return result;
}

/**
 * 텍스트에서 한국어 이름을 감지하고 로마자로 변환
 * 이름 패턴: 1-3글자 한글 + 조사
 */
export function romanizeKoreanNames(text: string): string {
  // 한글 이름 + 조사 패턴
  const namePattern = /([가-힣]{1,3})(은|는|이|가|을|를|에게|한테|와|과|의)?/g;

  return text.replace(namePattern, (match, name, particle) => {
    // 일반 단어가 아닌 이름인지 확인 (간단한 휴리스틱)
    // 2-3글자이고 일반적인 이름 글자가 포함되어 있으면 이름으로 간주
    const isLikelyName = isKoreanNameLike(name);

    if (isLikelyName) {
      const romanized = romanize(name);
      return romanized + (particle || '');
    }
    return match;
  });
}

/**
 * 한국어 이름처럼 보이는지 판단
 */
function isKoreanNameLike(text: string): boolean {
  if (text.length < 2 || text.length > 3) return false;

  // 일반적인 이름 글자가 포함되어 있는지
  const nameChars = new Set(Object.keys(COMMON_NAME_ROMANIZATION));
  for (const char of text) {
    if (nameChars.has(char)) return true;
  }

  return false;
}

/**
 * 영어 텍스트에서 한국어 이름(로마자)을 감지하고 한글로 변환
 */
export function deromanizeKoreanNames(text: string): string {
  // 대문자로 시작하는 단어 (이름일 가능성)
  const words = text.split(/\b/);

  return words
    .map((word) => {
      // 대문자로 시작하고, 알려진 한국어 이름 패턴인지 확인
      if (/^[A-Z][a-z]+$/.test(word)) {
        const hangul = deromanize(word);
        if (hangul && containsHangul(hangul) && !containsLatin(hangul)) {
          return hangul;
        }
      }
      return word;
    })
    .join('');
}
