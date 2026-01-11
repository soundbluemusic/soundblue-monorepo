/**
 * Korean Spell Checker Engine
 * 한국어 맞춤법 검사 엔진
 *
 * 번역기(@soundblue/translator)의 correction 모듈을 재사용하여
 * 띄어쓰기, 오타, 문법 검사를 수행합니다.
 */

import { hasBatchim } from '@soundblue/hangul';
import { type CorrectionResult, correctSpacing, correctTypos } from '@soundblue/translator';
import type { SpellCheckOptions, SpellCheckResult, SpellError } from '../types';

/**
 * 조사 호응 검사 (받침 유무에 따른 조사 선택)
 */
function checkParticleAgreement(text: string): SpellError[] {
  const errors: SpellError[] = [];

  // 받침 유무에 따른 조사 쌍
  const particlePairs: Array<{
    withBatchim: string;
    withoutBatchim: string;
    description: string;
  }> = [
    { withBatchim: '을', withoutBatchim: '를', description: '목적격 조사' },
    { withBatchim: '이', withoutBatchim: '가', description: '주격 조사' },
    { withBatchim: '은', withoutBatchim: '는', description: '보조사' },
    { withBatchim: '과', withoutBatchim: '와', description: '접속조사' },
    { withBatchim: '으로', withoutBatchim: '로', description: '방향/도구 조사' },
    { withBatchim: '이랑', withoutBatchim: '랑', description: '접속조사' },
  ];

  for (const pair of particlePairs) {
    // 잘못된 조사 사용 패턴 검사
    // 예: "사과을" (받침 없는데 '을' 사용) → "사과를"
    // 예: "밥를" (받침 있는데 '를' 사용) → "밥을"

    // 받침 없는 글자 + 받침용 조사
    const wrongWithBatchimRegex = new RegExp(`([가-힣])${pair.withBatchim}(?=\\s|$|[.!?,])`, 'g');
    let match: RegExpExecArray | null = wrongWithBatchimRegex.exec(text);

    while (match !== null) {
      const prevChar = match[1];
      if (!hasBatchim(prevChar)) {
        // 받침이 없는데 받침용 조사 사용 → 에러
        const start = match.index;
        const end = start + match[0].length;
        errors.push({
          type: 'grammar',
          start,
          end,
          original: match[0],
          suggestion: `${prevChar}${pair.withoutBatchim}`,
          message: `'${prevChar}'는 받침이 없으므로 '${pair.withoutBatchim}'를 사용해야 합니다 (${pair.description})`,
          confidence: 0.95,
        });
      }
      match = wrongWithBatchimRegex.exec(text);
    }

    // 받침 있는 글자 + 받침 없는용 조사
    const wrongWithoutBatchimRegex = new RegExp(
      `([가-힣])${pair.withoutBatchim}(?=\\s|$|[.!?,])`,
      'g',
    );
    match = wrongWithoutBatchimRegex.exec(text);

    while (match !== null) {
      const prevChar = match[1];
      // 'ㄹ' 받침 + '로'는 정상 (으로가 아님)
      if (pair.withoutBatchim === '로' && hasBatchim(prevChar)) {
        const code = prevChar.charCodeAt(0) - 0xac00;
        const jong = code % 28;
        if (jong === 8) {
          match = wrongWithoutBatchimRegex.exec(text);
          continue; // ㄹ 받침
        }
      }

      if (hasBatchim(prevChar)) {
        // 받침이 있는데 받침 없는용 조사 사용 → 에러
        const start = match.index;
        const end = start + match[0].length;
        errors.push({
          type: 'grammar',
          start,
          end,
          original: match[0],
          suggestion: `${prevChar}${pair.withBatchim}`,
          message: `'${prevChar}'는 받침이 있으므로 '${pair.withBatchim}'를 사용해야 합니다 (${pair.description})`,
          confidence: 0.95,
        });
      }
      match = wrongWithoutBatchimRegex.exec(text);
    }
  }

  return errors;
}

/**
 * 띄어쓰기 에러를 SpellError 형식으로 변환
 */
function convertSpacingErrors(original: string, corrected: string): SpellError[] {
  const errors: SpellError[] = [];

  if (original === corrected) return errors;

  // 간단한 diff: 전체를 하나의 에러로 처리
  // TODO: 더 정밀한 diff 알고리즘 적용
  errors.push({
    type: 'spacing',
    start: 0,
    end: original.length,
    original,
    suggestion: corrected,
    message: '띄어쓰기를 수정해야 합니다',
    confidence: 0.9,
  });

  return errors;
}

/**
 * 오타 교정 결과를 SpellError 형식으로 변환
 */
function convertTypoErrors(result: CorrectionResult): SpellError[] {
  const errors: SpellError[] = [];

  for (const correction of result.corrections) {
    if (correction.type === 'common_typo') {
      // 원본 텍스트에서 위치 찾기
      const start = result.original.indexOf(correction.original);
      if (start !== -1) {
        errors.push({
          type: 'typo',
          start,
          end: start + correction.original.length,
          original: correction.original,
          suggestion: correction.corrected,
          message: `'${correction.original}'은(는) '${correction.corrected}'의 오타입니다`,
          confidence: correction.confidence,
        });
      }
    } else if (correction.type === 'similar_word') {
      const start = result.original.indexOf(correction.original);
      if (start !== -1) {
        errors.push({
          type: 'typo',
          start,
          end: start + correction.original.length,
          original: correction.original,
          suggestion: correction.corrected,
          message: `'${correction.original}'을(를) '${correction.corrected}'(으)로 수정하시겠습니까?`,
          confidence: correction.confidence,
        });
      }
    }
  }

  return errors;
}

/**
 * 메인 맞춤법 검사 함수
 */
export function checkSpelling(text: string, options: SpellCheckOptions = {}): SpellCheckResult {
  const {
    checkSpacing: doCheckSpacing = true,
    checkTypo: doCheckTypo = true,
    checkGrammar: doCheckGrammar = true,
  } = options;

  const errors: SpellError[] = [];
  let corrected = text;

  // 1. 띄어쓰기 검사
  if (doCheckSpacing) {
    const spacingResult = correctSpacing(text);
    if (spacingResult.corrected !== text) {
      const spacingErrors = convertSpacingErrors(text, spacingResult.corrected);
      errors.push(...spacingErrors);
      corrected = spacingResult.corrected;
    }
  }

  // 2. 오타 검사
  if (doCheckTypo) {
    const typoResult = correctTypos(corrected);
    if (typoResult.corrected !== corrected) {
      const typoErrors = convertTypoErrors(typoResult);
      errors.push(...typoErrors);
      corrected = typoResult.corrected;
    }
  }

  // 3. 문법 검사 (조사 호응)
  if (doCheckGrammar) {
    const grammarErrors = checkParticleAgreement(corrected);
    // 문법 에러가 있으면 수정 적용
    for (const error of grammarErrors) {
      corrected = corrected.slice(0, error.start) + error.suggestion + corrected.slice(error.end);
    }
    errors.push(...grammarErrors);
  }

  // 통계 계산
  const stats = {
    totalErrors: errors.length,
    spacingErrors: errors.filter((e) => e.type === 'spacing').length,
    typoErrors: errors.filter((e) => e.type === 'typo').length,
    grammarErrors: errors.filter((e) => e.type === 'grammar').length,
  };

  return {
    original: text,
    corrected,
    errors,
    stats,
  };
}

/**
 * 단어별 검사 (간단 모드)
 */
export function checkWord(word: string): {
  isCorrect: boolean;
  suggestions: string[];
} {
  const result = checkSpelling(word);
  return {
    isCorrect: result.errors.length === 0,
    suggestions: result.errors.length > 0 ? [result.corrected] : [],
  };
}
