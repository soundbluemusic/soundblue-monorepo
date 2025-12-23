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
      console.warn(`Chunk not found: ${chunkId}`);
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
      console.error(`Failed to load chunk: ${chunkId}`, error);
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
