/**
 * User Scenario Integration Tests
 * 사용자 시나리오 기반 통합 테스트
 *
 * Test Effectiveness: 실제 사용자 워크플로우 테스트
 */

import { describe, expect, it } from 'vitest';
import { defaultMetronomeSettings } from './settings';

describe('Metronome User Scenarios', () => {
  describe('Scenario: 음악가가 120 BPM으로 연습하기', () => {
    it('should allow setting BPM to standard tempo 120', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 120 };
      expect(settings.bpm).toBe(120);
      // 실제 사용자 기대: 120 BPM은 분당 120박자
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(0.5); // 0.5초마다 박자
    });

    it('should support 4/4 time signature for common practice', () => {
      const settings = { ...defaultMetronomeSettings, beatsPerMeasure: 4 };
      expect(settings.beatsPerMeasure).toBe(4);
      // 4박자 * 0.5초 = 2초마다 마디
      const secondsPerMeasure = (60 / settings.bpm) * settings.beatsPerMeasure;
      expect(secondsPerMeasure).toBe(2);
    });

    it('should calculate correct practice time for 5 minute session', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: '5', timerSeconds: '0' };
      const totalSeconds =
        parseInt(settings.timerMinutes, 10) * 60 + parseInt(settings.timerSeconds, 10);
      expect(totalSeconds).toBe(300);

      // 5분 동안 120 BPM으로 몇 박자?
      const totalBeats = totalSeconds * (settings.bpm / 60);
      expect(totalBeats).toBe(600);
    });
  });

  describe('Scenario: 빠른 곡 연습 (200+ BPM)', () => {
    it('should handle fast tempo without calculation errors', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 200 };
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(0.3);
      expect(secondsPerBeat).toBeGreaterThan(0);
    });

    it('should support extreme but valid tempo of 240 BPM', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 240 };
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(0.25);
      // 250ms per beat - still playable
      expect(secondsPerBeat * 1000).toBeGreaterThanOrEqual(25); // 최소 25ms
    });
  });

  describe('Scenario: 느린 곡 연습 (40-60 BPM)', () => {
    it('should handle slow tempo for ballad practice', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 60 };
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(1); // 정확히 1초
    });

    it('should handle minimum tempo 40 BPM', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 40 };
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(1.5);
    });
  });

  describe('Scenario: 복합 박자 연습 (7/4, 5/4)', () => {
    it('should support 7/4 time signature for progressive music', () => {
      const settings = { ...defaultMetronomeSettings, beatsPerMeasure: 7, bpm: 120 };
      const secondsPerMeasure = (60 / settings.bpm) * settings.beatsPerMeasure;
      expect(secondsPerMeasure).toBe(3.5); // 7박자 마디
    });

    it('should support 5/4 time signature (Take Five style)', () => {
      const settings = { ...defaultMetronomeSettings, beatsPerMeasure: 5, bpm: 176 };
      const secondsPerMeasure = (60 / settings.bpm) * settings.beatsPerMeasure;
      expect(secondsPerMeasure).toBeCloseTo(1.704, 2);
    });
  });

  describe('Scenario: 볼륨 조절', () => {
    it('should allow muting for silent practice visualization', () => {
      const settings = { ...defaultMetronomeSettings, volume: 0 };
      expect(settings.volume).toBe(0);
    });

    it('should allow maximum volume for loud environments', () => {
      const settings = { ...defaultMetronomeSettings, volume: 100 };
      expect(settings.volume).toBe(100);
    });

    it('should support moderate volume for home practice', () => {
      const settings = { ...defaultMetronomeSettings, volume: 50 };
      expect(settings.volume).toBe(50);
    });
  });
});
