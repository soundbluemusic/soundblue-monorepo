// ========================================
// English Prefixes - 영어 접두사 50개
// ========================================

export interface PrefixInfo {
	prefix: string;
	ko: string; // Korean equivalent
	meaning: string;
}

export const PREFIXES: PrefixInfo[] = [
	// 부정 접두사 (10개)
	{ prefix: 'un', ko: '불', meaning: 'not' },
	{ prefix: 'in', ko: '불', meaning: 'not' },
	{ prefix: 'im', ko: '불', meaning: 'not' },
	{ prefix: 'il', ko: '불', meaning: 'not' },
	{ prefix: 'ir', ko: '불', meaning: 'not' },
	{ prefix: 'dis', ko: '불', meaning: 'not/opposite' },
	{ prefix: 'non', ko: '무', meaning: 'not' },
	{ prefix: 'anti', ko: '반', meaning: 'against' },
	{ prefix: 'counter', ko: '반', meaning: 'against' },
	{ prefix: 'de', ko: '탈', meaning: 'reverse' },

	// 재/사전/사후 (5개)
	{ prefix: 're', ko: '재', meaning: 'again' },
	{ prefix: 'pre', ko: '사전', meaning: 'before' },
	{ prefix: 'post', ko: '사후', meaning: 'after' },
	{ prefix: 'fore', ko: '전방', meaning: 'before' },
	{ prefix: 'pro', ko: '전', meaning: 'forward' },

	// 정도 접두사 (8개)
	{ prefix: 'over', ko: '과', meaning: 'too much' },
	{ prefix: 'under', ko: '미', meaning: 'too little' },
	{ prefix: 'super', ko: '초', meaning: 'above' },
	{ prefix: 'hyper', ko: '초', meaning: 'over' },
	{ prefix: 'hypo', ko: '저', meaning: 'under' },
	{ prefix: 'ultra', ko: '극', meaning: 'beyond' },
	{ prefix: 'extra', ko: '외', meaning: 'beyond' },
	{ prefix: 'out', ko: '초과', meaning: 'beyond' },

	// 위치/관계 (8개)
	{ prefix: 'sub', ko: '하위', meaning: 'under' },
	{ prefix: 'inter', ko: '상호', meaning: 'between' },
	{ prefix: 'trans', ko: '횡단', meaning: 'across' },
	{ prefix: 'ex', ko: '외', meaning: 'out/former' },
	{ prefix: 'en', ko: '화', meaning: 'make' },
	{ prefix: 'em', ko: '화', meaning: 'make' },
	{ prefix: 'mid', ko: '중간', meaning: 'middle' },
	{ prefix: 'meta', ko: '초', meaning: 'beyond' },

	// 함께/공동 (5개)
	{ prefix: 'co', ko: '공', meaning: 'with' },
	{ prefix: 'con', ko: '공', meaning: 'with' },
	{ prefix: 'com', ko: '공', meaning: 'with' },
	{ prefix: 'col', ko: '공', meaning: 'with' },
	{ prefix: 'syn', ko: '공', meaning: 'together' },

	// 크기 (7개)
	{ prefix: 'semi', ko: '반', meaning: 'half' },
	{ prefix: 'macro', ko: '거대', meaning: 'large' },
	{ prefix: 'micro', ko: '미세', meaning: 'small' },
	{ prefix: 'mega', ko: '메가', meaning: 'large' },
	{ prefix: 'mini', ko: '미니', meaning: 'small' },
	{ prefix: 'maxi', ko: '최대', meaning: 'maximum' },
	{ prefix: 'nano', ko: '극소', meaning: 'tiny' },

	// 수량 (4개)
	{ prefix: 'multi', ko: '다', meaning: 'many' },
	{ prefix: 'poly', ko: '다', meaning: 'many' },
	{ prefix: 'mono', ko: '단', meaning: 'one' },
	{ prefix: 'uni', ko: '단일', meaning: 'one' },

	// 기타 (3개)
	{ prefix: 'auto', ko: '자동', meaning: 'self' },
	{ prefix: 'mis', ko: '오', meaning: 'wrong' },
	{ prefix: 'mal', ko: '악', meaning: 'bad' },
];

/**
 * 단어에서 접두사 추출
 */
export function extractPrefix(word: string): string | null {
	const lower = word.toLowerCase();

	// 긴 접두사부터 매칭 (greedy)
	const sorted = [...PREFIXES].sort((a, b) => b.prefix.length - a.prefix.length);

	for (const { prefix } of sorted) {
		if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
			// 최소 2글자 어간 필요
			return prefix;
		}
	}

	return null;
}

/**
 * 접두사 정보 가져오기
 */
export function getPrefixInfo(prefix: string): PrefixInfo | null {
	return PREFIXES.find((p) => p.prefix === prefix) || null;
}

/**
 * 접두사 한국어 번역
 */
export function translatePrefix(prefix: string): string {
	const info = getPrefixInfo(prefix);
	return info?.ko || '';
}
