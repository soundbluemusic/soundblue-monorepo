/**
 * @module timing
 *
 * @description
 * Audio timing and scheduling utilities for precise musical timing.
 *
 * This module provides two categories of functionality:
 *
 * 1. **Clock Utilities** - BPM calculations, beat timing, and swing offsets
 * 2. **Scheduler Utilities** - Event scheduling for look-ahead audio playback
 *
 * All functions are pure and work with standard time units (seconds/milliseconds).
 * No browser APIs are used, making this module safe for SSG/SSR environments.
 *
 * ## Clock Utilities
 *
 * Convert between BPM, milliseconds, and beat positions:
 *
 * ```typescript
 * import {
 *   bpmToMs,
 *   bpmToSeconds,
 *   msToBpm,
 *   getNoteDuration,
 *   getBeatTime,
 *   getBarPosition,
 * } from '@soundblue/audio-engine/timing';
 *
 * // Convert BPM to interval
 * const quarterNoteMs = bpmToMs(120);  // 500ms between quarter notes
 * const quarterNoteSec = bpmToSeconds(120);  // 0.5 seconds
 *
 * // Convert interval to BPM
 * const bpm = msToBpm(500);  // 120 BPM
 *
 * // Get duration for different note values
 * const sixteenthNote = getNoteDuration(120, 16);  // 125ms
 * const eighthNote = getNoteDuration(120, 8);  // 250ms
 * const halfNote = getNoteDuration(120, 2);  // 1000ms
 *
 * // Calculate when a specific beat occurs
 * const beat4Time = getBeatTime(4, 120, 0);  // 2.0 seconds
 *
 * // Get bar and beat position
 * const pos = getBarPosition(10, 4);  // { bar: 2, beatInBar: 2 }
 * ```
 *
 * ## Swing Timing
 *
 * Add human feel by delaying off-beat notes:
 *
 * ```typescript
 * import { getSwingOffset } from '@soundblue/audio-engine/timing';
 *
 * // Full swing (triplet feel) at 120 BPM
 * const offsetBeat1 = getSwingOffset(0, 1.0, 120);  // 0ms (on-beat)
 * const offsetBeat2 = getSwingOffset(1, 1.0, 120);  // ~83ms delay (off-beat)
 *
 * // Subtle swing (50%)
 * const subtleOffset = getSwingOffset(1, 0.5, 120);  // ~41ms delay
 * ```
 *
 * ## Audio Sample Calculations
 *
 * For working with audio buffers:
 *
 * ```typescript
 * import { samplesPerBeat } from '@soundblue/audio-engine/timing';
 *
 * // Samples per beat at 120 BPM, 44100 Hz sample rate
 * const samples = samplesPerBeat(120, 44100);  // 22050 samples
 * ```
 *
 * ## Event Scheduling
 *
 * The scheduler utilities implement a look-ahead scheduling pattern,
 * essential for glitch-free audio playback in browsers. The pattern
 * involves scheduling events slightly ahead of time to account for
 * JavaScript timer inconsistencies.
 *
 * ```typescript
 * import {
 *   DEFAULT_SCHEDULER_CONFIG,
 *   generateBeatEvents,
 *   getEventsInWindow,
 *   getNextScheduleWindow,
 *   mergeEvents,
 *   cleanupPastEvents,
 * } from '@soundblue/audio-engine/timing';
 *
 * // Scheduler config (100ms look-ahead, 25ms schedule interval)
 * const config = DEFAULT_SCHEDULER_CONFIG;
 *
 * // Generate beat events for a time range
 * const events = generateBeatEvents(0, 2, 120, 0);
 * // Events at 0s, 0.5s, 1.0s, 1.5s for 120 BPM
 *
 * // Get events that should be scheduled now
 * const currentTime = 0.5;
 * const toSchedule = getEventsInWindow(currentTime, events, 0.1);
 * // Events between 0.5s and 0.6s
 *
 * // Calculate next scheduling window
 * const window = getNextScheduleWindow(1.0, 0.5, 0.1);
 * // { start: 1.0, end: 1.1 }
 *
 * // Merge new events without duplicates
 * const newEvents = generateBeatEvents(2, 4, 120, 0);
 * const allEvents = mergeEvents(events, newEvents);
 *
 * // Clean up old events to prevent memory growth
 * const cleaned = cleanupPastEvents(allEvents, 2.0, 0.1);
 * ```
 *
 * ## Look-Ahead Scheduling Pattern
 *
 * The recommended pattern for audio scheduling:
 *
 * ```typescript
 * import {
 *   DEFAULT_SCHEDULER_CONFIG,
 *   getEventsInWindow,
 *   cleanupPastEvents,
 * } from '@soundblue/audio-engine/timing';
 *
 * const { lookAhead, scheduleInterval } = DEFAULT_SCHEDULER_CONFIG;
 * let events: ScheduledEvent[] = [];
 *
 * function schedulerLoop(audioContext: AudioContext) {
 *   const now = audioContext.currentTime;
 *
 *   // Get events in the look-ahead window
 *   const toSchedule = getEventsInWindow(now, events, lookAhead);
 *
 *   // Schedule each event
 *   for (const event of toSchedule) {
 *     scheduleAudioEvent(event.time, event.data);
 *   }
 *
 *   // Clean up old events
 *   events = cleanupPastEvents(events, now);
 *
 *   // Schedule next iteration
 *   setTimeout(() => schedulerLoop(audioContext), scheduleInterval);
 * }
 * ```
 *
 * @see {@link SchedulerConfig} - Configuration for the scheduler
 * @see {@link ScheduledEvent} - Event data structure
 */

// ========================================
// @soundblue/audio-engine - Timing
// Public API
// ========================================

export {
  bpmToMs,
  bpmToSeconds,
  getBarPosition,
  getBeatAtTime,
  getBeatTime,
  getNoteDuration,
  getSwingOffset,
  getTotalBeats,
  msToBpm,
  samplesPerBeat,
} from './clock';

export {
  cleanupPastEvents,
  DEFAULT_SCHEDULER_CONFIG,
  generateBeatEvents,
  getEventsInWindow,
  getNextScheduleWindow,
  mergeEvents,
  type ScheduledEvent,
  type SchedulerConfig,
} from './scheduler';
