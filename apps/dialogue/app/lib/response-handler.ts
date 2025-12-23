/**
 * @fileoverview Response handler for dialogue app
 *
 * Handles time/date queries and Q&A matching
 */

import { getLocale } from '~/paraglide/runtime';

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
  const patterns = TIME_PATTERNS[locale] || TIME_PATTERNS.en;

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

/**
 * Search Q&A database for matching answer
 */
function searchQA(question: string, locale: string): string | null {
  const db = qaDatabase[locale] || qaDatabase.en;
  const lowerQuestion = question.toLowerCase();

  // Score each item
  const scored = db.items.map((item) => {
    let score = 0;

    // Check keywords
    for (const keyword of item.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // Check patterns
    if (item.patterns) {
      for (const pattern of item.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(question)) {
            score += 3;
          }
        } catch {
          // Invalid regex, skip
        }
      }
    }

    return { item, score };
  });

  // Find best match
  const bestMatch = scored.reduce(
    (best, current) => (current.score > best.score ? current : best),
    { item: null as QAItem | null, score: 0 },
  );

  // Return answer if score is good enough
  if (bestMatch.score >= 2 && bestMatch.item) {
    return bestMatch.item.answer;
  }

  return null;
}

// ========================================
// Main Response Handler
// ========================================

/**
 * Get response for user question
 *
 * Priority:
 * 1. Time/Date queries (always accurate)
 * 2. Q&A database match
 * 3. null (no answer found)
 */
export function getResponse(question: string): string | null {
  const locale = typeof getLocale === 'function' ? getLocale() : 'en';

  // 1. Check time/date queries first
  const timeResponse = checkTimeQuery(question, locale);
  if (timeResponse) {
    return timeResponse;
  }

  // 2. Search Q&A database
  const qaResponse = searchQA(question, locale);
  if (qaResponse) {
    return qaResponse;
  }

  // 3. No answer found
  return null;
}
