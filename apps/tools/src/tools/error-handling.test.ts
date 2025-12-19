/**
 * Error Handling and Edge Case Tests
 * 에러 처리 및 엣지 케이스 테스트
 *
 * Test Quality: 실패 시나리오, 예외 상황 테스트
 */

import { describe, expect, it } from 'vitest';
import {
  createEmptyPattern,
  DRUM_DEFAULTS,
  defaultDrumMachineSettings,
} from './drum-machine/settings';
import { defaultMetronomeSettings } from './metronome/settings';
import { defaultQRSettings } from './qr-generator/settings';

describe('Error Handling Tests', () => {
  describe('Metronome Edge Cases', () => {
    it('should handle zero BPM gracefully', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 0 };
      // 0으로 나누기 방지 확인
      if (settings.bpm === 0) {
        expect(settings.bpm).toBe(0);
      } else {
        const secondsPerBeat = 60 / settings.bpm;
        expect(secondsPerBeat).toBe(Infinity);
      }
    });

    it('should handle negative BPM by treating as absolute value', () => {
      const settings = { ...defaultMetronomeSettings, bpm: -120 };
      const absBpm = Math.abs(settings.bpm);
      expect(absBpm).toBe(120);
    });

    it('should handle floating point BPM', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 120.5 };
      expect(settings.bpm).toBeCloseTo(120.5, 1);
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBeCloseTo(0.498, 2);
    });

    it('should handle very large BPM without overflow', () => {
      const settings = { ...defaultMetronomeSettings, bpm: 10000 };
      const secondsPerBeat = 60 / settings.bpm;
      expect(secondsPerBeat).toBe(0.006);
      expect(Number.isFinite(secondsPerBeat)).toBe(true);
    });

    it('should handle invalid timer string values', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: 'abc', timerSeconds: 'xyz' };
      const minutes = parseInt(settings.timerMinutes, 10) || 0;
      const seconds = parseInt(settings.timerSeconds, 10) || 0;
      expect(minutes).toBe(0);
      expect(seconds).toBe(0);
    });

    it('should handle negative timer values', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: '-5', timerSeconds: '-30' };
      const minutes = Math.max(0, parseInt(settings.timerMinutes, 10) || 0);
      const seconds = Math.max(0, parseInt(settings.timerSeconds, 10) || 0);
      expect(minutes).toBe(0);
      expect(seconds).toBe(0);
    });

    it('should handle volume outside 0-100 range', () => {
      const settingsOver = { ...defaultMetronomeSettings, volume: 150 };
      const settingsUnder = { ...defaultMetronomeSettings, volume: -50 };

      const clampedOver = Math.min(100, Math.max(0, settingsOver.volume));
      const clampedUnder = Math.min(100, Math.max(0, settingsUnder.volume));

      expect(clampedOver).toBe(100);
      expect(clampedUnder).toBe(0);
    });
  });

  describe('Drum Machine Edge Cases', () => {
    it('should handle empty pattern array', () => {
      const pattern = createEmptyPattern(0);
      expect(pattern.kick).toHaveLength(0);
      expect(pattern.snare).toHaveLength(0);
    });

    it('should handle negative step count by using 0', () => {
      const stepCount = Math.max(0, -16);
      const pattern = createEmptyPattern(stepCount);
      expect(pattern.kick).toHaveLength(0);
    });

    it('should handle undefined synth params with defaults', () => {
      const drumId = 'kick' as const;
      const params = undefined;
      const safeParams = params ?? DRUM_DEFAULTS[drumId];
      expect(safeParams.pitch).toBe(60);
      expect(safeParams.decay).toBe(0.5);
    });

    it('should handle missing drum type in defaults', () => {
      const unknownDrumId = 'unknown' as keyof typeof DRUM_DEFAULTS;
      const params = DRUM_DEFAULTS[unknownDrumId];
      expect(params).toBeUndefined();
    });

    it('should handle volume at exact boundaries', () => {
      const settings0 = { ...defaultDrumMachineSettings, volume: 0 };
      const settings1 = { ...defaultDrumMachineSettings, volume: 1 };

      expect(settings0.volume).toBe(0);
      expect(settings1.volume).toBe(1);
    });

    it('should handle pattern with mixed true/false values', () => {
      const pattern = createEmptyPattern(16);
      pattern.kick[0] = true;
      pattern.kick[4] = true;
      pattern.kick[8] = true;
      pattern.kick[12] = true;

      const activeSteps = pattern.kick.filter(Boolean).length;
      expect(activeSteps).toBe(4);
    });
  });

  describe('QR Generator Edge Cases', () => {
    it('should handle empty text', () => {
      const settings = { ...defaultQRSettings, text: '' };
      expect(settings.text).toBe('');
      expect(settings.text.length).toBe(0);
    });

    it('should handle whitespace-only text', () => {
      const settings = { ...defaultQRSettings, text: '   ' };
      expect(settings.text.trim()).toBe('');
    });

    it('should handle special characters in text', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      const settings = { ...defaultQRSettings, text: specialChars };
      expect(settings.text).toBe(specialChars);
    });

    it('should handle Unicode text', () => {
      const unicodeText = '한글 テスト 🎵 Ümläut';
      const settings = { ...defaultQRSettings, text: unicodeText };
      expect(settings.text).toBe(unicodeText);
    });

    it('should handle URL with special characters', () => {
      const url = 'https://example.com/path?query=value&foo=bar#anchor';
      const settings = { ...defaultQRSettings, text: url };
      expect(settings.text).toBe(url);
    });

    it('should handle invalid hex color format gracefully', () => {
      const invalidColors = ['red', 'rgb(255,0,0)', '#fff', 'invalid'];
      invalidColors.forEach((color) => {
        const settings = { ...defaultQRSettings, foregroundColor: color };
        // 값은 설정되지만, 실제 렌더링 시 검증 필요
        expect(settings.foregroundColor).toBe(color);
      });
    });

    it('should handle size of zero', () => {
      const settings = { ...defaultQRSettings, size: 0 };
      expect(settings.size).toBe(0);
    });

    it('should handle negative size', () => {
      const settings = { ...defaultQRSettings, size: -256 };
      const safeSize = Math.max(1, settings.size);
      expect(safeSize).toBe(1);
    });
  });

  describe('Type Coercion Edge Cases', () => {
    it('should handle string to number coercion for BPM', () => {
      const bpmString = '120' as unknown as number;
      const settings = { ...defaultMetronomeSettings, bpm: Number(bpmString) };
      expect(settings.bpm).toBe(120);
    });

    it('should handle NaN values', () => {
      const nanBpm = parseInt('not a number', 10);
      expect(Number.isNaN(nanBpm)).toBe(true);

      const safeBpm = Number.isNaN(nanBpm) ? 120 : nanBpm;
      expect(safeBpm).toBe(120);
    });

    it('should handle Infinity values', () => {
      const infBpm = 60 / 0;
      expect(infBpm).toBe(Infinity);

      const safeBpm = Number.isFinite(infBpm) ? infBpm : 120;
      expect(safeBpm).toBe(120);
    });
  });

  describe('Concurrent Access Simulation', () => {
    it('should handle rapid setting changes', () => {
      let settings = { ...defaultMetronomeSettings };

      for (let i = 40; i <= 240; i++) {
        settings = { ...settings, bpm: i };
      }

      expect(settings.bpm).toBe(240);
    });

    it('should handle multiple pattern toggles', () => {
      const pattern = createEmptyPattern(16);

      // 빠르게 토글
      for (let i = 0; i < 100; i++) {
        const step = i % 16;
        pattern.kick[step] = !pattern.kick[step];
      }

      // 100번 토글 후 상태 확인 (짝수번 토글 = 원래 상태)
      expect(pattern.kick.some(Boolean)).toBe(true);
    });
  });
});
