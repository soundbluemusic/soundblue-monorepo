// ========================================
// Engine Loader - Export
// ========================================

export {
  allChunks,
  type ChunkDefinition,
  connectiveEndingsChunk,
  coreWordsChunk,
  culturalChunk,
  idiomsChunk,
  morphemesChunk,
  onomatopoeiaChunk,
  optionalChunks,
  requiredChunks,
} from './chunk-definitions';
export {
  type ChunkPriority,
  createEngineFromLegacy,
  EngineLoader,
  getEngine,
  getEngineSync,
  initializeEngine,
  type StreamingChunkDef,
  StreamingChunkLoader,
} from './engine-loader';
