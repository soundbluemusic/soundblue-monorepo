// ========================================
// Hangul Jaso Tests - 한글 자소 분해/조합 테스트
// ========================================

import { describe, expect, test } from 'vitest';
import {
	CHO_LIST,
	JONG_LIST,
	JUNG_LIST,
	composeFromJaso,
	composeHangul,
	decomposeAll,
	decomposeHangul,
	endsWithPattern,
	hasFinalConsonant,
	isHangul,
	removeEndingPattern,
} from './hangul-jaso';

describe('decomposeHangul - 음절 분해', () => {
	test('먹 → ㅁ ㅓ ㄱ', () => {
		const result = decomposeHangul('먹');
		expect(result.cho).toBe('ㅁ');
		expect(result.jung).toBe('ㅓ');
		expect(result.jong).toBe('ㄱ');
	});

	test('가 → ㄱ ㅏ (종성 없음)', () => {
		const result = decomposeHangul('가');
		expect(result.cho).toBe('ㄱ');
		expect(result.jung).toBe('ㅏ');
		expect(result.jong).toBe('');
	});

	test('한 → ㅎ ㅏ ㄴ', () => {
		const result = decomposeHangul('한');
		expect(result.cho).toBe('ㅎ');
		expect(result.jung).toBe('ㅏ');
		expect(result.jong).toBe('ㄴ');
	});

	test('국 → ㄱ ㅜ ㄱ', () => {
		const result = decomposeHangul('국');
		expect(result.cho).toBe('ㄱ');
		expect(result.jung).toBe('ㅜ');
		expect(result.jong).toBe('ㄱ');
	});
});

describe('composeHangul - 자소 조합', () => {
	test('ㅁ ㅓ ㄱ → 먹', () => {
		const result = composeHangul({ cho: 'ㅁ', jung: 'ㅓ', jong: 'ㄱ' });
		expect(result).toBe('먹');
	});

	test('ㄱ ㅏ → 가 (종성 없음)', () => {
		const result = composeHangul({ cho: 'ㄱ', jung: 'ㅏ', jong: '' });
		expect(result).toBe('가');
	});

	test('ㅎ ㅏ ㄴ → 한', () => {
		const result = composeHangul({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
		expect(result).toBe('한');
	});
});

describe('decomposeAll - 전체 문자열 분해', () => {
	test('먹었다 → [ㅁ,ㅓ,ㄱ,ㅇ,ㅓ,ㅆ,ㄷ,ㅏ]', () => {
		const result = decomposeAll('먹었다');
		expect(result).toEqual(['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']);
	});

	test('사랑 → [ㅅ,ㅏ,ㄹ,ㅏ,ㅇ]', () => {
		const result = decomposeAll('사랑');
		expect(result).toEqual(['ㅅ', 'ㅏ', 'ㄹ', 'ㅏ', 'ㅇ']);
	});

	test('안녕 → [ㅇ,ㅏ,ㄴ,ㄴ,ㅕ,ㅇ]', () => {
		const result = decomposeAll('안녕');
		expect(result).toEqual(['ㅇ', 'ㅏ', 'ㄴ', 'ㄴ', 'ㅕ', 'ㅇ']);
	});

	test('한국 → [ㅎ,ㅏ,ㄴ,ㄱ,ㅜ,ㄱ]', () => {
		const result = decomposeAll('한국');
		expect(result).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅜ', 'ㄱ']);
	});
});

describe('composeFromJaso - 자소 배열 조합', () => {
	test('[ㅁ,ㅓ,ㄱ,ㅇ,ㅓ,ㅆ,ㄷ,ㅏ] → 먹었다', () => {
		const result = composeFromJaso(['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']);
		expect(result).toBe('먹었다');
	});

	test('[ㅅ,ㅏ,ㄹ,ㅏ,ㅇ] → 사랑', () => {
		const result = composeFromJaso(['ㅅ', 'ㅏ', 'ㄹ', 'ㅏ', 'ㅇ']);
		expect(result).toBe('사랑');
	});

	test('[ㅎ,ㅏ,ㄴ,ㄱ,ㅜ,ㄱ] → 한국', () => {
		const result = composeFromJaso(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅜ', 'ㄱ']);
		expect(result).toBe('한국');
	});
});

describe('isHangul - 한글 여부', () => {
	test('한글 문자', () => {
		expect(isHangul('가')).toBe(true);
		expect(isHangul('한')).toBe(true);
		expect(isHangul('먹')).toBe(true);
	});

	test('영어/숫자', () => {
		expect(isHangul('a')).toBe(false);
		expect(isHangul('1')).toBe(false);
		expect(isHangul(' ')).toBe(false);
	});
});

describe('hasFinalConsonant - 받침 여부', () => {
	test('받침 있음', () => {
		expect(hasFinalConsonant('먹')).toBe(true);
		expect(hasFinalConsonant('한')).toBe(true);
		expect(hasFinalConsonant('국')).toBe(true);
	});

	test('받침 없음', () => {
		expect(hasFinalConsonant('가')).toBe(false);
		expect(hasFinalConsonant('나')).toBe(false);
		expect(hasFinalConsonant('사')).toBe(false);
	});
});

describe('endsWithPattern - 패턴 매칭', () => {
	test('패턴 일치', () => {
		const jaso = ['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // 먹었다
		const pattern = ['ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // -었다

		expect(endsWithPattern(jaso, pattern)).toBe(true);
	});

	test('패턴 불일치', () => {
		const jaso = ['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // 먹었다
		const pattern = ['ㅇ', 'ㅏ', 'ㅆ', 'ㄷ', 'ㅏ']; // -았다

		expect(endsWithPattern(jaso, pattern)).toBe(false);
	});

	test('패턴이 더 김', () => {
		const jaso = ['ㅁ', 'ㅓ', 'ㄱ']; // 먹
		const pattern = ['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // 먹었다

		expect(endsWithPattern(jaso, pattern)).toBe(false);
	});
});

describe('removeEndingPattern - 어미 제거', () => {
	test('었다 제거 → 먹', () => {
		const jaso = ['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // 먹었다
		const pattern = ['ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // -었다

		const result = removeEndingPattern(jaso, pattern);
		expect(result).toEqual(['ㅁ', 'ㅓ', 'ㄱ']);
		expect(composeFromJaso(result)).toBe('먹');
	});

	test('패턴 불일치 시 원본 반환', () => {
		const jaso = ['ㅁ', 'ㅓ', 'ㄱ', 'ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ']; // 먹었다
		const pattern = ['ㅇ', 'ㅏ', 'ㅆ', 'ㄷ', 'ㅏ']; // -았다 (불일치)

		const result = removeEndingPattern(jaso, pattern);
		expect(result).toEqual(jaso);
	});
});

describe('CHO_LIST / JUNG_LIST / JONG_LIST', () => {
	test('초성 19개', () => {
		expect(CHO_LIST.length).toBe(19);
		expect(CHO_LIST[0]).toBe('ㄱ');
		expect(CHO_LIST[18]).toBe('ㅎ');
	});

	test('중성 21개', () => {
		expect(JUNG_LIST.length).toBe(21);
		expect(JUNG_LIST[0]).toBe('ㅏ');
		expect(JUNG_LIST[20]).toBe('ㅣ');
	});

	test('종성 28개 (첫번째 빈 문자열)', () => {
		expect(JONG_LIST.length).toBe(28);
		expect(JONG_LIST[0]).toBe('');
		expect(JONG_LIST[1]).toBe('ㄱ');
		expect(JONG_LIST[27]).toBe('ㅎ');
	});
});
