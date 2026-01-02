// ========================================
// Integumentary System - 외피계 (피부/털/손톱)
// ========================================

export const INTEGUMENTARY_KO_EN: Record<string, string> = {
  // === 피부 (Skin) ===
  피부: 'skin',
  표피: 'epidermis',
  진피: 'dermis',
  피하조직: 'hypodermis',
  각질층: 'stratum corneum',
  투명층: 'stratum lucidum',
  과립층: 'stratum granulosum',
  유극층: 'stratum spinosum',
  기저층: 'stratum basale',
  유두층: 'papillary layer',
  망상층: 'reticular layer',
  멜라닌세포: 'melanocyte',
  각질세포: 'keratinocyte',
  랑게르한스세포: 'Langerhans cell',
  메르켈세포: 'Merkel cell',
  피부결: 'skin texture',
  피부주름: 'skin wrinkle',
  모공: 'pore',

  // === 털/모발 (Hair) ===
  털: 'hair',
  머리카락: 'scalp hair',
  모발: 'hair fiber',
  모근: 'hair root',
  모간: 'hair shaft',
  모낭: 'hair follicle',
  모구: 'hair bulb',
  모유두: 'hair papilla',
  모기질: 'hair matrix',
  모수질: 'hair medulla',
  모피질: 'hair cortex',
  모표피: 'hair cuticle',
  입모근: 'arrector pili muscle',
  눈썹: 'eyebrow',
  속눈썹: 'eyelash',
  콧털: 'nasal hair',
  귀털: 'ear hair',
  수염: 'beard',
  콧수염: 'mustache',
  구레나룻: 'sideburns',
  겨드랑이털: 'axillary hair',
  음모: 'pubic hair',
  가슴털: 'chest hair',
  팔털: 'arm hair',
  다리털: 'leg hair',
  솜털: 'vellus hair',
  연모: 'lanugo',
  종모: 'terminal hair',

  // === 손톱/발톱 (Nails) ===
  손톱: 'fingernail',
  발톱: 'toenail',
  조갑: 'nail plate',
  조상: 'nail bed',
  조모: 'nail matrix',
  조근: 'nail root',
  반월: 'lunula',
  조소피: 'cuticle',
  조하피: 'hyponychium',
  조벽: 'nail wall',
  조구: 'nail groove',
  조주름: 'nail fold',

  // === 피부 부속기관 (Skin Appendages) ===
  땀샘: 'sweat gland',
  에크린땀샘: 'eccrine sweat gland',
  아포크린땀샘: 'apocrine sweat gland',
  피지선: 'sebaceous gland',
  젖샘: 'mammary gland',
  귀지선: 'ceruminous gland',
};

export const INTEGUMENTARY_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(INTEGUMENTARY_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
