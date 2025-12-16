// ========================================
// Contracted Endings - 축약형 어미
// 가요, 와요, 해요 등 모음 축약 형태 처리
// ========================================

export interface ContractedEndingInfo {
  stem: string; // 원형 어간
  baseMeaning: string; // 영어 기본 의미
  tense: 'present' | 'past' | 'future';
  formality: 'formal' | 'polite' | 'casual';
  isDescriptive?: boolean; // 형용사/서술적 동사 여부 (좋다, 싫다 등)
}

// 축약형 어미 (완전한 단어 형태)
// 형태: 축약형 → { 어간, 영어뜻, 시제, 격식 }
export const contractedForms: Record<string, ContractedEndingInfo> = {
  // 가다 (go)
  가: { stem: '가', baseMeaning: 'go', tense: 'present', formality: 'casual' },
  가요: { stem: '가', baseMeaning: 'go', tense: 'present', formality: 'polite' },
  갑니다: { stem: '가', baseMeaning: 'go', tense: 'present', formality: 'formal' },
  갔어: { stem: '가', baseMeaning: 'go', tense: 'past', formality: 'casual' },
  갔어요: { stem: '가', baseMeaning: 'go', tense: 'past', formality: 'polite' },
  갔습니다: { stem: '가', baseMeaning: 'go', tense: 'past', formality: 'formal' },

  // 오다 (come)
  와: { stem: '오', baseMeaning: 'come', tense: 'present', formality: 'casual' },
  와요: { stem: '오', baseMeaning: 'come', tense: 'present', formality: 'polite' },
  옵니다: { stem: '오', baseMeaning: 'come', tense: 'present', formality: 'formal' },
  왔어: { stem: '오', baseMeaning: 'come', tense: 'past', formality: 'casual' },
  왔어요: { stem: '오', baseMeaning: 'come', tense: 'past', formality: 'polite' },
  왔습니다: { stem: '오', baseMeaning: 'come', tense: 'past', formality: 'formal' },

  // 하다 (do)
  해: { stem: '하', baseMeaning: 'do', tense: 'present', formality: 'casual' },
  해요: { stem: '하', baseMeaning: 'do', tense: 'present', formality: 'polite' },
  합니다: { stem: '하', baseMeaning: 'do', tense: 'present', formality: 'formal' },
  했어: { stem: '하', baseMeaning: 'do', tense: 'past', formality: 'casual' },
  했어요: { stem: '하', baseMeaning: 'do', tense: 'past', formality: 'polite' },
  했습니다: { stem: '하', baseMeaning: 'do', tense: 'past', formality: 'formal' },

  // 보다 (see/watch)
  봐: { stem: '보', baseMeaning: 'see', tense: 'present', formality: 'casual' },
  봐요: { stem: '보', baseMeaning: 'see', tense: 'present', formality: 'polite' },
  봅니다: { stem: '보', baseMeaning: 'see', tense: 'present', formality: 'formal' },
  봤어: { stem: '보', baseMeaning: 'see', tense: 'past', formality: 'casual' },
  봤어요: { stem: '보', baseMeaning: 'see', tense: 'past', formality: 'polite' },
  봤습니다: { stem: '보', baseMeaning: 'see', tense: 'past', formality: 'formal' },

  // 주다 (give)
  줘: { stem: '주', baseMeaning: 'give', tense: 'present', formality: 'casual' },
  줘요: { stem: '주', baseMeaning: 'give', tense: 'present', formality: 'polite' },
  줍니다: { stem: '주', baseMeaning: 'give', tense: 'present', formality: 'formal' },
  줬어: { stem: '주', baseMeaning: 'give', tense: 'past', formality: 'casual' },
  줬어요: { stem: '주', baseMeaning: 'give', tense: 'past', formality: 'polite' },
  줬습니다: { stem: '주', baseMeaning: 'give', tense: 'past', formality: 'formal' },

  // 서다 (stand)
  서: { stem: '서', baseMeaning: 'stand', tense: 'present', formality: 'casual' },
  서요: { stem: '서', baseMeaning: 'stand', tense: 'present', formality: 'polite' },
  섭니다: { stem: '서', baseMeaning: 'stand', tense: 'present', formality: 'formal' },
  섰어: { stem: '서', baseMeaning: 'stand', tense: 'past', formality: 'casual' },
  섰어요: { stem: '서', baseMeaning: 'stand', tense: 'past', formality: 'polite' },
  섰습니다: { stem: '서', baseMeaning: 'stand', tense: 'past', formality: 'formal' },

  // 자다 (sleep)
  자: { stem: '자', baseMeaning: 'sleep', tense: 'present', formality: 'casual' },
  자요: { stem: '자', baseMeaning: 'sleep', tense: 'present', formality: 'polite' },
  잡니다: { stem: '자', baseMeaning: 'sleep', tense: 'present', formality: 'formal' },
  잤어: { stem: '자', baseMeaning: 'sleep', tense: 'past', formality: 'casual' },
  잤어요: { stem: '자', baseMeaning: 'sleep', tense: 'past', formality: 'polite' },
  잤습니다: { stem: '자', baseMeaning: 'sleep', tense: 'past', formality: 'formal' },

  // 사다 (buy) - 삽니다는 살다(live)와 중복되어 제외
  사: { stem: '사', baseMeaning: 'buy', tense: 'present', formality: 'casual' },
  사요: { stem: '사', baseMeaning: 'buy', tense: 'present', formality: 'polite' },
  샀어: { stem: '사', baseMeaning: 'buy', tense: 'past', formality: 'casual' },
  샀어요: { stem: '사', baseMeaning: 'buy', tense: 'past', formality: 'polite' },
  샀습니다: { stem: '사', baseMeaning: 'buy', tense: 'past', formality: 'formal' },

  // 타다 (ride)
  타: { stem: '타', baseMeaning: 'ride', tense: 'present', formality: 'casual' },
  타요: { stem: '타', baseMeaning: 'ride', tense: 'present', formality: 'polite' },
  탑니다: { stem: '타', baseMeaning: 'ride', tense: 'present', formality: 'formal' },
  탔어: { stem: '타', baseMeaning: 'ride', tense: 'past', formality: 'casual' },
  탔어요: { stem: '타', baseMeaning: 'ride', tense: 'past', formality: 'polite' },
  탔습니다: { stem: '타', baseMeaning: 'ride', tense: 'past', formality: 'formal' },

  // 만나다 (meet)
  만나: { stem: '만나', baseMeaning: 'meet', tense: 'present', formality: 'casual' },
  만나요: { stem: '만나', baseMeaning: 'meet', tense: 'present', formality: 'polite' },
  만납니다: { stem: '만나', baseMeaning: 'meet', tense: 'present', formality: 'formal' },
  만났어: { stem: '만나', baseMeaning: 'meet', tense: 'past', formality: 'casual' },
  만났어요: { stem: '만나', baseMeaning: 'meet', tense: 'past', formality: 'polite' },
  만났습니다: { stem: '만나', baseMeaning: 'meet', tense: 'past', formality: 'formal' },

  // 배우다 (learn)
  배워: { stem: '배우', baseMeaning: 'learn', tense: 'present', formality: 'casual' },
  배워요: { stem: '배우', baseMeaning: 'learn', tense: 'present', formality: 'polite' },
  배웁니다: { stem: '배우', baseMeaning: 'learn', tense: 'present', formality: 'formal' },
  배웠어: { stem: '배우', baseMeaning: 'learn', tense: 'past', formality: 'casual' },
  배웠어요: { stem: '배우', baseMeaning: 'learn', tense: 'past', formality: 'polite' },
  배웠습니다: { stem: '배우', baseMeaning: 'learn', tense: 'past', formality: 'formal' },

  // 마시다 (drink)
  마셔: { stem: '마시', baseMeaning: 'drink', tense: 'present', formality: 'casual' },
  마셔요: { stem: '마시', baseMeaning: 'drink', tense: 'present', formality: 'polite' },
  마십니다: { stem: '마시', baseMeaning: 'drink', tense: 'present', formality: 'formal' },
  마셨어: { stem: '마시', baseMeaning: 'drink', tense: 'past', formality: 'casual' },
  마셨어요: { stem: '마시', baseMeaning: 'drink', tense: 'past', formality: 'polite' },
  마셨습니다: { stem: '마시', baseMeaning: 'drink', tense: 'past', formality: 'formal' },

  // 먹다 (eat)
  먹어: { stem: '먹', baseMeaning: 'eat', tense: 'present', formality: 'casual' },
  먹어요: { stem: '먹', baseMeaning: 'eat', tense: 'present', formality: 'polite' },
  먹습니다: { stem: '먹', baseMeaning: 'eat', tense: 'present', formality: 'formal' },
  먹었어: { stem: '먹', baseMeaning: 'eat', tense: 'past', formality: 'casual' },
  먹었어요: { stem: '먹', baseMeaning: 'eat', tense: 'past', formality: 'polite' },
  먹었습니다: { stem: '먹', baseMeaning: 'eat', tense: 'past', formality: 'formal' },

  // 읽다 (read)
  읽어: { stem: '읽', baseMeaning: 'read', tense: 'present', formality: 'casual' },
  읽어요: { stem: '읽', baseMeaning: 'read', tense: 'present', formality: 'polite' },
  읽습니다: { stem: '읽', baseMeaning: 'read', tense: 'present', formality: 'formal' },
  읽었어: { stem: '읽', baseMeaning: 'read', tense: 'past', formality: 'casual' },
  읽었어요: { stem: '읽', baseMeaning: 'read', tense: 'past', formality: 'polite' },
  읽었습니다: { stem: '읽', baseMeaning: 'read', tense: 'past', formality: 'formal' },

  // 쓰다 (write)
  써: { stem: '쓰', baseMeaning: 'write', tense: 'present', formality: 'casual' },
  써요: { stem: '쓰', baseMeaning: 'write', tense: 'present', formality: 'polite' },
  씁니다: { stem: '쓰', baseMeaning: 'write', tense: 'present', formality: 'formal' },
  썼어: { stem: '쓰', baseMeaning: 'write', tense: 'past', formality: 'casual' },
  썼어요: { stem: '쓰', baseMeaning: 'write', tense: 'past', formality: 'polite' },
  썼습니다: { stem: '쓰', baseMeaning: 'write', tense: 'past', formality: 'formal' },

  // 듣다 (listen/hear) - ㄷ불규칙
  들어: { stem: '듣', baseMeaning: 'hear', tense: 'present', formality: 'casual' },
  들어요: { stem: '듣', baseMeaning: 'hear', tense: 'present', formality: 'polite' },
  듣습니다: { stem: '듣', baseMeaning: 'hear', tense: 'present', formality: 'formal' },
  들었어: { stem: '듣', baseMeaning: 'hear', tense: 'past', formality: 'casual' },
  들었어요: { stem: '듣', baseMeaning: 'hear', tense: 'past', formality: 'polite' },
  들었습니다: { stem: '듣', baseMeaning: 'hear', tense: 'past', formality: 'formal' },

  // 걷다 (walk) - ㄷ불규칙
  걸어: { stem: '걷', baseMeaning: 'walk', tense: 'present', formality: 'casual' },
  걸어요: { stem: '걷', baseMeaning: 'walk', tense: 'present', formality: 'polite' },
  걷습니다: { stem: '걷', baseMeaning: 'walk', tense: 'present', formality: 'formal' },
  걸었어: { stem: '걷', baseMeaning: 'walk', tense: 'past', formality: 'casual' },
  걸었어요: { stem: '걷', baseMeaning: 'walk', tense: 'past', formality: 'polite' },
  걸었습니다: { stem: '걷', baseMeaning: 'walk', tense: 'past', formality: 'formal' },

  // 좋다 (good/like) - 형용사
  좋아: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  좋아요: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  좋습니다: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },
  좋았어: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'past',
    formality: 'casual',
    isDescriptive: true,
  },
  좋았어요: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'past',
    formality: 'polite',
    isDescriptive: true,
  },
  좋았습니다: {
    stem: '좋',
    baseMeaning: 'good',
    tense: 'past',
    formality: 'formal',
    isDescriptive: true,
  },

  // 싫다 (dislike) - 형용사
  싫어: {
    stem: '싫',
    baseMeaning: 'bad',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  싫어요: {
    stem: '싫',
    baseMeaning: 'bad',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  싫습니다: {
    stem: '싫',
    baseMeaning: 'bad',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 알다 (know)
  알아: { stem: '알', baseMeaning: 'know', tense: 'present', formality: 'casual' },
  알아요: { stem: '알', baseMeaning: 'know', tense: 'present', formality: 'polite' },
  압니다: { stem: '알', baseMeaning: 'know', tense: 'present', formality: 'formal' },
  알았어: { stem: '알', baseMeaning: 'know', tense: 'past', formality: 'casual' },
  알았어요: { stem: '알', baseMeaning: 'know', tense: 'past', formality: 'polite' },
  알았습니다: { stem: '알', baseMeaning: 'know', tense: 'past', formality: 'formal' },

  // 살다 (live)
  살아: { stem: '살', baseMeaning: 'live', tense: 'present', formality: 'casual' },
  살아요: { stem: '살', baseMeaning: 'live', tense: 'present', formality: 'polite' },
  삽니다: { stem: '살', baseMeaning: 'live', tense: 'present', formality: 'formal' },
  살았어: { stem: '살', baseMeaning: 'live', tense: 'past', formality: 'casual' },
  살았어요: { stem: '살', baseMeaning: 'live', tense: 'past', formality: 'polite' },
  살았습니다: { stem: '살', baseMeaning: 'live', tense: 'past', formality: 'formal' },

  // 놀다 (play)
  놀아: { stem: '놀', baseMeaning: 'play', tense: 'present', formality: 'casual' },
  놀아요: { stem: '놀', baseMeaning: 'play', tense: 'present', formality: 'polite' },
  놉니다: { stem: '놀', baseMeaning: 'play', tense: 'present', formality: 'formal' },
  놀았어: { stem: '놀', baseMeaning: 'play', tense: 'past', formality: 'casual' },
  놀았어요: { stem: '놀', baseMeaning: 'play', tense: 'past', formality: 'polite' },
  놀았습니다: { stem: '놀', baseMeaning: 'play', tense: 'past', formality: 'formal' },

  // 일하다 (work)
  일해: { stem: '일하', baseMeaning: 'work', tense: 'present', formality: 'casual' },
  일해요: { stem: '일하', baseMeaning: 'work', tense: 'present', formality: 'polite' },
  일합니다: { stem: '일하', baseMeaning: 'work', tense: 'present', formality: 'formal' },
  일했어: { stem: '일하', baseMeaning: 'work', tense: 'past', formality: 'casual' },
  일했어요: { stem: '일하', baseMeaning: 'work', tense: 'past', formality: 'polite' },
  일했습니다: { stem: '일하', baseMeaning: 'work', tense: 'past', formality: 'formal' },

  // 공부하다 (study)
  공부해: { stem: '공부하', baseMeaning: 'study', tense: 'present', formality: 'casual' },
  공부해요: { stem: '공부하', baseMeaning: 'study', tense: 'present', formality: 'polite' },
  공부합니다: { stem: '공부하', baseMeaning: 'study', tense: 'present', formality: 'formal' },
  공부했어: { stem: '공부하', baseMeaning: 'study', tense: 'past', formality: 'casual' },
  공부했어요: { stem: '공부하', baseMeaning: 'study', tense: 'past', formality: 'polite' },
  공부했습니다: { stem: '공부하', baseMeaning: 'study', tense: 'past', formality: 'formal' },

  // 운동하다 (exercise)
  운동해: { stem: '운동하', baseMeaning: 'exercise', tense: 'present', formality: 'casual' },
  운동해요: { stem: '운동하', baseMeaning: 'exercise', tense: 'present', formality: 'polite' },
  운동합니다: { stem: '운동하', baseMeaning: 'exercise', tense: 'present', formality: 'formal' },
  운동했어: { stem: '운동하', baseMeaning: 'exercise', tense: 'past', formality: 'casual' },
  운동했어요: { stem: '운동하', baseMeaning: 'exercise', tense: 'past', formality: 'polite' },
  운동했습니다: { stem: '운동하', baseMeaning: 'exercise', tense: 'past', formality: 'formal' },

  // 요리하다 (cook)
  요리해: { stem: '요리하', baseMeaning: 'cook', tense: 'present', formality: 'casual' },
  요리해요: { stem: '요리하', baseMeaning: 'cook', tense: 'present', formality: 'polite' },
  요리합니다: { stem: '요리하', baseMeaning: 'cook', tense: 'present', formality: 'formal' },
  요리했어: { stem: '요리하', baseMeaning: 'cook', tense: 'past', formality: 'casual' },
  요리했어요: { stem: '요리하', baseMeaning: 'cook', tense: 'past', formality: 'polite' },
  요리했습니다: { stem: '요리하', baseMeaning: 'cook', tense: 'past', formality: 'formal' },

  // 전화하다 (call)
  전화해: { stem: '전화하', baseMeaning: 'call', tense: 'present', formality: 'casual' },
  전화해요: { stem: '전화하', baseMeaning: 'call', tense: 'present', formality: 'polite' },
  전화합니다: { stem: '전화하', baseMeaning: 'call', tense: 'present', formality: 'formal' },
  전화했어: { stem: '전화하', baseMeaning: 'call', tense: 'past', formality: 'casual' },
  전화했어요: { stem: '전화하', baseMeaning: 'call', tense: 'past', formality: 'polite' },
  전화했습니다: { stem: '전화하', baseMeaning: 'call', tense: 'past', formality: 'formal' },

  // 사랑하다 (love)
  사랑해: { stem: '사랑하', baseMeaning: 'love', tense: 'present', formality: 'casual' },
  사랑해요: { stem: '사랑하', baseMeaning: 'love', tense: 'present', formality: 'polite' },
  사랑합니다: { stem: '사랑하', baseMeaning: 'love', tense: 'present', formality: 'formal' },
  사랑했어: { stem: '사랑하', baseMeaning: 'love', tense: 'past', formality: 'casual' },
  사랑했어요: { stem: '사랑하', baseMeaning: 'love', tense: 'past', formality: 'polite' },
  사랑했습니다: { stem: '사랑하', baseMeaning: 'love', tense: 'past', formality: 'formal' },

  // 기다리다 (wait)
  기다려: { stem: '기다리', baseMeaning: 'wait', tense: 'present', formality: 'casual' },
  기다려요: { stem: '기다리', baseMeaning: 'wait', tense: 'present', formality: 'polite' },
  기다립니다: { stem: '기다리', baseMeaning: 'wait', tense: 'present', formality: 'formal' },
  기다렸어: { stem: '기다리', baseMeaning: 'wait', tense: 'past', formality: 'casual' },
  기다렸어요: { stem: '기다리', baseMeaning: 'wait', tense: 'past', formality: 'polite' },
  기다렸습니다: { stem: '기다리', baseMeaning: 'wait', tense: 'past', formality: 'formal' },

  // 필요하다 (need) - 형용사
  필요해: {
    stem: '필요하',
    baseMeaning: 'needed',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  필요해요: {
    stem: '필요하',
    baseMeaning: 'needed',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  필요합니다: {
    stem: '필요하',
    baseMeaning: 'needed',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 있다 (exist/have) - 존재사
  있어: {
    stem: '있',
    baseMeaning: 'exist',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  있어요: {
    stem: '있',
    baseMeaning: 'exist',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  있습니다: {
    stem: '있',
    baseMeaning: 'exist',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },
  있었어: {
    stem: '있',
    baseMeaning: 'existed',
    tense: 'past',
    formality: 'casual',
    isDescriptive: true,
  },
  있었어요: {
    stem: '있',
    baseMeaning: 'existed',
    tense: 'past',
    formality: 'polite',
    isDescriptive: true,
  },
  있었습니다: {
    stem: '있',
    baseMeaning: 'existed',
    tense: 'past',
    formality: 'formal',
    isDescriptive: true,
  },

  // 없다 (not exist/not have) - 존재사
  없어: {
    stem: '없',
    baseMeaning: 'not exist',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  없어요: {
    stem: '없',
    baseMeaning: 'not exist',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  없습니다: {
    stem: '없',
    baseMeaning: 'not exist',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },
  없었어: {
    stem: '없',
    baseMeaning: 'did not exist',
    tense: 'past',
    formality: 'casual',
    isDescriptive: true,
  },
  없었어요: {
    stem: '없',
    baseMeaning: 'did not exist',
    tense: 'past',
    formality: 'polite',
    isDescriptive: true,
  },
  없었습니다: {
    stem: '없',
    baseMeaning: 'did not exist',
    tense: 'past',
    formality: 'formal',
    isDescriptive: true,
  },

  // 크다 (big) - 형용사
  커: {
    stem: '크',
    baseMeaning: 'big',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  커요: {
    stem: '크',
    baseMeaning: 'big',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  큽니다: {
    stem: '크',
    baseMeaning: 'big',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 작다 (small) - 형용사
  작아: {
    stem: '작',
    baseMeaning: 'small',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  작아요: {
    stem: '작',
    baseMeaning: 'small',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  작습니다: {
    stem: '작',
    baseMeaning: 'small',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 많다 (many/much) - 형용사
  많아: {
    stem: '많',
    baseMeaning: 'many',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  많아요: {
    stem: '많',
    baseMeaning: 'many',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  많습니다: {
    stem: '많',
    baseMeaning: 'many',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 적다 (few/little) - 형용사
  적어: {
    stem: '적',
    baseMeaning: 'few',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  적어요: {
    stem: '적',
    baseMeaning: 'few',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  적습니다: {
    stem: '적',
    baseMeaning: 'few',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 덥다 (hot) - ㅂ불규칙 형용사
  더워: {
    stem: '덥',
    baseMeaning: 'hot',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  더워요: {
    stem: '덥',
    baseMeaning: 'hot',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  덥습니다: {
    stem: '덥',
    baseMeaning: 'hot',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 춥다 (cold) - ㅂ불규칙 형용사
  추워: {
    stem: '춥',
    baseMeaning: 'cold',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  추워요: {
    stem: '춥',
    baseMeaning: 'cold',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  춥습니다: {
    stem: '춥',
    baseMeaning: 'cold',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 어렵다 (difficult) - ㅂ불규칙 형용사
  어려워: {
    stem: '어렵',
    baseMeaning: 'difficult',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  어려워요: {
    stem: '어렵',
    baseMeaning: 'difficult',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  어렵습니다: {
    stem: '어렵',
    baseMeaning: 'difficult',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 쉽다 (easy) - ㅂ불규칙 형용사
  쉬워: {
    stem: '쉽',
    baseMeaning: 'easy',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  쉬워요: {
    stem: '쉽',
    baseMeaning: 'easy',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  쉽습니다: {
    stem: '쉽',
    baseMeaning: 'easy',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 예쁘다 (pretty) - 형용사
  예뻐: {
    stem: '예쁘',
    baseMeaning: 'pretty',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  예뻐요: {
    stem: '예쁘',
    baseMeaning: 'pretty',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  예쁩니다: {
    stem: '예쁘',
    baseMeaning: 'pretty',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 바쁘다 (busy) - 형용사
  바빠: {
    stem: '바쁘',
    baseMeaning: 'busy',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  바빠요: {
    stem: '바쁘',
    baseMeaning: 'busy',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  바쁩니다: {
    stem: '바쁘',
    baseMeaning: 'busy',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 맛있다 (delicious) - 형용사
  맛있어: {
    stem: '맛있',
    baseMeaning: 'delicious',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  맛있어요: {
    stem: '맛있',
    baseMeaning: 'delicious',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  맛있습니다: {
    stem: '맛있',
    baseMeaning: 'delicious',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },

  // 재미있다 (interesting/fun) - 형용사
  재미있어: {
    stem: '재미있',
    baseMeaning: 'fun',
    tense: 'present',
    formality: 'casual',
    isDescriptive: true,
  },
  재미있어요: {
    stem: '재미있',
    baseMeaning: 'fun',
    tense: 'present',
    formality: 'polite',
    isDescriptive: true,
  },
  재미있습니다: {
    stem: '재미있',
    baseMeaning: 'fun',
    tense: 'present',
    formality: 'formal',
    isDescriptive: true,
  },
};

// 축약형 목록 (길이순 정렬 - 긴 것 먼저 매칭)
export const contractedFormList = Object.keys(contractedForms).sort((a, b) => b.length - a.length);

// 조사와 충돌하는 짧은 형태들 (prefix 없이 단독 사용만 허용)
const ambiguousForms = new Set(['가', '와', '서', '해']);

/**
 * 축약형 어미 추출 시도
 * 단어 전체가 축약형이거나, 단어 끝이 축약형인 경우 처리
 */
export function tryExtractContracted(
  word: string
): { prefix: string; contracted: ContractedEndingInfo } | null {
  // 1. 완전 일치 확인
  if (contractedForms[word]) {
    return { prefix: '', contracted: contractedForms[word] };
  }

  // 2. 접두어+축약형 패턴 (예: "학교에 가요" → "가요")
  for (const form of contractedFormList) {
    if (word.endsWith(form) && word.length > form.length) {
      // 조사와 충돌하는 짧은 형태는 prefix가 있으면 건너뜀
      if (ambiguousForms.has(form)) {
        continue;
      }

      // 최소 2글자 이상의 축약형만 prefix와 함께 매칭
      if (form.length < 2) {
        continue;
      }

      const contracted = contractedForms[form];
      if (!contracted) continue;

      const prefix = word.slice(0, -form.length);
      return { prefix, contracted };
    }
  }

  return null;
}
