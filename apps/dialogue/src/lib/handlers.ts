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
  ja: [/旧暦/, /陰暦/, /太陰暦/],
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
    locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
    { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: locale !== "ja" }
  );

  if (locale === "ko") {
    const period = hours < 12 ? "오전" : "오후";
    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `지금은 ${period} ${h}시 ${minutes}분 ${seconds}초입니다. (${timeStr})`;
  } else if (locale === "ja") {
    return `現在の時刻は${hours}時${minutes}分${seconds}秒です。`;
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
    locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
    options
  );

  if (locale === "ko") {
    return `오늘은 ${dateStr}입니다.`;
  } else if (locale === "ja") {
    return `今日は${dateStr}です。`;
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
    locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
    solarOptions
  );

  if (locale === "ko") {
    return `오늘 양력 ${solarStr}은 음력으로 ${lunarStr}입니다.`;
  } else if (locale === "ja") {
    return `今日の${solarStr}は、旧暦で${lunarStr}です。`;
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
    } else if (locale === "ja") {
      return `${locationName ? locationName + "の" : ""}現在の天気：\n` +
        `🌡️ 気温: ${temp}°C\n` +
        `💧 湿度: ${humidity}%\n` +
        `💨 風速: ${windSpeed}km/h\n` +
        `☁️ 状態: ${weatherDesc}`;
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
    } else if (locale === "ja") {
      return "天気情報を取得できません。位置情報へのアクセスを許可してください。";
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
    ja: [
      "こんにちは！何かお手伝いしましょうか？",
      "はじめまして！何でも聞いてください。",
      "こんにちは！どうされましたか？",
      "やあ！何かお探しですか？",
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
    ja: [
      "どういたしまして！他にも何かあれば聞いてください。",
      "いえいえ！お役に立てて嬉しいです。",
      "どうも！また何かあればどうぞ。",
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
    ja: [
      "さようなら！またお会いしましょう。",
      "じゃあね！また来てね。",
      "またね！良い一日を！",
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
    ja: [
      "私はDialogueです！オフラインでも動作するQ&Aアシスタントです。時間、日付、天気などを聞いてください！",
      "Dialogueと言います！インターネットなしでも使える対話型アシスタントです。",
      "Dialogueです！簡単な質問にお答えするオフラインアシスタントです。",
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
    ja: [
      "こんなことが聞けます：\n• 今何時？\n• 今日は何日？\n• 天気はどう？\n• 今日の旧暦は？\n\nいつでも聞いてください！",
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
    ja: [
      "元気ですよ！何かお手伝いしましょうか？",
      "いい感じです！質問があればどうぞ。",
      "大丈夫です！何かお探しですか？",
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
    ja: [
      "はい！他に気になることはありますか？",
      "了解です！また何かあれば聞いてください。",
      "わかりました！他にも質問があればどうぞ。",
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
    ja: {
      0: "晴れ ☀️",
      1: "おおむね晴れ 🌤️",
      2: "やや曇り ⛅",
      3: "曇り ☁️",
      45: "霧 🌫️",
      48: "霧（霜） 🌫️",
      51: "霧雨 🌧️",
      53: "霧雨 🌧️",
      55: "霧雨 🌧️",
      61: "小雨 🌧️",
      63: "雨 🌧️",
      65: "大雨 🌧️",
      71: "小雪 🌨️",
      73: "雪 🌨️",
      75: "大雪 🌨️",
      80: "にわか雨 🌧️",
      81: "にわか雨 🌧️",
      82: "強いにわか雨 🌧️",
      95: "雷雨 ⛈️",
      96: "雷雨（雹） ⛈️",
      99: "雷雨（強い雹） ⛈️",
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
 * @param {Locale} locale - 현재 로케일 ('ko' | 'en' | 'ja')
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
    ja: [
      "うーん...それはちょっとわからないです。別の聞き方で試してみてください。",
      "それはまだ知らない内容です。他の質問はありますか？",
      "すみません、理解できませんでした。もう一度お願いします。",
      "それはちょっとわからないですね。時間、天気、日付などを聞いてみてください！",
    ],
  };
  return randomPick(responses[locale]);
}
