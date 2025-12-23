// ========================================
// English Suffixes - 영어 접미사 100개
// ========================================

export interface SuffixInfo {
	suffix: string;
	pattern: RegExp;
	type: 'verb' | 'noun' | 'adjective' | 'adverb' | 'comparative' | 'superlative';
	ko: string; // Korean equivalent
	restoreRule?: 'double' | 'e' | 'y-to-i' | 'consonant-y'; // Stem restoration
}

export const SUFFIXES: SuffixInfo[] = [
	// ========================================
	// 동사 접미사 (25개)
	// ========================================

	// 과거형 -ed (10개)
	{ suffix: 'pped', pattern: /pped$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // stopped
	{ suffix: 'tted', pattern: /tted$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // chatted
	{ suffix: 'nned', pattern: /nned$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // planned
	{ suffix: 'mmed', pattern: /mmed$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // slammed
	{ suffix: 'gged', pattern: /gged$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // dragged
	{ suffix: 'rred', pattern: /rred$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // stirred
	{ suffix: 'bbed', pattern: /bbed$/, type: 'verb', ko: '었/았', restoreRule: 'double' }, // rubbed
	{ suffix: 'ied', pattern: /ied$/, type: 'verb', ko: '었/았', restoreRule: 'y-to-i' }, // studied
	{ suffix: 'd', pattern: /([^e])d$/, type: 'verb', ko: '었/았', restoreRule: 'e' }, // loved
	{ suffix: 'ed', pattern: /ed$/, type: 'verb', ko: '었/았' }, // walked

	// 진행형 -ing (10개)
	{ suffix: 'pping', pattern: /pping$/, type: 'verb', ko: '는', restoreRule: 'double' }, // stopping
	{ suffix: 'tting', pattern: /tting$/, type: 'verb', ko: '는', restoreRule: 'double' }, // chatting
	{ suffix: 'nning', pattern: /nning$/, type: 'verb', ko: '는', restoreRule: 'double' }, // planning
	{ suffix: 'mming', pattern: /mming$/, type: 'verb', ko: '는', restoreRule: 'double' }, // slamming
	{ suffix: 'gging', pattern: /gging$/, type: 'verb', ko: '는', restoreRule: 'double' }, // dragging
	{ suffix: 'rring', pattern: /rring$/, type: 'verb', ko: '는', restoreRule: 'double' }, // stirring
	{ suffix: 'bbing', pattern: /bbing$/, type: 'verb', ko: '는', restoreRule: 'double' }, // rubbing
	{ suffix: 'ying', pattern: /ying$/, type: 'verb', ko: '는', restoreRule: 'consonant-y' }, // studying
	{ suffix: 'ing', pattern: /ing$/, type: 'verb', ko: '는', restoreRule: 'e' }, // loving/making

	// 3인칭 단수 -s (5개)
	{ suffix: 'ies', pattern: /ies$/, type: 'verb', ko: '다', restoreRule: 'y-to-i' }, // studies
	{ suffix: 'es', pattern: /(s|x|z|ch|sh)es$/, type: 'verb', ko: '다' }, // watches
	{ suffix: 's', pattern: /s$/, type: 'verb', ko: '다' }, // walks
	{ suffix: 'ves', pattern: /ves$/, type: 'verb', ko: '다' }, // halves (f→v)
	{ suffix: 'oes', pattern: /oes$/, type: 'verb', ko: '다' }, // goes

	// ========================================
	// 명사 접미사 (25개)
	// ========================================

	// 추상명사화 (10개)
	{ suffix: 'ness', pattern: /ness$/, type: 'noun', ko: '함' }, // happiness
	{ suffix: 'ment', pattern: /ment$/, type: 'noun', ko: '것' }, // development
	{ suffix: 'tion', pattern: /tion$/, type: 'noun', ko: '것' }, // creation
	{ suffix: 'sion', pattern: /sion$/, type: 'noun', ko: '것' }, // decision
	{ suffix: 'ation', pattern: /ation$/, type: 'noun', ko: '것' }, // preparation
	{ suffix: 'ity', pattern: /ity$/, type: 'noun', ko: '성' }, // ability
	{ suffix: 'ance', pattern: /ance$/, type: 'noun', ko: '것' }, // acceptance
	{ suffix: 'ence', pattern: /ence$/, type: 'noun', ko: '것' }, // difference
	{ suffix: 'ship', pattern: /ship$/, type: 'noun', ko: '관계' }, // friendship
	{ suffix: 'hood', pattern: /hood$/, type: 'noun', ko: '상태' }, // childhood

	// 행위자 (8개)
	{ suffix: 'er', pattern: /er$/, type: 'noun', ko: '하는 사람' }, // teacher
	{ suffix: 'or', pattern: /or$/, type: 'noun', ko: '하는 사람' }, // actor
	{ suffix: 'ist', pattern: /ist$/, type: 'noun', ko: '주의자' }, // artist
	{ suffix: 'ian', pattern: /ian$/, type: 'noun', ko: '사람' }, // musician
	{ suffix: 'ant', pattern: /ant$/, type: 'noun', ko: '하는 것' }, // assistant
	{ suffix: 'ent', pattern: /ent$/, type: 'noun', ko: '하는 것' }, // student
	{ suffix: 'ee', pattern: /ee$/, type: 'noun', ko: '받는 사람' }, // employee
	{ suffix: 'eer', pattern: /eer$/, type: 'noun', ko: '하는 사람' }, // engineer

	// 장소/상태 (7개)
	{ suffix: 'ry', pattern: /ry$/, type: 'noun', ko: '곳' }, // library
	{ suffix: 'ery', pattern: /ery$/, type: 'noun', ko: '곳' }, // bakery
	{ suffix: 'age', pattern: /age$/, type: 'noun', ko: '것' }, // package
	{ suffix: 'ism', pattern: /ism$/, type: 'noun', ko: '주의' }, // socialism
	{ suffix: 'dom', pattern: /dom$/, type: 'noun', ko: '상태' }, // freedom
	{ suffix: 'th', pattern: /th$/, type: 'noun', ko: '것' }, // growth
	{ suffix: 'ure', pattern: /ure$/, type: 'noun', ko: '것' }, // culture

	// ========================================
	// 형용사 접미사 (25개)
	// ========================================

	// 가능/특성 (10개)
	{ suffix: 'able', pattern: /able$/, type: 'adjective', ko: '할 수 있는' }, // readable
	{ suffix: 'ible', pattern: /ible$/, type: 'adjective', ko: '할 수 있는' }, // possible
	{ suffix: 'ful', pattern: /ful$/, type: 'adjective', ko: '가득한' }, // beautiful
	{ suffix: 'less', pattern: /less$/, type: 'adjective', ko: '없는' }, // helpless
	{ suffix: 'ous', pattern: /ous$/, type: 'adjective', ko: '한' }, // famous
	{ suffix: 'ious', pattern: /ious$/, type: 'adjective', ko: '한' }, // curious
	{ suffix: 'eous', pattern: /eous$/, type: 'adjective', ko: '한' }, // gorgeous
	{ suffix: 'ive', pattern: /ive$/, type: 'adjective', ko: '한' }, // active
	{ suffix: 'al', pattern: /al$/, type: 'adjective', ko: '한' }, // natural
	{ suffix: 'ial', pattern: /ial$/, type: 'adjective', ko: '한' }, // social

	// 상태/성질 (10개)
	{ suffix: 'ant', pattern: /ant$/, type: 'adjective', ko: '한' }, // important
	{ suffix: 'ent', pattern: /ent$/, type: 'adjective', ko: '한' }, // different
	{ suffix: 'ic', pattern: /ic$/, type: 'adjective', ko: '한' }, // basic
	{ suffix: 'ical', pattern: /ical$/, type: 'adjective', ko: '한' }, // logical
	{ suffix: 'ish', pattern: /ish$/, type: 'adjective', ko: '같은' }, // childish
	{ suffix: 'like', pattern: /like$/, type: 'adjective', ko: '같은' }, // childlike
	{ suffix: 'y', pattern: /y$/, type: 'adjective', ko: '한' }, // happy
	{ suffix: 'en', pattern: /en$/, type: 'adjective', ko: '한' }, // golden
	{ suffix: 'ary', pattern: /ary$/, type: 'adjective', ko: '한' }, // necessary
	{ suffix: 'ory', pattern: /ory$/, type: 'adjective', ko: '한' }, // satisfactory

	// 비교급/최상급 (5개)
	{ suffix: 'er', pattern: /er$/, type: 'comparative', ko: '더' }, // bigger
	{ suffix: 'ier', pattern: /ier$/, type: 'comparative', ko: '더', restoreRule: 'y-to-i' }, // happier
	{ suffix: 'est', pattern: /est$/, type: 'superlative', ko: '가장' }, // biggest
	{ suffix: 'iest', pattern: /iest$/, type: 'superlative', ko: '가장', restoreRule: 'y-to-i' }, // happiest
	{ suffix: 'r', pattern: /r$/, type: 'comparative', ko: '더', restoreRule: 'e' }, // larger

	// ========================================
	// 부사 접미사 (10개)
	// ========================================
	{ suffix: 'ly', pattern: /ly$/, type: 'adverb', ko: '하게' }, // quickly
	{ suffix: 'ally', pattern: /ally$/, type: 'adverb', ko: '하게' }, // basically
	{ suffix: 'ically', pattern: /ically$/, type: 'adverb', ko: '하게' }, // logically
	{ suffix: 'ily', pattern: /ily$/, type: 'adverb', ko: '하게', restoreRule: 'y-to-i' }, // happily
	{ suffix: 'ably', pattern: /ably$/, type: 'adverb', ko: '하게' }, // comfortably
	{ suffix: 'ibly', pattern: /ibly$/, type: 'adverb', ko: '하게' }, // possibly
	{ suffix: 'ously', pattern: /ously$/, type: 'adverb', ko: '하게' }, // famously
	{ suffix: 'ively', pattern: /ively$/, type: 'adverb', ko: '하게' }, // actively
	{ suffix: 'ward', pattern: /ward$/, type: 'adverb', ko: '쪽으로' }, // forward
	{ suffix: 'wise', pattern: /wise$/, type: 'adverb', ko: '면에서' }, // likewise

	// ========================================
	// 기타 (15개)
	// ========================================
	{ suffix: 'ize', pattern: /ize$/, type: 'verb', ko: '화하다' }, // realize
	{ suffix: 'ise', pattern: /ise$/, type: 'verb', ko: '화하다' }, // realise (British)
	{ suffix: 'fy', pattern: /fy$/, type: 'verb', ko: '화하다' }, // simplify
	{ suffix: 'ate', pattern: /ate$/, type: 'verb', ko: '하다' }, // create
	{ suffix: 'en', pattern: /en$/, type: 'verb', ko: '하다' }, // widen
];

/**
 * 단어에서 접미사 추출
 */
export function extractSuffix(word: string): SuffixInfo | null {
	const lower = word.toLowerCase();

	// 긴 접미사부터 매칭 (greedy)
	const sorted = [...SUFFIXES].sort((a, b) => b.suffix.length - a.suffix.length);

	for (const suffix of sorted) {
		if (suffix.pattern.test(lower) && lower.length > suffix.suffix.length + 2) {
			// 최소 2글자 어간 필요
			return suffix;
		}
	}

	return null;
}

/**
 * 어간 복원 (접미사 제거 후 원래 형태로)
 */
export function restoreStem(word: string, suffix: SuffixInfo): string {
	const lower = word.toLowerCase();
	const stem = lower.replace(suffix.pattern, '');

	if (!suffix.restoreRule) {
		return stem;
	}

	switch (suffix.restoreRule) {
		case 'double': {
			// stopped → stopp → stop
			const lastChar = stem[stem.length - 1];
			if (lastChar && stem.endsWith(lastChar + lastChar)) {
				return stem.slice(0, -1);
			}
			return stem;
		}

		case 'e': {
			// loved → lov → love, making → mak → make
			if (suffix.suffix.startsWith('ing') || suffix.suffix.startsWith('ed')) {
				// e로 끝나는 단어인지 추정
				if (!/[aeiou]$/.test(stem) && !stem.endsWith('ee') && !stem.endsWith('ye')) {
					return stem + 'e';
				}
			}
			return stem;
		}

		case 'y-to-i': {
			// studied → studi → study, happier → happi → happy
			if (stem.endsWith('i')) {
				return stem.slice(0, -1) + 'y';
			}
			return stem;
		}

		case 'consonant-y': {
			// studying → study + ing (y 유지)
			return stem;
		}

		default:
			return stem;
	}
}

/**
 * 접미사 한국어 번역
 */
export function translateSuffix(suffix: string): string {
	const info = SUFFIXES.find((s) => s.suffix === suffix);
	return info?.ko || '';
}
