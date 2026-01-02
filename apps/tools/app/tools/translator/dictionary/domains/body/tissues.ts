// ========================================
// Tissues - 기타 조직 (연골/결합조직/상피조직)
// ========================================

export const TISSUES_KO_EN: Record<string, string> = {
  // === 연골 (Cartilage) ===
  연골: 'cartilage',
  초자연골: 'hyaline cartilage',
  섬유연골: 'fibrocartilage',
  탄성연골: 'elastic cartilage',
  연골세포: 'chondrocyte',
  연골기질: 'cartilage matrix',
  연골막: 'perichondrium',

  // === 결합조직 (Connective Tissue) ===
  결합조직: 'connective tissue',
  느슨결합조직: 'loose connective tissue',
  치밀결합조직: 'dense connective tissue',
  지방조직: 'adipose tissue',
  백색지방: 'white adipose tissue',
  갈색지방: 'brown adipose tissue',
  지방세포: 'adipocyte',
  섬유아세포: 'fibroblast',
  콜라겐섬유: 'collagen fiber',
  망상섬유: 'reticular fiber',

  // === 상피조직 (Epithelial Tissue) ===
  상피조직: 'epithelial tissue',
  단층편평상피: 'simple squamous epithelium',
  단층입방상피: 'simple cuboidal epithelium',
  단층원주상피: 'simple columnar epithelium',
  위중층원주상피: 'pseudostratified columnar epithelium',
  중층편평상피: 'stratified squamous epithelium',
  이행상피: 'transitional epithelium',
  기저막: 'basement membrane',
  섬모: 'cilia',
};

export const TISSUES_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TISSUES_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
