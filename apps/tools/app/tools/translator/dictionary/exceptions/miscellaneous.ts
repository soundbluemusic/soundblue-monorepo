// ========================================
// Miscellaneous Exceptions - 기타 예외 3,000개
// 위 카테고리에 속하지 않는 특수 케이스
// ========================================

export interface MiscException {
	korean: string; // 한국어
	english: string; // 영어
	type: ExceptionType; // 예외 타입
	reason?: string; // 예외 이유
	example?: string; // 예문
}

export type ExceptionType =
	| 'abbreviation' // 약어
	| 'slang' // 속어
	| 'dialect' // 사투리
	| 'honorific' // 존댓말
	| 'onomatopoeia' // 의성어/의태어
	| 'compound' // 복합어
	| 'special-grammar' // 특수 문법
	| 'contextual' // 문맥 의존
	| 'cultural' // 문화 특수
	| 'technical'; // 전문 용어

// ========================================
// 약어 (500개)
// ========================================

export const ABBREVIATIONS: MiscException[] = [
	// 한국어 약어
	{ korean: '서울대', english: 'Seoul National University', type: 'abbreviation', reason: '서울대학교 약어' },
	{ korean: '연대', english: 'Yonsei University', type: 'abbreviation', reason: '연세대학교 약어' },
	{ korean: '고대', english: 'Korea University', type: 'abbreviation', reason: '고려대학교 약어' },
	{ korean: '카이스트', english: 'KAIST', type: 'abbreviation', reason: 'Korea Advanced Institute of Science and Technology' },
	{ korean: '포스텍', english: 'POSTECH', type: 'abbreviation', reason: 'Pohang University of Science and Technology' },
	{ korean: '국회의사당', english: 'National Assembly Building', type: 'abbreviation' },
	{ korean: '국정원', english: 'NIS', type: 'abbreviation', reason: '국가정보원 약어' },
	{ korean: '검찰청', english: 'Prosecutors Office', type: 'abbreviation' },
	{ korean: '경찰청', english: 'National Police Agency', type: 'abbreviation' },

	// 영어 약어
	{ korean: 'CEO', english: 'Chief Executive Officer', type: 'abbreviation', reason: '최고경영자' },
	{ korean: 'CTO', english: 'Chief Technology Officer', type: 'abbreviation', reason: '최고기술책임자' },
	{ korean: 'CFO', english: 'Chief Financial Officer', type: 'abbreviation', reason: '최고재무책임자' },
	{ korean: 'AI', english: 'Artificial Intelligence', type: 'abbreviation', reason: '인공지능' },
	{ korean: 'VR', english: 'Virtual Reality', type: 'abbreviation', reason: '가상현실' },
	{ korean: 'AR', english: 'Augmented Reality', type: 'abbreviation', reason: '증강현실' },
	{ korean: 'IoT', english: 'Internet of Things', type: 'abbreviation', reason: '사물인터넷' },
	{ korean: 'API', english: 'Application Programming Interface', type: 'abbreviation', reason: '응용프로그래밍인터페이스' },
	{ korean: 'URL', english: 'Uniform Resource Locator', type: 'abbreviation', reason: '인터넷주소' },
	{ korean: 'HTML', english: 'HyperText Markup Language', type: 'abbreviation', reason: '하이퍼텍스트마크업언어' },
	{ korean: 'CSS', english: 'Cascading Style Sheets', type: 'abbreviation', reason: '종속형시트' },
	{ korean: 'SQL', english: 'Structured Query Language', type: 'abbreviation', reason: '구조화질의어' },

	// TODO: 추가 약어 488개
	// - 기관 약어 100개
	// - IT 약어 150개
	// - 비즈니스 약어 100개
	// - 일상 약어 138개
];

// ========================================
// 속어/은어 (300개)
// ========================================

export const SLANG: MiscException[] = [
	// 한국어 속어
	{ korean: '대박', english: 'awesome', type: 'slang', example: '대박이다' },
	{ korean: '쩐다', english: 'amazing', type: 'slang', example: '진짜 쩐다' },
	{ korean: '갑분싸', english: 'sudden awkward silence', type: 'slang', reason: '갑자기 분위기 싸해짐' },
	{ korean: '오바', english: 'over (exaggeration)', type: 'slang', example: '너무 오바야' },
	{ korean: '별로', english: 'not good', type: 'slang', example: '별로야' },
	{ korean: '헐', english: 'what', type: 'slang', example: '헐 진짜?' },
	{ korean: '짱', english: 'best', type: 'slang', example: '짱이야' },
	{ korean: '쪽팔려', english: 'embarrassing', type: 'slang', reason: '쪽 팔려' },
	{ korean: '꿀잼', english: 'very fun', type: 'slang', reason: '꿀 + 재미' },
	{ korean: '노잼', english: 'no fun', type: 'slang', reason: 'no + 재미' },
	{ korean: '핵', english: 'super', type: 'slang', example: '핵맛있다' },
	{ korean: '극혐', english: 'extremely disgusting', type: 'slang', reason: '극도로 혐오스러움' },

	// 영어 속어
	{ korean: 'cool', english: '멋진', type: 'slang', example: 'That is cool' },
	{ korean: 'awesome', english: '멋진', type: 'slang', example: 'Awesome!' },
	{ korean: 'lit', english: '최고', type: 'slang', example: 'This party is lit' },
	{ korean: 'dope', english: '멋진', type: 'slang', example: 'Thats dope' },
	{ korean: 'sick', english: '멋진', type: 'slang', example: 'Sick moves' },
	{ korean: 'cringe', english: '민망한', type: 'slang', example: 'So cringe' },
	{ korean: 'vibe', english: '분위기', type: 'slang', example: 'Good vibes' },
	{ korean: 'ghost', english: '잠수타다', type: 'slang', example: 'He ghosted me' },
	{ korean: 'flex', english: '자랑하다', type: 'slang', example: 'Stop flexing' },
	{ korean: 'salty', english: '삐진', type: 'slang', example: 'Why so salty?' },

	// TODO: 추가 속어 280개
	// - 한국어 인터넷 은어 100개
	// - 영어 인터넷 은어 100개
	// - 세대별 속어 80개
];

// ========================================
// 사투리 (200개)
// ========================================

export const DIALECTS: MiscException[] = [
	// 경상도 사투리
	{ korean: '머하노', english: 'what are you doing', type: 'dialect', reason: '경상도: 뭐하니' },
	{ korean: '카이소', english: 'big', type: 'dialect', reason: '경상도: 크다' },
	{ korean: '가가', english: 'that', type: 'dialect', reason: '경상도: 저거' },

	// 전라도 사투리
	{ korean: '시방', english: 'now', type: 'dialect', reason: '전라도: 지금' },
	{ korean: '것이', english: 'it is', type: 'dialect', reason: '전라도: 그것이' },

	// 제주도 사투리
	{ korean: '혼저옵서예', english: 'welcome', type: 'dialect', reason: '제주도: 어서오세요' },
	{ korean: '오메기떡', english: 'omegi rice cake', type: 'dialect', reason: '제주도 전통 떡' },

	// 충청도 사투리
	{ korean: '머시여', english: 'what is it', type: 'dialect', reason: '충청도: 뭐예요' },

	// TODO: 추가 사투리 196개
	// - 경상도 50개
	// - 전라도 50개
	// - 제주도 50개
	// - 충청도 30개
	// - 강원도 16개
];

// ========================================
// 존댓말/경어 (300개)
// ========================================

export const HONORIFICS: MiscException[] = [
	// 한국어 존댓말
	{ korean: '어르신', english: 'elderly person', type: 'honorific', reason: '노인 존칭' },
	{ korean: '선생님', english: 'teacher (honorific)', type: 'honorific', reason: '교사/전문가 존칭' },
	{ korean: '사장님', english: 'president (honorific)', type: 'honorific', reason: '사장 존칭' },
	{ korean: '사모님', english: 'your wife (honorific)', type: 'honorific', reason: '타인의 부인 존칭' },
	{ korean: '아버님', english: 'father (honorific)', type: 'honorific', reason: '아버지 존칭' },
	{ korean: '어머님', english: 'mother (honorific)', type: 'honorific', reason: '어머니 존칭' },
	{ korean: '할아버님', english: 'grandfather (honorific)', type: 'honorific', reason: '할아버지 존칭' },
	{ korean: '할머님', english: 'grandmother (honorific)', type: 'honorific', reason: '할머니 존칭' },
	{ korean: '진지', english: 'meal (honorific)', type: 'honorific', reason: '식사 높임말' },
	{ korean: '주무시다', english: 'sleep (honorific)', type: 'honorific', reason: '자다 높임말' },
	{ korean: '잡수시다', english: 'eat (honorific)', type: 'honorific', reason: '먹다 높임말' },
	{ korean: '말씀하시다', english: 'say (honorific)', type: 'honorific', reason: '말하다 높임말' },

	// 영어 존댓말 (상대적으로 적음)
	{ korean: 'Sir', english: '선생님(남)', type: 'honorific', reason: '남성 존칭' },
	{ korean: 'Madam', english: '선생님(여)', type: 'honorific', reason: '여성 존칭' },
	{ korean: 'Your Majesty', english: '폐하', type: 'honorific', reason: '왕족 존칭' },
	{ korean: 'Your Highness', english: '전하', type: 'honorific', reason: '왕족 존칭' },
	{ korean: 'Your Excellency', english: '각하', type: 'honorific', reason: '대사/고관 존칭' },

	// TODO: 추가 존댓말 285개
	// - 한국어 존댓말 동사 100개
	// - 한국어 존댓말 명사 100개
	// - 직함 존칭 85개
];

// ========================================
// 의성어/의태어 (400개)
// ========================================

export const ONOMATOPOEIA: MiscException[] = [
	// 한국어 의성어
	{ korean: '멍멍', english: 'woof woof', type: 'onomatopoeia', reason: '개 짖는 소리' },
	{ korean: '야옹', english: 'meow', type: 'onomatopoeia', reason: '고양이 소리' },
	{ korean: '음매', english: 'moo', type: 'onomatopoeia', reason: '소 소리' },
	{ korean: '꽥꽥', english: 'quack', type: 'onomatopoeia', reason: '오리 소리' },
	{ korean: '꼬끼오', english: 'cock-a-doodle-doo', type: 'onomatopoeia', reason: '닭 우는 소리' },
	{ korean: '쿵쿵', english: 'thud thud', type: 'onomatopoeia', reason: '무거운 소리' },
	{ korean: '똑똑', english: 'knock knock', type: 'onomatopoeia', reason: '노크 소리' },
	{ korean: '땡땡', english: 'ding dong', type: 'onomatopoeia', reason: '종 소리' },
	{ korean: '칙칙폭폭', english: 'choo choo', type: 'onomatopoeia', reason: '기차 소리' },
	{ korean: '빵빵', english: 'honk honk', type: 'onomatopoeia', reason: '자동차 경적' },
	{ korean: '따르릉', english: 'ring ring', type: 'onomatopoeia', reason: '전화벨 소리' },
	{ korean: '짹짹', english: 'tweet tweet', type: 'onomatopoeia', reason: '새 소리' },

	// 한국어 의태어
	{ korean: '반짝반짝', english: 'twinkle', type: 'onomatopoeia', reason: '빛나는 모양' },
	{ korean: '빙글빙글', english: 'spin', type: 'onomatopoeia', reason: '도는 모양' },
	{ korean: '폴짝폴짝', english: 'hop hop', type: 'onomatopoeia', reason: '뛰는 모양' },
	{ korean: '살금살금', english: 'tiptoe', type: 'onomatopoeia', reason: '조심스럽게 가는 모양' },
	{ korean: '아장아장', english: 'toddle', type: 'onomatopoeia', reason: '아기가 걷는 모양' },
	{ korean: '덜렁덜렁', english: 'carelessly', type: 'onomatopoeia', reason: '조심성 없는 모양' },

	// 영어 의성어
	{ korean: 'buzz', english: '윙윙', type: 'onomatopoeia', reason: '벌 소리' },
	{ korean: 'splash', english: '철썩', type: 'onomatopoeia', reason: '물 튀는 소리' },
	{ korean: 'crash', english: '쾅', type: 'onomatopoeia', reason: '부딪히는 소리' },
	{ korean: 'bang', english: '쾅', type: 'onomatopoeia', reason: '폭발 소리' },
	{ korean: 'tick-tock', english: '똑딱', type: 'onomatopoeia', reason: '시계 소리' },
	{ korean: 'boom', english: '쾅', type: 'onomatopoeia', reason: '폭발 소리' },
	{ korean: 'pop', english: '펑', type: 'onomatopoeia', reason: '터지는 소리' },
	{ korean: 'crack', english: '딱', type: 'onomatopoeia', reason: '부러지는 소리' },
	{ korean: 'hiss', english: '쉿', type: 'onomatopoeia', reason: '뱀 소리' },
	{ korean: 'chirp', english: '짹짹', type: 'onomatopoeia', reason: '새 소리' },

	// TODO: 추가 의성어/의태어 378개
	// - 동물 소리 50개
	// - 자연 소리 50개
	// - 생활 소리 100개
	// - 의태어 178개
];

// ========================================
// 복합어/합성어 (500개)
// ========================================

export const COMPOUNDS: MiscException[] = [
	// 한국어 복합어 (직역하면 이상한 것들)
	{ korean: '손주', english: 'grandchild', type: 'compound', reason: '손자+손녀' },
	{ korean: '손자', english: 'grandson', type: 'compound', reason: '아들의 아들' },
	{ korean: '손녀', english: 'granddaughter', type: 'compound', reason: '아들의 딸' },
	{ korean: '외손주', english: 'grandchild (maternal)', type: 'compound', reason: '딸의 자식' },
	{ korean: '시어머니', english: 'mother-in-law', type: 'compound', reason: '남편의 어머니' },
	{ korean: '시아버지', english: 'father-in-law', type: 'compound', reason: '남편의 아버지' },
	{ korean: '장모', english: 'mother-in-law', type: 'compound', reason: '아내의 어머니' },
	{ korean: '장인', english: 'father-in-law', type: 'compound', reason: '아내의 아버지' },
	{ korean: '며느리', english: 'daughter-in-law', type: 'compound', reason: '아들의 아내' },
	{ korean: '사위', english: 'son-in-law', type: 'compound', reason: '딸의 남편' },
	{ korean: '동서', english: 'sibling-in-law (spouse)', type: 'compound', reason: '형제의 배우자 간 관계' },
	{ korean: '올케', english: 'sister-in-law', type: 'compound', reason: '남편의 형제 아내' },
	{ korean: '시누이', english: 'sister-in-law', type: 'compound', reason: '남편의 누나/여동생' },
	{ korean: '처남', english: 'brother-in-law', type: 'compound', reason: '아내의 남자 형제' },
	{ korean: '처제', english: 'sister-in-law', type: 'compound', reason: '아내의 여자 형제' },

	// 영어 복합어
	{ korean: 'breakfast', english: '아침식사', type: 'compound', reason: 'break + fast' },
	{ korean: 'understand', english: '이해하다', type: 'compound', reason: 'under + stand' },
	{ korean: 'butterfly', english: '나비', type: 'compound', reason: 'butter + fly' },
	{ korean: 'rainbow', english: '무지개', type: 'compound', reason: 'rain + bow' },
	{ korean: 'sunshine', english: '햇빛', type: 'compound', reason: 'sun + shine' },
	{ korean: 'moonlight', english: '달빛', type: 'compound', reason: 'moon + light' },
	{ korean: 'earthquake', english: '지진', type: 'compound', reason: 'earth + quake' },
	{ korean: 'waterfall', english: '폭포', type: 'compound', reason: 'water + fall' },
	{ korean: 'honeymoon', english: '신혼여행', type: 'compound', reason: 'honey + moon' },

	// TODO: 추가 복합어 481개
	// - 가족 관계 50개
	// - 자연 현상 100개
	// - 일상 복합어 331개
];

// ========================================
// 특수 문법 (200개)
// ========================================

export const SPECIAL_GRAMMAR: MiscException[] = [
	// 한국어 특수 조사
	{ korean: '은/는', english: 'topic marker', type: 'special-grammar', reason: '주제 조사' },
	{ korean: '이/가', english: 'subject marker', type: 'special-grammar', reason: '주격 조사' },
	{ korean: '을/를', english: 'object marker', type: 'special-grammar', reason: '목적격 조사' },
	{ korean: '에게', english: 'to (animate)', type: 'special-grammar', reason: '여격 조사(생물)' },
	{ korean: '한테', english: 'to (casual)', type: 'special-grammar', reason: '여격 조사(구어)' },
	{ korean: '께', english: 'to (honorific)', type: 'special-grammar', reason: '여격 조사(존칭)' },
	{ korean: '에서', english: 'at/from (location)', type: 'special-grammar', reason: '장소 조사' },
	{ korean: '(으)로', english: 'to/by (direction/means)', type: 'special-grammar', reason: '방향/수단 조사' },
	{ korean: '와/과', english: 'with/and (formal)', type: 'special-grammar', reason: '연결 조사(격식)' },
	{ korean: '하고', english: 'with/and (casual)', type: 'special-grammar', reason: '연결 조사(구어)' },

	// 한국어 특수 어미
	{ korean: '-(으)ㄹ까요?', english: 'shall we?', type: 'special-grammar', reason: '청유형 어미' },
	{ korean: '-(으)세요', english: 'please (honorific)', type: 'special-grammar', reason: '명령형 존칭' },
	{ korean: '-(으)ㄹ게요', english: 'I will', type: 'special-grammar', reason: '의지 표현' },
	{ korean: '-거든요', english: 'you know', type: 'special-grammar', reason: '이유 설명' },
	{ korean: '-잖아요', english: 'you know', type: 'special-grammar', reason: '공통 인식' },

	// TODO: 추가 특수 문법 185개
	// - 조사 50개
	// - 어미 100개
	// - 관용 표현 35개
];

// ========================================
// 문맥 의존 (300개)
// ========================================

export const CONTEXTUAL: MiscException[] = [
	// 문맥에 따라 의미가 달라지는 표현
	{
		korean: '그렇게',
		english: 'that way / so / like that',
		type: 'contextual',
		reason: '문맥에 따라 의미 변화',
	},
	{ korean: '아니', english: 'no / well / you know', type: 'contextual', reason: '문맥에 따라 의미 변화' },
	{ korean: '좀', english: 'a little / please', type: 'contextual', reason: '문맥에 따라 의미 변화' },
	{ korean: '막', english: 'just / randomly', type: 'contextual', reason: '문맥에 따라 의미 변화' },
	{ korean: '진짜', english: 'really / real', type: 'contextual', reason: '형용사/부사 겸용' },

	// TODO: 추가 문맥 의존 표현 295개
];

// ========================================
// 통합 리스트
// ========================================

export const ALL_MISC_EXCEPTIONS = [
	...ABBREVIATIONS,
	...SLANG,
	...DIALECTS,
	...HONORIFICS,
	...ONOMATOPOEIA,
	...COMPOUNDS,
	...SPECIAL_GRAMMAR,
	...CONTEXTUAL,
];

/**
 * 기타 예외 찾기
 */
export function findMiscException(text: string, type?: ExceptionType): MiscException | null {
	const list = type ? ALL_MISC_EXCEPTIONS.filter((e) => e.type === type) : ALL_MISC_EXCEPTIONS;
	return list.find((e) => e.korean === text || e.english === text) || null;
}

/**
 * 타입별 예외
 */
export function getMiscExceptionsByType(type: ExceptionType): MiscException[] {
	return ALL_MISC_EXCEPTIONS.filter((e) => e.type === type);
}

/**
 * 기타 예외 총 개수
 */
export function getMiscExceptionCount(): {
	abbreviation: number;
	slang: number;
	dialect: number;
	honorific: number;
	onomatopoeia: number;
	compound: number;
	specialGrammar: number;
	contextual: number;
	total: number;
} {
	return {
		abbreviation: ABBREVIATIONS.length,
		slang: SLANG.length,
		dialect: DIALECTS.length,
		honorific: HONORIFICS.length,
		onomatopoeia: ONOMATOPOEIA.length,
		compound: COMPOUNDS.length,
		specialGrammar: SPECIAL_GRAMMAR.length,
		contextual: CONTEXTUAL.length,
		total: ALL_MISC_EXCEPTIONS.length,
	};
}
