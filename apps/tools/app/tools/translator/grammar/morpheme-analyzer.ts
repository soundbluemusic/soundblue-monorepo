// ========================================
// Advanced Morpheme Analyzer - 고급 형태소 분석기
// 어간/어미/조사 분리 + 불규칙 활용 처리
// ========================================

import { isHangul } from '../hangul';

// 품사 타입
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'number'
  | 'determiner'
  | 'unknown';

// 시제 타입
export type Tense = 'present' | 'past' | 'future' | 'progressive';

// 높임 타입
export type Formality = 'formal' | 'polite' | 'casual';

// 문장 성분 역할
export type Role =
  | 'subject'
  | 'object'
  | 'topic'
  | 'complement'
  | 'adverbial'
  | 'predicate'
  | 'modifier'
  | 'unknown';

// 형태소 분석 결과
export interface MorphemeAnalysis {
  original: string; // 원본 단어
  stem: string; // 어간/어근
  pos: PartOfSpeech; // 품사
  role?: Role; // 문장 성분
  particle?: string; // 조사
  ending?: string; // 어미
  tense?: Tense; // 시제
  formality?: Formality; // 높임
  isNegative?: boolean; // 부정
  negationType?: 'did_not' | 'could_not'; // 부정 유형: 안 했다 vs 못 했다
  isQuestion?: boolean; // 의문
  isHonorable?: boolean; // 존칭
  isSpeculative?: boolean; // 추측 (~했을까?, ~겠지?)
  isConditional?: boolean; // 조건 (~다면, ~으면)
  isHypothetical?: boolean; // 가정법 (~했을 텐데, ~했더라면)
}

// ========================================
// 조사 사전 (확장)
// ========================================
export const PARTICLES: Record<string, { role: Role; en: string }> = {
  // 주격 조사
  이: { role: 'subject', en: '' },
  가: { role: 'subject', en: '' },
  께서: { role: 'subject', en: '' }, // 존칭 주격

  // 목적격 조사
  을: { role: 'object', en: '' },
  를: { role: 'object', en: '' },

  // 주제 조사
  은: { role: 'topic', en: '' },
  는: { role: 'topic', en: '' },

  // 부사격 조사 - 장소/방향
  에: { role: 'adverbial', en: 'to' },
  에서: { role: 'adverbial', en: 'at' },
  로: { role: 'adverbial', en: 'to' },
  으로: { role: 'adverbial', en: 'to' },
  까지: { role: 'adverbial', en: 'until' },
  부터: { role: 'adverbial', en: 'from' },

  // 부사격 조사 - 대상
  에게: { role: 'adverbial', en: 'to' },
  한테: { role: 'adverbial', en: 'to' },
  께: { role: 'adverbial', en: 'to' }, // 존칭

  // 부사격 조사 - 동반/비교
  와: { role: 'adverbial', en: 'with' },
  과: { role: 'adverbial', en: 'with' },
  이랑: { role: 'adverbial', en: 'with' },
  랑: { role: 'adverbial', en: 'with' },
  보다: { role: 'adverbial', en: 'than' },
  처럼: { role: 'adverbial', en: 'like' },
  같이: { role: 'adverbial', en: 'like' },
  만큼: { role: 'adverbial', en: 'as much as' },

  // 소유격 조사
  의: { role: 'modifier', en: "'s" },

  // 위치 표현 조사 (명사+에 복합형)
  위에: { role: 'adverbial', en: 'on' },
  아래에: { role: 'adverbial', en: 'under' },
  밑에: { role: 'adverbial', en: 'under' },
  옆에: { role: 'adverbial', en: 'beside' },
  앞에: { role: 'adverbial', en: 'in front of' },
  뒤에: { role: 'adverbial', en: 'behind' },
  안에: { role: 'adverbial', en: 'inside' },
  속에: { role: 'adverbial', en: 'inside' },
  밖에서: { role: 'adverbial', en: 'outside' },

  // 보조사
  도: { role: 'topic', en: 'also' },
  만: { role: 'topic', en: 'only' },
  밖에: { role: 'topic', en: 'only' }, // + 부정
  조차: { role: 'topic', en: 'even' },
  마저: { role: 'topic', en: 'even' },
};

// 조사 목록 (길이순 - 긴 것 먼저)
export const PARTICLE_LIST = Object.keys(PARTICLES).sort((a, b) => b.length - a.length);

// ========================================
// 대명사 목록 (조사 없이도 주어 역할)
// 3인칭 지시대명사, 1/2인칭 대명사
// ========================================
const SUBJECT_PRONOUNS = new Set([
  // 3인칭 지시 (that person)
  '쟤', // that person (casual, pointing)
  '걔', // that person (casual)
  '얘', // this person (casual)
  '그', // he/that (formal)
  '그녀', // she (formal)
  '그것', // it/that thing
  '이것', // this thing
  '저것', // that thing (far)
  // 1인칭
  '나', // I (casual)
  '저', // I (formal)
  // 2인칭
  '너', // you (casual)
  '당신', // you (formal)
  '자네', // you (semi-formal, older to younger)
  // 복수
  '우리', // we
  '저희', // we (humble)
  '너희', // you all
  '그들', // they
]);

// ========================================
// 순수 부사 목록 (조사 없이 단독으로 부사어 역할)
// 시간 부사, 빈도 부사, 정도 부사, 양태 부사
// ========================================
const PURE_ADVERBS = new Set([
  // 시간 부사
  '어제',
  '오늘',
  '내일',
  '지금',
  '방금',
  '아까',
  '이제',
  '곧',
  '드디어',
  '마침내',
  '결국',
  '다시',
  '또',
  '이미',
  '벌써',
  '아직',
  '여전히',
  '항상',
  '늘',
  '자주',
  '가끔',
  '때때로',
  '종종',
  '매일',
  '매번',
  // 양태 부사 (manner)
  '일찍',
  '늦게',
  '빨리',
  '천천히',
  '조용히',
  '크게',
  '작게',
  '잘',
  '못',
  '함께',
  '혼자',
  '같이',
  // 정도 부사
  '매우',
  '아주',
  '정말',
  '진짜',
  '너무',
  '조금',
  '약간',
  '많이',
  '적게',
  '거의',
  '전혀',
  '완전', // 완전히 (MZ세대 줄임말)
  // 부정 부사
  '안',
  // 접속 부사
  '그리고',
  '그러나',
  '하지만',
  '그래서',
  '그러면',
  '그런데',
  '또한',
  '게다가',
  '다행히',
  '불행히',
  '분명히',
  '확실히',
]);

// ========================================
// 어미 사전 (확장)
// ========================================
export interface EndingInfo {
  tense: Tense;
  formality: Formality;
  isQuestion?: boolean;
  isNegative?: boolean;
  isHonorable?: boolean;
  isSpeculative?: boolean; // 추측 (~했을까?, ~겠지?)
  isConditional?: boolean; // 조건 (~다면, ~으면)
  isHypothetical?: boolean; // 가정법 (~했을 텐데, ~했더라면)
}

export const ENDINGS: Record<string, EndingInfo> = {
  // === 현재 시제 ===
  // 격식체 (formal)
  습니다: { tense: 'present', formality: 'formal' },
  ㅂ니다: { tense: 'present', formality: 'formal' },
  습니까: { tense: 'present', formality: 'formal', isQuestion: true },
  ㅂ니까: { tense: 'present', formality: 'formal', isQuestion: true },

  // 해요체 (polite)
  아요: { tense: 'present', formality: 'polite' },
  어요: { tense: 'present', formality: 'polite' },
  여요: { tense: 'present', formality: 'polite' },
  해요: { tense: 'present', formality: 'polite' },
  이에요: { tense: 'present', formality: 'polite' },
  예요: { tense: 'present', formality: 'polite' },
  세요: { tense: 'present', formality: 'polite', isHonorable: true },
  으세요: { tense: 'present', formality: 'polite', isHonorable: true },
  셔요: { tense: 'present', formality: 'polite', isHonorable: true },
  으셔요: { tense: 'present', formality: 'polite', isHonorable: true },

  // 반말 (casual)
  아: { tense: 'present', formality: 'casual' },
  어: { tense: 'present', formality: 'casual' },
  여: { tense: 'present', formality: 'casual' },
  해: { tense: 'present', formality: 'casual' },
  야: { tense: 'present', formality: 'casual' },
  이야: { tense: 'present', formality: 'casual' },

  // 평서형 (기본)
  다: { tense: 'present', formality: 'casual' },
  ㄴ다: { tense: 'present', formality: 'casual' },
  는다: { tense: 'present', formality: 'casual' },
  이다: { tense: 'present', formality: 'casual' },

  // === 과거 시제 ===
  // 격식체
  았습니다: { tense: 'past', formality: 'formal' },
  었습니다: { tense: 'past', formality: 'formal' },
  였습니다: { tense: 'past', formality: 'formal' },
  했습니다: { tense: 'past', formality: 'formal' },
  았습니까: { tense: 'past', formality: 'formal', isQuestion: true },
  었습니까: { tense: 'past', formality: 'formal', isQuestion: true },

  // 해요체
  았어요: { tense: 'past', formality: 'polite' },
  었어요: { tense: 'past', formality: 'polite' },
  였어요: { tense: 'past', formality: 'polite' },
  했어요: { tense: 'past', formality: 'polite' },
  셨어요: { tense: 'past', formality: 'polite', isHonorable: true },
  으셨어요: { tense: 'past', formality: 'polite', isHonorable: true },

  // 반말
  았어: { tense: 'past', formality: 'casual' },
  었어: { tense: 'past', formality: 'casual' },
  였어: { tense: 'past', formality: 'casual' },
  했어: { tense: 'past', formality: 'casual' },

  // 과거 기본
  았다: { tense: 'past', formality: 'casual' },
  었다: { tense: 'past', formality: 'casual' },
  였다: { tense: 'past', formality: 'casual' },
  했다: { tense: 'past', formality: 'casual' },

  // === 미래 시제 ===
  겠습니다: { tense: 'future', formality: 'formal' },
  겠어요: { tense: 'future', formality: 'polite' },
  겠어: { tense: 'future', formality: 'casual' },
  'ㄹ 거예요': { tense: 'future', formality: 'polite' },
  '을 거예요': { tense: 'future', formality: 'polite' },
  'ㄹ 거야': { tense: 'future', formality: 'casual' },
  '을 거야': { tense: 'future', formality: 'casual' },
  ㄹ게요: { tense: 'future', formality: 'polite' },
  을게요: { tense: 'future', formality: 'polite' },
  ㄹ게: { tense: 'future', formality: 'casual' },
  을게: { tense: 'future', formality: 'casual' },

  // === 진행 시제 ===
  '고 있어요': { tense: 'progressive', formality: 'polite' },
  '고 있어': { tense: 'progressive', formality: 'casual' },
  '고 있습니다': { tense: 'progressive', formality: 'formal' },

  // === 부정 ===
  '지 않아요': { tense: 'present', formality: 'polite', isNegative: true },
  '지 않습니다': { tense: 'present', formality: 'formal', isNegative: true },
  '지 않았어요': { tense: 'past', formality: 'polite', isNegative: true },

  // === 의문형 현재 ===
  나요: { tense: 'present', formality: 'polite', isQuestion: true },
  니: { tense: 'present', formality: 'casual', isQuestion: true },
  니까: { tense: 'present', formality: 'casual', isQuestion: true },

  // === 의문형 과거 ===
  았니: { tense: 'past', formality: 'casual', isQuestion: true },
  었니: { tense: 'past', formality: 'casual', isQuestion: true },
  였니: { tense: 'past', formality: 'casual', isQuestion: true },
  했니: { tense: 'past', formality: 'casual', isQuestion: true },
  았나요: { tense: 'past', formality: 'polite', isQuestion: true },
  었나요: { tense: 'past', formality: 'polite', isQuestion: true },
  였나요: { tense: 'past', formality: 'polite', isQuestion: true },
  했나요: { tense: 'past', formality: 'polite', isQuestion: true },

  // === 구어체 과거 (복합 동사 어미) ===
  // 예: "갔다 왔어?", "책을 샀어"
  왔어: { tense: 'past', formality: 'casual' },
  줬어: { tense: 'past', formality: 'casual' },
  샀어: { tense: 'past', formality: 'casual' },
  봤어: { tense: 'past', formality: 'casual' },
  갔어: { tense: 'past', formality: 'casual' },

  // === 추측 어미 (Speculative) ===
  // 과거 추측 의문 (~했을까?)
  았을까: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  었을까: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  였을까: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  했을까: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  // 현재/미래 추측 확인 (~겠지?)
  겠지: { tense: 'future', formality: 'casual', isQuestion: true, isSpeculative: true },
  았겠지: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  었겠지: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  였겠지: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  했겠지: { tense: 'past', formality: 'casual', isQuestion: true, isSpeculative: true },
  // 추측 확인 정중 (~겠죠?)
  겠죠: { tense: 'future', formality: 'polite', isQuestion: true, isSpeculative: true },
  // 추측 평서 (~겠지만, ~을 것 같아)
  '을 것 같아': { tense: 'future', formality: 'casual', isSpeculative: true },
  '을 것 같아요': { tense: 'future', formality: 'polite', isSpeculative: true },
  '았을 것 같아': { tense: 'past', formality: 'casual', isSpeculative: true },
  '었을 것 같아': { tense: 'past', formality: 'casual', isSpeculative: true },

  // === 조건 어미 (Conditional) ===
  // ~하면 (if)
  으면: { tense: 'present', formality: 'casual', isConditional: true },
  면: { tense: 'present', formality: 'casual', isConditional: true },
  // ~한다면 (if, formal)
  다면: { tense: 'present', formality: 'casual', isConditional: true },
  ㄴ다면: { tense: 'present', formality: 'casual', isConditional: true },
  는다면: { tense: 'present', formality: 'casual', isConditional: true },
  // ~했다면 (if, past)
  았다면: { tense: 'past', formality: 'casual', isConditional: true },
  었다면: { tense: 'past', formality: 'casual', isConditional: true },
  였다면: { tense: 'past', formality: 'casual', isConditional: true },
  했다면: { tense: 'past', formality: 'casual', isConditional: true },

  // === 가정법 어미 (Hypothetical) ===
  // ~했을 텐데 (would have)
  '았을 텐데': { tense: 'past', formality: 'casual', isHypothetical: true },
  '었을 텐데': { tense: 'past', formality: 'casual', isHypothetical: true },
  '였을 텐데': { tense: 'past', formality: 'casual', isHypothetical: true },
  '했을 텐데': { tense: 'past', formality: 'casual', isHypothetical: true },
  // ~했더라면 (if ... had)
  았더라면: { tense: 'past', formality: 'casual', isHypothetical: true, isConditional: true },
  었더라면: { tense: 'past', formality: 'casual', isHypothetical: true, isConditional: true },
  였더라면: { tense: 'past', formality: 'casual', isHypothetical: true, isConditional: true },
  했더라면: { tense: 'past', formality: 'casual', isHypothetical: true, isConditional: true },
  // ~할 텐데 (would)
  'ㄹ 텐데': { tense: 'future', formality: 'casual', isHypothetical: true },
  '을 텐데': { tense: 'future', formality: 'casual', isHypothetical: true },
  // ~했을 거야 (would have, certainty)
  '았을 거야': { tense: 'past', formality: 'casual', isHypothetical: true },
  '었을 거야': { tense: 'past', formality: 'casual', isHypothetical: true },
  '였을 거야': { tense: 'past', formality: 'casual', isHypothetical: true },
  '했을 거야': { tense: 'past', formality: 'casual', isHypothetical: true },

  // === 부정 + 가정 ===
  // ~하지 못했을 거야 (wouldn't have been able to)
  '지 못했을 거야': { tense: 'past', formality: 'casual', isNegative: true, isHypothetical: true },
  // ~하지 않았다면 (if hadn't)
  '지 않았다면': { tense: 'past', formality: 'casual', isNegative: true, isConditional: true },
  '지 않았으면': { tense: 'past', formality: 'casual', isNegative: true, isConditional: true },
};

// 어미 목록 (길이순)
export const ENDING_LIST = Object.keys(ENDINGS).sort((a, b) => b.length - a.length);

// ========================================
// 서술격 조사 (입니다/입니까/이에요 등)
// ========================================
export const COPULAS = [
  '입니다',
  '입니까',
  '이에요',
  '예요',
  '이야',
  '야',
  '이었어요',
  '였어요',
  '이었습니다',
  '였습니다',
  '이었어',
  '였어',
  '이겠습니다',
  '이겠어요',
  '이겠어',
];

// 서술격 조사 정보
export function analyzeCopula(
  word: string,
): { noun: string; copula: string; tense: Tense; formality: Formality } | null {
  for (const cop of COPULAS) {
    if (word.endsWith(cop)) {
      const noun = word.slice(0, -cop.length);
      if (noun) {
        let tense: Tense = 'present';
        let formality: Formality = 'polite';

        if (cop.includes('었') || cop.includes('였')) tense = 'past';
        if (cop.includes('겠')) tense = 'future';
        if (cop.includes('습니다') || cop.includes('습니까')) formality = 'formal';
        if (cop.includes('야') && !cop.includes('요')) formality = 'casual';

        return { noun, copula: cop, tense, formality };
      }
    }
  }
  return null;
}

// ========================================
// 불규칙 활용 처리
// ========================================
type IrregularType = 'ㄷ' | 'ㅂ' | 'ㅅ' | 'ㅎ' | '르' | '으' | '여' | 'regular';

// 불규칙 동사 목록
const IRREGULAR_VERBS: Record<string, { type: IrregularType; stem: string }> = {
  // ㄷ불규칙: 듣다→들어요
  들어: { type: 'ㄷ', stem: '듣' },
  들으: { type: 'ㄷ', stem: '듣' },
  물어: { type: 'ㄷ', stem: '묻' },
  물으: { type: 'ㄷ', stem: '묻' },
  걸어: { type: 'ㄷ', stem: '걷' },
  걸으: { type: 'ㄷ', stem: '걷' },
  깨달아: { type: 'ㄷ', stem: '깨닫' },

  // ㅂ불규칙: 돕다→도와요
  도와: { type: 'ㅂ', stem: '돕' },
  도우: { type: 'ㅂ', stem: '돕' },
  고와: { type: 'ㅂ', stem: '곱' },
  더워: { type: 'ㅂ', stem: '덥' },
  추워: { type: 'ㅂ', stem: '춥' },
  무거워: { type: 'ㅂ', stem: '무겁' },
  가벼워: { type: 'ㅂ', stem: '가볍' },
  귀여워: { type: 'ㅂ', stem: '귀엽' },
  아름다워: { type: 'ㅂ', stem: '아름답' },
  어려워: { type: 'ㅂ', stem: '어렵' },
  쉬워: { type: 'ㅂ', stem: '쉽' },
  매워: { type: 'ㅂ', stem: '맵' },
  무서워: { type: 'ㅂ', stem: '무섭' },

  // ㅅ불규칙: 짓다→지어요
  지어: { type: 'ㅅ', stem: '짓' },
  그어: { type: 'ㅅ', stem: '긋' },
  나아: { type: 'ㅅ', stem: '낫' },

  // ㅎ불규칙: 그렇다→그래요
  그래: { type: 'ㅎ', stem: '그렇' },
  빨개: { type: 'ㅎ', stem: '빨갛' },
  파래: { type: 'ㅎ', stem: '파랗' },
  노래: { type: 'ㅎ', stem: '노랗' },
  하얘: { type: 'ㅎ', stem: '하얗' },
  까매: { type: 'ㅎ', stem: '까맣' },

  // 르불규칙: 모르다→몰라요
  몰라: { type: '르', stem: '모르' },
  빨라: { type: '르', stem: '빠르' },
  길러: { type: '르', stem: '기르' },
  불러: { type: '르', stem: '부르' },
  골라: { type: '르', stem: '고르' },
  굴러: { type: '르', stem: '구르' },

  // 으탈락: 쓰다→써요
  써: { type: '으', stem: '쓰' },
  꺼: { type: '으', stem: '끄' },
  떠: { type: '으', stem: '뜨' },

  // 여불규칙: 하다→해요
  해: { type: '여', stem: '하' },
};

// ========================================
// 축약형 활용 패턴 (모음 축약 처리)
// ========================================
// 가 + 아요 → 가요, 오 + 아요 → 와요 등
const CONTRACTED_PATTERNS: Array<{
  pattern: RegExp;
  stemRestore: (match: RegExpMatchArray) => string;
  ending: string;
  tense: Tense;
  formality: Formality;
  isNegative?: boolean;
  negationType?: 'did_not' | 'could_not';
  isQuestion?: boolean;
  isSpeculative?: boolean;
  isConditional?: boolean;
  isHypothetical?: boolean;
}> = [
  // === 의지 부정 패턴: -지 않았어 (didn't) ===
  // 가다 → 가지 않는다 (띄어쓰기 없이 붙여 쓴 경우)
  {
    pattern: /^(.+)지않는다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않는다',
    tense: 'present',
    formality: 'casual',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않았다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않았다',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않아요$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않아요',
    tense: 'present',
    formality: 'polite',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않습니다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않습니다',
    tense: 'present',
    formality: 'formal',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않았습니다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않았습니다',
    tense: 'past',
    formality: 'formal',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않았어요$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않았어요',
    tense: 'past',
    formality: 'polite',
    isNegative: true,
    negationType: 'did_not',
  },
  {
    pattern: /^(.+)지않았어$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않았어',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    negationType: 'did_not',
  },

  // === 능력 부정 패턴: -지 못했어 (couldn't) ===
  // 가다 → 가지 못했다 (띄어쓰기 없이 붙여 쓴 경우)
  {
    pattern: /^(.+)지못하다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못하다',
    tense: 'present',
    formality: 'casual',
    isNegative: true,
    negationType: 'could_not',
  },
  {
    pattern: /^(.+)지못해요$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못해요',
    tense: 'present',
    formality: 'polite',
    isNegative: true,
    negationType: 'could_not',
  },
  {
    pattern: /^(.+)지못합니다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못합니다',
    tense: 'present',
    formality: 'formal',
    isNegative: true,
    negationType: 'could_not',
  },
  {
    pattern: /^(.+)지못했어$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못했어',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    negationType: 'could_not',
  },
  {
    pattern: /^(.+)지못했어요$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못했어요',
    tense: 'past',
    formality: 'polite',
    isNegative: true,
    negationType: 'could_not',
  },
  {
    pattern: /^(.+)지못했습니다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못했습니다',
    tense: 'past',
    formality: 'formal',
    isNegative: true,
    negationType: 'could_not',
  },

  // === 과거 시제 축약형 ===
  // 먹다 → 먹었어요 (일반 규칙)
  {
    pattern: /^(.+)었어요$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.+)었습니다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.+)었어$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었어',
    tense: 'past',
    formality: 'casual',
  },
  // 만나다 → 만났어요 (ㅏ+았 → 았)
  {
    pattern: /^(.+)났어요$/,
    stemRestore: (m) => `${m[1] ?? ''}나`,
    ending: '았어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.+)났습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}나`,
    ending: '았습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.+)났어$/,
    stemRestore: (m) => `${m[1] ?? ''}나`,
    ending: '았어',
    tense: 'past',
    formality: 'casual',
  },
  // 만나다 → 만났니? (ㅏ+았+니 → 았니, 의문형)
  {
    pattern: /^(.+)났니$/,
    stemRestore: (m) => `${m[1] ?? ''}나`,
    ending: '았니',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
  },
  // 가다 → 갔어요 (ㅏ+았 → 았)
  {
    pattern: /^(.*)갔어요$/,
    stemRestore: (m) => `${m[1] ?? ''}가`,
    ending: '았어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.*)갔습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}가`,
    ending: '았습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.*)갔어$/,
    stemRestore: (m) => `${m[1] ?? ''}가`,
    ending: '았어',
    tense: 'past',
    formality: 'casual',
  },
  // 하다 → 했어요
  {
    pattern: /^(.*)했어요$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.*)했습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.*)했어$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했어',
    tense: 'past',
    formality: 'casual',
  },
  // 하다 → 했니 (의문형)
  {
    pattern: /^(.*)했니$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했니',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
  },
  // 오다 → 왔어요
  {
    pattern: /^(.*)왔어요$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: '았어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.*)왔습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: '았습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.*)왔어$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: '았어',
    tense: 'past',
    formality: 'casual',
  },
  // 보다 → 봤어요
  {
    pattern: /^(.*)봤어요$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: '았어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.*)봤습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: '았습니다',
    tense: 'past',
    formality: 'formal',
  },
  {
    pattern: /^(.*)봤어$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: '았어',
    tense: 'past',
    formality: 'casual',
  },
  // 마시다 → 마셨어요 (ㅣ+었 → 셨)
  {
    pattern: /^(.+)셨어요$/,
    stemRestore: (m) => `${m[1] ?? ''}시`,
    ending: '었어요',
    tense: 'past',
    formality: 'polite',
  },
  {
    pattern: /^(.+)셨습니다$/,
    stemRestore: (m) => `${m[1] ?? ''}시`,
    ending: '었습니다',
    tense: 'past',
    formality: 'formal',
  },

  // === 현재 시제 축약형 ===
  // 하다 → 해요
  {
    pattern: /^(.+)해요$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '해요',
    tense: 'present',
    formality: 'polite',
  },
  // 오다 → 와요
  {
    pattern: /^(.*)와요$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: '아요',
    tense: 'present',
    formality: 'polite',
  },
  // 가다 → 가요 (특수: 단음절 동사)
  {
    pattern: /^가요$/,
    stemRestore: () => '가',
    ending: '아요',
    tense: 'present',
    formality: 'polite',
  },
  // 보다 → 봐요
  {
    pattern: /^(.*)봐요$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: '아요',
    tense: 'present',
    formality: 'polite',
  },

  // === 평서형 현재 시제 (ㄴ다/는다) ===
  // 받침 없는 동사 + ㄴ다: 가다→간다, 오다→온다, 보다→본다, 자다→잔다
  {
    pattern: /^(.*)간다$/,
    stemRestore: (m) => `${m[1] ?? ''}가`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)온다$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)본다$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)잔다$/,
    stemRestore: (m) => `${m[1] ?? ''}자`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)만난다$/,
    stemRestore: (m) => `${m[1] ?? ''}만나`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)탄다$/,
    stemRestore: (m) => `${m[1] ?? ''}타`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)산다$/,
    stemRestore: (m) => `${m[1] ?? ''}사`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  {
    pattern: /^(.*)마신다$/,
    stemRestore: (m) => `${m[1] ?? ''}마시`,
    ending: 'ㄴ다',
    tense: 'present',
    formality: 'casual',
  },
  // 받침 있는 동사 + 는다: 먹다→먹는다, 읽다→읽는다
  {
    pattern: /^(.+)는다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '는다',
    tense: 'present',
    formality: 'casual',
  },

  // === 과거 시제 추가 패턴 ===
  // 먹다 → 먹었다
  {
    pattern: /^(.+)었다$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었다',
    tense: 'past',
    formality: 'casual',
  },
  // 가다 → 갔다
  {
    pattern: /^(.*)갔다$/,
    stemRestore: (m) => `${m[1] ?? ''}가`,
    ending: '았다',
    tense: 'past',
    formality: 'casual',
  },
  // 오다 → 왔다
  {
    pattern: /^(.*)왔다$/,
    stemRestore: (m) => `${m[1] ?? ''}오`,
    ending: '았다',
    tense: 'past',
    formality: 'casual',
  },
  // 보다 → 봤다
  {
    pattern: /^(.*)봤다$/,
    stemRestore: (m) => `${m[1] ?? ''}보`,
    ending: '았다',
    tense: 'past',
    formality: 'casual',
  },
  // 하다 → 했다
  {
    pattern: /^(.*)했다$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했다',
    tense: 'past',
    formality: 'casual',
  },

  // === 추측 어미 패턴 (Speculative) ===
  // 졸업하다 → 졸업했을까 (과거 추측 의문)
  {
    pattern: /^(.*)했을까$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했을까',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  {
    pattern: /^(.+)었을까$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었을까',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  {
    pattern: /^(.+)았을까$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '았을까',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  // 떨어지다 → 떨어졌을까 (ㅈ 축약형)
  {
    pattern: /^(.*)졌을까$/,
    stemRestore: (m) => `${m[1] ?? ''}지`,
    ending: '었을까',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  // 지원하다 → 지원했겠지 (추측 확인)
  {
    pattern: /^(.*)했겠지$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했겠지',
    tense: 'past',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  {
    pattern: /^(.+)겠지$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '겠지',
    tense: 'future',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  // 떨리다 → 떨렸겠지만 (추측 + 역접)
  {
    pattern: /^(.*)렸겠지만$/,
    stemRestore: (m) => `${m[1] ?? ''}리`,
    ending: '었겠지만',
    tense: 'past',
    formality: 'casual',
    isSpeculative: true,
  },

  // === 조건 어미 패턴 (Conditional) ===
  // 포기하다 → 포기했다면 (과거 조건)
  {
    pattern: /^(.*)했다면$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했다면',
    tense: 'past',
    formality: 'casual',
    isConditional: true,
  },
  {
    pattern: /^(.+)았다면$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '았다면',
    tense: 'past',
    formality: 'casual',
    isConditional: true,
  },
  {
    pattern: /^(.+)었다면$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었다면',
    tense: 'past',
    formality: 'casual',
    isConditional: true,
  },
  // 도전하다 → 도전하지 않았다면 (부정 조건)
  {
    pattern: /^(.+)지않았다면$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지않았다면',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    isConditional: true,
  },
  // 도와주다 → 도와주지 않았다면 (부정 조건)
  {
    pattern: /^(.+)주지않았다면$/,
    stemRestore: (m) => `${m[1] ?? ''}주`,
    ending: '지않았다면',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    isConditional: true,
  },

  // === 가정법 어미 패턴 (Hypothetical) ===
  // 어렵다 → 어려웠을 텐데 (가정법 과거)
  {
    pattern: /^(.+)웠을텐데$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '웠을텐데',
    tense: 'past',
    formality: 'casual',
    isHypothetical: true,
  },
  {
    pattern: /^(.+)었을텐데$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었을텐데',
    tense: 'past',
    formality: 'casual',
    isHypothetical: true,
  },
  {
    pattern: /^(.*)했을텐데$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했을텐데',
    tense: 'past',
    formality: 'casual',
    isHypothetical: true,
  },
  // 합격하다 → 합격하지 못했을 거야 (부정 가정)
  {
    pattern: /^(.+)지못했을거야$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '지못했을거야',
    tense: 'past',
    formality: 'casual',
    isNegative: true,
    isHypothetical: true,
  },
  // 합격했을 때 (때 어미: when)
  {
    pattern: /^(.*)했을때$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했을때',
    tense: 'past',
    formality: 'casual',
  },
  {
    pattern: /^(.+)었을때$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '었을때',
    tense: 'past',
    formality: 'casual',
  },
  // 기쁘다 → 기뻤대 (전문)
  {
    pattern: /^(.+)뻤대$/,
    stemRestore: (m) => `${m[1] ?? ''}쁘`,
    ending: '었대',
    tense: 'past',
    formality: 'casual',
  },
  // 적응하다 → 적응했다니 (인용)
  {
    pattern: /^(.*)했다니$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했다니',
    tense: 'past',
    formality: 'casual',
  },
  // 하던데 (회상/경험)
  {
    pattern: /^(.*)하던데$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '하던데',
    tense: 'past',
    formality: 'casual',
  },
  // 했다고 (인용)
  {
    pattern: /^(.*)했다고$/,
    stemRestore: (m) => `${m[1] ?? ''}하`,
    ending: '했다고',
    tense: 'past',
    formality: 'casual',
  },
  // 정말일까 (의문)
  {
    pattern: /^(.+)일까$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '일까',
    tense: 'present',
    formality: 'casual',
    isQuestion: true,
    isSpeculative: true,
  },
  // 아닐까 (부정 추측)
  {
    pattern: /^(.+)아닐까$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '아닐까',
    tense: 'present',
    formality: 'casual',
    isQuestion: true,
    isNegative: true,
    isSpeculative: true,
  },
  // 건 아닐까 (아니다 + 추측)
  {
    pattern: /^(.+)건아닐까$/,
    stemRestore: (m) => m[1] ?? '',
    ending: '건아닐까',
    tense: 'present',
    formality: 'casual',
    isQuestion: true,
    isNegative: true,
    isSpeculative: true,
  },
];

// ========================================
// 형태소 분석 함수
// ========================================
export function analyzeMorpheme(word: string): MorphemeAnalysis {
  // 물음표/느낌표 등 구두점 분리 (의문/감탄 판별은 별도로 처리)
  const punctuation = word.match(/[?!]+$/)?.[0] || '';
  const cleanWord = punctuation ? word.slice(0, -punctuation.length) : word;
  const hasQuestionMark = punctuation.includes('?');

  const result: MorphemeAnalysis = {
    original: word,
    stem: cleanWord,
    pos: 'unknown',
  };

  // 물음표가 있으면 의문형으로 표시
  if (hasQuestionMark) {
    result.isQuestion = true;
  }

  // 1. 서술격 조사 확인 (N+입니다)
  const copulaResult = analyzeCopula(cleanWord);
  if (copulaResult) {
    result.stem = copulaResult.noun;
    result.pos = 'noun';
    result.role = 'predicate';
    result.ending = copulaResult.copula;
    result.tense = copulaResult.tense;
    result.formality = copulaResult.formality;
    return result;
  }

  // 1.5. 순수 부사 확인 (조사 없이 단독으로 부사어 역할)
  if (PURE_ADVERBS.has(cleanWord)) {
    result.stem = cleanWord;
    result.pos = 'adverb';
    result.role = 'adverbial';
    return result;
  }

  // 1.6. 대명사 확인 (조사 없이도 주어 역할)
  if (SUBJECT_PRONOUNS.has(cleanWord)) {
    result.stem = cleanWord;
    result.pos = 'pronoun';
    result.role = 'subject'; // 조사 없어도 주어로 인식
    return result;
  }

  // 2. 조사 분리 (명사+조사)
  for (const p of PARTICLE_LIST) {
    if (cleanWord.endsWith(p) && cleanWord.length > p.length) {
      const stem = cleanWord.slice(0, -p.length);
      const lastChar = stem[stem.length - 1];
      if (stem && lastChar && isHangul(lastChar)) {
        result.stem = stem;
        result.particle = p;
        result.pos = 'noun';
        const particleInfo = PARTICLES[p];
        if (particleInfo) {
          result.role = particleInfo.role;
        }
        return result;
      }
    }
  }

  // 3. 축약형 활용 패턴 매칭 (가요, 봤어요, 했어요 등)
  for (const cp of CONTRACTED_PATTERNS) {
    const match = cleanWord.match(cp.pattern);
    if (match) {
      let stem = cp.stemRestore(match);

      // 불규칙 활용 복원
      const irregularMatch = IRREGULAR_VERBS[stem];
      if (irregularMatch) {
        stem = irregularMatch.stem;
      }

      result.stem = stem;
      result.ending = cp.ending;
      result.pos = 'verb';
      result.role = 'predicate';
      result.tense = cp.tense;
      result.formality = cp.formality;
      if (cp.isNegative) {
        result.isNegative = true;
        result.negationType = cp.negationType;
      }
      if (cp.isQuestion) {
        result.isQuestion = true;
      }
      if (cp.isSpeculative) {
        result.isSpeculative = true;
      }
      if (cp.isConditional) {
        result.isConditional = true;
      }
      if (cp.isHypothetical) {
        result.isHypothetical = true;
      }
      return result;
    }
  }

  // 4. 일반 어미 분리 (동사/형용사+어미)
  for (const e of ENDING_LIST) {
    if (cleanWord.endsWith(e) && cleanWord.length > e.length) {
      let stem = cleanWord.slice(0, -e.length);
      const endingInfo = ENDINGS[e];

      // 불규칙 활용 복원
      const irregularMatch = IRREGULAR_VERBS[stem];
      if (irregularMatch) {
        stem = irregularMatch.stem;
      }

      result.stem = stem;
      result.ending = e;
      result.pos = 'verb';
      result.role = 'predicate';
      if (endingInfo) {
        result.tense = endingInfo.tense;
        result.formality = endingInfo.formality;
        result.isQuestion = endingInfo.isQuestion;
        result.isNegative = endingInfo.isNegative;
        result.isHonorable = endingInfo.isHonorable;
        result.isSpeculative = endingInfo.isSpeculative;
        result.isConditional = endingInfo.isConditional;
        result.isHypothetical = endingInfo.isHypothetical;
      }
      return result;
    }
  }

  // 5. 어미 없이 어간만 있는 경우 (명사로 추정)
  result.pos = 'noun';
  return result;
}

// ========================================
// 문장 전체 분석
// ========================================
export interface TokenAnalysis extends MorphemeAnalysis {
  index: number;
  englishWord?: string;
}

// 부정 어미 패턴 (않다, 않는다, 않았다, 못했다 등)
const NEGATIVE_ENDINGS = [
  // 의지 부정 (-지 않다)
  '않는다',
  '않았다',
  '않아요',
  '않습니다',
  '않았습니다',
  '않았어요',
  '않았어',
  '않았고',
  '않아',
  '않다',
  // 능력 부정 (-지 못하다)
  '못하다',
  '못해요',
  '못합니다',
  '못했어',
  '못했어요',
  '못했습니다',
  '못해',
  '못했고',
];

// 띄어쓰기 오류 전처리: "한국사람 입니다" → "한국사람입니다"
// 부정문 패턴 전처리: "가지 않는다" → "가지않는다"
// 복합 시간 표현 목록 (긴 것 → 짧은 것 순)
const COMPOUND_TIME_EXPRESSIONS = [
  // 3토큰 조합 (현재는 2토큰만 처리)
  // 2토큰 조합
  ['오늘', '아침에'],
  ['오늘', '아침'],
  ['어제', '밤에'],
  ['어제', '밤'],
  ['어제', '저녁에'],
  ['어제', '저녁'],
  ['내일', '아침에'],
  ['내일', '아침'],
  ['오늘', '밤에'],
  ['오늘', '밤'],
  ['오늘', '저녁에'],
  ['오늘', '저녁'],
];

function preprocessTokens(tokens: string[]): string[] {
  const result: string[] = [];
  const COPULA_LIST = ['입니다', '입니까', '이에요', '예요', '이야', '야'];

  // 복합 시간 표현 먼저 처리
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) {
      i++;
      continue;
    }

    // 2토큰 복합 시간 표현 체크
    let matched = false;
    if (i < tokens.length - 1) {
      const nextToken = tokens[i + 1];
      for (const [first, second] of COMPOUND_TIME_EXPRESSIONS) {
        if (token === first && nextToken === second) {
          result.push(`${first} ${second}`); // 공백으로 결합하여 하나의 토큰으로
          i += 2;
          matched = true;
          break;
        }
      }
    }

    if (matched) continue;

    // 현재 토큰이 분리된 서술격 조사인 경우
    if (COPULA_LIST.includes(token)) {
      // 이전 토큰과 결합
      const lastIndex = result.length - 1;
      if (lastIndex >= 0 && result[lastIndex]) {
        result[lastIndex] = result[lastIndex] + token;
      } else {
        result.push(token);
      }
    }
    // 부정 어미 패턴 처리: "가지 않는다" → "가지않는다"
    else if (NEGATIVE_ENDINGS.includes(token)) {
      // 이전 토큰이 "~지"로 끝나면 결합
      const lastIndex = result.length - 1;
      if (lastIndex >= 0 && result[lastIndex]?.endsWith('지')) {
        result[lastIndex] = result[lastIndex] + token;
      } else {
        result.push(token);
      }
    } else {
      result.push(token);
    }

    i++;
  }

  return result;
}

export function analyzeTokens(text: string): TokenAnalysis[] {
  const rawTokens = text.split(/\s+/).filter((t) => t.length > 0);
  const tokens = preprocessTokens(rawTokens);

  return tokens.map((token, index) => ({
    ...analyzeMorpheme(token),
    index,
  }));
}
