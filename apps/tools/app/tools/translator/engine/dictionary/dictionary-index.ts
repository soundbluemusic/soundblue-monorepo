// ========================================
// Dictionary Index - 고성능 사전 인덱스
// Map 기반 O(1) 조회, 청크 로딩 지원
// ========================================

/**
 * 사전 엔트리 타입
 */
export interface DictionaryEntry {
  /** 번역 결과 */
  translation: string;
  /** 품사 (선택) */
  pos?: 'noun' | 'verb' | 'adj' | 'adv' | 'particle' | 'ending' | 'other';
  /** 우선순위 (높을수록 우선) */
  priority?: number;
  /** 도메인/카테고리 */
  domain?: string;
  /** 추가 메타데이터 */
  meta?: Record<string, unknown>;
}

/**
 * 사전 청크 타입 (코드 스플리팅용)
 */
export interface DictionaryChunk {
  /** 청크 ID */
  id: string;
  /** 청크에 포함된 단어 수 */
  size: number;
  /** 동적 import 함수 */
  loader: () => Promise<Record<string, string | DictionaryEntry>>;
}

/**
 * 고성능 사전 인덱스
 * - Map 기반 O(1) 조회
 * - 청크 단위 로딩 (SSG 최적화)
 * - 우선순위 기반 조회
 *
 * @example
 * const dict = new DictionaryIndex();
 * dict.addEntry('학교', { translation: 'school', pos: 'noun' });
 * dict.addEntry('학교', { translation: 'academy', priority: -1 }); // 낮은 우선순위
 *
 * dict.get('학교'); // 'school' (높은 우선순위)
 * dict.getAll('학교'); // [{ translation: 'school' }, { translation: 'academy' }]
 */
export class DictionaryIndex {
  /** 메인 사전 (단어 → 엔트리 배열) */
  private entries: Map<string, DictionaryEntry[]>;

  /** 역방향 사전 (번역 → 원본 배열) */
  private reverseEntries: Map<string, string[]>;

  /** 로드된 청크 추적 */
  private loadedChunks: Set<string>;

  /** 등록된 청크 */
  private chunks: Map<string, DictionaryChunk>;

  constructor() {
    this.entries = new Map();
    this.reverseEntries = new Map();
    this.loadedChunks = new Set();
    this.chunks = new Map();
  }

  /**
   * 단일 엔트리 추가
   */
  addEntry(word: string, entry: DictionaryEntry): void {
    if (!this.entries.has(word)) {
      this.entries.set(word, []);
    }

    const entries = this.entries.get(word)!;
    entries.push(entry);

    // 우선순위 순으로 정렬 (높은 것이 앞)
    entries.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // 역방향 인덱스 추가
    const translation = entry.translation.toLowerCase();
    if (!this.reverseEntries.has(translation)) {
      this.reverseEntries.set(translation, []);
    }
    const reverseList = this.reverseEntries.get(translation)!;
    if (!reverseList.includes(word)) {
      reverseList.push(word);
    }
  }

  /**
   * 간단한 단어-번역 쌍 추가 (Record<string, string> 호환)
   */
  addSimple(word: string, translation: string, pos?: DictionaryEntry['pos']): void {
    this.addEntry(word, { translation, pos });
  }

  /**
   * Record<string, string> 형태의 사전 일괄 추가
   */
  addFromRecord(record: Record<string, string>, pos?: DictionaryEntry['pos']): void {
    for (const [word, translation] of Object.entries(record)) {
      this.addSimple(word, translation, pos);
    }
  }

  /**
   * DictionaryEntry 형태의 사전 일괄 추가
   */
  addFromEntries(entries: Record<string, DictionaryEntry>): void {
    for (const [word, entry] of Object.entries(entries)) {
      this.addEntry(word, entry);
    }
  }

  /**
   * 단어 조회 (가장 높은 우선순위 번역 반환)
   * @returns 번역 결과 또는 undefined
   */
  get(word: string): string | undefined {
    const entries = this.entries.get(word);
    return entries?.[0]?.translation;
  }

  /**
   * 단어의 모든 번역 조회
   */
  getAll(word: string): DictionaryEntry[] {
    return this.entries.get(word) ?? [];
  }

  /**
   * 단어의 전체 엔트리 조회 (메타데이터 포함)
   */
  getEntry(word: string): DictionaryEntry | undefined {
    return this.entries.get(word)?.[0];
  }

  /**
   * 역방향 조회 (번역 → 원본)
   */
  getReverse(translation: string): string[] {
    return this.reverseEntries.get(translation.toLowerCase()) ?? [];
  }

  /**
   * 단어 존재 여부 확인
   */
  has(word: string): boolean {
    return this.entries.has(word);
  }

  /**
   * 단어 삭제
   */
  delete(word: string): boolean {
    const entries = this.entries.get(word);
    if (!entries) return false;

    // 역방향 인덱스에서도 삭제
    for (const entry of entries) {
      const translation = entry.translation.toLowerCase();
      const reverseList = this.reverseEntries.get(translation);
      if (reverseList) {
        const idx = reverseList.indexOf(word);
        if (idx !== -1) {
          reverseList.splice(idx, 1);
        }
        if (reverseList.length === 0) {
          this.reverseEntries.delete(translation);
        }
      }
    }

    return this.entries.delete(word);
  }

  /**
   * 사전 크기
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * 모든 단어 키 반환
   */
  keys(): IterableIterator<string> {
    return this.entries.keys();
  }

  /**
   * 청크 등록 (코드 스플리팅용)
   */
  registerChunk(chunk: DictionaryChunk): void {
    this.chunks.set(chunk.id, chunk);
  }

  /**
   * 청크 로드 (동적 import)
   */
  async loadChunk(chunkId: string): Promise<boolean> {
    if (this.loadedChunks.has(chunkId)) {
      return true; // 이미 로드됨
    }

    const chunk = this.chunks.get(chunkId);
    if (!chunk) {
      return false; // 청크 없음
    }

    try {
      const data = await chunk.loader();

      for (const [word, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          this.addSimple(word, value);
        } else {
          this.addEntry(word, value);
        }
      }

      this.loadedChunks.add(chunkId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 모든 청크 로드
   */
  async loadAllChunks(): Promise<void> {
    const promises = Array.from(this.chunks.keys()).map((id) => this.loadChunk(id));
    await Promise.all(promises);
  }

  /**
   * 직렬화 (SSG 빌드용)
   */
  serialize(): string {
    const data: Record<string, DictionaryEntry[]> = {};

    for (const [word, entries] of this.entries) {
      data[word] = entries;
    }

    return JSON.stringify(data);
  }

  /**
   * 역직렬화 (SSG 런타임용)
   */
  static deserialize(json: string): DictionaryIndex {
    const dict = new DictionaryIndex();
    const data = JSON.parse(json) as Record<string, DictionaryEntry[]>;

    for (const [word, entries] of Object.entries(data)) {
      for (const entry of entries) {
        dict.addEntry(word, entry);
      }
    }

    return dict;
  }

  /**
   * Record<string, string>으로부터 생성 (기존 사전 호환)
   */
  static fromRecord(record: Record<string, string>): DictionaryIndex {
    const dict = new DictionaryIndex();
    dict.addFromRecord(record);
    return dict;
  }

  /**
   * 접두사로 시작하는 단어 검색
   * @param prefix 접두사
   * @param limit 최대 결과 수
   */
  searchByPrefix(prefix: string, limit = 10): string[] {
    const results: string[] = [];

    for (const word of this.entries.keys()) {
      if (word.startsWith(prefix)) {
        results.push(word);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * 품사로 필터링
   */
  getByPos(pos: DictionaryEntry['pos']): Map<string, DictionaryEntry> {
    const filtered = new Map<string, DictionaryEntry>();

    for (const [word, entries] of this.entries) {
      const entry = entries.find((e) => e.pos === pos);
      if (entry) {
        filtered.set(word, entry);
      }
    }

    return filtered;
  }

  /**
   * 도메인으로 필터링
   */
  getByDomain(domain: string): Map<string, DictionaryEntry> {
    const filtered = new Map<string, DictionaryEntry>();

    for (const [word, entries] of this.entries) {
      const entry = entries.find((e) => e.domain === domain);
      if (entry) {
        filtered.set(word, entry);
      }
    }

    return filtered;
  }

  /**
   * 통계 정보
   */
  getStats(): {
    totalWords: number;
    totalEntries: number;
    loadedChunks: number;
    registeredChunks: number;
  } {
    let totalEntries = 0;
    for (const entries of this.entries.values()) {
      totalEntries += entries.length;
    }

    return {
      totalWords: this.entries.size,
      totalEntries,
      loadedChunks: this.loadedChunks.size,
      registeredChunks: this.chunks.size,
    };
  }
}
