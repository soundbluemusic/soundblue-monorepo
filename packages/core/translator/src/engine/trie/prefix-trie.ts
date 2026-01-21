// ========================================
// Prefix Trie - 접두사 Trie
// 단어 검색 및 자동완성에 최적화 O(k) (k = 접두사 길이)
// ========================================

/**
 * 품사 유형
 */
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'particle'
  | 'conjunction'
  | 'interjection'
  | 'pronoun'
  | 'determiner'
  | 'preposition';

/**
 * 도메인 유형 (전문 분야)
 */
export type DomainType =
  | 'general'
  | 'music'
  | 'technology'
  | 'medical'
  | 'legal'
  | 'business'
  | 'academic'
  | 'colloquial'
  | 'formal';

/**
 * 추가 메타데이터 타입 (확장성을 위해 분리)
 */
export interface TrieNodeMetadata {
  /** 사용 빈도 */
  frequency?: number;
  /** 동의어 목록 */
  synonyms?: string[];
  /** 반의어 목록 */
  antonyms?: string[];
  /** 관련 단어 */
  related?: string[];
  /** 출처 */
  source?: string;
}

/**
 * 기본 Trie 정보 타입
 * 품사, 도메인 등의 메타데이터
 */
export interface TrieNodeInfo {
  /** 품사 (part of speech) */
  pos?: PartOfSpeech;
  /** 도메인 (전문 분야) */
  domain?: DomainType | string;
  /** 우선순위 (낮을수록 우선) */
  priority?: number;
  /** 추가 메타데이터 (확장용) */
  meta?: TrieNodeMetadata;
}

/**
 * Trie 노드
 */
interface TrieNode<TInfo = TrieNodeInfo> {
  children: Map<string, TrieNode<TInfo>>;
  /** 이 노드에서 끝나는 단어 (있으면 완전한 단어) */
  word: string | null;
  /** 번역 결과 */
  translation: string | null;
  /** 추가 정보 */
  info: TInfo | null;
}

/**
 * 접두사 Trie
 * 단어의 시작부터 매칭하여 빠른 검색과 자동완성 지원
 *
 * 100K+ 단어에서도 O(k) 검색 보장 (k = 접두사 길이)
 *
 * @typeParam TInfo - 노드에 저장할 추가 정보의 타입 (기본: TrieNodeInfo)
 *
 * @example
 * const trie = new PrefixTrie();
 * trie.insert('학교', 'school');
 * trie.insert('학생', 'student');
 * trie.insert('학원', 'academy');
 *
 * trie.searchPrefix('학') // ['학교', '학생', '학원']
 * trie.get('학교')        // 'school'
 * trie.longestPrefix('학교에서') // { word: '학교', translation: 'school' }
 */
export class PrefixTrie<TInfo = TrieNodeInfo> {
  private root: TrieNode<TInfo>;
  private _size: number;

  constructor() {
    this.root = this.createNode();
    this._size = 0;
  }

  private createNode(): TrieNode<TInfo> {
    return {
      children: new Map(),
      word: null,
      translation: null,
      info: null,
    };
  }

  /**
   * 단어 삽입
   * @param word 단어 (예: '학교', 'school')
   * @param translation 번역 결과
   * @param info 추가 정보 (품사, 도메인 등)
   */
  insert(word: string, translation: string, info?: TInfo): void {
    let node = this.root;

    // 정방향으로 순회 (시작 → 끝)
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char)!;
    }

    // 새 단어인 경우만 size 증가
    if (node.word === null) {
      this._size++;
    }

    node.word = word;
    node.translation = translation;
    node.info = info || null;
  }

  /**
   * 여러 단어 일괄 삽입
   */
  insertMany(entries: Array<{ word: string; translation: string; info?: TInfo }>): void {
    for (const entry of entries) {
      this.insert(entry.word, entry.translation, entry.info);
    }
  }

  /**
   * Record<string, string>에서 일괄 삽입
   */
  insertFromRecord(record: Record<string, string>): void {
    for (const [word, translation] of Object.entries(record)) {
      this.insert(word, translation);
    }
  }

  /**
   * 정확한 단어 조회
   * @returns 번역 결과 또는 undefined
   */
  get(word: string): string | undefined {
    const node = this.findNode(word);
    return node?.translation ?? undefined;
  }

  /**
   * 단어 존재 여부 확인
   */
  has(word: string): boolean {
    const node = this.findNode(word);
    return node?.word !== null && node?.word === word;
  }

  /**
   * 단어의 노드 찾기
   */
  private findNode(word: string): TrieNode<TInfo> | null {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }

    return node;
  }

  /**
   * 접두사로 시작하는 모든 단어 검색
   * @param prefix 접두사
   * @param limit 최대 결과 수 (기본 100)
   * @returns 매칭된 단어 배열
   */
  searchPrefix(prefix: string, limit = 100): string[] {
    const prefixNode = this.findNode(prefix);
    if (!prefixNode) {
      return [];
    }

    const results: string[] = [];
    this.collectWords(prefixNode, results, limit);
    return results;
  }

  /**
   * 접두사로 시작하는 모든 단어와 번역 검색
   */
  searchPrefixWithTranslation(
    prefix: string,
    limit = 100,
  ): Array<{ word: string; translation: string; info: TInfo | null }> {
    const prefixNode = this.findNode(prefix);
    if (!prefixNode) {
      return [];
    }

    const results: Array<{
      word: string;
      translation: string;
      info: TInfo | null;
    }> = [];
    this.collectWordsWithTranslation(prefixNode, results, limit);
    return results;
  }

  /**
   * 노드 아래의 모든 단어 수집 (DFS)
   */
  private collectWords(node: TrieNode<TInfo>, results: string[], limit: number): void {
    if (results.length >= limit) return;

    if (node.word !== null) {
      results.push(node.word);
    }

    for (const child of node.children.values()) {
      if (results.length >= limit) break;
      this.collectWords(child, results, limit);
    }
  }

  /**
   * 노드 아래의 모든 단어와 번역 수집 (DFS)
   */
  private collectWordsWithTranslation(
    node: TrieNode<TInfo>,
    results: Array<{ word: string; translation: string; info: TInfo | null }>,
    limit: number,
  ): void {
    if (results.length >= limit) return;

    if (node.word !== null && node.translation !== null) {
      results.push({
        word: node.word,
        translation: node.translation,
        info: node.info,
      });
    }

    for (const child of node.children.values()) {
      if (results.length >= limit) break;
      this.collectWordsWithTranslation(child, results, limit);
    }
  }

  /**
   * 문자열에서 가장 긴 매칭 접두사 찾기
   * @param text 검색할 문자열
   * @returns 매칭된 가장 긴 단어와 번역, 없으면 null
   *
   * @example
   * trie.insert('학교', 'school');
   * trie.longestPrefix('학교에서') // { word: '학교', translation: 'school' }
   */
  longestPrefix(text: string): { word: string; translation: string; info: TInfo | null } | null {
    let node = this.root;
    let lastMatch: {
      word: string;
      translation: string;
      info: TInfo | null;
    } | null = null;

    for (const char of text) {
      if (!node.children.has(char)) {
        break;
      }

      node = node.children.get(char)!;

      // 현재 노드가 완전한 단어면 기록
      if (node.word !== null && node.translation !== null) {
        lastMatch = {
          word: node.word,
          translation: node.translation,
          info: node.info,
        };
      }
    }

    return lastMatch;
  }

  /**
   * 문자열에서 모든 매칭 접두사 찾기 (짧은 것부터)
   */
  allPrefixes(text: string): Array<{ word: string; translation: string; info: TInfo | null }> {
    const results: Array<{
      word: string;
      translation: string;
      info: TInfo | null;
    }> = [];
    let node = this.root;

    for (const char of text) {
      if (!node.children.has(char)) {
        break;
      }

      node = node.children.get(char)!;

      if (node.word !== null && node.translation !== null) {
        results.push({
          word: node.word,
          translation: node.translation,
          info: node.info,
        });
      }
    }

    return results;
  }

  /**
   * Trie 크기 (저장된 단어 수)
   */
  get size(): number {
    return this._size;
  }

  /**
   * 직렬화 (SSG 빌드용)
   * 컴팩트한 JSON 형식으로 저장
   */
  serialize(): string {
    const serializeNode = (node: TrieNode<TInfo>): SerializedNode<TInfo> => {
      const children: Record<string, SerializedNode<TInfo>> = {};

      for (const [char, child] of node.children) {
        children[char] = serializeNode(child);
      }

      return {
        c: Object.keys(children).length > 0 ? children : undefined,
        w: node.word || undefined,
        t: node.translation || undefined,
        i: node.info || undefined,
      };
    };

    return JSON.stringify({
      root: serializeNode(this.root),
      size: this._size,
    });
  }

  /**
   * 역직렬화 (SSG 런타임용)
   * @typeParam T - 노드 정보 타입 (기본: TrieNodeInfo)
   */
  static deserialize<T = TrieNodeInfo>(json: string): PrefixTrie<T> {
    const trie = new PrefixTrie<T>();
    const data = JSON.parse(json) as { root: SerializedNode<T>; size?: number };

    const deserializeNode = (obj: SerializedNode<T>, node: TrieNode<T>): void => {
      if (obj.w) {
        node.word = obj.w;
      }
      if (obj.t) {
        node.translation = obj.t;
      }
      if (obj.i) {
        node.info = obj.i;
      }
      if (obj.c) {
        for (const [char, childObj] of Object.entries(obj.c)) {
          const childNode = trie.createNode();
          node.children.set(char, childNode);
          deserializeNode(childObj, childNode);
        }
      }
    };

    deserializeNode(data.root, trie.root);
    trie._size = data.size || 0;
    return trie;
  }

  /**
   * 통계 정보
   */
  getStats(): {
    size: number;
    nodeCount: number;
    averageDepth: number;
  } {
    let nodeCount = 0;
    let totalDepth = 0;
    let wordCount = 0;

    const traverse = (node: TrieNode<TInfo>, depth: number): void => {
      nodeCount++;
      if (node.word !== null) {
        wordCount++;
        totalDepth += depth;
      }
      for (const child of node.children.values()) {
        traverse(child, depth + 1);
      }
    };

    traverse(this.root, 0);

    return {
      size: this._size,
      nodeCount,
      averageDepth: wordCount > 0 ? totalDepth / wordCount : 0,
    };
  }
}

/**
 * 직렬화된 노드 형식 (JSON용)
 */
interface SerializedNode<TInfo> {
  /** children */
  c?: Record<string, SerializedNode<TInfo>>;
  /** word */
  w?: string;
  /** translation */
  t?: string;
  /** info */
  i?: TInfo;
}
