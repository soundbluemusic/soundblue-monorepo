/**
 * 번역기 v2.1 메인 엔트리
 *
 * 파이프라인:
 * 1. clause-parser: 복문을 단순절로 분리 (Phase 7)
 * 2. tokenizer: 토큰화 + confidence 점수
 * 3. generator: 문장 생성
 * 4. validator: 명사 역번역 검증
 *
 * 설계 원칙:
 * 1. 단순함: 절분리 → 토큰화 → 역할부여 → 어순변환 → 검증 → 출력
 * 2. 데이터 분리: 모든 사전/규칙은 data.ts에
 * 3. 확장성: 새 규칙 추가는 data.ts만 수정
 */

import { type ParsedClauses, parseEnglishClauses, parseKoreanClauses } from './clause-parser';
import { EN_KO } from './data';
import { generateEnglish, generateKorean } from './generator';
import { normalizeSpacing } from './spacing-normalizer';
import { parseEnglish, parseKorean } from './tokenizer';
import type { Direction, Formality, ParsedSentence, TranslationResult } from './types';
import { validateWordTranslation } from './validator';

export interface TranslateOptions {
  formality?: Formality;
}

/**
 * 동사를 동명사(-ing)로 변환
 * eat → eating, go → going, run → running
 */
function toGerund(verb: string): string {
  const v = verb.toLowerCase().trim();
  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'being',
    have: 'having',
    die: 'dying',
    lie: 'lying',
    tie: 'tying',
  };
  if (irregulars[v]) return irregulars[v];

  // -e로 끝나면 e 제거 + ing (make → making)
  if (v.endsWith('e') && !v.endsWith('ee') && !v.endsWith('ie')) {
    return v.slice(0, -1) + 'ing';
  }
  // -ie로 끝나면 ie → ying (die → dying)
  if (v.endsWith('ie')) {
    return v.slice(0, -2) + 'ying';
  }
  // CVC 패턴 (run, stop, swim) → 자음 중복 + ing
  if (/^[a-z]*[bcdfghjklmnpqrstvwxz][aeiou][bcdfghjklmnpqrstvwxz]$/.test(v) && v.length <= 4) {
    return v + v.slice(-1) + 'ing';
  }
  return v + 'ing';
}

/**
 * 동사를 부정사 형태(to 없이)로 변환
 * learns → learn, goes → go
 */
function toInfinitive(verb: string): string {
  const v = verb.toLowerCase().trim();
  // 불규칙 동사 - 원형으로
  const irregulars: Record<string, string> = {
    goes: 'go',
    does: 'do',
    has: 'have',
    is: 'be',
    am: 'be',
    are: 'be',
    was: 'be',
    were: 'be',
  };
  if (irregulars[v]) return irregulars[v];

  // -es로 끝나면 (goes, does는 위에서 처리됨)
  if (v.endsWith('ies')) {
    return v.slice(0, -3) + 'y';
  }
  if (v.endsWith('es')) {
    return v.slice(0, -2);
  }
  // -s로 끝나면
  if (v.endsWith('s') && !v.endsWith('ss')) {
    return v.slice(0, -1);
  }
  return v;
}

/**
 * 메인 번역 함수
 */
export function translate(text: string, direction: Direction, options?: TranslateOptions): string {
  const result = translateWithInfo(text, direction, options);
  return result.translated;
}

/**
 * 디버그 정보 포함 번역
 */
export function translateWithInfo(
  text: string,
  direction: Direction,
  options?: TranslateOptions,
): TranslationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translated: '', original: text };
  }

  const formality = options?.formality || 'neutral';

  // Phase 0: 띄어쓰기 정규화 (붙어있는 텍스트 분리)
  const normalized = normalizeSpacing(trimmed, direction);

  // 문장 분리 (?, !, . 기준)
  const sentences = splitSentences(normalized);
  const results: string[] = [];

  for (const { sentence, punctuation } of sentences) {
    let translated: string;
    // 파싱 시 구두점 정보 포함 (의문문 감지용)
    const sentenceWithPunctuation = punctuation ? sentence + punctuation : sentence;

    // Phase 7: 절 분리 시스템
    if (direction === 'ko-en') {
      translated = translateKoreanSentence(sentenceWithPunctuation, formality);
    } else {
      translated = translateEnglishSentence(sentenceWithPunctuation, formality);
    }

    // 구두점 복원 (이미 번역 결과에 포함된 경우 중복 방지)
    // g15: "(formal)" 같은 suffix 뒤에 구두점이 다시 붙지 않도록
    // 번역 결과에 구두점이 이미 포함되어 있으면 추가하지 않음
    if (punctuation && !translated.includes(punctuation)) {
      translated += punctuation;
    }

    results.push(translated);
  }

  return {
    translated: results.join(' '),
    original: text,
  };
}

// ============================================
// Phase 7: 절 기반 번역 시스템
// ============================================

/**
 * 한국어 문장을 절 단위로 분리하여 영어로 번역
 */
function translateKoreanSentence(sentence: string, _formality: Formality): string {
  // ============================================
  // Phase g7/g10/g13: 특수 패턴 전처리 (파싱 전에!)
  // 비교급, 부사절, 조사 패턴을 먼저 체크
  // ============================================
  const specialResult = handleSpecialKoreanPatterns(sentence);
  if (specialResult) {
    return specialResult;
  }

  // 0. 복합어/관용어 우선 체크 (절 분리 전에!)
  // "배고프다", "배가 고프다" 등의 복합어가 절로 잘못 분리되는 것을 방지
  const parsed = parseKorean(sentence);
  if (parsed.tokens.length === 1 && parsed.tokens[0].role === 'compound') {
    return parsed.tokens[0].translated || sentence;
  }

  // Phase 0: 보조용언 패턴 우선 체크 (절 분리 전에!)
  // "-고 있다", "-고 싶다" 등의 패턴이 감지되면 절 분리 없이 바로 번역
  if (parsed.auxiliaryPattern) {
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');
    return translated;
  }

  // Phase g4: 사동문 패턴 우선 체크 (절 분리 전에!)
  // "아이에게 밥을 먹였다" → "I fed the child"
  // "그를 가게 했다" → "I made him go"
  if (parsed.causative) {
    return generateEnglish(parsed);
  }

  // Phase g4: 피동문 패턴 우선 체크 (절 분리 전에!)
  // "문이 열렸다" → "The door was opened"
  if (parsed.passive) {
    return generateEnglish(parsed);
  }

  // Phase g6: 조건문 패턴 우선 체크 (절 분리 전에!)
  // "비가 오면 땅이 젖는다" → "If it rains, the ground gets wet"
  // "부자라면 여행할 텐데" → "If I were rich, I would travel"
  if (parsed.conditional) {
    return generateEnglish(parsed);
  }

  // Phase g8: 명사절 패턴 우선 체크 (절 분리 전에!)
  // "그가 왔다는 것이 중요하다" → "That he came is important"
  // "그가 간다고 했다" → "He said that he would go"
  if (parsed.nounClause) {
    return generateEnglish(parsed);
  }

  // Phase g9: 관계절 패턴 체크
  // "내가 산 책" → "the book that I bought"
  // "그가 사는 집" → "the home where he lives"
  if (parsed.relativeClause) {
    return generateRelativeClauseEnglish(parsed);
  }

  // Phase g24: 인용 표현 체크
  // "간다고 했다" → "said that (someone) goes"
  // "가냐고 물었다" → "asked if (someone) goes"
  if (parsed.quotation) {
    return generateQuotationEnglish(parsed);
  }

  // Phase g23: 추측 표현 체크
  // "갈 것 같다" → "probably will go"
  // "아픈가 보다" → "seems to be sick"
  if (parsed.conjecture) {
    return generateConjectureEnglish(parsed);
  }

  // 특수 부정 패턴은 검증 없이 바로 반환 (금지/능력 부정)
  // "-지 마" → "Don't eat!", "못 먹는다" → "can't eat"
  if (parsed.prohibitiveNegation || parsed.inabilityNegation) {
    return generateEnglish(parsed);
  }

  // 1. 절 분리
  const clauseInfo = parseKoreanClauses(sentence);

  // 단문인 경우
  if (clauseInfo.structure === 'simple') {
    // 절이 하나지만 연결어미가 있는 경우 (예: "비가 오니까", "가더라도")
    const singleClause = clauseInfo.clauses[0];
    if (singleClause?.connector) {
      const singleParsed = parseKorean(singleClause.text);
      let translated = generateEnglish(singleParsed);
      translated = validateTranslation(singleParsed, translated, 'ko-en');

      const conn = singleClause.connector.toLowerCase();
      // 연결어미에 따라 접속사 앞에 붙이기
      if (conn === 'because') {
        return `because ${translated.toLowerCase()}`;
      }
      if (conn === 'even if') {
        return `even if ${translated.toLowerCase()}`;
      }
      if (conn === 'because of') {
        return `because of ${toGerund(translated).toLowerCase()}`;
      }
      if (conn === 'but/and') {
        // -는데 ending은 상황에 따라 다름
        return `${translated} and/but`;
      }
      // 다른 연결어미도 처리
      return translated;
    }

    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');
    return translated;
  }

  // 2. 복문인 경우 절별로 번역
  const translatedClauses: string[] = [];

  for (let i = 0; i < clauseInfo.clauses.length; i++) {
    const clause = clauseInfo.clauses[i];
    const parsed = parseKorean(clause.text);
    let translated = generateEnglish(parsed);
    translated = validateTranslation(parsed, translated, 'ko-en');

    // 첫 절이 아니고, 이전 절에 connector가 있으면 접속사 추가
    if (i > 0) {
      const prevClause = clauseInfo.clauses[i - 1];
      if (prevClause?.connector && prevClause.connector !== 'undefined') {
        // connector 패턴에 따라 문장 구조 조정
        const conn = prevClause.connector.toLowerCase();
        if (conn === 'while') {
          // "watch while eating" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const gerund = toGerund(prevTranslated);
            // 메인 동사가 먼저, while + 동명사가 뒤에
            translatedClauses[translatedClauses.length - 1] =
              `${translated.toLowerCase()} while ${gerund.toLowerCase()}`;
            continue;
          }
        } else if (conn === 'in order to') {
          // "go to learn" 형태로 - 순서 반전
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            // 현재 절 + to + 이전 절 형태로
            translatedClauses[translatedClauses.length - 1] =
              `${translated.toLowerCase()} to ${toInfinitive(prevTranslated)}`;
            continue; // 현재 절은 이미 추가됨
          }
        } else if (conn === 'because of') {
          // "because of studying" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const gerund = toGerund(prevTranslated);
            translatedClauses[translatedClauses.length - 1] = `because of ${gerund.toLowerCase()}`;
          }
        } else if (conn === 'so') {
          // "was tired so slept" 형태로
          translated = `so ${translated.toLowerCase()}`;
        } else if (conn === 'even if') {
          // "even if I go" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            translatedClauses[translatedClauses.length - 1] =
              `even if ${prevTranslated.toLowerCase()}`;
          }
        } else {
          // and, but, or 등 일반 접속사
          translated = `${conn} ${translated.toLowerCase()}`;
        }
      }
    }

    translatedClauses.push(translated);
  }

  // 3. 절 조합
  return combineEnglishClauses(translatedClauses, clauseInfo);
}

/**
 * 등위접속사 → 한국어 연결어미 매핑
 */
const COORDINATING_CONNECTOR_MAP: Record<string, string> = {
  and: '-고',
  but: '-지만',
  or: '-거나',
  so: '-아서',
  yet: '-지만',
};

/**
 * 영어 문장을 절 단위로 분리하여 한국어로 번역
 */
function translateEnglishSentence(sentence: string, formality: Formality): string {
  // g6: 조건문 패턴 우선 체크 (절 분리 전에!)
  const parsed = parseEnglish(sentence);
  if (parsed.englishConditional) {
    return generateConditionalKorean(parsed, formality);
  }

  // g8: 명사절 패턴 우선 체크 (절 분리 전에!)
  if (parsed.nounClause) {
    return generateNounClauseKorean(parsed, formality);
  }

  // g9: 관계절 패턴 체크
  // "the book that I bought" → "내가 산 책"
  if (parsed.englishRelativeClause) {
    return generateRelativeClauseKorean(parsed);
  }

  // g23: 추측 표현 체크
  // "probably true" → "아마 맞을 것 같다"
  // "seems tired" → "피곤한가 보다"
  if (parsed.englishConjecture) {
    return generateConjectureKorean(parsed, formality);
  }

  // g24: 인용 표현 체크
  // "He said he would come" → "온다고 했다"
  // "She asked if I was busy" → "바쁘냐고 물었다"
  if (parsed.englishQuotation) {
    return generateEnglishToKoreanQuotation(parsed, formality);
  }

  // 1. 절 분리
  const clauseInfo = parseEnglishClauses(sentence);

  // 단문인 경우 기존 방식 사용
  if (clauseInfo.structure === 'simple') {
    let translated = generateKorean(parsed, formality);
    translated = validateTranslation(parsed, translated, 'en-ko');
    return translated;
  }

  // 2. 복문인 경우 절별로 번역
  const translatedClauses: string[] = [];

  for (let i = 0; i < clauseInfo.clauses.length; i++) {
    const clause = clauseInfo.clauses[i];
    const parsed = parseEnglish(clause.text);
    let translated = generateKorean(parsed, formality);
    translated = validateTranslation(parsed, translated, 'en-ko');

    // 연결어미 추가 (한국어)
    if (clause.connectorKo && clause.isSubordinate) {
      // 종속절: 동사 어미를 연결어미로 교체
      translated = applyKoreanConnector(translated, clause.connectorKo);
    }

    // Phase 5.1: 등위접속사 처리 (compound sentence)
    // 마지막 절이 아니고, 다음 절에 등위접속사가 있으면 현재 절에 연결어미 적용
    if (i < clauseInfo.clauses.length - 1) {
      const nextClause = clauseInfo.clauses[i + 1];
      if (nextClause.connector && COORDINATING_CONNECTOR_MAP[nextClause.connector]) {
        const connectorKo = COORDINATING_CONNECTOR_MAP[nextClause.connector];
        translated = applyKoreanConnector(translated, connectorKo);
      }
    }

    translatedClauses.push(translated);
  }

  // 3. 절 조합
  return combineKoreanClauses(translatedClauses, clauseInfo);
}

/**
 * g6: 영어 조건문을 한국어로 변환
 */
function generateConditionalKorean(parsed: ParsedSentence, _formality: Formality): string {
  const condType = parsed.englishConditionalType;
  const condClause = parsed.conditionalClause || '';
  const resultClause = parsed.resultClause || '';

  // 조건절에서 주어/동사 추출
  const condParts = parseEnglishConditionClause(condClause);
  const resultParts = resultClause ? parseEnglishResultClause(resultClause, condType) : null;

  switch (condType) {
    case 'type0': {
      // If + present, present → V-면 V-ㄴ다
      // "If you study, you learn" → "공부하면 배운다"
      const condKo = condParts.verbKo ? `${condParts.verbKo}면` : condClause;
      const resultKo = resultParts?.verbKo ? `${attachKoNieun(resultParts.verbKo)}다` : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type1': {
      // If + present, will + V → V-면 V-을 것이다
      // "If it snows, I will stay home" → "눈이 오면 집에 있을 것이다"
      const condKo = generateType1ConditionKorean(condParts);
      const resultKo = resultParts?.verbKo
        ? `${resultParts.objectKo || ''}${attachKoRieul(resultParts.verbKo)} 것이다`
        : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type2': {
      // If + were, would + V → N-(이)라면 V-ㄹ 텐데
      // "If I were you, I would go" → "내가 너라면 갈 텐데"
      const condKo = generateType2ConditionKorean(condParts);
      const resultKo = resultParts?.verbKo ? `${attachKoRieul(resultParts.verbKo)} 텐데` : '';
      return resultKo ? `${condKo} ${resultKo}` : condKo;
    }

    case 'type3': {
      // If + had + pp, would have + pp → V-았더라면 V-었을 텐데
      // "If I had known, I would have helped" → "알았더라면 도왔을 텐데"
      const condPast = condParts.verbKo ? `${attachKoPast(condParts.verbKo)}더라면` : condClause;
      const resultPast = resultParts?.verbKo
        ? `${attachKoPast(resultParts.verbKo, resultParts.verb)}을 텐데`
        : '';
      return resultPast ? `${condPast} ${resultPast}` : condPast;
    }

    case 'unless': {
      // Unless + clause → V-지 않으면
      // "Unless you hurry" → "서두르지 않으면"
      const verbKo = condParts.verbKo || '';
      return `${verbKo}지 않으면`;
    }

    case 'even-if': {
      // Even if + clause → V-더라도
      // "Even if it is hard" → "어렵더라도"
      // 형용사인 경우 바로 -더라도 붙임
      if (condParts.adjectiveKo) {
        return `${condParts.adjectiveKo}더라도`;
      }
      const verbKo = condParts.verbKo || '';
      return `${verbKo}더라도`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 영어 조건절 파싱 (Type 1 전용)
 */
function generateType1ConditionKorean(parts: EnglishClauseParts): string {
  // "it snows" → "눈이 오면"
  if (parts.subjectKo === '그것' && parts.weatherVerb) {
    const weatherNoun = parts.weatherVerb === 'snow' ? '눈' : '비';
    return `${weatherNoun}이 오면`;
  }
  return parts.verbKo ? `${parts.verbKo}면` : '';
}

/**
 * 영어 조건절 파싱 (Type 2 전용)
 */
function generateType2ConditionKorean(parts: EnglishClauseParts): string {
  // "I were you" → "내가 너라면"
  if (parts.complement) {
    const subjectKo = parts.subjectKo || '나';
    const complementKo = getKoreanSubject(parts.complement.toLowerCase());
    // 나 + 가 → 내가 (특수 처리)
    const subjectWithParticle = subjectKo === '나' ? '내가' : `${subjectKo}가`;
    return `${subjectWithParticle} ${complementKo}라면`;
  }
  return parts.verbKo ? `${parts.subjectKo || ''}${parts.verbKo}라면` : '';
}

interface EnglishClauseParts {
  subject?: string;
  subjectKo?: string;
  verb?: string;
  verbKo?: string;
  object?: string;
  objectKo?: string;
  complement?: string; // "you" in "I were you"
  adjectiveKo?: string;
  weatherVerb?: string;
}

/**
 * 한국어 동사/형용사에서 접미사 제거하여 어간 추출
 * 예: 공부하다 → 공부하, 가다 → 가, 어렵다 → 어렵, 어려운 → 어렵
 */
function removeKoDa(ko: string): string {
  // -다 접미사 제거
  if (ko.endsWith('다')) {
    return ko.slice(0, -1);
  }
  // 관형형 -ㄴ/은/운 접미사 제거 (어려운 → 어렵)
  // ㅂ 불규칙: 어려운 → 어렵
  if (ko.endsWith('운')) {
    // 어려운 → 어렵 (ㅂ 불규칙 역원)
    const stem = ko.slice(0, -1);
    // 마지막 글자에 ㅂ 받침 추가
    const lastChar = stem.charCodeAt(stem.length - 1);
    if (lastChar >= 0xac00 && lastChar <= 0xd7a3) {
      const jongseong = (lastChar - 0xac00) % 28;
      if (jongseong === 0) {
        // 받침 없음 → ㅂ(17) 추가
        const newChar = String.fromCharCode(lastChar + 17);
        return stem.slice(0, -1) + newChar;
      }
    }
    return stem;
  }
  return ko;
}

/**
 * 한국어 동사 어간에 ㄴ 받침 붙이기
 * 예: 배우 + ㄴ → 배운
 */
function attachKoNieun(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return stem + 'ㄴ';

  // 이미 받침이 있으면 ㄴ 을 붙일 수 없음
  const jongseong = (lastChar - 0xac00) % 28;
  if (jongseong !== 0) return stem + '은'; // 받침 있으면 -은 사용

  // 받침 없는 경우: ㄴ(니은=4) 받침 추가
  const newChar = String.fromCharCode(lastChar + 4);
  return stem.slice(0, -1) + newChar;
}

/**
 * 한국어 동사 어간에 ㄹ 받침 붙이기
 * 예: 가 + ㄹ → 갈
 */
function attachKoRieul(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return stem + 'ㄹ';

  // 이미 받침이 있으면 ㄹ 을 붙일 수 없음
  const jongseong = (lastChar - 0xac00) % 28;
  if (jongseong !== 0) return stem + '을'; // 받침 있으면 -을 사용

  // 받침 없는 경우: ㄹ(리을=8) 받침 추가
  const newChar = String.fromCharCode(lastChar + 8);
  return stem.slice(0, -1) + newChar;
}

/**
 * 한국어 동사 어간에 -았/었 붙이기
 * 양성모음(ㅏ,ㅗ) → 았, 음성모음 → 었
 * 예: 가 → 갔, 도 → 도왔 (돕의 불규칙)
 */
function attachKoPast(stem: string, baseVerb?: string): string {
  if (!stem) return stem;

  // 불규칙 동사 처리
  if (baseVerb === 'help' || stem === '도') {
    return '도왔'; // 돕 → 도왔 (ㅂ 불규칙)
  }

  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return stem + '았';

  // 모음 추출 (중성)
  const jungseong = Math.floor(((lastChar - 0xac00) % 588) / 28);

  // 양성모음: ㅏ(0), ㅗ(8)
  const isYangseong = jungseong === 0 || jungseong === 8;

  // 받침 확인
  const jongseong = (lastChar - 0xac00) % 28;

  if (jongseong !== 0) {
    // 받침 있음
    return stem + (isYangseong ? '았' : '었');
  }

  // 받침 없음: 모음 축약
  // ㅏ + 았 → 았 (가 → 갔)
  // ㅗ + 았 → 왔 (오 → 왔)
  if (jungseong === 0) {
    // ㅏ: 가 → 갔
    const newChar = String.fromCharCode(lastChar + 20); // ㅆ=20
    return stem.slice(0, -1) + newChar;
  }
  if (jungseong === 8) {
    // ㅗ: 오 → 왔
    const base = lastChar - 0xac00;
    const cho = Math.floor(base / 588);
    // ㅘ=9, ㅆ=20
    const newChar = String.fromCharCode(0xac00 + cho * 588 + 9 * 28 + 20);
    return stem.slice(0, -1) + newChar;
  }

  return stem + (isYangseong ? '았' : '었');
}

/**
 * 영어 조건절 파싱
 */
function parseEnglishConditionClause(clause: string): EnglishClauseParts {
  const words = clause.split(/\s+/);
  const result: EnglishClauseParts = {};

  // 주어 찾기
  const subjectMatch = clause.match(/^(I|you|he|she|it|we|they)\s+/i);
  if (subjectMatch) {
    result.subject = subjectMatch[1];
    result.subjectKo = getKoreanSubject(subjectMatch[1].toLowerCase());
  }

  // "it snows/rains" 날씨 패턴
  if (/\bit\s+(snows?|rains?)/i.test(clause)) {
    result.subjectKo = '그것';
    result.weatherVerb = clause.match(/snows?/i) ? 'snow' : 'rain';
    return result;
  }

  // "I were you" 패턴 (Type 2)
  const wereMatch = clause.match(/^(\w+)\s+were\s+(\w+)$/i);
  if (wereMatch) {
    result.subject = wereMatch[1];
    result.subjectKo = getKoreanSubject(wereMatch[1].toLowerCase());
    result.complement = wereMatch[2];
    return result;
  }

  // "I had known" 패턴 (Type 3)
  const hadMatch = clause.match(/^(\w+)\s+had\s+(\w+)$/i);
  if (hadMatch) {
    result.subject = hadMatch[1];
    result.subjectKo = getKoreanSubject(hadMatch[1].toLowerCase());
    const pp = hadMatch[2].toLowerCase();
    // 과거분사 → 동사 원형 → 한국어
    const baseVerb = ppToBase(pp);
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    return result;
  }

  // "you study" 일반 패턴
  const generalMatch = clause.match(/^(\w+)\s+(\w+)$/i);
  if (generalMatch) {
    result.subject = generalMatch[1];
    result.subjectKo = getKoreanSubject(generalMatch[1].toLowerCase());
    const verb = generalMatch[2].toLowerCase();
    // 3인칭 단수 -s 제거
    const baseVerb = verb.endsWith('s') ? verb.slice(0, -1) : verb;
    result.verb = baseVerb;
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    return result;
  }

  // "you hurry" (Unless용)
  if (words.length >= 2) {
    result.subject = words[0];
    result.subjectKo = getKoreanSubject(words[0].toLowerCase());
    const verb = words[1].toLowerCase();
    result.verb = verb;
    result.verbKo = removeKoDa(EN_KO[verb] || verb);
  }

  // "it is hard" (Even if용)
  const isMatch = clause.match(/^it\s+is\s+(\w+)$/i);
  if (isMatch) {
    const adj = isMatch[1].toLowerCase();
    result.adjectiveKo = removeKoDa(EN_KO[adj] || adj);
    return result;
  }

  return result;
}

/**
 * 영어 주어를 한국어로 변환 (조사 처리 포함)
 */
function getKoreanSubject(en: string): string {
  const subjectMap: Record<string, string> = {
    i: '나',
    you: '너',
    he: '그',
    she: '그녀',
    it: '그것',
    we: '우리',
    they: '그들',
  };
  return subjectMap[en] || EN_KO[en] || en;
}

/**
 * 영어 결과절 파싱
 */
function parseEnglishResultClause(
  clause: string,
  condType?: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if',
): EnglishClauseParts {
  const result: EnglishClauseParts = {};

  // Type 1: "I will stay home"
  const willMatch = clause.match(/^(\w+)\s+will\s+(.+)$/i);
  if (willMatch && condType === 'type1') {
    result.subject = willMatch[1];
    result.subjectKo = getKoreanSubject(willMatch[1].toLowerCase());
    // "stay home" 파싱
    const verbPart = willMatch[2].trim();
    const verbWords = verbPart.split(/\s+/);
    if (verbWords.length >= 2) {
      const verb = verbWords[0].toLowerCase();
      const obj = verbWords.slice(1).join(' ');
      result.verb = verb;
      result.verbKo = removeKoDa(EN_KO[verb] || verb);
      result.objectKo = EN_KO[obj.toLowerCase()] || '';
      // "stay home" → "집에 있" (특수 처리)
      if (verb === 'stay' && obj.toLowerCase() === 'home') {
        result.objectKo = '집에 ';
        result.verbKo = '있';
      }
    } else {
      result.verb = verbWords[0].toLowerCase();
      result.verbKo = removeKoDa(EN_KO[verbWords[0].toLowerCase()] || verbWords[0]);
    }
    return result;
  }

  // Type 2: "I would go"
  const wouldMatch = clause.match(/^(\w+)\s+would\s+(\w+)$/i);
  if (wouldMatch && condType === 'type2') {
    result.subject = wouldMatch[1];
    result.subjectKo = getKoreanSubject(wouldMatch[1].toLowerCase());
    result.verb = wouldMatch[2].toLowerCase();
    result.verbKo = removeKoDa(EN_KO[wouldMatch[2].toLowerCase()] || wouldMatch[2]);
    return result;
  }

  // Type 3: "I would have helped"
  const wouldHaveMatch = clause.match(/^(\w+)\s+would\s+have\s+(\w+)$/i);
  if (wouldHaveMatch && condType === 'type3') {
    result.subject = wouldHaveMatch[1];
    result.subjectKo = getKoreanSubject(wouldHaveMatch[1].toLowerCase());
    const pp = wouldHaveMatch[2].toLowerCase();
    const baseVerb = ppToBase(pp);
    result.verbKo = removeKoDa(EN_KO[baseVerb] || baseVerb);
    // 도왔 (돕 + 았) 처리 - '돕' 어간 사용
    if (baseVerb === 'help') {
      result.verbKo = '도';
    }
    return result;
  }

  // Type 0: "you learn"
  const generalMatch = clause.match(/^(\w+)\s+(\w+)$/i);
  if (generalMatch) {
    result.subject = generalMatch[1];
    result.subjectKo = getKoreanSubject(generalMatch[1].toLowerCase());
    const verb = generalMatch[2].toLowerCase();
    result.verb = verb;
    result.verbKo = removeKoDa(EN_KO[verb] || verb);
    return result;
  }

  return result;
}

/**
 * 과거분사 → 동사 원형 변환
 */
function ppToBase(pp: string): string {
  // 불규칙 과거분사
  const irregulars: Record<string, string> = {
    known: 'know',
    helped: 'help',
    gone: 'go',
    done: 'do',
    seen: 'see',
    taken: 'take',
    given: 'give',
    eaten: 'eat',
    written: 'write',
    spoken: 'speak',
  };
  if (irregulars[pp]) return irregulars[pp];

  // 규칙 동사: -ed 제거
  if (pp.endsWith('ed')) {
    // doubled consonant: stopped → stop
    if (/([^aeiou])(\1)ed$/.test(pp)) {
      return pp.slice(0, -3);
    }
    // -ied → -y: studied → study
    if (pp.endsWith('ied')) {
      return pp.slice(0, -3) + 'y';
    }
    return pp.slice(0, -2);
  }

  return pp;
}

// ============================================
// g8: 명사절 한국어 생성
// ============================================

/**
 * 영어 명사절 → 한국어 번역
 *
 * g8-6: That she is honest is clear → 그녀가 정직하다는 것은 분명하다
 * g8-7: I believe that he is right → 그가 옳다고 믿는다
 * g8-8: I wonder whether it is true → 그것이 사실인지 궁금하다
 * g8-9: I know what you mean → 네가 무슨 말을 하는지 안다
 * g8-10: She said that she was busy → 그녀는 바쁘다고 말했다
 */
function generateNounClauseKorean(parsed: ParsedSentence, _formality: Formality): string {
  const clauseType = parsed.nounClauseType;
  const content = parsed.nounClauseContent || '';
  const mainPredicate = parsed.mainPredicate || '';

  // 명사절 내용 파싱
  const contentParts = parseEnglishNounClauseContent(content);

  switch (clauseType) {
    case 'that-subject': {
      // "That she is honest is clear" → "그녀가 정직하다는 것은 분명하다"
      const subjectKo = getEnglishToKoreanSubject(contentParts.subject);
      const adjKo = getEnglishToKoreanAdjective(contentParts.predicate);
      const mainKo = getEnglishToKoreanAdjective(mainPredicate);
      return `${subjectKo}가 ${adjKo}다는 것은 ${mainKo}다`;
    }

    case 'that-object': {
      // "I believe that he is right" → "그가 옳다고 믿는다"
      const subjectKo = getEnglishToKoreanSubject(contentParts.subject);
      const adjKo = getEnglishToKoreanAdjective(contentParts.predicate);
      const mainVerbKo = getEnglishToKoreanVerb(mainPredicate);
      return `${subjectKo}가 ${adjKo}다고 ${mainVerbKo}는다`;
    }

    case 'whether': {
      // "I wonder whether it is true" → "그것이 사실인지 궁금하다"
      const subjectKo = getEnglishToKoreanSubject(contentParts.subject);
      const adjKo = getEnglishToKoreanAdjective(contentParts.predicate);
      // wonder는 형용사로 처리 (궁금하다)
      const mainKo = getEnglishToKoreanVerb(mainPredicate);
      return `${subjectKo}이 ${adjKo}인지 ${mainKo}다`;
    }

    case 'wh-clause': {
      // "I know what you mean" → "네가 무슨 말을 하는지 안다"
      const whWord = parsed.whWord?.toLowerCase() || 'what';
      const whKo = getKoreanWhWord(whWord);
      const subjectKo = getEnglishToKoreanSubject(contentParts.subject);
      const verbKo = getEnglishToKoreanVerb(contentParts.verb);
      const mainVerbKo = getEnglishToKoreanVerb(mainPredicate);

      // 주어 + 가 조사 특수 처리: 너 + 가 → 네가
      const subjectWithParticle = subjectKo === '너' ? '네가' : `${subjectKo}가`;

      // 주동사 종결어미 처리: 알 → 안다 (ㄹ 탈락)
      const mainVerbFinal = mainVerbKo === '알' ? '안' : mainVerbKo;

      // "what you mean" → "네가 무슨 말을 하는지"
      if (whWord === 'what') {
        return `${subjectWithParticle} ${whKo} 말을 하는지 ${mainVerbFinal}다`;
      }
      return `${subjectWithParticle} ${whKo} ${verbKo}는지 ${mainVerbFinal}다`;
    }

    case 'quote': {
      // "She said that she was busy" → "그녀는 바쁘다고 말했다"
      const quoterKo = getEnglishToKoreanSubject(contentParts.quoter || 'she');
      const adjKo = getEnglishToKoreanAdjective(contentParts.predicate);
      return `${quoterKo}는 ${adjKo}다고 말했다`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 영어 명사절 내용 파싱
 */
interface EnglishNounClauseParts {
  subject: string;
  verb: string;
  predicate: string;
  quoter?: string;
}

function parseEnglishNounClauseContent(content: string): EnglishNounClauseParts {
  const words = content.toLowerCase().split(/\s+/);

  // "she is honest" → { subject: 'she', verb: 'is', predicate: 'honest' }
  // "she was busy" → { subject: 'she', verb: 'was', predicate: 'busy' }
  // "you mean" → { subject: 'you', verb: 'mean', predicate: '' }

  const beMatch = content.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
  if (beMatch) {
    return {
      subject: beMatch[1].trim(),
      verb: 'be',
      predicate: beMatch[2].trim(),
    };
  }

  // 일반 동사: "you mean"
  const generalMatch = content.match(/^(.+?)\s+(\w+)$/i);
  if (generalMatch) {
    return {
      subject: generalMatch[1].trim(),
      verb: generalMatch[2].trim(),
      predicate: generalMatch[2].trim(),
    };
  }

  return {
    subject: words[0] || '',
    verb: words[1] || '',
    predicate: words[words.length - 1] || '',
  };
}

/**
 * 영어 주어 → 한국어 주어 변환
 */
function getEnglishToKoreanSubject(subject: string): string {
  const subjectMap: Record<string, string> = {
    i: '나',
    you: '너',
    he: '그',
    she: '그녀',
    it: '그것',
    we: '우리',
    they: '그들',
  };
  return subjectMap[subject.toLowerCase()] || EN_KO[subject.toLowerCase()] || subject;
}

/**
 * 영어 형용사/서술어 → 한국어 형용사 변환
 */
function getEnglishToKoreanAdjective(adj: string): string {
  const adjMap: Record<string, string> = {
    honest: '정직하',
    clear: '분명하',
    right: '옳',
    true: '사실',
    busy: '바쁘',
    important: '중요하',
    happy: '행복하',
    sad: '슬프',
    good: '좋',
    bad: '나쁘',
  };
  return adjMap[adj.toLowerCase()] || EN_KO[adj.toLowerCase()] || adj;
}

/**
 * 영어 동사 → 한국어 동사 변환
 */
function getEnglishToKoreanVerb(verb: string): string {
  const verbMap: Record<string, string> = {
    believe: '믿',
    think: '생각하',
    know: '알',
    wonder: '궁금하',
    say: '말하',
    said: '말하',
    mean: '의미하',
    see: '보',
    understand: '이해하',
    remember: '기억하',
  };
  return verbMap[verb.toLowerCase()] || EN_KO[verb.toLowerCase()] || verb;
}

/**
 * 영어 Wh-단어 → 한국어 변환
 */
function getKoreanWhWord(whWord: string): string {
  const whMap: Record<string, string> = {
    what: '무슨',
    where: '어디',
    when: '언제',
    why: '왜',
    how: '어떻게',
    who: '누가',
    which: '어느',
  };
  return whMap[whWord.toLowerCase()] || whWord;
}

/**
 * 영어 관계절 → 한국어 관계절 생성
 *
 * 패턴:
 * - the book that I bought → 내가 산 책
 * - the person who helped me → 나를 도운 사람
 * - the home where he lives → 그가 사는 집
 * - the day when we met → 우리가 만난 날
 */
function generateRelativeClauseKorean(parsed: ParsedSentence): string {
  const clauseType = parsed.relativeClauseType || 'that';
  const antecedent = parsed.relativeAntecedent || '';

  // 토큰에서 주어, 동사, 목적어 추출
  let subject = '';
  let verb = '';
  let object = '';

  for (const token of parsed.tokens) {
    if (token.meta?.strategy === 'relative-clause-subject') {
      subject = token.text;
    } else if (token.meta?.strategy === 'relative-clause-verb') {
      verb = token.text;
    } else if (token.meta?.strategy === 'relative-clause-object') {
      object = token.text;
    }
  }

  // 선행사 번역
  const antecedentKo = translateAntecedentToKorean(antecedent);

  // 문장 생성
  if (clauseType === 'who') {
    // "the person who helped me" → "나를 도운 사람"
    // object = "me", verb = "helped"
    const objectKo = getEnglishToKoreanObject(object.toLowerCase());
    const verbKo = translateVerbToKorean(verb, parsed.tense === 'past' ? 'past' : 'present');
    return `${objectKo}를 ${verbKo.adnominal} ${antecedentKo}`;
  } else if (clauseType === 'where' || clauseType === 'when') {
    // "the home where he lives" → "그가 사는 집"
    // "the day when we met" → "우리가 만난 날"
    const subjectKo = getEnglishToKoreanSubjectRel(subject);
    const verbInfo = translateVerbToKorean(verb, parsed.tense === 'past' ? 'past' : 'present');
    return `${subjectKo}가 ${verbInfo.adnominal} ${antecedentKo}`;
  } else {
    // "the book that I bought" → "내가 산 책"
    const subjectKo = getEnglishToKoreanSubjectRel(subject);
    const verbInfo = translateVerbToKorean(verb, parsed.tense === 'past' ? 'past' : 'present');
    return `${subjectKo}가 ${verbInfo.adnominal} ${antecedentKo}`;
  }
}

/**
 * 영어 선행사 → 한국어 명사 변환
 */
function translateAntecedentToKorean(en: string): string {
  const nounMap: Record<string, string> = {
    book: '책',
    person: '사람',
    home: '집',
    house: '집',
    day: '날',
    place: '곳',
    time: '시간',
    friend: '친구',
    school: '학교',
    food: '음식',
    movie: '영화',
    song: '노래',
    thing: '것',
    man: '남자',
    woman: '여자',
  };
  return nounMap[en.toLowerCase()] || EN_KO[en.toLowerCase()] || en;
}

/**
 * 영어 주어 → 한국어 주어 변환 (관계절용)
 */
function getEnglishToKoreanSubjectRel(en: string): string {
  const subjMap: Record<string, string> = {
    i: '내',
    you: '네',
    he: '그',
    she: '그녀',
    we: '우리',
    they: '그들',
    it: '그것',
  };
  return subjMap[en.toLowerCase()] || EN_KO[en.toLowerCase()] || en;
}

/**
 * 영어 목적어 → 한국어 목적어 변환
 */
function getEnglishToKoreanObject(en: string): string {
  const objMap: Record<string, string> = {
    me: '나',
    you: '너',
    him: '그',
    her: '그녀',
    us: '우리',
    them: '그들',
    it: '그것',
  };
  return objMap[en.toLowerCase()] || EN_KO[en.toLowerCase()] || en;
}

/**
 * 영어 동사 → 한국어 동사 변환 (관형형 어미 포함)
 */
function translateVerbToKorean(
  en: string,
  tense: 'past' | 'present',
): { base: string; adnominal: string } {
  // 영어 동사 → 한국어 어간 + 관형형 어미
  const verbMap: Record<string, { base: string; pastAdnominal: string; presentAdnominal: string }> =
    {
      buy: { base: '사', pastAdnominal: '산', presentAdnominal: '사는' },
      bought: { base: '사', pastAdnominal: '산', presentAdnominal: '사는' },
      live: { base: '살', pastAdnominal: '산', presentAdnominal: '사는' },
      lives: { base: '살', pastAdnominal: '산', presentAdnominal: '사는' },
      help: { base: '돕', pastAdnominal: '도운', presentAdnominal: '돕는' },
      helped: { base: '돕', pastAdnominal: '도운', presentAdnominal: '돕는' },
      meet: { base: '만나', pastAdnominal: '만난', presentAdnominal: '만나는' },
      met: { base: '만나', pastAdnominal: '만난', presentAdnominal: '만나는' },
      eat: { base: '먹', pastAdnominal: '먹은', presentAdnominal: '먹는' },
      ate: { base: '먹', pastAdnominal: '먹은', presentAdnominal: '먹는' },
      see: { base: '보', pastAdnominal: '본', presentAdnominal: '보는' },
      saw: { base: '보', pastAdnominal: '본', presentAdnominal: '보는' },
      read: { base: '읽', pastAdnominal: '읽은', presentAdnominal: '읽는' },
      write: { base: '쓰', pastAdnominal: '쓴', presentAdnominal: '쓰는' },
      wrote: { base: '쓰', pastAdnominal: '쓴', presentAdnominal: '쓰는' },
      go: { base: '가', pastAdnominal: '간', presentAdnominal: '가는' },
      went: { base: '가', pastAdnominal: '간', presentAdnominal: '가는' },
      come: { base: '오', pastAdnominal: '온', presentAdnominal: '오는' },
      came: { base: '오', pastAdnominal: '온', presentAdnominal: '오는' },
      do: { base: '하', pastAdnominal: '한', presentAdnominal: '하는' },
      did: { base: '하', pastAdnominal: '한', presentAdnominal: '하는' },
    };

  const entry = verbMap[en.toLowerCase()];
  if (entry) {
    return {
      base: entry.base,
      adnominal: tense === 'past' ? entry.pastAdnominal : entry.presentAdnominal,
    };
  }

  // 기본 변환: 동사 원형 + 한 (과거) / 는 (현재)
  const baseKo = EN_KO[en.toLowerCase()] || en;
  return {
    base: baseKo,
    adnominal: tense === 'past' ? `${baseKo}한` : `${baseKo}는`,
  };
}

/**
 * 한국어 관계절 → 영어 관계절 생성
 *
 * 패턴:
 * - 내가 산 책 → the book that I bought
 * - 나를 도운 사람 → the person who helped me
 * - 그가 사는 집 → the home where he lives
 * - 우리가 만난 날 → the day when we met
 */
function generateRelativeClauseEnglish(parsed: ParsedSentence): string {
  const clauseType = parsed.relativeClauseType || 'that';
  const antecedent = parsed.relativeAntecedent || '';

  // 토큰에서 주어, 목적어, 동사 추출
  let subject = '';
  let object = '';
  let verb = '';
  let antecedentEn = '';

  for (const token of parsed.tokens) {
    if (token.meta?.strategy === 'relative-clause-subject') {
      subject = getKoreanToEnglishSubject(token.text);
    } else if (token.meta?.strategy === 'relative-clause-object') {
      object = getKoreanToEnglishObject(token.text);
    } else if (token.meta?.strategy === 'relative-clause-verb') {
      // 동사는 한국어 원형을 translateVerb로 처리 (token.translated는 WSD 결과이므로 부적합)
      verb = token.text;
    } else if (token.meta?.strategy === 'relative-clause-antecedent') {
      antecedentEn = translateAntecedent(token.text);
    }
  }

  // 관계대명사 결정
  let relativePronoun = 'that';
  if (clauseType === 'who') {
    relativePronoun = 'who';
  } else if (clauseType === 'where') {
    relativePronoun = 'where';
  } else if (clauseType === 'when') {
    relativePronoun = 'when';
  }

  // 동사 시제 처리
  const verbEn = translateVerb(verb, parsed.tense === 'past' ? 'past' : 'present');

  // 문장 생성
  if (clauseType === 'who' && object) {
    // 목적어가 관계절의 주어가 되는 패턴: 나를 도운 사람 → the person who helped me
    return `the ${antecedentEn} ${relativePronoun} ${verbEn} ${object}`;
  } else if (clauseType === 'where' || clauseType === 'when') {
    // 장소/시간 관계절: 그가 사는 집 → the home where he lives
    return `the ${antecedentEn} ${relativePronoun} ${subject} ${verbEn}`;
  } else {
    // 기본 that 관계절: 내가 산 책 → the book that I bought
    return `the ${antecedentEn} ${relativePronoun} ${subject} ${verbEn}`;
  }
}

/**
 * 한국어 주어 → 영어 주어 변환
 */
function getKoreanToEnglishSubject(ko: string): string {
  const subjMap: Record<string, string> = {
    나: 'I',
    내: 'I',
    저: 'I',
    너: 'you',
    네: 'you',
    그: 'he',
    그녀: 'she',
    우리: 'we',
    그들: 'they',
  };
  return subjMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 목적어 → 영어 목적어 변환
 */
function getKoreanToEnglishObject(ko: string): string {
  const objMap: Record<string, string> = {
    나: 'me',
    저: 'me',
    너: 'you',
    그: 'him',
    그녀: 'her',
    우리: 'us',
    그들: 'them',
  };
  return objMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 선행사 → 영어 명사 변환
 */
function translateAntecedent(ko: string): string {
  const nounMap: Record<string, string> = {
    책: 'book',
    사람: 'person',
    집: 'home',
    날: 'day',
    곳: 'place',
    시간: 'time',
    친구: 'friend',
    학교: 'school',
    음식: 'food',
    영화: 'movie',
    노래: 'song',
    것: 'thing',
  };
  return nounMap[ko] || EN_KO[ko] || ko;
}

/**
 * 한국어 동사 어간 → 영어 동사 변환 (시제 적용)
 */
function translateVerb(koStem: string, tense: 'past' | 'present'): string {
  const verbMap: Record<string, { base: string; past: string }> = {
    사: { base: 'buy', past: 'bought' },
    산: { base: 'buy', past: 'bought' },
    살: { base: 'live', past: 'lived' },
    사는: { base: 'live', past: 'lived' },
    도우: { base: 'help', past: 'helped' },
    도운: { base: 'help', past: 'helped' },
    만나: { base: 'meet', past: 'met' },
    만난: { base: 'meet', past: 'met' },
    먹: { base: 'eat', past: 'ate' },
    보: { base: 'see', past: 'saw' },
    읽: { base: 'read', past: 'read' },
    쓰: { base: 'write', past: 'wrote' },
    가: { base: 'go', past: 'went' },
    오: { base: 'come', past: 'came' },
    하: { base: 'do', past: 'did' },
    있: { base: 'be', past: 'was' },
  };

  const entry = verbMap[koStem];
  if (entry) {
    return tense === 'past' ? entry.past : entry.base + 's';
  }

  // 기본 변환
  const baseVerb = EN_KO[koStem] || koStem;
  if (tense === 'past') {
    return baseVerb + 'ed';
  }
  return baseVerb + 's';
}

/**
 * 영어 절들을 조합
 */
function combineEnglishClauses(clauses: string[], info: ParsedClauses): string {
  if (clauses.length === 0) return '';
  if (clauses.length === 1) return clauses[0];

  // 주절과 종속절 구분
  const mainClauses: string[] = [];
  const subordinateClauses: string[] = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = info.clauses[i];
    if (clause?.isSubordinate) {
      subordinateClauses.push(clauses[i]);
    } else {
      mainClauses.push(clauses[i]);
    }
  }

  // 종속절이 앞에, 주절이 뒤에 오는 경우가 많음
  // 하지만 원래 순서를 존중
  let result = clauses[0];
  for (let i = 1; i < clauses.length; i++) {
    const prevClause = info.clauses[i - 1];
    const currClause = info.clauses[i];

    // 등위접속이면 ", and/but" 사용
    if (!currClause?.isSubordinate && !prevClause?.isSubordinate) {
      result += `, ${clauses[i]}`;
    } else {
      result += ` ${clauses[i]}`;
    }
  }

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 한국어 절들을 조합
 */
function combineKoreanClauses(clauses: string[], _info: ParsedClauses): string {
  if (clauses.length === 0) return '';
  if (clauses.length === 1) return clauses[0];

  // 한국어는 종속절이 앞, 주절이 뒤
  // 순서대로 조합
  return clauses.join(' ');
}

/**
 * 한국어 문장에 연결어미 적용
 *
 * 연결어미 형식: "-고", "-지만", "-아서" 등 (하이픈 포함)
 *
 * 규칙:
 * - "간다" + "-고" → "가고" (ㄴ다 제거 + 받침 제거)
 * - "먹는다" + "-고" → "먹고" (는다 제거)
 * - "먹다" + "-고" → "먹고" (다 제거)
 */
function applyKoreanConnector(sentence: string, connector: string): string {
  // 연결어미에서 하이픈 제거
  const cleanConnector = connector.startsWith('-') ? connector.slice(1) : connector;

  // 문장을 어절로 분리
  const words = sentence.split(' ');
  if (words.length === 0) return sentence;

  // 마지막 어절에서 종결어미 제거하고 연결어미 추가
  const lastWord = words[words.length - 1];

  // 종결어미 패턴별 처리
  let stem = lastWord;
  let matched = false;

  // 1. -ㄴ다 패턴 (간다, 온다 등) - 받침 있는 어간 + ㄴ다
  // 간다 = 가 + ㄴ받침 + 다 → 어간 = 가
  if (/[가-힣]다$/.test(lastWord)) {
    const beforeDa = lastWord.slice(0, -1); // '다' 제거
    const lastChar = beforeDa[beforeDa.length - 1];

    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      // 한글 음절 범위 체크
      if (code >= 0xac00 && code <= 0xd7a3) {
        const jong = (code - 0xac00) % 28;

        // ㄴ받침(4) 또는 ㄹ받침(8)이면 종성 제거
        if (jong === 4 || jong === 8) {
          // 종성 제거
          const withoutJong = String.fromCharCode(code - jong);
          stem = beforeDa.slice(0, -1) + withoutJong;
          matched = true;
        } else if (jong === 0) {
          // 받침 없으면 그대로
          stem = beforeDa;
          matched = true;
        }
      }
    }
  }

  // 2. -는다 패턴 (먹는다 등)
  if (!matched && /는다$/.test(lastWord)) {
    stem = lastWord.slice(0, -2); // '는다' 제거
    matched = true;
  }

  // 3. 일반 -다 패턴 (받침 있는 어간)
  if (!matched && /다$/.test(lastWord)) {
    stem = lastWord.slice(0, -1);
    matched = true;
  }

  // 4. 기타 어미 패턴
  if (!matched) {
    const otherPatterns = [
      /어$/, // -어
      /아$/, // -아
      /요$/, // -요
      /니\?$/, // -니?
      /까\?$/, // -까?
    ];

    for (const pattern of otherPatterns) {
      if (pattern.test(lastWord)) {
        stem = lastWord.replace(pattern, '');
        matched = true;
        break;
      }
    }
  }

  // 어간 + 연결어미
  if (matched) {
    words[words.length - 1] = stem + cleanConnector;
    return words.join(' ');
  }

  // 매칭 안 되면 그냥 연결
  return `${sentence} ${cleanConnector}`;
}

/**
 * 문장 분리
 *
 * g15: "(formal)", "(polite)", "(casual)", "(command)" 같은 마커가 있으면 분리하지 않음
 * 예: "Do you eat? (formal)" → 하나의 문장으로 유지
 */
function splitSentences(text: string): Array<{ sentence: string; punctuation: string }> {
  const results: Array<{ sentence: string; punctuation: string }> = [];

  // g15: 종결어미 마커가 있는 패턴은 분리하지 않음
  // "(formal)", "(polite)", "(casual)", "(command)" 앞의 구두점은 문장 분리에 사용 안 함
  const g15Pattern = /[.!?？！。]+\s*\((formal|polite|casual|command)\)$/i;
  if (g15Pattern.test(text.trim())) {
    // 마커가 있으면 끝 구두점만 추출하고 전체를 하나의 문장으로 처리
    const endPunct = text.match(/[.!?？！。]+$/)?.[0] || '';
    const sentence = endPunct ? text.slice(0, -endPunct.length).trim() : text.trim();
    results.push({ sentence, punctuation: endPunct });
    return results;
  }

  // 구두점으로 분리
  const parts = text.split(/([.!?？！。]+)/);

  for (let i = 0; i < parts.length; i += 2) {
    const sentence = parts[i]?.trim();
    const punctuation = parts[i + 1] || '';

    if (sentence) {
      results.push({ sentence, punctuation: punctuation.trim() });
    }
  }

  // 분리 안 된 경우 전체를 하나의 문장으로
  if (results.length === 0 && text.trim()) {
    results.push({ sentence: text.trim(), punctuation: '' });
  }

  return results;
}

// ============================================
// 명사 역번역 검증
// ============================================

/**
 * 번역 결과에서 명사를 역번역 검증
 *
 * 검증 실패한 명사가 있으면 번역된 단어를 원본으로 교체
 *
 * 예시:
 * - "유튜브" → "your tube" (검증 실패) → "유튜브"로 교체
 * - "아이폰" → "eye phone" (검증 실패) → "아이폰"으로 교체
 *
 * @param parsed 파싱된 문장
 * @param translated 번역된 문장
 * @param direction 번역 방향
 * @returns 검증된 번역 결과
 */
function validateTranslation(
  parsed: ParsedSentence,
  translated: string,
  direction: Direction,
): string {
  let result = translated;

  // 명사 토큰만 추출하여 검증
  const nounTokens = parsed.tokens.filter(
    (t) => t.role === 'object' || t.role === 'subject' || t.role === 'unknown',
  );

  for (const token of nounTokens) {
    if (!token.translated || !token.stem) continue;

    const validation = validateWordTranslation(token.stem, token.translated, direction);

    if (!validation.valid) {
      // 검증 실패 → 번역된 단어를 원본으로 교체
      result = result.replace(token.translated, token.stem);

      // confidence 조정
      if (token.confidence !== undefined) {
        token.confidence = Math.min(token.confidence, validation.confidence);
      }
    }
  }

  return result;
}

// ============================================
// 입력 어투 자동 감지
// ============================================

/**
 * 입력 텍스트의 어투를 자동 감지
 *
 * @param text 입력 텍스트
 * @param direction 번역 방향 (어떤 언어인지 판단용)
 * @returns 감지된 어투 (감지 실패 시 null)
 */
export function detectFormality(text: string, direction: Direction): Formality | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 단일 단어 판단 (짧고 어미 패턴 없음)
  // 한국어: 어미 패턴이 있으면 단어가 아님
  // 영어: 공백 없고 짧으면 단어
  if (direction === 'ko-en') {
    // 한국어 입력 → 한국어 어미 분석
    return detectKoreanFormality(trimmed);
  } else {
    // 영어: 공백 없고 짧으면 단어
    const isSingleWord = !trimmed.includes(' ') && trimmed.length < 15;
    if (isSingleWord) {
      return null; // 단어는 어투 없음
    }
    // 영어 입력 → 영어 표현 분석
    return detectEnglishFormality(trimmed);
  }
}

/**
 * 한국어 문장의 어투 감지
 *
 * 어미 패턴 분석:
 * - 합니다/습니다/ㅂ니다/합니까 → literal (번역체)
 * - 해요/세요/어요/아요 → formal (존댓말)
 * - 해~/어~/아~ → friendly (친근체)
 * - 해?/어?/아?/냐?/니? → casual (반말)
 * - 한다/는다/ㄴ다 → neutral (상관없음/서술체)
 */
function detectKoreanFormality(text: string): Formality | null {
  // 마지막 어절 추출 (구두점 제거)
  const cleaned = text.replace(/[.!?？！。~]+$/, '').trim();
  if (!cleaned) return null;

  // ~가 있으면 바로 friendly (길이 무관)
  if (/~/.test(text)) {
    return 'friendly';
  }

  // 단일 단어 감지 (한글만 있고 짧으면서 어미 패턴 없음)
  // 문장이 아닌 경우: 커피, 사과 등
  const hasKoreanEnding =
    /(?:합니다|습니다|ㅂ니다|합니까|습니까|ㅂ니까|해요|세요|어요|아요|에요|예요|죠|지요|네요|래요|을까요|ㄹ까요|해|어|아|지|야|냐|니|래|자|줘|봐|한다|는다|ㄴ다|요)$/.test(
      cleaned,
    );

  if (!hasKoreanEnding && cleaned.length < 10 && !cleaned.includes(' ')) {
    return null; // 단어는 어투 없음
  }

  // 어미 패턴 (우선순위 순 - 더 구체적인 것부터)

  // 1. literal (번역체) - 가장 격식체
  // 니다/니까로 끝나는 패턴 (합니다, 습니다, 갑니다 등)
  if (/(?:니다|니까)$/.test(cleaned)) {
    return 'literal';
  }

  // 2. formal (존댓말) - 해요체
  if (
    /(?:해요|세요|어요|아요|에요|예요|죠|지요|네요|래요|을까요|ㄹ까요|실래요|으실래요|요)$/.test(
      cleaned,
    )
  ) {
    return 'formal';
  }

  // 3. casual (반말) - 해체
  if (/(?:해|어|아|지|야|냐|니|래|자|줘|봐|해봐|해줘|가)$/.test(cleaned)) {
    return 'casual';
  }

  // 4. neutral (서술체) - 한다/는다/ㄴ다
  if (/(?:한다|는다|ㄴ다|다|군|구나|네|로군|로다)$/.test(cleaned)) {
    return 'neutral';
  }

  return null;
}

/**
 * 영어 문장의 어투 감지
 *
 * 표현 패턴 분석:
 * - Would you / Could you / May I → formal
 * - Please / kindly → formal
 * - Hey / Yo / Dude / Man → casual
 * - 일반 문장 → neutral
 *
 * 영어는 한국어만큼 어투 구분이 명확하지 않음
 */
function detectEnglishFormality(text: string): Formality | null {
  const lower = text.toLowerCase();

  // formal 표현
  if (
    /^(would you|could you|may i|might i|shall we|i would like)/i.test(lower) ||
    /\b(please|kindly|respectfully|if you don't mind)\b/i.test(lower)
  ) {
    return 'formal';
  }

  // casual 표현
  if (
    /^(hey|yo|sup|dude|man|bro|sis|girl|buddy)\b/i.test(lower) ||
    /\b(gonna|wanna|gotta|kinda|sorta|lemme|gimme)\b/i.test(lower)
  ) {
    return 'casual';
  }

  // 영어는 대부분 neutral로 처리
  return 'neutral';
}

// ============================================
// g23: 추측 표현 생성 (Conjecture Generation)
// ============================================

/**
 * 한국어 추측 표현을 영어로 변환
 * - 갈 것 같다 → probably will go
 * - 아픈가 보다 → seems to be sick
 * - 바쁜 모양이다 → appears to be busy
 * - 올 듯하다 → seems like coming
 * - 맞나 싶다 → I guess it might be right
 * - 틀림없이 그렇다 → must be so
 * - 왔을지도 모른다 → might have come
 * - 갔다고 하다 → I heard that (someone) went
 */
function generateConjectureEnglish(parsed: ParsedSentence): string {
  const conjType = parsed.conjectureType;
  const stem = parsed.conjectureStem || '';
  const tense = parsed.conjectureTense || 'present';

  // 어간 → 영어 동사 변환
  const verbEn = translateKoreanStemToEnglish(stem);

  switch (conjType) {
    case 'geot-gatda':
      // -ㄹ 것 같다 → probably will V
      return `probably will ${verbEn}`;

    case 'ga-boda':
      // -가 보다 → seems to be + adj
      return `seems to be ${verbEn}`;

    case 'moyang':
      // -ㄴ 모양이다 → appears to be + adj
      return `appears to be ${verbEn}`;

    case 'deut':
      // -ㄹ 듯하다 → seems like + V-ing
      return `seems like ${toGerund(verbEn)}`;

    case 'na-sipda':
      // -나 싶다 → I guess it might be + adj
      return `I guess it might be ${verbEn}`;

    case 'certain':
      // 틀림없이 → must be + adj (그렇 → so)
      if (stem === '그렇') {
        return 'must be so';
      }
      return `must be ${verbEn}`;

    case 'jido-moreunda':
      // -ㄹ지도 모른다 → might have + pp (과거) / might + V (미래)
      if (tense === 'past') {
        return `might have ${toPastParticiple(verbEn)}`;
      }
      return `might ${verbEn}`;

    case 'hearsay':
      // -다고 하다 → I heard that (someone) + V-ed
      if (tense === 'past') {
        return `I heard that (someone) ${toPastTense(verbEn)}`;
      }
      return `I heard that (someone) ${verbEn}s`;

    default:
      return parsed.original;
  }
}

/**
 * 영어 추측 표현을 한국어로 변환
 * - probably true → 아마 맞을 것 같다
 * - seems tired → 피곤한가 보다
 * - appears happy → 행복한 모양이다
 * - must be correct → 틀림없이 맞다
 * - might have left → 떠났을지도 모른다
 */
function generateConjectureKorean(parsed: ParsedSentence, _formality: Formality): string {
  const conjType = parsed.conjectureType;
  const adjective = parsed.conjectureStem || '';

  // 형용사 → 한국어 변환
  const adjKo = translateEnglishAdjToKorean(adjective);

  switch (conjType) {
    case 'geot-gatda':
      // probably → 아마 V-ㄹ 것 같다
      return `아마 ${attachKoRieul(adjKo)} 것 같다`;

    case 'ga-boda':
      // seems → V-ㄴ가 보다
      return `${attachKoNieun(adjKo)}가 보다`;

    case 'moyang':
      // appears → V-ㄴ 모양이다
      return `${attachKoNieun(adjKo)} 모양이다`;

    case 'certain':
      // must be → 틀림없이 V-다
      return `틀림없이 ${adjKo}다`;

    case 'jido-moreunda': {
      // might have → V-았을지도 모른다
      const verbKo = translateEnglishVerbToKorean(adjective);
      return `${attachPastTense(verbKo)}을지도 모른다`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 한국어 어간을 영어로 변환 (추측 표현용)
 */
function translateKoreanStemToEnglish(stem: string): string {
  const STEM_MAP: Record<string, string> = {
    가: 'go',
    오: 'come',
    아프: 'sick',
    바쁘: 'busy',
    맞: 'right',
    그렇: 'so',
    피곤하: 'tired',
    행복하: 'happy',
  };
  return STEM_MAP[stem] || stem;
}

/**
 * 영어 형용사를 한국어로 변환 (추측 표현용)
 */
function translateEnglishAdjToKorean(adj: string): string {
  const ADJ_MAP: Record<string, string> = {
    true: '맞',
    correct: '맞',
    right: '맞',
    tired: '피곤하',
    happy: '행복하',
    busy: '바쁘',
    sick: '아프',
    so: '그렇',
  };
  return ADJ_MAP[adj.toLowerCase()] || adj;
}

/**
 * 영어 동사를 한국어로 변환 (추측 표현용)
 */
function translateEnglishVerbToKorean(verb: string): string {
  const VERB_MAP: Record<string, string> = {
    go: '가',
    went: '가',
    come: '오',
    came: '오',
    leave: '떠나',
    left: '떠나',
    eat: '먹',
    ate: '먹',
    eating: '먹',
    study: '공부하',
    studied: '공부하',
    busy: '바쁘',
  };
  return VERB_MAP[verb.toLowerCase()] || verb;
}

/**
 * 동사를 3인칭 단수형 (V-s/es) 으로 변환
 */
function toThirdPersonSingular(verb: string): string {
  const IRREGULAR: Record<string, string> = {
    go: 'goes',
    do: 'does',
    have: 'has',
    be: 'is',
  };
  if (IRREGULAR[verb]) return IRREGULAR[verb];
  // -s, -sh, -ch, -x, -o → +es
  if (/(?:s|sh|ch|x|o)$/.test(verb)) {
    return `${verb}es`;
  }
  // consonant + y → -ies
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }
  return `${verb}s`;
}

// toGerund moved to top of file

/**
 * 동사를 과거분사 형태로 변환
 */
function toPastParticiple(verb: string): string {
  const PP_MAP: Record<string, string> = {
    go: 'gone',
    come: 'come',
    leave: 'left',
    eat: 'eaten',
    run: 'run',
    see: 'seen',
    do: 'done',
    have: 'had',
    be: 'been',
  };
  if (PP_MAP[verb]) return PP_MAP[verb];
  // 규칙형: -ed
  if (verb.endsWith('e')) return `${verb}d`;
  return `${verb}ed`;
}

/**
 * 동사를 과거형으로 변환
 */
function toPastTense(verb: string): string {
  const PAST_MAP: Record<string, string> = {
    go: 'went',
    come: 'came',
    leave: 'left',
    eat: 'ate',
    run: 'ran',
    see: 'saw',
    do: 'did',
    have: 'had',
    be: 'was',
    sleep: 'slept',
    know: 'knew',
  };
  if (PAST_MAP[verb]) return PAST_MAP[verb];
  // 규칙형: -ed
  if (verb.endsWith('e')) return `${verb}d`;
  return `${verb}ed`;
}

/**
 * 한국어 어간에 과거시제 접사(-았/-었) 붙이기
 */
function attachPastTense(stem: string): string {
  // 하다 동사
  if (stem.endsWith('하')) {
    return `${stem.slice(0, -1)}했`;
  }

  // 나다 동사: 나 + 았 → 났
  if (stem.endsWith('나')) {
    return `${stem.slice(0, -1)}났`;
  }

  // 가다 동사: 가 + 았 → 갔
  if (stem.endsWith('가')) {
    return `${stem.slice(0, -1)}갔`;
  }

  // 오다 동사: 오 + 았 → 왔
  if (stem.endsWith('오')) {
    return `${stem.slice(0, -1)}왔`;
  }

  // 양성모음이면 -았, 음성모음이면 -었
  const lastChar = stem[stem.length - 1];
  // 간단한 규칙: 아/오 포함이면 았, 아니면 었
  if (/[아오]/.test(lastChar)) {
    return `${stem}았`;
  }

  return `${stem}었`;
}

// ============================================
// g24: 인용 표현 생성 (Quotation Generation)
// ============================================

/**
 * 한국어 인용 표현을 영어로 변환
 * - 간다고 했다 → said that (someone) goes
 * - 가냐고 물었다 → asked if (someone) goes
 * - 가라고 했다 → told (someone) to go
 * - 가자고 했다 → suggested going
 * - 간대 → he/she says (someone) goes
 * - 가냬 → he/she asks if (someone) goes
 * - 가래 → he/she says to go
 */
function generateQuotationEnglish(parsed: ParsedSentence): string {
  const quotType = parsed.quotationType;
  const stem = parsed.quotationStem || '';

  // 어간 → 영어 동사 변환
  const verbEn = translateKoreanStemToEnglish(stem);

  switch (quotType) {
    case 'dago':
      // -다고 하다/했다 → said that (someone) V-s / goes
      return `said that (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'nyago':
      // -냐고 물다/물었다 → asked if (someone) V-s / goes
      return `asked if (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'rago':
      // -라고 하다/했다 → told (someone) to V
      return `told (someone) to ${verbEn}`;

    case 'jago':
      // -자고 하다/했다 → suggested V-ing
      return `suggested ${toGerund(verbEn)}`;

    case 'ndae':
      // -ㄴ대 → he/she says (someone) V-s
      return `he/she says (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'nyae':
      // -냬 → he/she asks if (someone) V-s
      return `he/she asks if (someone) ${toThirdPersonSingular(verbEn)}`;

    case 'rae':
      // -래 → he/she says to V
      return `he/she says to ${verbEn}`;

    default:
      return parsed.original;
  }
}

/**
 * 영어 인용 표현을 한국어로 변환 (En → Ko)
 * - He said he would come → 온다고 했다
 * - She asked if I was busy → 바쁘냐고 물었다
 * - He told me to study → 공부하라고 했다
 * - She suggested eating → 먹자고 했다
 * - I heard that he left → 떠났다고 들었다
 */
function generateEnglishToKoreanQuotation(parsed: ParsedSentence, _formality: Formality): string {
  const quotType = parsed.quotationType;
  const verbEn = parsed.quotationStem || '';

  // 영어 동사 → 한국어 어간 변환
  const verbKo = translateEnglishVerbToKorean(verbEn);

  switch (quotType) {
    case 'dago':
      // said that (S) would V → V-ㄴ다고 했다 (present tense in quoted content)
      // heard that (S) V-ed → V-았다고 들었다 (past tense in quoted content)
      if (parsed.quotationTense === 'past') {
        // 과거시제 인용: 떠났다고 들었다
        return `${attachPastTense(verbKo)}다고 들었다`;
      }
      // 현재/미래시제 인용: 온다고 했다
      // ㄴ 받침 붙이기: 오 → 온
      return `${attachKoNieun(verbKo)}다고 했다`;

    case 'nyago':
      // asked if (S) was ADJ → ADJ-냐고 물었다
      // busy → 바쁘냐고
      return `${verbKo}냐고 물었다`;

    case 'rago':
      // told (O) to V → V-라고 했다
      // study → 공부하라고
      return `${verbKo}라고 했다`;

    case 'jago':
      // suggested V-ing → V-자고 했다
      // eat → 먹자고
      return `${verbKo}자고 했다`;

    default:
      return parsed.original;
  }
}

// ============================================
// g7/g10/g13: 특수 패턴 처리 함수
// ============================================

/** 한국어 형용사 → 영어 형용사 매핑 */
const KO_ADJECTIVES: Record<string, string> = {
  크다: 'big',
  크: 'big',
  작다: 'small',
  작: 'small',
  좋다: 'good',
  좋: 'good',
  나쁘다: 'bad',
  나쁘: 'bad',
  중요하다: 'important',
  중요: 'important',
  빠르다: 'fast',
  빠르: 'fast',
  느리다: 'slow',
  느리: 'slow',
  피곤하다: 'tired',
  피곤: 'tired',
};

/** 한국어 동사 → 영어 동사 매핑 */
const KO_VERBS: Record<string, string> = {
  도착하: 'arrive',
  도착: 'arrive',
  일하: 'work',
  떠나: 'leave',
  시작하: 'start',
  시작: 'start',
  끝나: 'end',
  끝: 'end',
  알: 'know',
  오: 'come',
  가: 'go',
  자: 'sleep',
  잠: 'sleep',
};

/** 한국어 명사 → 영어 명사 매핑 */
const KO_NOUNS: Record<string, string> = {
  친구: 'friend',
  의사: 'doctor',
  서울: 'Seoul',
  부산: 'Busan',
  새: 'bird',
  아침: 'morning',
  날: 'day',
  나: 'me',
  커피: 'coffee',
  학교: 'school',
  책: 'book',
  기차: 'train',
  버스: 'bus',
};

/**
 * 한국어 특수 패턴 처리 (g7, g10, g13)
 * 파싱 전에 직접 문자열 매칭으로 처리
 */
function handleSpecialKoreanPatterns(text: string): string | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // ============================================
  // g7: 비교급 패턴
  // ============================================

  // 그만큼 + 형용사 + -지 않다 → not as {adj} as
  const notEqualMatch = cleaned.match(/^그만큼\s+(.+?)지\s*않다$/);
  if (notEqualMatch) {
    const adj = extractKoAdjective(notEqualMatch[1]);
    if (adj) return `not as ${adj} as`;
  }

  // 그만큼 + 형용사 → as {adj} as
  const equalMatch = cleaned.match(/^그만큼\s+(.+)$/);
  if (equalMatch) {
    const adj = extractKoAdjective(equalMatch[1]);
    if (adj) return `as ${adj} as`;
  }

  // 덜 + 형용사 → less {adj}
  const lessMatch = cleaned.match(/^덜\s+(.+)$/);
  if (lessMatch) {
    const adj = extractKoAdjective(lessMatch[1]);
    if (adj) return `less ${adj}`;
  }

  // 두 배 + 형용사 → twice as {adj}
  const twiceMatch = cleaned.match(/^두\s*배\s+(.+)$/);
  if (twiceMatch) {
    const adj = extractKoAdjective(twiceMatch[1]);
    if (adj) return `twice as ${adj}`;
  }

  // 훨씬 (더) + 형용사 → much {adj:comparative}
  const muchMatch = cleaned.match(/^훨씬\s+(더\s+)?(.+)$/);
  if (muchMatch) {
    const adj = extractKoAdjective(muchMatch[2]);
    if (adj) return `much ${toComparative(adj)}`;
  }

  // 단연 (가장) + 형용사 → by far the {adj:superlative}
  const byFarMatch = cleaned.match(/^단연\s+(가장\s+)?(.+)$/);
  if (byFarMatch) {
    const adj = extractKoAdjective(byFarMatch[2]);
    if (adj) return `by far the ${toSuperlative(adj)}`;
  }

  // ============================================
  // g10: 부사절 패턴
  // ============================================

  // V-ㄹ 때 / V-을 때 → when I V
  const whenMatch = cleaned.match(/^(.+?)(할|을)\s*때$/);
  if (whenMatch) {
    const verb = extractKoVerb(whenMatch[1]);
    if (verb) return `when I ${verb}`;
  }

  // V-는 동안 → while V-ing
  const whileMatch = cleaned.match(/^(.+?)는\s*동안$/);
  if (whileMatch) {
    const verb = extractKoVerb(whileMatch[1]);
    if (verb) return `while ${toIng(verb)}`;
  }

  // V-기 전에 → before V-ing
  const beforeMatch = cleaned.match(/^(.+?)기\s*전에$/);
  if (beforeMatch) {
    const verb = extractKoVerb(beforeMatch[1]);
    if (verb) return `before ${toIng(verb)}`;
  }

  // V-ㄴ/은 후에 → after V-ing
  const afterMatch = cleaned.match(/^(.+?)(한|은)\s*후에$/);
  if (afterMatch) {
    const verb = extractKoVerb(afterMatch[1]);
    if (verb) return `after ${toIng(verb)}`;
  }

  // V-ㄴ/은 이후로 → since V-ing
  const sinceMatch = cleaned.match(/^(.+?)(한|은)\s*이후로?$/);
  if (sinceMatch) {
    const verb = extractKoVerb(sinceMatch[1]);
    if (verb) return `since ${toIng(verb)}`;
  }

  // V-ㄹ 때까지 → until it V-s
  const untilMatch = cleaned.match(/^(.+?)(날|ㄹ)\s*때까지$/);
  if (untilMatch) {
    const verb = extractKoVerb(untilMatch[1]);
    if (verb) return `until it ${verb}s`;
  }

  // 비가 오기 때문에 → because it rains
  const becauseMatch = cleaned.match(/^(.+?)(가|이)\s*(.+?)기\s*때문에$/);
  if (becauseMatch) {
    const subject = becauseMatch[1] === '비' ? 'it' : becauseMatch[1];
    const verb = extractKoVerb(becauseMatch[3]);
    if (verb) {
      const enVerb = verb === 'come' ? 'rains' : `${verb}s`;
      return `because ${subject} ${enVerb}`;
    }
  }

  // V-지만 → although it V-s (only for weather patterns)
  // Skip this pattern as it conflicts with clause parsing

  // 너무 + ADJ + -서 + V-ㅆ다 → so ADJ that I V-ed
  // 예: 너무 피곤해서 잤다 → so tired that I slept
  const soThatMatch = cleaned.match(/^너무\s+(.+?)(해서|아서|어서)\s*(.+?)다$/);
  if (soThatMatch) {
    const adjStem = soThatMatch[1];
    const verbStem = soThatMatch[3];
    // 피곤 → tired
    const adj = extractKoAdjective(adjStem + '하다') || extractKoAdjective(adjStem);
    // 잤 → 자 (remove 받침 ㅆ which indicates past tense)
    const verbBase = removeKoreanFinal(verbStem);
    const verb = extractKoVerb(verbBase);
    if (adj && verb) {
      return `so ${adj} that I ${toPastTense(verb)}`;
    }
  }

  // V-자마자 → as soon as I V-ed
  const asSoonAsMatch = cleaned.match(/^(.+?)자마자$/);
  if (asSoonAsMatch) {
    const verb = extractKoVerb(asSoonAsMatch[1]);
    if (verb) return `as soon as I ${toPastTense(verb)}`;
  }

  // V-는 것처럼 → as if I V
  // 아는 것처럼 → as if I know (아는 = 알다 + -는)
  // 가는 것처럼 → as if I go
  const asIfMatch = cleaned.match(/^(.+)는\s*것처럼$/);
  if (asIfMatch) {
    // "아는" → "아" → 알 (need to reconstruct stem)
    const stemWithoutNun = asIfMatch[1];
    // For ㄹ-final verbs: 알 → 아 + 는 (ㄹ drops before 는)
    // Need to add back ㄹ for 아 → 알
    let verb = extractKoVerb(stemWithoutNun);
    if (!verb) {
      // Try adding ㄹ back (아 → 알)
      const withRieul = addKoreanRieul(stemWithoutNun);
      verb = extractKoVerb(withRieul);
    }
    if (verb) return `as if I ${verb}`;
  }

  // ============================================
  // g13: 조사 패턴 (단일 단어만)
  // ============================================

  // 단일 단어+조사만 처리 (띄어쓰기 없음)
  if (!cleaned.includes(' ') && cleaned.length >= 2) {
    // 친구에게 → to friend
    if (cleaned.endsWith('에게')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `to ${en}`;
    }

    // 의사로서 → as a doctor
    if (cleaned.endsWith('로서')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `as a ${en}`;
    }

    // 서울까지 → to Seoul / until Seoul
    if (cleaned.endsWith('까지')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `to ${en} / until ${en}`;
    }

    // 아침부터 → from morning
    if (cleaned.endsWith('부터')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `from ${en}`;
    }

    // 날마다 → every day
    if (cleaned.endsWith('마다')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `every ${en}`;
    }

    // 나보다 → than me
    if (cleaned.endsWith('보다')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `than ${en}`;
    }

    // 새처럼 → like a bird
    if (cleaned.endsWith('처럼')) {
      const ko = cleaned.slice(0, -2);
      const en = translateKoNoun(ko);
      if (en) return `like a ${en}`;
    }

    // 커피나 → coffee or
    if (cleaned.endsWith('나') && cleaned.length > 2) {
      const ko = cleaned.slice(0, -1);
      const en = translateKoNoun(ko);
      if (en) return `${en} or`;
    }

    // 내가 → I (subject)
    if (cleaned === '내가') return 'I (subject)';
  }

  return null;
}

/** 한국어 형용사 추출 */
function extractKoAdjective(text: string): string | null {
  const stem = text.endsWith('다') ? text.slice(0, -1) : text;
  // 하다 제거
  const base = stem.endsWith('하') ? stem.slice(0, -1) : stem;
  return KO_ADJECTIVES[text] || KO_ADJECTIVES[stem] || KO_ADJECTIVES[base] || null;
}

/** 한국어 명사 번역 */
function translateKoNoun(ko: string): string | null {
  return KO_NOUNS[ko] || null;
}

/** 한국어 동사 추출 */
function extractKoVerb(text: string): string | null {
  return KO_VERBS[text] || KO_VERBS[text + '하'] || null;
}

/** 영어 비교급 생성 */
function toComparative(adj: string): string {
  const irregulars: Record<string, string> = { good: 'better', bad: 'worse' };
  if (irregulars[adj]) return irregulars[adj];
  if (adj.endsWith('e')) return `${adj}r`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(adj)) {
    return `${adj}${adj[adj.length - 1]}er`;
  }
  return `${adj}er`;
}

/** 영어 최상급 생성 */
function toSuperlative(adj: string): string {
  const irregulars: Record<string, string> = { good: 'best', bad: 'worst' };
  if (irregulars[adj]) return irregulars[adj];
  if (adj.endsWith('e')) return `${adj}st`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(adj)) {
    return `${adj}${adj[adj.length - 1]}est`;
  }
  return `${adj}est`;
}

/** 영어 -ing 형태 생성 */
function toIng(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee')) return `${verb.slice(0, -1)}ing`;
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }
  return `${verb}ing`;
}

/** 한국어 글자에서 받침 제거 (잤 → 자) */
function removeKoreanFinal(char: string): string {
  if (char.length !== 1) return char;
  const code = char.charCodeAt(0);
  // Check if it's a Korean syllable (0xAC00 ~ 0xD7A3)
  if (code < 0xac00 || code > 0xd7a3) return char;
  const offset = code - 0xac00;
  const final = offset % 28;
  if (final === 0) return char; // No final consonant
  // Reconstruct without final
  return String.fromCharCode(0xac00 + Math.floor(offset / 28) * 28);
}

/** 한국어 글자에 받침 ㄹ 추가 (아 → 알) */
function addKoreanRieul(char: string): string {
  if (char.length !== 1) return char;
  const code = char.charCodeAt(0);
  // Check if it's a Korean syllable (0xAC00 ~ 0xD7A3)
  if (code < 0xac00 || code > 0xd7a3) return char;
  const offset = code - 0xac00;
  const final = offset % 28;
  if (final !== 0) return char; // Already has final consonant
  // Add ㄹ (8) as final consonant
  return String.fromCharCode(code + 8);
}

// 타입 re-export
export type { Direction, Formality, TranslationResult } from './types';
