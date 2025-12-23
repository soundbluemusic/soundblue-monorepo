// ========================================
// English to Korean Engine - 영→한 자소 기반 번역
// ========================================

import { translatePrefix } from '../dictionary/prefixes';
import { translateSuffix } from '../dictionary/suffixes';
import { translateStemEnToKo } from '../dictionary/stems';
import { decomposeEnglish, type EnglishMorpheme } from '../jaso/english-morpheme';

export interface EnToKoResult {
	original: string; // 원본
	morpheme: EnglishMorpheme; // 형태소 분해
	koreanPrefix: string; // 한국어 접두사
	koreanStem: string; // 한국어 어간
	koreanSuffix: string; // 한국어 접미사
	translated: string; // 최종 번역
}

/**
 * 영어 → 한국어 번역 (자소 기반)
 *
 * @example
 * translateEnToKo('unhappiness') → '불행복함'
 * translateEnToKo('rewriting') → '재작성하는'
 */
export function translateEnToKo(text: string): string {
	const result = translateEnToKoDetailed(text);
	return result?.translated || text;
}

/**
 * 영어 → 한국어 번역 (상세 정보 포함)
 */
export function translateEnToKoDetailed(text: string): EnToKoResult | null {
	// 1. 형태소 분해
	const morpheme = decomposeEnglish(text);

	// 2. 접두사 번역
	const koreanPrefix = morpheme.prefix ? translatePrefix(morpheme.prefix) : '';

	// 3. 어간 번역
	const koreanStem = translateStemEnToKo(morpheme.stem) || morpheme.stem;

	// 4. 접미사 번역
	const koreanSuffix = translateEnglishSuffix(morpheme.suffix, morpheme.suffixInfo?.type);

	// 5. 조합
	let translated = koreanPrefix + koreanStem + koreanSuffix;

	// 6. 후처리 (자연스러운 한국어 형태로)
	translated = postProcessKorean(translated, morpheme);

	return {
		original: text,
		morpheme,
		koreanPrefix,
		koreanStem,
		koreanSuffix,
		translated,
	};
}

/**
 * 영어 접미사를 한국어로 번역
 */
function translateEnglishSuffix(suffix: string, type?: string): string {
	if (!suffix) return '';

	// 동사 접미사
	if (type === 'verb') {
		// 과거형
		if (suffix.includes('ed')) {
			return '었다'; // 간단 버전
		}

		// 진행형
		if (suffix.includes('ing')) {
			return '는'; // 간단 버전
		}

		// 3인칭 단수
		if (suffix === 's' || suffix === 'es') {
			return '다';
		}
	}

	// 명사 접미사
	if (type === 'noun') {
		if (suffix === 'ness') return '함';
		if (suffix === 'ment' || suffix === 'tion' || suffix === 'sion') return '것';
		if (suffix === 'er' || suffix === 'or') return '하는사람';
		if (suffix === 'ist') return '주의자';
		if (suffix === 'ship') return '관계';
		if (suffix === 'hood') return '상태';
		if (suffix === 'ity') return '성';
	}

	// 형용사 접미사
	if (type === 'adjective') {
		if (suffix === 'able' || suffix === 'ible') return '할수있는';
		if (suffix === 'ful') return '로운';
		if (suffix === 'less') return '없는';
		if (suffix === 'ous' || suffix === 'ious') return '한';
		if (suffix === 'ive') return '한';
		if (suffix === 'al' || suffix === 'ial') return '한';
		if (suffix === 'y') return '한';
	}

	// 부사 접미사
	if (type === 'adverb') {
		if (suffix.includes('ly')) return '하게';
	}

	// 기본 번역 시도
	return translateSuffix(suffix);
}

/**
 * 한국어 후처리 (자연스러운 형태로)
 */
function postProcessKorean(text: string, morpheme: EnglishMorpheme): string {
	let result = text;

	// 동사 접미사 자연스럽게 변환
	if (morpheme.suffixInfo?.type === 'verb') {
		// ing → 고있다/는중이다
		if (morpheme.suffix.includes('ing')) {
			result = result.replace(/는$/, '고있다');
		}

		// ed → 었다/았다
		if (morpheme.suffix.includes('ed')) {
			// 어간의 마지막 모음에 따라 었다/았다 선택
			// 간단 버전: 일단 었다 사용
			result = result.replace(/었다$/, '었다');
		}
	}

	// 명사화 접미사 자연스럽게
	if (morpheme.suffixInfo?.type === 'noun') {
		if (morpheme.suffix === 'ness') {
			// happiness → 행복함
			result = result.replace(/함$/, '함');
		}

		if (morpheme.suffix === 'er' || morpheme.suffix === 'or') {
			// teacher → 가르치는사람
			result = result.replace(/하는사람$/, '는사람');
		}
	}

	// 형용사 접미사
	if (morpheme.suffixInfo?.type === 'adjective') {
		if (morpheme.suffix === 'able' || morpheme.suffix === 'ible') {
			// readable → 읽을수있는
			result = result.replace(/할수있는$/, '할수있는');
		}

		if (morpheme.suffix === 'ful') {
			// beautiful → 아름다로운
			result = result.replace(/로운$/, '운');
		}

		if (morpheme.suffix === 'less') {
			// helpless → 도움없는
			result = result.replace(/없는$/, '없는');
		}
	}

	// 공백 제거 (한국어는 붙여씀)
	result = result.replace(/\s+/g, '');

	return result;
}

/**
 * 여러 단어 번역 (공백으로 구분)
 */
export function translateEnToKoMultiple(text: string): string {
	const words = text.split(/\s+/);
	const translated = words.map((word) => translateEnToKo(word));
	return translated.join(' ');
}
