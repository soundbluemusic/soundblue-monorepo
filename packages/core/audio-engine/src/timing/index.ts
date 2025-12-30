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
