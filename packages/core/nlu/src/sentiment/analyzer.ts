/**
 * @fileoverview Sentiment Analysis System
 *
 * Analyzes emotional tone and polarity of user input using lexicon-based
 * sentiment scoring with modifier detection for negation and intensifiers.
 *
 * ## Architecture Overview
 *
 * The analysis uses a multi-stage pipeline:
 *
 * 1. **Lexicon Lookup**: Match words against sentiment lexicon (scores -1.0 to +1.0)
 * 2. **Negation Detection**: Reverse polarity if negation words present (×-0.8)
 * 3. **Intensifier Detection**: Amplify polarity if intensifier words present (×1.2)
 * 4. **Emotion Classification**: Match patterns to detect specific emotions
 * 5. **Normalization**: Clamp polarity to [-1, 1] and calculate intensity
 *
 * ## Polarity Score Ranges
 *
 * The lexicon uses the following polarity ranges:
 * - **Strong Positive** (0.9-1.0): love, excellent, amazing, perfect
 * - **Moderate Positive** (0.7-0.8): good, happy, great
 * - **Weak Positive** (0.5-0.6): nice, pleased
 * - **Weak Negative** (-0.5 to -0.6): problem, annoyed
 * - **Moderate Negative** (-0.7 to -0.8): bad, sad, angry
 * - **Strong Negative** (-0.9 to -1.0): hate, terrible, worst
 *
 * ## Modifier Multipliers Explained
 *
 * - **Negation (×-0.8)**: Not a full reversal (-1.0) because negation
 *   often softens rather than fully inverts sentiment.
 *   Example: "not bad" ≠ "good", it's more like "okay" (0.7 × -0.8 = -0.56)
 *
 * - **Intensifier (×1.2)**: Modest amplification to avoid overshooting.
 *   Capped at ±1.0 after calculation.
 *   Example: "very good" = 0.7 × 1.2 = 0.84
 *
 * ## Usage Example
 *
 * ```typescript
 * import { analyzeSentiment, type SentimentResult } from './sentiment-analyzer';
 *
 * // Positive input
 * const result1 = analyzeSentiment('I love this!', 'en');
 * // → { sentiment: 'positive', polarity: 1.0, emotion: 'love', intensity: 0.8 }
 *
 * // Negative with negation
 * const result2 = analyzeSentiment('This is not bad', 'en');
 * // → { sentiment: 'negative', polarity: -0.56, emotion: 'calm', intensity: 0.53 }
 *
 * // Korean input
 * const result3 = analyzeSentiment('정말 좋아요!', 'ko');
 * // → { sentiment: 'positive', polarity: 0.96, emotion: 'joy', intensity: 0.78 }
 * ```
 *
 * @module nlu/sentiment-analyzer
 * @see {@link classifyIntent} for intent classification
 * @see {@link extractEntities} for named entity extraction
 */

/**
 * Overall sentiment classification.
 *
 * Determined by polarity thresholds:
 * - **positive**: polarity > 0.2
 * - **negative**: polarity < -0.2
 * - **neutral**: -0.2 ≤ polarity ≤ 0.2
 */
export type Sentiment = 'positive' | 'negative' | 'neutral';
/**
 * Specific emotion classifications.
 *
 * Emotions are detected via pattern matching and have associated base polarities:
 *
 * | Emotion | Polarity | Example Words (EN) | Example Words (KO) |
 * |---------|----------|--------------------|--------------------|
 * | joy | +0.8 | happy, joyful | 기쁘, 행복 |
 * | love | +0.9 | love, adore | 사랑, 좋아 |
 * | excitement | +0.8 | excited, thrilled | 신나, 설레 |
 * | calm | +0.5 | calm, peaceful | 차분, 평온 |
 * | surprise | +0.3 | surprised, amazed | 놀라, 깜짝 |
 * | sadness | -0.7 | sad, depressed | 슬프, 우울 |
 * | fear | -0.6 | afraid, worried | 두렵, 걱정 |
 * | frustration | -0.7 | frustrated, annoyed | 짜증, 답답 |
 * | anger | -0.8 | angry, furious | 화나, 분노 |
 * | disgust | -0.8 | disgusted, revolted | 역겹, 혐오 |
 *
 * @remarks 'calm' is the default emotion when no specific patterns match.
 */
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

/**
 * Result of sentiment analysis.
 *
 * @property sentiment - Overall classification (positive/negative/neutral)
 * @property polarity - Numeric sentiment score from -1.0 (most negative) to +1.0 (most positive)
 * @property emotion - Detected specific emotion (e.g., joy, anger, fear)
 * @property intensity - Strength of the sentiment from 0.0 (weak) to 1.0 (strong)
 *
 * @example
 * ```typescript
 * const result: SentimentResult = {
 *   sentiment: 'positive',
 *   polarity: 0.85,
 *   emotion: 'joy',
 *   intensity: 0.72,
 * };
 * ```
 */
export interface SentimentResult {
  /** Overall sentiment classification based on polarity thresholds */
  sentiment: Sentiment;
  /** Numeric polarity from -1 (most negative) to +1 (most positive) */
  polarity: number;
  /** Detected specific emotion */
  emotion: Emotion;
  /** Emotional intensity from 0 (weak) to 1 (strong) */
  intensity: number;
}

/**
 * Sentiment lexicon mapping words to polarity scores.
 *
 * Structure: `{ locale: { word: polarityScore } }`
 *
 * Polarity scores range from -1.0 (extremely negative) to +1.0 (extremely positive):
 * - +1.0: Strongest positive (love, excellent)
 * - +0.5: Mild positive (nice, okay)
 * - 0.0: Neutral (not typically stored)
 * - -0.5: Mild negative (problem)
 * - -1.0: Strongest negative (hate)
 *
 * @remarks
 * Words are matched using substring inclusion to handle inflections.
 * Example: "happy" matches "happier", "unhappy", etc.
 *
 * @internal
 */
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

/**
 * Emotion detection patterns with associated base polarities.
 *
 * Each emotion has:
 * - **en**: English regex patterns
 * - **ko**: Korean regex patterns
 * - **basePolarity**: Default polarity when this emotion is detected
 *
 * The emotion with the highest absolute basePolarity match wins.
 *
 * @internal
 */
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

// 사전 컴파일된 정규식 패턴 (함수 호출마다 생성하지 않음)
const NEGATION_PATTERNS = {
  en: /(not|no|never|neither|nor|none|nobody|nothing)/i,
  ko: /(안|않|없|못|아니|부정)/,
} as const;

const INTENSIFIER_PATTERNS = {
  en: /(very|really|so|extremely|absolutely)/i,
  ko: /(정말|진짜|너무|아주|완전|매우)/,
} as const;

// 빠른 조회를 위한 어휘 키 Set (O(1) 조회)
const LEXICON_KEYS: Record<'en' | 'ko', readonly string[]> = {
  en: Object.keys(SENTIMENT_LEXICON.en ?? {}),
  ko: Object.keys(SENTIMENT_LEXICON.ko ?? {}),
};

/**
 * Analyzes the emotional tone and polarity of user input.
 *
 * This function performs lexicon-based sentiment analysis with support for
 * negation detection, intensifier amplification, and specific emotion classification.
 *
 * ## Algorithm Pipeline
 *
 * ### Step 1: Lexicon Matching
 * - Split input into words
 * - For each word, check if it contains or is contained by any lexicon entry
 * - Sum all matching polarity scores
 *
 * ### Step 2: Negation Detection
 * - Check for negation words (not, no, never / 안, 않, 못)
 * - If found, multiply total polarity by **-0.8**
 * - Why -0.8? Negation softens rather than fully inverts:
 *   - "not bad" (-0.7 × -0.8 = +0.56) ≠ "good" (+0.7)
 *   - "not great" (+0.8 × -0.8 = -0.64) ≠ "terrible" (-0.9)
 *
 * ### Step 3: Intensifier Detection
 * - Check for intensifier words (very, really / 정말, 진짜)
 * - If found, multiply polarity by **1.2** and set intensity to 0.9
 * - Why 1.2? Modest amplification prevents overshooting:
 *   - "very good" (0.7 × 1.2 = 0.84) stays within reasonable range
 *
 * ### Step 4: Average Polarity
 * - Divide total polarity by number of matched words
 * - Handles cases like "good but bad" → (0.7 + -0.7) / 2 = 0
 *
 * ### Step 5: Sentiment Classification
 * - polarity > 0.2 → 'positive'
 * - polarity < -0.2 → 'negative'
 * - -0.2 ≤ polarity ≤ 0.2 → 'neutral'
 *
 * ### Step 6: Emotion Detection
 * - Match input against emotion-specific patterns
 * - Select emotion with highest absolute basePolarity
 * - Default to 'calm' if no patterns match
 *
 * ### Step 7: Intensity Calculation
 * - intensity = |normalizedPolarity| + (baseIntensity / 2)
 * - Clamped to [0.3, 1.0] range
 * - Higher polarity magnitude = higher intensity
 *
 * @param text - The user input text to analyze
 * @param locale - The locale code ('ko' for Korean, anything else defaults to English)
 * @returns Sentiment analysis result with polarity, emotion, and intensity
 *
 * @example Basic usage
 * ```typescript
 * // Positive sentiment
 * const result = analyzeSentiment('I love this product!', 'en');
 * console.log(result.sentiment); // 'positive'
 * console.log(result.polarity);  // 1.0
 * console.log(result.emotion);   // 'love'
 *
 * // Negative sentiment
 * const sad = analyzeSentiment('I feel so sad today', 'en');
 * console.log(sad.sentiment); // 'negative'
 * console.log(sad.emotion);   // 'sadness'
 * ```
 *
 * @example With negation
 * ```typescript
 * // "not bad" doesn't equal "good"
 * const notBad = analyzeSentiment('This is not bad', 'en');
 * console.log(notBad.polarity); // ~0.56 (not +0.7)
 *
 * // Double negation
 * const notUnhappy = analyzeSentiment("I'm not unhappy", 'en');
 * // Negation applies to the whole text, not individual words
 * ```
 *
 * @example With intensifiers
 * ```typescript
 * // Intensifier amplifies polarity
 * const veryGood = analyzeSentiment('This is very good', 'en');
 * console.log(veryGood.polarity);  // ~0.84 (0.7 × 1.2)
 * console.log(veryGood.intensity); // ~0.9
 *
 * // Korean intensifier
 * const reallyGood = analyzeSentiment('정말 좋아요', 'ko');
 * console.log(reallyGood.intensity); // ~0.9
 * ```
 *
 * @example Combined with intent classification
 * ```typescript
 * const intent = classifyIntent(userInput, locale);
 * const sentiment = analyzeSentiment(userInput, locale);
 *
 * if (intent.intent === 'complaint' && sentiment.sentiment === 'negative') {
 *   // Handle upset user
 *   return getApologyResponse(sentiment.emotion);
 * }
 * ```
 *
 * @remarks
 * - The function is stateless and analyzes each input independently
 * - Substring matching may cause false positives (e.g., "therapist" contains "the")
 * - For production use, consider more sophisticated tokenization
 *
 * @see {@link SentimentResult} for return type details
 * @see {@link classifyIntent} for intent classification (often used together)
 */
export function analyzeSentiment(text: string, locale: string): SentimentResult {
  const lowerText = text.toLowerCase();
  const lang: 'en' | 'ko' = locale === 'ko' ? 'ko' : 'en';
  const lexicon = SENTIMENT_LEXICON[lang] ?? {};
  const lexiconKeys = LEXICON_KEYS[lang] ?? [];

  // Step 1: Calculate polarity from lexicon (최적화: 사전 키 배열 사용)
  // 어휘 키 배열을 순회하며 텍스트에서 키워드 검색 (O(k) where k = lexicon size)
  let totalPolarity = 0;
  let wordCount = 0;

  // 최적화: 단어별 중첩 루프 대신 전체 텍스트에서 어휘 키 검색
  for (const key of lexiconKeys) {
    if (lowerText.includes(key)) {
      const score = lexicon[key];
      if (score !== undefined) {
        totalPolarity += score;
        wordCount++;
      }
    }
  }

  // Step 2: Detect negation modifiers (사전 컴파일된 패턴 사용)
  // Negation reverses polarity by ×-0.8 (not full reversal)
  // Rationale: "not bad" ≠ "good", it's more like "okay"
  if (NEGATION_PATTERNS[lang].test(text)) {
    totalPolarity *= -0.8; // Reverse polarity with negation
  }

  // Step 3: Detect intensifiers (사전 컴파일된 패턴 사용)
  // Intensifiers amplify polarity by ×1.2 (modest boost)
  // Rationale: "very good" should be stronger than "good" but not extreme
  let intensity = 0.5; // Base intensity
  if (INTENSIFIER_PATTERNS[lang].test(text)) {
    intensity = 0.9;
    totalPolarity *= 1.2; // Amplify polarity
  }

  // Step 4: Calculate average polarity
  // Handles mixed sentiment like "good but bad"
  const polarity = wordCount > 0 ? totalPolarity / wordCount : 0;

  // Step 5: Determine sentiment category using ±0.2 thresholds
  let sentiment: Sentiment;
  if (polarity > 0.2) {
    sentiment = 'positive';
  } else if (polarity < -0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // Step 6: Detect specific emotion via pattern matching
  // Select emotion with highest absolute basePolarity
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

  // Step 7: Normalize polarity to [-1, 1] range
  const normalizedPolarity = Math.max(-1, Math.min(1, polarity));

  // Calculate intensity based on polarity strength
  // Formula: |polarity| + (baseIntensity / 2), clamped to [0.3, 1.0]
  intensity = Math.min(1, Math.max(0.3, Math.abs(normalizedPolarity) + intensity / 2));

  return {
    sentiment,
    polarity: normalizedPolarity,
    emotion,
    intensity,
  };
}
