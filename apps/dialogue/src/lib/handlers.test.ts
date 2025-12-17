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

  describe("Greeting queries - Korean", () => {
    const greetingQueries = [
      "안녕",
      "안녕하세요",
      "반가워",
      "반갑다",
      "ㅎㅇ",
      "방가",
      "하이",
    ];

    for (const query of greetingQueries) {
      it(`should match greeting query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Greeting queries - English", () => {
    const greetingQueries = [
      "hello",
      "hi",
      "hey",
      "sup",
      "helo", // 오타
      "hii", // 오타
    ];

    for (const query of greetingQueries) {
      it(`should match greeting query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Greeting queries - Japanese", () => {
    const greetingQueries = [
      "こんにちは",
      "おはよう",
      "やあ",
      "ども",
      "こんちは", // 변형
    ];

    for (const query of greetingQueries) {
      it(`should match greeting query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
        expect(result.response).toBeDefined();
      });
    }
  });

  describe("Thanks queries - All languages", () => {
    it("should match Korean thanks", () => {
      const queries = ["고마워", "감사합니다", "ㄱㅅ", "땡큐"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English thanks", () => {
      const queries = ["thanks", "thank you", "thx", "ty"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese thanks", () => {
      const queries = ["ありがとう", "サンキュー", "あざす"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Identity queries - All languages", () => {
    it("should match Korean identity", () => {
      const queries = ["너뭐냐", "누구야", "뭐야", "자기소개"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
        expect(result.response).toContain("Dialogue");
      }
    });

    it("should match English identity", () => {
      // Note: "what are you" conflicts with TIME ("what time") due to fuzzy matching
      const queries = ["who are you", "introduce yourself", "tell me about yourself"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
        expect(result.response).toContain("Dialogue");
      }
    });

    it("should match Japanese identity", () => {
      const queries = ["あなたは誰", "何者", "自己紹介"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
        expect(result.response).toContain("Dialogue");
      }
    });
  });

  describe("Bye queries - All languages", () => {
    it("should match Korean bye", () => {
      const queries = ["잘가", "바이", "ㅂㅂ", "또봐"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English bye", () => {
      const queries = ["bye", "goodbye", "see ya", "later"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese bye", () => {
      const queries = ["さようなら", "じゃあね", "またね", "バイバイ"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Help queries - All languages", () => {
    it("should match Korean help", () => {
      const queries = ["도와줘", "뭐할수있어", "사용법"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English help", () => {
      const queries = ["help", "what can you do", "how to use"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese help", () => {
      const queries = ["助けて", "何ができる", "使い方"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Mood queries - All languages", () => {
    it("should match Korean mood", () => {
      const queries = ["잘지내", "뭐해", "어때"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English mood", () => {
      const queries = ["how are you", "how r u", "you ok"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese mood", () => {
      const queries = ["元気", "調子どう", "大丈夫"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Agree queries - All languages", () => {
    it("should match Korean agree", () => {
      const queries = ["ㅇㅇ", "ㅇㅋ", "알겠어", "응"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English agree", () => {
      const queries = ["ok", "okay", "got it", "yes"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese agree", () => {
      const queries = ["わかった", "うん", "はい", "了解"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Apology queries - All languages", () => {
    it("should match Korean apology", () => {
      const queries = ["미안해", "죄송합니다", "ㅈㅅ", "쏘리"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English apology", () => {
      const queries = ["sorry", "my bad", "sry", "oops"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese apology", () => {
      const queries = ["ごめん", "すみません", "すまん"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Compliment queries - All languages", () => {
    it("should match Korean compliment", () => {
      const queries = ["잘했어", "대단해", "최고", "짱"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English compliment", () => {
      const queries = ["good job", "well done", "awesome", "amazing"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese compliment", () => {
      const queries = ["すごい", "さすが", "上手"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Comfort queries - All languages", () => {
    it("should match Korean comfort", () => {
      const queries = ["힘내", "힘들어", "슬퍼", "ㅠㅠ"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English comfort", () => {
      const queries = ["tired", "sad", "stressed", "hang in there"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese comfort", () => {
      const queries = ["疲れた", "辛い", "しんどい"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Congrats queries - All languages", () => {
    it("should match Korean congrats", () => {
      const queries = ["축하해", "ㅊㅋ", "추카추카"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English congrats", () => {
      const queries = ["congrats", "congratulations", "way to go"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese congrats", () => {
      const queries = ["おめでとう", "おめ", "やったね"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Decline queries - All languages", () => {
    it("should match Korean decline", () => {
      const queries = ["싫어", "됐어", "ㄴㄴ", "노땡스"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English decline", () => {
      const queries = ["nope", "no thanks", "pass", "im good"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese decline", () => {
      const queries = ["いや", "だめ", "むり"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Request queries - All languages", () => {
    it("should match Korean request", () => {
      const queries = ["부탁해", "해줘", "제발", "플리즈"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English request", () => {
      const queries = ["please", "can you", "pls", "help me"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese request", () => {
      const queries = ["お願い", "頼む", "ください"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Surprise queries - All languages", () => {
    it("should match Korean surprise", () => {
      const queries = ["헐", "헉", "우와", "진짜"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English surprise", () => {
      const queries = ["wow", "omg", "really", "seriously"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese surprise", () => {
      const queries = ["うそ", "マジ", "びっくり"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Complaint queries - All languages", () => {
    it("should match Korean complaint", () => {
      const queries = ["짜증나", "화나", "열받아", "ㅡㅡ"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(true);
      }
    });

    it("should match English complaint", () => {
      const queries = ["annoying", "frustrated", "angry", "ugh"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "en");
        expect(result.matched).toBe(true);
      }
    });

    it("should match Japanese complaint", () => {
      const queries = ["イライラ", "ムカつく", "最悪"];
      for (const query of queries) {
        const result = handleDynamicQuery(query, "ja");
        expect(result.matched).toBe(true);
      }
    });
  });

  describe("Non-matching queries", () => {
    const nonMatchingQueries = [
      "asdfghjkl",
      "ㅁㄴㅇㄹㅎ",
      "random gibberish text here",
      "12345678",
      "@@#$%^",
    ];

    for (const query of nonMatchingQueries) {
      it(`should not match unrelated query: "${query}"`, () => {
        const result = handleDynamicQuery(query, "ko");
        expect(result.matched).toBe(false);
      });
    }
  });
});
