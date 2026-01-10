// ========================================
// Core Translation Engine - Export
// ========================================

export * from './en-to-ko';
// grammar-aware-translator는 src/index.ts에서 alias와 함께 export
// TranslationResult 충돌 방지
export * from './jaso-engine';
export * from './ko-to-en';
