// ========================================
// @soundblue/audio-engine - Pattern
// Pattern definitions and manipulation
// Pure computation - no browser APIs
// ========================================

/**
 * A single step in a pattern
 */
export interface PatternStep {
  /** Whether this step is active */
  active: boolean;
  /** Velocity (0-1) */
  velocity: number;
  /** Optional note or sound ID */
  noteId?: string;
}

/**
 * A track in a pattern (one instrument/sound)
 */
export interface PatternTrack {
  id: string;
  name: string;
  steps: PatternStep[];
  muted: boolean;
  solo: boolean;
}

/**
 * A complete pattern
 */
export interface Pattern {
  id: string;
  name: string;
  tracks: PatternTrack[];
  length: number; // Number of steps
  subdivision: number; // Steps per beat (4 = 16th notes, 2 = 8th notes)
}

/**
 * Create an empty pattern
 */
export function createEmptyPattern(
  id: string,
  name: string,
  trackCount: number,
  length: number,
  subdivision = 4,
): Pattern {
  const tracks: PatternTrack[] = [];

  for (let i = 0; i < trackCount; i++) {
    tracks.push({
      id: `track-${i}`,
      name: `Track ${i + 1}`,
      steps: Array.from({ length }, () => ({
        active: false,
        velocity: 1,
      })),
      muted: false,
      solo: false,
    });
  }

  return {
    id,
    name,
    tracks,
    length,
    subdivision,
  };
}

/**
 * Toggle a step in a pattern
 */
export function toggleStep(pattern: Pattern, trackId: string, stepIndex: number): Pattern {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step, i) =>
              i === stepIndex ? { ...step, active: !step.active } : step,
            ),
          }
        : track,
    ),
  };
}

/**
 * Set step velocity
 */
export function setStepVelocity(
  pattern: Pattern,
  trackId: string,
  stepIndex: number,
  velocity: number,
): Pattern {
  const clampedVelocity = Math.max(0, Math.min(1, velocity));

  return {
    ...pattern,
    tracks: pattern.tracks.map((track) =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step, i) =>
              i === stepIndex ? { ...step, velocity: clampedVelocity } : step,
            ),
          }
        : track,
    ),
  };
}

/**
 * Toggle track mute
 */
export function toggleMute(pattern: Pattern, trackId: string): Pattern {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) =>
      track.id === trackId ? { ...track, muted: !track.muted } : track,
    ),
  };
}

/**
 * Toggle track solo
 */
export function toggleSolo(pattern: Pattern, trackId: string): Pattern {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) =>
      track.id === trackId ? { ...track, solo: !track.solo } : track,
    ),
  };
}

/**
 * Clear all steps in a pattern
 */
export function clearPattern(pattern: Pattern): Pattern {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) => ({
      ...track,
      steps: track.steps.map((step) => ({ ...step, active: false })),
    })),
  };
}

/**
 * Get active tracks (considering solo)
 */
export function getActiveTracks(pattern: Pattern): PatternTrack[] {
  const hasSolo = pattern.tracks.some((t) => t.solo);

  if (hasSolo) {
    return pattern.tracks.filter((t) => t.solo && !t.muted);
  }

  return pattern.tracks.filter((t) => !t.muted);
}

/**
 * Get active steps at a given step index
 */
export function getActiveStepsAt(
  pattern: Pattern,
  stepIndex: number,
): { trackId: string; step: PatternStep }[] {
  const activeTracks = getActiveTracks(pattern);
  const result: { trackId: string; step: PatternStep }[] = [];

  for (const track of activeTracks) {
    const step = track.steps[stepIndex];
    if (step?.active) {
      result.push({ trackId: track.id, step });
    }
  }

  return result;
}

/**
 * Shift pattern left or right
 */
export function shiftPattern(pattern: Pattern, direction: 'left' | 'right'): Pattern {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) => ({
      ...track,
      steps:
        direction === 'left'
          ? [...track.steps.slice(1), track.steps[0]]
          : [track.steps[track.steps.length - 1], ...track.steps.slice(0, -1)],
    })),
  };
}

/**
 * Randomize pattern with given density
 * @param density - Probability of each step being active (0-1)
 */
export function randomizePattern(pattern: Pattern, density: number): Pattern {
  const clampedDensity = Math.max(0, Math.min(1, density));

  return {
    ...pattern,
    tracks: pattern.tracks.map((track) => ({
      ...track,
      steps: track.steps.map((step) => ({
        ...step,
        active: Math.random() < clampedDensity,
        velocity: step.active ? step.velocity : 0.5 + Math.random() * 0.5,
      })),
    })),
  };
}
