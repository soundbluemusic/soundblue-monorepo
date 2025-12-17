import type { Locale } from "~/i18n";
import { solarToLunar, formatLunarDate } from "./lunar";
import { containsSimilarKeyword, normalizeForMatch } from "./fuzzy";
import {
  TIME_KEYWORDS,
  DATE_KEYWORDS,
  WEATHER_KEYWORDS,
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

// Main handler function
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

  return { matched: false };
}
