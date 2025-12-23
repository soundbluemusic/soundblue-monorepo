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
  createEngineFromLegacy,
  EngineLoader,
  getEngine,
  getEngineSync,
  initializeEngine,
} from './engine-loader';
