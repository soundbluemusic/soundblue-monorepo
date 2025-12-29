// ========================================
// Chunk Definitions - 사전 청크 정의
// SSG 최적화를 위한 동적 import 설정
// ========================================

/**
 * 사전 청크 정의
 * - required: true인 청크는 초기화 시 즉시 로드
 * - required: false인 청크는 필요시 지연 로드
 */
export interface ChunkDefinition {
  id: string;
  name: string;
  estimatedSize: number;
  required: boolean;
  loader: () => Promise<Record<string, string>>;
}

/**
 * 핵심 단어 사전 청크 (필수)
 * - 대명사, 기본 명사, 동사 등
 */
export const coreWordsChunk: ChunkDefinition = {
  id: 'core-words',
  name: '핵심 단어',
  estimatedSize: 500,
  required: true,
  loader: async () => {
    const { koToEnWords } = await import('../../dictionary/words');
    return koToEnWords;
  },
};

/**
 * 형태소 청크 (필수)
 * - 조사, 어미
 */
export const morphemesChunk: ChunkDefinition = {
  id: 'morphemes',
  name: '형태소',
  estimatedSize: 50,
  required: true,
  loader: async () => {
    // 형태소는 별도 구조로 로드됨 (particles, endings)
    // 여기서는 빈 객체 반환 (실제 로딩은 별도 처리)
    return {};
  },
};

/**
 * 연결어미 청크 (필수)
 */
export const connectiveEndingsChunk: ChunkDefinition = {
  id: 'connective-endings',
  name: '연결어미',
  estimatedSize: 30,
  required: true,
  loader: async () => {
    const { connectiveEndings } = await import('../../dictionary/morphology/korean-connective');
    // ConnectiveEndingInfo를 Record<string, string>으로 변환
    const result: Record<string, string> = {};
    for (const [key, info] of Object.entries(connectiveEndings)) {
      if (typeof info === 'object' && info !== null && 'en' in info) {
        const enValue = (info as { en?: string }).en;
        if (enValue) {
          result[key] = enValue;
        }
      }
    }
    return result;
  },
};

/**
 * 관용어/숙어 청크 (선택)
 * idioms는 IdiomEntry[] 배열 형태
 */
export const idiomsChunk: ChunkDefinition = {
  id: 'idioms',
  name: '관용어',
  estimatedSize: 100,
  required: false,
  loader: async () => {
    const { idioms } = await import('../../dictionary/idioms');
    const result: Record<string, string> = {};
    // idioms는 IdiomEntry[] 배열
    for (const entry of idioms) {
      if (entry.ko && entry.en) {
        result[entry.ko] = entry.en;
      }
    }
    return result;
  },
};

/**
 * 의성어/의태어 청크 (선택)
 * onomatopoeia는 Record<string, string> 형태
 */
export const onomatopoeiaChunk: ChunkDefinition = {
  id: 'onomatopoeia',
  name: '의성어/의태어',
  estimatedSize: 80,
  required: false,
  loader: async () => {
    const { onomatopoeia } = await import('../../dictionary/onomatopoeia');
    // 이미 Record<string, string> 형태이므로 바로 반환
    return onomatopoeia;
  },
};

/**
 * 문화 표현 청크 (선택)
 * culturalExpressions는 Record<string, string> 형태
 */
export const culturalChunk: ChunkDefinition = {
  id: 'cultural',
  name: '문화 표현',
  estimatedSize: 50,
  required: false,
  loader: async () => {
    const { culturalExpressions } = await import('../../dictionary/cultural');
    // 이미 Record<string, string> 형태이므로 바로 반환
    return culturalExpressions;
  },
};

/**
 * 모든 청크 정의 (i18n 제외 - 별도 생성 파일)
 */
export const allChunks: ChunkDefinition[] = [
  coreWordsChunk,
  morphemesChunk,
  connectiveEndingsChunk,
  idiomsChunk,
  onomatopoeiaChunk,
  culturalChunk,
];

/**
 * 필수 청크만 필터링
 */
export const requiredChunks = allChunks.filter((chunk) => chunk.required);

/**
 * 선택 청크만 필터링
 */
export const optionalChunks = allChunks.filter((chunk) => !chunk.required);
