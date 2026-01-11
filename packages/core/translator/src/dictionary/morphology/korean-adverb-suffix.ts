// ========================================
// Korean Adverb Suffix Rules (부사화 접미사 규칙)
// 맞춤법 제51항: 부사 '-이/-히' 구별
// ========================================

import { decompose } from '@soundblue/hangul';

/**
 * 부사화 접미사 유형
 * - 'i': -이 (예: 깊이, 많이)
 * - 'hi': -히 (예: 급히, 솔직히)
 * - 'both': -이/-히 모두 허용 (예: 깨끗이/깨끗히)
 */
export type AdverbSuffixType = 'i' | 'hi' | 'both';

/**
 * 맞춤법 51항: '-이'로만 적는 어근
 *
 * 규칙:
 * 1. 첩어인 경우: 깊이깊이, 높이높이 → 깊이, 높이
 * 2. 받침 ㅅ: 깊이(深), 높이(高), 넓이(廣)
 * 3. 받침 ㅂ: 좁이(x) → 예외 (좁히가 맞음)
 * 4. 어근 끝음절 받침이 ㄱ, ㄴ, ㄷ, ㅁ, ㅂ, ㅅ인 경우 (일부)
 *
 * 예: 많이, 적이(x), 같이, 굳이, 헛되이, 짧이(x)
 */
const ADVERB_SUFFIX_I_ONLY = new Set([
  // 형용사/동사 어간 + 이
  '같', // 같이 (together/similarly)
  '깊', // 깊이 (deeply)
  '높', // 높이 (highly)
  '넓', // 넓이 (widely) - 명사로도 쓰임
  '굳', // 굳이 (firmly/insistently)
  '많', // 많이 (much/many)
  '실', // 실없이 → 실없 + 이
  '헛', // 헛되이
  '곧', // 곧이 (literally: 곧이곧대로)
  '길', // 길이 (length/at length)
  '멀', // 멀리 (far) - ㄹ탈락 후 이
  '달', // 달리 (differently)
  '빨', // 빨리 (quickly) - ㄹ탈락 후 이
  '일찍', // 일찍이 (early)
  '더욱', // 더욱이 (moreover)
  '오', // 오래 → 오래이(x), 오래(부사)
]);

/**
 * 맞춤법 51항: '-히'로만 적는 어근
 *
 * 규칙:
 * 1. 어근 끝이 'ㅎ' 받침: 급(急)히, 답답(答答)히
 * 2. '-하다'가 붙는 어근: 솔직(率直)히, 정확(正確)히, 엄격(嚴格)히
 * 3. 부사화 시 '-히'가 붙는 한자어 어근
 *
 * 판단 기준: 어근 + 하다 → 형용사가 되는 경우
 */
const ADVERB_SUFFIX_HI_ONLY = new Set([
  // -하다 형용사에서 파생
  '급', // 급히 (urgently)
  '극', // 극히 (extremely)
  '속', // 속히 (quickly)
  '정확', // 정확히 (exactly)
  '솔직', // 솔직히 (frankly)
  '엄격', // 엄격히 (strictly)
  '명확', // 명확히 (clearly)
  '확실', // 확실히 (certainly)
  '분명', // 분명히 (obviously)
  '당연', // 당연히 (naturally)
  '특별', // 특별히 (specially)
  '간단', // 간단히 (simply)
  '신속', // 신속히 (swiftly)
  '조용', // 조용히 (quietly)
  '고요', // 고요히 (calmly)
  '단순', // 단순히 (simply)
  '철저', // 철저히 (thoroughly)
  '완전', // 완전히 (completely)
  '충분', // 충분히 (sufficiently)
  '자세', // 자세히 (in detail)
  '친절', // 친절히 (kindly)
  '정중', // 정중히 (politely)
  '공손', // 공손히 (respectfully)
  '겸손', // 겸손히 (humbly)
  '고요', // 고요히 (peacefully)
  '과감', // 과감히 (boldly)
  '교묘', // 교묘히 (cleverly)
  '기묘', // 기묘히 (mysteriously)
  '긴급', // 긴급히 (urgently)
  '냉정', // 냉정히 (coldly)
  '단호', // 단호히 (firmly)
  '대담', // 대담히 (boldly)
  '도저', // 도저히 (utterly - 부정문)
  '막연', // 막연히 (vaguely)
  '무심', // 무심히 (indifferently)
  '무참', // 무참히 (cruelly)
  '민첩', // 민첩히 (nimbly)
  '비밀', // 비밀히 (secretly) - 비밀리에도 있음
  '상세', // 상세히 (in detail)
  '성급', // 성급히 (hastily)
  '소홀', // 소홀히 (carelessly)
  '신중', // 신중히 (carefully)
  '열심', // 열심히 (diligently)
  '엄숙', // 엄숙히 (solemnly)
  '영원', // 영원히 (forever)
  '완강', // 완강히 (stubbornly)
  '은밀', // 은밀히 (secretly)
  '정성', // 정성히 (wholeheartedly)
  '조심', // 조심히 (carefully)
  '즉시', // 즉시 (immediately) - 그 자체가 부사
  '진지', // 진지히 (seriously)
  '착실', // 착실히 (steadily)
  '철두철미', // 철두철미히 (thoroughly)
  '최대', // 최대히(x) → 최대한(o) - 예외
  '충실', // 충실히 (faithfully)
  '편안', // 편안히 (comfortably)
  '평화', // 평화히(x) → 평화롭게(o)
  '확고', // 확고히 (firmly)
  '꼼꼼', // 꼼꼼히 (meticulously)
  '똑똑', // 똑똑히 (clearly)
]);

/**
 * 맞춤법 51항: '-이/-히' 모두 허용하는 어근
 *
 * 규칙:
 * 발음상 [이]로도 [히]로도 발음되어 두 형태 모두 표준어
 */
const ADVERB_SUFFIX_BOTH = new Set([
  '깨끗', // 깨끗이/깨끗히 (cleanly)
  '반듯', // 반듯이/반듯히 (straight)
  '버젓', // 버젓이/버젓히 (openly)
  '느긋', // 느긋이/느긋히 (leisurely)
  '끔찍', // 끔찍이/끔찍히 (terribly) - 비표준이나 혼용
]);

/**
 * 부사화 접미사 결정 함수
 * 맞춤법 제51항 규칙 적용
 *
 * @param stem 형용사/동사 어간
 * @returns 적절한 접미사 유형 ('i', 'hi', 'both')
 *
 * @example
 * getAdverbSuffix('많') // → 'i' (많이)
 * getAdverbSuffix('급') // → 'hi' (급히)
 * getAdverbSuffix('깨끗') // → 'both' (깨끗이/깨끗히)
 */
export function getAdverbSuffix(stem: string): AdverbSuffixType {
  // 1. 예외 목록 우선 체크
  if (ADVERB_SUFFIX_I_ONLY.has(stem)) return 'i';
  if (ADVERB_SUFFIX_HI_ONLY.has(stem)) return 'hi';
  if (ADVERB_SUFFIX_BOTH.has(stem)) return 'both';

  // 2. 일반 규칙 적용
  const lastChar = stem[stem.length - 1];
  if (!lastChar) return 'i'; // 기본값

  const jamo = decompose(lastChar);
  if (!jamo) return 'i'; // 한글이 아닌 경우 기본값

  const jong = jamo.jong;

  // 규칙 1: 받침 없는 경우
  // '-하다'가 붙는 어근이면 '-히', 아니면 '-이'
  if (jong === '') {
    // 2음절 이상의 한자어는 대부분 -히
    if (stem.length >= 2) {
      return 'hi';
    }
    return 'i';
  }

  // 규칙 2: 받침 ㅎ → 대부분 -히
  if (jong === 'ㅎ') {
    return 'hi';
  }

  // 규칙 3: 받침 ㄱ → -히 (한자어) 또는 -이 (고유어)
  // 대부분의 한자어 + ㄱ받침은 -히
  if (jong === 'ㄱ') {
    // 한자어로 추정되는 2음절 이상은 -히
    if (stem.length >= 2) {
      return 'hi';
    }
    return 'i';
  }

  // 규칙 4: 받침 ㅂ → 어근에 따라 다름
  // 예: 급히(急), 엄격히(嚴格)
  if (jong === 'ㅂ') {
    return 'hi';
  }

  // 규칙 5: 받침 ㅅ, ㅆ → 대부분 -이
  if (jong === 'ㅅ' || jong === 'ㅆ') {
    return 'i';
  }

  // 규칙 6: 받침 ㄴ, ㅁ → 어근에 따라 다름
  // 분명히(分明), 간단히(簡單) vs 많이
  if (jong === 'ㄴ' || jong === 'ㅁ') {
    if (stem.length >= 2) {
      return 'hi';
    }
    return 'i';
  }

  // 규칙 7: 받침 ㄹ → 탈락 후 -이 (빨리, 멀리)
  if (jong === 'ㄹ') {
    return 'i';
  }

  // 기본값: -이
  return 'i';
}

/**
 * 형용사 어간에서 부사 생성
 *
 * @param stem 형용사 어간
 * @returns 부사 형태
 *
 * @example
 * createAdverb('많') // → '많이'
 * createAdverb('급') // → '급히'
 * createAdverb('깨끗') // → '깨끗이' (기본값, both인 경우)
 */
export function createAdverb(stem: string): string {
  const suffixType = getAdverbSuffix(stem);

  // ㄹ 받침 탈락 처리 (빠르 → 빨리, 멀 → 멀리)
  const lastChar = stem[stem.length - 1];
  if (lastChar) {
    const jamo = decompose(lastChar);
    if (jamo && jamo.jong === 'ㄹ') {
      // ㄹ탈락 없이 그대로 -이 붙임 (멀+이 = 멀리)
      return stem + '이';
    }
  }

  switch (suffixType) {
    case 'hi':
      return stem + '히';
    case 'i':
    case 'both':
    default:
      return `${stem}이`; // both인 경우 기본은 -이
  }
}

/**
 * 부사에서 어간 추출
 *
 * @param adverb 부사 형태
 * @returns 어간 또는 null
 *
 * @example
 * extractStemFromAdverb('많이') // → '많'
 * extractStemFromAdverb('급히') // → '급'
 * extractStemFromAdverb('빨리') // → '빨'
 */
export function extractStemFromAdverb(adverb: string): string | null {
  if (adverb.endsWith('히')) {
    return adverb.slice(0, -1);
  }
  if (adverb.endsWith('이')) {
    return adverb.slice(0, -1);
  }
  if (adverb.endsWith('리')) {
    // ㄹ불규칙: 빨리 → 빠르, 멀리 → 멀
    return adverb.slice(0, -1);
  }
  return null;
}

/**
 * 부사 접미사 유효성 검사
 * 주어진 어간에 올바른 접미사가 붙었는지 확인
 *
 * @param stem 어간
 * @param suffix 접미사 ('이' 또는 '히')
 * @returns 올바른 조합인지 여부
 *
 * @example
 * isValidAdverbSuffix('많', '이') // → true
 * isValidAdverbSuffix('많', '히') // → false
 * isValidAdverbSuffix('급', '히') // → true
 * isValidAdverbSuffix('깨끗', '이') // → true (both 허용)
 * isValidAdverbSuffix('깨끗', '히') // → true (both 허용)
 */
export function isValidAdverbSuffix(stem: string, suffix: string): boolean {
  const expected = getAdverbSuffix(stem);

  if (expected === 'both') {
    return suffix === '이' || suffix === '히';
  }

  return (expected === 'i' && suffix === '이') || (expected === 'hi' && suffix === '히');
}

/**
 * 부사 목록 (사전)
 * 어간 → 올바른 부사 형태
 */
export const ADVERB_DICTIONARY: Record<string, string> = {
  // -이 부사
  같: '같이',
  깊: '깊이',
  높: '높이',
  넓: '넓이',
  굳: '굳이',
  많: '많이',
  헛: '헛되이',
  달: '달리',
  멀: '멀리',
  빨: '빨리',
  일찍: '일찍이',
  더욱: '더욱이',

  // -히 부사
  급: '급히',
  극: '극히',
  속: '속히',
  정확: '정확히',
  솔직: '솔직히',
  엄격: '엄격히',
  명확: '명확히',
  확실: '확실히',
  분명: '분명히',
  당연: '당연히',
  특별: '특별히',
  간단: '간단히',
  신속: '신속히',
  조용: '조용히',
  단순: '단순히',
  철저: '철저히',
  완전: '완전히',
  충분: '충분히',
  자세: '자세히',
  친절: '친절히',
  정중: '정중히',
  열심: '열심히',
  영원: '영원히',
  조심: '조심히',
  진지: '진지히',
  착실: '착실히',
  충실: '충실히',
  편안: '편안히',
  확고: '확고히',
  꼼꼼: '꼼꼼히',
  똑똑: '똑똑히',

  // -이/-히 모두 허용 (기본값 -이)
  깨끗: '깨끗이',
  반듯: '반듯이',
  버젓: '버젓이',
  느긋: '느긋이',
};

/**
 * 부사 영어 번역 사전
 */
export const ADVERB_TRANSLATIONS: Record<string, string> = {
  같이: 'together',
  깊이: 'deeply',
  높이: 'highly',
  넓이: 'widely',
  굳이: 'insistently',
  많이: 'much',
  달리: 'differently',
  멀리: 'far',
  빨리: 'quickly',
  일찍이: 'early',
  더욱이: 'moreover',
  급히: 'urgently',
  극히: 'extremely',
  속히: 'promptly',
  정확히: 'exactly',
  솔직히: 'frankly',
  엄격히: 'strictly',
  명확히: 'clearly',
  확실히: 'certainly',
  분명히: 'obviously',
  당연히: 'naturally',
  특별히: 'especially',
  간단히: 'simply',
  신속히: 'swiftly',
  조용히: 'quietly',
  단순히: 'simply',
  철저히: 'thoroughly',
  완전히: 'completely',
  충분히: 'sufficiently',
  자세히: 'in detail',
  친절히: 'kindly',
  정중히: 'politely',
  열심히: 'diligently',
  영원히: 'forever',
  조심히: 'carefully',
  진지히: 'seriously',
  착실히: 'steadily',
  충실히: 'faithfully',
  편안히: 'comfortably',
  확고히: 'firmly',
  꼼꼼히: 'meticulously',
  똑똑히: 'clearly',
  깨끗이: 'cleanly',
  반듯이: 'straight',
  버젓이: 'openly',
  느긋이: 'leisurely',
};
