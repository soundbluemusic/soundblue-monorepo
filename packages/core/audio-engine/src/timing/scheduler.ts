// ========================================
// @soundblue/audio-engine - Scheduler
// Scheduling logic for audio events
// Pure computation - no browser APIs
// ========================================

import { bpmToSeconds, getBeatTime } from './clock';

/**
 * Scheduled event
 */
export interface ScheduledEvent {
  id: string;
  time: number;
  callback: string; // Event type/name - actual callback handled by consumer
  data?: unknown;
}

/**
 * Scheduling configuration
 */
export interface SchedulerConfig {
  /** Look-ahead time in seconds */
  lookAhead: number;
  /** Schedule interval in milliseconds */
  scheduleInterval: number;
}

/**
 * Default scheduler configuration
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  lookAhead: 0.1, // 100ms look-ahead
  scheduleInterval: 25, // Schedule every 25ms
};

/**
 * Calculate which events should be scheduled in the current window
 * @param currentTime - Current time in seconds
 * @param events - All scheduled events
 * @param lookAhead - Look-ahead time in seconds
 */
export function getEventsInWindow(
  currentTime: number,
  events: ScheduledEvent[],
  lookAhead: number,
): ScheduledEvent[] {
  const windowEnd = currentTime + lookAhead;
  return events.filter((event) => event.time >= currentTime && event.time < windowEnd);
}

/**
 * Generate beat events for a given time range
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 * @param bpm - Beats per minute
 * @param startBeat - Starting beat number
 */
export function generateBeatEvents(
  startTime: number,
  endTime: number,
  bpm: number,
  startBeat = 0,
): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const beatDuration = bpmToSeconds(bpm);

  let currentBeat = startBeat;
  let currentTime = getBeatTime(currentBeat, bpm, 0);

  // Find first beat >= startTime
  while (currentTime < startTime) {
    currentBeat++;
    currentTime = getBeatTime(currentBeat, bpm, 0);
  }

  // Generate events until endTime
  while (currentTime < endTime) {
    events.push({
      id: `beat-${currentBeat}`,
      time: currentTime,
      callback: 'beat',
      data: { beat: currentBeat },
    });
    currentBeat++;
    currentTime += beatDuration;
  }

  return events;
}

/**
 * Calculate the next scheduling window
 * @param currentTime - Current time in seconds
 * @param lastScheduledTime - Last scheduled time in seconds
 * @param lookAhead - Look-ahead time in seconds
 */
export function getNextScheduleWindow(
  currentTime: number,
  lastScheduledTime: number,
  lookAhead: number,
): { start: number; end: number } {
  const start = Math.max(currentTime, lastScheduledTime);
  const end = currentTime + lookAhead;
  return { start, end };
}

/**
 * Merge new events with existing queue, avoiding duplicates
 * @param existingEvents - Current event queue
 * @param newEvents - New events to add
 */
export function mergeEvents(
  existingEvents: ScheduledEvent[],
  newEvents: ScheduledEvent[],
): ScheduledEvent[] {
  const existingIds = new Set(existingEvents.map((e) => e.id));
  const uniqueNewEvents = newEvents.filter((e) => !existingIds.has(e.id));
  return [...existingEvents, ...uniqueNewEvents].sort((a, b) => a.time - b.time);
}

/**
 * Remove past events from queue
 * @param events - Event queue
 * @param currentTime - Current time in seconds
 * @param buffer - Buffer time to keep past events (for late execution)
 */
export function cleanupPastEvents(
  events: ScheduledEvent[],
  currentTime: number,
  buffer = 0.1,
): ScheduledEvent[] {
  return events.filter((e) => e.time >= currentTime - buffer);
}
