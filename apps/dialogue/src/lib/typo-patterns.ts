/**
 * Typo-tolerant keyword patterns for time, date, and weather queries
 * 시간, 날짜, 날씨 쿼리를 위한 오타 허용 키워드 패턴
 */

import type { Locale } from "~/i18n";

/**
 * Time-related keywords and common typos
 * 시간 관련 키워드 및 흔한 오타
 */
export const TIME_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 정상
    "몇시",
    "몇 시",
    "시간",
    "지금 몇시",
    "현재 시간",
    "지금 시간",
    // 구어체/변형
    "몇시야",
    "몇시임",
    "몇시에요",
    "몇시예요",
    "몇시죠",
    "시간이 몇",
    "시간 몇",
    "지금몇시",
    "현재시간",
    "지금시간",
    "몇 시야",
    "몇 시임",
    "몇 시에요",
    // 흔한 오타
    "몃시",
    "먓시",
    "몇쉬",
    "몇씨",
    "멷시",
    "멯시",
    "시깐",
    "싴간",
  ],
  en: [
    // 정상
    "what time",
    "current time",
    "time now",
    "the time",
    "what's the time",
    "whats the time",
    // 변형
    "time please",
    "tell me the time",
    "what time is it",
    "time?",
    // 흔한 오타
    "wht time",
    "waht time",
    "whta time",
    "wat time",
    "tiem",
    "timw",
    "curent time",
    "currnet time",
  ],
  ja: [
    // 정상
    "何時",
    "今何時",
    "時間",
    "現在時刻",
    "今の時間",
    // 히라가나
    "なんじ",
    "いまなんじ",
    "じかん",
    "いまのじかん",
    // 변형
    "何時ですか",
    "今何時ですか",
    "時間は",
  ],
};

/**
 * Date/Day-related keywords and common typos
 * 날짜/요일 관련 키워드 및 흔한 오타
 * NOTE: 단독 "오늘", "today", "今日"는 날씨 쿼리와 충돌하므로 제외
 */
export const DATE_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 정상 (날짜/요일 관련 핵심 키워드)
    "며칠",
    "몇일",
    "날짜",
    "요일",
    "무슨 요일",
    "몇 월",
    "몇월",
    // 구어체/변형
    "오늘 며칠",
    "오늘며칠",
    "오늘 몇일",
    "오늘몇일",
    "무슨요일",
    "오늘이 며칠",
    "오늘이며칠",
    "몇월 며칠",
    "몇월며칠",
    "날짜가 며칠",
    "오늘 무슨 요일",
    "오늘무슨요일",
    // 흔한 오타
    "머칠",
    "먀칠",
    "며친",
    "날자",
    "낧짜",
    "요린",
    "욜일",
  ],
  en: [
    // 정상 (날짜/요일 관련 핵심 키워드)
    "what date",
    "what day",
    "current date",
    "the date",
    "today's date",
    "todays date",
    // 변형
    "what is the date",
    "what is today",
    "what day is it",
    "date please",
    // 흔한 오타
    "wht date",
    "waht date",
    "whta date",
    "wat date",
    "wht day",
    "waht day",
    "todya",
    "toaday",
    "toady",
    "curent date",
  ],
  ja: [
    // 정상 (날짜/요일 관련 핵심 키워드)
    "何日",
    "何曜日",
    "日付",
    "今日の日付",
    "何月何日",
    // 히라가나
    "なんにち",
    "なんようび",
    "ひづけ",
    // 변형
    "今日は何日",
    "今日は何曜日",
    "何日ですか",
    "何曜日ですか",
  ],
};

/**
 * Weather-related keywords and common typos
 * 날씨 관련 키워드 및 흔한 오타
 */
export const WEATHER_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 정상
    "날씨",
    "기온",
    "온도",
    "비",
    "눈",
    "맑음",
    "흐림",
    // 구어체/변형
    "날씨 어때",
    "날씨어때",
    "오늘 날씨",
    "오늘날씨",
    "지금 날씨",
    "지금날씨",
    "현재 날씨",
    "현재날씨",
    "비 오나",
    "비오나",
    "눈 오나",
    "눈오나",
    "비 와",
    "비와",
    "눈 와",
    "눈와",
    "춥나",
    "더우나",
    "덥나",
    "추워",
    "더워",
    // 흔한 오타
    "날시",
    "낧씨",
    "날씨",
    "기운",
    "긴온",
    "온돋",
  ],
  en: [
    // 정상
    "weather",
    "temperature",
    "rain",
    "snow",
    "sunny",
    "cloudy",
    "forecast",
    // 변형
    "how's the weather",
    "hows the weather",
    "howstheweather",
    "what's the weather",
    "whats the weather",
    "whatstheweather",
    "weather today",
    "weathertoday",
    "today weather",
    "todayweather",
    "current weather",
    "currentweather",
    "is it raining",
    "is it snowing",
    "is it cold",
    "is it hot",
    // 흔한 오타
    "wether",
    "wheather",
    "waether",
    "weahter",
    "weatehr",
    "temprature",
    "temperture",
    "forcast",
    "forecats",
  ],
  ja: [
    // 정상
    "天気",
    "気温",
    "温度",
    "雨",
    "雪",
    "晴れ",
    "曇り",
    // 히라가나
    "てんき",
    "きおん",
    "おんど",
    "あめ",
    "ゆき",
    "はれ",
    "くもり",
    // 변형
    "天気どう",
    "今日の天気",
    "今の天気",
    "天気は",
    "雨降る",
    "雪降る",
    "寒い",
    "暑い",
    // 카타카나 (외래어)
    "ウェザー",
  ],
};

/**
 * Get all keywords for a specific type and locale
 * 특정 유형 및 로케일에 대한 모든 키워드 가져오기
 */
export function getKeywords(
  type: "time" | "date" | "weather",
  locale: Locale,
): string[] {
  switch (type) {
    case "time":
      return TIME_KEYWORDS[locale];
    case "date":
      return DATE_KEYWORDS[locale];
    case "weather":
      return WEATHER_KEYWORDS[locale];
  }
}
