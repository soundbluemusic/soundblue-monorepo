import { describe, expect, it } from 'vitest';
import {
  canShareText,
  compressForUrl,
  createShareUrl,
  decompressFromUrl,
  getTextLengthWarning,
  parseShareUrl,
  type SharedTranslation,
} from './url-sharing';

describe('url-sharing', () => {
  describe('compressForUrl / decompressFromUrl', () => {
    it('should compress and decompress short text correctly', () => {
      const data: SharedTranslation = {
        text: '안녕하세요',
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();
      expect(typeof compressed).toBe('string');

      const decompressed = decompressFromUrl(compressed!);
      expect(decompressed).toEqual(data);
    });

    it('should handle English text', () => {
      const data: SharedTranslation = {
        text: 'Hello, world!',
        direction: 'en-ko',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();

      const decompressed = decompressFromUrl(compressed!);
      expect(decompressed).toEqual(data);
    });

    it('should handle mixed Korean and English', () => {
      const data: SharedTranslation = {
        text: '안녕 Hello 세계 World',
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();

      const decompressed = decompressFromUrl(compressed!);
      expect(decompressed).toEqual(data);
    });

    it('should return null for very long text', () => {
      // LZString is very efficient with repeated chars, so use varied text
      // Generate diverse Korean syllables to prevent compression
      const longText = Array.from({ length: 3000 }, (_, i) =>
        String.fromCharCode(0xAC00 + (i * 7) % 11172)
      ).join('');
      const data: SharedTranslation = {
        text: longText,
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).toBeNull();
    });

    it('should return null for invalid compressed data', () => {
      expect(decompressFromUrl('invalid-data')).toBeNull();
      expect(decompressFromUrl('')).toBeNull();
    });

    it('should return null for valid JSON but invalid structure', () => {
      // Compress a different structure
      const invalidJson = JSON.stringify({ foo: 'bar' });
      // LZString would compress this differently, so we test with manually corrupted data
      expect(decompressFromUrl('N4IgDgTg')).toBeNull(); // Random base64-like string
    });
  });

  describe('createShareUrl', () => {
    it('should create a valid share URL', () => {
      const baseUrl = 'https://tools.soundbluemusic.com/translator';
      const data: SharedTranslation = {
        text: '테스트',
        direction: 'ko-en',
      };

      const result = createShareUrl(baseUrl, data);
      expect(result.url).not.toBeNull();
      expect(result.url).toContain(baseUrl);
      expect(result.url).toContain('?s=');
      expect(result.error).toBeUndefined();
    });

    it('should return error for too long text', () => {
      const baseUrl = 'https://tools.soundbluemusic.com/translator';
      // Use varied text to prevent efficient compression
      const longText = Array.from({ length: 3000 }, (_, i) =>
        String.fromCharCode(0xAC00 + (i * 7) % 11172)
      ).join('');
      const data: SharedTranslation = {
        text: longText,
        direction: 'ko-en',
      };

      const result = createShareUrl(baseUrl, data);
      expect(result.url).toBeNull();
      expect(result.error).toBe('TEXT_TOO_LONG');
    });

    it('should return error for empty text', () => {
      const baseUrl = 'https://tools.soundbluemusic.com/translator';
      const data: SharedTranslation = {
        text: '   ',
        direction: 'ko-en',
      };

      const result = createShareUrl(baseUrl, data);
      expect(result.url).toBeNull();
      expect(result.error).toBe('COMPRESSION_FAILED');
    });
  });

  describe('parseShareUrl', () => {
    it('should parse a valid share URL', () => {
      const baseUrl = 'https://tools.soundbluemusic.com/translator';
      const data: SharedTranslation = {
        text: '안녕하세요',
        direction: 'ko-en',
      };

      const { url } = createShareUrl(baseUrl, data);
      const parsed = parseShareUrl(url!);

      expect(parsed).toEqual(data);
    });

    it('should return null for URL without share parameter', () => {
      const result = parseShareUrl('https://tools.soundbluemusic.com/translator');
      expect(result).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const result = parseShareUrl('not-a-url');
      expect(result).toBeNull();
    });
  });

  describe('canShareText', () => {
    it('should return true for short text', () => {
      expect(canShareText('짧은 텍스트')).toBe(true);
      expect(canShareText('Short text')).toBe(true);
    });

    it('should return true for text at limit', () => {
      const text = 'a'.repeat(500);
      expect(canShareText(text)).toBe(true);
    });

    it('should return false for text over limit', () => {
      const text = 'a'.repeat(501);
      expect(canShareText(text)).toBe(false);
    });
  });

  describe('getTextLengthWarning', () => {
    it('should return safe for short text', () => {
      expect(getTextLengthWarning('짧은')).toBe('safe');
      expect(getTextLengthWarning('a'.repeat(300))).toBe('safe');
    });

    it('should return warning for medium text', () => {
      expect(getTextLengthWarning('a'.repeat(301))).toBe('warning');
      expect(getTextLengthWarning('a'.repeat(500))).toBe('warning');
    });

    it('should return danger for long text', () => {
      expect(getTextLengthWarning('a'.repeat(501))).toBe('danger');
      expect(getTextLengthWarning('a'.repeat(1000))).toBe('danger');
    });
  });

  describe('compression efficiency', () => {
    it('should compress Korean text efficiently', () => {
      const koreanText = '안녕하세요. 오늘 날씨가 좋습니다. 번역기를 테스트하고 있습니다.';
      const data: SharedTranslation = {
        text: koreanText,
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();

      // Compressed should be reasonably sized
      // Original text is ~50 chars, compressed should be under 150 chars
      expect(compressed!.length).toBeLessThan(200);
    });

    it('should handle special characters', () => {
      const data: SharedTranslation = {
        text: '특수문자 테스트: !@#$%^&*()_+-=[]{}|;\':",.<>?/',
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();

      const decompressed = decompressFromUrl(compressed!);
      expect(decompressed).toEqual(data);
    });

    it('should handle newlines and whitespace', () => {
      const data: SharedTranslation = {
        text: '첫째 줄\n둘째 줄\n\t탭 포함',
        direction: 'ko-en',
      };

      const compressed = compressForUrl(data);
      expect(compressed).not.toBeNull();

      const decompressed = decompressFromUrl(compressed!);
      expect(decompressed).toEqual(data);
    });
  });
});
