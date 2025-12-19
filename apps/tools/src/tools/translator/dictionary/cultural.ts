// ========================================
// Cultural Expressions Dictionary - 문화 특수 표현 사전
// 직역이 불가능한 한국어 문화 표현
// ========================================

/**
 * 문화 특수 표현 (한→영)
 * 한국 문화에 특화된 인사말, 감정 표현 등
 */
export const culturalExpressions: Record<string, string> = {
  // === 인사/예의 표현 ===
  수고하셨습니다: 'Thank you for your hard work',
  수고하세요: 'Keep up the good work',
  수고해요: 'Good work',
  수고했어요: 'Good job',
  수고했어: 'Good job',
  고생하셨습니다: 'Thank you for your hard work',
  고생했어요: "You've worked hard",
  고생했어: "You've worked hard",
  '잘 먹겠습니다': 'Thank you for the meal',
  '잘 먹었습니다': 'Thank you for the meal',
  '맛있게 드세요': 'Enjoy your meal',
  '많이 드세요': 'Please eat a lot',
  '편히 쉬세요': 'Have a good rest',
  '좋은 하루 되세요': 'Have a nice day',
  '좋은 하루 보내세요': 'Have a nice day',
  '안녕히 가세요': 'Goodbye (to someone leaving)',
  '안녕히 계세요': 'Goodbye (to someone staying)',
  '어서 오세요': 'Welcome',
  '또 오세요': 'Please come again',
  '조심히 가세요': 'Take care',
  '조심히 들어가세요': 'Get home safely',
  '잘 자요': 'Good night',
  '잘 자': 'Good night',
  '좋은 꿈 꿔요': 'Sweet dreams',
  화이팅: 'You can do it',
  파이팅: 'You can do it',
  힘내세요: 'Cheer up',
  힘내요: 'Cheer up',
  힘내: 'Cheer up',
  건강하세요: 'Stay healthy',
  건강해: 'Stay healthy',
  '행운을 빌어요': 'Good luck',
  '행운을 빕니다': 'Good luck',
  축하해요: 'Congratulations',
  축하합니다: 'Congratulations',
  축하해: 'Congrats',

  // === 감정/상태 표현 ===
  답답해요: 'I feel frustrated',
  답답해: 'I feel frustrated',
  속상해요: 'I feel upset',
  속상해: 'I feel upset',
  서운해요: 'I feel disappointed',
  서운해: 'I feel let down',
  섭섭해요: 'I feel sad about it',
  억울해요: 'I feel wronged',
  억울해: 'I feel wronged',
  '한이 맺히다': 'to harbor deep resentment',
  '정이 들다': 'to grow fond of',
  '정이 없다': 'to be cold-hearted',
  '눈치가 보이다': 'to feel awkward about',
  '눈치를 보다': 'to read the room',
  눈치: 'ability to read social situations',

  // === 감탄사/추임새 ===
  아이고: 'Oh my',
  어머: 'Oh my',
  어머나: 'Oh my goodness',
  세상에: 'Oh my god',
  대박: 'Wow / Amazing',
  헐: 'OMG / No way',
  진짜: 'Really',
  정말: 'Really',
  그래요: 'I see / Is that so',
  그래: 'I see',
  그렇구나: 'I see',
  아하: 'Aha',
  그러게요: "You're right",
  그러니까요: 'Exactly',
  맞아요: "That's right",
  맞아: "That's right",

  // === 식사/음식 관련 ===
  '입맛에 맞으세요': 'I hope it suits your taste',
  '많이 남겼네요': 'You left a lot',
  배불러요: "I'm full",
  배불러: "I'm full",
  배고파요: "I'm hungry",
  배고파: "I'm hungry",
  목말라요: "I'm thirsty",
  목말라: "I'm thirsty",

  // === 호칭/관계 ===
  형: 'older brother (male speaker)',
  오빠: 'older brother (female speaker)',
  누나: 'older sister (male speaker)',
  언니: 'older sister (female speaker)',
  동생: 'younger sibling',
  선배님: 'senior',
  후배님: 'junior',
  아저씨: 'mister / uncle',
  아줌마: "ma'am / aunt",
  할아버지: 'grandfather / elderly man',
  할머니: 'grandmother / elderly woman',
};

/**
 * 문화 표현 목록 (긴 것부터 정렬)
 */
export const culturalExpressionList = Object.keys(culturalExpressions).sort(
  (a, b) => b.length - a.length,
);

/**
 * 문장에서 문화 표현 번역
 */
export function translateCultural(text: string): { translated: string; found: boolean } {
  let result = text;
  let found = false;

  for (const expr of culturalExpressionList) {
    if (result.includes(expr)) {
      const translation = culturalExpressions[expr];
      if (translation) {
        result = result.replace(new RegExp(expr, 'g'), translation);
        found = true;
      }
    }
  }

  return { translated: result, found };
}
