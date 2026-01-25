/**
 * Korean Spell Checker Engine
 * 한국어 맞춤법 검사 엔진
 *
 * 번역기(@soundblue/translator)의 correction 모듈을 재사용하여
 * 띄어쓰기, 오타, 문법 검사를 수행합니다.
 */

import { hasBatchim } from '@soundblue/hangul';
import { applyCorrections } from '@soundblue/text-processor';
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
        const suggestion = `${prevChar}${pair.withoutBatchim}`;
        errors.push({
          type: 'grammar',
          start,
          end,
          original: match[0],
          suggestions: [suggestion],
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
        const suggestion = `${prevChar}${pair.withBatchim}`;
        errors.push({
          type: 'grammar',
          start,
          end,
          original: match[0],
          suggestions: [suggestion],
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
 * 띄어쓰기 차이점을 찾는 정밀 diff 알고리즘
 *
 * 원본과 수정본의 공백 위치를 비교하여 실제로 변경된 부분만 반환합니다.
 * - 공백이 추가된 위치: 붙어있던 단어 사이에 공백 삽입
 * - 공백이 제거된 위치: 떨어져있던 단어 사이의 공백 제거
 */
function findSpacingDifferences(
  original: string,
  corrected: string,
): Array<{
  start: number;
  end: number;
  originalText: string;
  correctedText: string;
  type: 'insert' | 'remove';
}> {
  const differences: Array<{
    start: number;
    end: number;
    originalText: string;
    correctedText: string;
    type: 'insert' | 'remove';
  }> = [];

  // 공백을 제외한 문자만 추출하여 두 문자열이 같은지 확인
  const originalChars = original.replace(/\s/g, '');
  const correctedChars = corrected.replace(/\s/g, '');

  // 공백 외 문자가 다르면 띄어쓰기 에러가 아님
  if (originalChars !== correctedChars) {
    return differences;
  }

  // 원본 문자열의 각 위치에서 공백 다음 문자까지의 정보 수집
  let origIdx = 0;
  let corrIdx = 0;

  while (origIdx < original.length && corrIdx < corrected.length) {
    const origChar = original[origIdx];
    const corrChar = corrected[corrIdx];

    // 둘 다 공백이 아닌 문자인 경우 - 동기화 포인트
    if (origChar !== ' ' && corrChar !== ' ') {
      origIdx++;
      corrIdx++;
      continue;
    }

    // 원본에 공백이 있고 수정본에 없음 - 공백 제거 필요
    if (origChar === ' ' && corrChar !== ' ') {
      // 연속된 공백 처리
      let spaceEnd = origIdx;
      while (spaceEnd < original.length && original[spaceEnd] === ' ') {
        spaceEnd++;
      }

      // 공백 앞뒤 단어 찾기
      let wordStart = origIdx - 1;
      while (wordStart > 0 && original[wordStart - 1] !== ' ') {
        wordStart--;
      }
      let wordEnd = spaceEnd;
      while (wordEnd < original.length && original[wordEnd] !== ' ') {
        wordEnd++;
      }

      const originalText = original.slice(wordStart, wordEnd);
      const correctedText = originalText.replace(/\s+/g, '');

      differences.push({
        start: wordStart,
        end: wordEnd,
        originalText,
        correctedText,
        type: 'remove',
      });

      origIdx = spaceEnd;
      continue;
    }

    // 원본에 공백이 없고 수정본에 있음 - 공백 삽입 필요
    if (origChar !== ' ' && corrChar === ' ') {
      // 수정본의 연속된 공백 건너뛰기
      let spaceEnd = corrIdx;
      while (spaceEnd < corrected.length && corrected[spaceEnd] === ' ') {
        spaceEnd++;
      }

      // 원본에서 공백이 삽입되어야 할 위치 앞뒤 단어 찾기
      let wordStart = origIdx - 1;
      while (wordStart > 0 && original[wordStart - 1] !== ' ') {
        wordStart--;
      }
      let wordEnd = origIdx;
      while (wordEnd < original.length && original[wordEnd] !== ' ') {
        wordEnd++;
      }

      const originalText = original.slice(wordStart, wordEnd);
      // 수정본에서 해당 부분 찾기
      const corrWordStart = corrIdx - (origIdx - wordStart);
      const correctedText = corrected.slice(corrWordStart, corrWordStart + originalText.length + 1);

      differences.push({
        start: wordStart,
        end: wordEnd,
        originalText,
        correctedText:
          correctedText.trim() !== originalText
            ? correctedText
            : originalText.slice(0, origIdx - wordStart) +
              ' ' +
              originalText.slice(origIdx - wordStart),
        type: 'insert',
      });

      corrIdx = spaceEnd;
      continue;
    }

    // 둘 다 공백
    origIdx++;
    corrIdx++;
  }

  // 중복 제거 및 정렬
  const uniqueDiffs = differences.filter(
    (diff, index, self) =>
      index === self.findIndex((d) => d.start === diff.start && d.end === diff.end),
  );

  return uniqueDiffs.sort((a, b) => a.start - b.start);
}

/**
 * 띄어쓰기 에러를 SpellError 형식으로 변환
 *
 * 정밀 diff 알고리즘을 사용하여 실제로 띄어쓰기가 변경된 위치만 에러로 표시합니다.
 */
function convertSpacingErrors(original: string, corrected: string): SpellError[] {
  const errors: SpellError[] = [];

  if (original === corrected) return errors;

  const differences = findSpacingDifferences(original, corrected);

  // 정밀 diff 결과가 있으면 개별 에러로 반환
  if (differences.length > 0) {
    for (const diff of differences) {
      const message =
        diff.type === 'insert'
          ? `'${diff.originalText}'에 띄어쓰기가 필요합니다`
          : `'${diff.originalText}'의 띄어쓰기를 제거해야 합니다`;

      errors.push({
        type: 'spacing',
        start: diff.start,
        end: diff.end,
        original: diff.originalText,
        suggestions: [diff.correctedText],
        message,
        confidence: 0.9,
      });
    }
    return errors;
  }

  // 정밀 diff가 작동하지 않는 경우 전체 에러로 폴백
  errors.push({
    type: 'spacing',
    start: 0,
    end: original.length,
    original,
    suggestions: [corrected],
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
          suggestions: [correction.corrected],
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
          suggestions: [correction.corrected],
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
    // 문법 에러가 있으면 수정 적용 (applyCorrections 사용)
    if (grammarErrors.length > 0) {
      corrected = applyCorrections(corrected, grammarErrors);
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
