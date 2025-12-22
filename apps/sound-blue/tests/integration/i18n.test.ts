import { describe, expect, it } from 'vitest';
import enMessages from '../../project.inlang/messages/en.json';
import koMessages from '../../project.inlang/messages/ko.json';

/**
 * i18n Integration Test - 번역 키 완전성 검증
 *
 * 목적:
 * - 모든 언어에 동일한 번역 키가 존재하는지 확인
 * - 누락된 번역이나 빈 문자열이 없는지 확인
 * - 배열 타입 메시지의 일관성 확인
 */

describe('i18n Translation Keys Integrity', () => {
  describe('번역 키 완전성', () => {
    it('영어와 한국어의 키 수가 동일', () => {
      const enKeys = Object.keys(enMessages);
      const koKeys = Object.keys(koMessages);

      expect(
        enKeys.length,
        `English has ${enKeys.length} keys, Korean has ${koKeys.length} keys`,
      ).toBe(koKeys.length);
    });

    it('영어에 있는 모든 키가 한국어에도 존재', () => {
      const enKeys = Object.keys(enMessages);
      const koKeys = Object.keys(koMessages);

      const missingInKorean = enKeys.filter((key) => !koKeys.includes(key));

      expect(
        missingInKorean,
        `Missing in Korean: ${missingInKorean.join(', ')}`,
      ).toEqual([]);
    });

    it('한국어에 있는 모든 키가 영어에도 존재', () => {
      const enKeys = Object.keys(enMessages);
      const koKeys = Object.keys(koMessages);

      const missingInEnglish = koKeys.filter((key) => !enKeys.includes(key));

      expect(
        missingInEnglish,
        `Missing in English: ${missingInEnglish.join(', ')}`,
      ).toEqual([]);
    });

    it('모든 키가 양쪽 언어에 존재 (정렬 후 비교)', () => {
      const enKeys = Object.keys(enMessages).sort();
      const koKeys = Object.keys(koMessages).sort();

      expect(koKeys).toEqual(enKeys);
    });
  });

  describe('번역 값 검증', () => {
    it('영어 번역에 빈 문자열 없음', () => {
      const emptyKeys: string[] = [];

      Object.entries(enMessages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          emptyKeys.push(key);
        }
      });

      expect(emptyKeys, `Empty strings in English: ${emptyKeys.join(', ')}`).toEqual([]);
    });

    it('한국어 번역에 빈 문자열 없음', () => {
      const emptyKeys: string[] = [];

      Object.entries(koMessages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          emptyKeys.push(key);
        }
      });

      expect(emptyKeys, `Empty strings in Korean: ${emptyKeys.join(', ')}`).toEqual([]);
    });

    it('영어 번역에 undefined/null 없음', () => {
      const invalidKeys: string[] = [];

      Object.entries(enMessages).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          invalidKeys.push(key);
        }
      });

      expect(invalidKeys, `Undefined/null in English: ${invalidKeys.join(', ')}`).toEqual([]);
    });

    it('한국어 번역에 undefined/null 없음', () => {
      const invalidKeys: string[] = [];

      Object.entries(koMessages).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          invalidKeys.push(key);
        }
      });

      expect(invalidKeys, `Undefined/null in Korean: ${invalidKeys.join(', ')}`).toEqual([]);
    });
  });

  describe('타입 일관성', () => {
    it('동일한 키의 값 타입이 양쪽 언어에서 일치', () => {
      const typeMismatches: string[] = [];

      Object.keys(enMessages).forEach((key) => {
        const enValue = enMessages[key as keyof typeof enMessages];
        const koValue = koMessages[key as keyof typeof koMessages];

        const enType = Array.isArray(enValue) ? 'array' : typeof enValue;
        const koType = Array.isArray(koValue) ? 'array' : typeof koValue;

        if (enType !== koType) {
          typeMismatches.push(`${key}: en=${enType}, ko=${koType}`);
        }
      });

      expect(typeMismatches, `Type mismatches: ${typeMismatches.join(', ')}`).toEqual([]);
    });

    it('배열 타입 메시지의 길이가 양쪽 언어에서 동일', () => {
      const lengthMismatches: string[] = [];

      Object.keys(enMessages).forEach((key) => {
        const enValue = enMessages[key as keyof typeof enMessages];
        const koValue = koMessages[key as keyof typeof koMessages];

        if (Array.isArray(enValue) && Array.isArray(koValue)) {
          if (enValue.length !== koValue.length) {
            lengthMismatches.push(`${key}: en=${enValue.length}, ko=${koValue.length}`);
          }
        }
      });

      expect(lengthMismatches, `Array length mismatches: ${lengthMismatches.join(', ')}`).toEqual(
        [],
      );
    });
  });

  describe('특정 키 그룹 검증', () => {
    it('header 관련 키가 모두 존재', () => {
      const requiredHeaderKeys = [
        'header.title',
        'header.langSwitch',
        'header.langCode',
        'header.themeLight',
        'header.themeDark',
      ];

      requiredHeaderKeys.forEach((key) => {
        expect(enMessages).toHaveProperty(key);
        expect(koMessages).toHaveProperty(key);
      });
    });

    it('footer 관련 키가 모두 존재', () => {
      const requiredFooterKeys = [
        'footer.tagline',
        'footer.builtWith',
        'footer_privacy',
        'footer_terms',
        'footer_license',
        'footer_sitemap',
      ];

      requiredFooterKeys.forEach((key) => {
        expect(enMessages).toHaveProperty(key);
        expect(koMessages).toHaveProperty(key);
      });
    });

    it('search 관련 키가 모두 존재', () => {
      const requiredSearchKeys = [
        'search.placeholder',
        'search.label',
        'search.clear',
        'search.noResults',
      ];

      requiredSearchKeys.forEach((key) => {
        expect(enMessages).toHaveProperty(key);
        expect(koMessages).toHaveProperty(key);
      });
    });

    it('home 관련 키가 모두 존재', () => {
      const requiredHomeKeys = [
        'home.tagline',
        'home.description',
        'home.genres',
        'home.cta',
        'home.discography',
      ];

      requiredHomeKeys.forEach((key) => {
        expect(enMessages).toHaveProperty(key);
        expect(koMessages).toHaveProperty(key);
      });
    });
  });

  describe('Edge Cases', () => {
    it('매우 긴 번역 값 검증 (1000자 미만)', () => {
      const tooLongKeys: string[] = [];

      Object.entries(enMessages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 1000) {
          tooLongKeys.push(`${key}: ${value.length} chars`);
        }
      });

      Object.entries(koMessages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 1000) {
          tooLongKeys.push(`${key}: ${value.length} chars (Korean)`);
        }
      });

      expect(tooLongKeys, `Excessively long translations: ${tooLongKeys.join(', ')}`).toEqual([]);
    });

    it('특수 문자 포함 키 검증', () => {
      const keysWithSpecialChars = Object.keys(enMessages).filter((key) =>
        /[^a-zA-Z0-9._-]/.test(key),
      );

      expect(
        keysWithSpecialChars,
        `Keys with special characters: ${keysWithSpecialChars.join(', ')}`,
      ).toEqual([]);
    });

    it('중복 키 없음 (대소문자 구분)', () => {
      const enKeys = Object.keys(enMessages);
      const enKeysLower = enKeys.map((k) => k.toLowerCase());
      const uniqueKeysLower = [...new Set(enKeysLower)];

      expect(enKeysLower.length).toBe(uniqueKeysLower.length);
    });
  });

  describe('구조화된 데이터 검증', () => {
    it('모든 배열 타입 메시지에 빈 요소 없음', () => {
      const emptyArrayElements: string[] = [];

      Object.entries(enMessages).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'string' && item.trim() === '') {
              emptyArrayElements.push(`${key}[${index}] (English)`);
            }
          });
        }
      });

      Object.entries(koMessages).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'string' && item.trim() === '') {
              emptyArrayElements.push(`${key}[${index}] (Korean)`);
            }
          });
        }
      });

      expect(
        emptyArrayElements,
        `Empty array elements: ${emptyArrayElements.join(', ')}`,
      ).toEqual([]);
    });
  });
});
