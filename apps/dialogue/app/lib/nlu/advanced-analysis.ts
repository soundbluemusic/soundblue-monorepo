/**
 * @fileoverview Advanced NLU Analysis
 *
 * Speech act analysis, reference resolution, and implicit meaning detection
 */

export type SpeechAct =
  | 'assertion'
  | 'question'
  | 'request'
  | 'promise'
  | 'threat'
  | 'suggestion'
  | 'complaint'
  | 'compliment';

export interface SpeechActResult {
  speechAct: SpeechAct;
  confidence: number;
}

export interface ReferenceResolution {
  hasReference: boolean;
  referenceType?: 'demonstrative' | 'pronoun' | 'temporal';
  resolvedValue?: string;
}

export interface ImplicitMeaning {
  isSarcastic: boolean;
  isIronic: boolean;
  isPolite: boolean;
  indirectness: number; // 0 to 1
}

// Speech Act Analysis
const SPEECH_ACT_PATTERNS: Record<SpeechAct, { en: RegExp[]; ko: RegExp[] }> = {
  assertion: {
    en: [/\b(i think|i believe|it is|this is|that is|definitely|clearly)\b/i],
    ko: [/\b(생각|믿|~이다|~입니다|확실|분명)\b/],
  },
  question: {
    en: [/\?$/, /\b(what|who|when|where|why|how|which)\b/i],
    ko: [/\?$/, /\b(뭐|누구|언제|어디|왜|어떻게|어느)\b/],
  },
  request: {
    en: [/\b(please|could you|would you|can you)\b/i],
    ko: [/\b(부탁|주세요|해주|해줘)\b/],
  },
  promise: {
    en: [/\b(i will|i promise|i guarantee|i swear)\b/i],
    ko: [/\b(할게|약속|보장|맹세)\b/],
  },
  threat: {
    en: [/\b(or else|if you don't|you better|i warn you)\b/i],
    ko: [/\b(안그러면|안하면|경고|조심)\b/],
  },
  suggestion: {
    en: [/\b(maybe|perhaps|how about|why don't you|you could)\b/i],
    ko: [/\b(아마|어쩌면|어때|~하면 어때|~할 수 있)\b/],
  },
  complaint: {
    en: [/\b(terrible|awful|hate|problem|issue|doesn't work)\b/i],
    ko: [/\b(별로|나빠|싫어|문제|이상|안돼)\b/],
  },
  compliment: {
    en: [/\b(great|excellent|amazing|wonderful|good job|well done)\b/i],
    ko: [/\b(훌륭|멋져|최고|잘했|좋아)\b/],
  },
};

export function analyzeSpeechAct(text: string, locale: string): SpeechActResult {
  const lang = locale === 'ko' ? 'ko' : 'en';
  let maxScore = 0;
  let bestAct: SpeechAct = 'assertion';

  for (const [act, patterns] of Object.entries(SPEECH_ACT_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns[lang]) {
      if (pattern.test(text)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestAct = act as SpeechAct;
    }
  }

  return {
    speechAct: bestAct,
    confidence: Math.min(maxScore / 2, 1),
  };
}

// Reference Resolution
const REFERENCE_PATTERNS = {
  en: {
    demonstrative: /\b(this|that|these|those|it)\b/i,
    pronoun: /\b(he|she|they|him|her|them|his|hers|their)\b/i,
    temporal: /\b(before|earlier|previously|last time|just now)\b/i,
  },
  ko: {
    demonstrative: /\b(그거|이거|저거|이것|그것|저것)\b/,
    pronoun: /\b(그|그녀|그들)\b/,
    temporal: /\b(전|아까|이전|저번|방금)\b/,
  },
};

export function resolveReferences(
  text: string,
  locale: string,
  recentValue?: string,
): ReferenceResolution {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const patterns = REFERENCE_PATTERNS[lang];

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return {
        hasReference: true,
        referenceType: type as ReferenceResolution['referenceType'],
        resolvedValue: recentValue,
      };
    }
  }

  return { hasReference: false };
}

// Implicit Meaning Detection
export function detectImplicitMeaning(text: string, sentiment: number): ImplicitMeaning {
  const _lowerText = text.toLowerCase();

  // Detect sarcasm: Positive words with negative context
  const positiveWords = /(great|wonderful|perfect|amazing|love it)/i;
  const negativeWords = /(terrible|awful|worst|hate|problem)/i;
  const isSarcastic =
    (positiveWords.test(text) && sentiment < -0.3) || (negativeWords.test(text) && sentiment > 0.3);

  // Detect irony: Contradiction or unexpected combination
  const isIronic = /\b(oh sure|yeah right|of course|obviously)\b/i.test(text) && sentiment < 0;

  // Detect politeness markers
  const politenessMarkers = /(please|kindly|would you mind|if you could|thank you)/i;
  const koreanPoliteness = /(주세요|부탁|감사|죄송)/;
  const isPolite = politenessMarkers.test(text) || koreanPoliteness.test(text);

  // Calculate indirectness (0 = direct, 1 = very indirect)
  let indirectness = 0;
  if (/\b(maybe|perhaps|possibly|might|could)\b/i.test(text)) indirectness += 0.3;
  if (/\b(i was wondering|if it's not too much trouble)\b/i.test(text)) indirectness += 0.4;
  if (/\b(~하면 어때|~할 수 있)\b/.test(text)) indirectness += 0.3;

  return {
    isSarcastic,
    isIronic,
    isPolite,
    indirectness: Math.min(indirectness, 1),
  };
}
