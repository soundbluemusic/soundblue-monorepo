// ========================================
// Lymphatic / Immune System - 림프계 / 면역계
// ========================================

export const LYMPHATIC_KO_EN: Record<string, string> = {
  // === 림프기관 (Lymphoid Organs) ===
  골수: 'bone marrow',
  흉선: 'thymus',
  비장: 'spleen',
  림프절: 'lymph node',
  편도: 'tonsil',
  구개편도: 'palatine tonsil',
  인두편도: 'pharyngeal tonsil',
  아데노이드: 'adenoid',
  설편도: 'lingual tonsil',
  파이어판: "Peyer's patches",
  충수: 'appendix',

  // === 림프절 부위 (Lymph Node Regions) ===
  경부림프절: 'cervical lymph nodes',
  액와림프절: 'axillary lymph nodes',
  서혜림프절: 'inguinal lymph nodes',
  슬와림프절: 'popliteal lymph nodes',
  장간막림프절: 'mesenteric lymph nodes',
  기관지폐림프절: 'tracheobronchial lymph nodes',
  쇄골상림프절: 'supraclavicular lymph nodes',
  후두림프절: 'occipital lymph nodes',
  이하선림프절: 'parotid lymph nodes',
  턱밑림프절: 'submandibular lymph nodes',

  // === 림프관 (Lymphatic Vessels) ===
  림프모세관: 'lymphatic capillary',
  림프관: 'lymphatic vessel',
  유미관: 'lacteal',
  흉관: 'thoracic duct',
  우림프관: 'right lymphatic duct',
  유미조: 'cisterna chyli',

  // === 면역세포 (Immune Cells) ===
  T세포: 'T cell',
  B세포: 'B cell',
  NK세포: 'natural killer cell',
  대식세포: 'macrophage',
  수지상세포: 'dendritic cell',
  비만세포: 'mast cell',
  형질세포: 'plasma cell',
  기억세포: 'memory cell',
  보조T세포: 'helper T cell',
  세포독성T세포: 'cytotoxic T cell',
  조절T세포: 'regulatory T cell',
};

export const LYMPHATIC_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(LYMPHATIC_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
