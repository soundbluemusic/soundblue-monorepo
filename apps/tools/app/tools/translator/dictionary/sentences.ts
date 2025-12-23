// ========================================
// Sentences Dictionary - 문장 사전 (한→영)
// i18n 사전 자동 통합 (사이트 성장 = 번역기 성장)
// ========================================

import { i18nEnToKoSentences, i18nKoToEnSentences } from './i18n-sentences';

// 수동 정의 문장 사전
const manualKoToEnSentences: Record<string, string> = {
  // === 인사 ===
  안녕: 'Hi',
  안녕하세요: 'Hello',
  '안녕히 가세요': 'Goodbye',
  '안녕히 계세요': 'Goodbye',
  '좋은 아침이에요': 'Good morning',
  '좋은 하루 되세요': 'Have a nice day',
  오랜만이에요: 'Long time no see',
  '처음 뵙겠습니다': 'Nice to meet you',
  반갑습니다: 'Nice to meet you',
  반가워요: 'Nice to meet you',
  반갑다: 'Glad to see you',
  '만나서 반갑습니다': 'Nice to meet you',
  '만나서 반가워요': 'Nice to meet you',
  '잘 부탁드립니다': 'Please take care of me',
  수고하세요: 'Keep up the good work',

  // === 감사/사과 ===
  감사합니다: 'Thank you',
  고마워요: 'Thanks',
  '정말 감사합니다': 'Thank you so much',
  천만에요: "You're welcome",
  죄송합니다: "I'm sorry",
  미안해요: 'Sorry',
  괜찮아요: "It's okay",
  실례합니다: 'Excuse me',

  // === 일상 대화 ===
  '밥 먹었어요': 'Have you eaten',
  '잘 지내요': "I'm doing well",
  '어떻게 지내세요': 'How are you',
  '오늘 날씨가 좋네요': 'The weather is nice today',
  '무슨 일이에요': "What's the matter",
  알겠습니다: 'I understand',
  모르겠어요: "I don't know",
  잠깐만요: 'Just a moment',
  '다시 말해주세요': 'Please say that again',
  '천천히 말해주세요': 'Please speak slowly',

  // === 질문 ===
  '이게 뭐예요': 'What is this',
  어디예요: 'Where is it',
  언제예요: 'When is it',
  왜요: 'Why',
  얼마예요: 'How much is it',
  '몇 시예요': 'What time is it',
  '화장실이 어디예요': 'Where is the bathroom',
  '영어 할 줄 아세요': 'Do you speak English',

  // === 응답 ===
  네: 'Yes',
  아니요: 'No',
  맞아요: "That's right",
  아마도요: 'Maybe',
  물론이죠: 'Of course',
  '잘 모르겠어요': "I'm not sure",
  그럴게요: 'I will do that',
  좋아요: 'Okay',
  싫어요: "I don't like it",

  // === 기타 ===
  도와주세요: 'Please help me',
  축하합니다: 'Congratulations',
  '생일 축하합니다': 'Happy birthday',
  '새해 복 많이 받으세요': 'Happy New Year',
  사랑해요: 'I love you',
};

// ========================================
// 통합 사전 (i18n + 수동 사전)
// ========================================

export const koToEnSentences: Record<string, string> = {
  ...i18nKoToEnSentences,
  ...manualKoToEnSentences,
};

// 역방향 사전 (영→한) 자동 생성
export const enToKoSentences: Record<string, string> = {
  ...i18nEnToKoSentences,
  ...Object.fromEntries(
    Object.entries(manualKoToEnSentences).map(([ko, en]) => [en.toLowerCase(), ko]),
  ),
};
