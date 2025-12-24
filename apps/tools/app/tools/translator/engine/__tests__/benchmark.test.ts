// ========================================
// Engine Benchmark Tests
// 성능 테스트 및 복잡도 검증
// ========================================

import { describe, expect, it } from 'vitest';
import { LRUCache } from '../cache/lru-cache';
import { DictionaryIndex } from '../dictionary/dictionary-index';
import { PatternIndex } from '../patterns/pattern-index';
import { SuffixTrie } from '../trie/suffix-trie';

describe('SuffixTrie Performance', () => {
  it('should handle 1000+ suffixes efficiently', () => {
    const trie = new SuffixTrie();

    // 1000개 접미사 생성 및 삽입
    const suffixes: string[] = [];
    for (let i = 0; i < 1000; i++) {
      suffixes.push(`접미사${i}`);
    }

    const startInsert = performance.now();
    for (const suffix of suffixes) {
      trie.insert(suffix, { id: suffix });
    }
    const insertTime = performance.now() - startInsert;

    expect(trie.size).toBe(1000);
    expect(insertTime).toBeLessThan(100); // 100ms 이내

    // 검색 성능 테스트
    const startSearch = performance.now();
    for (let i = 0; i < 10000; i++) {
      trie.findLongestSuffix(`테스트단어접미사${i % 1000}`);
    }
    const searchTime = performance.now() - startSearch;

    expect(searchTime).toBeLessThan(100); // 10000번 검색 100ms 이내
  });

  it('should find longest suffix correctly', () => {
    const trie = new SuffixTrie();

    trie.insert('에', { role: 'direction' });
    trie.insert('에서', { role: 'location' });
    trie.insert('에서부터', { role: 'from_location' });

    const result1 = trie.findLongestSuffix('학교에');
    expect(result1?.suffix).toBe('에');

    const result2 = trie.findLongestSuffix('학교에서');
    expect(result2?.suffix).toBe('에서');

    const result3 = trie.findLongestSuffix('학교에서부터');
    expect(result3?.suffix).toBe('에서부터');
  });
});

describe('DictionaryIndex Performance', () => {
  it('should handle 10000+ words with O(1) lookup', () => {
    const dict = new DictionaryIndex();

    // 10000개 단어 생성 및 삽입
    const words: Record<string, string> = {};
    for (let i = 0; i < 10000; i++) {
      words[`단어${i}`] = `word${i}`;
    }

    const startAdd = performance.now();
    dict.addFromRecord(words);
    const addTime = performance.now() - startAdd;

    expect(dict.size).toBe(10000);
    expect(addTime).toBeLessThan(100); // 100ms 이내

    // 검색 성능 테스트
    const startSearch = performance.now();
    for (let i = 0; i < 100000; i++) {
      dict.get(`단어${i % 10000}`);
    }
    const searchTime = performance.now() - startSearch;

    // 100000번 검색이 50ms 이내 (O(1) 검증)
    expect(searchTime).toBeLessThan(50);
  });

  it('should handle priority correctly', () => {
    const dict = new DictionaryIndex();

    dict.addEntry('학교', { translation: 'school', priority: 1 });
    dict.addEntry('학교', { translation: 'academy', priority: 2 });

    expect(dict.get('학교')).toBe('academy'); // 우선순위 높은 것
    expect(dict.getAll('학교')).toHaveLength(2);
  });
});

describe('PatternIndex Performance', () => {
  it('should index patterns by keyword efficiently', () => {
    const index = new PatternIndex();

    // 100개 패턴 추가
    for (let i = 0; i < 100; i++) {
      index.add({
        regex: new RegExp(`^패턴${i}\\s+(.+)`),
        template: `pattern${i} $1`,
        priority: i,
      });
    }

    expect(index.size).toBe(100);

    // 매칭 테스트
    const startMatch = performance.now();
    for (let i = 0; i < 1000; i++) {
      index.match(`패턴${i % 100} 테스트`);
    }
    const matchTime = performance.now() - startMatch;

    // 1000번 매칭이 100ms 이내
    expect(matchTime).toBeLessThan(100);
  });

  it('should return highest priority match', () => {
    const index = new PatternIndex();

    index.add({
      regex: /^학교에/,
      template: 'to school',
      priority: 1,
    });
    index.add({
      regex: /^학교에 가다/,
      template: 'go to school',
      priority: 2,
    });

    const result = index.match('학교에 가다');
    expect(result?.result).toBe('go to school');
  });
});

describe('LRUCache Performance', () => {
  it('should maintain O(1) operations', () => {
    const cache = new LRUCache<string>(1000);

    // 삽입 성능
    const startSet = performance.now();
    for (let i = 0; i < 10000; i++) {
      cache.set(`key${i}`, `value${i}`);
    }
    const setTime = performance.now() - startSet;

    expect(setTime).toBeLessThan(50); // 10000번 삽입 50ms 이내

    // 조회 성능
    const startGet = performance.now();
    for (let i = 0; i < 100000; i++) {
      cache.get(`key${i % 1000}`);
    }
    const getTime = performance.now() - startGet;

    expect(getTime).toBeLessThan(50); // 100000번 조회 50ms 이내
  });

  it('should evict oldest entries when full', () => {
    const cache = new LRUCache<string>(3);

    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    cache.set('d', '4'); // 'a' should be evicted

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
    expect(cache.get('d')).toBe('4');
  });

  it('should track hit rate correctly', () => {
    const cache = new LRUCache<string>(10);

    cache.set('a', '1');
    cache.get('a'); // hit
    cache.get('a'); // hit
    cache.get('b'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.67, 1);
  });
});

describe('Complexity Verification', () => {
  it('should demonstrate O(1) dictionary lookup scaling', () => {
    const dict = new DictionaryIndex();

    // 1000개 테스트
    for (let i = 0; i < 1000; i++) {
      dict.addSimple(`word${i}`, `번역${i}`);
    }

    const start1k = performance.now();
    for (let i = 0; i < 10000; i++) {
      dict.get(`word${i % 1000}`);
    }
    const time1k = performance.now() - start1k;

    // 10000개로 확장
    for (let i = 1000; i < 10000; i++) {
      dict.addSimple(`word${i}`, `번역${i}`);
    }

    const start10k = performance.now();
    for (let i = 0; i < 10000; i++) {
      dict.get(`word${i % 10000}`);
    }
    const time10k = performance.now() - start10k;

    // O(1)이면 10배 확장해도 시간 차이가 크지 않아야 함
    // 2배 이내 차이 허용
    expect(time10k).toBeLessThan(time1k * 2 + 10);
  });

  it('should demonstrate O(m) trie lookup (m = suffix length)', () => {
    const trie = new SuffixTrie();

    // 다양한 길이의 접미사 추가
    for (let len = 1; len <= 10; len++) {
      const suffix = '가'.repeat(len);
      trie.insert(suffix, { len });
    }

    // 짧은 접미사 검색 시간
    const shortText = `테스트${'가'.repeat(3)}`;
    const startShort = performance.now();
    for (let i = 0; i < 10000; i++) {
      trie.findLongestSuffix(shortText);
    }
    const timeShort = performance.now() - startShort;

    // 긴 접미사 검색 시간
    const longText = `테스트${'가'.repeat(10)}`;
    const startLong = performance.now();
    for (let i = 0; i < 10000; i++) {
      trie.findLongestSuffix(longText);
    }
    const timeLong = performance.now() - startLong;

    // O(m)이므로 긴 접미사가 약간 더 오래 걸릴 수 있음
    // 하지만 둘 다 빨라야 함
    expect(timeShort).toBeLessThan(50);
    expect(timeLong).toBeLessThan(100);
  });
});
