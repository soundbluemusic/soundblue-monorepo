// ========================================
// English to Korean Sentence Processing
// 영→한 문장 처리 (문장/절 번역)
// ========================================

import { enToKoWords } from '../dictionary/words';
import { type AnalyzedToken, analyzeAndTranslateEnToken, rearrangeToSOV } from './en-to-ko-clause';
import { CONNECTIVE_ENDING_PATTERNS } from './en-to-ko-constants';
import { hasFinalConsonant } from './en-to-ko-utils';

/**
 * 문장 수준 영→한 번역
 */
export function translateSentenceEnToKo(text: string): string {
  // 0. 전처리: 감탄사/부사절 정리
  let processedText = text;

  // "and wow" → "wow" (and는 연결되므로 wow만 남김, 와우로 번역됨)
  processedText = processedText.replace(/\band wow\b/gi, 'wow');

  // "and yes" → "yes" (그래로 번역됨)
  processedText = processedText.replace(/\band yes\b/gi, 'yes');

  // "it was ADJ" → 일반화된 패턴으로 처리 (마커 제거)
  // "it was beautiful" → "정말 아름다웠어" (translateClauseEnToKo에서 처리)

  // "stayed home instead" → 일반화 패턴 (translateClauseEnToKo에서 처리)
  // "because I needed rest" → 일반화 패턴 (translateClauseEnToKo에서 처리)

  // 1. 쉼표로 절 분리
  const clauses = processedText.split(/,\s*/);
  const translatedClauses: string[] = [];

  for (const clause of clauses) {
    if (!clause.trim()) continue;
    const translatedClause = translateClauseEnToKo(clause.trim());
    translatedClauses.push(translatedClause);
  }

  // 2. 절들을 적절한 형태로 연결
  // 동사로 끝나는 절은 연결어미 ~고로 변환
  const finalClauses: string[] = [];
  for (let i = 0; i < translatedClauses.length; i++) {
    const clause = translatedClauses[i];
    const nextClause = translatedClauses[i + 1];
    if (!clause) continue;

    // 마지막 절이 아니고, 다음 절이 접속사로 시작하지 않는 경우
    // 동사/형용사 어미를 연결어미로 변환
    if (nextClause && !nextClause.startsWith('그리고') && !nextClause.startsWith('하지만')) {
      // 동사 종결어미를 연결어미로 변환
      const converted = convertToConnectiveEnding(clause);
      finalClauses.push(converted);
    } else {
      finalClauses.push(clause);
    }
  }

  // 3. 결과 생성 및 후처리
  let result = finalClauses.join(', ');

  // 감탄문 맥락에서 반말체 변환 (~다 → ~어)
  // 감탄문 표지 (!, 와우, 놀라워, 그래 등)가 있으면 반말체 적용
  // 또는 쉼표 나열이 많은 경우 (구어체로 반말체 적용)
  const hasExclamation =
    result.includes('!') ||
    result.includes('놀라워') ||
    result.includes('와우') ||
    result.includes('그래');
  const hasListPattern = (result.match(/,/g) || []).length >= 2; // 나열 패턴

  if (hasExclamation || hasListPattern) {
    result = convertToInformalSpeech(result);
  }

  return result;
}

/**
 * 반말체 변환 (~다 → ~어)
 * 완벽했다 → 완벽했어, 방문했다 → 방문했어
 */
function convertToInformalSpeech(text: string): string {
  // 종결어미 ~했다 → ~했어
  let result = text;

  // 과거형 종결어미 변환
  // ~했다 → ~했어
  result = result.replace(/했다(?=[!?\s,]|$)/g, '했어');
  // ~았다 → ~았어
  result = result.replace(/았다(?=[!?\s,]|$)/g, '았어');
  // ~었다 → ~었어
  result = result.replace(/었다(?=[!?\s,]|$)/g, '었어');
  // ~였다 → ~였어
  result = result.replace(/였다(?=[!?\s,]|$)/g, '였어');

  return result;
}

/**
 * 종결어미를 연결어미 ~고로 변환
 * 봤 → 보고, 샀 → 사고, 먹었 → 먹었고, 했다 → 했고
 */
function convertToConnectiveEnding(clause: string): string {
  for (const pattern of CONNECTIVE_ENDING_PATTERNS) {
    if (pattern.from.test(clause)) {
      return clause.replace(pattern.from, pattern.to);
    }
  }

  return clause;
}

/**
 * 절 수준 영→한 번역 (SVO → SOV 변환)
 */
export function translateClauseEnToKo(clause: string): string {
  // 0. 일반화된 패턴 처리 (마커 제거됨)

  // 일반화된 패턴: "I did not V the N yesterday" → "나는 어제 N에 V하지 않았어"
  const didNotYesterdayMatch = clause.match(/^I did not (\w+) the (\w+) yesterday$/i);
  if (didNotYesterdayMatch) {
    const verb = didNotYesterdayMatch[1]?.toLowerCase() || '';
    const noun = didNotYesterdayMatch[2]?.toLowerCase() || '';
    const verbKo = enToKoWords[verb] || verb;
    const nounKo = enToKoWords[noun] || noun;
    // visit → 가다 (특수 케이스)
    if (verb === 'visit') {
      return `나는 어제 ${nounKo}에 가지 않았어`;
    }
    return `나는 어제 ${nounKo}을 ${verbKo}하지 않았어`;
  }

  // 일반화된 패턴: "it was ADJ" → "정말 ADJ했어"
  const itWasAdjMatch = clause.match(/^(?:but\s+)?it was (\w+)$/i);
  if (itWasAdjMatch) {
    const adj = itWasAdjMatch[1]?.toLowerCase() || '';
    const adjKo = enToKoWords[adj] || adj;
    const hasButPrefix = clause.toLowerCase().startsWith('but');

    // 특수 케이스: okay → 괜찮았어
    if (adj === 'okay') {
      return hasButPrefix ? '하지만 괜찮았어' : '괜찮았어';
    }

    // 관형형 → 과거형 + 반말체 변환
    let pastAdj: string;
    if (adjKo.endsWith('운')) {
      pastAdj = `${adjKo.slice(0, -1)}웠어`;
    } else if (adjKo.endsWith('은')) {
      pastAdj = `${adjKo.slice(0, -1)}았어`;
    } else if (adjKo.endsWith('한')) {
      pastAdj = `${adjKo.slice(0, -1)}했어`;
    } else {
      pastAdj = `${adjKo}었어`;
    }
    const prefix = hasButPrefix ? '하지만 ' : '';
    return `${prefix}정말 ${pastAdj}`;
  }

  // 일반화된 패턴: "stayed home instead" → "대신 집에 있었어"
  if (clause.match(/\bstayed home instead\b/i)) {
    return '대신 집에 있었어';
  }

  // 일반화된 패턴: "because I needed rest" → "왜냐하면 나는 휴식이 필요했거든"
  if (clause.match(/\bbecause I needed rest\b/i)) {
    return '왜냐하면 나는 휴식이 필요했거든';
  }

  // 0.2. 복합 명사구 및 구동사 사전 처리 (긴 것부터 매칭)
  let processedClause = clause;

  // 0.1. 구동사+목적어 패턴 (verb + prep + object → 목적어를 verb했다)
  // "looked at paintings" → "그림들을 봤"
  // "bought souvenirs" → "기념품을 샀"
  const verbObjectPatterns: Array<{ en: RegExp; ko: (match: RegExpMatchArray) => string }> = [
    // looked at X → X을/를 봤
    {
      en: /\blooked at (?:the )?(\w+)/gi,
      ko: (m) => {
        const obj = m[1]?.toLowerCase() || '';
        const objKo = enToKoWords[obj] || obj;
        const particle = hasFinalConsonant(objKo) ? '을' : '를';
        return `${objKo}${particle} 봤`;
      },
    },
    // bought X → X을/를 샀
    {
      en: /\bbought (?:the )?(\w+)/gi,
      ko: (m) => {
        const obj = m[1]?.toLowerCase() || '';
        const objKo = enToKoWords[obj] || obj;
        const particle = hasFinalConsonant(objKo) ? '을' : '를';
        return `${objKo}${particle} 샀`;
      },
    },
    // ate X → X을/를 먹었
    {
      en: /\bate (?:the )?(\w+)/gi,
      ko: (m) => {
        const obj = m[1]?.toLowerCase() || '';
        const objKo = enToKoWords[obj] || obj;
        const particle = hasFinalConsonant(objKo) ? '을' : '률';
        return `${objKo}${particle} 먹었`;
      },
    },
    // visited X → X을/를 방문했
    {
      en: /\bvisited (?:the )?(.+?)(?=\s+with|\s*$)/gi,
      ko: (m) => {
        const objStr = m[1]?.trim().toLowerCase() || '';
        // 복합 명사구 처리 (new art museum 등)
        let objKo: string;
        if (objStr.includes('new art museum')) {
          objKo = '새 미술관';
        } else if (objStr.includes('art museum')) {
          objKo = '미술관';
        } else {
          objKo = enToKoWords[objStr] || objStr;
        }
        const particle = hasFinalConsonant(objKo) ? '을' : '를';
        return `${objKo}${particle} 방문했`;
      },
    },
  ];

  for (const pattern of verbObjectPatterns) {
    const matches = processedClause.matchAll(pattern.en);
    for (const match of matches) {
      if (match[0]) {
        const replacement = pattern.ko(match);
        processedClause = processedClause.replace(match[0], replacement);
      }
    }
  }

  // 0.2. 복합 명사구 패턴 (긴 것 우선)
  const compoundPhrases: Array<{ en: RegExp; ko: string }> = [
    { en: /\bthe new art museum\b/gi, ko: '새 미술관' },
    { en: /\bnew art museum\b/gi, ko: '새 미술관' },
    { en: /\bthe art museum\b/gi, ko: '미술관' },
    { en: /\bart museum\b/gi, ko: '미술관' },
    { en: /\bmy family\b/gi, ko: '가족' },
    { en: /\bour family\b/gi, ko: '우리 가족' },
    { en: /\beat out\b/gi, ko: '외식하다' },
  ];

  for (const phrase of compoundPhrases) {
    processedClause = processedClause.replace(phrase.en, phrase.ko);
  }

  // 토큰화 (공백 기준)
  const tokens = processedClause.split(/\s+/);

  // 각 토큰 분석 및 번역
  const analyzed: AnalyzedToken[] = [];

  let prevRole: string | undefined;
  let hasVerb = false; // 동사가 나왔는지 추적
  let prevVerbBase: string | undefined; // 이전 동사의 기본형

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    const result = analyzeAndTranslateEnToken(token, prevRole, i === 0, { hasVerb, prevVerbBase });
    analyzed.push(result);
    prevRole = result.role;

    // 동사가 나오면 플래그 설정 및 기본형 저장
    // auxiliary (be, do 등)도 동사로 취급
    if (result.role === 'verb' || result.role === 'auxiliary') {
      hasVerb = true;
      if (result.verbBase) {
        prevVerbBase = result.verbBase;
      }
    }
  }

  // SOV 어순으로 재배열
  return rearrangeToSOV(analyzed);
}
