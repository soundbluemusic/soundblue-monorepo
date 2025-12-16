// ========================================
// Translator Benchmark - 번역기 벤치마크
// 테스트지 v3.0 기반 벤치마크 시스템
// ========================================

import { registerBenchmark } from '@/benchmark/registry';
import { translatorBenchmark } from './definition';

// 벤치마크 레지스트리에 등록
registerBenchmark(translatorBenchmark);

export * from './definition';
export * from './evaluator';
export * from './runner';
export * from './TranslatorBenchmarkResult';
export * from './test-cases';
export * from './types';
