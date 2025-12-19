// ========================================
// Benchmark Registry - 벤치마크 레지스트리
// 도구별 벤치마크 등록 및 관리
// ========================================

import type { BenchmarkDefinition } from './types';

/**
 * 벤치마크 레지스트리 저장소
 */
const benchmarks = new Map<string, BenchmarkDefinition<unknown>>();

/**
 * 벤치마크 등록
 */
export function registerBenchmark<TReport>(benchmark: BenchmarkDefinition<TReport>): void {
  // Silently overwrite if already registered (expected during HMR)
  benchmarks.set(benchmark.id, benchmark as BenchmarkDefinition<unknown>);
}

/**
 * ID로 벤치마크 조회
 */
export function getBenchmark<TReport = unknown>(
  id: string,
): BenchmarkDefinition<TReport> | undefined {
  return benchmarks.get(id) as BenchmarkDefinition<TReport> | undefined;
}

/**
 * 모든 벤치마크 조회
 */
export function getAllBenchmarks(): BenchmarkDefinition<unknown>[] {
  return Array.from(benchmarks.values());
}

/**
 * 카테고리별 벤치마크 조회
 */
export function getBenchmarksByCategory(
  category: BenchmarkDefinition['category'],
): BenchmarkDefinition<unknown>[] {
  return getAllBenchmarks().filter((b) => b.category === category);
}

/**
 * 벤치마크 등록 해제
 */
export function unregisterBenchmark(id: string): boolean {
  return benchmarks.delete(id);
}

/**
 * 등록된 벤치마크 수
 */
export function getBenchmarkCount(): number {
  return benchmarks.size;
}
