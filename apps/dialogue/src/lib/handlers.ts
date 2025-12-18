/**
 * @fileoverview 동적 쿼리 핸들러 시스템 (Dynamic Query Handler System)
 *
 * 사용자의 자연어 쿼리를 분석하여 시간, 날짜, 날씨, 음력 정보를 실시간으로 제공합니다.
 * Analyzes natural language queries and provides real-time time, date, weather, and lunar info.
 *
 * ## 매칭 우선순위 (Matching Priority)
 * 1. **Lunar (음력)** - 가장 구체적인 쿼리 (regex 기반)
 * 2. **Time (시간)** - 하이브리드 매칭 (키워드 + 퍼지)
 * 3. **Weather (날씨)** - "오늘 날씨" vs "오늘 날짜" 충돌 방지를 위해 날짜보다 먼저 체크
 * 4. **Date (날짜)** - 하이브리드 매칭 (키워드 + 퍼지)
 *
 * ## 매칭 전략 (Matching Strategy)
 * - Lunar: RegExp 패턴 매칭 (오타 발생 확률 낮음)
 * - Time/Date/Weather: 3단계 하이브리드 매칭
 *   1. 정확한 키워드 매칭 (fastest)
 *   2. 오타 패턴 매칭 (typo-patterns.ts)
 *   3. 퍼지 매칭 (fuzzy.ts - Levenshtein distance)
 *
 * @module handlers
 */

import type { Locale } from "~/i18n";
import { solarToLunar, formatLunarDate } from "./lunar";
import { containsSimilarKeyword, normalizeForMatch } from "./fuzzy";
import {
  TIME_KEYWORDS,
  DATE_KEYWORDS,
  WEATHER_KEYWORDS,
  GREETING_KEYWORDS,
  THANKS_KEYWORDS,
  BYE_KEYWORDS,
  IDENTITY_KEYWORDS,
  HELP_KEYWORDS,
  MOOD_KEYWORDS,
  AGREE_KEYWORDS,
  APOLOGY_KEYWORDS,
  COMPLIMENT_KEYWORDS,
  COMFORT_KEYWORDS,
  CONGRATS_KEYWORDS,
  DECLINE_KEYWORDS,
  REQUEST_KEYWORDS,
  SURPRISE_KEYWORDS,
  COMPLAINT_KEYWORDS,
} from "./typo-patterns";

export interface DynamicResponse {
  matched: boolean;
  response?: string;
  isAsync?: boolean;
  asyncResponse?: () => Promise<string>;
}

// ========================================
// Weather API Type Definitions
// ========================================

/** Open-Meteo API current weather response */
interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

/** Open-Meteo API response structure */
interface OpenMeteoResponse {
  current: OpenMeteoCurrentWeather;
}

/** Nominatim reverse geocoding address */
interface NominatimAddress {
  city?: string;
  town?: string;
  county?: string;
}

/** Nominatim reverse geocoding response */
interface NominatimResponse {
  address?: NominatimAddress;
}

// Lunar calendar patterns (kept as regex - less prone to typos)
const LUNAR_PATTERNS = {
  ko: [/음력/, /구정/, /한가위/, /추석/],
  en: [/lunar/i, /chinese\s*calendar/i],
};

/**
 * Check if query matches any regex patterns (for lunar)
 */
function matchesPatterns(query: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(query));
}

/**
 * Hybrid matching: exact keywords -> typo patterns -> fuzzy match
 * 하이브리드 매칭: 정확한 키워드 -> 오타 패턴 -> 퍼지 매칭
 */
function matchesKeywords(query: string, keywords: string[]): boolean {
  const normalized = normalizeForMatch(query);

  // Step 1: Direct keyword match (fastest)
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeForMatch(keyword);
    if (normalized.includes(normalizedKeyword)) {
      return true;
    }
  }

  // Step 2: Fuzzy match with typo tolerance
  return containsSimilarKeyword(query, keywords);
}

// Time response generator
function getTimeResponse(locale: Locale): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const timeStr = now.toLocaleTimeString(
    locale === "ko" ? "ko-KR" : "en-US",
    { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }
  );

  if (locale === "ko") {
    const period = hours < 12 ? "오전" : "오후";
    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `지금은 ${period} ${h}시 ${minutes}분 ${seconds}초입니다. (${timeStr})`;
  } else {
    const period = hours < 12 ? "AM" : "PM";
    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `It's currently ${h}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}.`;
  }
}

// Date response generator
function getDateResponse(locale: Locale): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  const dateStr = now.toLocaleDateString(
    locale === "ko" ? "ko-KR" : "en-US",
    options
  );

  if (locale === "ko") {
    return `오늘은 ${dateStr}입니다.`;
  } else {
    return `Today is ${dateStr}.`;
  }
}

// Lunar date response generator
function getLunarDateResponse(locale: Locale): string {
  const now = new Date();
  const lunar = solarToLunar(now);
  const lunarStr = formatLunarDate(lunar, locale);

  const solarOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const solarStr = now.toLocaleDateString(
    locale === "ko" ? "ko-KR" : "en-US",
    solarOptions
  );

  if (locale === "ko") {
    return `오늘 양력 ${solarStr}은 음력으로 ${lunarStr}입니다.`;
  } else {
    return `Today (${solarStr}) is ${lunarStr} in the lunar calendar.`;
  }
}

// Weather response generator (async - uses Geolocation + OpenMeteo API)
async function getWeatherResponse(locale: Locale): Promise<string> {
  try {
    // Get user's location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      });
    });

    const { latitude, longitude } = position.coords;

    // Validate coordinates
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Invalid coordinates");
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error("Coordinates out of range");
    }

    // Fetch weather from Open-Meteo (free, no API key needed) - using URL constructor for safety
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(latitude));
    weatherUrl.searchParams.set("longitude", String(longitude));
    weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    weatherUrl.searchParams.set("timezone", "auto");

    const response = await fetch(weatherUrl.toString());
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);

    const data: OpenMeteoResponse = await response.json();
    const current = data.current;

    const temp = Math.round(current.temperature_2m);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);
    const weatherCode = current.weather_code;

    const weatherDesc = getWeatherDescription(weatherCode, locale);

    // Get location name using reverse geocoding - using URL constructor for safety
    const geoUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    geoUrl.searchParams.set("lat", String(latitude));
    geoUrl.searchParams.set("lon", String(longitude));
    geoUrl.searchParams.set("format", "json");
    geoUrl.searchParams.set("accept-language", locale);
    let locationName = "";
    try {
      const geoResponse = await fetch(geoUrl.toString());
      const geoData: NominatimResponse = await geoResponse.json();
      locationName = geoData.address?.city || geoData.address?.town || geoData.address?.county || "";
    } catch {
      locationName = "";
    }

    if (locale === "ko") {
      return `${locationName ? locationName + "의 " : ""}현재 날씨입니다:\n` +
        `🌡️ 기온: ${temp}°C\n` +
        `💧 습도: ${humidity}%\n` +
        `💨 바람: ${windSpeed}km/h\n` +
        `☁️ 상태: ${weatherDesc}`;
    } else {
      return `Current weather${locationName ? " in " + locationName : ""}:\n` +
        `🌡️ Temperature: ${temp}°C\n` +
        `💧 Humidity: ${humidity}%\n` +
        `💨 Wind: ${windSpeed}km/h\n` +
        `☁️ Condition: ${weatherDesc}`;
    }
  } catch (_error: unknown) {
    if (locale === "ko") {
      return "날씨 정보를 가져올 수 없습니다. 위치 접근 권한을 허용해주세요.";
    } else {
      return "Unable to get weather information. Please allow location access.";
    }
  }
}

// ========================================
// Conversational Response Generators
// ========================================

/** Random picker utility */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Greeting response generator
function getGreetingResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "안녕하세요! 무엇이 궁금하신가요?",
      "반가워요! 도움이 필요하시면 말씀하세요.",
      "안녕하세요! 무엇을 도와드릴까요?",
      "반갑습니다! 궁금한 게 있으시면 물어보세요.",
    ],
    en: [
      "Hello! How can I help you?",
      "Hi there! Feel free to ask anything.",
      "Hey! What can I do for you?",
      "Hello! What would you like to know?",
    ],
  };
  return randomPick(responses[locale]);
}

// Thanks response generator
function getThanksResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "천만에요! 더 궁금한 거 있으시면 말씀하세요.",
      "별말씀을요! 도움이 되었다니 기뻐요.",
      "감사는요~ 언제든 물어보세요!",
    ],
    en: [
      "You're welcome! Let me know if you need anything else.",
      "No problem! Happy to help.",
      "Anytime! Feel free to ask more questions.",
    ],
  };
  return randomPick(responses[locale]);
}

// Goodbye response generator
function getByeResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "안녕히 가세요! 다음에 또 만나요.",
      "잘 가요! 또 놀러 오세요~",
      "다음에 또 봐요! 좋은 하루 되세요.",
    ],
    en: [
      "Goodbye! See you next time.",
      "Bye! Come back anytime.",
      "Take care! Have a great day.",
    ],
  };
  return randomPick(responses[locale]);
}

// Identity response generator
function getIdentityResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "저는 Dialogue예요! 오프라인에서도 작동하는 Q&A 도우미입니다. 시간, 날짜, 날씨 등을 물어보세요!",
      "Dialogue라고 해요! 인터넷 없이도 사용할 수 있는 대화형 도우미예요.",
      "저는 Dialogue! 간단한 질문에 답변해 드리는 오프라인 도우미입니다.",
    ],
    en: [
      "I'm Dialogue! An offline Q&A assistant. You can ask me about time, date, weather, and more!",
      "I'm Dialogue, a conversational assistant that works offline. Feel free to ask questions!",
      "Call me Dialogue! I'm here to help answer your questions, even without internet.",
    ],
  };
  return randomPick(responses[locale]);
}

// Help response generator
function getHelpResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "저한테 이런 걸 물어볼 수 있어요:\n• 지금 몇 시야?\n• 오늘 며칠이야?\n• 날씨 어때?\n• 오늘 음력으로 며칠이야?\n\n언제든 질문하세요!",
    ],
    en: [
      "You can ask me things like:\n• What time is it?\n• What's today's date?\n• How's the weather?\n• What's today in lunar calendar?\n\nFeel free to ask!",
    ],
  };
  return randomPick(responses[locale]);
}

// Mood response generator
function getMoodResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "저는 잘 지내고 있어요! 도움이 필요하시면 말씀하세요.",
      "좋아요! 오늘도 열심히 답변할 준비가 되어 있어요.",
      "괜찮아요! 뭐가 궁금하세요?",
    ],
    en: [
      "I'm doing great! Let me know if you need any help.",
      "All good here! Ready to answer your questions.",
      "I'm fine! What can I help you with?",
    ],
  };
  return randomPick(responses[locale]);
}

// Agree response generator
function getAgreeResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "네! 더 궁금한 거 있으세요?",
      "알겠어요! 또 물어보실 거 있으면 말씀하세요.",
      "좋아요! 다른 질문 있으시면 언제든지요.",
    ],
    en: [
      "Got it! Anything else you'd like to know?",
      "Alright! Let me know if you have more questions.",
      "Okay! Feel free to ask anything else.",
    ],
  };
  return randomPick(responses[locale]);
}

// Apology response generator
function getApologyResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "괜찮아요! 사과할 일 아니에요.",
      "아니에요, 전혀요! 신경 쓰지 마세요.",
      "괜찮습니다! 무엇을 도와드릴까요?",
    ],
    en: [
      "No worries! Nothing to apologize for.",
      "It's okay! Don't worry about it.",
      "That's alright! How can I help you?",
    ],
  };
  return randomPick(responses[locale]);
}

// Compliment response generator
function getComplimentResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "감사합니다! 칭찬해주셔서 기뻐요.",
      "고마워요! 더 열심히 할게요.",
      "와, 감사해요! 도움이 되었다니 보람있네요.",
    ],
    en: [
      "Thank you! That means a lot.",
      "Thanks! I appreciate the kind words.",
      "Wow, thanks! Happy I could help.",
    ],
  };
  return randomPick(responses[locale]);
}

// Comfort response generator
function getComfortResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "힘내세요! 잘 될 거예요.",
      "괜찮아요, 다 잘 될 거예요. 언제든 이야기해요.",
      "힘들 땐 쉬어가도 괜찮아요. 응원할게요!",
    ],
    en: [
      "Hang in there! Things will get better.",
      "It's okay, you got this! I'm here if you need to talk.",
      "Take it easy. I'm rooting for you!",
    ],
  };
  return randomPick(responses[locale]);
}

// Congrats response generator
function getCongratsResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "축하해주셔서 감사합니다! 🎉",
      "와, 고마워요! 정말 기쁘네요.",
      "감사합니다! 좋은 소식이에요!",
    ],
    en: [
      "Thanks for the congrats! 🎉",
      "Wow, thank you! That's so kind.",
      "Thanks! Great news indeed!",
    ],
  };
  return randomPick(responses[locale]);
}

// Decline response generator
function getDeclineResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "알겠어요! 필요하시면 언제든 말씀하세요.",
      "네, 괜찮아요! 다른 게 필요하면 불러주세요.",
      "알겠습니다! 다음에 도움이 필요하시면 말씀해주세요.",
    ],
    en: [
      "Got it! Let me know if you need anything later.",
      "Okay! Feel free to reach out anytime.",
      "Understood! I'm here if you change your mind.",
    ],
  };
  return randomPick(responses[locale]);
}

// Request response generator
function getRequestResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "물론이죠! 무엇을 도와드릴까요?",
      "네, 말씀하세요! 최선을 다해 도와드릴게요.",
      "도와드릴게요! 어떤 게 필요하세요?",
    ],
    en: [
      "Of course! What do you need help with?",
      "Sure thing! Tell me what you need.",
      "I'd be happy to help! What can I do for you?",
    ],
  };
  return randomPick(responses[locale]);
}

// Surprise response generator
function getSurpriseResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "그러게요! 놀랍죠?",
      "맞아요, 저도 놀랐어요!",
      "와, 정말요? 대단하네요!",
    ],
    en: [
      "I know right! Surprising, isn't it?",
      "Yes, that's quite something!",
      "Wow, really? That's amazing!",
    ],
  };
  return randomPick(responses[locale]);
}

// Complaint response generator
function getComplaintResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "아이고, 속상하셨겠어요. 괜찮으세요?",
      "그럴 수 있어요. 잠시 쉬어가는 건 어때요?",
      "힘드시죠... 뭐든 이야기해주세요.",
    ],
    en: [
      "I hear you. That sounds frustrating.",
      "That's understandable. Want to talk about it?",
      "I'm sorry to hear that. How can I help?",
    ],
  };
  return randomPick(responses[locale]);
}

// WMO Weather interpretation codes
function getWeatherDescription(code: number, locale: Locale): string {
  const descriptions: Record<string, Record<number, string>> = {
    ko: {
      0: "맑음 ☀️",
      1: "대체로 맑음 🌤️",
      2: "약간 흐림 ⛅",
      3: "흐림 ☁️",
      45: "안개 🌫️",
      48: "안개 (서리) 🌫️",
      51: "이슬비 🌧️",
      53: "이슬비 🌧️",
      55: "이슬비 🌧️",
      61: "약한 비 🌧️",
      63: "비 🌧️",
      65: "강한 비 🌧️",
      71: "약한 눈 🌨️",
      73: "눈 🌨️",
      75: "강한 눈 🌨️",
      80: "소나기 🌧️",
      81: "소나기 🌧️",
      82: "강한 소나기 🌧️",
      95: "뇌우 ⛈️",
      96: "뇌우 (우박) ⛈️",
      99: "뇌우 (강한 우박) ⛈️",
    },
    en: {
      0: "Clear sky ☀️",
      1: "Mainly clear 🌤️",
      2: "Partly cloudy ⛅",
      3: "Overcast ☁️",
      45: "Fog 🌫️",
      48: "Depositing rime fog 🌫️",
      51: "Light drizzle 🌧️",
      53: "Moderate drizzle 🌧️",
      55: "Dense drizzle 🌧️",
      61: "Light rain 🌧️",
      63: "Moderate rain 🌧️",
      65: "Heavy rain 🌧️",
      71: "Light snow 🌨️",
      73: "Moderate snow 🌨️",
      75: "Heavy snow 🌨️",
      80: "Light showers 🌧️",
      81: "Moderate showers 🌧️",
      82: "Violent showers 🌧️",
      95: "Thunderstorm ⛈️",
      96: "Thunderstorm with hail ⛈️",
      99: "Thunderstorm with heavy hail ⛈️",
    },
  };

  return descriptions[locale]?.[code] || descriptions.en[code] || `Unknown (${code})`;
}

/**
 * 사용자 쿼리를 분석하여 동적 응답을 생성합니다.
 * Analyzes user query and generates dynamic response.
 *
 * ## 매칭 우선순위 (Matching Priority)
 * 1. Lunar (음력) - regex 패턴 매칭
 * 2. Time (시간) - 하이브리드 매칭
 * 3. Weather (날씨) - 하이브리드 매칭 (비동기)
 * 4. Date (날짜) - 하이브리드 매칭
 *
 * @param {string} query - 사용자 입력 쿼리
 * @param {Locale} locale - 현재 로케일 ('ko' | 'en')
 * @returns {DynamicResponse} 매칭 결과 및 응답
 *
 * @example
 * // 시간 쿼리 (Time query)
 * handleDynamicQuery("지금 몇 시야?", "ko");
 * // { matched: true, response: "지금은 오후 3시 25분 10초입니다. (03:25:10 PM)" }
 *
 * @example
 * // 날씨 쿼리 (Weather query) - 비동기 응답
 * const result = handleDynamicQuery("오늘 날씨 어때?", "ko");
 * // { matched: true, isAsync: true, asyncResponse: [Function] }
 * if (result.isAsync && result.asyncResponse) {
 *   const weather = await result.asyncResponse();
 *   // "서울의 현재 날씨입니다:\n🌡️ 기온: 15°C\n💧 습도: 45%\n..."
 * }
 *
 * @example
 * // 음력 쿼리 (Lunar query)
 * handleDynamicQuery("오늘 음력으로 며칠이야?", "ko");
 * // { matched: true, response: "오늘 양력 2024년 12월 17일은 음력으로 11월 17일입니다." }
 *
 * @example
 * // 날짜 쿼리 (Date query)
 * handleDynamicQuery("오늘 무슨 요일이야?", "ko");
 * // { matched: true, response: "오늘은 2024년 12월 17일 화요일입니다." }
 *
 * @example
 * // 매칭 실패 (No match)
 * handleDynamicQuery("안녕하세요", "ko");
 * // { matched: false }
 */
export function handleDynamicQuery(query: string, locale: Locale): DynamicResponse {
  // Check for lunar date (most specific first - uses regex)
  if (matchesPatterns(query, LUNAR_PATTERNS[locale])) {
    return {
      matched: true,
      response: getLunarDateResponse(locale),
    };
  }

  // Check for time (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, TIME_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getTimeResponse(locale),
    };
  }

  // Check for weather (hybrid keyword + fuzzy matching)
  // 날씨를 날짜보다 먼저 체크 ("오늘 날씨" vs "오늘 날짜" 충돌 방지)
  if (matchesKeywords(query, WEATHER_KEYWORDS[locale])) {
    return {
      matched: true,
      isAsync: true,
      asyncResponse: () => getWeatherResponse(locale),
    };
  }

  // Check for date (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, DATE_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getDateResponse(locale),
    };
  }

  // Check for identity (hybrid keyword + fuzzy matching) - before greeting to prevent "your name" -> "yo"
  if (matchesKeywords(query, IDENTITY_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getIdentityResponse(locale),
    };
  }

  // Check for help (hybrid keyword + fuzzy matching) - before greeting for specificity
  if (matchesKeywords(query, HELP_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getHelpResponse(locale),
    };
  }

  // Check for thanks (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, THANKS_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getThanksResponse(locale),
    };
  }

  // Check for goodbye (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, BYE_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getByeResponse(locale),
    };
  }

  // Check for mood (hybrid keyword + fuzzy matching) - before greeting for specificity
  if (matchesKeywords(query, MOOD_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getMoodResponse(locale),
    };
  }

  // Check for greeting (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, GREETING_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getGreetingResponse(locale),
    };
  }

  // Check for agreement (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, AGREE_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getAgreeResponse(locale),
    };
  }

  // Check for apology (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, APOLOGY_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getApologyResponse(locale),
    };
  }

  // Check for compliment (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, COMPLIMENT_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getComplimentResponse(locale),
    };
  }

  // Check for comfort (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, COMFORT_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getComfortResponse(locale),
    };
  }

  // Check for congrats (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, CONGRATS_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getCongratsResponse(locale),
    };
  }

  // Check for decline (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, DECLINE_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getDeclineResponse(locale),
    };
  }

  // Check for request (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, REQUEST_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getRequestResponse(locale),
    };
  }

  // Check for surprise (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, SURPRISE_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getSurpriseResponse(locale),
    };
  }

  // Check for complaint (hybrid keyword + fuzzy matching)
  if (matchesKeywords(query, COMPLAINT_KEYWORDS[locale])) {
    return {
      matched: true,
      response: getComplaintResponse(locale),
    };
  }

  return { matched: false };
}

/**
 * 매칭 실패 시 친근한 폴백 응답을 반환합니다.
 * Returns a friendly fallback response when no match is found.
 */
export function getFallbackResponse(locale: Locale): string {
  const responses: Record<Locale, string[]> = {
    ko: [
      "음... 잘 모르겠어요. 다르게 물어봐 주시겠어요?",
      "그건 제가 아직 모르는 내용이에요. 다른 질문 있으신가요?",
      "죄송해요, 이해하지 못했어요. 다시 한번 말씀해 주세요.",
      "흠, 그건 잘 모르겠네요. 시간, 날씨, 날짜 같은 걸 물어보시면 잘 답해드릴 수 있어요!",
    ],
    en: [
      "Hmm... I'm not sure about that. Could you ask differently?",
      "I don't know that yet. Do you have another question?",
      "Sorry, I didn't understand. Could you try again?",
      "I'm not sure about that one. Try asking about time, weather, or dates!",
    ],
  };
  return randomPick(responses[locale]);
}
