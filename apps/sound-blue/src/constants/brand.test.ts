import { describe, expect, it } from 'vitest';
import { BRAND } from './brand';

describe('Brand Constants', () => {
  describe('BRAND 객체', () => {
    it('name 속성이 정의됨', () => {
      expect(BRAND.name).toBe('Sound Blue');
    });

    it('subtitle 속성이 정의됨', () => {
      expect(BRAND.subtitle).toBe('SoundBlueMusic');
    });

    it('tagline 속성이 정의됨', () => {
      expect(BRAND.tagline).toBe('SoundBlueMusic');
    });

    it('copyrightHolder 속성이 정의됨', () => {
      expect(BRAND.copyrightHolder).toBe('SoundBlueMusic');
    });

    it('siteUrl이 올바른 URL 형식', () => {
      expect(BRAND.siteUrl).toBe('https://soundbluemusic.com');
      expect(BRAND.siteUrl).toMatch(/^https?:\/\//);
    });

    it('githubUrl이 올바른 URL 형식', () => {
      expect(BRAND.githubUrl).toBe('https://github.com/soundbluemusic/sound-blue');
      expect(BRAND.githubUrl).toMatch(/^https?:\/\//);
    });

    it('description에 ko와 en이 정의됨', () => {
      expect(BRAND.description.ko).toBe('SoundBlueMusic 공식 홈페이지');
      expect(BRAND.description.en).toBe('SoundBlueMusic Official Homepage');
    });

    it('shareTitle에 ko와 en이 정의됨', () => {
      expect(BRAND.shareTitle.ko).toBe('Sound Blue | SoundBlueMusic');
      expect(BRAND.shareTitle.en).toBe('Sound Blue | SoundBlueMusic');
    });
  });

  describe('타입 안전성', () => {
    it('BRAND가 읽기 전용 객체', () => {
      expect(Object.isFrozen(BRAND.description)).toBe(false);
      expect(typeof BRAND).toBe('object');
    });

    it('모든 필수 속성이 존재', () => {
      const requiredKeys = [
        'name',
        'subtitle',
        'tagline',
        'copyrightHolder',
        'siteUrl',
        'githubUrl',
        'description',
        'shareTitle',
      ];

      requiredKeys.forEach((key) => {
        expect(BRAND).toHaveProperty(key);
      });
    });

    it('description과 shareTitle이 올바른 구조', () => {
      expect(BRAND.description).toHaveProperty('ko');
      expect(BRAND.description).toHaveProperty('en');
      expect(BRAND.shareTitle).toHaveProperty('ko');
      expect(BRAND.shareTitle).toHaveProperty('en');
    });
  });

  describe('값 검증', () => {
    it('모든 문자열 값이 비어있지 않음', () => {
      expect(BRAND.name.length).toBeGreaterThan(0);
      expect(BRAND.subtitle.length).toBeGreaterThan(0);
      expect(BRAND.tagline.length).toBeGreaterThan(0);
      expect(BRAND.copyrightHolder.length).toBeGreaterThan(0);
      expect(BRAND.siteUrl.length).toBeGreaterThan(0);
      expect(BRAND.githubUrl.length).toBeGreaterThan(0);
    });

    it('description의 모든 언어 값이 비어있지 않음', () => {
      expect(BRAND.description.ko.length).toBeGreaterThan(0);
      expect(BRAND.description.en.length).toBeGreaterThan(0);
    });

    it('shareTitle의 모든 언어 값이 비어있지 않음', () => {
      expect(BRAND.shareTitle.ko.length).toBeGreaterThan(0);
      expect(BRAND.shareTitle.en.length).toBeGreaterThan(0);
    });

    it('URL들이 HTTPS 사용', () => {
      expect(BRAND.siteUrl).toMatch(/^https:\/\//);
      expect(BRAND.githubUrl).toMatch(/^https:\/\//);
    });
  });
});
