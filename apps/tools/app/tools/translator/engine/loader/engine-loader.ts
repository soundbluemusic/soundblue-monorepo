// ========================================
// Engine Loader - 엔진 초기화 및 청크 로딩
// SSG 최적화를 위한 동적 import 관리
// ========================================

import { type EngineConfig, TranslatorEngine } from '../translator-engine';

/**
 * 사전 청크 정의
 */
interface DictionaryChunkDef {
  id: string;
  name: string;
  /** 예상 단어 수 (로딩 우선순위 결정에 사용) */
  estimatedSize: number;
  /** 필수 여부 (필수 청크는 초기화 시 즉시 로드) */
  required: boolean;
  /** 동적 import 함수 */
  loader: () => Promise<Record<string, string>>;
}

/**
 * 로딩 상태
 */
interface LoadingState {
  total: number;
  loaded: number;
  failed: string[];
  inProgress: Set<string>;
}

/**
 * 엔진 로더
 * - 기존 사전을 새 엔진에 로드
 * - 청크 단위 동적 로딩
 * - 로딩 상태 추적
 *
 * @example
 * const loader = new EngineLoader();
 * loader.registerChunk({ id: 'core', loader: () => import('./chunks/core') });
 * const engine = await loader.initialize();
 */
export class EngineLoader {
  private engine: TranslatorEngine | null = null;
  private chunks: Map<string, DictionaryChunkDef> = new Map();
  private loadingState: LoadingState = {
    total: 0,
    loaded: 0,
    failed: [],
    inProgress: new Set(),
  };

  private config: EngineConfig;

  constructor(config: EngineConfig = {}) {
    this.config = config;
  }

  /**
   * 청크 등록
   */
  registerChunk(chunk: DictionaryChunkDef): void {
    this.chunks.set(chunk.id, chunk);
    this.loadingState.total++;
  }

  /**
   * 여러 청크 등록
   */
  registerChunks(chunks: DictionaryChunkDef[]): void {
    for (const chunk of chunks) {
      this.registerChunk(chunk);
    }
  }

  /**
   * 엔진 초기화 (필수 청크만 로드)
   */
  async initialize(): Promise<TranslatorEngine> {
    this.engine = new TranslatorEngine(this.config);

    // 필수 청크 로드
    const requiredChunks = [...this.chunks.values()].filter((c) => c.required);
    await Promise.all(requiredChunks.map((c) => this.loadChunk(c.id)));

    this.engine.markInitialized();
    return this.engine;
  }

  /**
   * 특정 청크 로드
   */
  async loadChunk(chunkId: string): Promise<boolean> {
    if (!this.engine) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    const chunk = this.chunks.get(chunkId);
    if (!chunk) {
      if (import.meta.env.DEV) console.warn(`Chunk not found: ${chunkId}`);
      return false;
    }

    // 이미 로딩 중
    if (this.loadingState.inProgress.has(chunkId)) {
      return false;
    }

    this.loadingState.inProgress.add(chunkId);

    try {
      const data = await chunk.loader();
      this.engine.loadKoToEnDictionary(data);
      this.loadingState.loaded++;
      this.loadingState.inProgress.delete(chunkId);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Failed to load chunk: ${chunkId}`, error);
      this.loadingState.failed.push(chunkId);
      this.loadingState.inProgress.delete(chunkId);
      return false;
    }
  }

  /**
   * 모든 청크 로드
   */
  async loadAllChunks(): Promise<void> {
    const chunkIds = [...this.chunks.keys()];
    await Promise.all(chunkIds.map((id) => this.loadChunk(id)));
  }

  /**
   * 로딩 상태 조회
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  /**
   * 엔진 인스턴스 반환
   */
  getEngine(): TranslatorEngine | null {
    return this.engine;
  }
}

/**
 * 기존 사전에서 엔진 생성 (마이그레이션 헬퍼)
 */
export async function createEngineFromLegacy(config?: EngineConfig): Promise<TranslatorEngine> {
  const engine = new TranslatorEngine(config);

  // 기존 사전 동적 import
  const [
    { koToEnWords, enToKoWords },
    { particles, particleList },
    { endings, endingList },
    { connectiveEndings, connectiveEndingList },
    { koToEnPatterns, enToKoPatterns },
  ] = await Promise.all([
    import('../../dictionary/words'),
    import('../../dictionary/morphemes'),
    import('../../dictionary/morphemes'),
    import('../../dictionary/connective-endings'),
    import('../../dictionary/patterns'),
  ]);

  // 사전 로드
  engine.loadDictionary(koToEnWords, enToKoWords);

  // 조사 로드
  const particleEntries = particleList.map((p: string) => ({
    suffix: p,
    info: {
      type: 'particle' as const,
      role: particles[p]?.role,
      en: particles[p]?.en,
    },
  }));
  engine.loadParticles(particleEntries);

  // 어미 로드
  const endingEntries = endingList.map((e: string) => ({
    suffix: e,
    info: {
      type: 'ending' as const,
      tense: endings[e]?.tense,
    },
  }));
  engine.loadEndings(endingEntries);

  // 연결어미 로드
  const connectiveEntries = connectiveEndingList.map((c: string) => ({
    suffix: c,
    info: {
      type: 'connective' as const,
      en: connectiveEndings[c]?.en,
    },
  }));
  engine.loadConnectives(connectiveEntries);

  // 패턴 로드
  engine.loadKoToEnPatterns(koToEnPatterns);
  engine.loadEnToKoPatterns(enToKoPatterns);

  engine.markInitialized();
  return engine;
}

/**
 * 싱글톤 엔진 인스턴스 (지연 초기화)
 */
let engineInstance: TranslatorEngine | null = null;
let enginePromise: Promise<TranslatorEngine> | null = null;

/**
 * 엔진 싱글톤 가져오기
 */
export async function getEngine(): Promise<TranslatorEngine> {
  if (engineInstance) {
    return engineInstance;
  }

  if (enginePromise) {
    return enginePromise;
  }

  enginePromise = createEngineFromLegacy({ debug: false }).then((engine) => {
    engineInstance = engine;
    return engine;
  });

  return enginePromise;
}

/**
 * 엔진 초기화 (명시적 호출)
 */
export async function initializeEngine(config?: EngineConfig): Promise<TranslatorEngine> {
  engineInstance = await createEngineFromLegacy(config);
  return engineInstance;
}

/**
 * 동기적으로 엔진 가져오기 (초기화 후에만 사용)
 */
export function getEngineSync(): TranslatorEngine | null {
  return engineInstance;
}

// ========================================
// 런타임 스트리밍 청크 로더 (100K+ 확장용)
// ========================================

/**
 * 청크 우선순위 레벨
 */
export type ChunkPriority = 'critical' | 'high' | 'medium' | 'low' | 'lazy';

/**
 * 스트리밍 청크 정의
 */
export interface StreamingChunkDef {
  id: string;
  priority: ChunkPriority;
  /** 예상 크기 (KB) */
  sizeKB: number;
  /** 청크 URL 또는 동적 import 함수 */
  loader: () => Promise<Record<string, string>>;
  /** 청크에 포함된 단어 prefix 패턴 (Trie 빌드용) */
  prefixes?: string[];
}

/**
 * 스트리밍 로더 옵션
 */
interface StreamingLoaderOptions {
  /** 동시 로딩 청크 수 (기본 3) */
  concurrency?: number;
  /** 청크 로딩 타임아웃 (ms, 기본 5000) */
  timeout?: number;
  /** 로딩 진행 콜백 */
  onProgress?: (loaded: number, total: number, chunkId: string) => void;
  /** 에러 콜백 */
  onError?: (chunkId: string, error: Error) => void;
}

/**
 * 스트리밍 청크 로더
 * 100K+ 단어를 청크 단위로 점진적 로딩
 *
 * @example
 * const loader = new StreamingChunkLoader(engine, { concurrency: 2 });
 *
 * // 필수 청크 등록 (즉시 로드)
 * loader.registerChunk({ id: 'core', priority: 'critical', ... });
 *
 * // 선택 청크 등록 (지연 로드)
 * loader.registerChunk({ id: 'idioms', priority: 'low', ... });
 *
 * // 필수 청크 로드
 * await loader.loadCritical();
 *
 * // 백그라운드에서 나머지 로드
 * loader.loadRemaining();
 */
export class StreamingChunkLoader {
  private engine: TranslatorEngine;
  private chunks: Map<string, StreamingChunkDef> = new Map();
  private loadedChunks: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<boolean>> = new Map();
  private options: Required<StreamingLoaderOptions>;

  constructor(engine: TranslatorEngine, options: StreamingLoaderOptions = {}) {
    this.engine = engine;
    this.options = {
      concurrency: options.concurrency ?? 3,
      timeout: options.timeout ?? 5000,
      onProgress: options.onProgress ?? (() => {}),
      onError: options.onError ?? (() => {}),
    };
  }

  /**
   * 청크 등록
   */
  registerChunk(chunk: StreamingChunkDef): void {
    this.chunks.set(chunk.id, chunk);
  }

  /**
   * 여러 청크 등록
   */
  registerChunks(chunks: StreamingChunkDef[]): void {
    for (const chunk of chunks) {
      this.registerChunk(chunk);
    }
  }

  /**
   * 청크 로드 (중복 방지)
   */
  async loadChunk(chunkId: string): Promise<boolean> {
    // 이미 로드됨
    if (this.loadedChunks.has(chunkId)) {
      return true;
    }

    // 이미 로딩 중
    const existingPromise = this.loadingPromises.get(chunkId);
    if (existingPromise) {
      return existingPromise;
    }

    const chunk = this.chunks.get(chunkId);
    if (!chunk) {
      return false;
    }

    // 타임아웃 래핑
    const loadPromise = this.loadWithTimeout(chunk);
    this.loadingPromises.set(chunkId, loadPromise);

    const result = await loadPromise;
    this.loadingPromises.delete(chunkId);

    if (result) {
      this.loadedChunks.add(chunkId);
      this.options.onProgress(this.loadedChunks.size, this.chunks.size, chunkId);
    }

    return result;
  }

  /**
   * 타임아웃 포함 로딩
   */
  private async loadWithTimeout(chunk: StreamingChunkDef): Promise<boolean> {
    return Promise.race([
      this.doLoad(chunk),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error(`Chunk ${chunk.id} timeout`)), this.options.timeout),
      ),
    ]).catch((error) => {
      this.options.onError(chunk.id, error);
      return false;
    });
  }

  /**
   * 실제 로딩 수행
   */
  private async doLoad(chunk: StreamingChunkDef): Promise<boolean> {
    try {
      const data = await chunk.loader();
      this.engine.loadKoToEnDictionary(data);
      return true;
    } catch (error) {
      this.options.onError(chunk.id, error as Error);
      return false;
    }
  }

  /**
   * Critical 청크만 로드 (초기화 시 사용)
   */
  async loadCritical(): Promise<void> {
    const critical = [...this.chunks.values()].filter((c) => c.priority === 'critical');
    await Promise.all(critical.map((c) => this.loadChunk(c.id)));
  }

  /**
   * 우선순위 순서로 모든 청크 로드
   */
  async loadAll(): Promise<void> {
    const sorted = this.getSortedChunks();
    await this.loadInBatches(sorted.map((c) => c.id));
  }

  /**
   * 남은 청크 백그라운드 로드 (non-blocking)
   */
  loadRemaining(): void {
    const remaining = [...this.chunks.values()].filter((c) => !this.loadedChunks.has(c.id));
    const sorted = remaining.sort((a, b) => this.priorityScore(a) - this.priorityScore(b));

    // Fire and forget
    this.loadInBatches(sorted.map((c) => c.id)).catch(() => {});
  }

  /**
   * 배치 로딩 (동시성 제어)
   */
  private async loadInBatches(chunkIds: string[]): Promise<void> {
    const batches: string[][] = [];
    for (let i = 0; i < chunkIds.length; i += this.options.concurrency) {
      batches.push(chunkIds.slice(i, i + this.options.concurrency));
    }

    for (const batch of batches) {
      await Promise.all(batch.map((id) => this.loadChunk(id)));
    }
  }

  /**
   * 청크 우선순위 정렬
   */
  private getSortedChunks(): StreamingChunkDef[] {
    return [...this.chunks.values()].sort((a, b) => this.priorityScore(a) - this.priorityScore(b));
  }

  /**
   * 우선순위 점수 (낮을수록 먼저 로드)
   */
  private priorityScore(chunk: StreamingChunkDef): number {
    const scores: Record<ChunkPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      lazy: 4,
    };
    return scores[chunk.priority];
  }

  /**
   * 로딩 상태
   */
  getStatus(): {
    total: number;
    loaded: number;
    loading: number;
    remaining: number;
  } {
    return {
      total: this.chunks.size,
      loaded: this.loadedChunks.size,
      loading: this.loadingPromises.size,
      remaining: this.chunks.size - this.loadedChunks.size,
    };
  }

  /**
   * 특정 prefix를 포함하는 청크 찾기 및 로드
   */
  async loadForPrefix(prefix: string): Promise<boolean> {
    for (const [id, chunk] of this.chunks) {
      if (this.loadedChunks.has(id)) continue;

      if (chunk.prefixes?.some((p) => prefix.startsWith(p))) {
        return this.loadChunk(id);
      }
    }
    return false;
  }
}
