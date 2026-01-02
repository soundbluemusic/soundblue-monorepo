// ========================================
// Articular System - 관절계
// ========================================

export const ARTICULAR_KO_EN: Record<string, string> = {
  // === 관절 유형 (Joint Types) ===
  관절: 'joint',
  섬유관절: 'fibrous joint',
  연골관절: 'cartilaginous joint',
  활막관절: 'synovial joint',
  봉합: 'suture',
  인대결합: 'syndesmosis',
  못박이관절: 'gomphosis',
  연골결합: 'synchondrosis',
  섬유연골결합: 'symphysis',
  구상관절: 'ball and socket joint',
  경첩관절: 'hinge joint',
  축상관절: 'pivot joint',
  안장관절: 'saddle joint',
  평면관절: 'plane joint',
  과상관절: 'condyloid joint',

  // === 주요 관절 (Major Joints) ===
  측두하악관절: 'temporomandibular joint',
  환추후두관절: 'atlanto-occipital joint',
  환축관절: 'atlanto-axial joint',
  추간관절: 'intervertebral joint',
  후관절: 'facet joint',
  늑추관절: 'costovertebral joint',
  늑횡돌기관절: 'costotransverse joint',
  흉쇄관절: 'sternoclavicular joint',
  견쇄관절: 'acromioclavicular joint',
  견관절: 'shoulder joint',
  주관절: 'elbow joint',
  상요척관절: 'proximal radioulnar joint',
  하요척관절: 'distal radioulnar joint',
  요수근관절: 'radiocarpal joint',
  수근간관절: 'intercarpal joint',
  수근중수관절: 'carpometacarpal joint',
  중수지관절: 'metacarpophalangeal joint',
  지절간관절: 'interphalangeal joint',
  천장관절: 'sacroiliac joint',
  고관절: 'hip joint',
  슬관절: 'knee joint',
  상경비관절: 'proximal tibiofibular joint',
  하경비관절: 'distal tibiofibular joint',
  거퇴관절: 'ankle joint',
  거골하관절: 'subtalar joint',
  족근간관절: 'intertarsal joint',
  족근중족관절: 'tarsometatarsal joint',
  중족지관절: 'metatarsophalangeal joint',

  // === 관절 구조물 (Joint Structures) ===
  관절낭: 'joint capsule',
  활막: 'synovial membrane',
  활액: 'synovial fluid',
  관절연골: 'articular cartilage',
  관절순: 'labrum',
  관절원판: 'articular disc',
  반월판: 'meniscus',
  내측반월판: 'medial meniscus',
  외측반월판: 'lateral meniscus',
  인대: 'ligament',
  점액낭: 'bursa',
  활액초: 'synovial sheath',
  건초: 'tendon sheath',

  // === 척추 인대 ===
  전종인대: 'anterior longitudinal ligament',
  후종인대: 'posterior longitudinal ligament',
  황색인대: 'ligamentum flavum',
  극간인대: 'interspinous ligament',
  극상인대: 'supraspinous ligament',
  항인대: 'nuchal ligament',
  횡인대: 'transverse ligament',

  // === 어깨 인대 ===
  오훼쇄골인대: 'coracoclavicular ligament',
  오훼견봉인대: 'coracoacromial ligament',
  오훼상완인대: 'coracohumeral ligament',
  관절상완인대: 'glenohumeral ligament',

  // === 팔꿈치 인대 ===
  윤상인대: 'annular ligament',

  // === 손목 인대 ===
  요골측부인대: 'radial collateral ligament',
  척골측부인대: 'ulnar collateral ligament',
  굴근지대: 'flexor retinaculum',
  신근지대: 'extensor retinaculum',

  // === 골반/고관절 인대 ===
  장골대퇴인대: 'iliofemoral ligament',
  치골대퇴인대: 'pubofemoral ligament',
  좌골대퇴인대: 'ischiofemoral ligament',
  대퇴골두인대: 'ligament of head of femur',
  천장인대: 'sacroiliac ligament',
  천극인대: 'sacrospinous ligament',
  천결절인대: 'sacrotuberous ligament',
  서혜인대: 'inguinal ligament',

  // === 무릎 인대 ===
  전방십자인대: 'anterior cruciate ligament',
  후방십자인대: 'posterior cruciate ligament',
  내측측부인대: 'medial collateral ligament',
  외측측부인대: 'lateral collateral ligament',
  슬개인대: 'patellar ligament',
  반월대퇴인대: 'meniscofemoral ligament',

  // === 발목 인대 ===
  삼각인대: 'deltoid ligament',
  전거비인대: 'anterior talofibular ligament',
  후거비인대: 'posterior talofibular ligament',
  종비인대: 'calcaneofibular ligament',
  스프링인대: 'spring ligament',
  이분인대: 'bifurcate ligament',
};

export const ARTICULAR_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(ARTICULAR_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
