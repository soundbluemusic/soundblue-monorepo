// ========================================
// Context Analyzer - 문맥 분석기
// 체스 게임처럼 여러 요소를 종합 평가하여 최적의 번역 선택
// ========================================

/**
 * 화자 유형 (Speaker Type)
 */
export type SpeakerType =
  | 'teen' // 10대
  | 'young_adult' // 20-30대
  | 'middle_aged' // 40-50대
  | 'elderly' // 60대+
  | 'formal' // 공식적
  | 'casual' // 친근한
  | 'angry' // 화난
  | 'emotional' // 감정적
  | 'villain' // 악당
  | 'neutral'; // 중립

/**
 * 감정 상태 (Emotion)
 */
export type Emotion =
  | 'excited' // 흥분/기쁨
  | 'angry' // 화남
  | 'sad' // 슬픔
  | 'worried' // 걱정
  | 'sarcastic' // 비꼼
  | 'loving' // 애정
  | 'threatening' // 위협
  | 'neutral'; // 중립

/**
 * 상황 유형 (Situation)
 */
export type Situation =
  | 'romance' // 연애
  | 'conflict' // 갈등/싸움
  | 'comfort' // 위로
  | 'business' // 비즈니스
  | 'court' // 법정
  | 'comedy' // 코미디
  | 'thriller' // 스릴러
  | 'casual'; // 일상

/**
 * 문맥 분석 결과
 */
export interface ContextAnalysis {
  speakerType: SpeakerType;
  emotion: Emotion;
  situation: Situation;
  confidence: number; // 0-1 신뢰도
  scores: {
    teen: number;
    formal: number;
    emotional: number;
    angry: number;
    loving: number;
    villain: number;
  };
}

// ========================================
// 문맥 단서 정의 (가중치 포함)
// ========================================

// 10대/젊은층 단서
const TEEN_MARKERS: Record<string, number> = {
  야: 2,
  쟤: 3,
  걔: 3,
  완전: 3,
  대박: 2,
  헐: 3,
  짱: 3,
  개: 2, // 개웃겨 등
  존나: 4,
  ㅋㅋ: 4,
  ㅎㅎ: 3,
  이상형: 2,
  오글: 3,
  쪽팔: 3,
  갓생: 4,
  워라밸: 2,
  진짜: 1,
  레알: 4,
  찐: 3,
};

// 할머니/노인 단서
const ELDERLY_MARKERS: Record<string, number> = {
  다니냐: 4,
  먹고: 1,
  얼굴: 1,
  파리하: 3,
  아가: 3,
  손자: 3,
  밥은: 2,
  잘: 1,
  건강: 2,
  어디: 1,
};

// 공식/격식 단서
const FORMAL_MARKERS: Record<string, number> = {
  판사님: 5,
  배심원: 5,
  검사: 4,
  의뢰인: 4,
  묘사: 3,
  존재합니다: 4,
  '~ㅂ니다': 3,
  '~습니다': 3,
  정의: 2,
  법: 2,
};

// 화남/분노 단서
const ANGRY_MARKERS: Record<string, number> = {
  대체: 3,
  '뭐 한': 3,
  '이게 뭐야': 4,
  지긋지긋: 4,
  '안 들어': 3,
  맨날: 2,
  '절대 안': 3,
  '못 해': 2,
  다시: 1,
};

// 위협/양아치 단서
const THREATENING_MARKERS: Record<string, number> = {
  '뭘 봐': 5,
  '눈 똑바로': 4,
  크크크: 4,
  이길: 2,
  손바닥: 2,
  '10수': 3,
  내다보: 2,
};

// 애정/위로 단서
const LOVING_MARKERS: Record<string, number> = {
  괜찮아: 3,
  속상해: 3,
  노력: 2,
  엄마: 2,
  아버지: 2,
  할머니: 2,
  dear: 3,
  sweetie: 4,
  honey: 3,
  '더 좋은': 2,
  만날: 1,
};

// 연애/로맨스 단서
const ROMANCE_MARKERS: Record<string, number> = {
  이상형: 4,
  사랑: 3,
  사랑한다고: 4,
  차였: 3,
  과분: 2,
  옆에: 1,
  있어주: 2,
};

// 비꼼/빈정거림 단서
const SARCASM_MARKERS: Record<string, number> = {
  웃기네: 4,
  '정말 웃기': 4,
  그래서: 1,
  뭐야: 2,
};

// 악당 단서
const VILLAIN_MARKERS: Record<string, number> = {
  크크크: 5,
  이길: 3,
  '10수': 4,
  손바닥: 3,
  내다보: 3,
  게임: 2,
};

// ========================================
// 문맥 단서 분석 함수
// ========================================

function calculateScore(text: string, markers: Record<string, number>): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  for (const [marker, weight] of Object.entries(markers)) {
    if (text.includes(marker) || lowerText.includes(marker.toLowerCase())) {
      score += weight;
    }
  }

  return score;
}

/**
 * 문맥 분석 (메인 함수)
 */
export function analyzeContext(text: string): ContextAnalysis {
  const scores = {
    teen: calculateScore(text, TEEN_MARKERS),
    formal: calculateScore(text, FORMAL_MARKERS),
    emotional:
      calculateScore(text, ANGRY_MARKERS) +
      calculateScore(text, LOVING_MARKERS) +
      calculateScore(text, SARCASM_MARKERS),
    angry: calculateScore(text, ANGRY_MARKERS),
    loving: calculateScore(text, LOVING_MARKERS),
    villain: calculateScore(text, VILLAIN_MARKERS),
    elderly: calculateScore(text, ELDERLY_MARKERS),
    threatening: calculateScore(text, THREATENING_MARKERS),
    romance: calculateScore(text, ROMANCE_MARKERS),
    sarcasm: calculateScore(text, SARCASM_MARKERS),
  };

  // 화자 유형 결정
  let speakerType: SpeakerType = 'neutral';
  let maxScore = 0;

  if (scores.teen > maxScore) {
    maxScore = scores.teen;
    speakerType = 'teen';
  }
  if (scores.elderly > maxScore) {
    maxScore = scores.elderly;
    speakerType = 'elderly';
  }
  if (scores.formal > maxScore) {
    maxScore = scores.formal;
    speakerType = 'formal';
  }
  if (scores.villain > maxScore) {
    maxScore = scores.villain;
    speakerType = 'villain';
  }
  if (scores.angry > maxScore && scores.angry > scores.loving) {
    maxScore = scores.angry;
    speakerType = 'angry';
  }

  // 감정 결정
  let emotion: Emotion = 'neutral';
  let emotionScore = 0;

  if (scores.angry > emotionScore) {
    emotionScore = scores.angry;
    emotion = 'angry';
  }
  if (scores.loving > emotionScore) {
    emotionScore = scores.loving;
    emotion = 'loving';
  }
  if (scores.sarcasm > emotionScore) {
    emotionScore = scores.sarcasm;
    emotion = 'sarcastic';
  }
  if (scores.threatening > emotionScore) {
    emotionScore = scores.threatening;
    emotion = 'threatening';
  }
  if (scores.teen > 3 && scores.romance < 2) {
    emotion = 'excited';
  }

  // 상황 결정
  let situation: Situation = 'casual';

  if (scores.formal > 3) situation = 'court';
  else if (scores.romance > 3) situation = 'romance';
  else if (scores.angry > 3 || scores.sarcasm > 3) situation = 'conflict';
  else if (scores.loving > 3) situation = 'comfort';
  else if (scores.villain > 3) situation = 'thriller';

  // 신뢰도 계산
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = Math.min(totalScore / 20, 1); // 20점 이상이면 100% 신뢰

  return {
    speakerType,
    emotion,
    situation,
    confidence,
    scores: {
      teen: scores.teen,
      formal: scores.formal,
      emotional: scores.emotional,
      angry: scores.angry,
      loving: scores.loving,
      villain: scores.villain,
    },
  };
}

// ========================================
// 문맥 기반 어휘 선택
// ========================================

/**
 * 문맥에 따른 어휘 변환 맵
 */
const CONTEXT_VOCABULARY: Record<
  string,
  {
    default: string;
    teen?: string;
    formal?: string;
    angry?: string;
    loving?: string;
    villain?: string;
    elderly?: string;
    romance?: string;
    sarcastic?: string;
  }
> = {
  대박: {
    default: 'Awesome',
    teen: 'OMG',
    formal: 'remarkable',
  },
  진짜: {
    default: 'really',
    teen: 'literally',
    formal: 'truly',
  },
  완전: {
    default: 'completely',
    teen: 'totally',
    formal: 'entirely',
  },
  이상형이야: {
    default: 'ideal type',
    teen: 'dream guy',
    romance: 'the one',
  },
  야: {
    default: 'Hey',
    teen: '',
    angry: 'Hey',
    villain: '',
  },
  웃기네: {
    default: "That's funny",
    angry: "That's rich",
    sarcastic: "That's rich",
  },
  괜찮아: {
    default: "It's okay",
    loving: "It's alright, sweetie",
    formal: 'It will be fine',
  },
  어떻게: {
    default: 'how',
    angry: 'what the hell',
  },
  눈: {
    default: 'eyes',
    elderly: 'eyes',
  },
  파리하다: {
    default: 'pale',
    elderly: 'thin',
  },
};

/**
 * 문맥 기반 어휘 선택
 */
export function selectContextualWord(word: string, context: ContextAnalysis): string {
  const vocab = CONTEXT_VOCABULARY[word];
  if (!vocab) return word;

  // 화자 유형별 우선 선택
  if (context.speakerType === 'teen' && vocab.teen) {
    return vocab.teen;
  }
  if (context.speakerType === 'formal' && vocab.formal) {
    return vocab.formal;
  }
  if (context.speakerType === 'angry' && vocab.angry) {
    return vocab.angry;
  }
  if (context.speakerType === 'elderly' && vocab.elderly) {
    return vocab.elderly;
  }
  if (context.speakerType === 'villain' && vocab.villain !== undefined) {
    return vocab.villain;
  }

  // 감정별 선택
  if (context.emotion === 'loving' && vocab.loving) {
    return vocab.loving;
  }

  return vocab.default;
}

/**
 * 전체 문장의 어휘를 문맥에 맞게 변환
 */
export function applyContextToTranslation(translation: string, originalText: string): string {
  const context = analyzeContext(originalText);

  let result = translation;

  // 문맥에 따른 어휘 치환
  for (const [korean, vocabMap] of Object.entries(CONTEXT_VOCABULARY)) {
    const contextWord = selectContextualWord(korean, context);
    if (contextWord !== vocabMap.default) {
      // 기본값과 다르면 치환
      result = result.replace(new RegExp(vocabMap.default, 'gi'), contextWord);
    }
  }

  return result;
}
