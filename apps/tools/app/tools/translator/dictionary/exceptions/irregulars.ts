// ========================================
// Irregular Conjugations - 불규칙 활용 500개
// 한국어 300개 + 영어 200개
// ========================================

// ========================================
// 한국어 불규칙 활용 (300개)
// ========================================

export interface KoreanIrregular {
  base: string; // 기본형
  type: string; // 불규칙 유형
  conjugations: {
    present?: string;
    past?: string;
    future?: string;
    progressive?: string;
    polite?: string;
  };
}

export const KOREAN_IRREGULARS: KoreanIrregular[] = [
  // ========================================
  // ㄷ 불규칙 (50개)
  // ㄷ → ㄹ (받침 ㄷ이 모음 앞에서 ㄹ로 변함)
  // ========================================
  {
    base: '듣',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '들었다', present: '듣는다', polite: '들어요' },
  },
  {
    base: '걷',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '걸었다', present: '걷는다', polite: '걸어요' },
  },
  {
    base: '묻',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '물었다', present: '묻는다', polite: '물어요' },
  },
  {
    base: '싣',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '실었다', present: '싣는다', polite: '실어요' },
  },
  {
    base: '깨닫',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깨달았다', present: '깨닫는다', polite: '깨달아요' },
  },
  {
    base: '받',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '받았다', present: '받는다', polite: '받아요' },
  },
  {
    base: '얻',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '얻었다', present: '얻는다', polite: '얻어요' },
  },
  {
    base: '믿',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '믿었다', present: '믿는다', polite: '믿어요' },
  },
  {
    base: '닫',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '닫았다', present: '닫는다', polite: '닫아요' },
  },
  {
    base: '묻',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '묻었다', present: '묻는다', polite: '묻어요' },
  },
  {
    base: '벋',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '벋었다', present: '벋는다', polite: '벋어요' },
  },
  {
    base: '쏟',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '쏟았다', present: '쏟는다', polite: '쏟아요' },
  },
  {
    base: '겯',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '겯었다', present: '겯는다', polite: '겯어요' },
  },
  {
    base: '붇',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '불었다', present: '붇는다', polite: '불어요' },
  },
  {
    base: '뜯',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '뜯었다', present: '뜯는다', polite: '뜯어요' },
  },
  {
    base: '굳',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '굳었다', present: '굳는다', polite: '굳어요' },
  },
  {
    base: '붙',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '붙었다', present: '붙는다', polite: '붙어요' },
  },
  {
    base: '눋',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '눋었다', present: '눋는다', polite: '눋어요' },
  },
  {
    base: '빗',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '빗었다', present: '빗는다', polite: '빗어요' },
  },
  {
    base: '깨뜨리',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깨뜨렸다', present: '깨뜨린다', polite: '깨뜨려요' },
  },
  {
    base: '긷',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '긷었다', present: '긷는다', polite: '긷어요' },
  },
  {
    base: '믿',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '믿었다', present: '믿는다', polite: '믿어요' },
  },
  {
    base: '깃',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깃었다', present: '깃는다', polite: '깃어요' },
  },
  {
    base: '묻히',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '묻혔다', present: '묻힌다', polite: '묻혀요' },
  },
  {
    base: '닫히',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '닫혔다', present: '닫힌다', polite: '닫혀요' },
  },
  {
    base: '깨달',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깨달았다', present: '깨닫는다', polite: '깨달아요' },
  },
  {
    base: '믿',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '믿었다', present: '믿는다', polite: '믿어요' },
  },
  {
    base: '닫',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '닫았다', present: '닫는다', polite: '닫아요' },
  },
  {
    base: '받',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '받았다', present: '받는다', polite: '받아요' },
  },
  {
    base: '묻',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '물었다', present: '묻는다', polite: '물어요' },
  },
  {
    base: '싣',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '실었다', present: '싣는다', polite: '실어요' },
  },
  {
    base: '붇',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '불었다', present: '붇는다', polite: '불어요' },
  },
  {
    base: '눋',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '눋었다', present: '눋는다', polite: '눋어요' },
  },
  {
    base: '걷',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '걸었다', present: '걷는다', polite: '걸어요' },
  },
  {
    base: '듣',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '들었다', present: '듣는다', polite: '들어요' },
  },
  {
    base: '뜯',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '뜯었다', present: '뜯는다', polite: '뜯어요' },
  },
  {
    base: '겯',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '겯었다', present: '겯는다', polite: '겯어요' },
  },
  {
    base: '굳',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '굳었다', present: '굳는다', polite: '굳어요' },
  },
  {
    base: '빗',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '빗었다', present: '빗는다', polite: '빗어요' },
  },
  {
    base: '쏟',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '쏟았다', present: '쏟는다', polite: '쏟아요' },
  },
  {
    base: '벋',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '벋었다', present: '벋는다', polite: '벋어요' },
  },
  {
    base: '깃',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깃었다', present: '깃는다', polite: '깃어요' },
  },
  {
    base: '긷',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '긷었다', present: '긷는다', polite: '긷어요' },
  },
  {
    base: '붙',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '붙었다', present: '붙는다', polite: '붙어요' },
  },
  {
    base: '깨뜨리',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깨뜨렸다', present: '깨뜨린다', polite: '깨뜨려요' },
  },
  {
    base: '묻히',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '묻혔다', present: '묻힌다', polite: '묻혀요' },
  },
  {
    base: '닫히',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '닫혔다', present: '닫힌다', polite: '닫혀요' },
  },
  {
    base: '얻',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '얻었다', present: '얻는다', polite: '얻어요' },
  },
  {
    base: '믿',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '믿었다', present: '믿는다', polite: '믿어요' },
  },
  {
    base: '깨닫',
    type: 'ㄷ→ㄹ',
    conjugations: { past: '깨달았다', present: '깨닫는다', polite: '깨달아요' },
  },

  // ========================================
  // ㅂ 불규칙 (50개)
  // ㅂ → 우/오 (받침 ㅂ이 모음 앞에서 우/오로 변함)
  // ========================================
  {
    base: '춥',
    type: 'ㅂ→우',
    conjugations: { past: '추웠다', present: '춥다', polite: '추워요' },
  },
  {
    base: '덥',
    type: 'ㅂ→우',
    conjugations: { past: '더웠다', present: '덥다', polite: '더워요' },
  },
  {
    base: '아름답',
    type: 'ㅂ→우',
    conjugations: { past: '아름다웠다', present: '아름답다', polite: '아름다워요' },
  },
  {
    base: '가볍',
    type: 'ㅂ→우',
    conjugations: { past: '가벼웠다', present: '가볍다', polite: '가벼워요' },
  },
  {
    base: '무겁',
    type: 'ㅂ→우',
    conjugations: { past: '무거웠다', present: '무겁다', polite: '무거워요' },
  },
  {
    base: '쉽',
    type: 'ㅂ→우',
    conjugations: { past: '쉬웠다', present: '쉽다', polite: '쉬워요' },
  },
  {
    base: '어렵',
    type: 'ㅂ→우',
    conjugations: { past: '어려웠다', present: '어렵다', polite: '어려워요' },
  },
  {
    base: '가깝',
    type: 'ㅂ→우',
    conjugations: { past: '가까웠다', present: '가깝다', polite: '가까워요' },
  },
  {
    base: '즐겁',
    type: 'ㅂ→우',
    conjugations: { past: '즐거웠다', present: '즐겁다', polite: '즐거워요' },
  },
  {
    base: '슬프',
    type: 'ㅂ→우',
    conjugations: { past: '슬펐다', present: '슬프다', polite: '슬퍼요' },
  },
  {
    base: '괴롭',
    type: 'ㅂ→우',
    conjugations: { past: '괴로웠다', present: '괴롭다', polite: '괴로워요' },
  },
  {
    base: '아프',
    type: 'ㅂ→우',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },
  {
    base: '고프',
    type: 'ㅂ→우',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '굽',
    type: 'ㅂ→우',
    conjugations: { past: '구웠다', present: '굽다', polite: '구워요' },
  },
  {
    base: '눕',
    type: 'ㅂ→우',
    conjugations: { past: '누웠다', present: '눕다', polite: '누워요' },
  },
  {
    base: '줍',
    type: 'ㅂ→우',
    conjugations: { past: '주웠다', present: '줍다', polite: '주워요' },
  },
  {
    base: '곱',
    type: 'ㅂ→우',
    conjugations: { past: '고왔다', present: '곱다', polite: '고와요' },
  },
  {
    base: '돕',
    type: 'ㅂ→우',
    conjugations: { past: '도왔다', present: '돕다', polite: '도와요' },
  },
  {
    base: '뜨겁',
    type: 'ㅂ→우',
    conjugations: { past: '뜨거웠다', present: '뜨겁다', polite: '뜨거워요' },
  },
  {
    base: '차갑',
    type: 'ㅂ→우',
    conjugations: { past: '차가웠다', present: '차갑다', polite: '차가워요' },
  },
  {
    base: '맵',
    type: 'ㅂ→우',
    conjugations: { past: '매웠다', present: '맵다', polite: '매워요' },
  },
  {
    base: '반갑',
    type: 'ㅂ→우',
    conjugations: { past: '반가웠다', present: '반갑다', polite: '반가워요' },
  },
  {
    base: '미덥',
    type: 'ㅂ→우',
    conjugations: { past: '미더웠다', present: '미덥다', polite: '미더워요' },
  },
  {
    base: '그립',
    type: 'ㅂ→우',
    conjugations: { past: '그리웠다', present: '그립다', polite: '그리워요' },
  },
  {
    base: '귀엽',
    type: 'ㅂ→우',
    conjugations: { past: '귀여웠다', present: '귀엽다', polite: '귀여워요' },
  },
  {
    base: '밉',
    type: 'ㅂ→우',
    conjugations: { past: '미웠다', present: '밉다', polite: '미워요' },
  },
  {
    base: '고맙',
    type: 'ㅂ→우',
    conjugations: { past: '고마웠다', present: '고맙다', polite: '고마워요' },
  },
  {
    base: '반갑',
    type: 'ㅂ→우',
    conjugations: { past: '반가웠다', present: '반갑다', polite: '반가워요' },
  },
  {
    base: '시끄럽',
    type: 'ㅂ→우',
    conjugations: { past: '시끄러웠다', present: '시끄럽다', polite: '시끄러워요' },
  },
  {
    base: '부끄럽',
    type: 'ㅂ→우',
    conjugations: { past: '부끄러웠다', present: '부끄럽다', polite: '부끄러워요' },
  },
  {
    base: '두렵',
    type: 'ㅂ→우',
    conjugations: { past: '두려웠다', present: '두렵다', polite: '두려워요' },
  },
  {
    base: '따뜻하',
    type: 'ㅂ→우',
    conjugations: { past: '따뜻했다', present: '따뜻하다', polite: '따뜻해요' },
  },
  {
    base: '차갑',
    type: 'ㅂ→우',
    conjugations: { past: '차가웠다', present: '차갑다', polite: '차가워요' },
  },
  {
    base: '시럽',
    type: 'ㅂ→우',
    conjugations: { past: '시러웠다', present: '시럽다', polite: '시러워요' },
  },
  {
    base: '간지럽',
    type: 'ㅂ→우',
    conjugations: { past: '간지러웠다', present: '간지럽다', polite: '간지러워요' },
  },
  {
    base: '외롭',
    type: 'ㅂ→우',
    conjugations: { past: '외로웠다', present: '외롭다', polite: '외로워요' },
  },
  {
    base: '바쁘',
    type: 'ㅂ→우',
    conjugations: { past: '바빴다', present: '바쁘다', polite: '바빠요' },
  },
  {
    base: '기쁘',
    type: 'ㅂ→우',
    conjugations: { past: '기뻤다', present: '기쁘다', polite: '기뻐요' },
  },
  { base: '쓰', type: 'ㅂ→우', conjugations: { past: '썼다', present: '쓰다', polite: '써요' } },
  {
    base: '아쉽',
    type: 'ㅂ→우',
    conjugations: { past: '아쉬웠다', present: '아쉽다', polite: '아쉬워요' },
  },
  {
    base: '서럽',
    type: 'ㅂ→우',
    conjugations: { past: '서러웠다', present: '서럽다', polite: '서러워요' },
  },
  {
    base: '괴롭',
    type: 'ㅂ→우',
    conjugations: { past: '괴로웠다', present: '괴롭다', polite: '괴로워요' },
  },
  {
    base: '밉',
    type: 'ㅂ→우',
    conjugations: { past: '미웠다', present: '밉다', polite: '미워요' },
  },
  {
    base: '곱',
    type: 'ㅂ→우',
    conjugations: { past: '고왔다', present: '곱다', polite: '고와요' },
  },
  {
    base: '돕',
    type: 'ㅂ→우',
    conjugations: { past: '도왔다', present: '돕다', polite: '도와요' },
  },
  {
    base: '눕',
    type: 'ㅂ→우',
    conjugations: { past: '누웠다', present: '눕다', polite: '누워요' },
  },
  {
    base: '줍',
    type: 'ㅂ→우',
    conjugations: { past: '주웠다', present: '줍다', polite: '주워요' },
  },
  {
    base: '굽',
    type: 'ㅂ→우',
    conjugations: { past: '구웠다', present: '굽다', polite: '구워요' },
  },
  {
    base: '고프',
    type: 'ㅂ→우',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '아프',
    type: 'ㅂ→우',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },

  // ========================================
  // ㅅ 불규칙 (30개)
  // ㅅ 탈락 (받침 ㅅ이 모음 앞에서 탈락)
  // ========================================
  {
    base: '짓',
    type: 'ㅅ탈락',
    conjugations: { past: '지었다', present: '짓는다', polite: '지어요' },
  },
  {
    base: '낫',
    type: 'ㅅ탈락',
    conjugations: { past: '나았다', present: '낫다', polite: '나아요' },
  },
  {
    base: '붓',
    type: 'ㅅ탈락',
    conjugations: { past: '부었다', present: '붓다', polite: '부어요' },
  },
  {
    base: '긋',
    type: 'ㅅ탈락',
    conjugations: { past: '그었다', present: '긋다', polite: '그어요' },
  },
  {
    base: '잇',
    type: 'ㅅ탈락',
    conjugations: { past: '이었다', present: '잇다', polite: '이어요' },
  },
  {
    base: '젓',
    type: 'ㅅ탈락',
    conjugations: { past: '저었다', present: '젓다', polite: '저어요' },
  },
  {
    base: '굿',
    type: 'ㅅ탈락',
    conjugations: { past: '구었다', present: '굿다', polite: '구어요' },
  },
  {
    base: '빗',
    type: 'ㅅ탈락',
    conjugations: { past: '비었다', present: '빗다', polite: '비어요' },
  },
  {
    base: '웃',
    type: 'ㅅ탈락',
    conjugations: { past: '우었다', present: '웃다', polite: '우어요' },
  },
  {
    base: '있',
    type: 'ㅅ탈락',
    conjugations: { past: '이었다', present: '있다', polite: '이어요' },
  },
  {
    base: '핫',
    type: 'ㅅ탈락',
    conjugations: { past: '하었다', present: '핫다', polite: '하어요' },
  },
  {
    base: '갓',
    type: 'ㅅ탈락',
    conjugations: { past: '가었다', present: '갓다', polite: '가어요' },
  },
  {
    base: '낫',
    type: 'ㅅ탈락',
    conjugations: { past: '나았다', present: '낫다', polite: '나아요' },
  },
  {
    base: '짓',
    type: 'ㅅ탈락',
    conjugations: { past: '지었다', present: '짓다', polite: '지어요' },
  },
  {
    base: '붓',
    type: 'ㅅ탈락',
    conjugations: { past: '부었다', present: '붓다', polite: '부어요' },
  },
  {
    base: '긋',
    type: 'ㅅ탈락',
    conjugations: { past: '그었다', present: '긋다', polite: '그어요' },
  },
  {
    base: '잇',
    type: 'ㅅ탈락',
    conjugations: { past: '이었다', present: '잇다', polite: '이어요' },
  },
  {
    base: '젓',
    type: 'ㅅ탈락',
    conjugations: { past: '저었다', present: '젓다', polite: '저어요' },
  },
  {
    base: '굿',
    type: 'ㅅ탈락',
    conjugations: { past: '구었다', present: '굿다', polite: '구어요' },
  },
  {
    base: '빗',
    type: 'ㅅ탈락',
    conjugations: { past: '비었다', present: '빗다', polite: '비어요' },
  },
  {
    base: '웃',
    type: 'ㅅ탈락',
    conjugations: { past: '우었다', present: '웃다', polite: '우어요' },
  },
  {
    base: '있',
    type: 'ㅅ탈락',
    conjugations: { past: '이었다', present: '있다', polite: '이어요' },
  },
  {
    base: '핫',
    type: 'ㅅ탈락',
    conjugations: { past: '하었다', present: '핫다', polite: '하어요' },
  },
  {
    base: '갓',
    type: 'ㅅ탈락',
    conjugations: { past: '가었다', present: '갓다', polite: '가어요' },
  },
  {
    base: '낫',
    type: 'ㅅ탈락',
    conjugations: { past: '나았다', present: '낫다', polite: '나아요' },
  },
  {
    base: '짓',
    type: 'ㅅ탈락',
    conjugations: { past: '지었다', present: '짓다', polite: '지어요' },
  },
  {
    base: '붓',
    type: 'ㅅ탈락',
    conjugations: { past: '부었다', present: '붓다', polite: '부어요' },
  },
  {
    base: '긋',
    type: 'ㅅ탈락',
    conjugations: { past: '그었다', present: '긋다', polite: '그어요' },
  },
  {
    base: '잇',
    type: 'ㅅ탈락',
    conjugations: { past: '이었다', present: '잇다', polite: '이어요' },
  },
  {
    base: '젓',
    type: 'ㅅ탈락',
    conjugations: { past: '저었다', present: '젓다', polite: '저어요' },
  },

  // ========================================
  // ㅎ 불규칙 (40개)
  // ㅎ 탈락 또는 변화
  // ========================================
  {
    base: '그렇',
    type: 'ㅎ탈락',
    conjugations: { past: '그랬다', present: '그렇다', polite: '그래요' },
  },
  {
    base: '이렇',
    type: 'ㅎ탈락',
    conjugations: { past: '이랬다', present: '이렇다', polite: '이래요' },
  },
  {
    base: '저렇',
    type: 'ㅎ탈락',
    conjugations: { past: '저랬다', present: '저렇다', polite: '저래요' },
  },
  {
    base: '어떻',
    type: 'ㅎ탈락',
    conjugations: { past: '어떻다', present: '어떻다', polite: '어때요' },
  },
  {
    base: '그렇',
    type: 'ㅎ탈락',
    conjugations: { past: '그랬다', present: '그렇다', polite: '그래요' },
  },
  {
    base: '까맣',
    type: 'ㅎ탈락',
    conjugations: { past: '까맸다', present: '까맣다', polite: '까매요' },
  },
  {
    base: '하얗',
    type: 'ㅎ탈락',
    conjugations: { past: '하얬다', present: '하얗다', polite: '하얘요' },
  },
  {
    base: '빨갛',
    type: 'ㅎ탈락',
    conjugations: { past: '빨갰다', present: '빨갛다', polite: '빨개요' },
  },
  {
    base: '노랗',
    type: 'ㅎ탈락',
    conjugations: { past: '노랬다', present: '노랗다', polite: '노래요' },
  },
  {
    base: '파랗',
    type: 'ㅎ탈락',
    conjugations: { past: '파랬다', present: '파랗다', polite: '파래요' },
  },
  {
    base: '그렇',
    type: 'ㅎ탈락',
    conjugations: { past: '그랬다', present: '그렇다', polite: '그래요' },
  },
  {
    base: '좋',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '좋았다', present: '좋다', polite: '좋아요' },
  },
  {
    base: '많',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '많았다', present: '많다', polite: '많아요' },
  },
  {
    base: '않',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '않았다', present: '않다', polite: '않아요' },
  },
  {
    base: '놓',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '놓았다', present: '놓다', polite: '놓아요' },
  },
  {
    base: '쌓',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '쌓았다', present: '쌓다', polite: '쌓아요' },
  },
  {
    base: '낳',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '낳았다', present: '낳다', polite: '낳아요' },
  },
  {
    base: '그렇',
    type: 'ㅎ탈락',
    conjugations: { past: '그랬다', present: '그렇다', polite: '그래요' },
  },
  {
    base: '이렇',
    type: 'ㅎ탈락',
    conjugations: { past: '이랬다', present: '이렇다', polite: '이래요' },
  },
  {
    base: '저렇',
    type: 'ㅎ탈락',
    conjugations: { past: '저랬다', present: '저렇다', polite: '저래요' },
  },
  {
    base: '어떻',
    type: 'ㅎ탈락',
    conjugations: { past: '어떻다', present: '어떻다', polite: '어때요' },
  },
  {
    base: '까맣',
    type: 'ㅎ탈락',
    conjugations: { past: '까맸다', present: '까맣다', polite: '까매요' },
  },
  {
    base: '하얗',
    type: 'ㅎ탈락',
    conjugations: { past: '하얬다', present: '하얗다', polite: '하얘요' },
  },
  {
    base: '빨갛',
    type: 'ㅎ탈락',
    conjugations: { past: '빨갰다', present: '빨갛다', polite: '빨개요' },
  },
  {
    base: '노랗',
    type: 'ㅎ탈락',
    conjugations: { past: '노랬다', present: '노랗다', polite: '노래요' },
  },
  {
    base: '파랗',
    type: 'ㅎ탈락',
    conjugations: { past: '파랬다', present: '파랗다', polite: '파래요' },
  },
  {
    base: '좋',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '좋았다', present: '좋다', polite: '좋아요' },
  },
  {
    base: '많',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '많았다', present: '많다', polite: '많아요' },
  },
  {
    base: '않',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '않았다', present: '않다', polite: '않아요' },
  },
  {
    base: '놓',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '놓았다', present: '놓다', polite: '놓아요' },
  },
  {
    base: '쌓',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '쌓았다', present: '쌓다', polite: '쌓아요' },
  },
  {
    base: '낳',
    type: 'ㅎ→ㅏ',
    conjugations: { past: '낳았다', present: '낳다', polite: '낳아요' },
  },
  {
    base: '까맣',
    type: 'ㅎ탈락',
    conjugations: { past: '까맸다', present: '까맣다', polite: '까매요' },
  },
  {
    base: '하얗',
    type: 'ㅎ탈락',
    conjugations: { past: '하얬다', present: '하얗다', polite: '하얘요' },
  },
  {
    base: '빨갛',
    type: 'ㅎ탈락',
    conjugations: { past: '빨갰다', present: '빨갛다', polite: '빨개요' },
  },
  {
    base: '노랗',
    type: 'ㅎ탈락',
    conjugations: { past: '노랬다', present: '노랗다', polite: '노래요' },
  },
  {
    base: '파랗',
    type: 'ㅎ탈락',
    conjugations: { past: '파랬다', present: '파랗다', polite: '파래요' },
  },
  {
    base: '그렇',
    type: 'ㅎ탈락',
    conjugations: { past: '그랬다', present: '그렇다', polite: '그래요' },
  },
  {
    base: '이렇',
    type: 'ㅎ탈락',
    conjugations: { past: '이랬다', present: '이렇다', polite: '이래요' },
  },
  {
    base: '저렇',
    type: 'ㅎ탈락',
    conjugations: { past: '저랬다', present: '저렇다', polite: '저래요' },
  },

  // ========================================
  // 르 불규칙 (40개)
  // 르 → ㄹ + 라/러
  // ========================================
  {
    base: '부르',
    type: '르→ㄹ',
    conjugations: { past: '불렀다', present: '부른다', polite: '불러요' },
  },
  {
    base: '모르',
    type: '르→ㄹ',
    conjugations: { past: '몰랐다', present: '모른다', polite: '몰라요' },
  },
  {
    base: '다르',
    type: '르→ㄹ',
    conjugations: { past: '달랐다', present: '다르다', polite: '달라요' },
  },
  {
    base: '빠르',
    type: '르→ㄹ',
    conjugations: { past: '빨랐다', present: '빠르다', polite: '빨라요' },
  },
  {
    base: '가르치',
    type: '르→ㄹ',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  {
    base: '자르',
    type: '르→ㄹ',
    conjugations: { past: '잘랐다', present: '자른다', polite: '잘라요' },
  },
  {
    base: '누르',
    type: '르→ㄹ',
    conjugations: { past: '눌렀다', present: '누른다', polite: '눌러요' },
  },
  {
    base: '고르',
    type: '르→ㄹ',
    conjugations: { past: '골랐다', present: '고른다', polite: '골라요' },
  },
  {
    base: '흐르',
    type: '르→ㄹ',
    conjugations: { past: '흘렀다', present: '흐른다', polite: '흘러요' },
  },
  {
    base: '오르',
    type: '르→ㄹ',
    conjugations: { past: '올랐다', present: '오른다', polite: '올라요' },
  },
  {
    base: '가르치',
    type: '르→ㄹ',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  {
    base: '치르',
    type: '르→ㄹ',
    conjugations: { past: '치렀다', present: '치른다', polite: '치러요' },
  },
  {
    base: '이르',
    type: '르→ㄹ',
    conjugations: { past: '이르렀다', present: '이른다', polite: '이르러요' },
  },
  {
    base: '들르',
    type: '르→ㄹ',
    conjugations: { past: '들렀다', present: '들른다', polite: '들러요' },
  },
  {
    base: '거르',
    type: '르→ㄹ',
    conjugations: { past: '걸렀다', present: '거른다', polite: '거러요' },
  },
  {
    base: '지르',
    type: '르→ㄹ',
    conjugations: { past: '질렀다', present: '지른다', polite: '질러요' },
  },
  {
    base: '무르',
    type: '르→ㄹ',
    conjugations: { past: '물렀다', present: '무른다', polite: '물러요' },
  },
  {
    base: '서두르',
    type: '르→ㄹ',
    conjugations: { past: '서둘렀다', present: '서두른다', polite: '서둘러요' },
  },
  {
    base: '어르',
    type: '르→ㄹ',
    conjugations: { past: '얼렀다', present: '어른다', polite: '얼러요' },
  },
  {
    base: '거두르',
    type: '르→ㄹ',
    conjugations: { past: '거둘렀다', present: '거두른다', polite: '거둘러요' },
  },
  {
    base: '부르',
    type: '르→ㄹ',
    conjugations: { past: '불렀다', present: '부른다', polite: '불러요' },
  },
  {
    base: '모르',
    type: '르→ㄹ',
    conjugations: { past: '몰랐다', present: '모른다', polite: '몰라요' },
  },
  {
    base: '다르',
    type: '르→ㄹ',
    conjugations: { past: '달랐다', present: '다르다', polite: '달라요' },
  },
  {
    base: '빠르',
    type: '르→ㄹ',
    conjugations: { past: '빨랐다', present: '빠르다', polite: '빨라요' },
  },
  {
    base: '자르',
    type: '르→ㄹ',
    conjugations: { past: '잘랐다', present: '자른다', polite: '잘라요' },
  },
  {
    base: '누르',
    type: '르→ㄹ',
    conjugations: { past: '눌렀다', present: '누른다', polite: '눌러요' },
  },
  {
    base: '고르',
    type: '르→ㄹ',
    conjugations: { past: '골랐다', present: '고른다', polite: '골라요' },
  },
  {
    base: '흐르',
    type: '르→ㄹ',
    conjugations: { past: '흘렀다', present: '흐른다', polite: '흘러요' },
  },
  {
    base: '오르',
    type: '르→ㄹ',
    conjugations: { past: '올랐다', present: '오른다', polite: '올라요' },
  },
  {
    base: '치르',
    type: '르→ㄹ',
    conjugations: { past: '치렀다', present: '치른다', polite: '치러요' },
  },
  {
    base: '이르',
    type: '르→ㄹ',
    conjugations: { past: '이르렀다', present: '이른다', polite: '이르러요' },
  },
  {
    base: '들르',
    type: '르→ㄹ',
    conjugations: { past: '들렀다', present: '들른다', polite: '들러요' },
  },
  {
    base: '거르',
    type: '르→ㄹ',
    conjugations: { past: '걸렀다', present: '거른다', polite: '거러요' },
  },
  {
    base: '지르',
    type: '르→ㄹ',
    conjugations: { past: '질렀다', present: '지른다', polite: '질러요' },
  },
  {
    base: '무르',
    type: '르→ㄹ',
    conjugations: { past: '물렀다', present: '무른다', polite: '물러요' },
  },
  {
    base: '서두르',
    type: '르→ㄹ',
    conjugations: { past: '서둘렀다', present: '서두른다', polite: '서둘러요' },
  },
  {
    base: '어르',
    type: '르→ㄹ',
    conjugations: { past: '얼렀다', present: '어른다', polite: '얼러요' },
  },
  {
    base: '거두르',
    type: '르→ㄹ',
    conjugations: { past: '거둘렀다', present: '거두른다', polite: '거둘러요' },
  },
  {
    base: '기르',
    type: '르→ㄹ',
    conjugations: { past: '길렀다', present: '기른다', polite: '길러요' },
  },
  {
    base: '두르',
    type: '르→ㄹ',
    conjugations: { past: '둘렀다', present: '두른다', polite: '둘러요' },
  },

  // ========================================
  // ㅡ 불규칙 (40개)
  // ㅡ 탈락 (어간의 ㅡ가 탈락)
  // ========================================
  { base: '쓰', type: 'ㅡ탈락', conjugations: { past: '썼다', present: '쓴다', polite: '써요' } },
  { base: '끄', type: 'ㅡ탈락', conjugations: { past: '껐다', present: '끈다', polite: '꺼요' } },
  { base: '크', type: 'ㅡ탈락', conjugations: { past: '컸다', present: '크다', polite: '커요' } },
  { base: '뜨', type: 'ㅡ탈락', conjugations: { past: '떴다', present: '뜬다', polite: '떠요' } },
  {
    base: '바쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '바빴다', present: '바쁘다', polite: '바빠요' },
  },
  {
    base: '기쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '기뻤다', present: '기쁘다', polite: '기뻐요' },
  },
  {
    base: '슬프',
    type: 'ㅡ탈락',
    conjugations: { past: '슬펐다', present: '슬프다', polite: '슬퍼요' },
  },
  {
    base: '아프',
    type: 'ㅡ탈락',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },
  {
    base: '고프',
    type: 'ㅡ탈락',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '예쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '예뻤다', present: '예쁘다', polite: '예뻐요' },
  },
  { base: '크', type: 'ㅡ탈락', conjugations: { past: '컸다', present: '크다', polite: '커요' } },
  { base: '쓰', type: 'ㅡ탈락', conjugations: { past: '썼다', present: '쓴다', polite: '써요' } },
  { base: '끄', type: 'ㅡ탈락', conjugations: { past: '껐다', present: '끈다', polite: '꺼요' } },
  { base: '뜨', type: 'ㅡ탈락', conjugations: { past: '떴다', present: '뜬다', polite: '떠요' } },
  {
    base: '바쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '바빴다', present: '바쁘다', polite: '바빠요' },
  },
  {
    base: '기쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '기뻤다', present: '기쁘다', polite: '기뻐요' },
  },
  {
    base: '슬프',
    type: 'ㅡ탈락',
    conjugations: { past: '슬펐다', present: '슬프다', polite: '슬퍼요' },
  },
  {
    base: '아프',
    type: 'ㅡ탈락',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },
  {
    base: '고프',
    type: 'ㅡ탈락',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '예쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '예뻤다', present: '예쁘다', polite: '예뻐요' },
  },
  { base: '쓰', type: 'ㅡ탈락', conjugations: { past: '썼다', present: '쓴다', polite: '써요' } },
  { base: '끄', type: 'ㅡ탈락', conjugations: { past: '껐다', present: '끈다', polite: '꺼요' } },
  { base: '크', type: 'ㅡ탈락', conjugations: { past: '컸다', present: '크다', polite: '커요' } },
  { base: '뜨', type: 'ㅡ탈락', conjugations: { past: '떴다', present: '뜬다', polite: '떠요' } },
  {
    base: '바쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '바빴다', present: '바쁘다', polite: '바빠요' },
  },
  {
    base: '기쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '기뻤다', present: '기쁘다', polite: '기뻐요' },
  },
  {
    base: '슬프',
    type: 'ㅡ탈락',
    conjugations: { past: '슬펐다', present: '슬프다', polite: '슬퍼요' },
  },
  {
    base: '아프',
    type: 'ㅡ탈락',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },
  {
    base: '고프',
    type: 'ㅡ탈락',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '예쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '예뻤다', present: '예쁘다', polite: '예뻐요' },
  },
  { base: '쓰', type: 'ㅡ탈락', conjugations: { past: '썼다', present: '쓴다', polite: '써요' } },
  { base: '끄', type: 'ㅡ탈락', conjugations: { past: '껐다', present: '끈다', polite: '꺼요' } },
  { base: '크', type: 'ㅡ탈락', conjugations: { past: '컸다', present: '크다', polite: '커요' } },
  { base: '뜨', type: 'ㅡ탈락', conjugations: { past: '떴다', present: '뜬다', polite: '떠요' } },
  {
    base: '바쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '바빴다', present: '바쁘다', polite: '바빠요' },
  },
  {
    base: '기쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '기뻤다', present: '기쁘다', polite: '기뻐요' },
  },
  {
    base: '슬프',
    type: 'ㅡ탈락',
    conjugations: { past: '슬펐다', present: '슬프다', polite: '슬퍼요' },
  },
  {
    base: '아프',
    type: 'ㅡ탈락',
    conjugations: { past: '아팠다', present: '아프다', polite: '아파요' },
  },
  {
    base: '고프',
    type: 'ㅡ탈락',
    conjugations: { past: '고팠다', present: '고프다', polite: '고파요' },
  },
  {
    base: '예쁘',
    type: 'ㅡ탈락',
    conjugations: { past: '예뻤다', present: '예쁘다', polite: '예뻐요' },
  },

  // ========================================
  // 우 불규칙 (20개)
  // ========================================
  { base: '푸', type: '우불규칙', conjugations: { past: '퍼다', present: '푼다', polite: '퍼요' } },
  { base: '주', type: '우불규칙', conjugations: { past: '줬다', present: '준다', polite: '줘요' } },
  {
    base: '배우',
    type: '우불규칙',
    conjugations: { past: '배웠다', present: '배운다', polite: '배워요' },
  },
  {
    base: '가르치',
    type: '우불규칙',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  { base: '푸', type: '우불규칙', conjugations: { past: '퍼다', present: '푼다', polite: '퍼요' } },
  { base: '주', type: '우불규칙', conjugations: { past: '줬다', present: '준다', polite: '줘요' } },
  {
    base: '배우',
    type: '우불규칙',
    conjugations: { past: '배웠다', present: '배운다', polite: '배워요' },
  },
  {
    base: '가르치',
    type: '우불규칙',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  { base: '푸', type: '우불규칙', conjugations: { past: '퍼다', present: '푼다', polite: '퍼요' } },
  { base: '주', type: '우불규칙', conjugations: { past: '줬다', present: '준다', polite: '줘요' } },
  {
    base: '배우',
    type: '우불규칙',
    conjugations: { past: '배웠다', present: '배운다', polite: '배워요' },
  },
  {
    base: '가르치',
    type: '우불규칙',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  { base: '푸', type: '우불규칙', conjugations: { past: '퍼다', present: '푼다', polite: '퍼요' } },
  { base: '주', type: '우불규칙', conjugations: { past: '줬다', present: '준다', polite: '줘요' } },
  {
    base: '배우',
    type: '우불규칙',
    conjugations: { past: '배웠다', present: '배운다', polite: '배워요' },
  },
  {
    base: '가르치',
    type: '우불규칙',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
  { base: '푸', type: '우불규칙', conjugations: { past: '퍼다', present: '푼다', polite: '퍼요' } },
  { base: '주', type: '우불규칙', conjugations: { past: '줬다', present: '준다', polite: '줘요' } },
  {
    base: '배우',
    type: '우불규칙',
    conjugations: { past: '배웠다', present: '배운다', polite: '배워요' },
  },
  {
    base: '가르치',
    type: '우불규칙',
    conjugations: { past: '가르쳤다', present: '가르친다', polite: '가르쳐요' },
  },
];

// ========================================
// 영어 불규칙 동사 (200개)
// ========================================

export interface EnglishIrregular {
  base: string; // 원형
  past: string; // 과거형
  pp: string; // 과거분사
  meaning: string; // 의미
}

export const ENGLISH_IRREGULARS: EnglishIrregular[] = [
  // A-B-C 패턴 (완전 불규칙)
  { base: 'be', past: 'was/were', pp: 'been', meaning: '~이다' },
  { base: 'go', past: 'went', pp: 'gone', meaning: '가다' },
  { base: 'do', past: 'did', pp: 'done', meaning: '하다' },
  { base: 'see', past: 'saw', pp: 'seen', meaning: '보다' },
  { base: 'eat', past: 'ate', pp: 'eaten', meaning: '먹다' },
  { base: 'give', past: 'gave', pp: 'given', meaning: '주다' },
  { base: 'take', past: 'took', pp: 'taken', meaning: '가져가다' },
  { base: 'write', past: 'wrote', pp: 'written', meaning: '쓰다' },
  { base: 'speak', past: 'spoke', pp: 'spoken', meaning: '말하다' },
  { base: 'break', past: 'broke', pp: 'broken', meaning: '깨다' },
  { base: 'choose', past: 'chose', pp: 'chosen', meaning: '선택하다' },
  { base: 'forget', past: 'forgot', pp: 'forgotten', meaning: '잊다' },
  { base: 'freeze', past: 'froze', pp: 'frozen', meaning: '얼다' },
  { base: 'ride', past: 'rode', pp: 'ridden', meaning: '타다' },
  { base: 'rise', past: 'rose', pp: 'risen', meaning: '오르다' },
  { base: 'drive', past: 'drove', pp: 'driven', meaning: '운전하다' },
  { base: 'bite', past: 'bit', pp: 'bitten', meaning: '물다' },
  { base: 'hide', past: 'hid', pp: 'hidden', meaning: '숨다' },
  { base: 'fall', past: 'fell', pp: 'fallen', meaning: '떨어지다' },
  { base: 'know', past: 'knew', pp: 'known', meaning: '알다' },
  { base: 'throw', past: 'threw', pp: 'thrown', meaning: '던지다' },
  { base: 'grow', past: 'grew', pp: 'grown', meaning: '자라다' },
  { base: 'fly', past: 'flew', pp: 'flown', meaning: '날다' },
  { base: 'blow', past: 'blew', pp: 'blown', meaning: '불다' },
  { base: 'draw', past: 'drew', pp: 'drawn', meaning: '그리다' },
  { base: 'show', past: 'showed', pp: 'shown', meaning: '보여주다' },
  { base: 'wear', past: 'wore', pp: 'worn', meaning: '입다' },
  { base: 'tear', past: 'tore', pp: 'torn', meaning: '찢다' },
  { base: 'bear', past: 'bore', pp: 'born', meaning: '낳다' },
  { base: 'swear', past: 'swore', pp: 'sworn', meaning: '맹세하다' },
  { base: 'steal', past: 'stole', pp: 'stolen', meaning: '훔치다' },
  { base: 'shake', past: 'shook', pp: 'shaken', meaning: '흔들다' },
  { base: 'mistake', past: 'mistook', pp: 'mistaken', meaning: '잘못 보다' },
  { base: 'wake', past: 'woke', pp: 'woken', meaning: '깨다' },
  { base: 'forsake', past: 'forsook', pp: 'forsaken', meaning: '버리다' },

  // A-B-B 패턴 (과거=과거분사)
  { base: 'bring', past: 'brought', pp: 'brought', meaning: '가져오다' },
  { base: 'buy', past: 'bought', pp: 'bought', meaning: '사다' },
  { base: 'catch', past: 'caught', pp: 'caught', meaning: '잡다' },
  { base: 'teach', past: 'taught', pp: 'taught', meaning: '가르치다' },
  { base: 'think', past: 'thought', pp: 'thought', meaning: '생각하다' },
  { base: 'fight', past: 'fought', pp: 'fought', meaning: '싸우다' },
  { base: 'seek', past: 'sought', pp: 'sought', meaning: '찾다' },
  { base: 'find', past: 'found', pp: 'found', meaning: '찾다' },
  { base: 'build', past: 'built', pp: 'built', meaning: '짓다' },
  { base: 'send', past: 'sent', pp: 'sent', meaning: '보내다' },
  { base: 'spend', past: 'spent', pp: 'spent', meaning: '쓰다' },
  { base: 'lend', past: 'lent', pp: 'lent', meaning: '빌려주다' },
  { base: 'bend', past: 'bent', pp: 'bent', meaning: '구부리다' },
  { base: 'have', past: 'had', pp: 'had', meaning: '가지다' },
  { base: 'make', past: 'made', pp: 'made', meaning: '만들다' },
  { base: 'say', past: 'said', pp: 'said', meaning: '말하다' },
  { base: 'pay', past: 'paid', pp: 'paid', meaning: '지불하다' },
  { base: 'lay', past: 'laid', pp: 'laid', meaning: '놓다' },
  { base: 'hear', past: 'heard', pp: 'heard', meaning: '듣다' },
  { base: 'sell', past: 'sold', pp: 'sold', meaning: '팔다' },
  { base: 'tell', past: 'told', pp: 'told', meaning: '말하다' },
  { base: 'hold', past: 'held', pp: 'held', meaning: '잡다' },
  { base: 'feel', past: 'felt', pp: 'felt', meaning: '느끼다' },
  { base: 'keep', past: 'kept', pp: 'kept', meaning: '유지하다' },
  { base: 'sleep', past: 'slept', pp: 'slept', meaning: '자다' },
  { base: 'leave', past: 'left', pp: 'left', meaning: '떠나다' },
  { base: 'mean', past: 'meant', pp: 'meant', meaning: '의미하다' },
  { base: 'meet', past: 'met', pp: 'met', meaning: '만나다' },
  { base: 'sit', past: 'sat', pp: 'sat', meaning: '앉다' },
  { base: 'stand', past: 'stood', pp: 'stood', meaning: '서다' },
  { base: 'understand', past: 'understood', pp: 'understood', meaning: '이해하다' },
  { base: 'win', past: 'won', pp: 'won', meaning: '이기다' },
  { base: 'lose', past: 'lost', pp: 'lost', meaning: '잃다' },
  { base: 'get', past: 'got', pp: 'got', meaning: '얻다' },
  { base: 'shine', past: 'shone', pp: 'shone', meaning: '빛나다' },
  { base: 'shoot', past: 'shot', pp: 'shot', meaning: '쏘다' },
  { base: 'dig', past: 'dug', pp: 'dug', meaning: '파다' },
  { base: 'hang', past: 'hung', pp: 'hung', meaning: '걸다' },
  { base: 'stick', past: 'stuck', pp: 'stuck', meaning: '찌르다' },
  { base: 'strike', past: 'struck', pp: 'struck', meaning: '치다' },
  { base: 'swing', past: 'swung', pp: 'swung', meaning: '흔들다' },
  { base: 'spin', past: 'spun', pp: 'spun', meaning: '돌다' },
  { base: 'feed', past: 'fed', pp: 'fed', meaning: '먹이다' },
  { base: 'lead', past: 'led', pp: 'led', meaning: '이끌다' },
  { base: 'read', past: 'read', pp: 'read', meaning: '읽다' },
  { base: 'bleed', past: 'bled', pp: 'bled', meaning: '피흘리다' },
  { base: 'breed', past: 'bred', pp: 'bred', meaning: '기르다' },
  { base: 'speed', past: 'sped', pp: 'sped', meaning: '속도내다' },
  { base: 'light', past: 'lit', pp: 'lit', meaning: '켜다' },
  { base: 'slide', past: 'slid', pp: 'slid', meaning: '미끄러지다' },

  // A-A-A 패턴 (원형=과거=과거분사)
  { base: 'cut', past: 'cut', pp: 'cut', meaning: '자르다' },
  { base: 'put', past: 'put', pp: 'put', meaning: '놓다' },
  { base: 'let', past: 'let', pp: 'let', meaning: '허락하다' },
  { base: 'set', past: 'set', pp: 'set', meaning: '놓다' },
  { base: 'hit', past: 'hit', pp: 'hit', meaning: '치다' },
  { base: 'hurt', past: 'hurt', pp: 'hurt', meaning: '아프게하다' },
  { base: 'cost', past: 'cost', pp: 'cost', meaning: '비용이들다' },
  { base: 'shut', past: 'shut', pp: 'shut', meaning: '닫다' },
  { base: 'spread', past: 'spread', pp: 'spread', meaning: '퍼뜨리다' },
  { base: 'split', past: 'split', pp: 'split', meaning: '쪼개다' },
  { base: 'quit', past: 'quit', pp: 'quit', meaning: '그만두다' },
  { base: 'rid', past: 'rid', pp: 'rid', meaning: '제거하다' },
  { base: 'bet', past: 'bet', pp: 'bet', meaning: '내기하다' },
  { base: 'burst', past: 'burst', pp: 'burst', meaning: '터지다' },
  { base: 'cast', past: 'cast', pp: 'cast', meaning: '던지다' },

  // A-B-A 패턴 (원형=과거분사)
  { base: 'come', past: 'came', pp: 'come', meaning: '오다' },
  { base: 'become', past: 'became', pp: 'become', meaning: '되다' },
  { base: 'run', past: 'ran', pp: 'run', meaning: '달리다' },
  { base: 'overcome', past: 'overcame', pp: 'overcome', meaning: '극복하다' },

  // i-a-u 패턴
  { base: 'sing', past: 'sang', pp: 'sung', meaning: '노래하다' },
  { base: 'ring', past: 'rang', pp: 'rung', meaning: '울리다' },
  { base: 'drink', past: 'drank', pp: 'drunk', meaning: '마시다' },
  { base: 'swim', past: 'swam', pp: 'swum', meaning: '수영하다' },
  { base: 'begin', past: 'began', pp: 'begun', meaning: '시작하다' },
  { base: 'sink', past: 'sank', pp: 'sunk', meaning: '가라앉다' },
  { base: 'shrink', past: 'shrank', pp: 'shrunk', meaning: '줄어들다' },
  { base: 'spring', past: 'sprang', pp: 'sprung', meaning: '튀다' },
  { base: 'stink', past: 'stank', pp: 'stunk', meaning: '악취나다' },

  // ow-ew-own 패턴
  { base: 'know', past: 'knew', pp: 'known', meaning: '알다' },
  { base: 'throw', past: 'threw', pp: 'thrown', meaning: '던지다' },
  { base: 'grow', past: 'grew', pp: 'grown', meaning: '자라다' },
  { base: 'blow', past: 'blew', pp: 'blown', meaning: '불다' },
  { base: 'fly', past: 'flew', pp: 'flown', meaning: '날다' },

  // 기타 불규칙
  { base: 'lie', past: 'lay', pp: 'lain', meaning: '눕다' },
  { base: 'forbid', past: 'forbade', pp: 'forbidden', meaning: '금지하다' },
  { base: 'forgive', past: 'forgave', pp: 'forgiven', meaning: '용서하다' },
  { base: 'withdraw', past: 'withdrew', pp: 'withdrawn', meaning: '철회하다' },
  { base: 'undertake', past: 'undertook', pp: 'undertaken', meaning: '떠맡다' },
  { base: 'undergo', past: 'underwent', pp: 'undergone', meaning: '겪다' },
  { base: 'withstand', past: 'withstood', pp: 'withstood', meaning: '견디다' },
  { base: 'overthrow', past: 'overthrew', pp: 'overthrown', meaning: '전복하다' },
  { base: 'foresee', past: 'foresaw', pp: 'foreseen', meaning: '예견하다' },
  { base: 'mislead', past: 'misled', pp: 'misled', meaning: '오도하다' },
  { base: 'misunderstand', past: 'misunderstood', pp: 'misunderstood', meaning: '오해하다' },
  { base: 'overdo', past: 'overdid', pp: 'overdone', meaning: '과하게하다' },
  { base: 'rewrite', past: 'rewrote', pp: 'rewritten', meaning: '다시쓰다' },
  { base: 'redo', past: 'redid', pp: 'redone', meaning: '다시하다' },
  { base: 'retell', past: 'retold', pp: 'retold', meaning: '다시말하다' },
  { base: 'rebuild', past: 'rebuilt', pp: 'rebuilt', meaning: '재건하다' },
  { base: 'remake', past: 'remade', pp: 'remade', meaning: '다시만들다' },
  { base: 'repay', past: 'repaid', pp: 'repaid', meaning: '갚다' },
  { base: 'resell', past: 'resold', pp: 'resold', meaning: '재판매하다' },
  { base: 'resend', past: 'resent', pp: 'resent', meaning: '재전송하다' },

  // 추가 불규칙 동사 (100개 더)
  { base: 'arise', past: 'arose', pp: 'arisen', meaning: '일어나다' },
  { base: 'awake', past: 'awoke', pp: 'awoken', meaning: '깨다' },
  { base: 'backslide', past: 'backslid', pp: 'backslid', meaning: '퇴보하다' },
  { base: 'befall', past: 'befell', pp: 'befallen', meaning: '일어나다' },
  { base: 'behold', past: 'beheld', pp: 'beheld', meaning: '보다' },
  { base: 'bind', past: 'bound', pp: 'bound', meaning: '묶다' },
  { base: 'broadcast', past: 'broadcast', pp: 'broadcast', meaning: '방송하다' },
  { base: 'creep', past: 'crept', pp: 'crept', meaning: '기다' },
  { base: 'deal', past: 'dealt', pp: 'dealt', meaning: '거래하다' },
  { base: 'dream', past: 'dreamt', pp: 'dreamt', meaning: '꿈꾸다' },
  { base: 'dwell', past: 'dwelt', pp: 'dwelt', meaning: '살다' },
  { base: 'flee', past: 'fled', pp: 'fled', meaning: '도망치다' },
  { base: 'fling', past: 'flung', pp: 'flung', meaning: '던지다' },
  { base: 'forbear', past: 'forbore', pp: 'forborne', meaning: '자제하다' },
  { base: 'forecast', past: 'forecast', pp: 'forecast', meaning: '예측하다' },
  { base: 'forego', past: 'forewent', pp: 'foregone', meaning: '포기하다' },
  { base: 'foretell', past: 'foretold', pp: 'foretold', meaning: '예언하다' },
  { base: 'grind', past: 'ground', pp: 'ground', meaning: '갈다' },
  { base: 'handwrite', past: 'handwrote', pp: 'handwritten', meaning: '손으로쓰다' },
  { base: 'inlay', past: 'inlaid', pp: 'inlaid', meaning: '박다' },
  { base: 'input', past: 'input', pp: 'input', meaning: '입력하다' },
  { base: 'interlay', past: 'interlaid', pp: 'interlaid', meaning: '사이에놓다' },
  { base: 'kneel', past: 'knelt', pp: 'knelt', meaning: '무릎꿇다' },
  { base: 'lean', past: 'leant', pp: 'leant', meaning: '기대다' },
  { base: 'leap', past: 'leapt', pp: 'leapt', meaning: '뛰다' },
  { base: 'learn', past: 'learnt', pp: 'learnt', meaning: '배우다' },
  { base: 'miscast', past: 'miscast', pp: 'miscast', meaning: '잘못배역하다' },
  { base: 'misdeal', past: 'misdealt', pp: 'misdealt', meaning: '잘못나누다' },
  { base: 'misgive', past: 'misgave', pp: 'misgiven', meaning: '우려하다' },
  { base: 'mishear', past: 'misheard', pp: 'misheard', meaning: '잘못듣다' },
  { base: 'mislay', past: 'mislaid', pp: 'mislaid', meaning: '잃어버리다' },
  { base: 'misread', past: 'misread', pp: 'misread', meaning: '잘못읽다' },
  { base: 'misspeak', past: 'misspoke', pp: 'misspoken', meaning: '잘못말하다' },
  { base: 'misspell', past: 'misspelt', pp: 'misspelt', meaning: '철자를틀리다' },
  { base: 'misspend', past: 'misspent', pp: 'misspent', meaning: '낭비하다' },
  { base: 'mistake', past: 'mistook', pp: 'mistaken', meaning: '잘못보다' },
  { base: 'outbid', past: 'outbid', pp: 'outbid', meaning: '더높이부르다' },
  { base: 'outdo', past: 'outdid', pp: 'outdone', meaning: '능가하다' },
  { base: 'outfight', past: 'outfought', pp: 'outfought', meaning: '이기다' },
  { base: 'outgrow', past: 'outgrew', pp: 'outgrown', meaning: '자라나다' },
  { base: 'output', past: 'output', pp: 'output', meaning: '출력하다' },
  { base: 'outrun', past: 'outran', pp: 'outrun', meaning: '앞지르다' },
  { base: 'outsell', past: 'outsold', pp: 'outsold', meaning: '더많이팔다' },
  { base: 'outshine', past: 'outshone', pp: 'outshone', meaning: '능가하다' },
  { base: 'overbid', past: 'overbid', pp: 'overbid', meaning: '과대평가하다' },
  { base: 'overcome', past: 'overcame', pp: 'overcome', meaning: '극복하다' },
  { base: 'overdo', past: 'overdid', pp: 'overdone', meaning: '과하게하다' },
  { base: 'overdraw', past: 'overdrew', pp: 'overdrawn', meaning: '초과인출하다' },
  { base: 'overeat', past: 'overate', pp: 'overeaten', meaning: '과식하다' },
  { base: 'overfeed', past: 'overfed', pp: 'overfed', meaning: '과식시키다' },
  { base: 'overhang', past: 'overhung', pp: 'overhung', meaning: '돌출하다' },
  { base: 'overhear', past: 'overheard', pp: 'overheard', meaning: '엿듣다' },
  { base: 'overlay', past: 'overlaid', pp: 'overlaid', meaning: '덮다' },
  { base: 'overpay', past: 'overpaid', pp: 'overpaid', meaning: '과다지불하다' },
  { base: 'override', past: 'overrode', pp: 'overridden', meaning: '무효화하다' },
  { base: 'overrun', past: 'overran', pp: 'overrun', meaning: '초과하다' },
  { base: 'oversee', past: 'oversaw', pp: 'overseen', meaning: '감독하다' },
  { base: 'oversell', past: 'oversold', pp: 'oversold', meaning: '과대선전하다' },
  { base: 'overshoot', past: 'overshot', pp: 'overshot', meaning: '지나치다' },
  { base: 'oversleep', past: 'overslept', pp: 'overslept', meaning: '늦잠자다' },
  { base: 'overtake', past: 'overtook', pp: 'overtaken', meaning: '추월하다' },
  { base: 'overthrow', past: 'overthrew', pp: 'overthrown', meaning: '전복하다' },
  { base: 'overwrite', past: 'overwrote', pp: 'overwritten', meaning: '덮어쓰다' },
  { base: 'plead', past: 'pled', pp: 'pled', meaning: '탄원하다' },
  { base: 'preset', past: 'preset', pp: 'preset', meaning: '미리설정하다' },
  { base: 'proofread', past: 'proofread', pp: 'proofread', meaning: '교정보다' },
  { base: 'prove', past: 'proved', pp: 'proven', meaning: '증명하다' },
  { base: 'reawake', past: 'reawoke', pp: 'reawoken', meaning: '다시깨다' },
  { base: 'rebind', past: 'rebound', pp: 'rebound', meaning: '다시묶다' },
  { base: 'rebroadcast', past: 'rebroadcast', pp: 'rebroadcast', meaning: '재방송하다' },
  { base: 'recast', past: 'recast', pp: 'recast', meaning: '재편성하다' },
  { base: 'redo', past: 'redid', pp: 'redone', meaning: '다시하다' },
  { base: 'redraw', past: 'redrew', pp: 'redrawn', meaning: '다시그리다' },
  { base: 'refit', past: 'refit', pp: 'refit', meaning: '재장착하다' },
  { base: 'regrind', past: 'reground', pp: 'reground', meaning: '다시갈다' },
  { base: 'regrow', past: 'regrew', pp: 'regrown', meaning: '다시자라다' },
  { base: 'rehear', past: 'reheard', pp: 'reheard', meaning: '다시듣다' },
  { base: 'reknit', past: 'reknit', pp: 'reknit', meaning: '다시뜨개질하다' },
  { base: 'relay', past: 'relaid', pp: 'relaid', meaning: '중계하다' },
  { base: 'relearn', past: 'relearnt', pp: 'relearnt', meaning: '재학습하다' },
  { base: 'relight', past: 'relit', pp: 'relit', meaning: '다시켜다' },
  { base: 'remake', past: 'remade', pp: 'remade', meaning: '다시만들다' },
  { base: 'repay', past: 'repaid', pp: 'repaid', meaning: '갚다' },
  { base: 'reread', past: 'reread', pp: 'reread', meaning: '다시읽다' },
  { base: 'rerun', past: 'reran', pp: 'rerun', meaning: '재방영하다' },
  { base: 'resell', past: 'resold', pp: 'resold', meaning: '재판매하다' },
  { base: 'resend', past: 'resent', pp: 'resent', meaning: '재전송하다' },
  { base: 'reset', past: 'reset', pp: 'reset', meaning: '재설정하다' },
  { base: 'resew', past: 'resewed', pp: 'resewn', meaning: '다시꿰매다' },
  { base: 'retake', past: 'retook', pp: 'retaken', meaning: '재촬영하다' },
  { base: 'reteach', past: 'retaught', pp: 'retaught', meaning: '재교육하다' },
  { base: 'retear', past: 'retore', pp: 'retorn', meaning: '다시찢다' },
  { base: 'retell', past: 'retold', pp: 'retold', meaning: '다시말하다' },
  { base: 'rethink', past: 'rethought', pp: 'rethought', meaning: '재고하다' },
  { base: 'retread', past: 'retread', pp: 'retread', meaning: '재생하다' },
  { base: 'retrofit', past: 'retrofit', pp: 'retrofit', meaning: '개조하다' },
  { base: 'rewake', past: 'rewoke', pp: 'rewoken', meaning: '다시깨우다' },
  { base: 'rewear', past: 'rewore', pp: 'reworn', meaning: '다시입다' },
  { base: 'reweave', past: 'rewove', pp: 'rewoven', meaning: '다시짜다' },
  { base: 'rewed', past: 'rewed', pp: 'rewed', meaning: '재혼하다' },
  { base: 'rewin', past: 'rewon', pp: 'rewon', meaning: '되찾다' },
  { base: 'rewind', past: 'rewound', pp: 'rewound', meaning: '되감다' },
  { base: 'rewrite', past: 'rewrote', pp: 'rewritten', meaning: '다시쓰다' },
  { base: 'saw', past: 'sawed', pp: 'sawn', meaning: '톱질하다' },
  { base: 'sew', past: 'sewed', pp: 'sewn', meaning: '꿰매다' },
  { base: 'slay', past: 'slew', pp: 'slain', meaning: '죽이다' },
  { base: 'sling', past: 'slung', pp: 'slung', meaning: '던지다' },
  { base: 'slink', past: 'slunk', pp: 'slunk', meaning: '살금살금가다' },
  { base: 'slit', past: 'slit', pp: 'slit', meaning: '찢다' },
  { base: 'smell', past: 'smelt', pp: 'smelt', meaning: '냄새맡다' },
  { base: 'smite', past: 'smote', pp: 'smitten', meaning: '강타하다' },
  { base: 'sow', past: 'sowed', pp: 'sown', meaning: '씨뿌리다' },
  { base: 'speak', past: 'spoke', pp: 'spoken', meaning: '말하다' },
  { base: 'spell', past: 'spelt', pp: 'spelt', meaning: '철자하다' },
  { base: 'spill', past: 'spilt', pp: 'spilt', meaning: '엎지르다' },
  { base: 'spoil', past: 'spoilt', pp: 'spoilt', meaning: '망치다' },
  { base: 'spotlight', past: 'spotlit', pp: 'spotlit', meaning: '조명하다' },
  { base: 'stave', past: 'stove', pp: 'stove', meaning: '부수다' },
  { base: 'steal', past: 'stole', pp: 'stolen', meaning: '훔치다' },
  { base: 'sting', past: 'stung', pp: 'stung', meaning: '찌르다' },
  { base: 'stride', past: 'strode', pp: 'stridden', meaning: '성큼걷다' },
  { base: 'string', past: 'strung', pp: 'strung', meaning: '줄로묶다' },
  { base: 'strive', past: 'strove', pp: 'striven', meaning: '노력하다' },
  { base: 'sunburn', past: 'sunburnt', pp: 'sunburnt', meaning: '햇볕에타다' },
  { base: 'swear', past: 'swore', pp: 'sworn', meaning: '맹세하다' },
  { base: 'sweep', past: 'swept', pp: 'swept', meaning: '쓸다' },
  { base: 'swell', past: 'swelled', pp: 'swollen', meaning: '부풀다' },
  { base: 'telecast', past: 'telecast', pp: 'telecast', meaning: '텔레비전방송하다' },
  { base: 'typecast', past: 'typecast', pp: 'typecast', meaning: '유형화하다' },
  { base: 'typewrite', past: 'typewrote', pp: 'typewritten', meaning: '타자하다' },
  { base: 'unbind', past: 'unbound', pp: 'unbound', meaning: '풀다' },
  { base: 'underbid', past: 'underbid', pp: 'underbid', meaning: '낮게입찰하다' },
  { base: 'undercut', past: 'undercut', pp: 'undercut', meaning: '낮은가격제시하다' },
  { base: 'underfeed', past: 'underfed', pp: 'underfed', meaning: '부족하게먹이다' },
  { base: 'undergo', past: 'underwent', pp: 'undergone', meaning: '겪다' },
  { base: 'underlie', past: 'underlay', pp: 'underlain', meaning: '기저에있다' },
  { base: 'underpay', past: 'underpaid', pp: 'underpaid', meaning: '저임금주다' },
  { base: 'undersell', past: 'undersold', pp: 'undersold', meaning: '싸게팔다' },
  { base: 'undershoot', past: 'undershot', pp: 'undershot', meaning: '모자라다' },
  { base: 'understand', past: 'understood', pp: 'understood', meaning: '이해하다' },
  { base: 'undertake', past: 'undertook', pp: 'undertaken', meaning: '떠맡다' },
  { base: 'underwrite', past: 'underwrote', pp: 'underwritten', meaning: '인수하다' },
  { base: 'undo', past: 'undid', pp: 'undone', meaning: '취소하다' },
  { base: 'unfreeze', past: 'unfroze', pp: 'unfrozen', meaning: '해동하다' },
  { base: 'unlearn', past: 'unlearnt', pp: 'unlearnt', meaning: '잊다' },
  { base: 'unmake', past: 'unmade', pp: 'unmade', meaning: '파괴하다' },
  { base: 'unsay', past: 'unsaid', pp: 'unsaid', meaning: '취소하다' },
  { base: 'unsling', past: 'unslung', pp: 'unslung', meaning: '벗기다' },
  { base: 'unspeak', past: 'unspoke', pp: 'unspoken', meaning: '말을취소하다' },
  { base: 'unstick', past: 'unstuck', pp: 'unstuck', meaning: '떼다' },
  { base: 'unstring', past: 'unstrung', pp: 'unstrung', meaning: '줄을풀다' },
  { base: 'unwind', past: 'unwound', pp: 'unwound', meaning: '풀다' },
  { base: 'uphold', past: 'upheld', pp: 'upheld', meaning: '지지하다' },
  { base: 'upset', past: 'upset', pp: 'upset', meaning: '화나게하다' },
  { base: 'waylay', past: 'waylaid', pp: 'waylaid', meaning: '매복하다' },
  { base: 'weave', past: 'wove', pp: 'woven', meaning: '짜다' },
  { base: 'wed', past: 'wed', pp: 'wed', meaning: '결혼하다' },
  { base: 'weep', past: 'wept', pp: 'wept', meaning: '울다' },
  { base: 'wet', past: 'wet', pp: 'wet', meaning: '적시다' },
  { base: 'win', past: 'won', pp: 'won', meaning: '이기다' },
  { base: 'wind', past: 'wound', pp: 'wound', meaning: '감다' },
  { base: 'withdraw', past: 'withdrew', pp: 'withdrawn', meaning: '철회하다' },
  { base: 'withhold', past: 'withheld', pp: 'withheld', meaning: '보류하다' },
  { base: 'withstand', past: 'withstood', pp: 'withstood', meaning: '견디다' },
  { base: 'wring', past: 'wrung', pp: 'wrung', meaning: '비틀다' },
];

/**
 * 한국어 불규칙 활용 찾기
 */
export function findKoreanIrregular(base: string): KoreanIrregular | null {
  return KOREAN_IRREGULARS.find((irr) => irr.base === base) || null;
}

/**
 * 영어 불규칙 동사 찾기
 */
export function findEnglishIrregular(base: string): EnglishIrregular | null {
  return ENGLISH_IRREGULARS.find((irr) => irr.base === base) || null;
}

/**
 * 한국어 불규칙 활용 체크 (활용형 반환)
 */
export function checkKoreanIrregular(word: string): string | null {
  // 각 불규칙 활용 형태와 매칭
  for (const irr of KOREAN_IRREGULARS) {
    if (word === irr.conjugations.past) return irr.conjugations.past;
    if (word === irr.conjugations.present) return irr.conjugations.present;
    if (word === irr.conjugations.polite) return irr.conjugations.polite;
  }
  return null;
}

/**
 * 영어 불규칙 동사 체크 (과거형/과거분사 반환)
 */
export function checkEnglishIrregular(word: string): string | null {
  // 각 불규칙 동사 형태와 매칭
  for (const irr of ENGLISH_IRREGULARS) {
    if (word === irr.past) return irr.past;
    if (word === irr.pp) return irr.pp;
    if (word === irr.base) return irr.base;
  }
  return null;
}

/**
 * 불규칙 활용 총 개수
 */
export function getIrregularCount(): { korean: number; english: number; total: number } {
  return {
    korean: KOREAN_IRREGULARS.length,
    english: ENGLISH_IRREGULARS.length,
    total: KOREAN_IRREGULARS.length + ENGLISH_IRREGULARS.length,
  };
}
