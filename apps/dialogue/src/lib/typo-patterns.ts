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
 * Greeting-related keywords and common typos
 * 인사말 관련 키워드 및 흔한 오타
 */
export const GREETING_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본 인사
    "안녕",
    "안녕하세요",
    "안녕하십니까",
    "반갑습니다",
    "반가워",
    "반갑다",
    "반가워요",
    // 오타/변형
    "안냥",
    "안뇽",
    "안녕하셍요",
    "안녕하세용",
    "반갑슴다",
    "방가",
    "방가방가",
    // 축약형
    "ㅎㅇ",
    "ㅎㅇㅎㅇ",
    "ㅂㄱ",
    "ㅂㄱㅂㄱ",
    // 캐주얼
    "하이",
    "헬로",
    "여보세요",
    "계세요",
    "있어요",
    "거기",
  ],
  en: [
    // 기본
    "hello",
    "hi",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "howdy",
    "sup",
    "whats up",
    "what's up",
    "yo",
    // 오타
    "helo",
    "hallo",
    "hullo",
    "hii",
    "heya",
    "heyyy",
    "helllo",
    "hellooo",
  ],
  ja: [
    // 기본
    "こんにちは",
    "こんばんは",
    "おはよう",
    "おはようございます",
    "はじめまして",
    "よろしく",
    "やあ",
    "ども",
    "どうも",
    // 오타/변형
    "こんちは",
    "こんちわ",
    "おはよー",
    "よろしくー",
    "こんばんわ",
  ],
};

/**
 * Thanks-related keywords
 * 감사 관련 키워드
 */
export const THANKS_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "고마워",
    "고마워요",
    "고맙습니다",
    "감사",
    "감사해",
    "감사해요",
    "감사합니다",
    "땡큐",
    "ㄱㅅ",
    "ㄱㅅㄱㅅ",
    "고마워용",
    "고맙슴다",
    "감사용",
  ],
  en: [
    "thanks",
    "thank you",
    "thx",
    "ty",
    "thank u",
    "appreciated",
    "thnx",
    "thnks",
    "thanx",
    "thankss",
  ],
  ja: [
    "ありがとう",
    "ありがとうございます",
    "サンキュー",
    "さんきゅー",
    "ありがと",
    "あざす",
    "あざっす",
    "どうも",
  ],
};

/**
 * Goodbye-related keywords
 * 작별 관련 키워드
 */
export const BYE_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "잘가",
    "잘가요",
    "안녕",
    "바이",
    "바이바이",
    "ㅂㅂ",
    "또봐",
    "또봐요",
    "나중에",
    "다음에",
    "끝",
    "그만",
  ],
  en: [
    "bye",
    "goodbye",
    "see ya",
    "see you",
    "cya",
    "later",
    "peace",
    "byebye",
    "bye bye",
    "gotta go",
    "gtg",
  ],
  ja: [
    "さようなら",
    "じゃあね",
    "じゃね",
    "またね",
    "バイバイ",
    "ばいばい",
    "じゃあ",
    "また",
  ],
};

/**
 * Identity-related keywords (who are you?)
 * 정체성 관련 키워드
 */
export const IDENTITY_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "너뭐냐",
    "너뭐야",
    "누구야",
    "누구냐",
    "뭐야",
    "뭐냐",
    "니가뭔데",
    "정체가뭐야",
    "너누구",
    "넌뭐야",
    "넌누구",
    "이름이뭐야",
    "뭐하는애야",
    "뭐하는거야",
    "소개해",
    "자기소개",
  ],
  en: [
    "who are you",
    "what are you",
    "who is this",
    "your name",
    "whats your name",
    "what's your name",
    "who r u",
    "what r u",
    "introduce yourself",
    "tell me about yourself",
  ],
  ja: [
    "あなたは誰",
    "君は何",
    "お前は誰",
    "誰ですか",
    "何ですか",
    "名前は",
    "自己紹介",
    "なにもの",
    "何者",
  ],
};

/**
 * Help-related keywords
 * 도움 요청 관련 키워드
 */
export const HELP_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "도와줘",
    "도움",
    "뭐할수있어",
    "뭘할수있어",
    "기능이뭐야",
    "사용법",
    "어떻게써",
    "어떻게사용",
    "할수있는게뭐야",
    "뭐해줄수있어",
    "뭘해줄수있어",
  ],
  en: [
    "help",
    "help me",
    "what can you do",
    "how to use",
    "features",
    "what do you do",
    "capabilities",
    "how does this work",
  ],
  ja: [
    "助けて",
    "ヘルプ",
    "何ができる",
    "使い方",
    "機能は",
    "どうやって使う",
    "できること",
  ],
};

/**
 * Mood/Status-related keywords (how are you?)
 * 기분/안부 관련 키워드
 */
export const MOOD_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "잘지내",
    "잘지내?",
    "잘있어?",
    "뭐해",
    "뭐하냐",
    "뭐해?",
    "어때",
    "기분어때",
    "컨디션",
    "잘지냈어",
    "별일없어",
  ],
  en: [
    "how are you",
    "how r u",
    "hows it going",
    "how's it going",
    "what's up",
    "whats up",
    "how do you do",
    "you good",
    "you ok",
  ],
  ja: [
    "元気",
    "元気?",
    "調子どう",
    "お元気ですか",
    "どうですか",
    "いかがですか",
    "大丈夫",
  ],
};

/**
 * Agreement/Confirmation keywords
 * 동의/확인 관련 키워드
 */
export const AGREE_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    "ㅇㅇ",
    "ㅇㅋ",
    "알겠어",
    "알았어",
    "그래",
    "응",
    "네",
    "예",
    "오케이",
    "ㅇㅋㅇㅋ",
    "굿",
    "좋아",
    "알겠습니다",
  ],
  en: [
    "ok",
    "okay",
    "got it",
    "yep",
    "yes",
    "sure",
    "alright",
    "right",
    "fine",
    "cool",
    "good",
    "understood",
    "i see",
  ],
  ja: [
    "わかった",
    "おけ",
    "オッケー",
    "うん",
    "はい",
    "りょ",
    "りょうかい",
    "了解",
    "いいよ",
    "おk",
  ],
};

/**
 * Apology-related keywords
 * 사과 관련 키워드
 */
export const APOLOGY_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "미안",
    "미안해",
    "미안해요",
    "미안합니다",
    "죄송",
    "죄송해",
    "죄송해요",
    "죄송합니다",
    // 구어체
    "쏘리",
    "소리",
    "ㅈㅅ",
    "ㅁㅇ",
    "잘못했어",
    "잘못했어요",
    // 오타/변형
    "미얀",
    "미얀해",
    "죄성",
    "죄성해",
    "미안용",
    "죄송용",
  ],
  en: [
    // 기본
    "sorry",
    "i'm sorry",
    "im sorry",
    "my bad",
    "my fault",
    "apologize",
    "apologies",
    // 구어체
    "sry",
    "srry",
    "mb",
    "oops",
    // 오타
    "sorri",
    "soory",
    "sory",
  ],
  ja: [
    // 기본
    "ごめん",
    "ごめんなさい",
    "すみません",
    "申し訳",
    "申し訳ない",
    // 변형
    "ごめんね",
    "すまん",
    "すまない",
    "わるい",
    "悪い",
  ],
};

/**
 * Compliment-related keywords
 * 칭찬 관련 키워드
 */
export const COMPLIMENT_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "잘했어",
    "잘했다",
    "잘한다",
    "대단해",
    "대단하다",
    "최고",
    "최고야",
    "멋있어",
    "멋지다",
    "굿",
    // 구어체
    "쩔어",
    "쩐다",
    "ㄷㄷ",
    "ㅊㄱ",
    "짱",
    "짱이야",
    "레전드",
    // 오타/변형
    "쵝고",
    "대박",
    "찐이야",
  ],
  en: [
    // 기본
    "good job",
    "well done",
    "nice",
    "great",
    "awesome",
    "amazing",
    "excellent",
    "fantastic",
    "brilliant",
    // 구어체
    "sick",
    "lit",
    "dope",
    "fire",
    "goat",
    "slaps",
  ],
  ja: [
    // 기본
    "すごい",
    "素晴らしい",
    "偉い",
    "えらい",
    "上手",
    "じょうず",
    // 변형
    "さすが",
    "やるね",
    "いいね",
    "最高",
  ],
};

/**
 * Comfort-related keywords
 * 위로 관련 키워드
 */
export const COMFORT_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "힘내",
    "힘내요",
    "힘들어",
    "힘들다",
    "지쳤어",
    "피곤해",
    "슬퍼",
    "슬프다",
    "우울해",
    "우울하다",
    // 구어체
    "ㅠㅠ",
    "ㅜㅜ",
    "에휴",
    "아휴",
    "ㅎㄷㄷ",
    "힘듦",
    // 오타/변형
    "힘드러",
    "슬펴",
    "우울함",
    "지침",
  ],
  en: [
    // 기본
    "tired",
    "exhausted",
    "sad",
    "depressed",
    "upset",
    "down",
    "stressed",
    "struggling",
    // 구어체
    "ugh",
    "meh",
    "bleh",
    "sigh",
    "cheer up",
    "hang in there",
    "feeling down",
  ],
  ja: [
    // 기본
    "疲れた",
    "つかれた",
    "辛い",
    "つらい",
    "悲しい",
    "かなしい",
    // 변형
    "しんどい",
    "だるい",
    "落ち込む",
    "元気ない",
  ],
};

/**
 * Congratulations-related keywords
 * 축하 관련 키워드
 */
export const CONGRATS_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "축하",
    "축하해",
    "축하해요",
    "축하합니다",
    "축하드려요",
    "ㅊㅋ",
    "ㅊㅋㅊㅋ",
    "추카",
    "추카추카",
    "추카해",
    // 구어체
    "생축",
    "결축",
    "합격축하",
    "입학축하",
    "취업축하",
    // 오타/변형
    "춛하",
    "축카",
    "축하용",
    "추카요",
    "축하드림",
  ],
  en: [
    // 기본
    "congrats",
    "congratulations",
    "congratz",
    "gratz",
    "grats",
    "way to go",
    "proud of you",
    // 구어체
    "congraz",
    "congrtz",
    "good for you",
    "happy for you",
    // 변형
    "yay",
    "woohoo",
    "woot",
    "w00t",
  ],
  ja: [
    // 기본
    "おめでとう",
    "おめでとうございます",
    "祝",
    // 변형
    "おめ",
    "おめです",
    "おめでと",
    "めでたい",
    "やったね",
    "すばらしい",
    "よかったね",
  ],
};

/**
 * Decline/Refusal-related keywords
 * 거절 관련 키워드
 */
export const DECLINE_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "싫어",
    "싫어요",
    "아니",
    "아니요",
    "아니야",
    "됐어",
    "됐어요",
    "괜찮아",
    "괜찮아요",
    "필요없어",
    // 구어체
    "ㄴㄴ",
    "놉",
    "노노",
    "ㄱㅊ",
    "노",
    "노땡스",
    // 오타/변형
    "시러",
    "시렁",
    "됬어",
    "괜찬아",
  ],
  en: [
    // 기본
    "no",
    "nope",
    "nah",
    "no thanks",
    "no thank you",
    "i'm good",
    "im good",
    "pass",
    // 구어체
    "nty",
    "hard pass",
    "not interested",
    "no way",
    "naww",
    "naw",
    "nuh uh",
  ],
  ja: [
    // 기본
    "いいえ",
    "いや",
    "嫌",
    "いやだ",
    "だめ",
    // 변형
    "無理",
    "むり",
    "けっこう",
    "大丈夫",
    "いらない",
  ],
};

/**
 * Request/Favor-related keywords
 * 부탁 관련 키워드
 */
export const REQUEST_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "부탁",
    "부탁해",
    "부탁해요",
    "부탁합니다",
    "부탁드려요",
    "해줘",
    "해주세요",
    "해줄수있어",
    "해줄래",
    "제발",
    // 구어체
    "플리즈",
    "ㅂㅌ",
    "좀",
    "해주라",
    "해주삼",
    // 오타/변형
    "부탘",
    "부타",
    "해줘요",
    "해쥬세요",
    "해줄수이써",
  ],
  en: [
    // 기본
    "please",
    "can you",
    "could you",
    "would you",
    "help me",
    "do me a favor",
    // 구어체
    "pls",
    "plz",
    "plzzz",
    "pretty please",
    "i need",
    "need your help",
    "mind if",
    "would you mind",
    "i beg you",
  ],
  ja: [
    // 기본
    "お願い",
    "おねがい",
    "頼む",
    "たのむ",
    "ください",
    // 변형
    "お願いします",
    "頼みます",
    "してくれ",
    "してほしい",
    "頼んだ",
  ],
};

/**
 * Surprise-related keywords
 * 놀람 관련 키워드
 */
export const SURPRISE_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "헐",
    "헉",
    "와",
    "우와",
    "대박",
    "뭐야",
    "뭐",
    "진짜",
    "진짜?",
    "실화",
    // 구어체
    "ㅎㄹ",
    "ㄷㄷ",
    "ㅁㅊ",
    "미쳤",
    "어이없",
    "ㄴㅇㅂㅇ",
    // 오타/변형
    "허얼",
    "헐크",
    "대바",
    "진짜루",
  ],
  en: [
    // 기본
    "wow",
    "whoa",
    "omg",
    "oh my god",
    "what",
    "really",
    "seriously",
    // 구어체
    "no way",
    "for real",
    "fr",
    "wtf",
    "holy",
    "damn",
    "dang",
    "geez",
  ],
  ja: [
    // 기본
    "えー",
    "うそ",
    "嘘",
    "マジ",
    "まじ",
    // 변형
    "本当",
    "ほんと",
    "びっくり",
    "驚いた",
    "すげー",
  ],
};

/**
 * Complaint-related keywords
 * 불만 관련 키워드
 */
export const COMPLAINT_KEYWORDS: Record<Locale, string[]> = {
  ko: [
    // 기본
    "짜증",
    "짜증나",
    "짜증나요",
    "화나",
    "화났어",
    "열받아",
    "열받네",
    "싫다",
    "별로",
    "별로야",
    // 구어체
    "ㅡㅡ",
    "ㅠㅠ",
    "에잉",
    "젠장",
    "아놔",
    "하",
    // 오타/변형
    "쨩나",
    "짱나",
    "열바따",
    "빡쳐",
  ],
  en: [
    // 기본
    "annoying",
    "annoyed",
    "frustrated",
    "angry",
    "mad",
    "upset",
    "hate this",
    // 구어체
    "ugh",
    "argh",
    "dammit",
    "ffs",
    "smh",
    "this sucks",
    "terrible",
    "worst",
  ],
  ja: [
    // 기본
    "イライラ",
    "ムカつく",
    "腹立つ",
    "うざい",
    "最悪",
    // 변형
    "怒り",
    "いやだ",
    "やだ",
    "ひどい",
    "困る",
  ],
};

/**
 * Get all keywords for a specific type and locale
 * 특정 유형 및 로케일에 대한 모든 키워드 가져오기
 */
export function getKeywords(
  type: "time" | "date" | "weather" | "greeting" | "thanks" | "bye" | "identity" | "help" | "mood" | "agree" | "apology" | "compliment" | "comfort" | "congrats" | "decline" | "request" | "surprise" | "complaint",
  locale: Locale,
): string[] {
  switch (type) {
    case "time":
      return TIME_KEYWORDS[locale];
    case "date":
      return DATE_KEYWORDS[locale];
    case "weather":
      return WEATHER_KEYWORDS[locale];
    case "greeting":
      return GREETING_KEYWORDS[locale];
    case "thanks":
      return THANKS_KEYWORDS[locale];
    case "bye":
      return BYE_KEYWORDS[locale];
    case "identity":
      return IDENTITY_KEYWORDS[locale];
    case "help":
      return HELP_KEYWORDS[locale];
    case "mood":
      return MOOD_KEYWORDS[locale];
    case "agree":
      return AGREE_KEYWORDS[locale];
    case "apology":
      return APOLOGY_KEYWORDS[locale];
    case "compliment":
      return COMPLIMENT_KEYWORDS[locale];
    case "comfort":
      return COMFORT_KEYWORDS[locale];
    case "congrats":
      return CONGRATS_KEYWORDS[locale];
    case "decline":
      return DECLINE_KEYWORDS[locale];
    case "request":
      return REQUEST_KEYWORDS[locale];
    case "surprise":
      return SURPRISE_KEYWORDS[locale];
    case "complaint":
      return COMPLAINT_KEYWORDS[locale];
  }
}
