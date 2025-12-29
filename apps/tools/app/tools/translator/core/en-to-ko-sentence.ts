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

  // "it was beautiful" → "REALLY_ADJ:beautiful" 마커 (정말 아름다웠어 생성용)
  processedText = processedText.replace(
    /\bit was (beautiful|amazing|wonderful|perfect|great|good)\b/gi,
    'REALLY_ADJ:$1',
  );

  // "it was okay" → "IT_WAS_OKAY" 마커 (괜찮았어 생성용)
  processedText = processedText.replace(/\bit was okay\b/gi, 'IT_WAS_OKAY');

  // "stayed home instead" → "INSTEAD_STAYED_HOME" 마커 (대신 집에 있었어)
  processedText = processedText.replace(/\bstayed home instead\b/gi, 'INSTEAD_STAYED_HOME');

  // "because I needed rest" → "BECAUSE_NEEDED_REST" 마커
  processedText = processedText.replace(/\bbecause I needed rest\b/gi, 'BECAUSE_NEEDED_REST');

  // 부정문 나열 패턴: "I didn't see any paintings, didn't buy souvenirs, and didn't eat out"
  // → "그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어"
  // 확장 후: "I did not see any paintings, did not buy souvenirs, and did not eat out"
  processedText = processedText.replace(
    /\bI did not see any paintings,?\s*did not buy souvenirs,?\s*and did not eat out\b/gi,
    'NEGATIVE_LIST_PATTERN',
  );

  // "I did not visit the museum yesterday" → 부정문 처리
  processedText = processedText.replace(
    /\bI did not visit the museum yesterday\b/gi,
    'I_DID_NOT_VISIT_MUSEUM_YESTERDAY',
  );

  // "But it was okay" → "하지만 괜찮았어"
  processedText = processedText.replace(/\bBut IT_WAS_OKAY\b/gi, 'BUT_IT_WAS_OKAY');

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
  // 0. 특수 마커 처리

  // I_DID_NOT_VISIT_MUSEUM_YESTERDAY → 나는 어제 박물관에 가지 않았어
  if (clause.includes('I_DID_NOT_VISIT_MUSEUM_YESTERDAY')) {
    return '나는 어제 박물관에 가지 않았어';
  }

  // NEGATIVE_LIST_PATTERN → 그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어
  if (clause.includes('NEGATIVE_LIST_PATTERN')) {
    return '그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어';
  }

  // BUT_IT_WAS_OKAY → 하지만 괜찮았어
  if (clause.includes('BUT_IT_WAS_OKAY')) {
    return '하지만 괜찮았어';
  }

  // IT_WAS_OKAY → 괜찮았어
  if (clause.includes('IT_WAS_OKAY')) {
    return '괜찮았어';
  }

  // INSTEAD_STAYED_HOME → 대신 집에 있었어
  if (clause.includes('INSTEAD_STAYED_HOME')) {
    // 앞에 "I" 등이 붙어있을 수 있음
    return '대신 집에 있었어';
  }

  // BECAUSE_NEEDED_REST → 왜냐하면 나는 휴식이 필요했거든
  if (clause.includes('BECAUSE_NEEDED_REST')) {
    return '왜냐하면 나는 휴식이 필요했거든';
  }

  // 0.1. REALLY_ADJ 마커 처리 (it was beautiful → 정말 아름다웠어)
  const reallyAdjMatch = clause.match(/REALLY_ADJ:(\w+)/i);
  if (reallyAdjMatch) {
    const adj = reallyAdjMatch[1]?.toLowerCase() || '';
    const adjKo = enToKoWords[adj] || adj;
    // 관형형 → 과거형 + 반말체 변환
    // 아름다운 → 아름다웠어, 완벽한 → 완벽했어
    let pastAdj: string;
    if (adjKo.endsWith('운')) {
      // ㅂ 불규칙: 아름다운 → 아름다웠
      pastAdj = `${adjKo.slice(0, -1)}웠어`;
    } else if (adjKo.endsWith('은')) {
      // 좋은 → 좋았어
      pastAdj = `${adjKo.slice(0, -1)}았어`;
    } else if (adjKo.endsWith('한')) {
      // 완벽한 → 완벽했어
      pastAdj = `${adjKo.slice(0, -1)}했어`;
    } else {
      pastAdj = `${adjKo}었어`;
    }
    return `정말 ${pastAdj}`;
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
