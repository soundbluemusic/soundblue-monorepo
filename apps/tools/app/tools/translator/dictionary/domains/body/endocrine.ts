// ========================================
// Endocrine System - 내분비계 (호르몬 분비 기관)
// ========================================

export const ENDOCRINE_KO_EN: Record<string, string> = {
  // === 뇌하수체/송과체 (Pituitary/Pineal) ===
  시상하부: 'hypothalamus',
  뇌하수체: 'pituitary gland',
  뇌하수체전엽: 'anterior pituitary',
  뇌하수체후엽: 'posterior pituitary',
  뇌하수체중엽: 'intermediate pituitary',
  터키안: 'sella turcica',
  송과체: 'pineal gland',

  // === 갑상선/부갑상선 (Thyroid/Parathyroid) ===
  갑상선: 'thyroid gland',
  갑상선협부: 'isthmus of thyroid',
  갑상선엽: 'lobe of thyroid',
  갑상선여포: 'thyroid follicle',
  여포세포: 'follicular cell',
  방여포세포: 'parafollicular cell',
  부갑상선: 'parathyroid gland',

  // === 부신 (Adrenal Gland) ===
  부신: 'adrenal gland',
  부신피질: 'adrenal cortex',
  부신수질: 'adrenal medulla',
  사구층: 'zona glomerulosa',
  속상층: 'zona fasciculata',
  망상층: 'zona reticularis',

  // === 기타 내분비 기관 (Other Endocrine Organs) ===
  췌장섬: 'pancreatic islet',
  생식선: 'gonad',
  흉선: 'thymus',
};

export const ENDOCRINE_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(ENDOCRINE_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
