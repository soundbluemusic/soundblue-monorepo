// ========================================
// @soundblue/audio-engine - Clock
// BPM and timing calculations
// Pure computation - no browser APIs
// ========================================

/**
 * Convert BPM to interval in milliseconds
 */
export function bpmToMs(bpm: number): number {
  if (bpm <= 0) throw new Error('BPM must be positive');
  return (60 / bpm) * 1000;
}

/**
 * Convert BPM to interval in seconds
 */
export function bpmToSeconds(bpm: number): number {
  if (bpm <= 0) throw new Error('BPM must be positive');
  return 60 / bpm;
}

/**
 * Convert milliseconds to BPM
 */
export function msToBpm(ms: number): number {
  if (ms <= 0) throw new Error('Interval must be positive');
  return (60 / ms) * 1000;
}

/**
 * Calculate beat duration based on note value
 * @param bpm - Beats per minute
 * @param noteValue - Note value (1 = whole, 2 = half, 4 = quarter, 8 = eighth, 16 = sixteenth)
 */
export function getNoteDuration(bpm: number, noteValue: number): number {
  const quarterNoteDuration = bpmToMs(bpm);
  return (quarterNoteDuration * 4) / noteValue;
}

/**
 * Calculate samples per beat
 * @param bpm - Beats per minute
 * @param sampleRate - Sample rate in Hz
 */
export function samplesPerBeat(bpm: number, sampleRate: number): number {
  return (sampleRate * 60) / bpm;
}

/**
 * Calculate the time of a specific beat
 * @param beat - Beat number (0-indexed)
 * @param bpm - Beats per minute
 * @param startTime - Start time in seconds
 */
export function getBeatTime(beat: number, bpm: number, startTime = 0): number {
  return startTime + beat * bpmToSeconds(bpm);
}

/**
 * Calculate which beat falls at a given time
 * @param time - Time in seconds
 * @param bpm - Beats per minute
 * @param startTime - Start time in seconds
 */
export function getBeatAtTime(time: number, bpm: number, startTime = 0): number {
  const elapsed = time - startTime;
  if (elapsed < 0) return -1;
  return Math.floor(elapsed / bpmToSeconds(bpm));
}

/**
 * Calculate bar and beat position
 * @param beat - Beat number (0-indexed)
 * @param beatsPerBar - Beats per bar (time signature numerator)
 */
export function getBarPosition(
  beat: number,
  beatsPerBar: number,
): { bar: number; beatInBar: number } {
  return {
    bar: Math.floor(beat / beatsPerBar),
    beatInBar: beat % beatsPerBar,
  };
}

/**
 * Calculate total beats from bar and beat position
 * @param bar - Bar number (0-indexed)
 * @param beatInBar - Beat within bar (0-indexed)
 * @param beatsPerBar - Beats per bar
 */
export function getTotalBeats(bar: number, beatInBar: number, beatsPerBar: number): number {
  return bar * beatsPerBar + beatInBar;
}

/**
 * Calculate swing offset for a given beat
 * @param beat - Beat number (0-indexed)
 * @param swingAmount - Swing amount (0 = no swing, 1 = full triplet swing)
 * @param bpm - Beats per minute
 */
export function getSwingOffset(beat: number, swingAmount: number, bpm: number): number {
  // Swing affects off-beats (odd-numbered 8th notes)
  const isOffBeat = beat % 2 === 1;
  if (!isOffBeat || swingAmount === 0) return 0;

  const eighthNoteDuration = getNoteDuration(bpm, 8);
  // Full triplet swing delays off-beat by 1/3 of eighth note
  return (eighthNoteDuration / 3) * swingAmount;
}
