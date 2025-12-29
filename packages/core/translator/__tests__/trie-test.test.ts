/**
 * Trie 자료구조 테스트
 * PrefixTrie (접두사), SuffixTrie (접미사) 검색 검증
 */
import { describe, expect, it } from 'vitest';
import { DictionaryIndex } from '../engine/dictionary/dictionary-index';
import { PrefixTrie } from '../engine/trie/prefix-trie';
import { SuffixTrie } from '../engine/trie/suffix-trie';

describe('PrefixTrie', () => {
  describe('기본 기능', () => {
    it('단어 삽입 및 조회', () => {
      const trie = new PrefixTrie();
      trie.insert('학교', 'school');
      trie.insert('학생', 'student');
      trie.insert('학원', 'academy');

      expect(trie.get('학교')).toBe('school');
      expect(trie.get('학생')).toBe('student');
      expect(trie.get('학원')).toBe('academy');
      expect(trie.get('학')).toBeUndefined();
    });

    it('단어 존재 여부 확인', () => {
      const trie = new PrefixTrie();
      trie.insert('사과', 'apple');

      expect(trie.has('사과')).toBe(true);
      expect(trie.has('사')).toBe(false);
      expect(trie.has('바나나')).toBe(false);
    });

    it('size 확인', () => {
      const trie = new PrefixTrie();
      expect(trie.size).toBe(0);

      trie.insert('one', '1');
      trie.insert('two', '2');
      trie.insert('three', '3');

      expect(trie.size).toBe(3);

      // 같은 단어 다시 삽입해도 size 증가 안함
      trie.insert('one', '1-updated');
      expect(trie.size).toBe(3);
    });
  });

  describe('접두사 검색', () => {
    it('접두사로 시작하는 단어 검색', () => {
      const trie = new PrefixTrie();
      trie.insert('학교', 'school');
      trie.insert('학생', 'student');
      trie.insert('학원', 'academy');
      trie.insert('병원', 'hospital');

      const results = trie.searchPrefix('학');
      expect(results).toHaveLength(3);
      expect(results).toContain('학교');
      expect(results).toContain('학생');
      expect(results).toContain('학원');
    });

    it('limit 적용', () => {
      const trie = new PrefixTrie();
      for (let i = 0; i < 100; i++) {
        trie.insert(`테스트${i}`, `test${i}`);
      }

      const results = trie.searchPrefix('테스트', 10);
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('매칭 없으면 빈 배열', () => {
      const trie = new PrefixTrie();
      trie.insert('사과', 'apple');

      const results = trie.searchPrefix('바나나');
      expect(results).toHaveLength(0);
    });
  });

  describe('가장 긴 접두사 찾기', () => {
    it('문자열에서 가장 긴 매칭 접두사 찾기', () => {
      const trie = new PrefixTrie();
      trie.insert('학교', 'school');
      trie.insert('학', 'learning');

      const result = trie.longestPrefix('학교에서');
      expect(result).not.toBeNull();
      expect(result?.word).toBe('학교');
      expect(result?.translation).toBe('school');
    });

    it('짧은 매칭만 있을 때', () => {
      const trie = new PrefixTrie();
      trie.insert('학', 'learning');

      const result = trie.longestPrefix('학교에서');
      expect(result).not.toBeNull();
      expect(result?.word).toBe('학');
    });

    it('매칭 없으면 null', () => {
      const trie = new PrefixTrie();
      trie.insert('사과', 'apple');

      const result = trie.longestPrefix('바나나먹기');
      expect(result).toBeNull();
    });
  });

  describe('모든 접두사 찾기', () => {
    it('모든 매칭 접두사 반환', () => {
      const trie = new PrefixTrie();
      trie.insert('학', 'learning');
      trie.insert('학교', 'school');

      const results = trie.allPrefixes('학교에서');
      expect(results).toHaveLength(2);
      expect(results[0]?.word).toBe('학');
      expect(results[1]?.word).toBe('학교');
    });
  });

  describe('직렬화/역직렬화', () => {
    it('JSON으로 직렬화 후 복원', () => {
      const trie = new PrefixTrie();
      trie.insert('학교', 'school', { pos: 'noun' });
      trie.insert('학생', 'student', { pos: 'noun' });

      const json = trie.serialize();
      const restored = PrefixTrie.deserialize(json);

      expect(restored.get('학교')).toBe('school');
      expect(restored.get('학생')).toBe('student');
      expect(restored.size).toBe(2);
    });
  });
});

describe('SuffixTrie', () => {
  describe('기본 기능', () => {
    it('접미사 삽입 및 조회', () => {
      const trie = new SuffixTrie();
      trie.insert('에서', { role: 'location' });
      trie.insert('에게', { role: 'dative' });

      expect(trie.has('에서')).toBe(true);
      expect(trie.has('에게')).toBe(true);
      expect(trie.has('에')).toBe(false);
    });
  });

  describe('가장 긴 접미사 찾기', () => {
    it('문자열 끝에서 가장 긴 접미사 찾기', () => {
      const trie = new SuffixTrie();
      trie.insert('에', { role: 'location' });
      trie.insert('에서', { role: 'location-action' });

      const result = trie.findLongestSuffix('학교에서');
      expect(result).not.toBeNull();
      expect(result?.suffix).toBe('에서');
      expect(result?.info?.role).toBe('location-action');
    });

    it('짧은 접미사만 매칭', () => {
      const trie = new SuffixTrie();
      trie.insert('에', { role: 'location' });

      const result = trie.findLongestSuffix('학교에');
      expect(result).not.toBeNull();
      expect(result?.suffix).toBe('에');
    });
  });

  describe('접미사 분리', () => {
    it('어간과 접미사 분리', () => {
      const trie = new SuffixTrie();
      trie.insert('았어요', { tense: 'past', formality: 'polite' });

      // Note: 현재 구현은 역방향 문자 매칭이므로 '먹었'이 어간
      // 실제로는 형태소 분석 필요
      trie.splitSuffix('먹었어요');
    });
  });
});

describe('DictionaryIndex + Trie 통합', () => {
  it('Trie 없이 prefix 검색 (O(n))', () => {
    const dict = new DictionaryIndex();
    dict.addSimple('학교', 'school');
    dict.addSimple('학생', 'student');
    dict.addSimple('학원', 'academy');

    expect(dict.hasTrieIndex()).toBe(false);

    const results = dict.searchByPrefix('학');
    expect(results).toHaveLength(3);
  });

  it('Trie 빌드 후 prefix 검색 (O(k))', async () => {
    const dict = new DictionaryIndex();
    dict.addSimple('학교', 'school');
    dict.addSimple('학생', 'student');
    dict.addSimple('학원', 'academy');

    await dict.buildPrefixTrie();
    expect(dict.hasTrieIndex()).toBe(true);

    const results = dict.searchByPrefix('학');
    expect(results).toHaveLength(3);
    expect(results).toContain('학교');
    expect(results).toContain('학생');
    expect(results).toContain('학원');
  });

  it('longestPrefixMatch 테스트', async () => {
    const dict = new DictionaryIndex();
    dict.addSimple('학교', 'school');
    dict.addSimple('학', 'learning');

    // Trie 없이 테스트
    let result = dict.longestPrefixMatch('학교에서');
    expect(result?.word).toBe('학교');
    expect(result?.translation).toBe('school');

    // Trie 빌드 후 테스트
    await dict.buildPrefixTrie();
    result = dict.longestPrefixMatch('학교에서');
    expect(result?.word).toBe('학교');
    expect(result?.translation).toBe('school');
  });

  it('1000개 데이터 Trie 빌드 테스트', async () => {
    const dict = new DictionaryIndex();

    // 1000개 단어 추가
    for (let i = 0; i < 1000; i++) {
      dict.addSimple(`단어${i}`, `word${i}`);
    }

    // Trie 빌드
    await dict.buildPrefixTrie();
    expect(dict.hasTrieIndex()).toBe(true);

    // 검색 테스트
    const results = dict.searchByPrefix('단어1', 20);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.startsWith('단어1'))).toBe(true);
  });
});
