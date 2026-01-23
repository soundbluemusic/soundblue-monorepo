/**
 * Drum Machine Presets
 *
 * Pattern notation: 16-char string where 'x' = hit, '.' = rest
 * Example: "x...x...x...x..." = four-on-the-floor kick
 */

import type { DrumId } from './types';

export type PresetName = 'empty' | 'techno' | 'house' | 'trap' | 'breakbeat' | 'minimal';

// Convert pattern string to boolean array
const p = (str: string): boolean[] => str.split('').map((c) => c === 'x');

// Create empty pattern for all drums
const empty = (): Record<DrumId, boolean[]> => ({
  kick: p('................'),
  snare: p('................'),
  hihat: p('................'),
  openhat: p('................'),
  clap: p('................'),
});

export interface PresetPattern {
  name: string;
  pattern: Record<DrumId, boolean[]>;
}

export const PRESET_PATTERNS: Record<PresetName, PresetPattern> = {
  empty: {
    name: 'Empty',
    pattern: empty(),
  },
  techno: {
    name: 'Techno',
    pattern: {
      kick: p('x...x...x...x...'), // Four on the floor
      snare: p('....x.......x...'), // 2 and 4
      hihat: p('..x...x...x...x.'), // Offbeat
      openhat: p('...............x'), // End accent
      clap: p('....x.......x...'), // With snare
    },
  },
  house: {
    name: 'House',
    pattern: {
      kick: p('x...x...x...x...'), // Four on the floor
      snare: p('....x.......x...'), // 2 and 4
      hihat: p('x.x.x.x.x.x.x.x.'), // 8th notes
      openhat: p('.......x.......x'), // Upbeat
      clap: p('....x.......x...'), // With snare
    },
  },
  trap: {
    name: 'Trap',
    pattern: {
      kick: p('x.....x...x.....'), // Syncopated
      snare: p('....x.......x...'), // 2 and 4
      hihat: p('xxxxxxxxxxxxxxxx'), // Rolling hats
      openhat: p('................'), // None
      clap: p('....x.......x..x'), // Extra clap
    },
  },
  breakbeat: {
    name: 'Breakbeat',
    pattern: {
      kick: p('x.....x...x.....'), // Syncopated
      snare: p('....x.......x.x.'), // Break pattern
      hihat: p('x.x.x.x.x.x.x.x.'), // 8th notes
      openhat: p('.......x........'), // Accent
      clap: p('................'), // None
    },
  },
  minimal: {
    name: 'Minimal',
    pattern: {
      kick: p('x.......x.......'), // Sparse
      snare: p('............x...'), // Single hit
      hihat: p('..x...x...x...x.'), // Offbeat
      openhat: p('................'), // None
      clap: p('................'), // None
    },
  },
};
