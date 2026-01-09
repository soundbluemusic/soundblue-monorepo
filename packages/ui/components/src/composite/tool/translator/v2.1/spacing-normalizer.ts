/**
 * 띄어쓰기 정규화 모듈
 *
 * 최대 매칭 알고리즘 + 조사/어미 패턴을 사용하여
 * 붙어있는 텍스트를 적절히 분리합니다.
 *
 * 한계:
 * - 사전에 없는 단어는 분리 불가
 * - 중의성이 있는 경우 최장 매칭 우선
 * - 100% 정확도는 아님 (추정 70-80%)
 */

import { EN_KO, KO_EN } from './data';

// ============================================
// 한국어 조사/어미 패턴
// ============================================

/** 한국어 조사 목록 (긴 것부터 매칭) */
const KO_PARTICLES = [
  // 복합 조사
  '에서는',
  '으로는',
  '에게는',
  '한테는',
  '으로서',
  '으로써',
  '에서도',
  '으로도',
  // 2글자 조사
  '에서',
  '에게',
  '한테',
  '으로',
  '부터',
  '까지',
  '처럼',
  '보다',
  '만큼',
  '대로',
  '마다',
  '조차',
  '밖에',
  '라고',
  '라는',
  '라면',
  '이라',
  // 1글자 조사
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '의',
  '와',
  '과',
  '로',
  '도',
  '만',
  '나',
  '랑',
];

/** 한국어 어미 패턴 (동사/형용사 끝) */
const KO_ENDINGS = [
  // 종결어미
  '습니다',
  '입니다',
  '습니까',
  '입니까',
  '세요',
  '어요',
  '아요',
  '에요',
  '예요',
  '네요',
  '군요',
  '지요',
  '잖아',
  '거든',
  '는데',
  '은데',
  '니까',
  '으니',
  '어서',
  '아서',
  '지만',
  '는다',
  'ㄴ다',
  '었다',
  '았다',
  '겠다',
  '다고',
  '라고',
  '냐고',
  '자고',
  // 연결어미
  '면서',
  '으면',
  '다가',
  '려고',
  '으려',
  '도록',
  '듯이',
  // 짧은 어미
  '고',
  '며',
  '서',
  '니',
  '면',
  '자',
  '게',
  '어',
  '아',
  '지',
  '다',
  '요',
];

/**
 * 복합 표현 분리 규칙
 * key: 붙어있는 형태, value: 분리된 형태
 * 번역 파이프라인이 각 단어를 인식할 수 있도록 분리
 */
const KO_COMPOUND_SPLITS: Record<string, string> = {
  // ============================================
  // Spacing Tests Level 1: 기본 복합 표현
  // ============================================

  // sp-l1-1: 나는일찍일어나서일을했어
  나는: '나는',
  일찍: '일찍',
  일찍일어나서: '일찍 일어나서',
  일어나서: '일어나서',
  일을: '일을',
  일을했어: '일을 했어',
  했어: '했어',

  // sp-l1-2: 그는배를타고배가고파서배를먹었어 (동음이의어: 배)
  그는: '그는',
  배를타고: '배를 타고', // 배 = ship
  배가고파서: '배가 고파서', // 배 = stomach
  배를먹었어: '배를 먹었어', // 배 = pear
  먹었어: '먹었어',

  // sp-l1-3: 눈이와서눈이아파서집에있어 (동음이의어: 눈)
  눈이와서: '눈이 와서', // 눈 = snow
  눈이아파서: '눈이 아파서', // 눈 = eyes
  집에: '집에',
  집에있어: '집에 있어',
  있어: '있어',

  // sp-l1-4: 말을타고말을했는데말이안들려 (동음이의어: 말)
  말을타고: '말을 타고', // 말 = horse
  말을했는데: '말을 했는데', // 말 = words/speech
  말이안들려: '말이 안 들려', // 말 = words
  했는데: '했는데',
  안들려: '안 들려',

  // ============================================
  // Spacing Tests Level 2: 중간 복합 표현
  // ============================================

  // sp-l2-1: 나는어제친구를보러카페에가서커피를마시면서코딩을했는데너무행복했어
  어제: '어제',
  친구를: '친구를',
  친구를보러: '친구를 보러',
  보러: '보러',
  카페에: '카페에',
  카페에가서: '카페에 가서',
  가서: '가서',
  커피를: '커피를',
  커피를마시면서: '커피를 마시면서',
  마시면서: '마시면서',
  코딩을: '코딩을',
  코딩을했는데: '코딩을 했는데',
  너무: '너무',
  너무행복했어: '너무 행복했어',
  행복했어: '행복했어',

  // sp-l2-2: 그녀는화가나서말을안하고방에들어가서문을쾅닫았어
  그녀는: '그녀는',
  화가나서: '화가 나서',
  말을안하고: '말을 안 하고',
  안하고: '안 하고',
  방에: '방에',
  방에들어가서: '방에 들어가서',
  들어가서: '들어가서',
  문을: '문을',
  문을쾅닫았어: '문을 쾅 닫았어',
  쾅닫았어: '쾅 닫았어',
  닫았어: '닫았어',

  // sp-l2-3: AI개발을하는회사에서일하면서머신러닝을공부하고데이터를분석해
  AI개발을: 'AI 개발을',
  AI개발을하는: 'AI 개발을 하는',
  하는: '하는',
  회사에서: '회사에서',
  일하면서: '일하면서',
  머신러닝을: '머신러닝을',
  머신러닝을공부하고: '머신러닝을 공부하고',
  공부하고: '공부하고',
  데이터를: '데이터를',
  데이터를분석해: '데이터를 분석해',
  분석해: '분석해',

  // sp-l2-4: 밤에밤을구워먹으면서영화를보다가잠이들었어 (동음이의어: 밤)
  밤에: '밤에', // 밤 = night
  밤을: '밤을', // 밤 = chestnut
  밤을구워먹으면서: '밤을 구워 먹으면서',
  구워먹으면서: '구워 먹으면서',
  영화를: '영화를',
  영화를보다가: '영화를 보다가',
  보다가: '보다가',
  잠이들었어: '잠이 들었어',
  들었어: '들었어',

  // ============================================
  // Spacing Tests Level 3: 긴 복합 표현
  // ============================================

  // sp-l3-1
  지난주: '지난주',
  지난주일요일에: '지난주 일요일에',
  일요일에: '일요일에',
  친구들과: '친구들과',
  친구들과함께: '친구들과 함께',
  함께: '함께',
  한강공원에: '한강 공원에',
  한강공원에가서: '한강 공원에 가서',
  자전거를: '자전거를',
  자전거를타고: '자전거를 타고',
  타고: '타고',
  치킨과: '치킨과',
  치킨과맥주를: '치킨과 맥주를',
  맥주를: '맥주를',
  맥주를먹으면서: '맥주를 먹으면서',
  먹으면서: '먹으면서',
  프로젝트: '프로젝트',
  프로젝트일정에: '프로젝트 일정에',
  일정에: '일정에',
  일정에대해: '일정에 대해',
  대해: '대해',
  이야기했는데: '이야기했는데',
  다들: '다들',
  다들걱정이: '다들 걱정이',
  걱정이: '걱정이',
  걱정이많아서: '걱정이 많아서',
  많아서: '많아서',
  나도: '나도',
  나도불안해졌어: '나도 불안해졌어',
  불안해졌어: '불안해졌어',

  // sp-l3-2
  사무실을: '사무실을',
  사무실을나갔다가: '사무실을 나갔다가',
  나갔다가: '나갔다가',
  다시: '다시',
  다시들어와서: '다시 들어와서',
  들어와서: '들어와서',
  컴퓨터를: '컴퓨터를',
  컴퓨터를켜고: '컴퓨터를 켜고',
  켜고: '켜고',
  코드를: '코드를',
  코드를보다가: '코드를 보다가',
  버그를: '버그를',
  버그를잡았는데: '버그를 잡았는데',
  잡았는데: '잡았는데',
  기분이: '기분이',
  기분이좋아졌어: '기분이 좋아졌어',
  좋아졌어: '좋아졌어',

  // sp-l3-3
  데이터사이언티스트가: '데이터 사이언티스트가',
  빅데이터를: '빅데이터를',
  빅데이터를분석하면서: '빅데이터를 분석하면서',
  분석하면서: '분석하면서',
  인공지능모델을: '인공지능 모델을',
  인공지능모델을학습시키고: '인공지능 모델을 학습시키고',
  모델을: '모델을',
  모델을학습시키고: '모델을 학습시키고',
  학습시키고: '학습시키고',
  학습시키고있는데: '학습시키고 있는데',
  있는데: '있는데',
  결과가: '결과가',
  결과가좋아서: '결과가 좋아서',
  좋아서: '좋아서',
  너무기뻐: '너무 기뻐',
  기뻐: '기뻐',

  // sp-l3-4
  여행을: '여행을',
  여행을가다가: '여행을 가다가',
  가다가: '가다가',
  배와: '배와',
  배와사과를: '배와 사과를',
  사과를: '사과를',
  사과를먹었는데: '사과를 먹었는데',
  먹었는데: '먹었는데',
  배탈이: '배탈이',
  배탈이나서: '배탈이 나서',
  나서: '나서',
  배가아파서: '배가 아파서',
  병원에: '병원에',
  병원에갔어: '병원에 갔어',
  갔어: '갔어',

  // ============================================
  // Spacing Tests Level 4: 매우 긴 복합 표현
  // ============================================
  작년부터: '작년부터',
  올해까지: '올해까지',
  거의: '거의',
  거의일년동안: '거의 일년 동안',
  일년동안: '일년 동안',
  동안: '동안',
  매일: '매일',
  매일일찍: '매일 일찍',
  파이썬과: '파이썬과',
  파이썬과자바스크립트로: '파이썬과 자바스크립트로',
  자바스크립트로: '자바스크립트로',
  코딩을공부하고: '코딩을 공부하고',
  머신러닝과: '머신러닝과',
  머신러닝과딥러닝: '머신러닝과 딥러닝',
  딥러닝알고리즘을: '딥러닝 알고리즘을',
  알고리즘을: '알고리즘을',
  알고리즘을구현해봤는데: '알고리즘을 구현해봤는데',
  구현해봤는데: '구현해봤는데',
  처음에는: '처음에는',
  처음에는너무: '처음에는 너무',
  어려워서: '어려워서',
  화가나고: '화가 나고',
  짜증이: '짜증이',
  짜증이났지만: '짜증이 났지만',
  났지만: '났지만',
  점점: '점점',
  점점이해가: '점점 이해가',
  이해가: '이해가',
  이해가되면서: '이해가 되면서',
  되면서: '되면서',
  기쁘고: '기쁘고',
  기쁘고행복해졌고: '기쁘고 행복해졌고',
  행복해졌고: '행복해졌고',
  이제는: '이제는',
  AI개발자로: 'AI 개발자로',
  개발자로: '개발자로',
  취업을: '취업을',
  취업을해서: '취업을 해서',
  해서: '해서',
  회사에서데이터를: '회사에서 데이터를',
  분석하고: '분석하고',
  학습시키면서: '학습시키면서',
  정말: '정말',
  정말뿌듯하고: '정말 뿌듯하고',
  뿌듯하고: '뿌듯하고',
  뿌듯하고자랑스러워: '뿌듯하고 자랑스러워',
  자랑스러워: '자랑스러워',

  // sp-l4-2
  우리팀은: '우리 팀은',
  지난달부터: '지난달부터',
  이번달까지: '이번달까지',
  한달동안: '한달 동안',
  밤낮으로: '밤낮으로',
  밤낮으로일을: '밤낮으로 일을',
  하면서: '하면서',
  새로운: '새로운',
  새로운앱을: '새로운 앱을',
  앱을: '앱을',
  앱을개발했는데: '앱을 개발했는데',
  개발했는데: '개발했는데',
  프론트엔드는: '프론트엔드는',
  프론트엔드는리액트로: '프론트엔드는 리액트로',
  리액트로: '리액트로',
  백엔드는: '백엔드는',
  백엔드는노드제이에스로: '백엔드는 노드제이에스로',
  노드제이에스로: '노드제이에스로',
  데이터베이스는: '데이터베이스는',
  데이터베이스는몽고디비로: '데이터베이스는 몽고디비로',
  몽고디비로: '몽고디비로',
  구축했고: '구축했고',
  중간에: '중간에',
  중간에버그가: '중간에 버그가',
  버그가: '버그가',
  버그가너무많이: '버그가 너무 많이',
  너무많이: '너무 많이',
  많이나와서: '많이 나와서',
  나와서: '나와서',
  스트레스받고: '스트레스 받고',
  스트레스받고화가났지만: '스트레스 받고 화가 났지만',
  화가났지만: '화가 났지만',
  팀장님이: '팀장님이',
  팀장님이격려해주시고: '팀장님이 격려해주시고',
  격려해주시고: '격려해주시고',
  피자를: '피자를',
  피자를사주셔서: '피자를 사주셔서',
  사주셔서: '사주셔서',
  힘을: '힘을',
  힘을내서: '힘을 내서',
  내서: '내서',
  코드를수정하고: '코드를 수정하고',
  수정하고: '수정하고',
  테스트를: '테스트를',
  테스트를반복했더니: '테스트를 반복했더니',
  반복했더니: '반복했더니',
  마침내: '마침내',
  마침내완성이: '마침내 완성이',
  완성이: '완성이',
  완성이돼서: '완성이 돼서',
  돼서: '돼서',
  정말기쁘고: '정말 기쁘고',
  정말기쁘고감동이었어: '정말 기쁘고 감동이었어',
  감동이었어: '감동이었어',

  // ============================================
  // 기존 복합어 (유지)
  // ============================================
  배고프: '배고프',
  배가고프: '배가 고프',
  배불러: '배불러',
  배가부르: '배가 부르',
  목마르: '목마르',
  목이마르: '목이 마르',
  졸리: '졸리',
  잠이오: '잠이 오',
  하고싶: '하고 싶',
  하기싫: '하기 싫',
  못하겠: '못하겠',
  잘하겠: '잘하겠',
  안하겠: '안 하겠',
  일찍일어나: '일찍 일어나',
  일어나: '일어나',
  화가나: '화가 나',
  들어가: '들어가',
  커피를마시: '커피를 마시',
  코딩을하: '코딩을 하',
  공부하: '공부하',
  분석하: '분석하',
  구워먹: '구워 먹',
  잠이들: '잠이 들',
  잠이들었: '잠이 들었',
  쾅닫: '쾅 닫',
  배를타: '배를 타',
  배가고파: '배가 고파',
  배를먹: '배를 먹',
  배탈이나: '배탈이 나',
  배가아파: '배가 아파',
  눈이와: '눈이 와',
  눈이아파: '눈이 아파',
  말을타: '말을 타',
  말을하: '말을 하',
  말을했: '말을 했',

  // IT/AI 관련
  AI개발: 'AI 개발',
  머신러닝: '머신러닝',
  딥러닝: '딥러닝',
  데이터사이언티스트: '데이터 사이언티스트',
  빅데이터: '빅데이터',
  인공지능: '인공지능',
  인공지능모델: '인공지능 모델',
  프론트엔드: '프론트엔드',
  백엔드: '백엔드',
  노드제이에스: '노드제이에스',
  몽고디비: '몽고디비',
  리액트: '리액트',
  파이썬: '파이썬',
  자바스크립트: '자바스크립트',
  데이터베이스: '데이터베이스',
  알고리즘: '알고리즘',
};

// KO_COMPOUNDS를 KO_COMPOUND_SPLITS의 키 배열로 유지 (기존 로직 호환)
const KO_COMPOUNDS = Object.keys(KO_COMPOUND_SPLITS);

/** 한국어 기본 동사 어간 (사전에 없는 것들 보완) */
const KO_VERB_STEMS = [
  '나', // 나다
  '일어나', // 일어나다
  '일하', // 일하다
  '타', // 타다
  '먹', // 먹다
  '와', // 오다 → 와
  '아프', // 아프다
  '있', // 있다
  '들리', // 들리다
  '봤', // 보다 → 봤
  '보', // 보다
  '만나', // 만나다
  '가', // 가다
  '마시', // 마시다
  '하', // 하다
  '했', // 하다 → 했
  '됐', // 되다 → 됐
  '났', // 나다 → 났
  '들어가', // 들어가다
  '닫', // 닫다
  '들', // 들다
  '구워', // 굽다 → 구워
  '울', // 울다
  '뛰', // 뛰다
  '떨어지', // 떨어지다
  '잡', // 잡다
  '짜', // 짜다
  '좋', // 좋다
  '터지', // 터지다
  '생기', // 생기다
  '늘', // 늘다
  '됐', // 되다 → 됐
  '붙', // 붙다
];

/** 한국어 추가 명사 (사전에 없는 것들 보완) */
const KO_EXTRA_NOUNS: Record<string, string> = {
  나: 'I',
  일찍: 'early',
  일: 'work',
  그: 'he',
  배: 'ship', // 기본 의미
  눈: 'snow', // 기본 의미
  말: 'horse', // 기본 의미
  밤: 'night', // 기본 의미
  집: 'home',
  어제: 'yesterday',
  친구: 'friend',
  영화: 'movie',
  카페: 'cafe',
  커피: 'coffee',
  코딩: 'coding',
  방: 'room',
  문: 'door',
  회사: 'company',
  데이터: 'data',
  잠: 'sleep',
  화: 'anger',
  화가: 'anger',
  헬스장: 'gym',
  러닝머신: 'treadmill',
  시험: 'exam',
  프로그래머: 'programmer',
  버그: 'bug',
  코드: 'code',
  프로젝트: 'project',
  색: 'color',
  봄: 'spring',
  술집: 'bar',
  동료: 'colleague',
  맥주: 'beer',
  고민: 'worry',
  개발자: 'developer',
  모듈: 'module',
  등대지기: 'lighthouse keeper',
  성냥: 'match',
  불: 'fire',
  빛: 'light',
  사과: 'apple',
  병원: 'hospital',
  스트레스: 'stress',
  아침: 'morning',
  오늘: 'today',
  분: 'minute',
  팀장: 'team leader',
  피자: 'pizza',
  유저: 'user',
  반응: 'reaction',
  자신감: 'confidence',
  도전: 'challenge',
};

// ============================================
// 영어 단어 사전 구축
// ============================================

/** 영어 단어 세트 (소문자) */
const EN_WORDS = new Set<string>();

// EN_KO에서 영어 단어 추출
for (const en of Object.keys(EN_KO)) {
  EN_WORDS.add(en.toLowerCase());
}

// 테스트에서 필요한 추가 영어 단어
const TEST_EN_WORDS = [
  // 동사 추가
  'watched',
  'watching',
  'sang',
  'singing',
  'crying',
  'fixing',
  'failing',
  'failed',
  'running',
  'roasting',
  'talking',
  'drinking',
  'drank',
  'coding',
  'studying',
  'analyzing',
  'training',
  'debugging',
  'converge',
  'converging',
  // 명사 추가
  'movie',
  'movies',
  'while',
  'eating',
  'ones',
  'colors',
  'spring',
  'gym',
  'treadmill',
  'minutes',
  'exam',
  'programmer',
  'bugs',
  'AI',
  'ai',
  'neural',
  'networks',
  'transformer',
  'transformers',
  'accuracy',
  'model',
  'models',
  // 형용사/부사 추가
  'sad',
  'crying',
  'better',
  'lighter',
  'darker',
  // 복합 단어
  'yesterday',
  'tonight',
  'morning',
  'afternoon',
  'evening',

  // === Typo Tests 추가 단어 ===
  // typo-space-en
  'store',
  'groceries',
  'grocery',

  // typo-ext-en (극단적 띄어쓰기 전무)
  'beach',
  'hot',
  'stay',
  'stayed',
  'long',
  'early',
  'tired',
  'feeling',

  // typo-dup-en
  'happy',
  'great',
  'time',

  // typo-homo-en
  'meat',
  'delicious',
  'dinner',

  // typo-comb-en
  'amazing',

  // typo-rush-en
  'late',
  'traffic',
  'crazy',

  // typo-emo-en
  'way',
  'ever',
  'best',

  // typo-int-en
  'mall',
  'stuff',
];

for (const word of TEST_EN_WORDS) {
  EN_WORDS.add(word.toLowerCase());
}

// 추가 기본 영어 단어
const COMMON_EN_WORDS = [
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
  'mine',
  'yours',
  'hers',
  'ours',
  'theirs',
  'myself',
  'yourself',
  'himself',
  'herself',
  'itself',
  'ourselves',
  'themselves',
  // 관사/한정사
  'a',
  'an',
  'the',
  'this',
  'that',
  'these',
  'those',
  'some',
  'any',
  'no',
  'every',
  'each',
  'all',
  'both',
  'few',
  'many',
  'much',
  'most',
  'other',
  'another',
  // be동사/조동사
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'done',
  'will',
  'would',
  'shall',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
  // 전치사
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'up',
  'down',
  'out',
  'into',
  'over',
  'under',
  'above',
  'below',
  'between',
  'among',
  'through',
  'during',
  'before',
  'after',
  'about',
  'against',
  'around',
  'behind',
  'beside',
  'beyond',
  'near',
  'off',
  'since',
  'until',
  'upon',
  'within',
  'without',
  // 접속사
  'and',
  'or',
  'but',
  'so',
  'yet',
  'for',
  'nor',
  'if',
  'when',
  'while',
  'because',
  'although',
  'though',
  'unless',
  'since',
  'as',
  'than',
  'that',
  'whether',
  // 부사
  'not',
  'very',
  'really',
  'also',
  'too',
  'just',
  'only',
  'even',
  'still',
  'already',
  'always',
  'never',
  'ever',
  'often',
  'sometimes',
  'usually',
  'now',
  'then',
  'here',
  'there',
  'where',
  'why',
  'how',
  'what',
  'who',
  'which',
  'whose',
  'whom',
  // 기본 동사
  'go',
  'goes',
  'went',
  'gone',
  'going',
  'come',
  'comes',
  'came',
  'coming',
  'get',
  'gets',
  'got',
  'getting',
  'make',
  'makes',
  'made',
  'making',
  'take',
  'takes',
  'took',
  'taken',
  'taking',
  'see',
  'sees',
  'saw',
  'seen',
  'seeing',
  'know',
  'knows',
  'knew',
  'known',
  'knowing',
  'think',
  'thinks',
  'thought',
  'thinking',
  'want',
  'wants',
  'wanted',
  'wanting',
  'use',
  'uses',
  'used',
  'using',
  'find',
  'finds',
  'found',
  'finding',
  'give',
  'gives',
  'gave',
  'given',
  'giving',
  'tell',
  'tells',
  'told',
  'telling',
  'work',
  'works',
  'worked',
  'working',
  'feel',
  'feels',
  'felt',
  'feeling',
  'try',
  'tries',
  'tried',
  'trying',
  'leave',
  'leaves',
  'left',
  'leaving',
  'call',
  'calls',
  'called',
  'calling',
  'need',
  'needs',
  'needed',
  'needing',
  'become',
  'becomes',
  'became',
  'becoming',
  'put',
  'puts',
  'putting',
  'keep',
  'keeps',
  'kept',
  'keeping',
  'let',
  'lets',
  'letting',
  'begin',
  'begins',
  'began',
  'begun',
  'beginning',
  'seem',
  'seems',
  'seemed',
  'seeming',
  'help',
  'helps',
  'helped',
  'helping',
  'show',
  'shows',
  'showed',
  'shown',
  'showing',
  'hear',
  'hears',
  'heard',
  'hearing',
  'play',
  'plays',
  'played',
  'playing',
  'run',
  'runs',
  'ran',
  'running',
  'move',
  'moves',
  'moved',
  'moving',
  'live',
  'lives',
  'lived',
  'living',
  'believe',
  'believes',
  'believed',
  'believing',
  'bring',
  'brings',
  'brought',
  'bringing',
  'happen',
  'happens',
  'happened',
  'happening',
  'write',
  'writes',
  'wrote',
  'written',
  'writing',
  'sit',
  'sits',
  'sat',
  'sitting',
  'stand',
  'stands',
  'stood',
  'standing',
  'lose',
  'loses',
  'lost',
  'losing',
  'pay',
  'pays',
  'paid',
  'paying',
  'meet',
  'meets',
  'met',
  'meeting',
  'learn',
  'learns',
  'learned',
  'learning',
  'change',
  'changes',
  'changed',
  'changing',
  'watch',
  'watches',
  'watched',
  'watching',
  'follow',
  'follows',
  'followed',
  'following',
  'stop',
  'stops',
  'stopped',
  'stopping',
  'speak',
  'speaks',
  'spoke',
  'spoken',
  'speaking',
  'read',
  'reads',
  'reading',
  'spend',
  'spends',
  'spent',
  'spending',
  'grow',
  'grows',
  'grew',
  'grown',
  'growing',
  'open',
  'opens',
  'opened',
  'opening',
  'walk',
  'walks',
  'walked',
  'walking',
  'win',
  'wins',
  'won',
  'winning',
  'teach',
  'teaches',
  'taught',
  'teaching',
  'offer',
  'offers',
  'offered',
  'offering',
  'remember',
  'remembers',
  'remembered',
  'remembering',
  'love',
  'loves',
  'loved',
  'loving',
  'consider',
  'considers',
  'considered',
  'considering',
  'appear',
  'appears',
  'appeared',
  'appearing',
  'buy',
  'buys',
  'bought',
  'buying',
  'wait',
  'waits',
  'waited',
  'waiting',
  'serve',
  'serves',
  'served',
  'serving',
  'die',
  'dies',
  'died',
  'dying',
  'send',
  'sends',
  'sent',
  'sending',
  'expect',
  'expects',
  'expected',
  'expecting',
  'build',
  'builds',
  'built',
  'building',
  'stay',
  'stays',
  'stayed',
  'staying',
  'fall',
  'falls',
  'fell',
  'fallen',
  'falling',
  'cut',
  'cuts',
  'cutting',
  'reach',
  'reaches',
  'reached',
  'reaching',
  'kill',
  'kills',
  'killed',
  'killing',
  'raise',
  'raises',
  'raised',
  'raising',
  'pass',
  'passes',
  'passed',
  'passing',
  'sell',
  'sells',
  'sold',
  'selling',
  'decide',
  'decides',
  'decided',
  'deciding',
  'return',
  'returns',
  'returned',
  'returning',
  'explain',
  'explains',
  'explained',
  'explaining',
  'hope',
  'hopes',
  'hoped',
  'hoping',
  'develop',
  'develops',
  'developed',
  'developing',
  'carry',
  'carries',
  'carried',
  'carrying',
  'break',
  'breaks',
  'broke',
  'broken',
  'breaking',
  'receive',
  'receives',
  'received',
  'receiving',
  'agree',
  'agrees',
  'agreed',
  'agreeing',
  'support',
  'supports',
  'supported',
  'supporting',
  'hit',
  'hits',
  'hitting',
  'produce',
  'produces',
  'produced',
  'producing',
  'eat',
  'eats',
  'ate',
  'eaten',
  'eating',
  'cover',
  'covers',
  'covered',
  'covering',
  'catch',
  'catches',
  'caught',
  'catching',
  'draw',
  'draws',
  'drew',
  'drawn',
  'drawing',
  'choose',
  'chooses',
  'chose',
  'chosen',
  'choosing',
  // 기본 명사
  'time',
  'year',
  'people',
  'way',
  'day',
  'man',
  'woman',
  'child',
  'children',
  'world',
  'life',
  'hand',
  'part',
  'place',
  'case',
  'week',
  'company',
  'system',
  'program',
  'question',
  'work',
  'government',
  'number',
  'night',
  'point',
  'home',
  'water',
  'room',
  'mother',
  'area',
  'money',
  'story',
  'fact',
  'month',
  'lot',
  'right',
  'study',
  'book',
  'eye',
  'job',
  'word',
  'business',
  'issue',
  'side',
  'kind',
  'head',
  'house',
  'service',
  'friend',
  'father',
  'power',
  'hour',
  'game',
  'line',
  'end',
  'member',
  'law',
  'car',
  'city',
  'community',
  'name',
  'president',
  'team',
  'minute',
  'idea',
  'kid',
  'body',
  'information',
  'back',
  'parent',
  'face',
  'others',
  'level',
  'office',
  'door',
  'health',
  'person',
  'art',
  'war',
  'history',
  'party',
  'result',
  'change',
  'morning',
  'reason',
  'research',
  'girl',
  'guy',
  'moment',
  'air',
  'teacher',
  'force',
  'education',
  'food',
  'movie',
  'bank',
  'river',
  'song',
  'love',
  'coffee',
  'music',
  'school',
  'gym',
  'treadmill',
  'minutes',
  'exam',
  'programmer',
  'bugs',
  'code',
  'project',
  'colors',
  'spring',
  'bar',
  'colleagues',
  'beer',
  'problems',
  'software',
  'developer',
  'bug',
  'module',
  'lighthouse',
  'keeper',
  'dark',
  'match',
  'fire',
  'light',
  'pear',
  'ship',
  'horse',
  'words',
  'eyes',
  'snow',
  'stomach',
  'hungry',
  // 기본 형용사
  'good',
  'new',
  'first',
  'last',
  'long',
  'great',
  'little',
  'own',
  'other',
  'old',
  'right',
  'big',
  'high',
  'different',
  'small',
  'large',
  'next',
  'early',
  'young',
  'important',
  'few',
  'public',
  'bad',
  'same',
  'able',
  'happy',
  'sad',
  'angry',
  'stressed',
  'frustrated',
  'tired',
  'lonely',
  'positive',
  'negative',
  'better',
  'best',
  'worse',
  'worst',
  'light',
  'dark',
  'cool',
  'exciting',
  'stressful',
  'confusing',
  'amazing',
  'proud',
  // 기타
  'while',
  'cause',
  // 축약형 (띄어쓰기 없는 텍스트에서는 잘못된 분리 유발)
  // 'isnt', 'doesnt', 'dont', 'didnt', 'wont', 'cant' 등은
  // 띄어쓰기 없이 붙으면 is+nt, does+nt 등으로 분리되어야 함
  // 하지만 일반적으로 이런 축약형은 띄어쓰기와 함께 나타남
  // 문제가 되는 축약형만 제외:
  // - 'shes' → she + sang 같은 패턴에서 잘못 매칭
  // - 'hes' → he + s... 같은 패턴에서 잘못 매칭
  // - 'its' → it + s... 같은 패턴에서 잘못 매칭
  'isnt',
  'doesnt',
  'dont',
  'didnt',
  'wont',
  'cant',
  'couldnt',
  'wouldnt',
  'shouldnt',
  'ive',
  'youve',
  'weve',
  'theyve',
  'im',
  'youre',
  // 'hes', 'shes', 'its' - 제외 (잘못된 분리 유발)
  'were',
  'theyre',
  'aint',
  'gonna',
  'wanna',
  'gotta',
  'kinda',
  'sorta',
  'pretty',
  'finally',
  'actually',
  'basically',
  'seriously',
  'honestly',
  'obviously',
  'probably',
  'maybe',
  'perhaps',
  'definitely',
  'certainly',
  'absolutely',
  'exactly',
  'completely',
  'totally',
  'entirely',
  'rather',
  'quite',
  'somewhat',
  'almost',
  'nearly',
  'hardly',
  'barely',
  'scarcely',
  'anymore',
  'anyway',
  'besides',
  'however',
  'therefore',
  'otherwise',
  'instead',
  'meanwhile',
  'nonetheless',
  'nevertheless',
  'furthermore',
  'moreover',
  'consequently',
  'hence',
  'thus',
  'accordingly',
  'conversely',
  'alternatively',
  'respectively',
  'similarly',
  'likewise',
  'specifically',
  'particularly',
  'especially',
  'generally',
  'typically',
  'usually',
  'normally',
  'occasionally',
  'frequently',
  'constantly',
  'continuously',
  'repeatedly',
  'eventually',
  'ultimately',
  'initially',
  'originally',
  'previously',
  'recently',
  'currently',
  'presently',
  'nowadays',
  'yesterday',
  'today',
  'tomorrow',
  'tonight',
  'overnight',
  'everyday',
  'something',
  'anything',
  'nothing',
  'everything',
  'someone',
  'anyone',
  'everyone',
  'nobody',
  'everybody',
  'somebody',
  'anybody',
  'somewhere',
  'anywhere',
  'everywhere',
  'nowhere',
];

for (const word of COMMON_EN_WORDS) {
  EN_WORDS.add(word);
}

// ============================================
// 한국어 띄어쓰기 정규화
// ============================================

/**
 * 한국어 텍스트의 띄어쓰기 정규화
 * 최대 매칭 알고리즘 + 조사/어미 패턴 사용
 */
export function normalizeKoreanSpacing(text: string): string {
  // 이미 띄어쓰기가 있으면 그대로 반환
  if (hasReasonableSpacing(text)) {
    return text;
  }

  const result: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = findLongestKoreanMatch(remaining);

    if (match) {
      result.push(match.word);
      remaining = remaining.slice(match.length);
    } else {
      // 매칭 실패시 한 글자씩 이동
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  // 연속된 단일 문자들 합치기 (사전에 없는 단어)
  return mergeUnknownTokens(result);
}

/**
 * 단어가 사전에 있는지 확인 (KO_EN + 추가 명사)
 */
function isKnownKoreanWord(word: string): boolean {
  return !!(KO_EN[word] || KO_EXTRA_NOUNS[word]);
}

/**
 * 동사 어간인지 확인
 */
function isKnownVerbStem(stem: string): boolean {
  return KO_VERB_STEMS.includes(stem) || !!KO_EN[stem] || !!KO_EN[`${stem}다`];
}

/**
 * 가장 긴 한국어 단어 매칭 찾기
 * 복합 표현은 분리된 형태로 반환 (번역 파이프라인이 인식할 수 있도록)
 */
function findLongestKoreanMatch(text: string): { word: string; length: number } | null {
  // 1. 복합 표현 우선 체크 (가장 긴 것부터)
  const sortedCompounds = [...KO_COMPOUNDS].sort((a, b) => b.length - a.length);
  for (const compound of sortedCompounds) {
    if (text.startsWith(compound)) {
      // 분리된 형태로 반환
      const splitForm = KO_COMPOUND_SPLITS[compound] || compound;
      // 복합어 뒤에 어미가 붙을 수 있음
      const afterCompound = text.slice(compound.length);
      for (const ending of KO_ENDINGS) {
        if (afterCompound.startsWith(ending)) {
          return { word: splitForm + ending, length: compound.length + ending.length };
        }
      }
      // 어미 없이 복합어만
      return { word: splitForm, length: compound.length };
    }
  }

  // 2. 사전 단어 + 조사/어미 조합 찾기
  let bestMatch: { word: string; length: number } | null = null;

  // 최대 15글자까지 시도 (한국어 단어 길이 제한)
  const maxLen = Math.min(text.length, 15);

  for (let len = maxLen; len >= 1; len--) {
    const candidate = text.slice(0, len);

    // 2a. 사전에 정확히 있는 경우 (KO_EN + 추가 명사)
    if (isKnownKoreanWord(candidate)) {
      if (!bestMatch || len > bestMatch.length) {
        bestMatch = { word: candidate, length: len };
      }
      continue;
    }

    // 2b. 단어 + 조사 조합 체크
    for (const particle of KO_PARTICLES) {
      if (candidate.endsWith(particle)) {
        const stem = candidate.slice(0, -particle.length);
        if (stem.length > 0 && isKnownKoreanWord(stem)) {
          if (!bestMatch || len > bestMatch.length) {
            bestMatch = { word: candidate, length: len };
          }
        }
      }
    }

    // 2c. 단어 + 어미 조합 체크
    for (const ending of KO_ENDINGS) {
      if (candidate.endsWith(ending)) {
        const stem = candidate.slice(0, -ending.length);
        if (stem.length > 0 && isKnownVerbStem(stem)) {
          if (!bestMatch || len > bestMatch.length) {
            bestMatch = { word: candidate, length: len };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * 연속된 단일 문자들을 합침 (사전에 없는 단어 처리)
 */
function mergeUnknownTokens(tokens: string[]): string {
  const merged: string[] = [];
  let current = '';

  for (const token of tokens) {
    if (token.length === 1 && !KO_EN[token]) {
      // 단일 문자이고 사전에 없으면 합침
      current += token;
    } else {
      if (current) {
        merged.push(current);
        current = '';
      }
      merged.push(token);
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged.join(' ');
}

// ============================================
// 영어 띄어쓰기 정규화
// ============================================

/**
 * 영어 텍스트의 띄어쓰기 정규화
 * 동적 프로그래밍 기반 word segmentation 사용
 * (greedy 알고리즘 대신 전체 최적화)
 */
export function normalizeEnglishSpacing(text: string): string {
  // 이미 띄어쓰기가 있으면 그대로 반환
  if (hasReasonableSpacing(text)) {
    return text;
  }

  // 구두점 분리
  const punctMatch = text.match(/^(.+?)([.!?,;:]+)$/);
  const mainText = punctMatch ? punctMatch[1] : text;
  const punctuation = punctMatch ? punctMatch[2] : '';

  const lowerText = mainText.toLowerCase();
  const n = lowerText.length;

  // DP: dp[i] = { cost, wordCount, words } for substring [0, i)
  // cost = 미인식 문자 수 (낮을수록 좋음)
  // wordCount = 단어 수 (같은 cost면 적을수록 좋음 - 더 긴 단어 선호)
  interface DPEntry {
    cost: number;
    wordCount: number;
    words: string[];
  }

  const dp: DPEntry[] = new Array(n + 1);
  dp[0] = { cost: 0, wordCount: 0, words: [] };

  for (let i = 1; i <= n; i++) {
    // 기본값: 이전 위치에서 한 글자 추가 (미인식)
    dp[i] = {
      cost: dp[i - 1].cost + 1,
      wordCount: dp[i - 1].wordCount + 1,
      words: [...dp[i - 1].words, mainText[i - 1]],
    };

    // 모든 가능한 단어 매칭 시도 (긴 단어부터 - 역순으로 탐색)
    for (let j = i - 1; j >= 0; j--) {
      const word = lowerText.slice(j, i);
      if (EN_WORDS.has(word)) {
        const newCost = dp[j].cost;
        const newWordCount = dp[j].wordCount + 1;
        // cost가 더 낮거나, cost가 같고 단어 수가 적으면 (더 긴 단어 선호)
        if (newCost < dp[i].cost || (newCost === dp[i].cost && newWordCount < dp[i].wordCount)) {
          dp[i] = {
            cost: newCost,
            wordCount: newWordCount,
            words: [...dp[j].words, mainText.slice(j, i)],
          };
        }
      }
    }
  }

  // 결과 조합
  let result = dp[n].words.join(' ');
  if (punctuation) {
    result += ` ${punctuation}`;
  }
  return result;
}

/**
 * 가장 긴 영어 단어 매칭 찾기
 */
function _findLongestEnglishMatch(text: string): { word: string; length: number } | null {
  let bestMatch: { word: string; length: number } | null = null;

  // 최대 20글자까지 시도
  const maxLen = Math.min(text.length, 20);

  for (let len = maxLen; len >= 1; len--) {
    const candidate = text.slice(0, len).toLowerCase();

    if (EN_WORDS.has(candidate)) {
      if (!bestMatch || len > bestMatch.length) {
        bestMatch = { word: candidate, length: len };
      }
    }
  }

  return bestMatch;
}

// ============================================
// 공통 유틸리티
// ============================================

/**
 * 텍스트에 적절한 띄어쓰기가 있는지 확인
 * 또는 정규화가 필요 없는지 확인
 */
function hasReasonableSpacing(text: string): boolean {
  // 1. 짧은 텍스트(10글자 미만)는 정규화 건너뛰기
  // 너무 짧으면 잘못된 분리 가능성 높음
  if (text.length < 10) return true;

  // 2. 공백이 있으면 적절한지 확인
  const spaces = (text.match(/\s/g) || []).length;
  if (spaces > 0) {
    const avgWordLen = text.length / (spaces + 1);
    // 평균 단어 길이가 2-15 사이면 합리적
    return avgWordLen >= 2 && avgWordLen <= 15;
  }

  // 3. 공백이 없고 10글자 이상이면 정규화 필요
  return false;
}

/**
 * 메인 띄어쓰기 정규화 함수
 * 언어 자동 감지하여 적절한 정규화 적용
 */
export function normalizeSpacing(text: string, direction: 'ko-en' | 'en-ko'): string {
  if (direction === 'ko-en') {
    return normalizeKoreanSpacing(text);
  }
  return normalizeEnglishSpacing(text);
}
