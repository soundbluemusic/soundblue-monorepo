// Drum Machine Settings

export type DrumId = 'kick' | 'snare' | 'hihat' | 'clap';

export interface DrumSynthParams {
  pitch: number;
  decay: number;
  tone: number;
  punch: number;
}

export const DRUM_DEFAULTS: Record<DrumId, DrumSynthParams> = {
  kick: { pitch: 60, decay: 0.5, tone: 30, punch: 80 },
  snare: { pitch: 200, decay: 0.2, tone: 50, punch: 60 },
  hihat: { pitch: 800, decay: 0.05, tone: 90, punch: 40 },
  clap: { pitch: 400, decay: 0.15, tone: 60, punch: 70 },
};

export const DRUM_SOUNDS: { id: DrumId; name: string; icon: string }[] = [
  { id: 'kick', name: 'Kick', icon: '🔈' },
  { id: 'snare', name: 'Snare', icon: '🥁' },
  { id: 'hihat', name: 'Hi-Hat', icon: '🎛️' },
  { id: 'clap', name: 'Clap', icon: '👏' },
];

export interface DrumMachineSettings {
  bpm: number;
  steps: number;
  pattern: Record<DrumId, boolean[]>;
  volume: number;
  swing: number;
  metronomeEnabled: boolean;
  synth: Record<DrumId, DrumSynthParams>;
}

export const createEmptyPattern = (steps: number): Record<DrumId, boolean[]> => ({
  kick: Array(steps).fill(false),
  snare: Array(steps).fill(false),
  hihat: Array(steps).fill(false),
  clap: Array(steps).fill(false),
});

export const defaultDrumMachineSettings: DrumMachineSettings = {
  bpm: 120,
  steps: 16,
  pattern: createEmptyPattern(16),
  volume: 0.7,
  swing: 0,
  metronomeEnabled: false,
  synth: { ...DRUM_DEFAULTS },
};

export const METRONOME = {
  ACCENT_FREQ: 1500,
  REGULAR_FREQ: 1000,
  CLICK_DURATION: 0.05,
};
