// ========================================
// Idioms Dictionary - 관용어/숙어 사전
// 한국어 ↔ 영어 관용어 번역
// ========================================

/**
 * 관용어 카테고리
 */
export type IdiomCategory =
  | 'body' // 신체 관용어
  | 'animal' // 동물 관용어
  | 'food' // 음식 관용어
  | 'nature' // 자연 관용어
  | 'emotion' // 감정 관용어
  | 'action' // 행동 관용어
  | 'proverb' // 속담
  | 'idiom' // 일반 관용어
  | 'slang'; // 신조어/은어

/**
 * 관용어 엔트리 인터페이스
 */
export interface IdiomEntry {
  ko: string; // 한국어 관용어
  en: string; // 영어 번역
  literal?: string; // 직역 (참고용)
  category: IdiomCategory; // 분류
  variants?: string[]; // 변형 표현
}

// ========================================
// 한→영 관용어 사전
// ========================================

export const idioms: IdiomEntry[] = [
  // ----------------------------------------
  // 신체 관용어 (Body Idioms)
  // ----------------------------------------
  // 눈 (Eye)
  { ko: '눈이 높다', en: 'have high standards', category: 'body' },
  { ko: '눈이 낮다', en: 'have low standards', category: 'body' },
  { ko: '눈에 넣어도 안 아프다', en: "be the apple of one's eye", category: 'body' },
  { ko: '눈 깜짝할 사이', en: 'in the blink of an eye', category: 'body' },
  { ko: '눈 깜짝할 사이에', en: 'in the blink of an eye', category: 'body' },
  { ko: '눈치가 빠르다', en: 'be quick to read situations', category: 'body' },
  { ko: '눈치가 없다', en: 'be clueless', category: 'body' },
  { ko: '눈치를 보다', en: 'read the room', category: 'body' },
  { ko: '눈이 빠지게 기다리다', en: 'wait anxiously', category: 'body' },
  { ko: '눈을 붙이다', en: 'catch some sleep', category: 'body' },
  { ko: '눈 밖에 나다', en: 'fall out of favor', category: 'body' },
  { ko: '눈에 불을 켜다', en: "keep one's eyes peeled", category: 'body' },
  { ko: '눈 하나 깜짝 안 하다', en: 'not bat an eye', category: 'body' },

  // 귀 (Ear)
  { ko: '귀가 얇다', en: 'be easily influenced', category: 'body' },
  { ko: '귀가 따갑다', en: 'ears are burning', category: 'body' },
  { ko: '귀에 못이 박히다', en: 'hear something over and over', category: 'body' },
  { ko: '귀를 기울이다', en: 'lend an ear', category: 'body' },
  { ko: '귀가 가렵다', en: 'ears are itching', category: 'body' },

  // 입 (Mouth)
  { ko: '입이 가볍다', en: 'have a loose tongue', category: 'body' },
  { ko: '입이 무겁다', en: 'be tight-lipped', category: 'body' },
  { ko: '입에 발린 말', en: 'lip service', category: 'body' },
  { ko: '입이 짧다', en: 'be a picky eater', category: 'body' },
  { ko: '입이 심심하다', en: 'crave a snack', category: 'body' },
  { ko: '입을 모으다', en: 'speak in unison', category: 'body' },
  { ko: '입이 근질근질하다', en: 'be dying to tell', category: 'body' },

  // 손 (Hand)
  { ko: '손이 크다', en: 'be generous', category: 'body' },
  { ko: '손이 맵다', en: 'have a heavy hand', category: 'body' },
  { ko: '손에 땀을 쥐다', en: "be on the edge of one's seat", category: 'body' },
  { ko: '손을 씻다', en: "wash one's hands of", category: 'body' },
  { ko: '손을 떼다', en: "wash one's hands of", category: 'body' },
  { ko: '손이 모자라다', en: 'be short-handed', category: 'body' },
  { ko: '손에 익다', en: 'get the hang of', category: 'body' },
  { ko: '손을 보다', en: 'teach someone a lesson', category: 'body' },
  { ko: '손을 빌리다', en: 'ask for help', category: 'body' },
  { ko: '손꼽아 기다리다', en: 'count the days', category: 'body' },

  // 발 (Foot)
  { ko: '발이 넓다', en: 'know many people', category: 'body' },
  {
    ko: '발 벗고 나서다',
    en: "roll up one's sleeves",
    category: 'body',
    variants: ['발벗고 나서다'],
  },
  { ko: '발이 묶이다', en: 'be stuck', category: 'body' },
  { ko: '발을 끊다', en: 'cut ties', category: 'body' },
  { ko: '발을 뻗고 자다', en: 'sleep peacefully', category: 'body' },
  { ko: '발등에 불이 떨어지다', en: 'be pressed for time', category: 'body' },

  // 머리 (Head)
  { ko: '머리가 좋다', en: 'be smart', category: 'body' },
  { ko: '머리가 나쁘다', en: 'be slow', category: 'body' },
  { ko: '머리를 굴리다', en: "rack one's brain", category: 'body' },
  { ko: '머리를 쥐어짜다', en: "rack one's brain", category: 'body' },
  { ko: '머리가 복잡하다', en: "have a lot on one's mind", category: 'body' },
  { ko: '머리에 피도 안 마르다', en: 'be wet behind the ears', category: 'body' },

  // 배 (Stomach)
  { ko: '배가 아프다', en: 'be jealous', category: 'body', literal: 'stomach hurts' },
  { ko: '배꼽이 빠지다', en: "laugh one's head off", category: 'body' },
  { ko: '배가 부르다', en: 'be complacent', category: 'body' },
  { ko: '배보다 배꼽이 더 크다', en: 'the tail wags the dog', category: 'body' },

  // 코 (Nose)
  { ko: '코가 납작해지다', en: "be put in one's place", category: 'body' },
  { ko: '코가 높다', en: 'be arrogant', category: 'body' },
  { ko: '코 앞에 닥치다', en: 'be just around the corner', category: 'body' },

  // 기타 신체
  { ko: '목이 빠지게 기다리다', en: 'wait anxiously', category: 'body' },
  { ko: '어깨가 무겁다', en: 'have a heavy burden', category: 'body' },
  { ko: '가슴이 뛰다', en: 'heart is racing', category: 'body' },
  { ko: '가슴이 찡하다', en: 'be touched', category: 'body' },
  { ko: '간이 콩알만 해지다', en: 'be scared stiff', category: 'body' },
  { ko: '뼈를 깎는', en: 'painstaking', category: 'body' },
  { ko: '피가 마르다', en: 'be worried sick', category: 'body' },
  { ko: '등골이 빠지다', en: "work one's fingers to the bone", category: 'body' },
  { ko: '애가 타다', en: 'be anxious', category: 'body' },

  // ----------------------------------------
  // 음식 관용어 (Food Idioms)
  // ----------------------------------------
  { ko: '식은 죽 먹기', en: 'a piece of cake', category: 'food', variants: ['식은죽 먹기'] },
  { ko: '누워서 떡 먹기', en: 'a piece of cake', category: 'food' },
  { ko: '그림의 떡', en: 'pie in the sky', category: 'food' },
  { ko: '떡 본 김에 제사 지낸다', en: 'strike while the iron is hot', category: 'food' },
  { ko: '밥 먹듯이 하다', en: 'do something all the time', category: 'food' },
  { ko: '밥 먹었어요', en: 'have you eaten', category: 'food', literal: 'Korean greeting' },
  { ko: '국수를 먹다', en: 'attend a wedding', category: 'food' },
  { ko: '국물도 없다', en: 'no way', category: 'food' },
  { ko: '죽 쑤다', en: 'mess up', category: 'food' },
  { ko: '찬밥 신세', en: 'be treated coldly', category: 'food' },
  { ko: '밥이 되다', en: 'fall apart', category: 'food' },

  // ----------------------------------------
  // 동물 관용어 (Animal Idioms)
  // ----------------------------------------
  { ko: '쥐도 새도 모르게', en: 'without anyone knowing', category: 'animal' },
  { ko: '개미 허리', en: 'wasp waist', category: 'animal' },
  { ko: '닭살이 돋다', en: 'get goosebumps', category: 'animal' },
  { ko: '용 꼬리보다 뱀 머리', en: 'better to be a big fish in a small pond', category: 'animal' },
  { ko: '호랑이도 제 말 하면 온다', en: 'speak of the devil', category: 'animal' },
  {
    ko: '하룻강아지 범 무서운 줄 모른다',
    en: 'fools rush in where angels fear to tread',
    category: 'animal',
  },
  { ko: '쇠뿔도 단김에 빼라', en: 'strike while the iron is hot', category: 'animal' },
  { ko: '닭 쫓던 개 지붕 쳐다본다', en: 'be left empty-handed', category: 'animal' },
  { ko: '개구리 올챙이 적 생각 못한다', en: "forget one's roots", category: 'animal' },
  { ko: '제 눈에 안경', en: 'beauty is in the eye of the beholder', category: 'animal' },
  { ko: '까마귀 날자 배 떨어진다', en: 'bad timing', category: 'animal' },
  { ko: '고양이한테 생선을 맡기다', en: 'set a fox to guard the henhouse', category: 'animal' },
  { ko: '벼룩의 간을 빼먹다', en: 'squeeze blood from a stone', category: 'animal' },
  { ko: '하늘의 별 따기', en: 'reach for the stars', category: 'animal' },

  // ----------------------------------------
  // 자연 관용어 (Nature Idioms)
  // ----------------------------------------
  { ko: '바람 맞다', en: 'get stood up', category: 'nature' },
  { ko: '불 보듯 뻔하다', en: 'be obvious', category: 'nature' },
  { ko: '물 만난 물고기', en: 'like a fish in water', category: 'nature' },
  { ko: '물이 좋다', en: 'have a good atmosphere', category: 'nature' },
  { ko: '돌 다리도 두들겨 보고 건너라', en: 'look before you leap', category: 'nature' },
  { ko: '불에 기름 붓기', en: 'add fuel to the fire', category: 'nature' },
  { ko: '산 넘어 산', en: 'one problem after another', category: 'nature' },
  {
    ko: '하늘이 무너져도 솟아날 구멍이 있다',
    en: 'every cloud has a silver lining',
    category: 'nature',
  },
  { ko: '빙산의 일각', en: 'tip of the iceberg', category: 'nature' },
  {
    ko: '물에 빠진 사람 건져 놓으니 보따리 내놓으라 한다',
    en: 'no good deed goes unpunished',
    category: 'nature',
  },
  { ko: '가뭄에 단비', en: 'a blessing in disguise', category: 'nature' },
  { ko: '새벽녘', en: 'at the crack of dawn', category: 'nature' },

  // ----------------------------------------
  // 감정 관용어 (Emotion Idioms)
  // ----------------------------------------
  { ko: '마음을 먹다', en: "make up one's mind", category: 'emotion' },
  { ko: '마음이 가다', en: 'feel attracted to', category: 'emotion' },
  { ko: '화가 나다', en: 'get angry', category: 'emotion' },
  { ko: '기가 막히다', en: 'be dumbfounded', category: 'emotion' },
  { ko: '기분이 좋다', en: 'feel good', category: 'emotion' },
  { ko: '속이 상하다', en: 'feel hurt', category: 'emotion' },
  { ko: '속이 타다', en: 'be anxious', category: 'emotion' },
  { ko: '속이 시원하다', en: 'feel relieved', category: 'emotion' },
  { ko: '속을 썩이다', en: 'give someone a headache', category: 'emotion' },
  { ko: '마음이 놓이다', en: 'feel at ease', category: 'emotion' },
  { ko: '마음을 졸이다', en: 'be on edge', category: 'emotion' },
  { ko: '열 받다', en: 'get annoyed', category: 'emotion' },
  { ko: '짜증나다', en: 'be annoying', category: 'emotion' },
  { ko: '울화가 치밀다', en: "feel one's blood boil", category: 'emotion' },
  { ko: '가슴이 먹먹하다', en: 'feel choked up', category: 'emotion' },

  // ----------------------------------------
  // 행동 관용어 (Action Idioms)
  // ----------------------------------------
  { ko: '팔을 걷어붙이다', en: "roll up one's sleeves", category: 'action' },
  { ko: '한 눈 팔다', en: 'get distracted', category: 'action' },
  { ko: '꼬리를 내리다', en: 'give in', category: 'action' },
  { ko: '코웃음 치다', en: 'scoff at', category: 'action' },
  { ko: '귀 기울이다', en: 'pay attention', category: 'action' },
  { ko: '발을 구르다', en: "stamp one's feet", category: 'action' },
  { ko: '시치미를 떼다', en: 'play dumb', category: 'action' },
  { ko: '배짱이 두둑하다', en: 'have guts', category: 'action' },
  { ko: '뒷북 치다', en: 'be late to the party', category: 'action' },
  { ko: '김새다', en: 'lose momentum', category: 'action' },
  { ko: '딴청을 피우다', en: 'pretend not to know', category: 'action' },

  // ----------------------------------------
  // 속담 (Proverbs)
  // ----------------------------------------
  { ko: '가는 말이 고와야 오는 말이 곱다', en: 'you reap what you sow', category: 'proverb' },
  { ko: '고래 싸움에 새우 등 터진다', en: 'caught between two fires', category: 'proverb' },
  { ko: '낫 놓고 기역자도 모른다', en: 'be completely illiterate', category: 'proverb' },
  { ko: '뛰는 놈 위에 나는 놈 있다', en: "there's always a bigger fish", category: 'proverb' },
  { ko: '원숭이도 나무에서 떨어진다', en: 'even Homer nods', category: 'proverb' },
  { ko: '빈 수레가 요란하다', en: 'empty vessels make the most noise', category: 'proverb' },
  { ko: '세 살 버릇 여든까지 간다', en: 'old habits die hard', category: 'proverb' },
  { ko: '가랑비에 옷 젖는 줄 모른다', en: 'little strokes fell great oaks', category: 'proverb' },
  { ko: '백지장도 맞들면 낫다', en: 'many hands make light work', category: 'proverb' },
  {
    ko: '소 잃고 외양간 고친다',
    en: 'close the barn door after the horse has bolted',
    category: 'proverb',
  },
  { ko: '급할수록 돌아가라', en: 'haste makes waste', category: 'proverb' },
  {
    ko: '천 리 길도 한 걸음부터',
    en: 'a journey of a thousand miles begins with a single step',
    category: 'proverb',
  },
  { ko: '고생 끝에 낙이 온다', en: 'no pain no gain', category: 'proverb' },
  { ko: '등잔 밑이 어둡다', en: "it's darkest under the lamp", category: 'proverb' },
  { ko: '아니 땐 굴뚝에 연기 날까', en: "where there's smoke there's fire", category: 'proverb' },
  { ko: '지렁이도 밟으면 꿈틀한다', en: 'even a worm will turn', category: 'proverb' },
  { ko: '티끌 모아 태산', en: 'every little bit helps', category: 'proverb' },
  { ko: '아는 길도 물어 가라', en: 'better safe than sorry', category: 'proverb' },
  { ko: '낮말은 새가 듣고 밤말은 쥐가 듣는다', en: 'walls have ears', category: 'proverb' },
  { ko: '눈 가리고 아웅', en: "bury one's head in the sand", category: 'proverb' },
  {
    ko: '될성 부른 나무는 떡잎부터 알아본다',
    en: 'the child is father of the man',
    category: 'proverb',
  },
  { ko: '마른 하늘에 날벼락', en: 'a bolt from the blue', category: 'proverb' },
  {
    ko: '콩 심은 데 콩 나고 팥 심은 데 팥 난다',
    en: 'as you sow so shall you reap',
    category: 'proverb',
  },
  {
    ko: '남의 떡이 커 보인다',
    en: 'the grass is always greener on the other side',
    category: 'proverb',
  },
  { ko: '우물 안 개구리', en: 'a frog in a well', category: 'proverb' },
  {
    ko: '자라 보고 놀란 가슴 솥뚜껑 보고 놀란다',
    en: 'once bitten twice shy',
    category: 'proverb',
  },
  { ko: '달리는 말에 채찍질', en: 'spur a willing horse', category: 'proverb' },
  {
    ko: '미꾸라지 한 마리가 온 웅덩이를 흐린다',
    en: 'one bad apple spoils the barrel',
    category: 'proverb',
  },
  { ko: '말이 씨가 된다', en: 'be careful what you wish for', category: 'proverb' },
  { ko: '뿌린 대로 거둔다', en: 'you reap what you sow', category: 'proverb' },

  // ----------------------------------------
  // 사자성어 (Four-character Idioms)
  // ----------------------------------------
  { ko: '일석이조', en: 'kill two birds with one stone', category: 'idiom' },
  {
    ko: '꿩 먹고 알 먹기',
    en: 'kill two birds with one stone',
    category: 'idiom',
    variants: ['꿩먹고 알먹기'],
  },
  { ko: '오매불망', en: "can't stop thinking about", category: 'idiom' },
  { ko: '일취월장', en: 'improve day by day', category: 'idiom' },
  { ko: '동고동락', en: 'share joys and sorrows', category: 'idiom' },
  { ko: '자업자득', en: 'you made your bed now lie in it', category: 'idiom' },
  { ko: '일거양득', en: 'kill two birds with one stone', category: 'idiom' },
  { ko: '금상첨화', en: 'icing on the cake', category: 'idiom' },
  { ko: '설상가상', en: 'to make matters worse', category: 'idiom' },
  { ko: '유비무환', en: 'forewarned is forearmed', category: 'idiom' },
  { ko: '백문불여일견', en: 'seeing is believing', category: 'idiom' },
  { ko: '고진감래', en: 'no pain no gain', category: 'idiom' },
  { ko: '대기만성', en: 'good things come to those who wait', category: 'idiom' },
  { ko: '다다익선', en: 'the more the merrier', category: 'idiom' },
  { ko: '유유상종', en: 'birds of a feather flock together', category: 'idiom' },
  { ko: '십중팔구', en: 'nine times out of ten', category: 'idiom' },
  { ko: '새옹지마', en: 'every cloud has a silver lining', category: 'idiom' },
  { ko: '언행일치', en: 'practice what you preach', category: 'idiom' },
  { ko: '좌불안석', en: 'on pins and needles', category: 'idiom' },
  { ko: '죽마고우', en: 'childhood friend', category: 'idiom' },
  { ko: '일사천리', en: 'proceed swiftly', category: 'idiom' },
  { ko: '칠전팔기', en: 'fall seven times stand up eight', category: 'idiom' },
  { ko: '선견지명', en: 'foresight', category: 'idiom' },
  { ko: '동문서답', en: 'give an irrelevant answer', category: 'idiom' },
  { ko: '백발백중', en: 'hit the mark every time', category: 'idiom' },
  { ko: '전화위복', en: 'turn a crisis into an opportunity', category: 'idiom' },
  { ko: '막상막하', en: 'neck and neck', category: 'idiom' },
  { ko: '동분서주', en: 'run around busily', category: 'idiom' },
  { ko: '적반하장', en: 'the pot calling the kettle black', category: 'idiom' },
  { ko: '갈수록 태산', en: 'out of the frying pan into the fire', category: 'idiom' },
  { ko: '구사일생', en: 'have a narrow escape', category: 'idiom' },

  // ----------------------------------------
  // 신조어/은어 (Slang)
  // ----------------------------------------
  { ko: '멘붕', en: 'mental breakdown', category: 'slang', literal: '멘탈붕괴' },
  {
    ko: '갑분싸',
    en: 'sudden awkward silence',
    category: 'slang',
    literal: '갑자기 분위기 싸해짐',
  },
  { ko: '빼박', en: 'undeniable', category: 'slang', literal: '빼도 박도 못함' },
  { ko: '극혐', en: 'extremely disgusting', category: 'slang' },
  { ko: '존맛', en: 'super delicious', category: 'slang' },
  { ko: '존맛탱', en: 'super delicious', category: 'slang' },
  { ko: '핵인싸', en: 'super popular person', category: 'slang' },
  { ko: '아싸', en: 'outsider', category: 'slang' },
  { ko: '인싸', en: 'popular person', category: 'slang' },
  { ko: '갑질', en: 'power abuse', category: 'slang' },
  { ko: '갑을관계', en: 'power hierarchy', category: 'slang' },
  { ko: '꿀잼', en: 'super fun', category: 'slang' },
  { ko: '노잼', en: 'no fun', category: 'slang' },
  { ko: '핵노잼', en: 'super boring', category: 'slang' },
  { ko: '레알', en: 'for real', category: 'slang' },
  { ko: '인정', en: 'true that', category: 'slang' },
  { ko: '공감', en: 'relatable', category: 'slang' },
  { ko: '댓글', en: 'comment', category: 'slang' },
  { ko: '구독', en: 'subscribe', category: 'slang' },
  // 추가 신조어
  {
    ko: '내로남불',
    en: 'hypocrisy',
    category: 'slang',
    literal: '내가 하면 로맨스, 남이 하면 불륜',
  },
  { ko: '혼밥', en: 'eating alone', category: 'slang' },
  { ko: '혼술', en: 'drinking alone', category: 'slang' },
  { ko: '존버', en: 'holding strong', category: 'slang' },
  { ko: 'TMI', en: 'too much information', category: 'slang' },
  { ko: '워라밸', en: 'work-life balance', category: 'slang' },
  { ko: '소확행', en: 'small but certain happiness', category: 'slang' },
  { ko: '가성비', en: 'value for money', category: 'slang', literal: '가격 대비 성능' },
  { ko: '갓생', en: 'productive life', category: 'slang' },
  { ko: '플렉스', en: 'flex', category: 'slang' },
  { ko: '킹받다', en: 'to be annoyed', category: 'slang' },
  { ko: '킹받아', en: 'so annoying', category: 'slang' },
  { ko: '킹리적갓심', en: 'totally reasonable', category: 'slang' },
  { ko: '취저', en: 'totally my taste', category: 'slang', literal: '취향저격' },
  { ko: '취향저격', en: 'totally my taste', category: 'slang' },
  { ko: '오졌다', en: 'awesome', category: 'slang' },
  { ko: '쩐다', en: 'awesome', category: 'slang' },
  { ko: '존잘', en: 'super handsome', category: 'slang' },
  { ko: '존예', en: 'super pretty', category: 'slang' },
  { ko: '존귀', en: 'super cute', category: 'slang' },
  { ko: '광탈', en: 'eliminated early', category: 'slang' },
  { ko: '만렙', en: 'max level', category: 'slang' },
  { ko: '버프', en: 'buff', category: 'slang' },
  { ko: '너프', en: 'nerf', category: 'slang' },
  { ko: '캐리', en: 'carry', category: 'slang' },
  { ko: '트롤', en: 'troll', category: 'slang' },
  { ko: '템', en: 'item', category: 'slang' },
  { ko: '겜', en: 'game', category: 'slang' },
  { ko: '폰', en: 'phone', category: 'slang' },
  { ko: '컴', en: 'computer', category: 'slang' },
  { ko: '넘사벽', en: 'beyond comparison', category: 'slang', literal: '넘을 수 없는 사차원의 벽' },
  { ko: '뇌절', en: 'annoying repetition', category: 'slang' },
  { ko: '손절', en: 'cutting ties', category: 'slang' },
  { ko: '정줄놓', en: 'lost my mind', category: 'slang' },
  { ko: 'JMT', en: 'super delicious', category: 'slang' },
  { ko: 'ㄹㅇ', en: 'for real', category: 'slang' },
  { ko: 'ㅋㅋㅋ', en: 'lol', category: 'slang' },
  { ko: 'ㅎㅎ', en: 'haha', category: 'slang' },
  { ko: 'ㅠㅠ', en: 'crying', category: 'slang' },
  { ko: 'ㅜㅜ', en: 'sad', category: 'slang' },
];

// ========================================
// 영→한 관용어 사전
// ========================================

export const enToKoIdioms: Record<string, string> = {
  // 일상 관용어
  'a piece of cake': '식은 죽 먹기',
  'piece of cake': '식은 죽 먹기',
  'break a leg': '행운을 빌어',
  "it's raining cats and dogs": '비가 억수같이 쏟아진다',
  'raining cats and dogs': '비가 억수같이 쏟아진다',
  'hit the nail on the head': '정곡을 찌르다',
  'kill two birds with one stone': '일석이조',
  'spill the beans': '비밀을 누설하다',
  'cost an arm and a leg': '매우 비싸다',
  'under the weather': '몸이 안 좋다',
  'break the ice': '어색함을 깨다',
  'bite the bullet': '이를 악물다',
  'once in a blue moon': '아주 드물게',
  'let the cat out of the bag': '비밀을 누설하다',
  'feel under the weather': '몸이 안 좋다',
  'in the blink of an eye': '눈 깜짝할 사이에',
  'blink of an eye': '눈 깜짝할 사이',
  "the apple of one's eye": '눈에 넣어도 안 아픈',
  'have high standards': '눈이 높다',
  "roll up one's sleeves": '발 벗고 나서다',
  'be generous': '손이 크다',
  'know many people': '발이 넓다',
  'have a loose tongue': '입이 가볍다',
  'be tight-lipped': '입이 무겁다',
  'lip service': '입에 발린 말',
  "on the edge of one's seat": '손에 땀을 쥐다',
  "wash one's hands of": '손을 씻다',
  "rack one's brain": '머리를 쥐어짜다',
  'be easily influenced': '귀가 얇다',
  'speak of the devil': '호랑이도 제 말 하면 온다',
  "where there's smoke there's fire": '아니 땐 굴뚝에 연기 날까',
  'you reap what you sow': '뿌린 대로 거둔다',
  'walls have ears': '낮말은 새가 듣고 밤말은 쥐가 듣는다',
  'haste makes waste': '급할수록 돌아가라',
  'old habits die hard': '세 살 버릇 여든까지 간다',
  'many hands make light work': '백지장도 맞들면 낫다',
  'no pain no gain': '고생 끝에 낙이 온다',
  'every cloud has a silver lining': '새옹지마',
  'look before you leap': '돌다리도 두들겨 보고 건너라',
  'add fuel to the fire': '불에 기름 붓기',
  'tip of the iceberg': '빙산의 일각',
  'the grass is always greener on the other side': '남의 떡이 커 보인다',
  'once bitten twice shy': '자라 보고 놀란 가슴 솥뚜껑 보고 놀란다',
  'birds of a feather flock together': '유유상종',
  'icing on the cake': '금상첨화',
  'to make matters worse': '설상가상',
  'seeing is believing': '백문불여일견',
  'nine times out of ten': '십중팔구',
  'the pot calling the kettle black': '적반하장',
  'neck and neck': '막상막하',
  'pie in the sky': '그림의 떡',
  'get stood up': '바람 맞다',
  'get goosebumps': '닭살이 돋다',
  'play dumb': '시치미를 떼다',
  "make up one's mind": '마음을 먹다',
  'read the room': '눈치를 보다',
  'be quick to read situations': '눈치가 빠르다',
  'a bolt from the blue': '마른 하늘에 날벼락',
};

// ========================================
// 유틸리티 함수
// ========================================

// 길이로 정렬된 관용어 목록 (긴 것부터 매칭)
const sortedIdioms = [...idioms].sort((a, b) => b.ko.length - a.ko.length);

// 정규화 함수 (공백 제거 등)
function normalizeForMatching(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * 한→영 관용어 매칭
 * 문장 내에서 관용어를 찾아 번역
 */
export function matchKoIdioms(text: string): {
  found: boolean;
  result: string;
  matched: IdiomEntry[];
} {
  let result = normalizeForMatching(text);
  const matched: IdiomEntry[] = [];

  for (const idiom of sortedIdioms) {
    // 기본 표현 및 변형 모두 체크
    const patterns = [idiom.ko, ...(idiom.variants || [])];

    for (const pattern of patterns) {
      // 공백 유연 매칭 (관용어 내 공백을 선택적으로)
      const flexPattern = pattern.replace(/\s+/g, '\\s*');
      const regex = new RegExp(flexPattern, 'g');

      if (regex.test(result)) {
        result = result.replace(regex, `{{${idiom.en}}}`);
        matched.push(idiom);
        break; // 같은 관용어의 다른 변형은 스킵
      }
    }
  }

  // 마커 제거 및 결과 정리
  result = result.replace(/\{\{/g, '').replace(/\}\}/g, '');

  return {
    found: matched.length > 0,
    result,
    matched,
  };
}

/**
 * 영→한 관용어 매칭
 */
export function matchEnIdioms(text: string): {
  found: boolean;
  result: string;
  matched: string[];
} {
  let result = text.toLowerCase();
  const matched: string[] = [];

  // 긴 관용어부터 매칭
  const sortedEnIdioms = Object.entries(enToKoIdioms).sort(([a], [b]) => b.length - a.length);

  for (const [en, ko] of sortedEnIdioms) {
    if (result.includes(en.toLowerCase())) {
      result = result.replace(new RegExp(en, 'gi'), ko);
      matched.push(en);
    }
  }

  return {
    found: matched.length > 0,
    result,
    matched,
  };
}

/**
 * 단일 관용어 조회
 */
export function lookupKoIdiom(text: string): IdiomEntry | undefined {
  const normalized = normalizeForMatching(text);
  return idioms.find((idiom) => idiom.ko === normalized || idiom.variants?.includes(normalized));
}

/**
 * 카테고리별 관용어 조회
 */
export function getIdiomsByCategory(category: IdiomCategory): IdiomEntry[] {
  return idioms.filter((idiom) => idiom.category === category);
}
