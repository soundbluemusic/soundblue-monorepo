// ========================================
// Negation Handler - 부정문 처리
// ========================================
// 양방향 통합: ko-en, en-ko 모두 처리
// 기존: handleNegationKoEn + handleNegationEnKo

import { registerHandler } from '../pipeline';
import type { TranslationContext, TranslationDirection } from '../types';

// ========================================
// 부정문 관련 상수
// ========================================

/** 동사 어간 (한→영) */
const VERB_KO_TO_EN: Record<string, string> = {
  먹: 'eat',
  가: 'go',
  오: 'come',
  하: 'do',
  보: 'see',
  듣: 'hear',
  자: 'sleep',
  달리: 'run',
  쓰: 'write',
  읽: 'read',
  말하: 'speak',
  공부하: 'study',
  일어나: 'wake up',
  걷: 'walk',
};

/** 동사 원형 (영→한) */
const VERB_EN_TO_KO: Record<string, string> = {
  eat: '먹',
  go: '가',
  come: '오',
  do: '하',
  see: '보',
  hear: '듣',
  sleep: '자',
  run: '달리',
  write: '쓰',
  read: '읽',
  speak: '말하',
  study: '공부하',
};

/** 주어 매핑 (한→영) */
const SUBJECT_KO_TO_EN: Record<string, { en: string; third: boolean }> = {
  그는: { en: 'He', third: true },
  그녀는: { en: 'She', third: true },
  그것은: { en: 'It', third: true },
  나는: { en: 'I', third: false },
  너는: { en: 'You', third: false },
  우리는: { en: 'We', third: false },
  그들은: { en: 'They', third: false },
};

/** 주어 매핑 (영→한) */
const SUBJECT_EN_TO_KO: Record<string, string> = {
  he: '그는',
  she: '그녀는',
  it: '그것은',
  i: '나는',
  you: '너는',
  we: '우리는',
  they: '그들은',
};

// ========================================
// 유틸리티 함수
// ========================================

/** 영어 현재분사 얻기 */
function getPresentParticiple(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee')) {
    return `${verb.slice(0, -1)}ing`;
  }
  if (verb.endsWith('ie')) {
    return `${verb.slice(0, -2)}ying`;
  }
  // 단모음+단자음 → 자음 중복
  if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxyz]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }
  return `${verb}ing`;
}

// ========================================
// 핸들러
// ========================================

/**
 * 부정문 패턴 처리 (양방향)
 *
 * ko-en: "안 먹는다" → "don't eat"
 * en-ko: "don't eat" → "안 먹는다"
 */
export function handleNegation(
  text: string,
  direction: TranslationDirection,
  _context?: TranslationContext,
): string | null {
  if (direction === 'ko-en') {
    return handleNegationKoEn(text);
  }
  return handleNegationEnKo(text);
}

/**
 * ko-en: 한국어 부정문 → 영어
 */
function handleNegationKoEn(text: string): string | null {
  // 주어 목록 패턴
  const subjectPattern = '(그는|그녀는|그것은|나는|너는|우리는|그들은)?';

  // 패턴 1: (주어) 안 + 동사 + 는다/ㄴ다 (현재 부정)
  const presentNegPattern = text.match(new RegExp(`^${subjectPattern}\\s*안\\s*(.+?)(는다|ㄴ다)$`));
  if (presentNegPattern) {
    const [, subjectKo, verbStem] = presentNegPattern;
    const enVerb = VERB_KO_TO_EN[verbStem];
    if (enVerb) {
      if (subjectKo) {
        const subj = SUBJECT_KO_TO_EN[subjectKo];
        if (subj) {
          return subj.third ? `${subj.en} doesn't ${enVerb}` : `${subj.en} don't ${enVerb}`;
        }
      }
      return `don't ${enVerb}`;
    }
  }

  // 패턴 2: (주어) 안 + 동사 + 었다/았다 (과거 부정)
  const pastNegPattern = text.match(new RegExp(`^${subjectPattern}\\s*안\\s*(.+?)(었다|았다)$`));
  if (pastNegPattern) {
    const [, subjectKo, verbStem] = pastNegPattern;
    const enVerb = VERB_KO_TO_EN[verbStem];
    if (enVerb) {
      if (subjectKo) {
        const subj = SUBJECT_KO_TO_EN[subjectKo];
        if (subj) {
          return `${subj.en} didn't ${enVerb}`;
        }
      }
      return `didn't ${enVerb}`;
    }
  }

  // 패턴 3: (주어) 안 + 동사 + 을/ㄹ 거야 (미래 부정)
  const futureNegPattern = text.match(
    new RegExp(`^${subjectPattern}\\s*안\\s*(.+?)([을를]?\\s*거야|ㄹ\\s*거야)$`),
  );
  if (futureNegPattern) {
    const [, subjectKo, verbStem] = futureNegPattern;
    const cleanStem = verbStem.replace(/[을를]$/, '');
    const enVerb = VERB_KO_TO_EN[cleanStem];
    if (enVerb) {
      if (subjectKo) {
        const subj = SUBJECT_KO_TO_EN[subjectKo];
        if (subj) {
          return `${subj.en} won't ${enVerb}`;
        }
      }
      return `won't ${enVerb}`;
    }
  }

  // 패턴 4: (주어) 안 + 동사 + 고 있다 (진행형 부정)
  const progressiveNegPattern = text.match(
    new RegExp(`^${subjectPattern}\\s*안\\s*(.+?)고\\s*있다$`),
  );
  if (progressiveNegPattern) {
    const [, subjectKo, verbStem] = progressiveNegPattern;
    const enVerb = VERB_KO_TO_EN[verbStem];
    if (enVerb) {
      const ingVerb = getPresentParticiple(enVerb);
      if (subjectKo) {
        const subj = SUBJECT_KO_TO_EN[subjectKo];
        if (subj) {
          // am/is/are 선택
          const beVerb = subj.third ? 'is' : subj.en === 'I' ? 'am' : 'are';
          return `${subj.en} ${beVerb} not ${ingVerb}`;
        }
      }
      return `am not ${ingVerb}`;
    }
  }

  return null;
}

/**
 * en-ko: 영어 부정문 → 한국어
 */
function handleNegationEnKo(text: string): string | null {
  const lowerText = text.toLowerCase();

  // 주어 목록 패턴
  const subjectPattern = '(he|she|it|i|you|we|they)?';

  // 패턴 1: (Subject) don't/doesn't + verb (현재 부정)
  const presentNegPattern = lowerText.match(
    new RegExp(`^${subjectPattern}\\s*(don't|doesn't)\\s+(\\w+)$`),
  );
  if (presentNegPattern) {
    const [, subjectEn, , verb] = presentNegPattern;
    const koVerb = VERB_EN_TO_KO[verb];
    if (koVerb) {
      if (subjectEn) {
        const koSubject = SUBJECT_EN_TO_KO[subjectEn];
        return `${koSubject} 안 ${koVerb}는다`;
      }
      return `안 ${koVerb}는다`;
    }
  }

  // 패턴 2: (Subject) didn't + verb (과거 부정)
  const pastNegPattern = lowerText.match(new RegExp(`^${subjectPattern}\\s*didn't\\s+(\\w+)$`));
  if (pastNegPattern) {
    const [, subjectEn, verb] = pastNegPattern;
    const koVerb = VERB_EN_TO_KO[verb];
    if (koVerb) {
      if (subjectEn) {
        const koSubject = SUBJECT_EN_TO_KO[subjectEn];
        return `${koSubject} 안 ${koVerb}었다`;
      }
      return `안 ${koVerb}었다`;
    }
  }

  // 패턴 3: (Subject) won't + verb (미래 부정)
  const futureNegPattern = lowerText.match(new RegExp(`^${subjectPattern}\\s*won't\\s+(\\w+)$`));
  if (futureNegPattern) {
    const [, subjectEn, verb] = futureNegPattern;
    const koVerb = VERB_EN_TO_KO[verb];
    if (koVerb) {
      if (subjectEn) {
        const koSubject = SUBJECT_EN_TO_KO[subjectEn];
        return `${koSubject} 안 ${koVerb}을 거야`;
      }
      return `안 ${koVerb}을 거야`;
    }
  }

  // 패턴 4: (Subject) am/is/are not + verb-ing (진행형 부정)
  const progressiveNegPattern = lowerText.match(
    new RegExp(`^${subjectPattern}\\s*(am|is|are)\\s+not\\s+(\\w+)ing$`),
  );
  if (progressiveNegPattern) {
    const [, subjectEn, , verbBase] = progressiveNegPattern;
    const koVerb = VERB_EN_TO_KO[verbBase];
    if (koVerb) {
      if (subjectEn) {
        const koSubject = SUBJECT_EN_TO_KO[subjectEn];
        return `${koSubject} 안 ${koVerb}고 있다`;
      }
      return `안 ${koVerb}고 있다`;
    }
  }

  return null;
}

// ========================================
// 핸들러 등록
// ========================================

registerHandler({
  name: 'negation',
  priority: 70, // 부정문
  fn: handleNegation,
});
