// Drum Machine Shared Types

export type DrumId = 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap';

export interface DrumSynthParams {
  pitch: number;
  decay: number;
  tone: number;
  punch: number;
}
