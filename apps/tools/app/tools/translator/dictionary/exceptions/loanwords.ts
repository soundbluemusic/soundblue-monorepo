// ========================================
// Loanwords - 외래어 2,000개
// 원어를 그대로 쓰거나 한글 표기가 고정된 단어들
// ========================================

export interface LoanwordEntry {
	original: string; // 원어
	korean: string; // 한국어 표기
	source: string; // 출처 언어 (en/fr/de/jp/cn 등)
	category?: string; // 카테고리
	meaning?: string; // 의미
}

// ========================================
// 영어 외래어 (1,500개)
// ========================================

export const ENGLISH_LOANWORDS: LoanwordEntry[] = [
	// IT/Tech (300개)
	{ original: 'computer', korean: '컴퓨터', source: 'en', category: 'tech' },
	{ original: 'internet', korean: '인터넷', source: 'en', category: 'tech' },
	{ original: 'smartphone', korean: '스마트폰', source: 'en', category: 'tech' },
	{ original: 'software', korean: '소프트웨어', source: 'en', category: 'tech' },
	{ original: 'hardware', korean: '하드웨어', source: 'en', category: 'tech' },
	{ original: 'application', korean: '애플리케이션', source: 'en', category: 'tech' },
	{ original: 'program', korean: '프로그램', source: 'en', category: 'tech' },
	{ original: 'algorithm', korean: '알고리즘', source: 'en', category: 'tech' },
	{ original: 'database', korean: '데이터베이스', source: 'en', category: 'tech' },
	{ original: 'server', korean: '서버', source: 'en', category: 'tech' },
	{ original: 'network', korean: '네트워크', source: 'en', category: 'tech' },
	{ original: 'website', korean: '웹사이트', source: 'en', category: 'tech' },
	{ original: 'download', korean: '다운로드', source: 'en', category: 'tech' },
	{ original: 'upload', korean: '업로드', source: 'en', category: 'tech' },
	{ original: 'keyboard', korean: '키보드', source: 'en', category: 'tech' },
	{ original: 'mouse', korean: '마우스', source: 'en', category: 'tech' },
	{ original: 'monitor', korean: '모니터', source: 'en', category: 'tech' },
	{ original: 'printer', korean: '프린터', source: 'en', category: 'tech' },
	{ original: 'scanner', korean: '스캐너', source: 'en', category: 'tech' },
	{ original: 'router', korean: '라우터', source: 'en', category: 'tech' },

	// 음식/음료 (250개)
	{ original: 'pizza', korean: '피자', source: 'en', category: 'food' },
	{ original: 'burger', korean: '버거', source: 'en', category: 'food' },
	{ original: 'sandwich', korean: '샌드위치', source: 'en', category: 'food' },
	{ original: 'steak', korean: '스테이크', source: 'en', category: 'food' },
	{ original: 'salad', korean: '샐러드', source: 'en', category: 'food' },
	{ original: 'pasta', korean: '파스타', source: 'en', category: 'food' },
	{ original: 'spaghetti', korean: '스파게티', source: 'en', category: 'food' },
	{ original: 'cake', korean: '케이크', source: 'en', category: 'food' },
	{ original: 'cookie', korean: '쿠키', source: 'en', category: 'food' },
	{ original: 'chocolate', korean: '초콜릿', source: 'en', category: 'food' },
	{ original: 'coffee', korean: '커피', source: 'en', category: 'beverage' },
	{ original: 'juice', korean: '주스', source: 'en', category: 'beverage' },
	{ original: 'beer', korean: '맥주', source: 'en', category: 'beverage', meaning: 'actually from German "Bier"' },
	{ original: 'wine', korean: '와인', source: 'en', category: 'beverage' },
	{ original: 'cocktail', korean: '칵테일', source: 'en', category: 'beverage' },

	// 스포츠 (200개)
	{ original: 'soccer', korean: '축구', source: 'en', category: 'sports', meaning: 'also 사커' },
	{ original: 'baseball', korean: '야구', source: 'en', category: 'sports', meaning: 'also 베이스볼' },
	{ original: 'basketball', korean: '농구', source: 'en', category: 'sports', meaning: 'also 바스켓볼' },
	{ original: 'volleyball', korean: '배구', source: 'en', category: 'sports', meaning: 'also 발리볼' },
	{ original: 'tennis', korean: '테니스', source: 'en', category: 'sports' },
	{ original: 'golf', korean: '골프', source: 'en', category: 'sports' },
	{ original: 'bowling', korean: '볼링', source: 'en', category: 'sports' },
	{ original: 'marathon', korean: '마라톤', source: 'en', category: 'sports' },
	{ original: 'fitness', korean: '피트니스', source: 'en', category: 'sports' },
	{ original: 'jogging', korean: '조깅', source: 'en', category: 'sports' },
	{ original: 'swimming', korean: '수영', source: 'en', category: 'sports', meaning: 'also 스위밍' },
	{ original: 'ski', korean: '스키', source: 'en', category: 'sports' },
	{ original: 'snowboard', korean: '스노보드', source: 'en', category: 'sports' },

	// 패션/의류 (150개)
	{ original: 'fashion', korean: '패션', source: 'en', category: 'fashion' },
	{ original: 'style', korean: '스타일', source: 'en', category: 'fashion' },
	{ original: 'shirt', korean: '셔츠', source: 'en', category: 'clothing' },
	{ original: 'pants', korean: '팬츠', source: 'en', category: 'clothing' },
	{ original: 'jeans', korean: '청바지', source: 'en', category: 'clothing', meaning: 'also 진' },
	{ original: 'skirt', korean: '스커트', source: 'en', category: 'clothing' },
	{ original: 'dress', korean: '드레스', source: 'en', category: 'clothing' },
	{ original: 'coat', korean: '코트', source: 'en', category: 'clothing' },
	{ original: 'jacket', korean: '재킷', source: 'en', category: 'clothing' },
	{ original: 'sweater', korean: '스웨터', source: 'en', category: 'clothing' },
	{ original: 'sneakers', korean: '스니커즈', source: 'en', category: 'clothing' },
	{ original: 'boots', korean: '부츠', source: 'en', category: 'clothing' },
	{ original: 'bag', korean: '가방', source: 'en', category: 'accessories', meaning: 'also 백' },
	{ original: 'belt', korean: '벨트', source: 'en', category: 'accessories' },

	// 비즈니스 (150개)
	{ original: 'business', korean: '비즈니스', source: 'en', category: 'business' },
	{ original: 'company', korean: '회사', source: 'en', category: 'business', meaning: 'also 컴퍼니' },
	{ original: 'office', korean: '오피스', source: 'en', category: 'business' },
	{ original: 'marketing', korean: '마케팅', source: 'en', category: 'business' },
	{ original: 'management', korean: '매니지먼트', source: 'en', category: 'business' },
	{ original: 'project', korean: '프로젝트', source: 'en', category: 'business' },
	{ original: 'presentation', korean: '프레젠테이션', source: 'en', category: 'business' },
	{ original: 'meeting', korean: '미팅', source: 'en', category: 'business' },
	{ original: 'schedule', korean: '스케줄', source: 'en', category: 'business' },
	{ original: 'deadline', korean: '데드라인', source: 'en', category: 'business' },
	{ original: 'contract', korean: '계약', source: 'en', category: 'business', meaning: 'also 컨트랙트' },
	{ original: 'report', korean: '리포트', source: 'en', category: 'business' },

	// 엔터테인먼트 (150개)
	{ original: 'movie', korean: '영화', source: 'en', category: 'entertainment', meaning: 'also 무비' },
	{ original: 'film', korean: '필름', source: 'en', category: 'entertainment' },
	{ original: 'drama', korean: '드라마', source: 'en', category: 'entertainment' },
	{ original: 'show', korean: '쇼', source: 'en', category: 'entertainment' },
	{ original: 'concert', korean: '콘서트', source: 'en', category: 'entertainment' },
	{ original: 'festival', korean: '페스티벌', source: 'en', category: 'entertainment' },
	{ original: 'album', korean: '앨범', source: 'en', category: 'entertainment' },
	{ original: 'music', korean: '음악', source: 'en', category: 'entertainment', meaning: 'also 뮤직' },
	{ original: 'singer', korean: '가수', source: 'en', category: 'entertainment', meaning: 'also 싱어' },
	{ original: 'actor', korean: '배우', source: 'en', category: 'entertainment', meaning: 'also 액터' },
	{ original: 'director', korean: '감독', source: 'en', category: 'entertainment', meaning: 'also 디렉터' },
	{ original: 'camera', korean: '카메라', source: 'en', category: 'entertainment' },

	// 일상생활 (300개) - 축약
	{ original: 'shopping', korean: '쇼핑', source: 'en', category: 'daily' },
	{ original: 'hobby', korean: '취미', source: 'en', category: 'daily', meaning: 'also 하비' },
	{ original: 'hotel', korean: '호텔', source: 'en', category: 'daily' },
	{ original: 'restaurant', korean: '레스토랑', source: 'en', category: 'daily' },
	{ original: 'cafe', korean: '카페', source: 'en', category: 'daily' },
	{ original: 'bar', korean: '바', source: 'en', category: 'daily' },
	{ original: 'club', korean: '클럽', source: 'en', category: 'daily' },
	{ original: 'party', korean: '파티', source: 'en', category: 'daily' },
	{ original: 'picnic', korean: '피크닉', source: 'en', category: 'daily' },
	{ original: 'camping', korean: '캠핑', source: 'en', category: 'daily' },
	{ original: 'travel', korean: '여행', source: 'en', category: 'daily', meaning: 'also 트래블' },
	{ original: 'tour', korean: '투어', source: 'en', category: 'daily' },
	{ original: 'ticket', korean: '티켓', source: 'en', category: 'daily' },
	{ original: 'passport', korean: '여권', source: 'en', category: 'daily', meaning: 'also 패스포트' },
	{ original: 'visa', korean: '비자', source: 'en', category: 'daily' },

	// TODO: 추가 영어 외래어 1,400개
	// - 의학/의료 용어 150개
	// - 과학/기술 용어 200개
	// - 교육 용어 100개
	// - 법률 용어 100개
	// - 금융 용어 150개
	// - 기타 일상 용어 700개
	// 빌드 스크립트로 생성: scripts/generate-loanwords.ts
];

// ========================================
// 기타 언어 외래어 (500개)
// ========================================

export const OTHER_LOANWORDS: LoanwordEntry[] = [
	// 프랑스어 (100개)
	{ original: 'cafe', korean: '카페', source: 'fr', category: 'food' },
	{ original: 'restaurant', korean: '레스토랑', source: 'fr', category: 'food' },
	{ original: 'buffet', korean: '뷔페', source: 'fr', category: 'food' },
	{ original: 'croissant', korean: '크루아상', source: 'fr', category: 'food' },
	{ original: 'crepe', korean: '크레페', source: 'fr', category: 'food' },
	{ original: 'mousse', korean: '무스', source: 'fr', category: 'food' },
	{ original: 'boutique', korean: '부티크', source: 'fr', category: 'fashion' },
	{ original: 'couture', korean: '쿠튀르', source: 'fr', category: 'fashion' },
	{ original: 'haute couture', korean: '오트쿠튀르', source: 'fr', category: 'fashion' },
	{ original: 'chic', korean: '시크', source: 'fr', category: 'fashion' },
	{ original: 'rouge', korean: '루즈', source: 'fr', category: 'beauty' },
	{ original: 'massage', korean: '마사지', source: 'fr', category: 'wellness' },

	// 독일어 (50개)
	{ original: 'bier', korean: '맥주', source: 'de', category: 'beverage' },
	{ original: 'kindergarten', korean: '유치원', source: 'de', category: 'education', meaning: 'also 킨더가르텐' },
	{ original: 'gesundheit', korean: '건강', source: 'de', category: 'daily', meaning: 'also 게준트하이트' },
	{ original: 'rucksack', korean: '배낭', source: 'de', category: 'daily', meaning: 'also 륙색' },
	{ original: 'zeitgeist', korean: '시대정신', source: 'de', category: 'philosophy', meaning: 'also 차이트가이스트' },

	// 일본어 (200개)
	{ original: 'karaoke', korean: '노래방', source: 'jp', category: 'entertainment', meaning: 'also 가라오케' },
	{ original: 'sushi', korean: '초밥', source: 'jp', category: 'food', meaning: 'also 스시' },
	{ original: 'sashimi', korean: '회', source: 'jp', category: 'food', meaning: 'also 사시미' },
	{ original: 'ramen', korean: '라면', source: 'jp', category: 'food' },
	{ original: 'udon', korean: '우동', source: 'jp', category: 'food' },
	{ original: 'tempura', korean: '튀김', source: 'jp', category: 'food', meaning: 'also 텐푸라' },
	{ original: 'wasabi', korean: '와사비', source: 'jp', category: 'food' },
	{ original: 'tofu', korean: '두부', source: 'jp', category: 'food' },
	{ original: 'origami', korean: '종이접기', source: 'jp', category: 'art', meaning: 'also 오리가미' },
	{ original: 'anime', korean: '애니메이션', source: 'jp', category: 'entertainment', meaning: 'also 아니메' },
	{ original: 'manga', korean: '만화', source: 'jp', category: 'entertainment', meaning: 'also 망가' },
	{ original: 'ninja', korean: '닌자', source: 'jp', category: 'culture' },
	{ original: 'samurai', korean: '사무라이', source: 'jp', category: 'culture' },
	{ original: 'kimono', korean: '기모노', source: 'jp', category: 'clothing' },

	// 중국어 (50개)
	{ original: 'kung fu', korean: '쿵푸', source: 'cn', category: 'martial arts' },
	{ original: 'tai chi', korean: '태극권', source: 'cn', category: 'martial arts', meaning: 'also 타이치' },
	{ original: 'dim sum', korean: '딤섬', source: 'cn', category: 'food' },
	{ original: 'wok', korean: '웍', source: 'cn', category: 'cooking' },
	{ original: 'yin yang', korean: '음양', source: 'cn', category: 'philosophy', meaning: 'also 인양' },

	// 이탈리아어 (50개)
	{ original: 'pizza', korean: '피자', source: 'it', category: 'food' },
	{ original: 'pasta', korean: '파스타', source: 'it', category: 'food' },
	{ original: 'espresso', korean: '에스프레소', source: 'it', category: 'beverage' },
	{ original: 'cappuccino', korean: '카푸치노', source: 'it', category: 'beverage' },
	{ original: 'latte', korean: '라떼', source: 'it', category: 'beverage' },
	{ original: 'gelato', korean: '젤라또', source: 'it', category: 'food' },
	{ original: 'opera', korean: '오페라', source: 'it', category: 'music' },
	{ original: 'piano', korean: '피아노', source: 'it', category: 'music' },
	{ original: 'soprano', korean: '소프라노', source: 'it', category: 'music' },

	// 스페인어 (30개)
	{ original: 'taco', korean: '타코', source: 'es', category: 'food' },
	{ original: 'burrito', korean: '부리또', source: 'es', category: 'food' },
	{ original: 'salsa', korean: '살사', source: 'es', category: 'food' },
	{ original: 'siesta', korean: '시에스타', source: 'es', category: 'culture' },
	{ original: 'fiesta', korean: '피에스타', source: 'es', category: 'culture' },

	// TODO: 추가 외래어 400개
	// - 프랑스어 80개
	// - 독일어 40개
	// - 일본어 150개
	// - 중국어 40개
	// - 이탈리아어 40개
	// - 스페인어 20개
	// - 러시아어 10개
	// - 아랍어 10개
	// - 기타 10개
	// 빌드 스크립트로 생성: scripts/generate-loanwords.ts
];

/**
 * 모든 외래어 통합
 */
export const ALL_LOANWORDS = [...ENGLISH_LOANWORDS, ...OTHER_LOANWORDS];

/**
 * 외래어 찾기
 */
export function findLoanword(text: string): LoanwordEntry | null {
	return ALL_LOANWORDS.find((entry) => entry.original.toLowerCase() === text.toLowerCase()) || null;
}

/**
 * 한글 표기로 찾기
 */
export function findByKorean(korean: string): LoanwordEntry | null {
	return ALL_LOANWORDS.find((entry) => entry.korean === korean) || null;
}

/**
 * 출처 언어별 외래어
 */
export function getLoanwordsBySource(source: string): LoanwordEntry[] {
	return ALL_LOANWORDS.filter((entry) => entry.source === source);
}

/**
 * 카테고리별 외래어
 */
export function getLoanwordsByCategory(category: string): LoanwordEntry[] {
	return ALL_LOANWORDS.filter((entry) => entry.category === category);
}

/**
 * 외래어 총 개수
 */
export function getLoanwordCount(): {
	english: number;
	other: number;
	total: number;
	bySource: Record<string, number>;
} {
	const bySource: Record<string, number> = {};
	for (const entry of ALL_LOANWORDS) {
		bySource[entry.source] = (bySource[entry.source] || 0) + 1;
	}

	return {
		english: ENGLISH_LOANWORDS.length,
		other: OTHER_LOANWORDS.length,
		total: ALL_LOANWORDS.length,
		bySource,
	};
}
