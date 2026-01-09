/**
 * 번역기 v2 단어 역번역 검증
 *
 * 단어 수준의 역번역 검증으로 번역 신뢰도를 높임
 * - 명사/고유명사의 역번역 검증
 * - 동의어 허용 집합 정의
 * - confidence 조정
 */

import { EN_KO, KO_EN } from './data';
import type { WordValidation } from './types';

// ============================================
// 역번역 허용 동의어 집합 (REVERSE_VALID)
// ============================================

/**
 * 역번역 허용 동의어 집합
 *
 * 형식: { 원본단어: [허용되는 역번역 결과들] }
 *
 * 예: korea → 한국 → korea (정확)
 *     korea → 한국 → south korea (동의어 허용)
 *     korea → 한국 → korean (파생어 불허)
 */
export const REVERSE_VALID: Record<string, string[]> = {
  // ============================================
  // 국가명 (Countries)
  // ============================================
  korea: ['korea', 'south korea', 'republic of korea', 'rok'],
  한국: ['한국', '대한민국', '코리아'],
  japan: ['japan', 'nippon'],
  일본: ['일본', '니혼', '니폰'],
  china: ['china', 'prc'],
  중국: ['중국', '중화인민공화국'],
  america: ['america', 'usa', 'united states', 'us', 'the states'],
  미국: ['미국', '미합중국', '아메리카'],

  // ============================================
  // 도시명 (Cities)
  // ============================================
  seoul: ['seoul'],
  서울: ['서울', '한양'],
  tokyo: ['tokyo'],
  도쿄: ['도쿄', '동경'],
  beijing: ['beijing', 'peking'],
  북경: ['북경', '베이징'],

  // ============================================
  // 음식 (Food)
  // ============================================
  coffee: ['coffee'],
  커피: ['커피', '카피'],
  apple: ['apple'],
  사과: ['사과'],
  water: ['water'],
  물: ['물'],
  rice: ['rice'],
  밥: ['밥', '쌀밥'],
  bread: ['bread'],
  빵: ['빵'],
  meat: ['meat', 'flesh'],
  고기: ['고기', '육류'],

  // ============================================
  // 동물 (Animals)
  // ============================================
  cat: ['cat', 'kitty', 'kitten'],
  고양이: ['고양이', '냥이', '야옹이'],
  dog: ['dog', 'puppy', 'doggy'],
  개: ['개', '강아지', '멍멍이'],
  bird: ['bird'],
  새: ['새', '조류'],
  fish: ['fish'],
  물고기: ['물고기', '생선'],

  // ============================================
  // 장소 (Places)
  // ============================================
  school: ['school'],
  학교: ['학교'],
  hospital: ['hospital'],
  병원: ['병원'],
  library: ['library'],
  도서관: ['도서관'],
  museum: ['museum'],
  박물관: ['박물관'],
  park: ['park'],
  공원: ['공원'],
  home: ['home', 'house'],
  집: ['집', '가정', '주택'],
  office: ['office', 'workplace'],
  사무실: ['사무실', '오피스'],

  // ============================================
  // 대명사 (Pronouns)
  // ============================================
  // 1인칭
  나: ['나', '저', '본인', 'i', 'me'], // "나"와 "저"는 둘 다 "I"의 유효한 역번역
  저: ['저', '나', '본인', 'i', 'me'],
  i: ['i', 'me', '나', '저'], // 역번역 시 '나', '저'도 허용
  // 2인칭
  너: ['너', '당신', '자네'],
  당신: ['당신', '너'],
  you: ['you'],
  // 3인칭
  그: ['그', '그이', '그사람'],
  그녀: ['그녀'],
  he: ['he', 'him'],
  she: ['she', 'her'],
  // 복수
  우리: ['우리', '저희'],
  저희: ['저희', '우리'],
  we: ['we', 'us'],
  그들: ['그들'],
  they: ['they', 'them'],
  // 지시대명사
  이것: ['이것', '이거'],
  저것: ['저것', '저거'],
  그것: ['그것', '그거', '그'],
  this: ['this'],
  that: ['that'],
  it: ['it'],

  // ============================================
  // 가족 (Family)
  // ============================================
  mother: ['mother', 'mom', 'mama', 'mommy'],
  어머니: ['어머니', '엄마', '모친'],
  father: ['father', 'dad', 'papa', 'daddy'],
  아버지: ['아버지', '아빠', '부친'],
  brother: ['brother', 'bro'],
  형: ['형', '오빠', '남동생'],
  sister: ['sister', 'sis'],
  언니: ['언니', '누나', '여동생'],
  friend: ['friend', 'buddy', 'pal'],
  친구: ['친구', '벗', '동료'],

  // ============================================
  // 시간 (Time)
  // ============================================
  today: ['today'],
  오늘: ['오늘'],
  yesterday: ['yesterday'],
  어제: ['어제'],
  tomorrow: ['tomorrow'],
  내일: ['내일'],
  morning: ['morning'],
  아침: ['아침', '오전'],
  evening: ['evening', 'night'],
  저녁: ['저녁', '밤'],

  // ============================================
  // 동사 어간 (Verb Stems)
  // ============================================
  // 배우 (actor as noun) vs 배우다 (learn as verb) - 동사 어간과 명사 구분
  배우: ['배우', '배우다'], // 역번역 시 '배우다'도 유효

  // ============================================
  // 수량사 (Quantifiers)
  // ============================================
  몇몇: ['몇몇', '약간의', '조금의'],
  약간의: ['약간의', '몇몇', '조금의'],
  조금의: ['조금의', '약간의', '몇몇'],
  많은: ['많은', '많'],
  적은: ['적은', '적'],
  모든: ['모든', '전체'],

  // ============================================
  // 일반 명사 (General Nouns)
  // ============================================
  book: ['book'],
  책: ['책', '도서'],
  music: ['music'],
  음악: ['음악'],
  movie: ['movie', 'film'],
  영화: ['영화'],
  phone: ['phone', 'cellphone', 'mobile'],
  전화: ['전화', '휴대폰', '핸드폰'],
  computer: ['computer', 'pc'],
  컴퓨터: ['컴퓨터', 'PC'],
  car: ['car', 'automobile', 'vehicle'],
  자동차: ['자동차', '차', '차량'],
};

// ============================================
// 역번역 검증 함수
// ============================================

/**
 * 단어 역번역 검증
 *
 * @param original 원본 단어 (번역 전)
 * @param translated 번역된 단어
 * @param direction 번역 방향 ('ko-en' | 'en-ko')
 * @returns 검증 결과
 */
export function validateWordTranslation(
  original: string,
  translated: string,
  direction: 'ko-en' | 'en-ko',
): WordValidation {
  const originalLower = original.toLowerCase();
  const translatedLower = translated.toLowerCase();

  // 1. 역번역 수행
  let reverseTranslation: string;
  if (direction === 'ko-en') {
    // Ko→En: 영어를 다시 한국어로
    reverseTranslation = EN_KO[translatedLower] || '';
  } else {
    // En→Ko: 한국어를 다시 영어로
    reverseTranslation = KO_EN[translatedLower] || '';
  }

  const reverseLower = reverseTranslation.toLowerCase();

  // 2. 정확 일치 확인
  if (reverseLower === originalLower) {
    return {
      valid: true,
      reverseTranslation,
      confidence: 1.0,
    };
  }

  // 2.5. 조사 제거 후 비교 (운동 vs 운동을)
  // 역번역 결과에서 조사를 제거하고 원본과 비교
  const KOREAN_PARTICLES = /[을를이가은는도만에서로으로와과하고의]$/;
  const reverseStripped = reverseLower.replace(KOREAN_PARTICLES, '');
  const originalStripped = originalLower.replace(KOREAN_PARTICLES, '');
  if (reverseStripped === originalStripped) {
    return {
      valid: true,
      reverseTranslation,
      confidence: 0.95,
    };
  }

  // 3. 동의어 허용 집합 확인
  const allowedSynonyms = REVERSE_VALID[originalLower];
  if (allowedSynonyms) {
    const matchedSynonym = allowedSynonyms.find(
      (syn) => syn.toLowerCase() === reverseLower || syn.toLowerCase() === translatedLower,
    );
    if (matchedSynonym) {
      return {
        valid: true,
        reverseTranslation,
        confidence: 0.9,
        matchedSynonym,
      };
    }
  }

  // 4. 번역된 단어에 대한 동의어 집합 확인
  const translatedSynonyms = REVERSE_VALID[translatedLower];
  if (translatedSynonyms) {
    const matchedOriginal = translatedSynonyms.find((syn) => syn.toLowerCase() === originalLower);
    if (matchedOriginal) {
      return {
        valid: true,
        reverseTranslation,
        confidence: 0.9,
        matchedSynonym: matchedOriginal,
      };
    }
  }

  // 5. 역번역 실패
  return {
    valid: false,
    reverseTranslation: reverseTranslation || '[unknown]',
    confidence: 0.3,
  };
}

/**
 * 단어가 명사인지 확인 (간단한 휴리스틱)
 *
 * 명사 판단 기준:
 * - 사전에 존재하는 단어
 * - 동사/형용사 어미가 없는 단어
 * - 첫 글자가 대문자 (영어 고유명사)
 */
export function isNoun(word: string, language: 'ko' | 'en'): boolean {
  if (language === 'ko') {
    // 한국어: 동사/형용사 어미가 없으면 명사로 추정
    const verbEndings = /[다어아요니까]$/;
    if (verbEndings.test(word)) return false;

    // 사전에 존재하고 어미가 없으면 명사
    return !!KO_EN[word];
  }

  // 영어
  if (language === 'en') {
    // 고유명사 (첫 글자 대문자)
    if (/^[A-Z]/.test(word)) return true;

    // 동사 패턴 제외
    const verbPatterns =
      /^(is|are|am|was|were|do|does|did|have|has|had|will|would|can|could|shall|should)$/i;
    if (verbPatterns.test(word)) return false;

    // 사전에 존재하면 명사 가능성
    return !!EN_KO[word.toLowerCase()];
  }

  return false;
}

/**
 * 단어 목록에서 명사만 추출하여 역번역 검증 수행
 *
 * @param words 단어 목록 (원본, 번역)
 * @param direction 번역 방향
 * @returns 검증된 단어 목록
 */
export function validateNouns(
  words: Array<{ original: string; translated: string }>,
  direction: 'ko-en' | 'en-ko',
): Array<{ original: string; translated: string; validation: WordValidation }> {
  const srcLang = direction === 'ko-en' ? 'ko' : 'en';

  return words
    .filter((w) => isNoun(w.original, srcLang))
    .map((w) => ({
      ...w,
      validation: validateWordTranslation(w.original, w.translated, direction),
    }));
}

/**
 * 검증 결과로 평균 confidence 계산
 */
export function calculateValidationConfidence(validations: WordValidation[]): number {
  if (validations.length === 0) return 1.0; // 검증할 단어 없으면 기본값

  const sum = validations.reduce((acc, v) => acc + v.confidence, 0);
  return sum / validations.length;
}
