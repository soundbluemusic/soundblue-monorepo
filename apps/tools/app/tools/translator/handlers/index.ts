// ========================================
// Handlers Index - 핸들러 모음
// ========================================
// 각 핸들러는 양방향(ko-en, en-ko) 통합하여 구현
// Phase 2에서 순차적으로 추가 예정

// Phase 2-3: 부정문 핸들러
export { handleNegation } from './negation';
// Phase 2-2: 시제 핸들러
export { handleTense } from './tense';

// Phase 2-4: 비교급 핸들러
// export { handleComparative } from './comparative';

// Phase 2-5: 수동태 핸들러
// export { handlePassive } from './passive';

// Phase 2-2: 숫자+분류사 핸들러
export { handleCounter } from './counter';

// Phase 2-7: 의문문 핸들러
// export { handleQuestion } from './question';

// Phase 2-9: 문법 분석 (폴백) 핸들러
export { handleGrammar } from './grammar';
// Phase 2-3: 관용어 핸들러
export { handleIdiom } from './idiom';
