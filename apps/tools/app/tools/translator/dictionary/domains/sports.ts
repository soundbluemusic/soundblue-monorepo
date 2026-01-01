// ========================================
// Sports Domain Dictionary - 스포츠 도메인 사전
// 스포츠 종목, 대회, 용어
// ========================================

export const SPORTS_KO_EN: Record<string, string> = {
  // === 기본 스포츠 (Basic Sports) ===
  축구: 'soccer',
  야구: 'baseball',
  농구: 'basketball',
  배구: 'volleyball',
  테니스: 'tennis',
  탁구: 'table tennis',
  배드민턴: 'badminton',
  골프: 'golf',
  수영: 'swimming',
  달리기: 'running',
  마라톤: 'marathon',
  조깅: 'jogging',
  등산: 'hiking',
  사이클링: 'cycling',
  스키: 'skiing',
  스노보드: 'snowboarding',
  스케이트: 'skating',
  복싱: 'boxing',
  태권도: 'taekwondo',
  유도: 'judo',
  검도: 'kendo',
  합기도: 'hapkido',
  요가: 'yoga',
  웨이트: 'weight training',
  크로스핏: 'CrossFit',
  줄넘기: 'jump rope',
  볼링: 'bowling',
  당구: 'billiards',
  양궁: 'archery',
  펜싱: 'fencing',
  승마: 'horse riding',
  서핑: 'surfing',
  다이빙: 'diving',
  낚시: 'fishing',
  캠핑: 'camping',
  시합: 'match',
  대회: 'competition',
  올림픽: 'Olympics',
  월드컵: 'World Cup',
  챔피언: 'champion',
  우승: 'victory',
  금메달: 'gold medal',
  은메달: 'silver medal',
  동메달: 'bronze medal',

  // === 수영 (Swimming) ===
  // --- 경영 (Swimming) ---
  자유형: 'freestyle',
  '자유형 50m': '50m freestyle',
  '자유형 100m': '100m freestyle',
  '자유형 200m': '200m freestyle',
  '자유형 400m': '400m freestyle',
  '자유형 800m': '800m freestyle',
  '자유형 1500m': '1500m freestyle',
  배영: 'backstroke',
  '배영 100m': '100m backstroke',
  '배영 200m': '200m backstroke',
  평영: 'breaststroke',
  '평영 100m': '100m breaststroke',
  '평영 200m': '200m breaststroke',
  접영: 'butterfly',
  '접영 100m': '100m butterfly',
  '접영 200m': '200m butterfly',
  개인혼영: 'individual medley',
  '개인혼영 200m': '200m individual medley',
  '개인혼영 400m': '400m individual medley',
  계영: 'freestyle relay',
  혼계영: 'medley relay',
  '혼성 혼계영': 'mixed medley relay',
  // --- 다이빙 (Diving) ---
  스프링보드: 'springboard',
  '1m 스프링보드': '1m springboard',
  '3m 스프링보드': '3m springboard',
  플랫폼: 'platform',
  '10m 플랫폼': '10m platform',
  '싱크로나이즈드 다이빙': 'synchronized diving',
  하이다이빙: 'high diving',
  // --- 아티스틱 스위밍 (Artistic Swimming) ---
  아티스틱스위밍: 'artistic swimming',
  싱크로나이즈드스위밍: 'synchronized swimming',
  듀엣: 'duet',
  아크로바틱: 'acrobatic',
  // --- 수구 (Water Polo) ---
  수구: 'water polo',
  // --- 오픈워터 수영 (Marathon Swimming) ---
  오픈워터: 'open water',
  '마라톤 수영': 'marathon swimming',
  '10km 오픈워터': '10km marathon swimming',

  // === 육상 (Athletics) ===
  // --- 트랙 - 단거리 (Sprints) ---
  단거리: 'sprint',
  '100m': '100 metres',
  '200m': '200 metres',
  '400m': '400 metres',
  // --- 트랙 - 중거리 (Middle Distance) ---
  중거리: 'middle distance',
  '800m': '800 metres',
  '1500m': '1500 metres',
  // --- 트랙 - 장거리 (Long Distance) ---
  장거리: 'long distance',
  '5000m': '5000 metres',
  '10000m': '10000 metres',
  // --- 트랙 - 허들 (Hurdles) ---
  '100m 허들': '100m hurdles',
  '110m 허들': '110m hurdles',
  '400m 허들': '400m hurdles',
  // --- 트랙 - 장애물 (Steeplechase) ---
  장애물경주: 'steeplechase',
  '3000m 장애물': '3000m steeplechase',
  // --- 트랙 - 계주 (Relay) ---
  계주: 'relay',
  '4x100m 계주': '4x100m relay',
  '4x400m 계주': '4x400m relay',
  '혼성 계주': 'mixed relay',
  // --- 도로 - 경보 (Race Walking) ---
  경보: 'race walk',
  '20km 경보': '20km race walk',
  '35km 경보': '35km race walk',
  // --- 필드 - 도약 (Jumps) ---
  높이뛰기: 'high jump',
  장대높이뛰기: 'pole vault',
  멀리뛰기: 'long jump',
  세단뛰기: 'triple jump',
  // --- 필드 - 투척 (Throws) ---
  포환던지기: 'shot put',
  원반던지기: 'discus throw',
  해머던지기: 'hammer throw',
  창던지기: 'javelin throw',
  // --- 복합 경기 (Combined Events) ---
  '10종경기': 'decathlon',
  십종경기: 'decathlon',
  '7종경기': 'heptathlon',
  칠종경기: 'heptathlon',

  // === 체조 (Gymnastics) ===
  체조: 'gymnastics',
  기계체조: 'artistic gymnastics',
  // --- 기계체조 - 남자 ---
  마루운동: 'floor exercise',
  안마: 'pommel horse',
  링: 'rings',
  도마: 'vault',
  평행봉: 'parallel bars',
  철봉: 'horizontal bar',
  개인종합: 'individual all-around',
  단체종합: 'team all-around',
  // --- 기계체조 - 여자 ---
  이단평행봉: 'uneven bars',
  평균대: 'balance beam',
  // --- 리듬체조 (Rhythmic Gymnastics) ---
  리듬체조: 'rhythmic gymnastics',
  후프: 'hoop',
  볼: 'ball',
  곤봉: 'clubs',
  리본: 'ribbon',
  // --- 트램펄린 (Trampoline) ---
  트램펄린: 'trampoline',

  // === 펜싱 (Fencing) ===
  에페: 'épée',
  '에페 개인': 'individual épée',
  '에페 단체': 'team épée',
  플뢰레: 'foil',
  '플뢰레 개인': 'individual foil',
  '플뢰레 단체': 'team foil',
  사브르: 'sabre',
  '사브르 개인': 'individual sabre',
  '사브르 단체': 'team sabre',

  // === 격투기 (Combat Sports) ===
  // --- 복싱 (Boxing) ---
  플라이급: 'flyweight',
  페더급: 'featherweight',
  라이트급: 'lightweight',
  웰터급: 'welterweight',
  미들급: 'middleweight',
  라이트헤비급: 'light heavyweight',
  헤비급: 'heavyweight',
  슈퍼헤비급: 'super heavyweight',
  밴텀급: 'bantamweight',
  // --- 유도 (Judo) ---
  '60kg급': '60kg',
  '66kg급': '66kg',
  '73kg급': '73kg',
  '81kg급': '81kg',
  '90kg급': '90kg',
  '100kg급': '100kg',
  '100kg 초과급': 'over 100kg',
  '48kg급': '48kg',
  '52kg급': '52kg',
  '57kg급': '57kg',
  '63kg급': '63kg',
  '70kg급': '70kg',
  '78kg급': '78kg',
  '78kg 초과급': 'over 78kg',
  '혼성 단체전': 'mixed team',
  // --- 태권도 (Taekwondo) ---
  '58kg급': '58kg',
  '68kg급': '68kg',
  '80kg급': '80kg',
  '80kg 초과급': 'over 80kg',
  '49kg급': '49kg',
  '67kg급': '67kg',
  '67kg 초과급': 'over 67kg',
  // --- 레슬링 (Wrestling) ---
  레슬링: 'wrestling',
  '자유형 레슬링': 'freestyle wrestling',
  그레코로만형: 'Greco-Roman',
  '그레코로만형 레슬링': 'Greco-Roman wrestling',
  // --- 가라테 (Karate) ---
  가라테: 'karate',
  가타: 'kata',
  쿠미테: 'kumite',
  // --- 우슈 (Wushu) ---
  우슈: 'wushu',
  장권: 'changquan',
  남권: 'nanquan',
  태극권: 'taijiquan',
  검술: 'jianshu',
  도술: 'daoshu',
  곤술: 'gunshu',
  창술: 'qiangshu',
  산다: 'sanda',
  // --- 주짓수 (Jiu-Jitsu) ---
  주짓수: 'jiu-jitsu',
  네와자: 'ne-waza',
  // --- 삼보 (Sambo) ---
  삼보: 'sambo',
  '스포츠 삼보': 'sport sambo',
  '콤뱃 삼보': 'combat sambo',
  // --- 쿠라시 (Kurash) ---
  쿠라시: 'kurash',

  // === 사격 (Shooting) ===
  사격: 'shooting',
  // --- 권총 (Pistol) ---
  공기권총: 'air pistol',
  '10m 공기권총': '10m air pistol',
  '25m 권총': '25m pistol',
  '25m 속사권총': '25m rapid fire pistol',
  속사권총: 'rapid fire pistol',
  // --- 소총 (Rifle) ---
  공기소총: 'air rifle',
  '10m 공기소총': '10m air rifle',
  '50m 소총 3자세': '50m rifle 3 positions',
  '50m 소총 복사': '50m rifle prone',
  // --- 클레이 (Shotgun) ---
  클레이: 'clay shooting',
  트랩: 'trap',
  더블트랩: 'double trap',
  스키트: 'skeet',

  // === 양궁 (Archery) ===
  개인전: 'individual',
  단체전: 'team',
  컴파운드: 'compound',
  '컴파운드 개인전': 'compound individual',
  '컴파운드 단체전': 'compound team',
  '컴파운드 혼성전': 'compound mixed team',

  // === 사이클 (Cycling) ===
  사이클: 'cycling',
  // --- 도로 (Road) ---
  '도로 경주': 'road race',
  도로경주: 'road race',
  '개인 독주': 'individual time trial',
  개인독주: 'individual time trial',
  타임트라이얼: 'time trial',
  // --- 트랙 (Track) ---
  스프린트: 'sprint',
  '팀 스프린트': 'team sprint',
  팀스프린트: 'team sprint',
  케이린: 'keirin',
  '개인 추월': 'individual pursuit',
  개인추월: 'individual pursuit',
  '팀 추월': 'team pursuit',
  팀추월: 'team pursuit',
  옴니엄: 'omnium',
  매디슨: 'madison',
  '포인트 레이스': 'points race',
  포인트레이스: 'points race',
  스크래치: 'scratch race',
  '1km 독주': '1km time trial',
  '500m 독주': '500m time trial',
  // --- 산악자전거 (Mountain Bike) ---
  산악자전거: 'mountain bike',
  MTB: 'mountain bike',
  크로스컨트리: 'cross-country',
  다운힐: 'downhill',
  // --- BMX ---
  'BMX 레이싱': 'BMX racing',
  BMX레이싱: 'BMX racing',
  'BMX 프리스타일': 'BMX freestyle',
  BMX프리스타일: 'BMX freestyle',

  // === 조정 (Rowing) ===
  조정: 'rowing',
  '싱글 스컬': 'single sculls',
  싱글스컬: 'single sculls',
  '더블 스컬': 'double sculls',
  더블스컬: 'double sculls',
  '쿼드러플 스컬': 'quadruple sculls',
  쿼드러플스컬: 'quadruple sculls',
  페어: 'pair',
  포어: 'four',
  에이트: 'eight',
  '경량급 더블 스컬': 'lightweight double sculls',

  // === 카누 (Canoeing) ===
  카누: 'canoe',
  카약: 'kayak',
  // --- 스프린트 (Sprint) ---
  '카약 싱글': 'kayak single',
  '카약 더블': 'kayak double',
  '카약 포어': 'kayak four',
  '카누 싱글': 'canoe single',
  '카누 더블': 'canoe double',
  // --- 슬라럼 (Slalom) ---
  슬라럼: 'slalom',
  '카약 크로스': 'kayak cross',
  // --- 드래곤보트 (Dragon Boat) ---
  드래곤보트: 'dragon boat',

  // === 요트 (Sailing) ===
  요트: 'sailing',
  윈드서핑: 'windsurfing',
  딩기: 'dinghy',
  스키프: 'skiff',
  멀티헐: 'multihull',
  카이트보딩: 'kiteboarding',

  // === 승마 (Equestrian) ===
  마장마술: 'dressage',
  '마장마술 개인': 'dressage individual',
  '마장마술 단체': 'dressage team',
  '장애물 비월': 'show jumping',
  장애물비월: 'show jumping',
  '장애물 비월 개인': 'jumping individual',
  '장애물 비월 단체': 'jumping team',
  종합마술: 'eventing',
  '종합마술 개인': 'eventing individual',
  '종합마술 단체': 'eventing team',

  // === 구기 (Ball Sports) ===
  '3x3 농구': '3x3 basketball',
  비치발리볼: 'beach volleyball',
  비치볼리볼: 'beach volleyball',
  핸드볼: 'handball',
  소프트볼: 'softball',
  럭비: 'rugby',
  '럭비 세븐스': 'rugby sevens',
  럭비세븐스: 'rugby sevens',
  필드하키: 'field hockey',
  하키: 'hockey',
  크리켓: 'cricket',

  // === 라켓 스포츠 (Racket Sports) ===
  단식: 'singles',
  복식: 'doubles',
  혼합복식: 'mixed doubles',
  스쿼시: 'squash',
  소프트테니스: 'soft tennis',

  // === 역도 (Weightlifting) ===
  역도: 'weightlifting',
  인상: 'snatch',
  용상: 'clean and jerk',
  합계: 'total',
  '55kg급': '55kg',
  '61kg급': '61kg',
  '71kg급': '71kg',
  '76kg급': '76kg',
  '87kg급': '87kg',
  '87kg 초과급': 'over 87kg',
  '89kg급': '89kg',
  '96kg급': '96kg',
  '102kg급': '102kg',
  '102kg 초과급': 'over 102kg',
  '125kg급': '125kg',
  '130kg급': '130kg',

  // === 근대5종 (Modern Pentathlon) ===
  근대5종: 'modern pentathlon',
  근대오종: 'modern pentathlon',
  레이저런: 'laser run',

  // === 트라이애슬론 (Triathlon) ===
  트라이애슬론: 'triathlon',
  철인3종: 'triathlon',

  // === 도시형 스포츠 (Urban Sports) ===
  // --- 스케이트보드 (Skateboarding) ---
  스케이트보드: 'skateboarding',
  스트리트: 'street',
  파크: 'park',
  // --- 스포츠클라이밍 (Sport Climbing) ---
  스포츠클라이밍: 'sport climbing',
  리드: 'lead',
  볼더링: 'bouldering',
  스피드: 'speed',
  복합: 'combined',
  // --- 서핑 (Surfing) ---
  숏보드: 'shortboard',
  // --- 브레이킹 (Breaking) ---
  브레이킹: 'breaking',
  비보이: 'b-boy',
  비걸: 'b-girl',
  // --- 롤러스케이트 (Roller Skating) ---
  롤러스케이트: 'roller skating',
  인라인스케이트: 'inline skating',
  '인라인 하키': 'inline hockey',
  인라인하키: 'inline hockey',

  // === 볼링 (Bowling) ===
  싱글: 'singles',
  더블: 'doubles',
  트리오: 'trios',
  팀: 'team',
  올이벤트: 'all events',
  마스터스: 'masters',

  // === 당구 (Billiards) ===
  '3쿠션': '3-cushion',
  캐롬: 'carom',
  '캐롬 3쿠션': 'carom 3-cushion',
  포켓볼: 'pool',
  '9볼': '9-ball',
  '10볼': '10-ball',
  스누커: 'snooker',

  // === 아시아 전통 스포츠 (Asian Traditional Sports) ===
  세팍타크로: 'sepak takraw',
  레구: 'regu',
  카바디: 'kabaddi',

  // === 마인드 스포츠 (Mind Sports) ===
  바둑: 'go',
  체스: 'chess',
  스탠다드: 'standard',
  래피드: 'rapid',
  블리츠: 'blitz',
  브릿지: 'bridge',
  // --- e스포츠 (Esports) ---
  e스포츠: 'esports',
  이스포츠: 'esports',
  '리그 오브 레전드': 'League of Legends',
  롤: 'League of Legends',
  LoL: 'League of Legends',
  '아레나 오브 발로': 'Arena of Valor',
  'FIFA 온라인': 'EA Sports FC',
  피파온라인: 'EA Sports FC',
  'DOTA 2': 'Dota 2',
  도타: 'Dota 2',
  '스트리트 파이터': 'Street Fighter',
  스트리트파이터: 'Street Fighter',
  배그: 'PUBG',
  배틀그라운드: 'PUBG',
  'PUBG 모바일': 'PUBG Mobile',

  // === 수상 스포츠 (Water Sports) ===
  수상스키: 'water ski',
  웨이크보드: 'wakeboard',
  제트스키: 'jet ski',
  런어바웃: 'runabout',
};

export const SPORTS_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(SPORTS_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
