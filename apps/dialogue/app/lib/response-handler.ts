/**
 * @fileoverview Response handler for dialogue app
 *
 * Handles time/date queries and Q&A matching with:
 * - Fuzzy matching (typo tolerance)
 * - Context-aware responses
 */

import { getLocale } from '~/paraglide/runtime';
import { type FuzzyQAMatchOptions, fuzzySearchQA } from './fuzzy-qa-matcher';
import {
  detectContextReference,
  enhanceResponseWithContext,
  getContextSummary,
  resolveEntityReference,
} from './nlu';

// ========================================
// Time/Date Response Handler
// ========================================

interface TimePatterns {
  time: RegExp[];
  date: RegExp[];
  day: RegExp[];
  year: RegExp[];
  month: RegExp[];
}

const TIME_PATTERNS: Record<string, TimePatterns> = {
  en: {
    time: [/what\s+time/i, /current\s+time/i, /tell\s+.*\s+time/i, /time\s+is\s+it/i, /^time$/i],
    date: [/what\s+date/i, /today'?s\s+date/i, /current\s+date/i, /tell\s+.*\s+date/i, /^date$/i],
    day: [/what\s+day/i, /today/i, /day\s+of\s+week/i],
    year: [/what\s+year/i, /current\s+year/i],
    month: [/what\s+month/i, /current\s+month/i],
  },
  ko: {
    time: [/몇\s*시/i, /시간/i, /지금\s*몇\s*시/i, /현재\s*시간/i],
    date: [/몇\s*일/i, /날짜/i, /오늘\s*날짜/i, /현재\s*날짜/i],
    day: [/무슨\s*요일/i, /오늘\s*요일/i, /요일/i],
    year: [/몇\s*년/i, /올해/i, /현재\s*년도/i],
    month: [/몇\s*월/i, /이번\s*달/i, /현재\s*월/i],
  },
};

function formatTime(locale: string): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  if (locale === 'ko') {
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}시 ${minutes}분 ${seconds}초입니다.`;
  }

  // English: 12-hour format with AM/PM
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 || 12;
  return `It's ${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}.`;
}

function formatDate(locale: string): string {
  const now = new Date();

  if (locale === 'ko') {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    return `${year}년 ${month}월 ${date}일입니다.`;
  }

  // English: Month DD, YYYY
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return `Today is ${now.toLocaleDateString('en-US', options)}.`;
}

function formatDay(locale: string): string {
  const now = new Date();
  const days = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  };

  const dayName = days[locale as keyof typeof days]?.[now.getDay()] || days.en[now.getDay()];

  if (locale === 'ko') {
    return `오늘은 ${dayName}입니다.`;
  }

  return `Today is ${dayName}.`;
}

function formatYear(locale: string): string {
  const year = new Date().getFullYear();

  if (locale === 'ko') {
    return `${year}년입니다.`;
  }

  return `It's ${year}.`;
}

function formatMonth(locale: string): string {
  const now = new Date();
  const month = now.getMonth() + 1;

  if (locale === 'ko') {
    return `${month}월입니다.`;
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `It's ${monthNames[now.getMonth()]}.`;
}

function checkTimeQuery(question: string, locale: string): string | null {
  const patterns = TIME_PATTERNS[locale] ?? TIME_PATTERNS.en;
  if (!patterns) return null;

  for (const pattern of patterns.time) {
    if (pattern.test(question)) {
      return formatTime(locale);
    }
  }

  for (const pattern of patterns.date) {
    if (pattern.test(question)) {
      return formatDate(locale);
    }
  }

  for (const pattern of patterns.day) {
    if (pattern.test(question)) {
      return formatDay(locale);
    }
  }

  for (const pattern of patterns.year) {
    if (pattern.test(question)) {
      return formatYear(locale);
    }
  }

  for (const pattern of patterns.month) {
    if (pattern.test(question)) {
      return formatMonth(locale);
    }
  }

  return null;
}

// ========================================
// Q&A Database Handler
// ========================================

export interface QAItem {
  keywords: string[];
  patterns?: string[];
  answer: string;
  category?: string;
}

export interface QADatabase {
  items: QAItem[];
}

const qaDatabase: Record<string, QADatabase> = {
  en: { items: [] },
  ko: { items: [] },
};

/**
 * Initialize Q&A database
 */
export async function initializeQA(): Promise<void> {
  try {
    const [enData, koData] = await Promise.all([
      import('../data/qa-en.json'),
      import('../data/qa-ko.json'),
    ]);

    qaDatabase.en = enData.default || enData;
    qaDatabase.ko = koData.default || koData;
  } catch (error) {
    console.warn('Failed to load Q&A database:', error);
    // Keep empty database as fallback
  }
}

// ========================================
// Language Switch Detection
// ========================================

const LANGUAGE_SWITCH_PATTERNS = {
  ko: [
    /한국어/i,
    /한글/i,
    /코리안/i,
    /korean/i,
    /한국어\s*페이지/i,
    /한국어로/i,
    /한국말/i,
    /ㅎㄱ/i,
  ],
  en: [/영어/i, /english/i, /잉글리시/i, /영어\s*페이지/i, /영어로/i, /eng/i],
};

export interface LanguageSwitchResult {
  shouldSwitch: boolean;
  targetLocale?: 'ko' | 'en';
  message?: string;
}

/**
 * Detect language switch request
 */
export function detectLanguageSwitch(
  question: string,
  currentLocale: string,
): LanguageSwitchResult {
  const lowerQuestion = question.toLowerCase().trim();

  // Check Korean switch patterns
  for (const pattern of LANGUAGE_SWITCH_PATTERNS.ko) {
    if (pattern.test(lowerQuestion)) {
      if (currentLocale !== 'ko') {
        return {
          shouldSwitch: true,
          targetLocale: 'ko',
          message: '한국어 페이지로 이동합니다...',
        };
      }
      // Already on Korean page
      return {
        shouldSwitch: false,
        message: '이미 한국어 페이지입니다.',
      };
    }
  }

  // Check English switch patterns
  for (const pattern of LANGUAGE_SWITCH_PATTERNS.en) {
    if (pattern.test(lowerQuestion)) {
      if (currentLocale !== 'en') {
        return {
          shouldSwitch: true,
          targetLocale: 'en',
          message: 'Switching to English page...',
        };
      }
      // Already on English page
      return {
        shouldSwitch: false,
        message: 'Already on English page.',
      };
    }
  }

  return { shouldSwitch: false };
}

// ========================================
// Main Response Handler
// ========================================

/**
 * Get response for user question with advanced NLU
 *
 * Priority:
 * 1. Time/Date queries (always accurate)
 * 2. Intent-based responses (greetings, gratitude, etc.)
 * 3. Fuzzy Q&A database match (typo tolerance with jamo edit distance)
 * 4. Context reference resolution (pronouns, demonstratives)
 * 5. Context-aware fallback (sentiment trend awareness)
 * 6. null (no answer found)
 */
export function getResponse(
  question: string,
  nluResult?: {
    intent: { intent: string; confidence: number };
    sentiment: { polarity: number; emotion: string };
    implicitMeaning?: { isSarcastic?: boolean; isPolite?: boolean };
  },
): string | null {
  const locale = typeof getLocale === 'function' ? getLocale() : 'en';

  // 1. Check time/date queries first
  const timeResponse = checkTimeQuery(question, locale);
  if (timeResponse) {
    return timeResponse;
  }

  // 2. Intent-based responses (if NLU provided)
  if (nluResult) {
    const intentResponse = getIntentBasedResponse(nluResult, locale);
    if (intentResponse) {
      return intentResponse;
    }
  }

  // 3. Fuzzy Q&A database search with typo tolerance
  const db = qaDatabase[locale] ?? qaDatabase.en;
  if (db?.items) {
    const fuzzyOptions: FuzzyQAMatchOptions = {
      maxDistance: 2, // Allow jamo edit distance up to 2
      locale: locale as 'ko' | 'en',
    };
    const fuzzyResult = fuzzySearchQA(question, db.items, fuzzyOptions);
    if (fuzzyResult) {
      // Get context summary for response enhancement
      const contextSummary = getContextSummary();

      // Enhance response with context (sentiment trend, topic continuity)
      const enhancedResponse = enhanceResponseWithContext(
        fuzzyResult.item.answer,
        contextSummary,
        locale,
      );
      return enhancedResponse;
    }
  }

  // 4. Context reference resolution (pronouns like "그거", "it", etc.)
  const contextSummary = getContextSummary();
  const contextRef = detectContextReference(question, contextSummary, locale);
  if (contextRef.hasReference && contextRef.referencedEntity) {
    const entityResponse = resolveEntityReference(contextRef, locale);
    if (entityResponse) {
      return entityResponse;
    }
  }

  // 5. Context-aware fallback
  if (nluResult && nluResult.intent.confidence > 0.7) {
    const fallbackResponse = getContextualFallback(nluResult, locale);
    // Enhance fallback with sentiment trend
    return enhanceResponseWithContext(fallbackResponse, contextSummary, locale);
  }

  // 6. No answer found
  return null;
}

/**
 * Generate intent-based responses
 */
function getIntentBasedResponse(
  nluResult: {
    intent: { intent: string; confidence: number };
    sentiment: { polarity: number; emotion: string };
    implicitMeaning?: { isSarcastic?: boolean; isPolite?: boolean };
  },
  locale: string,
): string | null {
  const { intent, sentiment, implicitMeaning } = nluResult;

  // Handle sarcasm
  if (implicitMeaning?.isSarcastic) {
    return locale === 'ko'
      ? '그렇게 생각하시는군요. 더 도와드릴 수 있는 게 있을까요?'
      : 'I see. Is there anything else I can help you with?';
  }

  // Intent-specific responses
  switch (intent.intent) {
    case 'greeting':
      if (sentiment.polarity > 0.5) {
        return locale === 'ko'
          ? '안녕하세요! 좋은 하루 보내고 계신가요? 무엇을 도와드릴까요?'
          : 'Hello! Having a great day? How can I help you?';
      }
      return locale === 'ko' ? '안녕하세요! 무엇을 도와드릴까요?' : 'Hello! How can I assist you?';

    case 'farewell':
      return locale === 'ko' ? '좋은 하루 되세요! 또 만나요.' : 'Have a great day! See you later.';

    case 'gratitude':
      if (implicitMeaning?.isPolite) {
        return locale === 'ko'
          ? '천만에요! 도움이 되어 정말 기쁩니다. 다른 질문이 있으시면 언제든지 물어보세요.'
          : "You're very welcome! I'm really glad I could help. Feel free to ask anything else.";
      }
      return locale === 'ko'
        ? '천만에요! 다른 질문이 있으시면 언제든지 물어보세요.'
        : "You're welcome! Feel free to ask anything else.";

    case 'apology':
      return locale === 'ko'
        ? '괜찮습니다! 걱정하지 마세요. 무엇을 도와드릴까요?'
        : "No problem at all! Don't worry about it. How can I help?";

    case 'affirmation':
      return locale === 'ko' ? '알겠습니다! 계속 진행하시겠어요?' : 'Got it! Shall we continue?';

    case 'negation':
      return locale === 'ko'
        ? '알겠습니다. 다른 방법으로 도와드릴까요?'
        : 'I understand. Can I help in a different way?';

    case 'complaint':
      if (sentiment.polarity < -0.6) {
        return locale === 'ko'
          ? '불편을 드려 정말 죄송합니다. 문제를 해결하도록 최선을 다하겠습니다. 구체적으로 어떤 문제가 있으신가요?'
          : "I'm very sorry for the inconvenience. I'll do my best to help resolve this. What specifically is the issue?";
      }
      return locale === 'ko'
        ? '문제가 있으신가요? 자세히 설명해 주시면 도와드리겠습니다.'
        : 'Is there an issue? Please tell me more so I can help.';

    case 'praise':
      return locale === 'ko'
        ? '감사합니다! 도움이 되어 기쁩니다. 다른 질문이 있으시면 말씀해 주세요.'
        : "Thank you! I'm glad I could help. Let me know if you have other questions.";

    default:
      return null;
  }
}

/**
 * Generate contextual fallback responses
 */
function getContextualFallback(
  nluResult: {
    intent: { intent: string };
    sentiment: { emotion: string };
  },
  locale: string,
): string {
  const { intent, sentiment } = nluResult;

  if (intent.intent === 'question') {
    return locale === 'ko'
      ? '흥미로운 질문이네요! 현재 제 지식 베이스에는 정확한 답변이 없지만, 다르게 질문해 주시면 도움을 드릴 수 있을 것 같습니다.'
      : "That's an interesting question! I don't have that in my knowledge base yet, but if you rephrase it, I might be able to help.";
  }

  if (sentiment.emotion === 'frustration') {
    return locale === 'ko'
      ? '답답하신 것 같네요. 다른 방식으로 도와드릴 수 있을까요?'
      : 'I sense some frustration. Can I help in a different way?';
  }

  return locale === 'ko'
    ? '관련된 답변을 찾지 못했습니다만, 계속 대화해 주세요!'
    : "I couldn't find a relevant answer, but please keep talking!";
}
