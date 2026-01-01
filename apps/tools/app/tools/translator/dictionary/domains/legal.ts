// ========================================
// Legal Domain Dictionary - 법률 도메인 사전
// 법률/재판/계약 관련 어휘
// ========================================

export const LEGAL_KO_EN: Record<string, string> = {
  // === 당사자 (Parties) ===
  피고인: 'defendant',
  원고: 'plaintiff',
  증인: 'witness',

  // === 판결 (Verdict) ===
  무죄: 'not guilty',
  유죄: 'guilty',
  판결: 'verdict',

  // === 소송 (Litigation) ===
  손해배상: 'damages',
  배상: 'compensation',
  변론: 'plea',
  재판: 'trial',
  항소: 'appeal',
  소송: 'lawsuit',
  합의: 'settlement',

  // === 증거 (Evidence) ===
  증거: 'evidence',
  진술: 'statement',

  // === 법률 (Law) ===
  계약: 'contract',
  권리: 'right',
  의무: 'obligation',
  위반: 'violation',
  법률: 'law',
  조항: 'clause',
  규정: 'regulation',
};

export const LEGAL_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(LEGAL_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
