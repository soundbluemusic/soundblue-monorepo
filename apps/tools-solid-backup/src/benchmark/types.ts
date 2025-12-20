// ========================================
// Benchmark Common Types - 벤치마크 공통 타입
// 도구별 벤치마크를 위한 공통 인터페이스
// ========================================

import type { Component } from 'solid-js';

/**
 * 벤치마크 진행 상태
 */
export interface BenchmarkProgress {
  /** 현재 진행 중인 테스트 인덱스 */
  current: number;
  /** 전체 테스트 수 */
  total: number;
  /** 진행률 (0-100) */
  percentage: number;
  /** 현재 작업 메시지 */
  message?: string;
}

/**
 * 진행 콜백 타입
 */
export type ProgressCallback = (progress: BenchmarkProgress) => void;

/**
 * 공통 점수 카드 데이터
 */
export interface ScoreData {
  /** 등급 (S, A, B, C, D) */
  grade: string;
  /** 점수 */
  score: number;
  /** 최대 점수 */
  maxScore: number;
  /** 통과율 (%) */
  passRate: number;
  /** 합격 여부 */
  passed: boolean;
}

/**
 * 통계 항목
 */
export interface StatItem {
  /** 라벨 */
  label: string;
  /** 값 */
  value: string | number;
  /** 부가 설명 (선택) */
  description?: string;
}

/**
 * 기준별 점수
 */
export interface CriteriaScore {
  /** 라벨 */
  label: string;
  /** 점수 */
  score: number;
  /** 최대 점수 */
  maxScore: number;
  /** 가중치 (선택) */
  weight?: string;
}

/**
 * 카테고리 결과 (공통)
 */
export interface CategoryResultData {
  /** 카테고리 ID */
  id: string;
  /** 카테고리 이름 */
  name: string;
  /** 평균 점수 */
  averageScore: number;
  /** 최대 점수 */
  maxScore: number;
  /** 통과 수 */
  passedCount: number;
  /** 전체 수 */
  totalCount: number;
  /** 상세 결과 (선택) */
  details?: CategoryDetailItem[];
}

/**
 * 카테고리 상세 항목
 */
export interface CategoryDetailItem {
  /** 항목 ID */
  id: string;
  /** 입력값 */
  input: string;
  /** 출력값 */
  output: string;
  /** 점수 */
  score: number;
  /** 최대 점수 */
  maxScore: number;
  /** 피드백 */
  feedback?: string;
}

/**
 * 벤치마크 공통 결과 인터페이스
 */
export interface BaseBenchmarkReport {
  /** 테스트 일시 */
  timestamp: Date;
  /** 점수 데이터 */
  scoreData: ScoreData;
  /** 통계 항목들 */
  stats: StatItem[];
  /** 전체 실행 시간 (ms) */
  executionTime: number;
}

/**
 * 방향 필터 옵션 (번역 벤치마크용)
 */
export type DirectionFilter = 'ko-en' | 'en-ko' | 'all';

/**
 * 방향별 테스트 수
 */
export interface DirectionTestCounts {
  all: number;
  'ko-en': number;
  'en-ko': number;
}

/**
 * 벤치마크 정의 인터페이스
 */
export interface BenchmarkDefinition<TReport = unknown> {
  /** 고유 ID */
  id: string;
  /** 이름 */
  name: { ko: string; en: string };
  /** 설명 */
  description: { ko: string; en: string };
  /** 아이콘 컴포넌트 */
  icon: Component<{ class?: string }>;
  /** 카테고리 */
  category: 'translation' | 'audio' | 'utility' | 'visual';
  /** 연결된 도구 ID (선택) - 도구 페이지로 링크 */
  toolId?: string;

  /** 방향 필터 지원 여부 (번역 벤치마크용) */
  supportsDirection?: boolean;

  /** 방향별 테스트 수 조회 함수 (선택) */
  getDirectionCounts?: () => DirectionTestCounts;

  /** 벤치마크 실행 함수 */
  run: (onProgress: ProgressCallback, direction?: DirectionFilter) => TReport;

  /** 빠른 테스트 실행 함수 (선택) */
  runQuick?: (onProgress: ProgressCallback, direction?: DirectionFilter) => TReport;

  /** 결과 렌더링 컴포넌트 */
  ResultComponent: Component<{ report: TReport; locale: string }>;
}

/**
 * 등급 색상 유틸리티
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S':
      return 'text-purple-600 dark:text-purple-400';
    case 'A':
      return 'text-green-600 dark:text-green-400';
    case 'B':
      return 'text-blue-600 dark:text-blue-400';
    case 'C':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * 점수 색상 유틸리티
 */
export function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-green-600 dark:text-green-400';
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * 점수 바 색상 유틸리티
 */
export function getScoreBarColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return '#22c55e';
  if (percentage >= 60) return '#eab308';
  return '#ef4444';
}
