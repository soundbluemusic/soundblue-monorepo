// ========================================
// Emotions Domain Dictionary - 감정/심리 도메인 사전
// 감정/심리/느낌 관련 어휘
// ========================================

export const EMOTIONS_KO_EN: Record<string, string> = {
  // === 기본 감정 (Basic Emotions) ===
  기쁨: 'joy',
  슬픔: 'sadness',
  분노: 'anger',
  공포: 'fear',
  놀람: 'surprise',
  혐오: 'disgust',

  // === 부정적 감정 (Negative Emotions) ===
  불안: 'anxiety',
  긴장: 'tension',
  스트레스: 'stress',
  우울: 'depression',
  외로움: 'loneliness',
  질투: 'jealousy',
  부끄러움: 'embarrassment',
  후회: 'regret',
  죄책감: 'guilt',
  짜증: 'annoyance',
  답답함: 'frustration',

  // === 긍정적 감정 (Positive Emotions) ===
  자신감: 'confidence',
  자존감: 'self-esteem',
  만족: 'satisfaction',
  감사: 'gratitude',
  설렘: 'excitement',
  평온: 'peace',
  편안: 'comfort',
  흥분: 'excitement',
};

export const EMOTIONS_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(EMOTIONS_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
