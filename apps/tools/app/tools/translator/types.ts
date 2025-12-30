// ========================================
// Translator Types - 번역기 타입 정의
// ========================================

export type TranslationDirection = 'ko-en' | 'en-ko';

export interface ParticleInfo {
  role: 'topic' | 'subject' | 'object' | 'location' | 'direction' | 'conjunction' | 'possessive';
  en: string;
}

export interface EndingInfo {
  tense: 'past' | 'present' | 'future';
  formality: 'formal' | 'polite' | 'casual' | 'plain';
  question?: boolean;
  mood?: 'declarative' | 'interrogative' | 'imperative' | 'propositive';
}

export interface Token {
  text: string;
  type: 'word' | 'stem' | 'particle' | 'ending' | 'copula';
  translated?: string;
  role?: string;
}

export interface PatternEntry {
  ko: RegExp;
  en: string;
  /** 질문일 때만 매칭 */
  questionOnly?: boolean;
}

export interface TranslatorDictionary {
  sentences: Record<string, string>;
  patterns: PatternEntry[];
  words: Record<string, string>;
  morphemes: {
    particles: Record<string, ParticleInfo>;
    endings: Record<string, EndingInfo>;
  };
}

// ========================================
// Pipeline Types - 파이프라인 타입 정의
// ========================================

/**
 * 번역 핸들러 함수 타입
 * - null 반환 시 다음 핸들러로 넘어감
 * - string 반환 시 해당 결과로 번역 완료
 */
export type TranslationHandler = (
  text: string,
  direction: TranslationDirection,
  context?: TranslationContext,
) => string | null;

/**
 * 파이프라인 핸들러 정의
 */
export interface PipelineHandler {
  /** 핸들러 이름 (디버깅용) */
  name: string;
  /** 핸들러 함수 */
  fn: TranslationHandler;
  /** 우선순위 (높을수록 먼저 실행) */
  priority: number;
  /** 활성화 여부 */
  enabled?: boolean;
}

/**
 * 번역 컨텍스트 (추가 정보)
 */
export interface TranslationContext {
  /** 의문문 여부 */
  isQuestion?: boolean;
  /** 원본 텍스트 (정규화 전) */
  originalText?: string;
  /** 이전 문장 (문맥용) */
  previousSentence?: string;
}
