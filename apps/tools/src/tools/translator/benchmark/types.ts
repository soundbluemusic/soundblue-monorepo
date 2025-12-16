// ========================================
// Translator Benchmark Types - 번역기 벤치마크 타입
// 테스트지 v3.0 기반 타입 정의
// ========================================

/**
 * 번역 방향
 */
export type Direction = 'ko-en' | 'en-ko';

/**
 * 테스트 카테고리 ID
 */
export type CategoryId =
  | 'A1.1'
  | 'A1.2'
  | 'A1.3'
  | 'A1.4'
  | 'A1.5'
  | 'A1.6' // 한→영 단어
  | 'A2.1'
  | 'A2.2'
  | 'A2.3'
  | 'A2.4'
  | 'A2.5' // 한→영 문장
  | 'A3.1'
  | 'A3.2'
  | 'A3.3'
  | 'A3.4' // 한→영 문단
  | 'A4.1'
  | 'A4.2'
  | 'A4.3'
  | 'A4.4'
  | 'A4.5' // 한→영 전문분야
  | 'B1.1'
  | 'B1.2'
  | 'B1.3' // 영→한 단어
  | 'B2.1'
  | 'B2.2'
  | 'B2.3' // 영→한 문장
  | 'B3.1'
  | 'B3.2'
  | 'B3.3'
  | 'B3.4' // 영→한 문단
  | 'C1'
  | 'C2'
  | 'C3'
  | 'C4'
  | 'C5' // 콩글리시/혼용어
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D5' // 특수 케이스
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5' // 긴 문서
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4' // 실시간 대화
  | 'G1'
  | 'G2'
  | 'G3'
  | 'G4' // STT 번역
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5' // 멀티미디어
  | 'I1'
  | 'I2'
  | 'I3'
  | 'I4'
  | 'I5'
  | 'I6'; // 로컬라이제이션

/**
 * 카테고리 그룹
 */
export type CategoryGroup =
  | 'word-ko-en' // A1: 한→영 단어
  | 'sentence-ko-en' // A2: 한→영 문장
  | 'paragraph-ko-en' // A3: 한→영 문단
  | 'domain-ko-en' // A4: 한→영 전문분야
  | 'word-en-ko' // B1: 영→한 단어
  | 'sentence-en-ko' // B2: 영→한 문장
  | 'paragraph-en-ko' // B3: 영→한 문단
  | 'konglish' // C: 콩글리시
  | 'special' // D: 특수 케이스
  | 'long-document' // E: 긴 문서
  | 'realtime-chat' // F: 실시간 대화
  | 'stt' // G: STT 번역
  | 'multimedia' // H: 멀티미디어
  | 'localization'; // I: 로컬라이제이션

/**
 * 테스트 케이스
 */
export interface TestCase {
  /** 테스트 ID (예: 'A1.1-1') */
  id: string;
  /** 카테고리 ID */
  categoryId: CategoryId;
  /** 서브카테고리 이름 (예: '동음이의어') */
  subcategory: string;
  /** 입력 텍스트 */
  input: string;
  /** 예상 출력 */
  expectedOutput: string;
  /** 대안 정답들 (여러 정답 가능) */
  alternativeOutputs?: string[];
  /** 번역 방향 */
  direction: Direction;
  /** 핵심 키워드 (평가용) */
  keywords?: string[];
  /** 가중치 (1-5, 기본 1) */
  weight?: number;
}

/**
 * 평가 기준별 점수
 */
export interface CriteriaScores {
  /** 정확성 (25%) - 원문 의미의 정확한 전달 */
  accuracy: number;
  /** 유창성 (20%) - 목표 언어의 자연스러운 표현 */
  fluency: number;
  /** 문맥 이해 (15%) - 문맥에 따른 적절한 번역 */
  context: number;
  /** 문화적 적절성 (15%) - 문화적 뉘앙스 처리 */
  cultural: number;
  /** 일관성 (10%) - 동일 용어의 일관된 번역 */
  consistency: number;
  /** 톤 보존 (10%) - 원문 어조와 감정 전달 */
  tone: number;
  /** 전문성 (5%) - 전문 분야 용어 정확성 */
  domain: number;
}

/**
 * 단일 테스트 결과
 */
export interface TestResult {
  /** 테스트 케이스 */
  testCase: TestCase;
  /** 실제 번역 결과 */
  actualOutput: string;
  /** 총점 (0-5) */
  score: number;
  /** 기준별 점수 */
  criteriaScores: CriteriaScores;
  /** 통과 여부 (3.0 이상) */
  passed: boolean;
  /** 피드백/개선점 */
  feedback: string[];
  /** 실행 시간 (ms) */
  executionTime: number;
}

/**
 * 카테고리별 결과
 */
export interface CategoryResult {
  /** 카테고리 ID */
  categoryId: CategoryId;
  /** 카테고리 이름 */
  name: { ko: string; en: string };
  /** 테스트 수 */
  totalTests: number;
  /** 통과 수 */
  passedTests: number;
  /** 평균 점수 */
  averageScore: number;
  /** 통과율 (%) */
  passRate: number;
  /** 개별 테스트 결과 */
  results: TestResult[];
}

/**
 * 등급
 */
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

/**
 * 벤치마크 보고서
 */
export interface BenchmarkReport {
  /** 테스트 일시 */
  timestamp: Date;
  /** 전체 점수 (0-5) */
  overallScore: number;
  /** 등급 */
  grade: Grade;
  /** 전체 통과율 (%) */
  overallPassRate: number;
  /** 전체 테스트 수 */
  totalTests: number;
  /** 전체 통과 수 */
  totalPassed: number;
  /** 기준별 평균 점수 */
  criteriaAverages: CriteriaScores;
  /** 카테고리별 결과 */
  categories: CategoryResult[];
  /** 개선 제안 */
  improvements: string[];
  /** 총 실행 시간 (ms) */
  totalExecutionTime: number;
  /** 합격 여부 (평균 3.8 이상 + 통과율 85% 이상) */
  passed: boolean;
}

/**
 * 벤치마크 진행 상태
 */
export interface BenchmarkProgress {
  /** 현재 진행 중인 테스트 인덱스 */
  current: number;
  /** 전체 테스트 수 */
  total: number;
  /** 현재 카테고리 */
  currentCategory: string;
  /** 현재 테스트 ID */
  currentTestId: string;
  /** 진행률 (0-100) */
  percentage: number;
}

/**
 * 평가 기준 가중치
 */
export const CRITERIA_WEIGHTS: Record<keyof CriteriaScores, number> = {
  accuracy: 0.25,
  fluency: 0.2,
  context: 0.15,
  cultural: 0.15,
  consistency: 0.1,
  tone: 0.1,
  domain: 0.05,
};

/**
 * 카테고리별 최소 통과 기준
 */
export const CATEGORY_PASS_CRITERIA: Record<
  CategoryGroup,
  { minScore: number; minPassRate: number }
> = {
  'word-ko-en': { minScore: 4.0, minPassRate: 90 },
  'sentence-ko-en': { minScore: 4.0, minPassRate: 85 },
  'paragraph-ko-en': { minScore: 3.5, minPassRate: 80 },
  'domain-ko-en': { minScore: 4.0, minPassRate: 85 },
  'word-en-ko': { minScore: 4.0, minPassRate: 90 },
  'sentence-en-ko': { minScore: 4.0, minPassRate: 85 },
  'paragraph-en-ko': { minScore: 3.5, minPassRate: 80 },
  konglish: { minScore: 4.0, minPassRate: 90 },
  special: { minScore: 3.5, minPassRate: 75 },
  'long-document': { minScore: 3.5, minPassRate: 80 },
  'realtime-chat': { minScore: 4.0, minPassRate: 85 },
  stt: { minScore: 3.5, minPassRate: 80 },
  multimedia: { minScore: 4.0, minPassRate: 85 },
  localization: { minScore: 4.0, minPassRate: 90 },
};

/**
 * 등급 기준
 */
export const GRADE_CRITERIA: {
  grade: Grade;
  minScore: number;
  description: { ko: string; en: string };
}[] = [
  {
    grade: 'S',
    minScore: 4.5,
    description: {
      ko: '전문 번역, 출판, 공식 문서',
      en: 'Professional translation, publishing, official documents',
    },
  },
  {
    grade: 'A',
    minScore: 4.0,
    description: {
      ko: '비즈니스, 마케팅, 고품질 콘텐츠',
      en: 'Business, marketing, high-quality content',
    },
  },
  {
    grade: 'B',
    minScore: 3.5,
    description: { ko: '일반 사용, 내부 커뮤니케이션', en: 'General use, internal communication' },
  },
  {
    grade: 'C',
    minScore: 3.0,
    description: { ko: '참고용, 초안 작성', en: 'Reference, draft writing' },
  },
  {
    grade: 'D',
    minScore: 0,
    description: { ko: '사용 비권장, 개선 필요', en: 'Not recommended, needs improvement' },
  },
];
