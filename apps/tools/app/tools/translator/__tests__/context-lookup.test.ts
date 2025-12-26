/**
 * 문맥 기반 다의어 조회 테스트
 * lookupKoToEn 함수가 문맥에 따라 올바른 번역을 선택하는지 검증
 */
import { describe, expect, it } from 'vitest';
import { lookupKoToEn } from '../dictionary/words';

describe('문맥 기반 다의어 조회 (Context-Aware Polysemy Lookup)', () => {
  describe('차 (tea / car / difference)', () => {
    it('음식 문맥: 차 → tea', () => {
      expect(lookupKoToEn('차', '차를 마시다')).toBe('tea');
      expect(lookupKoToEn('차', '따뜻한 차')).toBe('tea');
    });

    it('교통 문맥: 차 → car', () => {
      expect(lookupKoToEn('차', '차를 운전하다')).toBe('car');
      expect(lookupKoToEn('차', '버스나 차를 타다')).toBe('car');
    });

    it('수학 문맥: 차 → difference', () => {
      expect(lookupKoToEn('차', '두 수의 차를 빼다')).toBe('difference');
    });
  });

  describe('눈 (eye / snow)', () => {
    it('신체 문맥: 눈 → eye', () => {
      expect(lookupKoToEn('눈', '눈이 아프다')).toBe('eye');
      expect(lookupKoToEn('눈', '눈을 감다')).toBe('eye');
    });

    it('날씨 문맥: 눈 → snow', () => {
      expect(lookupKoToEn('눈', '눈이 내리다')).toBe('snow');
      expect(lookupKoToEn('눈', '겨울에 눈이 오다')).toBe('snow');
    });
  });

  describe('배 (stomach / ship / pear)', () => {
    it('신체 문맥: 배 → stomach', () => {
      expect(lookupKoToEn('배', '배가 고프다')).toBe('stomach');
      expect(lookupKoToEn('배', '배가 아프다')).toBe('stomach');
    });

    it('교통 문맥: 배 → ship', () => {
      expect(lookupKoToEn('배', '배를 타다')).toBe('ship');
      expect(lookupKoToEn('배', '바다에서 배를 타다')).toBe('ship');
    });

    it('음식 문맥: 배 → pear', () => {
      expect(lookupKoToEn('배', '과일 배를 먹다')).toBe('pear');
    });
  });

  describe('밤 (night / chestnut)', () => {
    it('시간 문맥: 밤 → night', () => {
      expect(lookupKoToEn('밤', '밤에 자다')).toBe('night');
      expect(lookupKoToEn('밤', '어두운 밤')).toBe('night');
    });

    it('음식 문맥: 밤 → chestnut', () => {
      expect(lookupKoToEn('밤', '밤을 먹다')).toBe('chestnut');
      expect(lookupKoToEn('밤', '가을에 밤을 굽다')).toBe('chestnut');
    });
  });

  describe('문맥 없이 기본값 사용', () => {
    it('문맥 없으면 priority 기반 기본값', () => {
      // 문맥 없이 호출하면 기존 사전 또는 원문 반환
      const result = lookupKoToEn('차');
      // 기존 사전에 '차'가 없으면 원문 반환
      expect(typeof result).toBe('string');
    });
  });
});
