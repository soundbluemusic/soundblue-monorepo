// Metronome Settings

export interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
  beatUnit: number;
  volume: number;
  timerMinutes: string;
  timerSeconds: string;
}

export const defaultMetronomeSettings: MetronomeSettings = {
  bpm: 120,
  beatsPerMeasure: 4,
  beatUnit: 4,
  volume: 80,
  timerMinutes: '',
  timerSeconds: '',
};

export const metronomeMeta = {
  id: 'metronome',
  name: {
    ko: '메트로놈',
    en: 'Metronome',
  },
  description: {
    ko: '정확한 템포 연습을 위한 메트로놈',
    en: 'Precision metronome for tempo practice',
  },
  icon: '⏱️',
  category: 'music' as const,
  defaultSize: 'lg' as const,
  minSize: { width: 320, height: 400 },
  tags: ['tempo', 'practice', 'rhythm', 'bpm'],
};

// Constants
export const BPM_RANGE = { MIN: 40, MAX: 240 };
export const FREQUENCIES = { ACCENT: 2000, REGULAR: 800 };
export const TIMING = {
  SCHEDULER_INTERVAL_MS: 25,
  LOOK_AHEAD_SECONDS: 0.1,
  CLICK_DURATION_SECONDS: 0.08,
};
export const PENDULUM = { MAX_ANGLE: 30, SWING_RANGE: 60 };
