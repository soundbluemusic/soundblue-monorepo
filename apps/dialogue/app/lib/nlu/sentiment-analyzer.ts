/**
 * @fileoverview Sentiment Analysis System
 *
 * Analyzes emotional tone and polarity of user input
 */

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type Emotion =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'love'
  | 'excitement'
  | 'frustration'
  | 'calm';

export interface SentimentResult {
  sentiment: Sentiment;
  polarity: number; // -1 to 1
  emotion: Emotion;
  intensity: number; // 0 to 1
}

const SENTIMENT_LEXICON: Record<string, Record<string, number>> = {
  en: {
    // Positive (0.5 to 1.0)
    love: 1.0,
    excellent: 0.9,
    amazing: 0.9,
    wonderful: 0.9,
    fantastic: 0.9,
    perfect: 0.9,
    great: 0.8,
    good: 0.7,
    nice: 0.7,
    happy: 0.8,
    pleased: 0.7,
    glad: 0.7,
    awesome: 0.9,
    brilliant: 0.9,
    beautiful: 0.8,
    best: 0.9,
    // Negative (-0.5 to -1.0)
    hate: -1.0,
    terrible: -0.9,
    horrible: -0.9,
    awful: -0.9,
    worst: -0.9,
    bad: -0.7,
    poor: -0.6,
    sad: -0.7,
    angry: -0.8,
    annoyed: -0.6,
    frustrated: -0.7,
    disappointed: -0.7,
    useless: -0.8,
    broken: -0.7,
    fail: -0.7,
    error: -0.6,
    problem: -0.5,
  },
  ko: {
    // Positive
    사랑: 1.0,
    최고: 0.9,
    훌륭: 0.9,
    멋져: 0.9,
    완벽: 0.9,
    환상: 0.9,
    좋아: 0.8,
    좋네: 0.8,
    괜찮: 0.7,
    행복: 0.8,
    기쁘: 0.8,
    만족: 0.7,
    대단: 0.8,
    // Negative
    싫어: -0.9,
    최악: -0.9,
    별로: -0.7,
    나빠: -0.8,
    형편없: -0.9,
    짜증: -0.8,
    화나: -0.8,
    슬퍼: -0.7,
    실망: -0.7,
    문제: -0.5,
    에러: -0.6,
    고장: -0.7,
  },
};

const EMOTION_PATTERNS: Record<Emotion, { en: RegExp[]; ko: RegExp[]; basePolarity: number }> = {
  joy: {
    en: [/(happy|joyful|delighted|cheerful)/i],
    ko: [/(기쁘|행복|즐거|신나)/],
    basePolarity: 0.8,
  },
  sadness: {
    en: [/(sad|unhappy|depressed|miserable)/i],
    ko: [/(슬프|우울|비참|힘들)/],
    basePolarity: -0.7,
  },
  anger: {
    en: [/(angry|mad|furious|enraged)/i],
    ko: [/(화나|짜증|분노|열받)/],
    basePolarity: -0.8,
  },
  fear: {
    en: [/(afraid|scared|worried|anxious|nervous)/i],
    ko: [/(두렵|무서|걱정|불안)/],
    basePolarity: -0.6,
  },
  surprise: {
    en: [/(surprised|shocked|amazed|astonished)/i],
    ko: [/(놀라|충격|깜짝|헐)/],
    basePolarity: 0.3,
  },
  disgust: {
    en: [/(disgusted|repulsed|revolted)/i],
    ko: [/(역겹|구역질|혐오)/],
    basePolarity: -0.8,
  },
  love: {
    en: [/(love|adore|cherish|fond)/i],
    ko: [/(사랑|좋아|애정|마음에 들)/],
    basePolarity: 0.9,
  },
  excitement: {
    en: [/(excited|thrilled|pumped|eager)/i],
    ko: [/(신나|흥분|기대|설레)/],
    basePolarity: 0.8,
  },
  frustration: {
    en: [/(frustrated|annoyed|irritated)/i],
    ko: [/(짜증|답답|속상)/],
    basePolarity: -0.7,
  },
  calm: {
    en: [/(calm|peaceful|relaxed|serene)/i],
    ko: [/(차분|평온|편안|안정)/],
    basePolarity: 0.5,
  },
};

export function analyzeSentiment(text: string, locale: string): SentimentResult {
  const lowerText = text.toLowerCase();
  const lang = locale === 'ko' ? 'ko' : 'en';
  const lexicon = SENTIMENT_LEXICON[lang];

  // Calculate polarity from lexicon
  let totalPolarity = 0;
  let wordCount = 0;
  const words = lowerText.split(/\s+/);

  for (const word of words) {
    for (const [key, value] of Object.entries(lexicon)) {
      if (word.includes(key) || key.includes(word)) {
        totalPolarity += value;
        wordCount++;
      }
    }
  }

  // Detect negation modifiers
  const negationPattern =
    lang === 'ko' ? /(안|않|없|못|아니|부정)/ : /(not|no|never|neither|nor|none|nobody|nothing)/i;

  if (negationPattern.test(text)) {
    totalPolarity *= -0.8; // Reverse polarity with negation
  }

  // Detect intensifiers
  const intensifierPattern =
    lang === 'ko' ? /(정말|진짜|너무|아주|완전|매우)/ : /(very|really|so|extremely|absolutely)/i;

  let intensity = 0.5;
  if (intensifierPattern.test(text)) {
    intensity = 0.9;
    totalPolarity *= 1.2; // Amplify polarity
  }

  // Calculate average polarity
  const polarity = wordCount > 0 ? totalPolarity / wordCount : 0;

  // Determine sentiment
  let sentiment: Sentiment;
  if (polarity > 0.2) {
    sentiment = 'positive';
  } else if (polarity < -0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // Detect specific emotion
  let emotion: Emotion = 'calm';
  let maxEmotionScore = 0;

  for (const [emotionType, config] of Object.entries(EMOTION_PATTERNS)) {
    for (const pattern of config[lang]) {
      if (pattern.test(text)) {
        const score = Math.abs(config.basePolarity);
        if (score > maxEmotionScore) {
          maxEmotionScore = score;
          emotion = emotionType as Emotion;
        }
      }
    }
  }

  // Normalize polarity to -1 to 1
  const normalizedPolarity = Math.max(-1, Math.min(1, polarity));

  // Calculate intensity based on polarity strength
  intensity = Math.min(1, Math.max(0.3, Math.abs(normalizedPolarity) + intensity / 2));

  return {
    sentiment,
    polarity: normalizedPolarity,
    emotion,
    intensity,
  };
}
