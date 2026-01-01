// ========================================
// LRU Cache - 번역 결과 캐싱
// 자주 사용되는 번역 결과를 메모리에 저장
// ========================================

/**
 * 캐시 엔트리
 */
interface CacheEntry<V> {
  value: V;
  /** 마지막 접근 시간 */
  lastAccess: number;
  /** 접근 횟수 */
  hitCount: number;
}

/**
 * LRU (Least Recently Used) 캐시
 * - 가장 오래 사용되지 않은 항목부터 제거
 * - 자주 사용되는 번역 결과 캐싱에 최적화
 *
 * @example
 * const cache = new LRUCache<string>(1000);
 * cache.set('안녕하세요', 'Hello');
 * cache.get('안녕하세요'); // 'Hello'
 */
export class LRUCache<V> {
  private cache: Map<string, CacheEntry<V>>;
  private maxSize: number;

  /** 캐시 히트 횟수 */
  private hits: number;
  /** 캐시 미스 횟수 */
  private misses: number;

  /**
   * @param maxSize 최대 캐시 크기 (기본: 1000)
   */
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 값 조회
   * @returns 캐시된 값 또는 undefined
   */
  get(key: string): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // 접근 정보 업데이트
    entry.lastAccess = Date.now();
    entry.hitCount++;
    this.hits++;

    // Map에서 재삽입하여 순서 갱신 (가장 최근 사용으로)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * 값 설정
   */
  set(key: string, value: V): void {
    // 이미 존재하면 삭제 후 재삽입 (순서 갱신)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 용량 초과 시 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      lastAccess: Date.now(),
      hitCount: 0,
    });
  }

  /**
   * 값이 있으면 반환, 없으면 factory 실행 후 저장
   */
  getOrSet(key: string, factory: () => V): V {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const value = factory();
    this.set(key, value);
    return value;
  }

  /**
   * 비동기 getOrSet
   */
  async getOrSetAsync(key: string, factory: () => Promise<V>): Promise<V> {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const value = await factory();
    this.set(key, value);
    return value;
  }

  /**
   * 존재 여부 확인
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 값 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 전체 삭제
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 가장 오래된 항목 제거 (LRU 정책)
   */
  private evict(): void {
    // Map의 첫 번째 항목이 가장 오래된 것
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  /**
   * 여러 개의 가장 오래된 항목 제거
   */
  evictMany(count: number): void {
    const keys = [...this.cache.keys()].slice(0, count);
    for (const key of keys) {
      this.cache.delete(key);
    }
  }

  /**
   * 특정 조건의 항목 제거
   */
  evictIf(predicate: (key: string, value: V) => boolean): number {
    let removed = 0;

    for (const [key, entry] of this.cache) {
      if (predicate(key, entry.value)) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 캐시 크기
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 최대 크기
   */
  get capacity(): number {
    return this.maxSize;
  }

  /**
   * 최대 크기 변경
   */
  resize(newMaxSize: number): void {
    this.maxSize = newMaxSize;

    // 초과 항목 제거
    while (this.cache.size > this.maxSize) {
      this.evict();
    }
  }

  /**
   * 모든 키 반환
   */
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  /**
   * 모든 값 반환
   */
  values(): V[] {
    return [...this.cache.values()].map((e) => e.value);
  }

  /**
   * 캐시 통계
   */
  getStats(): {
    size: number;
    capacity: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      size: this.cache.size,
      capacity: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  /**
   * 가장 많이 사용된 항목 조회
   * 성능: 전체 정렬 대신 부분 선택으로 O(n*count)에서 O(n) 수준으로 개선
   */
  getMostUsed(count = 10): Array<{ key: string; value: V; hitCount: number }> {
    // 작은 캐시나 전체 조회 시에는 기존 방식 사용
    if (this.cache.size <= count * 2) {
      return [...this.cache.entries()]
        .map(([key, entry]) => ({
          key,
          value: entry.value,
          hitCount: entry.hitCount,
        }))
        .sort((a, b) => b.hitCount - a.hitCount)
        .slice(0, count);
    }

    // 큰 캐시에서는 min-heap 방식으로 상위 N개만 추적
    type Entry = { key: string; value: V; hitCount: number };
    const topN: Entry[] = [];

    for (const [key, entry] of this.cache) {
      const item = { key, value: entry.value, hitCount: entry.hitCount };

      if (topN.length < count) {
        topN.push(item);
        // min 정렬 유지
        if (topN.length === count) {
          topN.sort((a, b) => a.hitCount - b.hitCount);
        }
      } else if (item.hitCount > topN[0]!.hitCount) {
        topN[0] = item;
        // 재정렬 (최솟값을 맨 앞으로)
        topN.sort((a, b) => a.hitCount - b.hitCount);
      }
    }

    // 최종 결과는 내림차순
    return topN.sort((a, b) => b.hitCount - a.hitCount);
  }

  /**
   * 직렬화 (SSG 빌드용 - 자주 사용되는 항목만)
   */
  serializeHot(threshold = 5): string {
    const hot: Record<string, V> = {};

    for (const [key, entry] of this.cache) {
      if (entry.hitCount >= threshold) {
        hot[key] = entry.value;
      }
    }

    return JSON.stringify(hot);
  }

  /**
   * 역직렬화 (SSG 런타임용)
   */
  static deserialize<V>(json: string): LRUCache<V> {
    const data = JSON.parse(json) as Record<string, V>;
    const cache = new LRUCache<V>();

    for (const [key, value] of Object.entries(data)) {
      cache.set(key, value);
    }

    return cache;
  }

  /**
   * 미리 채우기 (워밍업)
   */
  preload(entries: Array<[string, V]>): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }
}
