import { describe, expect, it } from "vitest";
import { handleDynamicQuery } from "./handlers";

describe("handleDynamicQuery", () => {
  describe("Time queries - Korean", () => {
    const timeQueries = [
      // 정상
      "몇시",
      "몇 시",
      "지금 몇시",
      "현재 시간",
      // 구어체
      "몇시야",
      "몇시임",
      "몇시에요",
      // 띄어쓰기 없음
      "지금몇시",
      "현재시간",
      // 오타
      "몃시",
      "먓시",
      "몇쉬",
    ];

    for (const query of timeQueries) {
      it(`should match time query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
        expect(result.response).toContain("시");
      });
    }
  });

  describe("Time queries - English", () => {
    const timeQueries = [
      // 정상
      "what time",
      "current time",
      "time now",
      // 변형
      "what time is it",
      "whats the time",
      // 오타
      "wht time",
      "waht time",
    ];

    for (const query of timeQueries) {
      it(`should match time query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Time queries - Japanese", () => {
    const timeQueries = [
      // 정상
      "何時",
      "今何時",
      "時間",
      // 히라가나
      "なんじ",
      "いまなんじ",
    ];

    for (const query of timeQueries) {
      it(`should match time query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Date queries - Korean", () => {
    const dateQueries = [
      // 정상 (날씨와 혼동 없는 키워드)
      "무슨 요일",
      "며칠이야",
      "몇월 며칠",
      // 띄어쓰기 없음
      "오늘며칠",
      "무슨요일",
      // 오타
      "머칠",
    ];

    for (const query of dateQueries) {
      it(`should match date query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Date queries - English", () => {
    const dateQueries = [
      // 정상
      "what date",
      "what day",
      // 변형
      "what is the date",
      "todays date",
      // 오타
      "wht date",
      "todya",
    ];

    for (const query of dateQueries) {
      it(`should match date query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Date queries - Japanese", () => {
    const dateQueries = [
      // 정상
      "何日",
      "何曜日",
      "日付",
      // 히라가나
      "なんにち",
      "なんようび",
    ];

    for (const query of dateQueries) {
      it(`should match date query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Weather queries - Korean", () => {
    const weatherQueries = [
      // 정상
      "날씨",
      "오늘 날씨",
      "기온",
      // 띄어쓰기 없음
      "오늘날씨",
      "지금날씨",
      // 구어체
      "날씨 어때",
      "날씨어때",
      // 오타
      "날시",
    ];

    for (const query of weatherQueries) {
      it(`should match weather query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
        expect(result.isAsync).toBe(true);
        expect(result.asyncResponse).toBeDefined();
      });
    }
  });

  describe("Weather queries - English", () => {
    const weatherQueries = [
      // 정상
      "weather",
      "temperature",
      // 변형
      "hows the weather",
      "weather today",
      // 오타
      "wether",
      "wheather",
    ];

    for (const query of weatherQueries) {
      it(`should match weather query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
        expect(result.isAsync).toBe(true);
      });
    }
  });

  describe("Weather queries - Japanese", () => {
    const weatherQueries = [
      // 정상
      "天気",
      "気温",
      // 히라가나
      "てんき",
      "きおん",
      // 변형
      "今日の天気",
    ];

    for (const query of weatherQueries) {
      it(`should match weather query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
        expect(result.isAsync).toBe(true);
      });
    }
  });

  describe("Non-matching queries", () => {
    const nonMatchingQueries = [
      "hello",
      "안녕하세요",
      "こんにちは",
      "random text",
      "음악 추천해줘",
    ];

    for (const query of nonMatchingQueries) {
      it(`should not match unrelated query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(false);
      });
    }
  });
});
