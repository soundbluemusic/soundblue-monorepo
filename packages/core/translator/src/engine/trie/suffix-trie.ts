// ========================================
// Suffix Trie - 역방향 접미사 Trie
// 조사/어미 매칭에 최적화 O(m) (m = 접미사 길이)
// ========================================

/**
 * Trie 노드
 */
interface TrieNode {
  children: Map<string, TrieNode>;
  /** 이 노드에서 끝나는 접미사 (있으면 매칭 성공) */
  value: string | null;
  /** 추가 정보 (역할, 시제 등) */
  info: Record<string, unknown> | null;
}

/**
 * 역방향 접미사 Trie
 * 문자열 끝에서부터 매칭하여 가장 긴 접미사를 찾음
 *
 * @example
 * const trie = new SuffixTrie();
 * trie.insert('에서', { role: 'location' });
 * trie.insert('에', { role: 'location' });
 *
 * trie.findLongestSuffix('학교에서') // { suffix: '에서', info: { role: 'location' } }
 * trie.findLongestSuffix('학교에')   // { suffix: '에', info: { role: 'location' } }
 */
export class SuffixTrie {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      value: null,
      info: null,
    };
  }

  /**
   * 접미사 삽입 (역방향으로 저장)
   * @param suffix 접미사 (예: '에서', '았어요')
   * @param info 추가 정보 (예: { role: 'location', tense: 'past' })
   */
  insert(suffix: string, info?: Record<string, unknown>): void {
    let node = this.root;

    // 역방향으로 순회 (끝 → 시작)
    for (let i = suffix.length - 1; i >= 0; i--) {
      const char = suffix[i]!;

      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }

      node = node.children.get(char)!;
    }

    node.value = suffix;
    node.info = info || null;
  }

  /**
   * 여러 접미사 일괄 삽입
   */
  insertMany(entries: Array<{ suffix: string; info?: Record<string, unknown> }>): void {
    for (const entry of entries) {
      this.insert(entry.suffix, entry.info);
    }
  }

  /**
   * 문자열에서 가장 긴 매칭 접미사 찾기
   * @param text 검색할 문자열
   * @returns 매칭된 접미사와 정보, 없으면 null
   */
  findLongestSuffix(text: string): { suffix: string; info: Record<string, unknown> | null } | null {
    let node = this.root;
    let lastMatch: { suffix: string; info: Record<string, unknown> | null } | null = null;

    // 역방향으로 순회 (끝 → 시작)
    for (let i = text.length - 1; i >= 0; i--) {
      const char = text[i]!;

      if (!node.children.has(char)) {
        break; // 더 이상 매칭 불가
      }

      node = node.children.get(char)!;

      // 현재 노드가 완전한 접미사면 기록
      if (node.value !== null) {
        lastMatch = { suffix: node.value, info: node.info };
      }
    }

    return lastMatch;
  }

  /**
   * 문자열에서 접미사를 찾아 분리
   * @param text 검색할 문자열
   * @returns { stem: 어간, suffix: 접미사, info: 정보 } 또는 null
   */
  splitSuffix(
    text: string,
  ): { stem: string; suffix: string; info: Record<string, unknown> | null } | null {
    const result = this.findLongestSuffix(text);

    if (!result) {
      return null;
    }

    const stem = text.slice(0, text.length - result.suffix.length);

    // 어간이 비어있으면 무효
    if (!stem) {
      return null;
    }

    return {
      stem,
      suffix: result.suffix,
      info: result.info,
    };
  }

  /**
   * 모든 매칭 접미사 찾기 (짧은 것부터)
   * @param text 검색할 문자열
   * @returns 모든 매칭된 접미사 배열
   */
  findAllSuffixes(text: string): Array<{ suffix: string; info: Record<string, unknown> | null }> {
    const results: Array<{ suffix: string; info: Record<string, unknown> | null }> = [];
    let node = this.root;

    // 역방향으로 순회 (끝 → 시작)
    for (let i = text.length - 1; i >= 0; i--) {
      const char = text[i]!;

      if (!node.children.has(char)) {
        break;
      }

      node = node.children.get(char)!;

      if (node.value !== null) {
        results.push({ suffix: node.value, info: node.info });
      }
    }

    return results;
  }

  /**
   * 접미사 존재 여부 확인
   */
  has(suffix: string): boolean {
    let node = this.root;

    for (let i = suffix.length - 1; i >= 0; i--) {
      const char = suffix[i]!;

      if (!node.children.has(char)) {
        return false;
      }

      node = node.children.get(char)!;
    }

    return node.value !== null;
  }

  /**
   * Trie 크기 (저장된 접미사 수)
   */
  get size(): number {
    let count = 0;

    const traverse = (node: TrieNode): void => {
      if (node.value !== null) {
        count++;
      }
      for (const child of node.children.values()) {
        traverse(child);
      }
    };

    traverse(this.root);
    return count;
  }

  /**
   * 직렬화 (SSG 빌드용)
   * Trie를 JSON으로 변환하여 정적 파일로 저장 가능
   */
  serialize(): string {
    const serializeNode = (node: TrieNode): object => {
      const children: Record<string, object> = {};

      for (const [char, child] of node.children) {
        children[char] = serializeNode(child);
      }

      return {
        c: Object.keys(children).length > 0 ? children : undefined,
        v: node.value || undefined,
        i: node.info || undefined,
      };
    };

    return JSON.stringify(serializeNode(this.root));
  }

  /**
   * 역직렬화 (SSG 런타임용)
   * JSON에서 Trie 복원
   */
  static deserialize(json: string): SuffixTrie {
    const trie = new SuffixTrie();
    const data = JSON.parse(json);

    const deserializeNode = (obj: Record<string, unknown>, node: TrieNode): void => {
      if (obj.v) {
        node.value = obj.v as string;
      }
      if (obj.i) {
        node.info = obj.i as Record<string, unknown>;
      }
      if (obj.c) {
        const children = obj.c as Record<string, Record<string, unknown>>;
        for (const [char, childObj] of Object.entries(children)) {
          const childNode = trie.createNode();
          node.children.set(char, childNode);
          deserializeNode(childObj, childNode);
        }
      }
    };

    deserializeNode(data, trie.root);
    return trie;
  }
}
