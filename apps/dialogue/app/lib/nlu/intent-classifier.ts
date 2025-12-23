/**
 * @fileoverview Intent Classification System
 *
 * Classifies user input into specific intents with confidence scores
 */

export type Intent =
  | 'question' // 질문
  | 'request' // 요청
  | 'command' // 명령
  | 'greeting' // 인사
  | 'farewell' // 작별
  | 'gratitude' // 감사
  | 'affirmation' // 긍정/동의
  | 'negation' // 부정/거절
  | 'complaint' // 불만
  | 'praise' // 칭찬
  | 'exclamation' // 감탄
  | 'statement' // 진술
  | 'suggestion' // 제안
  | 'apology' // 사과
  | 'clarification'; // 명확화 요청

export interface IntentResult {
  intent: Intent;
  confidence: number;
  subtype?: string;
}

interface IntentPattern {
  intent: Intent;
  patterns: {
    en: RegExp[];
    ko: RegExp[];
  };
  keywords: {
    en: string[];
    ko: string[];
  };
  priority: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Question patterns
  {
    intent: 'question',
    patterns: {
      en: [
        /^(what|when|where|who|why|how|which|whose)\b/i,
        /\?$/,
        /(can you|could you|would you|will you|do you|did you|have you|is it|are there)/i,
        /(tell me|show me|explain|clarify)/i,
      ],
      ko: [
        /\?$/,
        /(뭐|무엇|언제|어디|누구|왜|어떻게|어느|몇)/,
        /(~인가요?|~나요?|~ㄴ가요?|알려|설명|가르쳐)/,
      ],
    },
    keywords: {
      en: ['what', 'how', 'why', 'when', 'where', 'who'],
      ko: ['뭐', '무엇', '어떻게', '왜', '언제', '어디'],
    },
    priority: 10,
  },

  // Greeting patterns
  {
    intent: 'greeting',
    patterns: {
      en: [
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i,
        /^(what'?s up|how'?s it going|howdy)/i,
      ],
      ko: [/^(안녕|하이|헬로|좋은 아침|좋은 저녁)/, /^(어떻게 지내|잘 지내)/],
    },
    keywords: {
      en: ['hi', 'hello', 'hey', 'greetings'],
      ko: ['안녕', '하이', '헬로'],
    },
    priority: 15,
  },

  // Farewell patterns
  {
    intent: 'farewell',
    patterns: {
      en: [
        /^(bye|goodbye|see you|farewell|take care|good night)/i,
        /(talk to you later|catch you later|gotta go)/i,
      ],
      ko: [/^(잘가|안녕히|바이|굿바이|나중에 봐|잘자)/, /(가야|들어가)/],
    },
    keywords: {
      en: ['bye', 'goodbye', 'farewell'],
      ko: ['잘가', '안녕히', '바이'],
    },
    priority: 15,
  },

  // Gratitude patterns
  {
    intent: 'gratitude',
    patterns: {
      en: [/(thank|thanks|appreciate|grateful)/i, /(thx|ty|tysm)/i],
      ko: [/(고마워|감사|고맙)/],
    },
    keywords: {
      en: ['thank', 'thanks'],
      ko: ['고마워', '감사'],
    },
    priority: 14,
  },

  // Request patterns
  {
    intent: 'request',
    patterns: {
      en: [
        /(please|kindly|would you mind)/i,
        /(can you|could you|would you) .*(please)?/i,
        /(i need|i want|i would like)/i,
      ],
      ko: [/(부탁|해주|해줘|주세요|주시|바라)/, /(필요|원해|하고 싶)/],
    },
    keywords: {
      en: ['please', 'need', 'want'],
      ko: ['부탁', '주세요', '해줘'],
    },
    priority: 12,
  },

  // Command patterns
  {
    intent: 'command',
    patterns: {
      en: [/^(do|make|create|delete|remove|update|change|fix|stop|start|run)\b/i],
      ko: [/^(해|만들어|생성|삭제|제거|수정|변경|고쳐|멈춰|시작|실행)/],
    },
    keywords: {
      en: ['do', 'make', 'create', 'delete'],
      ko: ['해', '만들어', '생성', '삭제'],
    },
    priority: 11,
  },

  // Affirmation patterns
  {
    intent: 'affirmation',
    patterns: {
      en: [
        /^(yes|yeah|yep|yup|sure|okay|ok|fine|alright|absolutely|definitely|exactly|right|correct)/i,
        /^(i agree|that'?s right|sounds good)/i,
      ],
      ko: [/^(응|네|예|그래|맞아|좋아|괜찮|알겠|동의|정확|맞)/, /^(그렇|오케|오키|ㅇㅇ|ㄱㄱ)/],
    },
    keywords: {
      en: ['yes', 'okay', 'sure', 'agree'],
      ko: ['네', '응', '그래', '맞아'],
    },
    priority: 13,
  },

  // Negation patterns
  {
    intent: 'negation',
    patterns: {
      en: [
        /^(no|nope|nah|never|not really|i don'?t think so)/i,
        /^(i (disagree|refuse|decline|reject))/i,
      ],
      ko: [/^(아니|싫어|안돼|안 해|거절|거부|반대)/, /^(아냐|노|ㄴㄴ|노노|nope)/],
    },
    keywords: {
      en: ['no', 'nope', 'never', 'disagree'],
      ko: ['아니', '싫어', '안돼'],
    },
    priority: 13,
  },

  // Complaint patterns
  {
    intent: 'complaint',
    patterns: {
      en: [
        /(terrible|horrible|awful|bad|worst|useless|annoying)/i,
        /(doesn'?t work|broken|failed|error|problem|issue)/i,
      ],
      ko: [/(별로|안좋|나빠|최악|형편없|짜증|화나)/, /(안돼|고장|실패|에러|문제|이상)/],
    },
    keywords: {
      en: ['terrible', 'bad', 'problem', 'error'],
      ko: ['별로', '나빠', '문제', '에러'],
    },
    priority: 12,
  },

  // Praise patterns
  {
    intent: 'praise',
    patterns: {
      en: [
        /(great|excellent|amazing|wonderful|awesome|perfect|fantastic|brilliant)/i,
        /(well done|good job|nice work|love it)/i,
      ],
      ko: [/(좋아|훌륭|멋져|최고|완벽|대단|굉장|환상)/, /(잘했|잘해|좋네|마음에 들)/],
    },
    keywords: {
      en: ['great', 'excellent', 'amazing', 'love'],
      ko: ['좋아', '훌륭', '최고', '완벽'],
    },
    priority: 12,
  },

  // Suggestion patterns
  {
    intent: 'suggestion',
    patterns: {
      en: [
        /(i suggest|i recommend|how about|what about|why don'?t you)/i,
        /(maybe|perhaps|possibly|you could|you should)/i,
      ],
      ko: [/(제안|추천|권장|어때|어떨까|하면 어때)/, /(아마|어쩌면|~하는게|~하면)/],
    },
    keywords: {
      en: ['suggest', 'recommend', 'maybe', 'should'],
      ko: ['제안', '추천', '어때', '하면'],
    },
    priority: 11,
  },

  // Apology patterns
  {
    intent: 'apology',
    patterns: {
      en: [/(sorry|apologize|my bad|excuse me|pardon)/i],
      ko: [/(미안|죄송|실례|용서|사과)/],
    },
    keywords: {
      en: ['sorry', 'apologize'],
      ko: ['미안', '죄송'],
    },
    priority: 14,
  },

  // Exclamation patterns
  {
    intent: 'exclamation',
    patterns: {
      en: [/!$/, /(wow|oh|ah|whoa|omg|amazing|incredible)/i],
      ko: [/!$/, /(와|오|아|헐|대박|우와)/],
    },
    keywords: {
      en: ['wow', 'oh', 'amazing'],
      ko: ['와', '오', '대박'],
    },
    priority: 8,
  },

  // Clarification patterns
  {
    intent: 'clarification',
    patterns: {
      en: [
        /(what do you mean|i don'?t understand|can you explain|clarify|elaborate)/i,
        /(confused|unclear|not sure what you mean)/i,
      ],
      ko: [/(무슨 뜻|이해 못|설명|명확|자세히)/, /(헷갈|애매|잘 모르|무슨 소리)/],
    },
    keywords: {
      en: ['mean', 'understand', 'explain', 'clarify'],
      ko: ['뜻', '이해', '설명', '명확'],
    },
    priority: 11,
  },

  // Statement (default, lowest priority)
  {
    intent: 'statement',
    patterns: {
      en: [/./], // Matches anything
      ko: [/./],
    },
    keywords: {
      en: [],
      ko: [],
    },
    priority: 1,
  },
];

export function classifyIntent(text: string, locale: string): IntentResult {
  const trimmedText = text.trim();
  const lowerText = trimmedText.toLowerCase();

  const scores: Array<{ intent: Intent; score: number; priority: number }> = [];

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    const lang = locale === 'ko' ? 'ko' : 'en';

    // Check patterns
    for (const regex of pattern.patterns[lang]) {
      if (regex.test(trimmedText)) {
        score += 10;
        break; // Only count once per pattern group
      }
    }

    // Check keywords
    for (const keyword of pattern.keywords[lang]) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    // Apply priority boost
    score *= pattern.priority / 10;

    if (score > 0) {
      scores.push({
        intent: pattern.intent,
        score,
        priority: pattern.priority,
      });
    }
  }

  // Sort by score, then by priority
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.priority - a.priority;
  });

  const bestMatch = scores[0] || {
    intent: 'statement',
    score: 1,
    priority: 1,
  };

  // Calculate confidence (normalize to 0-1)
  const maxScore = 100;
  const confidence = Math.min(bestMatch.score / maxScore, 1);

  return {
    intent: bestMatch.intent,
    confidence,
  };
}
