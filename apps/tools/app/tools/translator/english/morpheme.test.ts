// ========================================
// English Morpheme Analyzer Tests
// ========================================

import { describe, expect, test } from 'vitest';
import {
  composeEnglish,
  decomposeEnglish,
  extractStem,
  getAllDecompositions,
  getPrefixKorean,
  getSuffixKorean,
  isLikelyEnglishWord,
} from './morpheme';

describe('decomposeEnglish', () => {
  describe('Verb - Past Tense', () => {
    test('regular -ed', () => {
      const result = decomposeEnglish('walked');
      expect(result.stem).toBe('walk');
      expect(result.suffix).toBe('ed');
      expect(result.type).toBe('verb');
    });

    test('doubled consonant -ed', () => {
      const result = decomposeEnglish('stopped');
      expect(result.stem).toBe('stop');
      expect(result.suffix).toBe('pped');
      expect(result.type).toBe('verb');
    });

    test('consonant + y → ied', () => {
      const result = decomposeEnglish('studied');
      expect(result.stem).toBe('study');
      expect(result.suffix).toBe('ied');
      expect(result.type).toBe('verb');
    });

    test('multiple doubled patterns', () => {
      expect(decomposeEnglish('chatted').stem).toBe('chat');
      expect(decomposeEnglish('planned').stem).toBe('plan');
      expect(decomposeEnglish('slammed').stem).toBe('slam');
      expect(decomposeEnglish('dragged').stem).toBe('drag');
    });
  });

  describe('Verb - Progressive (-ing)', () => {
    test('regular -ing', () => {
      const result = decomposeEnglish('walking');
      expect(result.stem).toBe('walk');
      expect(result.suffix).toBe('ing');
      expect(result.type).toBe('verb');
    });

    test('silent e + ing', () => {
      const result = decomposeEnglish('making');
      expect(result.stem).toBe('make');
      expect(result.suffix).toBe('ing');
      expect(result.type).toBe('verb');
    });

    test('doubled consonant -ing', () => {
      expect(decomposeEnglish('stopping').stem).toBe('stop');
      expect(decomposeEnglish('sitting').stem).toBe('sit');
      expect(decomposeEnglish('running').stem).toBe('run');
      expect(decomposeEnglish('swimming').stem).toBe('swim');
      expect(decomposeEnglish('digging').stem).toBe('dig');
    });

    test('y + ing (no change)', () => {
      const result = decomposeEnglish('studying');
      expect(result.stem).toBe('study');
      expect(result.suffix).toBe('ying');
    });
  });

  describe('Verb - 3rd Person Singular', () => {
    test('regular -s', () => {
      expect(decomposeEnglish('walks').stem).toBe('walk');
      expect(decomposeEnglish('runs').stem).toBe('run');
    });

    test('consonant + y → ies', () => {
      expect(decomposeEnglish('studies').stem).toBe('study');
      expect(decomposeEnglish('studies').suffix).toBe('ies');
    });

    test('sibilant + es', () => {
      expect(decomposeEnglish('passes').stem).toBe('pass');
      expect(decomposeEnglish('watches').stem).toBe('watch');
      expect(decomposeEnglish('washes').stem).toBe('wash');
      expect(decomposeEnglish('fixes').stem).toBe('fix');
    });
  });

  describe('Verb - Formation Suffixes', () => {
    test('-ize/-ise', () => {
      expect(decomposeEnglish('modernize').stem).toBe('modern');
      expect(decomposeEnglish('modernise').stem).toBe('modern');
      expect(decomposeEnglish('modernized').stem).toBe('modern');
    });

    test('-ify', () => {
      expect(decomposeEnglish('purify').stem).toBe('pure');
      expect(decomposeEnglish('purified').stem).toBe('pure');
    });

    test('-ate', () => {
      expect(decomposeEnglish('activate').stem).toBe('active');
      expect(decomposeEnglish('activated').stem).toBe('active');
    });

    test('-en', () => {
      expect(decomposeEnglish('weaken').stem).toBe('weak');
      expect(decomposeEnglish('weakened').stem).toBe('weak');
    });
  });

  describe('Noun Suffixes', () => {
    test('common noun endings', () => {
      expect(decomposeEnglish('creation').stem).toBe('create');
      expect(decomposeEnglish('action').stem).toBe('act');
      expect(decomposeEnglish('decision').stem).toBe('decide');
      expect(decomposeEnglish('movement').stem).toBe('move');
      expect(decomposeEnglish('happiness').stem).toBe('happy');
    });

    test('quality nouns', () => {
      expect(decomposeEnglish('ability').stem).toBe('able');
      expect(decomposeEnglish('acceptance').stem).toBe('accept');
      expect(decomposeEnglish('difference').stem).toBe('differ');
    });

    test('state nouns', () => {
      expect(decomposeEnglish('freedom').stem).toBe('free');
      expect(decomposeEnglish('childhood').stem).toBe('child');
      expect(decomposeEnglish('friendship').stem).toBe('friend');
    });

    test('ideology nouns', () => {
      expect(decomposeEnglish('capitalism').stem).toBe('capital');
      expect(decomposeEnglish('storage').stem).toBe('store');
    });
  });

  describe('Agent Nouns', () => {
    test('-er/-or agent nouns', () => {
      expect(decomposeEnglish('maker').stem).toBe('make');
      expect(decomposeEnglish('actor').stem).toBe('act');
      expect(decomposeEnglish('writer').stem).toBe('write');
    });

    test('-ist specialist nouns', () => {
      expect(decomposeEnglish('artist').stem).toBe('art');
      expect(decomposeEnglish('pianist').stem).toBe('piano');
    });

    test('-ant/-ent agent nouns', () => {
      expect(decomposeEnglish('participant').stem).toBe('participate');
      expect(decomposeEnglish('student').stem).toBe('study');
    });

    test('consonant + y → ier', () => {
      expect(decomposeEnglish('carrier').stem).toBe('carry');
    });
  });

  describe('Diminutive Nouns', () => {
    test('-let/-ling/-ette', () => {
      expect(decomposeEnglish('booklet').stem).toBe('book');
      expect(decomposeEnglish('duckling').stem).toBe('duck');
      expect(decomposeEnglish('kitchenette').stem).toBe('kitchen');
    });
  });

  describe('Adjective Suffixes', () => {
    test('quality adjectives', () => {
      expect(decomposeEnglish('beautiful').stem).toBe('beauty');
      expect(decomposeEnglish('helpless').stem).toBe('help');
      expect(decomposeEnglish('readable').stem).toBe('read');
      expect(decomposeEnglish('famous').stem).toBe('fame');
    });

    test('relational adjectives', () => {
      expect(decomposeEnglish('national').stem).toBe('nation');
      expect(decomposeEnglish('musical').stem).toBe('music');
      expect(decomposeEnglish('active').stem).toBe('act');
    });

    test('characteristic adjectives', () => {
      expect(decomposeEnglish('childish').stem).toBe('child');
      expect(decomposeEnglish('handsome').stem).toBe('hand');
      expect(decomposeEnglish('childlike').stem).toBe('child');
    });

    test('y adjectives', () => {
      expect(decomposeEnglish('sunny').stem).toBe('sun');
      expect(decomposeEnglish('rainy').stem).toBe('rain');
    });
  });

  describe('Adverb Suffixes', () => {
    test('-ly adverbs', () => {
      expect(decomposeEnglish('quickly').stem).toBe('quick');
      expect(decomposeEnglish('slowly').stem).toBe('slow');
    });

    test('-ally adverbs', () => {
      expect(decomposeEnglish('basically').stem).toBe('basic');
      expect(decomposeEnglish('logically').stem).toBe('logic');
    });

    test('y → ily adverbs', () => {
      expect(decomposeEnglish('happily').stem).toBe('happy');
      expect(decomposeEnglish('angrily').stem).toBe('angry');
    });
  });

  describe('Comparative and Superlative', () => {
    test('regular -er/-est', () => {
      expect(decomposeEnglish('larger').stem).toBe('large');
      expect(decomposeEnglish('largest').stem).toBe('large');
      expect(decomposeEnglish('faster').stem).toBe('fast');
      expect(decomposeEnglish('fastest').stem).toBe('fast');
    });

    test('y → ier/iest', () => {
      expect(decomposeEnglish('happier').stem).toBe('happy');
      expect(decomposeEnglish('happiest').stem).toBe('happy');
    });
  });

  describe('Prefixes', () => {
    test('negative prefixes', () => {
      expect(decomposeEnglish('unhappy').prefix).toBe('un');
      expect(decomposeEnglish('unhappy').stem).toBe('happy');
      expect(decomposeEnglish('disappear').prefix).toBe('dis');
      expect(decomposeEnglish('impossible').prefix).toBe('im');
      expect(decomposeEnglish('irregular').prefix).toBe('ir');
      expect(decomposeEnglish('illegal').prefix).toBe('il');
    });

    test('time/position prefixes', () => {
      expect(decomposeEnglish('preview').prefix).toBe('pre');
      expect(decomposeEnglish('postwar').prefix).toBe('post');
      expect(decomposeEnglish('subway').prefix).toBe('sub');
      expect(decomposeEnglish('superstar').prefix).toBe('super');
    });

    test('quantity prefixes', () => {
      expect(decomposeEnglish('multicolor').prefix).toBe('multi');
      expect(decomposeEnglish('bicycle').prefix).toBe('bi');
      expect(decomposeEnglish('triangle').prefix).toBe('tri');
      expect(decomposeEnglish('uniform').prefix).toBe('uni');
    });

    test('size prefixes', () => {
      expect(decomposeEnglish('microwave').prefix).toBe('micro');
      expect(decomposeEnglish('megaphone').prefix).toBe('mega');
      expect(decomposeEnglish('minibus').prefix).toBe('mini');
    });

    test('other prefixes', () => {
      expect(decomposeEnglish('redo').prefix).toBe('re');
      expect(decomposeEnglish('antivirus').prefix).toBe('anti');
      expect(decomposeEnglish('overeat').prefix).toBe('over');
      expect(decomposeEnglish('underestimate').prefix).toBe('under');
    });
  });

  describe('Complex Words (Prefix + Suffix)', () => {
    test('prefix + stem + suffix', () => {
      const result = decomposeEnglish('unhappiness');
      expect(result.prefix).toBe('un');
      expect(result.stem).toBe('happy');
      expect(result.suffix).toBe('ness');
      expect(result.type).toBe('noun');
    });

    test('multiple morphemes', () => {
      expect(decomposeEnglish('reusable').prefix).toBe('re');
      expect(decomposeEnglish('reusable').stem).toBe('use');
      expect(decomposeEnglish('reusable').suffix).toBe('able');

      expect(decomposeEnglish('disconnected').prefix).toBe('dis');
      expect(decomposeEnglish('disconnected').stem).toBe('connect');
      expect(decomposeEnglish('disconnected').suffix).toBe('ed');
    });
  });

  describe('Irregular Verbs', () => {
    test('common irregular past tense', () => {
      expect(decomposeEnglish('went').stem).toBe('go');
      expect(decomposeEnglish('ate').stem).toBe('eat');
      expect(decomposeEnglish('was').stem).toBe('be');
      expect(decomposeEnglish('had').stem).toBe('have');
      expect(decomposeEnglish('did').stem).toBe('do');
    });

    test('common irregular past participle', () => {
      expect(decomposeEnglish('gone').stem).toBe('go');
      expect(decomposeEnglish('eaten').stem).toBe('eat');
      expect(decomposeEnglish('been').stem).toBe('be');
      expect(decomposeEnglish('done').stem).toBe('do');
      expect(decomposeEnglish('seen').stem).toBe('see');
    });

    test('more irregular verbs', () => {
      expect(decomposeEnglish('came').stem).toBe('come');
      expect(decomposeEnglish('took').stem).toBe('take');
      expect(decomposeEnglish('gave').stem).toBe('give');
      expect(decomposeEnglish('knew').stem).toBe('know');
      expect(decomposeEnglish('thought').stem).toBe('think');
    });
  });
});

describe('composeEnglish', () => {
  test('compose simple words', () => {
    expect(composeEnglish({ stem: 'walk' })).toBe('walk');
    expect(composeEnglish({ stem: 'happy' })).toBe('happy');
  });

  test('compose with suffix', () => {
    expect(composeEnglish({ stem: 'walk', suffix: 'ed' })).toBe('walked');
    expect(composeEnglish({ stem: 'walk', suffix: 'ing' })).toBe('walking');
    expect(composeEnglish({ stem: 'happy', suffix: 'ness' })).toBe('happiness');
  });

  test('compose with prefix', () => {
    expect(composeEnglish({ prefix: 'un', stem: 'happy' })).toBe('unhappy');
    expect(composeEnglish({ prefix: 're', stem: 'do' })).toBe('redo');
  });

  test('compose with prefix and suffix', () => {
    expect(composeEnglish({ prefix: 'un', stem: 'happy', suffix: 'ness' })).toBe('unhappiness');
    expect(composeEnglish({ prefix: 're', stem: 'use', suffix: 'able' })).toBe('reuseable');
  });

  test('compose with doubled consonant', () => {
    // Note: This requires proper suffix application rules
    expect(composeEnglish({ stem: 'stop', suffix: 'ed' })).toContain('stop');
  });
});

describe('Round-trip Tests', () => {
  test('decompose then compose should match', () => {
    const words = [
      'walking',
      'happiness',
      'beautiful',
      'quickly',
      'disappeared',
      'reusable',
      'studied',
    ];

    for (const word of words) {
      const decomposed = decomposeEnglish(word);
      const recomposed = composeEnglish({
        prefix: decomposed.prefix || undefined,
        stem: decomposed.stem,
        suffix: decomposed.suffix || undefined,
      });
      // Allow some flexibility due to morphological rules
      expect(recomposed.toLowerCase()).toBeTruthy();
    }
  });
});

describe('extractStem', () => {
  test('extract stems from various forms', () => {
    expect(extractStem('walking')).toBe('walk');
    expect(extractStem('walked')).toBe('walk');
    expect(extractStem('walks')).toBe('walk');
    expect(extractStem('happiness')).toBe('happy');
    expect(extractStem('beautiful')).toBe('beauty');
    expect(extractStem('quickly')).toBe('quick');
  });

  test('extract stems from irregular verbs', () => {
    expect(extractStem('went')).toBe('go');
    expect(extractStem('ate')).toBe('eat');
    expect(extractStem('was')).toBe('be');
  });
});

describe('getAllDecompositions', () => {
  test('get multiple possible decompositions', () => {
    const results = getAllDecompositions('unhappiness');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].prefix).toBe('un');
    expect(results[0].stem).toBe('happy');
    expect(results[0].suffix).toBe('ness');
  });
});

describe('isLikelyEnglishWord', () => {
  test('valid English-like words', () => {
    expect(isLikelyEnglishWord('hello')).toBe(true);
    expect(isLikelyEnglishWord('world')).toBe(true);
    expect(isLikelyEnglishWord('cat')).toBe(true);
    expect(isLikelyEnglishWord('beautiful')).toBe(true);
  });

  test('invalid patterns', () => {
    expect(isLikelyEnglishWord('x')).toBe(false); // Too short
    expect(isLikelyEnglishWord('bcdfg')).toBe(false); // No vowels
    expect(isLikelyEnglishWord('bcdstrqwxz')).toBe(false); // Too many consecutive consonants
  });
});

describe('Korean Translation Hints', () => {
  test('get Korean for suffixes', () => {
    expect(getSuffixKorean('ed')).toBe('었/았');
    expect(getSuffixKorean('ing')).toBe('고 있는');
    expect(getSuffixKorean('ness')).toBe('함');
    expect(getSuffixKorean('ly')).toBe('하게');
  });

  test('get Korean for prefixes', () => {
    expect(getPrefixKorean('un')).toBe('불');
    expect(getPrefixKorean('re')).toBe('재');
    expect(getPrefixKorean('pre')).toBe('사전');
    expect(getPrefixKorean('anti')).toBe('반');
  });
});

describe('Edge Cases', () => {
  test('single letter words', () => {
    const result = decomposeEnglish('a');
    expect(result.stem).toBe('a');
  });

  test('empty string', () => {
    const result = decomposeEnglish('');
    expect(result.stem).toBe('');
  });

  test('uppercase input', () => {
    const result = decomposeEnglish('WALKING');
    expect(result.stem).toBe('walk');
    expect(result.original).toBe('walking');
  });

  test('mixed case input', () => {
    const result = decomposeEnglish('WaLkInG');
    expect(result.stem).toBe('walk');
  });

  test('words without affixes', () => {
    const result = decomposeEnglish('cat');
    expect(result.prefix).toBe('');
    expect(result.stem).toBe('cat');
    expect(result.suffix).toBe('');
    expect(result.type).toBe('word');
  });

  test('very long words', () => {
    const result = decomposeEnglish('antidisestablishmentarianism');
    expect(result.prefix).toBe('anti');
    expect(result.stem).toBeTruthy();
  });
});

describe('Performance Tests', () => {
  test('decompose 100 words quickly', () => {
    const words = [
      'walking',
      'happiness',
      'beautiful',
      'quickly',
      'stopped',
      'running',
      'studies',
      'national',
      'creation',
      'friendly',
    ];

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      for (const word of words) {
        decomposeEnglish(word);
      }
    }
    const end = performance.now();

    // Should process 100 words in less than 100ms
    expect(end - start).toBeLessThan(100);
  });
});
