// ========================================
// Muscular System - 근육계
// ========================================

export const MUSCULAR_KO_EN: Record<string, string> = {
  // === 표정근 (Muscles of Facial Expression) ===
  전두근: 'frontalis',
  후두근: 'occipitalis',
  추미근: 'corrugator supercilii',
  눈둘레근: 'orbicularis oculi',
  비근: 'procerus',
  비익근: 'nasalis',
  코내림근: 'depressor septi nasi',
  입둘레근: 'orbicularis oris',
  상순거근: 'levator labii superioris',
  상순비익거근: 'levator labii superioris alaeque nasi',
  소관골근: 'zygomaticus minor',
  대관골근: 'zygomaticus major',
  소근: 'risorius',
  하순하제근: 'depressor labii inferioris',
  이근: 'mentalis',
  구각하제근: 'depressor anguli oris',
  협근: 'buccinator',
  광경근: 'platysma',

  // === 저작근 (Muscles of Mastication) ===
  교근: 'masseter',
  측두근: 'temporalis',
  내측익돌근: 'medial pterygoid',
  외측익돌근: 'lateral pterygoid',

  // === 안구 근육 (Extraocular Muscles) ===
  상직근: 'superior rectus',
  하직근: 'inferior rectus',
  내측직근: 'medial rectus',
  외측직근: 'lateral rectus',
  상사근: 'superior oblique',
  하사근: 'inferior oblique',
  상안검거근: 'levator palpebrae superioris',

  // === 혀 근육 (Tongue Muscles) ===
  이설근: 'genioglossus',
  설골설근: 'hyoglossus',
  경상설근: 'styloglossus',
  구개설근: 'palatoglossus',
  상종설근: 'superior longitudinal',
  하종설근: 'inferior longitudinal',
  횡설근: 'transverse',
  수직설근: 'vertical',

  // === 전경부 (Anterior Neck) ===
  흉쇄유돌근: 'sternocleidomastoid',
  사각근: 'scalene muscles',
  전사각근: 'anterior scalene',
  중사각근: 'middle scalene',
  후사각근: 'posterior scalene',
  경장근: 'longus colli',
  두장근: 'longus capitis',
  전두직근: 'rectus capitis anterior',
  외측두직근: 'rectus capitis lateralis',

  // === 설골상근 (Suprahyoid Muscles) ===
  이복근: 'digastric',
  악설골근: 'mylohyoid',
  이설골근: 'geniohyoid',
  경돌설골근: 'stylohyoid',

  // === 설골하근 (Infrahyoid Muscles) ===
  흉골설골근: 'sternohyoid',
  흉골갑상근: 'sternothyroid',
  갑상설골근: 'thyrohyoid',
  견갑설골근: 'omohyoid',

  // === 등 표층근 (Superficial Back) ===
  승모근: 'trapezius',
  광배근: 'latissimus dorsi',
  견갑거근: 'levator scapulae',
  대능형근: 'rhomboid major',
  소능형근: 'rhomboid minor',

  // === 등 중간층근 (Intermediate Back) ===
  상후거근: 'serratus posterior superior',
  하후거근: 'serratus posterior inferior',

  // === 척추세움근 (Erector Spinae) ===
  장늑근: 'iliocostalis',
  최장근: 'longissimus',
  극근: 'spinalis',

  // === 횡극근 (Transversospinalis) ===
  반극근: 'semispinalis',
  다열근: 'multifidus',
  회선근: 'rotatores',

  // === 분절근 (Segmental) ===
  극간근: 'interspinales',
  횡돌기간근: 'intertransversarii',

  // === 후두하근 (Suboccipital) ===
  대후두직근: 'rectus capitis posterior major',
  소후두직근: 'rectus capitis posterior minor',
  상두사근: 'obliquus capitis superior',
  하두사근: 'obliquus capitis inferior',

  // === 흉부 근육 (Chest Muscles) ===
  대흉근: 'pectoralis major',
  소흉근: 'pectoralis minor',
  쇄골하근: 'subclavius',
  전거근: 'serratus anterior',
  외늑간근: 'external intercostals',
  내늑간근: 'internal intercostals',
  최내늑간근: 'innermost intercostals',
  늑골하근: 'subcostalis',
  흉횡근: 'transversus thoracis',
  횡격막: 'diaphragm',

  // === 복부 근육 (Abdominal Muscles) ===
  복직근: 'rectus abdominis',
  외복사근: 'external oblique',
  내복사근: 'internal oblique',
  복횡근: 'transversus abdominis',
  추체근: 'pyramidalis',
  요방형근: 'quadratus lumborum',
  대요근: 'psoas major',
  소요근: 'psoas minor',
  장골근: 'iliacus',
  장요근: 'iliopsoas',
  백선: 'linea alba',
  반월선: 'linea semilunaris',
  건획: 'tendinous intersection',

  // === 어깨 근육 (Shoulder Muscles) ===
  삼각근: 'deltoid',
  극상근: 'supraspinatus',
  극하근: 'infraspinatus',
  소원근: 'teres minor',
  대원근: 'teres major',
  견갑하근: 'subscapularis',
  회전근개: 'rotator cuff',

  // === 상완 근육 (Arm Muscles) ===
  상완이두근: 'biceps brachii',
  상완근: 'brachialis',
  오훼완근: 'coracobrachialis',
  상완삼두근: 'triceps brachii',
  주근: 'anconeus',

  // === 전완 전면 표층 (Anterior Superficial Forearm) ===
  원회내근: 'pronator teres',
  요측수근굴근: 'flexor carpi radialis',
  장장근: 'palmaris longus',
  척측수근굴근: 'flexor carpi ulnaris',
  천지굴근: 'flexor digitorum superficialis',

  // === 전완 전면 심층 (Anterior Deep Forearm) ===
  심지굴근: 'flexor digitorum profundus',
  장무지굴근: 'flexor pollicis longus',
  방형회내근: 'pronator quadratus',

  // === 전완 후면 표층 (Posterior Superficial Forearm) ===
  완요골근: 'brachioradialis',
  장요측수근신근: 'extensor carpi radialis longus',
  단요측수근신근: 'extensor carpi radialis brevis',
  지신근: 'extensor digitorum',
  소지신근: 'extensor digiti minimi',
  척측수근신근: 'extensor carpi ulnaris',

  // === 전완 후면 심층 (Posterior Deep Forearm) ===
  회외근: 'supinator',
  장무지외전근: 'abductor pollicis longus',
  단무지신근: 'extensor pollicis brevis',
  장무지신근: 'extensor pollicis longus',
  시지신근: 'extensor indicis',

  // === 손 무지구근 (Thenar) ===
  단무지외전근: 'abductor pollicis brevis',
  단무지굴근: 'flexor pollicis brevis',
  무지대립근: 'opponens pollicis',
  무지내전근: 'adductor pollicis',

  // === 손 소지구근 (Hypothenar) ===
  소지외전근: 'abductor digiti minimi',
  단소지굴근: 'flexor digiti minimi brevis',
  소지대립근: 'opponens digiti minimi',
  단장근: 'palmaris brevis',

  // === 손 중간근 (Intermediate Hand) ===
  충양근: 'lumbricals',
  골간근: 'interossei',
  배측골간근: 'dorsal interossei',
  장측골간근: 'palmar interossei',

  // === 골반저 근육 (Pelvic Floor Muscles) ===
  항문거근: 'levator ani',
  치골미골근: 'pubococcygeus',
  치골직장근: 'puborectalis',
  장골미골근: 'iliococcygeus',
  미골근: 'coccygeus',
  외항문괄약근: 'external anal sphincter',
  내항문괄약근: 'internal anal sphincter',
  외요도괄약근: 'external urethral sphincter',
  좌골해면체근: 'ischiocavernosus',
  구해면체근: 'bulbospongiosus',
  회음횡근: 'transverse perineal',

  // === 둔부 근육 (Gluteal Muscles) ===
  대둔근: 'gluteus maximus',
  중둔근: 'gluteus medius',
  소둔근: 'gluteus minimus',
  대퇴근막장근: 'tensor fasciae latae',
  이상근: 'piriformis',
  상쌍자근: 'superior gemellus',
  하쌍자근: 'inferior gemellus',
  내폐쇄근: 'obturator internus',
  외폐쇄근: 'obturator externus',
  대퇴방형근: 'quadratus femoris',
  장골근막: 'iliotibial band',

  // === 대퇴 전면 (Anterior Thigh) ===
  대퇴사두근: 'quadriceps femoris',
  대퇴직근: 'rectus femoris',
  외측광근: 'vastus lateralis',
  내측광근: 'vastus medialis',
  중간광근: 'vastus intermedius',
  봉공근: 'sartorius',

  // === 대퇴 내측/내전근 (Medial/Adductor Thigh) ===
  치골근: 'pectineus',
  장내전근: 'adductor longus',
  단내전근: 'adductor brevis',
  대내전근: 'adductor magnus',
  박근: 'gracilis',

  // === 대퇴 후면/햄스트링 (Posterior/Hamstring Thigh) ===
  햄스트링: 'hamstrings',
  대퇴이두근: 'biceps femoris',
  반건양근: 'semitendinosus',
  반막양근: 'semimembranosus',

  // === 하퇴 전면 (Anterior Leg) ===
  전경골근: 'tibialis anterior',
  장지신근: 'extensor digitorum longus',
  장무지신근2: 'extensor hallucis longus',
  제삼비골근: 'fibularis tertius',

  // === 하퇴 외측 (Lateral Leg) ===
  장비골근: 'fibularis longus',
  단비골근: 'fibularis brevis',

  // === 하퇴 후면 표층 (Posterior Superficial Leg) ===
  비복근: 'gastrocnemius',
  가자미근: 'soleus',
  족저근: 'plantaris',
  아킬레스건: 'Achilles tendon',
  종아리삼두근: 'triceps surae',

  // === 하퇴 후면 심층 (Posterior Deep Leg) ===
  슬와근: 'popliteus',
  후경골근: 'tibialis posterior',
  장지굴근: 'flexor digitorum longus',
  장무지굴근2: 'flexor hallucis longus',

  // === 발 족배 (Dorsal Foot) ===
  단지신근: 'extensor digitorum brevis',
  단무지신근2: 'extensor hallucis brevis',

  // === 발 족저 (Plantar Foot) ===
  무지외전근: 'abductor hallucis',
  단지굴근: 'flexor digitorum brevis',
  족저방형근: 'quadratus plantae',
  무지내전근2: 'adductor hallucis',
  저측골간근: 'plantar interossei',

  // === 근육 구조 (Muscle Structure) ===
  근섬유: 'muscle fiber',
  근원섬유: 'myofibril',
  근절: 'sarcomere',
  액틴: 'actin',
  미오신: 'myosin',
  근형질: 'sarcoplasm',
  근형질세망: 'sarcoplasmic reticulum',
  근초: 'sarcolemma',
  근내막: 'endomysium',
  근주막: 'perimysium',
  근외막: 'epimysium',
  근막: 'fascia',
  건: 'tendon',
  건막: 'aponeurosis',
  근방추: 'muscle spindle',
  골지건기관: 'Golgi tendon organ',
  운동단위: 'motor unit',
  신경근접합부: 'neuromuscular junction',
};

export const MUSCULAR_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(MUSCULAR_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
