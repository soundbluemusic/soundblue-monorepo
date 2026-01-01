// ========================================
// Medical Domain Dictionary - 의료 도메인 사전
// 의료/건강/병원 관련 어휘
// ========================================

export const MEDICAL_KO_EN: Record<string, string> = {
  // === 의료 일반 ===
  환자: 'patient',
  예후: 'prognosis',
  진료: 'treatment',
  처치: 'procedure',
  건강: 'health',
  질병: 'disease',
  병: 'illness',

  // === 증상 (Symptoms) ===
  감기: 'cold',
  독감: 'flu',
  발열: 'fever',
  기침: 'cough',
  콧물: 'runny nose',
  두통: 'headache',
  복통: 'stomachache',
  치통: 'toothache',
  요통: 'back pain',
  근육통: 'muscle pain',
  알레르기: 'allergy',
  피부염: 'dermatitis',
  염증: 'inflammation',
  골절: 'fracture',
  상처: 'wound',
  멍: 'bruise',
  화상: 'burn',

  // === 치료 (Treatment) ===
  수술: 'surgery',
  주사: 'injection',
  약: 'medicine',
  알약: 'pill',
  진통제: 'painkiller',
  해열제: 'fever reducer',
  항생제: 'antibiotic',
  연고: 'ointment',
  밴드: 'bandage',
  붕대: 'bandage',
  마스크: 'mask',

  // === 의료기기 (Medical Devices) ===
  체온계: 'thermometer',
  혈압계: 'blood pressure monitor',
  청진기: 'stethoscope',
  휠체어: 'wheelchair',
  목발: 'crutches',

  // === 병원 (Hospital) ===
  의료검사: 'examination',
  진단: 'diagnosis',
  처방: 'prescription',
  입원: 'hospitalization',
  퇴원: 'discharge',
  응급실: 'emergency room',
  수술실: 'operating room',
  진료실: 'clinic',
  대기실: 'waiting room',

  // === 신체/건강지표 (Body/Health Metrics) ===
  혈액: 'blood',
  혈액형: 'blood type',
  맥박: 'pulse',
  혈압: 'blood pressure',
  체중: 'weight',
  키: 'height',
  시력: 'vision',
  청력: 'hearing',
  면역: 'immunity',

  // === 예방 (Prevention) ===
  백신: 'vaccine',
  예방접종: 'vaccination',
  건강검진: 'health checkup',
};

export const MEDICAL_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(MEDICAL_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
