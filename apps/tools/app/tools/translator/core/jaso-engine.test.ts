// ========================================
// Jaso Engine Tests - 자소 기반 번역 엔진 테스트
// ========================================

import { describe, expect, test } from 'vitest';
import {
	autoTranslate,
	detectLanguage,
	en2ko,
	getTranslationQuality,
	getTranslationStats,
	ko2en,
	translate,
} from './jaso-engine';

describe('translate - 양방향 번역', () => {
	describe('한→영', () => {
		test('먹었다 → ate', () => {
			const result = translate('먹었다', 'ko-en');
			expect(result.translated).toBe('ate');
			expect(result.direction).toBe('ko-en');
		});

		test('가다 → go', () => {
			const result = translate('가다', 'ko-en');
			expect(result.translated).toContain('go');
		});

		test('행복했다 → was happy (형용사)', () => {
			const result = translate('행복했다', 'ko-en');
			expect(result.translated).toContain('happy');
		});
	});

	describe('영→한', () => {
		test('unhappiness → 불행복함', () => {
			const result = translate('unhappiness', 'en-ko');
			expect(result.translated).toContain('불행');
			expect(result.translated).toContain('행복');
		});

		test('rewriting → 재작성', () => {
			const result = translate('rewriting', 'en-ko');
			expect(result.translated).toContain('재');
			expect(result.translated).toContain('작성');
		});
	});
});

describe('ko2en / en2ko - 간단 버전', () => {
	test('ko2en: 먹었다 → ate', () => {
		expect(ko2en('먹었다')).toBe('ate');
	});

	test('ko2en: 좋다 → is good', () => {
		const result = ko2en('좋다');
		expect(result).toContain('good');
	});

	test('en2ko: unhappiness → 불행복함', () => {
		const result = en2ko('unhappiness');
		expect(result).toContain('불행');
	});

	test('en2ko: happiness → 행복함', () => {
		const result = en2ko('happiness');
		expect(result).toContain('행복');
	});
});

describe('autoTranslate - 자동 언어 감지', () => {
	test('한글 입력 → 한→영', () => {
		const result = autoTranslate('먹었다');
		expect(result.direction).toBe('ko-en');
		expect(result.translated).toBe('ate');
	});

	test('영어 입력 → 영→한', () => {
		const result = autoTranslate('happiness');
		expect(result.direction).toBe('en-ko');
		expect(result.translated).toContain('행복');
	});
});

describe('detectLanguage - 언어 감지', () => {
	test('한글 → ko-en', () => {
		expect(detectLanguage('먹었다')).toBe('ko-en');
		expect(detectLanguage('안녕하세요')).toBe('ko-en');
	});

	test('영어 → en-ko', () => {
		expect(detectLanguage('hello')).toBe('en-ko');
		expect(detectLanguage('unhappiness')).toBe('en-ko');
	});

	test('혼합 → ko-en (기본값)', () => {
		expect(detectLanguage('hello안녕')).toBe('ko-en');
	});
});

describe('getTranslationQuality - 품질 점수', () => {
	test('번역 성공 → 높은 점수', () => {
		const result = translate('먹었다', 'ko-en', { detailed: true });
		const quality = getTranslationQuality(result);
		expect(quality).toBeGreaterThan(50);
	});

	test('번역 실패 → 0점', () => {
		const result: any = {
			translated: 'unknown',
			original: 'unknown',
			direction: 'ko-en',
		};
		const quality = getTranslationQuality(result);
		expect(quality).toBe(0);
	});
});

describe('getTranslationStats - 통계', () => {
	test('통계 정보 반환', () => {
		const stats = getTranslationStats();
		expect(stats.totalStems).toBe(1000);
		expect(stats.totalEndings).toBe(100);
		expect(stats.totalPrefixes).toBe(50);
		expect(stats.totalSuffixes).toBe(100);
		expect(stats.estimatedCoverage).toBe(350000);
	});
});

describe('detailed mode - 상세 정보', () => {
	test('한→영 상세 정보', () => {
		const result = translate('먹었다', 'ko-en', { detailed: true });
		expect(result.details).toBeDefined();

		if (result.details && 'englishStem' in result.details) {
			expect(result.details.stem).toBe('먹');
			expect(result.details.englishStem).toBe('eat');
		}
	});

	test('영→한 상세 정보', () => {
		const result = translate('unhappiness', 'en-ko', { detailed: true });
		expect(result.details).toBeDefined();

		if (result.details && 'morpheme' in result.details) {
			expect(result.details.morpheme.prefix).toBe('un');
			expect(result.details.morpheme.stem).toBe('happy');
			expect(result.details.morpheme.suffix).toBe('ness');
		}
	});
});
