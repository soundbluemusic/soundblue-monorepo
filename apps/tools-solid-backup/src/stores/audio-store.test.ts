import { beforeEach, describe, expect, it } from 'vitest';
import { useAudioStore } from './audio-store';

describe('Audio Store', () => {
  // Reset store state between tests
  beforeEach(() => {
    // Reset store to complete initial state including transport
    useAudioStore.setState({
      isInitialized: false,
      isWasmLoaded: false,
      isWorkletReady: false,
      sampleRate: 48000,
      bufferSize: 128,
      latency: 0,
      transport: {
        isPlaying: false,
        isPaused: false,
        isRecording: false,
        bpm: 120,
        currentTime: 0,
        currentBeat: 0,
        currentBar: 0,
        loopStart: 0,
        loopEnd: 16,
        isLooping: false,
      },
      masterMeter: {
        leftLevel: 0,
        rightLevel: 0,
        leftPeak: 0,
        rightPeak: 0,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial transport state', () => {
      const { transport } = useAudioStore.getState();

      expect(transport.isPlaying).toBe(false);
      expect(transport.isPaused).toBe(false);
      expect(transport.isRecording).toBe(false);
      expect(transport.bpm).toBe(120);
      expect(transport.currentTime).toBe(0);
      expect(transport.currentBeat).toBe(0);
      expect(transport.currentBar).toBe(0);
      expect(transport.loopStart).toBe(0);
      expect(transport.loopEnd).toBe(16);
      expect(transport.isLooping).toBe(false);
    });

    it('should have correct initial engine state', () => {
      const state = useAudioStore.getState();

      expect(state.isInitialized).toBe(false);
      expect(state.isWasmLoaded).toBe(false);
      expect(state.isWorkletReady).toBe(false);
      expect(state.sampleRate).toBe(48000);
      expect(state.bufferSize).toBe(128);
    });

    it('should have zeroed master meter', () => {
      const { masterMeter } = useAudioStore.getState();

      expect(masterMeter.leftLevel).toBe(0);
      expect(masterMeter.rightLevel).toBe(0);
      expect(masterMeter.leftPeak).toBe(0);
      expect(masterMeter.rightPeak).toBe(0);
    });
  });

  describe('Transport Controls', () => {
    describe('play', () => {
      it('should set isPlaying to true', () => {
        const { play } = useAudioStore.getState();
        play();

        const { transport } = useAudioStore.getState();
        expect(transport.isPlaying).toBe(true);
        expect(transport.isPaused).toBe(false);
      });

      it('should resume from paused state', () => {
        const { play, pause } = useAudioStore.getState();

        play();
        pause();
        play();

        const { transport } = useAudioStore.getState();
        expect(transport.isPlaying).toBe(true);
        expect(transport.isPaused).toBe(false);
      });
    });

    describe('pause', () => {
      it('should pause playback', () => {
        const { play, pause } = useAudioStore.getState();

        play();
        pause();

        const { transport } = useAudioStore.getState();
        expect(transport.isPlaying).toBe(false);
        expect(transport.isPaused).toBe(true);
      });

      it('should preserve current time when pausing', () => {
        const { play, pause, setCurrentTime } = useAudioStore.getState();

        play();
        setCurrentTime(5.5);
        pause();

        const { transport } = useAudioStore.getState();
        expect(transport.currentTime).toBe(5.5);
      });
    });

    describe('stop', () => {
      it('should stop playback and reset position', () => {
        const { play, stop, setCurrentTime } = useAudioStore.getState();

        play();
        setCurrentTime(10);
        stop();

        const { transport } = useAudioStore.getState();
        expect(transport.isPlaying).toBe(false);
        expect(transport.isPaused).toBe(false);
        expect(transport.currentTime).toBe(0);
        expect(transport.currentBeat).toBe(0);
        expect(transport.currentBar).toBe(0);
      });
    });
  });

  describe('BPM Management', () => {
    describe('setBpm', () => {
      it('should set BPM within valid range', () => {
        const { setBpm } = useAudioStore.getState();

        setBpm(140);

        const { transport } = useAudioStore.getState();
        expect(transport.bpm).toBe(140);
      });

      it('should clamp BPM to minimum of 20', () => {
        const { setBpm } = useAudioStore.getState();

        setBpm(10);

        const { transport } = useAudioStore.getState();
        expect(transport.bpm).toBe(20);
      });

      it('should clamp BPM to maximum of 300', () => {
        const { setBpm } = useAudioStore.getState();

        setBpm(400);

        const { transport } = useAudioStore.getState();
        expect(transport.bpm).toBe(300);
      });

      it('should handle edge case BPM values', () => {
        const { setBpm } = useAudioStore.getState();

        setBpm(20);
        expect(useAudioStore.getState().transport.bpm).toBe(20);

        setBpm(300);
        expect(useAudioStore.getState().transport.bpm).toBe(300);
      });
    });
  });

  describe('Time and Position', () => {
    describe('setCurrentTime', () => {
      it('should update current time', () => {
        const { setCurrentTime } = useAudioStore.getState();

        setCurrentTime(5.0);

        const { transport } = useAudioStore.getState();
        expect(transport.currentTime).toBe(5.0);
      });

      it('should calculate beat correctly at 120 BPM', () => {
        const { setCurrentTime, setBpm } = useAudioStore.getState();

        setBpm(120); // 2 beats per second
        setCurrentTime(1.0); // 2 beats total, so beat 2 mod 4 = 2

        const { transport } = useAudioStore.getState();
        expect(transport.currentBeat).toBe(2);
      });

      it('should calculate bar correctly', () => {
        const { setCurrentTime, setBpm } = useAudioStore.getState();

        setBpm(120); // 2 beats per second
        setCurrentTime(4.0); // 8 beats = 2 bars

        const { transport } = useAudioStore.getState();
        expect(transport.currentBar).toBe(2);
      });

      it('should wrap beat within 4-beat measure', () => {
        const { setCurrentTime, setBpm } = useAudioStore.getState();

        setBpm(60); // 1 beat per second
        setCurrentTime(5.0); // 5 beats, beat 5 mod 4 = 1

        const { transport } = useAudioStore.getState();
        expect(transport.currentBeat).toBe(1);
      });
    });
  });

  describe('Loop Controls', () => {
    describe('toggleLoop', () => {
      it('should toggle loop on', () => {
        const { toggleLoop } = useAudioStore.getState();

        toggleLoop();

        const { transport } = useAudioStore.getState();
        expect(transport.isLooping).toBe(true);
      });

      it('should toggle loop off', () => {
        const { toggleLoop } = useAudioStore.getState();

        toggleLoop();
        toggleLoop();

        const { transport } = useAudioStore.getState();
        expect(transport.isLooping).toBe(false);
      });
    });

    describe('setLoopPoints', () => {
      it('should set loop start and end points', () => {
        const { setLoopPoints } = useAudioStore.getState();

        setLoopPoints(4, 12);

        const { transport } = useAudioStore.getState();
        expect(transport.loopStart).toBe(4);
        expect(transport.loopEnd).toBe(12);
      });
    });
  });

  describe('Meter Updates', () => {
    describe('updateMeter', () => {
      it('should update meter levels', () => {
        const { updateMeter } = useAudioStore.getState();

        updateMeter(0.5, 0.6);

        const { masterMeter } = useAudioStore.getState();
        expect(masterMeter.leftLevel).toBe(0.5);
        expect(masterMeter.rightLevel).toBe(0.6);
      });

      it('should update peak when new level is higher', () => {
        const { updateMeter } = useAudioStore.getState();

        updateMeter(0.8, 0.9);

        const { masterMeter } = useAudioStore.getState();
        expect(masterMeter.leftPeak).toBe(0.8);
        expect(masterMeter.rightPeak).toBe(0.9);
      });

      it('should decay peak over time (0.99 factor)', () => {
        const { updateMeter } = useAudioStore.getState();

        // Set initial peak
        updateMeter(1.0, 1.0);
        expect(useAudioStore.getState().masterMeter.leftPeak).toBe(1.0);

        // Update with lower level - peak should decay
        updateMeter(0.5, 0.5);

        const { masterMeter } = useAudioStore.getState();
        // Peak decays: max(0.99 * 1.0, 0.5) = 0.99
        expect(masterMeter.leftPeak).toBeCloseTo(0.99, 2);
        expect(masterMeter.rightPeak).toBeCloseTo(0.99, 2);
      });

      it('should handle zero levels', () => {
        const { updateMeter } = useAudioStore.getState();

        updateMeter(0, 0);

        const { masterMeter } = useAudioStore.getState();
        expect(masterMeter.leftLevel).toBe(0);
        expect(masterMeter.rightLevel).toBe(0);
      });
    });
  });

  describe('Initialize', () => {
    it('should initialize audio engine', async () => {
      const { initialize } = useAudioStore.getState();

      await initialize();

      const state = useAudioStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.sampleRate).toBe(48000);
      expect(state.bufferSize).toBe(128);
      expect(state.latency).toBeCloseTo(2.67, 1);
    });

    it('should not reinitialize if already initialized', async () => {
      const { initialize } = useAudioStore.getState();

      await initialize();

      // Modify latency to detect if initialize runs again
      useAudioStore.setState({ latency: 999 });
      await initialize();

      // Should still be 999 because initialize should exit early
      expect(useAudioStore.getState().latency).toBe(999);
    });
  });

  describe('Selector Hooks', () => {
    it('useTransport should return transport state', () => {
      const { transport } = useAudioStore.getState();
      expect(transport).toBeDefined();
      expect(transport.bpm).toBeDefined();
    });

    it('useMasterMeter should return meter state', () => {
      const { masterMeter } = useAudioStore.getState();
      expect(masterMeter).toBeDefined();
      expect(masterMeter.leftLevel).toBeDefined();
    });
  });
});
