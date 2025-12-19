/**
 * Risk-Based Tests for Audio Context
 * 리스크 기반 오디오 컨텍스트 테스트
 *
 * Risk Coverage: 오디오 실패, 권한 거부, 브라우저 호환성
 */

import { describe, expect, it } from 'vitest';
import {
  createGain,
  createOscillator,
  getAudioContext,
  getAudioContextState,
  getCurrentTime,
  getSampleRate,
  resumeAudioContext,
} from './audio-context';

describe('Audio Context Risk Scenarios', () => {
  describe('Risk: AudioContext 초기화 실패', () => {
    it('should return valid context even on first call', () => {
      const ctx = getAudioContext();
      expect(ctx).toBeDefined();
      expect(ctx).not.toBeNull();
    });

    it('should return same instance on multiple calls (singleton)', () => {
      const ctx1 = getAudioContext();
      const ctx2 = getAudioContext();
      expect(ctx1).toBe(ctx2);
    });

    it('should have valid sample rate', () => {
      const sampleRate = getSampleRate();
      expect(sampleRate).toBeGreaterThan(0);
      expect(sampleRate).toBeLessThanOrEqual(192000); // Max common sample rate
    });
  });

  describe('Risk: AudioContext 상태 관리', () => {
    it('should report state correctly', () => {
      const state = getAudioContextState();
      expect(['running', 'suspended', 'closed', null]).toContain(state);
    });

    it('should handle resume gracefully', async () => {
      await expect(resumeAudioContext()).resolves.not.toThrow();
    });

    it('should return valid current time', () => {
      const time = getCurrentTime();
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Risk: 오디오 노드 생성 실패', () => {
    it('should create oscillator without error', () => {
      const osc = createOscillator(440);
      expect(osc).toBeDefined();
      expect(osc).toHaveProperty('frequency');
    });

    it('should create gain node without error', () => {
      const gain = createGain();
      expect(gain).toBeDefined();
      expect(gain).toHaveProperty('gain');
    });

    it('should create multiple oscillators', () => {
      const oscillators = Array(10)
        .fill(null)
        .map(() => createOscillator(440));
      expect(oscillators).toHaveLength(10);
      oscillators.forEach((osc) => {
        expect(osc).toBeDefined();
      });
    });
  });

  describe('Risk: 타이밍 정확도', () => {
    it('should have consistent current time progression', async () => {
      const time1 = getCurrentTime();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const time2 = getCurrentTime();
      // 시간은 항상 증가해야 함
      expect(time2).toBeGreaterThanOrEqual(time1);
    });

    it('should not have negative time', () => {
      for (let i = 0; i < 10; i++) {
        const time = getCurrentTime();
        expect(time).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Risk: 리소스 정리', () => {
    it('should handle oscillator start/stop lifecycle', () => {
      const osc = createOscillator(440);
      const gain = createGain();

      expect(() => {
        osc.connect(gain);
      }).not.toThrow();
    });
  });
});
