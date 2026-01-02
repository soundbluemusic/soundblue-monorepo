// ========================================
// Urinary System - 비뇨계 (신장/요관/방광/요도)
// ========================================

export const URINARY_KO_EN: Record<string, string> = {
  // === 신장 (Kidney) ===
  신장: 'kidney',
  신문: 'renal hilum',
  신피막: 'renal capsule',
  신피질: 'renal cortex',
  신수질: 'renal medulla',
  신추체: 'renal pyramid',
  신유두: 'renal papilla',
  신주: 'renal column',
  소신배: 'minor calyx',
  대신배: 'major calyx',
  신우: 'renal pelvis',
  엽간동맥: 'interlobar artery',
  소엽간동맥: 'interlobular artery',
  수입세동맥: 'afferent arteriole',
  수출세동맥: 'efferent arteriole',
  신소체: 'renal corpuscle',
  사구체: 'glomerulus',
  보우만주머니: "Bowman's capsule",
  근위세뇨관: 'proximal convoluted tubule',
  헨레고리: 'loop of Henle',
  하행각: 'descending limb',
  상행각: 'ascending limb',
  원위세뇨관: 'distal convoluted tubule',
  집합관: 'collecting duct',
  치밀반: 'macula densa',
  사구체옆세포: 'juxtaglomerular cell',
  메산지움세포: 'mesangial cell',
  족세포: 'podocyte',
  네프론: 'nephron',

  // === 요관/방광/요도 (Ureter/Bladder/Urethra) ===
  요관: 'ureter',
  요관구: 'ureteral orifice',
  방광: 'urinary bladder',
  방광첨: 'apex of bladder',
  방광저: 'base of bladder',
  방광체: 'body of bladder',
  방광경: 'neck of bladder',
  방광삼각: 'trigone',
  배뇨근: 'detrusor muscle',
  내요도괄약근: 'internal urethral sphincter',
  외요도괄약근: 'external urethral sphincter',
  요도: 'urethra',
  남성요도: 'male urethra',
  전립선요도: 'prostatic urethra',
  막양부요도: 'membranous urethra',
  해면체요도: 'spongy urethra',
  여성요도: 'female urethra',
  외요도구: 'external urethral orifice',
};

export const URINARY_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(URINARY_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
