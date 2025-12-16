// ========================================
// Translator Benchmark Definition - 번역기 벤치마크 정의
// 벤치마크 레지스트리에 등록되는 정의
// ========================================

import { Languages } from 'lucide-solid';
import type { BenchmarkDefinition } from '@/benchmark/types';
import { runBenchmark, runQuickBenchmark } from './runner';
import { TranslatorBenchmarkResult } from './TranslatorBenchmarkResult';
import type { BenchmarkReport } from './types';

/**
 * 번역기 벤치마크 정의
 */
export const translatorBenchmark: BenchmarkDefinition<BenchmarkReport> = {
  id: 'translator',
  name: {
    ko: '번역기 품질 테스트',
    en: 'Translator Quality Test',
  },
  description: {
    ko: '테스트지 v3.0 기반 번역 품질 평가. 동음이의어, 다의어, 관용구, 전문 용어 등 다양한 카테고리를 테스트합니다.',
    en: 'Translation quality evaluation based on Test Suite v3.0. Tests various categories including homonyms, polysemy, idioms, and domain terminology.',
  },
  icon: Languages,
  category: 'translation',
  toolId: 'translator',
  run: (onProgress) => {
    return runBenchmark((p) =>
      onProgress({
        current: p.current,
        total: p.total,
        percentage: p.percentage,
        message: p.currentTestId,
      })
    );
  },
  runQuick: (onProgress) => {
    return runQuickBenchmark((p) =>
      onProgress({
        current: p.current,
        total: p.total,
        percentage: p.percentage,
        message: p.currentTestId,
      })
    );
  },
  ResultComponent: TranslatorBenchmarkResult,
};
