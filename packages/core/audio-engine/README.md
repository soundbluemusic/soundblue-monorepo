# @soundblue/audio-engine

> Pure audio computation library for timing, sequencing, and music theory
>
> 순수 오디오 연산 라이브러리 - 타이밍, 시퀀싱, 음악 이론

---

## Overview

`@soundblue/audio-engine` provides core audio logic without any browser API dependencies, making it safe to use in SSG (Static Site Generation) and SSR environments. The actual audio playback is handled by `@soundblue/web-audio` which wraps this logic with Web Audio API implementations.

이 패키지는 브라우저 API 의존성 없이 순수한 오디오 로직을 제공합니다. SSG/SSR 빌드 환경에서 안전하게 사용할 수 있습니다.

---

## Installation

```bash
pnpm add @soundblue/audio-engine
```

---

## Package Structure

```
@soundblue/audio-engine
├── /                 # Main entry (re-exports all)
├── /sequencer        # Pattern and step sequencer
├── /timing           # BPM, scheduling, clock utilities
└── /theory           # Scales, rhythms, note calculations
```

---

## Quick Start

```typescript
import {
  // Sequencer
  createEmptyPattern,
  createSequencerState,
  toggleStep,
  play,
  nextStep,

  // Timing
  bpmToMs,
  getStepInterval,

  // Theory
  euclideanRhythm,
  getScaleNotes,
  midiToFrequency,
} from '@soundblue/audio-engine';

// Create a drum pattern
const pattern = createEmptyPattern('drums', 'Drum Pattern', 4, 16);
const withKick = toggleStep(pattern, 'track-0', 0);  // Kick on beat 1

// Create sequencer state
const state = createSequencerState(withKick, 120);  // 120 BPM

// Calculate timing
const stepInterval = getStepInterval(state);  // ~125ms for 16th notes at 120 BPM

// Generate Euclidean rhythm
const hiHat = euclideanRhythm(5, 8);  // 5 hits distributed across 8 steps

// Get notes in a scale
const cMajor = getScaleNotes('C', 'major', 4);  // [60, 62, 64, 65, 67, 69, 71]
```

---

## Modules

### Sequencer Module

Step sequencer state management for pattern-based composition.

```typescript
import {
  // Pattern creation and manipulation
  createEmptyPattern,
  toggleStep,
  setStepVelocity,
  toggleMute,
  toggleSolo,
  clearPattern,
  shiftPattern,
  randomizePattern,
  getActiveTracks,
  getActiveStepsAt,

  // Sequencer state
  createSequencerState,
  play,
  pause,
  stop,
  nextStep,
  goToStep,
  setBpm,
  setSwing,
  toggleLoop,
  getCurrentStepEvent,
  getStepInterval,
  getSwingAdjustedInterval,

  // Types
  type Pattern,
  type PatternStep,
  type PatternTrack,
  type StepSequencerState,
  type StepEvent,
} from '@soundblue/audio-engine/sequencer';
```

**Example: Building a Drum Machine**

```typescript
// Create pattern with 4 tracks and 16 steps
let pattern = createEmptyPattern('main', 'Main Beat', 4, 16, 4);

// Add kick on beats 1 and 3
pattern = toggleStep(pattern, 'track-0', 0);
pattern = toggleStep(pattern, 'track-0', 8);

// Add snare on beats 2 and 4
pattern = toggleStep(pattern, 'track-1', 4);
pattern = toggleStep(pattern, 'track-1', 12);

// Create sequencer at 120 BPM with swing
let state = createSequencerState(pattern, 120);
state = setSwing(state, 0.3);  // 30% swing
state = play(state);

// Playback loop
function tick(currentTime: number) {
  const event = getCurrentStepEvent(state, currentTime);

  for (const { trackId, velocity } of event.activeSteps) {
    // Trigger sound for trackId with velocity
    playSound(trackId, velocity);
  }

  state = nextStep(state);
}

// Get timing for next step
const interval = getSwingAdjustedInterval(state);
```

---

### Timing Module

BPM calculations and event scheduling.

```typescript
import {
  // Clock utilities
  bpmToMs,
  bpmToSeconds,
  msToBpm,
  getNoteDuration,
  samplesPerBeat,
  getBeatTime,
  getBeatAtTime,
  getBarPosition,
  getTotalBeats,
  getSwingOffset,

  // Scheduler
  DEFAULT_SCHEDULER_CONFIG,
  generateBeatEvents,
  getEventsInWindow,
  getNextScheduleWindow,
  mergeEvents,
  cleanupPastEvents,

  // Types
  type SchedulerConfig,
  type ScheduledEvent,
} from '@soundblue/audio-engine/timing';
```

**Example: Timing Calculations**

```typescript
// BPM conversions
const quarterNoteMs = bpmToMs(120);      // 500ms
const bpm = msToBpm(500);                 // 120 BPM

// Note durations
const sixteenthNote = getNoteDuration(120, 16);  // 125ms
const eighthNote = getNoteDuration(120, 8);      // 250ms
const halfNote = getNoteDuration(120, 2);        // 1000ms

// Bar and beat calculations
const pos = getBarPosition(10, 4);  // { bar: 2, beatInBar: 2 }
const beatTime = getBeatTime(4, 120, 0);  // 2.0 seconds

// Swing timing
const swingOffset = getSwingOffset(1, 0.5, 120);  // ~41ms delay on off-beats
```

**Example: Look-Ahead Scheduling**

```typescript
const { lookAhead, scheduleInterval } = DEFAULT_SCHEDULER_CONFIG;
let events: ScheduledEvent[] = [];

function schedulerLoop(audioContext: AudioContext) {
  const now = audioContext.currentTime;

  // Get events in the look-ahead window
  const toSchedule = getEventsInWindow(now, events, lookAhead);

  // Schedule each event
  for (const event of toSchedule) {
    scheduleAudioEvent(event.time, event.data);
  }

  // Clean up old events
  events = cleanupPastEvents(events, now);

  // Schedule next iteration
  setTimeout(() => schedulerLoop(audioContext), scheduleInterval);
}
```

---

### Theory Module

Musical scales and rhythm patterns.

```typescript
import {
  // Rhythm
  TIME_SIGNATURES,
  NOTE_VALUES,
  RHYTHM_PATTERNS,
  patternToSteps,
  stepsToPattern,
  euclideanRhythm,
  calculateDensity,
  invertPattern,
  rotatePattern,
  combineAnd,
  combineOr,
  combineXor,
  scalePattern,

  // Scales
  NOTE_NAMES,
  SCALE_INTERVALS,
  getNoteIndex,
  getNoteName,
  getOctave,
  toMidiNote,
  getScaleNotes,
  getScaleNotesMultiOctave,
  isNoteInScale,
  quantizeToScale,
  transpose,
  getRelativeMinor,
  getRelativeMajor,
  midiToFrequency,
  frequencyToMidi,

  // Types
  type TimeSignature,
  type NoteValue,
  type RhythmPatternName,
  type NoteName,
  type ScaleName,
} from '@soundblue/audio-engine/theory';
```

**Example: Euclidean Rhythms**

```typescript
// Cuban tresillo: 3 hits across 8 steps
const tresillo = euclideanRhythm(3, 8);
// [true, false, false, true, false, false, true, false]
// Visual: X--X--X-

// Cuban cinquillo: 5 hits across 8 steps
const cinquillo = euclideanRhythm(5, 8);
// Visual: X-XX-XX-

// Bossa nova pattern with rotation
const bossaNova = euclideanRhythm(5, 16, 3);
```

**Example: Pattern Operations**

```typescript
// Pre-defined patterns
const kick = patternToSteps('fourOnFloor', 16);
const snare = patternToSteps('backbeat', 16);
const hiHat = patternToSteps('hiHatEighths', 16);

// Combine patterns
const drumBeat = combineOr(combineOr(kick, snare), hiHat);

// Pattern density
const kickDensity = calculateDensity(kick);  // 0.25 (4/16 steps)

// Rotate pattern
const shiftedClave = rotatePattern(patternToSteps('clave32', 16), 4);

// Invert for off-beats
const offBeats = invertPattern(kick);
```

**Example: Scale Operations**

```typescript
// MIDI note conversion
const middleC = toMidiNote('C', 4);      // 60
const a4Freq = midiToFrequency(69);       // 440 Hz

// Get scale notes
const cMajor = getScaleNotes('C', 'major', 4);
// [60, 62, 64, 65, 67, 69, 71]

const cMinorPentatonic = getScaleNotes('C', 'pentatonicMinor', 4);
// [60, 63, 65, 67, 70]

// Multi-octave scale
const cMajor2Oct = getScaleNotesMultiOctave('C', 'major', 4, 2);
// 14 notes across 2 octaves

// Scale quantization
const quantized = quantizeToScale(61, 'C', 'major');  // 62 (C# → D)

// Relative keys
const aMinor = getRelativeMinor('C');  // 'A'
const cMajor2 = getRelativeMajor('A'); // 'C'
```

**Available Scales**

| Scale Name | Intervals |
|------------|-----------|
| `major` | 0, 2, 4, 5, 7, 9, 11 |
| `minor` | 0, 2, 3, 5, 7, 8, 10 |
| `harmonicMinor` | 0, 2, 3, 5, 7, 8, 11 |
| `melodicMinor` | 0, 2, 3, 5, 7, 9, 11 |
| `dorian` | 0, 2, 3, 5, 7, 9, 10 |
| `phrygian` | 0, 1, 3, 5, 7, 8, 10 |
| `lydian` | 0, 2, 4, 6, 7, 9, 11 |
| `mixolydian` | 0, 2, 4, 5, 7, 9, 10 |
| `locrian` | 0, 1, 3, 5, 6, 8, 10 |
| `pentatonicMajor` | 0, 2, 4, 7, 9 |
| `pentatonicMinor` | 0, 3, 5, 7, 10 |
| `blues` | 0, 3, 5, 6, 7, 10 |
| `chromatic` | 0-11 (all semitones) |
| `wholeWholeTone` | 0, 2, 4, 6, 8, 10 |

---

## Design Principles

1. **Pure Functions** - All functions are pure with no side effects
2. **Immutable State** - State updates return new objects (suitable for React)
3. **No Browser APIs** - Safe for SSG/SSR build environments
4. **TypeScript First** - Full type safety with exported interfaces

---

## Type Definitions

### Pattern Types

```typescript
interface PatternStep {
  active: boolean;
  velocity: number;  // 0-1
  noteId?: string;
}

interface PatternTrack {
  id: string;
  name: string;
  steps: PatternStep[];
  muted: boolean;
  solo: boolean;
}

interface Pattern {
  id: string;
  name: string;
  tracks: PatternTrack[];
  length: number;      // Number of steps
  subdivision: number; // Steps per beat (4 = 16th notes)
}
```

### Sequencer Types

```typescript
interface StepSequencerState {
  pattern: Pattern;
  currentStep: number;
  isPlaying: boolean;
  bpm: number;
  swing: number;  // 0-1
  loop: boolean;
}

interface StepEvent {
  step: number;
  time: number;
  activeSteps: { trackId: string; velocity: number }[];
}
```

### Scheduler Types

```typescript
interface ScheduledEvent {
  id: string;
  time: number;
  callback: string;
  data?: unknown;
}

interface SchedulerConfig {
  lookAhead: number;       // seconds
  scheduleInterval: number; // milliseconds
}
```

---

## Related Packages

| Package | Description |
|---------|-------------|
| `@soundblue/web-audio` | Browser implementation using Web Audio API |
| `@soundblue/ui-components` | React components for audio visualization |

---

## References

- [Euclidean Rhythm Theory](https://en.wikipedia.org/wiki/Euclidean_rhythm)
- [Bjorklund's Algorithm Paper](https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf)
- [Son Clave Patterns](https://en.wikipedia.org/wiki/Clave_(rhythm))
- [Web Audio API Scheduling](https://www.html5rocks.com/en/tutorials/audio/scheduling/)

---

## License

MIT
