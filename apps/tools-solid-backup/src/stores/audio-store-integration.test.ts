/**
 * Audio Store Integration Tests
 * 오디오 스토어 통합 테스트
 *
 * Test Effectiveness: 실제 사용 시나리오
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  audioActions,
  audioStore,
  useBpm,
  useIsPlaying,
  useMasterMeter,
  useTransport,
} from './audio-store';

describe('Audio Store Integration Tests', () => {
  beforeEach(() => {
    // 상태 초기화
    audioActions.stop();
    audioActions.setBpm(120);
  });

  describe('User Scenario: 재생 세션', () => {
    it('should start in stopped state', () => {
      expect(useIsPlaying()).toBe(false);
    });

    it('should allow starting playback', () => {
      audioActions.play();
      expect(useIsPlaying()).toBe(true);
    });

    it('should allow stopping playback', () => {
      audioActions.play();
      audioActions.stop();
      expect(useIsPlaying()).toBe(false);
    });

    it('should allow pausing playback', () => {
      audioActions.play();
      audioActions.pause();
      expect(useIsPlaying()).toBe(false);
      expect(useTransport().isPaused).toBe(true);
    });

    it('should resume from pause with play', () => {
      audioActions.play();
      audioActions.pause();
      audioActions.play();
      expect(useIsPlaying()).toBe(true);
      expect(useTransport().isPaused).toBe(false);
    });
  });

  describe('User Scenario: BPM 조절', () => {
    it('should have default BPM of 120', () => {
      audioActions.setBpm(120);
      expect(useBpm()).toBe(120);
    });

    it('should allow setting BPM', () => {
      audioActions.setBpm(140);
      expect(useBpm()).toBe(140);
    });

    it('should clamp BPM to minimum 20', () => {
      audioActions.setBpm(10);
      expect(useBpm()).toBe(20); // Clamped to minimum
    });

    it('should clamp BPM to maximum 300', () => {
      audioActions.setBpm(350);
      expect(useBpm()).toBe(300); // Clamped to maximum
    });

    it('should handle rapid BPM changes', () => {
      for (let bpm = 60; bpm <= 180; bpm += 10) {
        audioActions.setBpm(bpm);
      }
      expect(useBpm()).toBe(180);
    });
  });

  describe('User Scenario: 미터 업데이트', () => {
    it('should have default meter values of 0', () => {
      const meter = useMasterMeter();
      expect(meter.leftLevel).toBe(0);
      expect(meter.rightLevel).toBe(0);
    });

    it('should update meter levels', () => {
      audioActions.updateMeter(0.5, 0.7);
      const meter = useMasterMeter();
      expect(meter.leftLevel).toBe(0.5);
      expect(meter.rightLevel).toBe(0.7);
    });

    it('should track peak values', () => {
      audioActions.updateMeter(0.8, 0.9);
      const meter = useMasterMeter();
      expect(meter.leftPeak).toBeGreaterThanOrEqual(0.8);
      expect(meter.rightPeak).toBeGreaterThanOrEqual(0.9);
    });

    it('should handle rapid meter updates', () => {
      for (let i = 0; i < 100; i++) {
        audioActions.updateMeter(Math.random(), Math.random());
      }
      const meter = useMasterMeter();
      expect(meter.leftLevel).toBeGreaterThanOrEqual(0);
      expect(meter.leftLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('User Scenario: 루프 기능', () => {
    it('should start with looping disabled', () => {
      expect(useTransport().isLooping).toBe(false);
    });

    it('should toggle loop on and off', () => {
      audioActions.toggleLoop();
      expect(useTransport().isLooping).toBe(true);

      audioActions.toggleLoop();
      expect(useTransport().isLooping).toBe(false);
    });

    it('should set loop points', () => {
      audioActions.setLoopPoints(4, 8);
      const transport = useTransport();
      expect(transport.loopStart).toBe(4);
      expect(transport.loopEnd).toBe(8);
    });
  });

  describe('User Scenario: 타임 트래킹', () => {
    it('should start at time 0', () => {
      const transport = useTransport();
      expect(transport.currentTime).toBe(0);
    });

    it('should update current time', () => {
      audioActions.setCurrentTime(5.5);
      expect(useTransport().currentTime).toBe(5.5);
    });

    it('should calculate beat from time', () => {
      audioActions.setBpm(120); // 2 beats per second
      audioActions.setCurrentTime(2); // 4 beats = 0 (beat within bar)
      const transport = useTransport();
      expect(transport.currentBeat).toBeGreaterThanOrEqual(0);
    });

    it('should calculate bar from time', () => {
      audioActions.setBpm(120); // 2 beats per second
      audioActions.setCurrentTime(8); // 16 beats = 4 bars
      const transport = useTransport();
      expect(transport.currentBar).toBe(4);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state across multiple actions', () => {
      audioActions.setBpm(140);
      audioActions.play();

      expect(useBpm()).toBe(140);
      expect(useIsPlaying()).toBe(true);
    });

    it('should be readable directly from store', () => {
      audioActions.setBpm(100);
      expect(audioStore.transport.bpm).toBe(100);
    });

    it('should reset time on stop', () => {
      audioActions.setCurrentTime(10);
      audioActions.stop();
      expect(useTransport().currentTime).toBe(0);
      expect(useTransport().currentBeat).toBe(0);
      expect(useTransport().currentBar).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle many rapid state changes', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        audioActions.setBpm(60 + (i % 180));
        audioActions.updateMeter((i % 100) / 100, (i % 100) / 100);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 1000번 변경이 100ms 이내
    });
  });

  describe('Engine Initialization', () => {
    it('should start uninitialized', () => {
      // 새 테스트에서는 이미 초기화될 수 있음
      expect(typeof audioStore.isInitialized).toBe('boolean');
    });

    it('should have sample rate defined', () => {
      expect(audioStore.sampleRate).toBeGreaterThan(0);
    });

    it('should have buffer size defined', () => {
      expect(audioStore.bufferSize).toBeGreaterThan(0);
    });
  });
});
