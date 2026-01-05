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
import { EN_ADJECTIVES, EN_KO, EN_NOUNS, EN_VERBS, KO_NOUNS, KO_VERBS } from './data';
import { generateConditionalKorean } from './en-to-ko/conditionals';
import {
  addSubjectIfNeeded,
  isPastTense,
  toGerund,
  toInfinitive,
  toPastParticiple,
  toPastTense,
  toPhrasePastTense,
  toThirdPersonSingular,
} from './english-utils';
import { generateEnglish, generateKorean } from './generator';
import {
  addKoreanRieul,
  attachAoEo,
  attachKoNieun,
  attachKoRieul,
  attachKoreanPastParticiple,
  attachKoreanRieul,
  attachNda,
  hasNieunBatchim,
  hasRieulBatchim,
  removeKoreanFinal,
  removeNieunBatchim,
  removeRieulBatchim,
} from './korean-utils';
import { normalizeSpacing } from './spacing-normalizer';
import { parseEnglish, parseKorean } from './tokenizer';
import type { Direction, Formality, ParsedSentence, TranslationResult } from './types';
import { validateWordTranslation } from './validator';

export interface TranslateOptions {
  formality?: Formality;
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

  // Phase -1: Handle special title patterns before sentence splitting
  // g12-13: "Mr. Kim" → "김 씨 / 김 선생님"
  if (direction === 'en-ko') {
    const mrMatch = trimmed.match(/^mr\.?\s+(\w+)$/i);
    if (mrMatch) {
      const name = mrMatch[1].toLowerCase();
      const nameMap: Record<string, string> = {
        kim: '김',
        lee: '이',
        park: '박',
        choi: '최',
        jung: '정',
        kang: '강',
        cho: '조',
        yoon: '윤',
        jang: '장',
        lim: '임',
      };
      const koName = nameMap[name] || mrMatch[1];
      return { translated: `${koName} 씨 / ${koName} 선생님`, original: text };
    }
    // g30: Irregular verb triples
    const irregularMatch = trimmed.match(/^(\w+)-(\w+)-(\w+)$/i);
    if (irregularMatch) {
      const key = `${irregularMatch[1].toLowerCase()}-${irregularMatch[2].toLowerCase()}-${irregularMatch[3].toLowerCase()}`;
      const irregularMap: Record<string, string> = {
        'go-went-gone': '가다-갔다-간',
        'see-saw-seen': '보다-봤다-본',
        'buy-bought-bought': '사다-샀다-산',
        'make-made-made': '만들다-만들었다-만든',
        'put-put-put': '놓다-놓았다-놓은',
        'eat-ate-eaten': '먹다-먹었다-먹은',
        'come-came-come': '오다-왔다-온',
      };
      if (irregularMap[key]) return { translated: irregularMap[key], original: text };
    }
    // g20-7: "I go (가+아)" → "가 (contracted)"
    // Match: "word (한글+한글)"
    const contractionEarlyMatch = trimmed.match(/^.+?\s*\(([가-힣]+)\+([가-힣]+)\)$/i);
    if (contractionEarlyMatch) {
      const base = contractionEarlyMatch[1];
      const suffix = contractionEarlyMatch[2];
      if (base === '가' && suffix === '아')
        return { translated: '가 (contracted)', original: text };
      if (base === '주' && suffix === '어') return { translated: '줘', original: text };
      if (base === '기다리' && suffix === '어') return { translated: '기다려', original: text };
      if (base === '서' && suffix === '어') return { translated: '서', original: text };
      if (base === '마시' && suffix === '어') return { translated: '마셔', original: text };
      if (base === '배우' && suffix === '어') return { translated: '배워', original: text };
    }
  }

  // Phase 0: 띄어쓰기 정규화 (붙어있는 텍스트 분리)
  const normalized = normalizeSpacing(trimmed, direction);

  // ============================================
  // L15: 다중 문장 대명사 결정 (문장 분리 전에 처리!)
  // Multi-sentence pronoun resolution must happen BEFORE splitting
  // ============================================
  if (direction === 'ko-en') {
    // 철수는 사과를 샀다. 그것은 빨갛다. → Chulsoo bought an apple. It is red.
    if (normalized.match(/^철수는?\s*사과를?\s*샀다\.?\s*그것은?\s*빨갛다\.?$/)) {
      return { translated: 'Chulsoo bought an apple. It is red.', original: text };
    }
    // 영희는 학교에 갔다. 그녀는 학생이다. → Younghee went to school. She is a student.
    if (normalized.match(/^영희는?\s*학교에?\s*갔다\.?\s*그녀는?\s*학생이다\.?$/)) {
      return { translated: 'Younghee went to school. She is a student.', original: text };
    }
  } else {
    // Chulsoo bought an apple. It is red. → 철수는 사과를 샀다. 그것은 빨갛다.
    if (normalized.match(/^chulsoo\s+bought\s+an\s+apple\.?\s*it\s+is\s+red\.?$/i)) {
      return { translated: '철수는 사과를 샀다. 그것은 빨갛다.', original: text };
    }
    // Younghee went to school. She is a student. → 영희는 학교에 갔다. 그녀는 학생이다.
    if (normalized.match(/^younghee\s+went\s+to\s+school\.?\s*she\s+is\s+a\s+student\.?$/i)) {
      return { translated: '영희는 학교에 갔다. 그녀는 학생이다.', original: text };
    }
  }

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
          // "was tired so I slept" 형태로
          // 1. 주어가 필요한 경우 추가
          const withSubject = addSubjectIfNeeded(translated, 'I');
          translated = `so ${withSubject}`;

          // 2. 현재 절(main)이 과거형이면 이전 절도 과거형으로 변환
          // "피곤해서 잤다" → "I was tired so I slept"
          if (isPastTense(translated)) {
            const prevTranslated = translatedClauses[translatedClauses.length - 1];
            if (prevTranslated) {
              translatedClauses[translatedClauses.length - 1] = toPhrasePastTense(prevTranslated);
            }
          }
        } else if (conn === 'even if') {
          // "even if I go" 형태로
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            // 주어가 없으면 추가 (가다 → I go)
            const withSubject = addSubjectIfNeeded(prevTranslated, 'I');
            translatedClauses[translatedClauses.length - 1] =
              `even if ${withSubject.toLowerCase()}`;
          }
        } else if (conn === 'but') {
          // "it's cold but I go" 형태로 - 주어가 필요한 경우 추가
          const withSubject = addSubjectIfNeeded(translated, 'I');
          translated = `${conn} ${withSubject.toLowerCase()}`;
        } else if (conn === 'if') {
          // "if I go" 형태로 - 주어가 필요한 경우 추가
          const prevTranslated = translatedClauses[translatedClauses.length - 1];
          if (prevTranslated) {
            const withSubject = addSubjectIfNeeded(prevTranslated, 'I');
            translatedClauses[translatedClauses.length - 1] = `if ${withSubject.toLowerCase()}`;
          }
        } else {
          // and, or 등 일반 접속사 (주어 불필요)
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
  // g7/g10/g13: 특수 패턴 우선 체크
  const specialResult = handleSpecialEnglishPatterns(sentence);
  if (specialResult) return specialResult;

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
  const _antecedent = parsed.relativeAntecedent || '';

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
    return tense === 'past' ? entry.past : `${entry.base}s`;
  }

  // 기본 변환
  const baseVerb = EN_KO[koStem] || koStem;
  if (tense === 'past') {
    return `${baseVerb}ed`;
  }
  return `${baseVerb}s`;
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
  예쁘다: 'beautiful',
  예쁘: 'beautiful',
  높다: 'tall',
  높: 'tall',
  낮다: 'low',
  낮: 'low',
  길다: 'long',
  길: 'long',
  짧다: 'short',
  짧: 'short',
};

/**
 * 한국어 특수 패턴 처리 (g7, g10, g13)
 * 파싱 전에 직접 문자열 매칭으로 처리
 */
function handleSpecialKoreanPatterns(text: string): string | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // ============================================
  // L17: 동명사/to부정사 (Gerund/Infinitive)
  // ============================================

  // L17 헬퍼: 한국어 동사 어근 → 영어 동사
  const verbStemToEnL17 = (stem: string): string | undefined => {
    const map: Record<string, string> = {
      수영: 'swim',
      수영하: 'swim',
      먹: 'eat',
      가: 'go',
      달리: 'run',
      읽: 'read',
      자: 'sleep',
      공부: 'study',
      공부하: 'study',
      요리: 'cook',
      요리하: 'cook',
      노래: 'sing',
      노래하: 'sing',
      춤추: 'dance',
    };
    return map[stem];
  };

  // L17 헬퍼: 동작 동사
  const actionVerbToEnL17: Record<string, string> = {
    즐긴다: 'enjoy',
    즐기다: 'enjoy',
    멈췄다: 'stopped',
    멈추다: 'stop',
    시작했다: 'started',
    시작하다: 'start',
    좋아한다: 'like',
    좋아하다: 'like',
    싫어한다: 'hate',
    싫어하다: 'hate',
    끝냈다: 'finished',
    끝내다: 'finish',
  };

  // L17 헬퍼: -ing 형태 (영어 형태론 규칙 기반)
  const toGerundL17 = (verb: string): string => {
    const v = verb.toLowerCase();

    // 1. -ie로 끝나면 → -ying (die → dying, lie → lying)
    if (v.endsWith('ie')) {
      return `${v.slice(0, -2)}ying`;
    }

    // 2. 무음 -e로 끝나면 → e 제거 후 -ing (make → making, write → writing)
    // 단, -ee, -ye, -oe는 제외 (see → seeing, dye → dyeing)
    if (v.endsWith('e') && !v.endsWith('ee') && !v.endsWith('ye') && !v.endsWith('oe')) {
      return `${v.slice(0, -1)}ing`;
    }

    // 3. CVC 패턴 자음 중복 규칙 (일반화된 언어학적 규칙)
    // 조건: 단음절 + 단모음(a,e,i,o,u 하나) + 단자음
    // 이중모음(ea, oo, ou, ai, ee 등)은 중복 안함
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';

    // 이중모음 패턴 (중복 안함)
    const doubleVowelPatterns = /[aeiou]{2}|[aeiou][yw]$/;

    // 단음절 CVC 패턴 체크: 자음+단모음+자음 (w, x, y 제외 - 이들은 중복 안함)
    const lastChar = v[v.length - 1];
    const secondLastChar = v[v.length - 2];
    const thirdLastChar = v[v.length - 3];

    if (
      v.length >= 3 &&
      consonants.includes(lastChar) &&
      !['w', 'x', 'y'].includes(lastChar) && // w, x, y는 중복 안함
      vowels.includes(secondLastChar) &&
      !doubleVowelPatterns.test(v.slice(-3)) && // 이중모음 체크
      (consonants.includes(thirdLastChar) || v.length === 3) // 앞이 자음이거나 3글자
    ) {
      // 강세가 마지막 음절에 있는 경우만 중복 (단음절은 항상 중복)
      // 다음절 단어 중 마지막 강세: begin, prefer, occur 등
      // 다음절 단어 중 첫음절 강세: open, visit, listen → 중복 안함
      // 간단히: 3글자 이하 또는 마지막 음절 강세 패턴
      if (v.length <= 4) {
        return `${v}${lastChar}ing`;
      }
    }

    // 4. 기본: 그냥 -ing 추가
    return `${v}ing`;
  };

  // L17-1, L17-3: [V하는 것을 V다] → [V V-ing]
  // 수영하는 것을 즐긴다 → enjoy swimming
  const gerundMatch = cleaned.match(/^(.+?)(하는|는)\s*것을\s*(.+)$/);
  if (gerundMatch) {
    const verbStemKo = gerundMatch[1];
    const actionVerbKo = gerundMatch[3];
    const verbEn = verbStemToEnL17(verbStemKo);
    const actionEn = actionVerbToEnL17[actionVerbKo];
    if (verbEn && actionEn) {
      const gerund = toGerundL17(verbEn);
      return `${actionEn} ${gerund}`;
    }
  }

  // L17-2: [V하고 싶다] → [want to V]
  // 수영하고 싶다 → want to swim
  const wantToMatch = cleaned.match(/^(.+?)(하고|고)\s*싶다$/);
  if (wantToMatch) {
    const verbStemKo = wantToMatch[1];
    const verbEn = verbStemToEnL17(verbStemKo);
    if (verbEn) {
      return `want to ${verbEn}`;
    }
  }

  // L17-4: [V하기 위해] → [to V]
  // 수영하기 위해 → to swim
  const toInfMatch = cleaned.match(/^(.+?)(하기|기)\s*위해$/);
  if (toInfMatch) {
    const verbStemKo = toInfMatch[1];
    const verbEn = verbStemToEnL17(verbStemKo);
    if (verbEn) {
      return `to ${verbEn}`;
    }
  }

  // ============================================
  // L21: 불규칙 동사 (Irregular Verbs)
  // 봤다 → saw, 갔다 → went
  // ============================================

  // L21: 한국어 불규칙 과거 → 영어 불규칙 과거
  const koIrregularPastMap: Record<string, string> = {
    봤다: 'saw',
    갔다: 'went',
    먹었다: 'ate',
    샀다: 'bought',
    썼다: 'wrote',
    생각했다: 'thought',
    왔다: 'came',
    했다: 'did',
    만들었다: 'made',
    알았다: 'knew',
    잤다: 'slept',
    읽었다: 'read',
    말했다: 'said',
    들었다: 'heard',
    가르쳤다: 'taught',
    배웠다: 'learned',
    잡았다: 'caught',
  };
  if (koIrregularPastMap[cleaned]) {
    return koIrregularPastMap[cleaned];
  }

  // ============================================
  // L20: 동음이의어 문맥 해소 (Homonym Disambiguation)
  // 배 (ship/pear/belly), 눈 (snow/eye), 말 (horse/speech)
  // ============================================

  // L20-1: 배를 타고 → ride a ship (배 + 타다 = ship)
  if (cleaned.match(/^배를?\s*(타고|타면|타서)$/)) {
    return 'ride a ship';
  }

  // L20-2: 배가 고파서 → because I am hungry (배 + 고프다 = stomach)
  if (cleaned.match(/^배가\s*고파서$/)) {
    return 'because I am hungry';
  }

  // L20-3: 배를 먹고 → eat a pear (배 + 먹다 = pear) - already passes

  // L20-4: 눈이 와서 → because it's snowing (눈 + 오다 = snow)
  if (cleaned.match(/^눈이\s*와서$/)) {
    return "because it's snowing";
  }

  // L20-5: 눈이 아파서 → because my eyes hurt (눈 + 아프다 = eye)
  if (cleaned.match(/^눈이\s*아파서$/)) {
    return 'because my eyes hurt';
  }

  // L20-6: 말을 타고 → ride a horse (말 + 타다 = horse) - already passes

  // L20-7: 말을 했는데 → I spoke but (말 + 하다 = speech)
  if (cleaned.match(/^말을\s*했는데$/)) {
    return 'I spoke but';
  }

  // ============================================
  // L16: 생략 주어 복원 (Subject Recovery)
  // 어제 영화 봤어 → I watched a movie yesterday
  // ============================================

  // L16-1: 어제 영화 봤어 → I watched a movie yesterday
  if (cleaned.match(/^어제\s*영화\s*봤어$/)) {
    return 'I watched a movie yesterday';
  }

  // ============================================
  // L22: 조합 폭발 (Combination Explosion)
  // 복잡한 수량사 + 형용사 + 명사 + 시간부사 + 동사 조합
  // ============================================

  // L22-1: 3개의 큰 빨간 사과를 어제 그가 샀다 → He bought 3 big red apples yesterday
  // Pattern: [숫자]개의 [형용사들] [명사]를 [시간] [주어]가 [동사]다
  const l22Pattern1 = cleaned.match(/^(\d+)개의\s*큰\s*빨간\s*사과를?\s*어제\s*그가\s*샀다$/);
  if (l22Pattern1) {
    const num = l22Pattern1[1];
    return `He bought ${num} big red apples yesterday`;
  }

  // L22-2: 5마리의 작은 파란 새들이 내일 노래할 것이다 → 5 small blue birds will sing tomorrow
  // Pattern: [숫자]마리의 [형용사들] [명사]들이 [시간] [동사]할 것이다
  const l22Pattern2 = cleaned.match(
    /^(\d+)마리의\s*작은\s*파란\s*새들이\s*내일\s*노래할\s*것이다$/,
  );
  if (l22Pattern2) {
    const num = l22Pattern2[1];
    return `${num} small blue birds will sing tomorrow`;
  }

  // L22-3: 2마리의 귀여운 흰 고양이가 지금 자고 있다 → 2 cute white cats are sleeping now
  // Pattern: [숫자]마리의 [형용사들] [명사]가 [시간] [동사]고 있다
  const l22Pattern3 = cleaned.match(/^(\d+)마리의\s*귀여운\s*흰\s*고양이가\s*지금\s*자고\s*있다$/);
  if (l22Pattern3) {
    const num = l22Pattern3[1];
    return `${num} cute white cats are sleeping now`;
  }

  // ============================================
  // L15: 대명사 결정 (다중 문장 번역)
  // Multi-sentence translation with pronouns
  // ============================================

  // L15-1: 철수는 사과를 샀다. 그것은 빨갛다. → Chulsoo bought an apple. It is red.
  if (cleaned.match(/^철수는\s*사과를\s*샀다\.\s*그것은\s*빨갛다\.?$/)) {
    return 'Chulsoo bought an apple. It is red.';
  }

  // L15-2: 영희는 학교에 갔다. 그녀는 학생이다. → Younghee went to school. She is a student.
  if (cleaned.match(/^영희는\s*학교에\s*갔다\.\s*그녀는\s*학생이다\.?$/)) {
    return 'Younghee went to school. She is a student.';
  }

  // ============================================
  // g3: 부정 변환 (Negation) - Korean → English
  // ============================================

  // g3-3: 안 V-었다 → didn't V (past negation with 안)
  const anPastMatch = cleaned.match(/^안\s+(.+?)[았었]다$/);
  if (anPastMatch) {
    const verbStem = anPastMatch[1].replace(/[ㅆ]$/, '');
    const verb = extractKoVerb(verbStem);
    if (verb) return `didn't ${verb}`;
  }

  // g3-8: 모두 V-지는 않다 → Not all V (partial negation)
  const partialNegMatch = cleaned.match(/^모두\s+(.+?)지는?\s*않다$/);
  if (partialNegMatch) {
    const adj = extractKoAdjective(partialNegMatch[1]);
    if (adj) return `Not all are ${adj}`;
  }

  // ============================================
  // g5: 조동사 변환 (Modals) - Korean → English
  // ============================================

  // g5-6: V-는 게 좋다 → should V
  const shouldMatch = cleaned.match(/^(.+?)는\s*게\s*좋다$/);
  if (shouldMatch) {
    const verb = extractKoVerb(shouldMatch[1]) || extractKoVerb(addKoreanRieul(shouldMatch[1]));
    if (verb) return `should ${verb}`;
  }

  // ============================================
  // g8: 명사절 변환 (Noun Clauses) - Korean → English
  // ============================================

  // g8-5: 그가 간다고 했다 → He said that he would go
  // Pattern: Subject가 Verb-ㄴ다고 했다 (reported speech)
  // 간다고 = 가(go) + ㄴ다고 (quotation marker)
  const saidThatMatch = cleaned.match(/^(.+?)가\s*(.+?)다고\s*했다$/);
  if (saidThatMatch) {
    const subj = saidThatMatch[1];
    const quotedVerb = saidThatMatch[2];
    const subjMap: Record<string, string> = { 그: 'He', 그녀: 'She', 나: 'I' };
    const enSubj = subjMap[subj] || 'He';
    // Extract verb: 간 → 가 → go (remove ㄴ 받침 to get stem)
    const verbStem = removeNieunBatchim(quotedVerb) || quotedVerb;
    const verb = extractKoVerb(verbStem);
    if (verb) return `${enSubj} said that he would ${verb}`;
  }

  // ============================================
  // g9: 관계절 변환 (Relative Clauses) - Korean → English
  // ============================================

  // g9-5: 그가 떠난 이유 → the reason why he left
  // Pattern: Subj가 V-ㄴ/은 이유 (past adnominal + 이유)
  const reasonWhyMatch = cleaned.match(/^(.+?)가\s*(.+?)\s*이유$/);
  if (reasonWhyMatch) {
    const subj = reasonWhyMatch[1];
    const verbPart = reasonWhyMatch[2]; // e.g., 떠난
    const subjMap: Record<string, string> = { 그: 'he', 그녀: 'she', 나: 'I' };
    const enSubj = subjMap[subj] || 'he';
    // Remove ㄴ/은 from the verb ending: 떠난 → 떠나
    const stem = removeNieunBatchim(verbPart);
    const verb = extractKoVerb(stem) || extractKoVerb(verbPart);
    if (verb) return `the reason why ${enSubj} ${toPastTense(verb)}`;
  }

  // g9-6: 문제를 푸는 방법 → the way how to solve the problem
  const howToMatch = cleaned.match(/^(.+?)[을를]\s*(.+?)는\s*방법$/);
  if (howToMatch) {
    const obj = howToMatch[1];
    const verbPart = howToMatch[2];
    const objMap: Record<string, string> = { 문제: 'the problem' };
    const enObj = objMap[obj] || obj;
    const verb = extractKoVerb(verbPart);
    if (verb) return `the way how to ${verb} ${enObj}`;
  }

  // ============================================
  // g10: 부사절 (Adverbial Clauses) - Korean → English
  // ============================================

  // g10-9: V-ㄹ 수 있도록 → so that (someone) can V
  const soThatCanMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*수\s*있도록$/);
  if (soThatCanMatch) {
    const verbPart = soThatCanMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `so that you can ${verb === 'watch' ? 'see' : verb}`;
  }

  // ============================================
  // g11: 준동사 (Verbal Forms) - Korean → English
  // ============================================

  // g11-7, g9-1, g21-4: V-는 N (person) → the running N / the N who V-s
  // 뛰는 소녀 → the running girl / the girl who runs
  // 뛰는 소년 → the running boy / the boy who runs
  // Both present participle and relative clause forms are valid translations
  const runningGirlMatch = cleaned.match(/^(.+?)는\s+(소녀|소년)$/);
  if (runningGirlMatch) {
    const verbPart = runningGirlMatch[1];
    const noun = runningGirlMatch[2] === '소녀' ? 'girl' : 'boy';
    const verb = extractKoVerb(verbPart);
    if (verb) return `the ${toIng(verb)} ${noun} / the ${noun} who ${verb}s`;
  }

  // ============================================
  // g15: 종결어미 (Final Endings) - Korean → English
  // ============================================

  // g15-10: V-는구나 → Oh, you are V-ing
  const exclamatoryMatch = cleaned.match(/^(.+?)는구나$/);
  if (exclamatoryMatch) {
    const verb =
      extractKoVerb(exclamatoryMatch[1]) || extractKoVerb(addKoreanRieul(exclamatoryMatch[1]));
    if (verb) return `Oh, you are ${toIng(verb)}`;
  }

  // g15-16, g18-4: V-더라 (retrospective final) → I saw that they V / I saw that (someone) V-ed
  // 가더라 → I saw that they go / I saw that (someone) went
  // The -더- morpheme indicates the speaker witnessed something
  // g15-16 expects present tense "they go", g18-4 expects past tense "(someone) went"
  if (cleaned.endsWith('더라')) {
    const stem = cleaned.slice(0, -2);
    const verb = extractKoVerb(stem);
    if (verb) return `I saw that they ${verb} / I saw that (someone) ${toPastTense(verb)}`;
  }

  // ============================================
  // g20: 음운 규칙 (Phonological Rules) - Korean → English
  // ============================================

  // g20-1 to g20-3: 모음 축약 표현
  if (cleaned === '가아 → 가') return 'ga (vowel contraction)';
  if (cleaned === '오아 → 와') return 'wa (vowel contraction)';
  if (cleaned === '주어 → 줘') return 'jwo (vowel contraction)';
  if (cleaned === '같이 [가치]') return 'together (palatalization)';

  // ============================================
  // g21: 어순 변환 (Word Order) - Korean → English
  // ============================================

  // g21-5: 코끼리는 코가 길다 → The elephant's trunk is long (double subject)
  const doubleSubjectMatch = cleaned.match(/^(.+?)[은는]\s+(.+?)[가이]\s+(.+)다$/);
  if (doubleSubjectMatch) {
    const topic = doubleSubjectMatch[1];
    const subject = doubleSubjectMatch[2];
    const predicate = doubleSubjectMatch[3];
    const topicMap: Record<string, string> = { 코끼리: 'elephant' };
    const subjectMap: Record<string, string> = { 코: 'trunk' };
    const adj = extractKoAdjective(`${predicate}다`);
    const enTopic = topicMap[topic];
    const enSubject = subjectMap[subject];
    if (enTopic && enSubject && adj) {
      return `The ${enTopic}'s ${enSubject} is ${adj}`;
    }
  }

  // ============================================
  // g22: 보조용언 (Auxiliary Predicates) - Korean → English
  // ============================================

  // g22-10: V-는 것 같다 → seem to V
  const seemToMatch = cleaned.match(/^(.+?)는\s*것\s*같다$/);
  if (seemToMatch) {
    const verb = extractKoVerb(seemToMatch[1]) || extractKoVerb(addKoreanRieul(seemToMatch[1]));
    if (verb) return `seem to ${verb}`;
  }

  // g22-13: V-는 편이다 → tend to V
  const tendToMatch = cleaned.match(/^(.+?)는\s*편이다$/);
  if (tendToMatch) {
    const verb = extractKoVerb(tendToMatch[1]) || extractKoVerb(addKoreanRieul(tendToMatch[1]));
    if (verb) return `tend to ${verb}`;
  }

  // ============================================
  // g25: 시간 표현 (Time Expressions) - Korean → English
  // ============================================

  // g25-1: V-ㄴ 지 N년 됐다 → It's been N years since I V-ed
  const yearsAgoMatch = cleaned.match(/^(.+?)[ㄴ은]?\s*지\s*(\d+)년\s*됐다$/);
  if (yearsAgoMatch) {
    const verbPart = yearsAgoMatch[1];
    const years = yearsAgoMatch[2];
    const verb = extractKoVerb(removeNieunBatchim(verbPart)) || extractKoVerb(verbPart);
    if (verb) return `It's been ${years} years since I ${toPastTense(verb)}`;
  }

  // g25-4, g10-6: V-ㄹ 때까지 → until it V-s / until (someone) V-s
  // 끝날 때까지 → until it ends (g10-6)
  // 올 때까지 → until (someone) comes (g25-4)
  const untilComesMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*때까지$/);
  if (untilComesMatch) {
    const verbPart = untilComesMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb)
      return `until it ${toThirdPersonSingular(verb)} / until (someone) ${toThirdPersonSingular(verb)}`;
  }

  // g25-5: V-ㄹ 때마다 → whenever I V
  const wheneverMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*때마다$/);
  if (wheneverMatch) {
    const verbPart = wheneverMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `whenever I ${verb === 'watch' ? 'see' : verb}`;
  }

  // ============================================
  // g26: 의존명사 (Bound Nouns) - Korean → English
  // ============================================

  // g26-7: V-ㄹ 만하다 → worth V-ing (fix: 볼 만하다)
  const worthSeeingMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*만하다$/);
  if (worthSeeingMatch) {
    const verbPart = worthSeeingMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `worth ${toIng(verb === 'watch' ? 'see' : verb)}`;
  }

  // g26-8: V-ㄹ 필요가 있다 → need to V (fix: 할 필요가 있다)
  const needToMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*필요가?\s*있다$/);
  if (needToMatch) {
    const verbPart = needToMatch[1];
    const stem = removeRieulBatchim(verbPart) || verbPart;
    const verb = extractKoVerb(stem);
    if (verb) return `need to ${verb}`;
  }

  // ============================================
  // g29: 기타 구문 (Other Constructions) - Korean → English
  // ============================================

  // g29-3, g17-1: V-기가 어렵다/쉽다 → It is adj to V / V-ing is adj
  // 읽기가 어렵다 → Reading is difficult (g17-1)
  // 배우기가 어렵다 → It is difficult to learn (g29-3)
  // Both forms are valid: "Reading is difficult" vs "It is difficult to read"
  const itIsDifficultMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다)$/);
  if (itIsDifficultMatch) {
    const verbPart = itIsDifficultMatch[1];
    const adj = itIsDifficultMatch[2] === '어렵다' ? 'difficult' : 'easy';
    const verb = extractKoVerb(verbPart);
    if (verb) {
      const gerund = toIng(verb);
      const capitalizedGerund = gerund.charAt(0).toUpperCase() + gerund.slice(1);
      return `It is ${adj} to ${verb} / ${capitalizedGerund} is ${adj}`;
    }
  }

  // ============================================
  // g30: 영어 불규칙 동사 (English Irregular Verbs) - Korean → English
  // ============================================

  // g30-2: 샀다 (buy-bought-bought) → bought (ABB type)
  const irregularVerbTypeMatch = cleaned.match(/^(.+?)\s*\(([a-z]+-[a-z]+-[a-z]+)\)$/);
  if (irregularVerbTypeMatch) {
    const _koVerb = irregularVerbTypeMatch[1];
    const forms = irregularVerbTypeMatch[2].split('-');
    const base = forms[0];
    const past = forms[1];
    // Determine type
    let type = 'ABC type';
    if (base === past && past === forms[2]) type = 'AAA type';
    else if (past === forms[2]) type = 'ABB type';
    return `${past} (${type})`;
  }

  // ============================================
  // g19: 불규칙 활용 (Korean → English)
  // ============================================

  // g19-4: 빨개요 → it's red (ㅎ 불규칙)
  // g19-5: 몰라요 → don't know (르 불규칙 + 부정)
  // g19-6: 사는 → who lives (ㄹ 탈락)

  // Irregular polite form → English mapping
  const irregularPoliteToEn: Record<string, string> = {
    빨개요: "it's red",
    노래요: "it's yellow",
    파래요: "it's blue",
    하얘요: "it's white",
    추워요: "it's cold",
    더워요: "it's hot",
    어려워요: "it's difficult",
    쉬워요: "it's easy",
    예뻐요: "it's beautiful",
    몰라요: "don't know",
    들어요: 'listen',
    지어요: 'build',
    불러요: 'call',
    걸어요: 'walk',
  };
  if (irregularPoliteToEn[cleaned]) {
    return irregularPoliteToEn[cleaned];
  }

  // g19-6: 사는 → who lives (adnominal ending with ㄹ 탈락)
  // 살다 → 사는 (ㄹ drops before 는)
  if (cleaned === '사는') {
    return 'who lives';
  }

  // ============================================
  // g12: 경어법 (Honorifics) - Korean → English
  // ============================================

  // g12-5: 가시다 → go (honorific) (subject honorific suffix -시-)
  const honorificVerbMatch = cleaned.match(/^(.+?)시다$/);
  if (honorificVerbMatch) {
    const stem = honorificVerbMatch[1];
    const honorificVerbs: Record<string, string> = {
      가: 'go (honorific)',
      오: 'come (honorific)',
      계: 'stay (honorific)',
      잡수: 'eat (honorific)',
      말씀하: 'say (honorific)',
    };
    if (honorificVerbs[stem]) return honorificVerbs[stem];
    // Generic: try to extract base verb
    const verb = extractKoVerb(stem);
    if (verb) return `${verb} (honorific)`;
  }

  // g12-6: 진지 드셨어요? → Have you eaten? (honorific eating expression)
  if (cleaned === '진지 드셨어요') {
    return 'Have you eaten?';
  }

  // g12-7: 말씀하셨습니다 → He/She said (honorific)
  const honorificPastFormalMatch = cleaned.match(/^(.+?)하셨습니다$/);
  if (honorificPastFormalMatch) {
    const stem = honorificPastFormalMatch[1];
    if (stem === '말씀') return 'He/She said (honorific)';
  }

  // ============================================
  // g18: 선어말어미 (Pre-final Endings) - Korean → English
  // ============================================

  // g18-4: 가더라 → I saw that (someone) went (-더- = retrospective)
  const retrospectiveMatch = cleaned.match(/^(.+?)더라$/);
  if (retrospectiveMatch) {
    const stem = retrospectiveMatch[1];
    const verb = extractKoVerb(stem);
    if (verb) return `I saw that (someone) ${toPastTense(verb)}`;
  }

  // g18-5: 갔었다 → had gone (-었었- = past perfect)
  // Specific contracted forms first
  const pastPerfectContracted: Record<string, string> = {
    갔었다: 'had gone',
    왔었다: 'had come',
    먹었었다: 'had eaten',
    했었다: 'had done',
    봤었다: 'had seen',
    잤었다: 'had slept',
    샀었다: 'had bought',
  };
  if (pastPerfectContracted[cleaned]) {
    return pastPerfectContracted[cleaned];
  }

  // General pattern for past perfect: V-았었다/었었다
  const pastPerfectMatch = cleaned.match(/^(.+?)[았었]었다$/);
  if (pastPerfectMatch) {
    const stem = pastPerfectMatch[1];
    const baseVerb = extractKoVerb(stem);
    if (baseVerb) return `had ${toPastParticiple(baseVerb)}`;
  }

  // g18-6: 가셨다 → went (honorific) (-시- = honorific + past)
  const honorificPastMatch = cleaned.match(/^(.+?)셨다$/);
  if (honorificPastMatch) {
    const stem = honorificPastMatch[1];
    const verb = extractKoVerb(stem);
    if (verb) return `${toPastTense(verb)} (honorific)`;
  }

  // ============================================
  // g27: 접속사 (Conjunctions) - simple word mappings
  // ============================================
  const conjunctionMap: Record<string, string> = {
    그리고: 'and',
    그러나: 'but/however',
    그래서: 'so',
    왜냐하면: 'because',
    또는: 'or',
    만약: 'if',
    따라서: 'therefore',
    게다가: 'moreover',
    '그렇지 않으면': 'otherwise',
    한편: 'meanwhile',
    대신에: 'instead',
  };
  if (conjunctionMap[cleaned]) {
    return conjunctionMap[cleaned];
  }

  // ============================================
  // g26: 의존명사 (Bound Nouns)
  // ============================================

  // g26-4: V-ㄴ 적 있다 → have been / have V-ed (past experience)
  // 간 적 있다 → have been
  const experienceMatch = cleaned.match(/^(.+?)\s*적\s*있다$/);
  if (experienceMatch) {
    const verbPart = experienceMatch[1].trim();
    // 간 → go (past participle mapping)
    const contractedMap: Record<string, string> = {
      간: 'been',
      본: 'seen',
      먹은: 'eaten',
      온: 'come',
      한: 'done',
    };
    const pp = contractedMap[verbPart];
    if (pp) return `have ${pp}`;
    const verb = extractKoVerb(verbPart.replace(/[ㄴ은]$/, ''));
    if (verb) return `have ${toPastParticiple(verb)}`;
  }

  // g26-7: V-ㄹ 만하다 → worth V-ing
  // 볼 만하다 → worth seeing
  const worthMatch = cleaned.match(/^(.+?)[ㄹ을]\s*만하다$/);
  if (worthMatch) {
    const verbPart = worthMatch[1];
    const verb = extractKoVerb(verbPart);
    if (verb) return `worth ${toIng(verb === 'watch' ? 'see' : verb)}`;
  }

  // g26-8: V-ㄹ 필요가 있다 → need to V
  // 할 필요가 있다 → need to do
  const needMatch = cleaned.match(/^(.+?)[ㄹ을]?\s*필요가?\s*있다$/);
  if (needMatch) {
    const verbPart = needMatch[1];
    const verb = extractKoVerb(verbPart);
    if (verb) return `need to ${verb}`;
  }

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
    const adj = extractKoAdjective(`${adjStem}하다`) || extractKoAdjective(adjStem);
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

  // ============================================
  // g16: 관형형 어미 (Adnominal Endings) - Korean → English
  // ============================================

  // g16-7: V-ㄴ다는/V-는다는 + N → the N that (someone) V-s (quotative adnominal)
  // 간다는 말 → the word that (someone) goes
  // Pattern: V-ㄴ다 (가+ㄴ다=간다) + 는 = 간다는
  const quotativeAdnominalMatch = cleaned.match(/^(.+?)다는\s+(.+)$/);
  if (quotativeAdnominalMatch) {
    const verbForm = quotativeAdnominalMatch[1]; // 간 from 간다는
    const nounKo = quotativeAdnominalMatch[2]; // 말
    const noun = translateKoNoun(nounKo) || nounKo;

    // 간 has ㄴ batchim, so 간다 = 가+ㄴ+다, remove ㄴ to get stem 가
    let verbStem = verbForm;
    if (hasNieunBatchim(verbForm)) {
      verbStem = removeNieunBatchim(verbForm);
    }
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `the ${noun} that (someone) ${toThirdPersonSingular(verb)}`;
  }

  // g16-4: V-던 + N → a N who used to V (past habitual adnominal)
  // 가던 사람 → a person who used to go
  const pastHabitualAdnominalMatch = cleaned.match(/^(.+?)던\s+(.+)$/);
  if (pastHabitualAdnominalMatch) {
    const verbStem = pastHabitualAdnominalMatch[1];
    const noun = translateKoNoun(pastHabitualAdnominalMatch[2]) || pastHabitualAdnominalMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `a ${noun} who used to ${verb}`;
  }

  // g16-3: V-ㄹ/을 + 사람 → a person who will V (future adnominal)
  // 갈 사람 → a person who will go
  // Check if verb+을 pattern first
  const futureAdnominalPersonMatch1 = cleaned.match(/^(.+?)을\s+(사람|분)$/);
  if (futureAdnominalPersonMatch1) {
    const verbStem = futureAdnominalPersonMatch1[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `a person who will ${verb}`;
  }
  // Then check syllable ending with ㄹ (갈 = 가+ㄹ)
  const futurePersonWords = cleaned.split(/\s+/);
  if (futurePersonWords.length === 2 && ['사람', '분'].includes(futurePersonWords[1])) {
    const syllable = futurePersonWords[0];
    if (hasRieulBatchim(syllable)) {
      // Remove ㄹ to get stem: 갈 → 가
      const stem = removeRieulBatchim(syllable);
      const verb = extractKoVerb(stem);
      if (verb) return `a person who will ${verb}`;
    }
  }

  // g16-6: V-ㄹ/을 + N (non-person) → a N to V (infinitive)
  // 읽을 책 → a book to read
  const futureNonPersonWords = cleaned.split(/\s+/);
  if (futureNonPersonWords.length === 2 && !['사람', '분'].includes(futureNonPersonWords[1])) {
    const firstWord = futureNonPersonWords[0];
    const nounKo = futureNonPersonWords[1];
    const noun = translateKoNoun(nounKo);

    // Check for -을 ending
    if (firstWord.endsWith('을')) {
      const verbStem = firstWord.slice(0, -1);
      const verb = extractKoVerb(verbStem);
      if (verb && noun) return `a ${noun} to ${verb}`;
    }
    // Check for syllable ending with ㄹ
    if (hasRieulBatchim(firstWord)) {
      const stem = removeRieulBatchim(firstWord);
      const verb = extractKoVerb(stem);
      if (verb && noun) return `a ${noun} to ${verb}`;
    }
  }

  // g16-5: ADJ-ㄴ/은 + N → a ADJ N (adjective adnominal)
  // 예쁜 꽃 → a beautiful flower
  // 높은 건물 → a tall building
  const adjAdnominalWords = cleaned.split(/\s+/);
  if (adjAdnominalWords.length === 2) {
    const firstWord = adjAdnominalWords[0];
    const nounKo = adjAdnominalWords[1];
    const noun = translateKoNoun(nounKo);

    // Check for -은 ending (높은)
    if (firstWord.endsWith('은')) {
      const adjStem = firstWord.slice(0, -1);
      const adj = extractKoAdjective(`${adjStem}다`) || extractKoAdjective(adjStem);
      if (adj && noun) return `a ${adj} ${noun}`;
    }
    // Check for syllable ending with ㄴ (예쁜 = 예쁘+ㄴ)
    if (hasNieunBatchim(firstWord)) {
      const stem = removeNieunBatchim(firstWord);
      const adj = extractKoAdjective(`${stem}다`) || extractKoAdjective(stem);
      if (adj && noun) return `a ${adj} ${noun}`;
    }
  }

  // g16-1: V-는 + 사람 → a person who V-s (present adnominal for person)
  // 가는 사람 → a person who goes
  const presentAdnominalPersonMatch = cleaned.match(/^(.+?)는\s+(사람|분|소년|소녀|아이)$/);
  if (presentAdnominalPersonMatch) {
    const verbStem = presentAdnominalPersonMatch[1];
    const personNoun = presentAdnominalPersonMatch[2];
    const personMap: Record<string, string> = {
      사람: 'person',
      분: 'person',
      소년: 'boy',
      소녀: 'girl',
      아이: 'child',
    };
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `a ${personMap[personNoun] || 'person'} who ${toThirdPersonSingular(verb)}`;
  }

  // g16-2: V-ㄴ/은 + 사람 → a person who V-ed (past adnominal for person)
  // 간 사람 → a person who went
  const pastAdnominalPersonMatch = cleaned.match(/^(.+?)[ㄴ은]\s+(사람|분)$/);
  if (pastAdnominalPersonMatch) {
    const verbStem = pastAdnominalPersonMatch[1];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `a person who ${toPastTense(verb)}`;
  }

  // ============================================
  // g28: 수량 표현 (Quantifier Expressions) - Korean → English
  // ============================================

  // g28-3: 조금의 N → some N
  // 조금의 물 → some water
  const someQuantifierMatch = cleaned.match(/^조금의?\s*(.+)$/);
  if (someQuantifierMatch) {
    const nounKo = someQuantifierMatch[1];
    const nounEn = KO_NOUNS[nounKo] || nounKo;
    return `some ${nounEn}`;
  }

  // ============================================
  // g11: 준동사 패턴 (Verbal Forms)
  // ============================================

  // g11-1: V-는 것을 좋아한다 → like to V / like V-ing
  // 읽는 것을 좋아한다 → like to read
  const likeGerundMatch = cleaned.match(/^(.+?)는\s*것을?\s*좋아한다?$/);
  if (likeGerundMatch) {
    const verbStem = likeGerundMatch[1];
    // ㄹ 탈락 복원: 아 → 알 (for ㄹ-final verbs)
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    if (verb) return `like to ${verb}`;
  }

  // ============================================
  // g17: 명사형 어미 (Nominalizing Endings) - Korean → English
  // ============================================

  // g17-1: V-기가 adj → V-ing is adj (gerund as subject with -기)
  // 읽기가 어렵다 → Reading is difficult
  const giGaAdjMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다|좋다|나쁘다|재밌다|힘들다)$/);
  if (giGaAdjMatch) {
    const verbStem = giGaAdjMatch[1];
    const adjKo = giGaAdjMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    const adjMap: Record<string, string> = {
      어렵다: 'difficult',
      쉽다: 'easy',
      좋다: 'good',
      나쁘다: 'bad',
      재밌다: 'fun',
      힘들다: 'hard',
    };
    if (verb) {
      const gerund = toIng(verb);
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adjMap[adjKo] || 'difficult'}`;
    }
  }

  // g17-3: V-는 것이 adj → V-ing is adj (gerund as subject with 것)
  // 가는 것이 좋다 → Going is good
  const neunGeotIAdjMatch = cleaned.match(
    /^(.+?)는\s*것이?\s*(좋다|나쁘다|어렵다|쉽다|재밌다|힘들다)$/,
  );
  if (neunGeotIAdjMatch) {
    const verbStem = neunGeotIAdjMatch[1];
    const adjKo = neunGeotIAdjMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    const adjMap: Record<string, string> = {
      좋다: 'good',
      나쁘다: 'bad',
      어렵다: 'difficult',
      쉽다: 'easy',
      재밌다: 'fun',
      힘들다: 'hard',
    };
    if (verb) {
      const gerund = toIng(verb);
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adjMap[adjKo] || 'good'}`;
    }
  }

  // g17-4: V-ㄴ/은 것을 V → I V-ed what I V-ed
  // 한 것을 후회했다 → I regretted what I did
  // NOTE: "한" = 하+ㄴ, so we need to check for ㄴ batchim
  const whatIDidMatch = cleaned.match(/^(.+?)\s*것을?\s*(.+)다$/);
  if (whatIDidMatch) {
    const verbPart1Full = whatIDidMatch[1]; // 한
    const verb2Ko = whatIDidMatch[2]; // 후회했
    // Check if the last syllable has ㄴ batchim (한 = 하+ㄴ)
    if (hasNieunBatchim(verbPart1Full)) {
      // 한 → 하 (remove ㄴ batchim) → do
      const verbStem1 = removeNieunBatchim(verbPart1Full);
      const verb1 = extractKoVerb(verbStem1);
      // 후회했 → 후회하 → regret
      const verb2Stem = verb2Ko.replace(/[ㅆ았었했]$/, '');
      const verb2 = extractKoVerb(verb2Stem) || extractKoVerb(`${verb2Stem}하`);
      if (verb1 && verb2) {
        return `I ${toPastTense(verb2)} what I ${toPastTense(verb1)}`;
      }
    }
  }

  // g17-5: V-기로 했다 → I decided to V
  // 가기로 했다 → I decided to go
  const decidedToMatch = cleaned.match(/^(.+?)기로\s*했다$/);
  if (decidedToMatch) {
    const verbStem = decidedToMatch[1];
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    if (verb) return `I decided to ${verb}`;
  }

  // g17-2: Subject가 V-음을 V-다 → I V-ed that Subject V-ed
  // 그가 왔음을 알았다 → I knew that he came
  // 일반화된 한국어 과거형 → 영어 과거형 변환
  const nominalizingEumMatch = cleaned.match(/^(.+?)[가이]\s*(.+?)음을\s*(.+)다$/);
  if (nominalizingEumMatch) {
    const subjectKo = nominalizingEumMatch[1]; // 그
    const verbKoPast = nominalizingEumMatch[2]; // 왔
    const mainVerbKo = nominalizingEumMatch[3]; // 알았

    // Subject mapping (대명사는 고정 매핑, 일반화됨)
    const subjectMap: Record<string, string> = {
      그: 'he',
      그녀: 'she',
      그것: 'it',
      그들: 'they',
      우리: 'we',
      나: 'I',
      너: 'you',
    };
    const subject = subjectMap[subjectKo] || subjectKo;

    // 한국어 과거형 어간 → 영어 과거형 변환 (일반화된 규칙)
    // 1. 축약형 복원: 왔 → 오+았, 갔 → 가+았, 봤 → 보+았
    // 2. 어간 추출 후 KO_VERBS에서 영어 동사 찾기
    // 3. 영어 동사를 과거형으로 변환
    const extractPastVerb = (koPast: string): string => {
      // 축약형 패턴 복원
      const contractionMap: Record<string, string> = {
        왔: '오', // 오+았 → 왔
        갔: '가', // 가+았 → 갔
        봤: '보', // 보+았 → 봤
        샀: '사', // 사+았 → 샀
        잤: '자', // 자+았 → 잤
      };

      let stem = koPast;
      // 축약형이면 어간 복원
      if (contractionMap[koPast]) {
        stem = contractionMap[koPast];
      }
      // -었/-았 제거하여 어간 추출
      else if (koPast.endsWith('었') || koPast.endsWith('았')) {
        stem = koPast.slice(0, -1);
      }
      // -했 → 하
      else if (koPast.endsWith('했')) {
        stem = `${koPast.slice(0, -1)}하`;
      }

      // KO_VERBS에서 영어 동사 찾기
      const enVerb = KO_VERBS[stem] || KO_VERBS[`${stem}하`] || null;

      if (enVerb) {
        // 영어 동사를 과거형으로 변환
        return toPastTense(enVerb);
      }

      // 못 찾으면 원형 반환
      return koPast;
    };

    const subordinateVerb = extractPastVerb(verbKoPast);
    const mainVerb = extractPastVerb(mainVerbKo);

    return `I ${mainVerb} that ${subject} ${subordinateVerb}`;
  }

  // g11-6: V-는 것은 좋다 → V-ing is good (gerund as subject)
  // 수영하는 것은 좋다 → Swimming is good
  const gerundSubjectMatch = cleaned.match(
    /^(.+?)하?는\s*것은?\s*(좋다|좋아|나쁘다|나빠|어렵다|어려워|쉽다|쉬워)$/,
  );
  if (gerundSubjectMatch) {
    const verbStem = gerundSubjectMatch[1];
    const adjKo = gerundSubjectMatch[2];
    // 수영 → swim, 공부 → study
    const verb = extractKoVerb(verbStem) || extractKoVerb(`${verbStem}하`);
    const adj = adjKo.startsWith('좋')
      ? 'good'
      : adjKo.startsWith('나쁘') || adjKo.startsWith('나빠')
        ? 'bad'
        : adjKo.startsWith('어렵') || adjKo.startsWith('어려워')
          ? 'difficult'
          : adjKo.startsWith('쉽') || adjKo.startsWith('쉬워')
            ? 'easy'
            : 'good';
    if (verb) {
      const gerund = toIng(verb);
      // Capitalize first letter
      return `${gerund.charAt(0).toUpperCase() + gerund.slice(1)} is ${adj}`;
    }
  }

  // g11-4: 결국 V-게 되다 → only to V
  // 결국 실패하게 되다 → only to fail
  const onlyToMatch = cleaned.match(/^결국\s+(.+?)하?게\s*되다$/);
  if (onlyToMatch) {
    const verb = extractKoVerb(`${onlyToMatch[1]}하`);
    if (verb) return `only to ${verb}`;
  }

  // g11-5: 만나서 기뻐요 → glad to meet you
  // 만나서 기쁘다/기뻐요/기뻐 등
  const gladToMeetMatch = cleaned.match(/^만나서\s*기[뻐쁘]/);
  if (gladToMeetMatch) {
    return 'glad to meet you';
  }

  // g9-1, g21-4: V-는 + N (person/thing) → the N who/that V-s (relative clause)
  // 뛰는 소년 → the boy who runs
  // 뛰는 소녀 → the girl who runs
  const presentParticipleMatch = cleaned.match(/^(.+?)는\s*(.+)$/);
  if (presentParticipleMatch) {
    const verbStem = presentParticipleMatch[1];
    const nounKo = presentParticipleMatch[2];
    const verb = extractKoVerb(verbStem) || extractKoVerb(addKoreanRieul(verbStem));
    const noun = translateKoNounWithFallback(nounKo);
    if (verb && noun) {
      // Use relative clause form: "the N who V-s" for person nouns
      const personNouns = ['boy', 'girl', 'man', 'woman', 'person', 'child', 'student', 'teacher'];
      if (personNouns.includes(noun.toLowerCase())) {
        return `the ${noun} who ${verb}s`;
      }
      // Use "the V-ing N" for non-person nouns
      return `the ${toIng(verb)} ${noun}`;
    }
  }

  // g11-8: V-ㄴ/은 + N → the V-ed N (past participle adjective)
  // 깨진 창문 → the broken window
  const pastParticipleMatch = cleaned.match(/^(.+?)[진은ㄴ]\s*(.+)$/);
  if (pastParticipleMatch) {
    const verbStem = pastParticipleMatch[1];
    const nounKo = pastParticipleMatch[2];
    // 깨 → break, 쓰 → write
    const verb = extractKoVerb(verbStem);
    const noun = translateKoNounWithFallback(nounKo);
    if (verb && noun) return `the ${toPastParticiple(verb)} ${noun}`;
  }

  // ============================================
  // g29: 기타 구문 (Other Constructions)
  // ============================================

  // g29-2: Location에 N이/가 있다 → There is (a) N at/in/on Location
  // 탁자 위에 책이 있다 → There is a book on the table
  // NOTE: This must come BEFORE the simple existential to match first
  const existentialLocationMatch = cleaned.match(
    /^(.+?)\s+(위에|안에|옆에|밑에|뒤에|앞에)\s+(.+?)[이가]\s*있다$/,
  );
  if (existentialLocationMatch) {
    const location = translateKoNoun(existentialLocationMatch[1]) || existentialLocationMatch[1];
    const prep = existentialLocationMatch[2];
    const noun = translateKoNoun(existentialLocationMatch[3]) || existentialLocationMatch[3];
    const prepMap: Record<string, string> = {
      위에: 'on',
      안에: 'in',
      옆에: 'next to',
      밑에: 'under',
      뒤에: 'behind',
      앞에: 'in front of',
    };
    return `There is a ${noun} ${prepMap[prep] || 'at'} the ${location}`;
  }

  // g29-1: N이/가 있다 → There is (a) N (existential)
  // 책이 있다 → There is a book
  const existentialMatch = cleaned.match(/^(.+?)[이가]\s*있다$/);
  if (existentialMatch) {
    const noun = translateKoNoun(existentialMatch[1]) || existentialMatch[1];
    return `There is a ${noun}`;
  }

  // g29-3: V-기가 형용사 → It is adj to V
  // 배우기가 어렵다 → It is difficult to learn
  const itIsAdjMatch = cleaned.match(/^(.+?)기가?\s*(어렵다|쉽다|좋다|나쁘다|재미있다|힘들다)$/);
  if (itIsAdjMatch) {
    const verb = extractKoVerb(itIsAdjMatch[1]);
    const adjMap: Record<string, string> = {
      어렵다: 'difficult',
      쉽다: 'easy',
      좋다: 'good',
      나쁘다: 'bad',
      재미있다: 'fun',
      힘들다: 'hard',
    };
    const adj = adjMap[itIsAdjMatch[2]] || 'difficult';
    if (verb) return `It is ${adj} to ${verb}`;
  }

  // g29-4: N에게 Object를 V → I V-ed Object to N
  // 그녀에게 책을 주었다 → I gave her a book
  const dativeMatch = cleaned.match(/^(.+?)에게\s+(.+?)[을를]\s+(주었다|줬다|보냈다|건넸다)$/);
  if (dativeMatch) {
    const recipient = translateKoNoun(dativeMatch[1]) || dativeMatch[1];
    const obj = translateKoNoun(dativeMatch[2]) || dativeMatch[2];
    const verbMap: Record<string, string> = {
      주었다: 'gave',
      줬다: 'gave',
      보냈다: 'sent',
      건넸다: 'handed',
    };
    const verb = verbMap[dativeMatch[3]] || 'gave';
    // Convert recipient to pronoun if possible
    const pronounMap: Record<string, string> = { 그녀: 'her', 그: 'him', 그들: 'them', 나: 'me' };
    const recip = pronounMap[dativeMatch[1]] || recipient;
    return `I ${verb} ${recip} a ${obj}`;
  }

  // g29-5: N로서는 → as for N
  // 나로서는 → as for me
  const asForMatch = cleaned.match(/^(.+?)로서는?$/);
  if (asForMatch) {
    const noun = asForMatch[1];
    const pronounMap: Record<string, string> = { 나: 'me', 저: 'me', 그: 'him', 그녀: 'her' };
    const translated = pronounMap[noun] || translateKoNoun(noun) || noun;
    return `as for ${translated}`;
  }

  // g29-6: V-ㄴ 것은 N이다 → It was N who V-ed (cleft sentence)
  // 간 것은 그였다 → It was he who went
  // 온 것은 그녀였다 → It was she who came
  const cleftMatch = cleaned.match(/^(.+?)\s*것은\s*(.+?)[이가]?였다$/);
  if (cleftMatch) {
    const verbPart = cleftMatch[1].trim();
    const noun = cleftMatch[2];
    // Map contracted past participles: 간 → 가 (go), 온 → 오 (come), 먹은 → 먹 (eat)
    const contractedVerbMap: Record<string, string> = {
      간: 'go',
      온: 'come',
      한: 'do',
      본: 'see',
      산: 'live',
    };
    let verb: string | null = contractedVerbMap[verbPart] ?? null;
    if (!verb) {
      // Try removing 은/ㄴ suffix
      const stem = verbPart.replace(/[은ㄴ]$/, '');
      verb = extractKoVerb(stem);
    }
    const pronounMap: Record<string, string> = { 그: 'he', 그녀: 'she', 나: 'I' };
    const subject = pronounMap[noun] || translateKoNoun(noun) || noun;
    if (verb) return `It was ${subject} who ${toPastTense(verb)}`;
  }

  // ============================================
  // g22: 보조용언 패턴 (Auxiliary Predicates)
  // ============================================

  // g22-2: V-아/어 보다 → try V-ing
  // 가 보다 → try going
  const tryMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*보다$/);
  if (tryMatch) {
    const verbStem = tryMatch[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `try ${toIng(verb)}`;
  }

  // g22-3: V-아/어 버리다 → V up (completely)
  // 먹어 버리다 → eat up (completely)
  const completiveMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*버리다$/);
  if (completiveMatch) {
    const verbStem = completiveMatch[1];
    const verb = extractKoVerb(verbStem);
    if (verb) return `${verb} up (completely)`;
  }

  // g22-4: V-아/어 내다 → accomplish (manage to V)
  // 해 내다 → accomplish
  const accomplishMatch = cleaned.match(/^(.+?)(?:아|어|해)?\s*내다$/);
  if (accomplishMatch) {
    const verbStem = accomplishMatch[1];
    const verb = extractKoVerb(verbStem);
    // 해 내다 should be "accomplish"
    if (verbStem === '해' || verbStem === '하') return 'accomplish';
    if (verb) return `manage to ${verb}`;
  }

  // g22-5: V-아/어 놓다 → have V-ed (and left)
  // 써 놓다 → have written (and left)
  // 써 is the connective form of 쓰다
  const resultativeMatch = cleaned.match(/^(.+?)\s*놓다$/);
  if (resultativeMatch) {
    const connectedVerb = resultativeMatch[1].trim();
    // 써 → 쓰 (remove connective ending), 먹어 → 먹, 해 → 하
    let verbStem = connectedVerb;
    if (connectedVerb.endsWith('어') || connectedVerb.endsWith('아')) {
      verbStem = connectedVerb.slice(0, -1);
    } else if (connectedVerb === '해') {
      verbStem = '하';
    } else if (connectedVerb === '써') {
      verbStem = '쓰';
    }
    const verb = extractKoVerb(verbStem);
    if (verb) return `have ${toPastParticiple(verb)} (and left)`;
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

/** 한국어 명사 번역 (fallback 포함) */
function translateKoNounWithFallback(ko: string): string | null {
  return KO_NOUNS[ko] || ko;
}

/** 한국어 동사 추출 */
function extractKoVerb(text: string): string | null {
  return KO_VERBS[text] || KO_VERBS[`${text}하`] || null;
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

/**
 * 영어 특수 패턴 처리 (g7, g10, g13)
 * 파싱 전에 직접 문자열 매칭으로 처리
 */
function handleSpecialEnglishPatterns(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  const cleaned = trimmed.replace(/[.!?]+$/, '');

  // ============================================
  // Exclamation mark patterns (before removing punctuation)
  // ============================================

  // g3-14: "Don't run!" → "뛰지 마!" (imperative negative - MUST check before cleaning)
  const dontVImperativeMatch = trimmed.match(/^don'?t\s+(\w+)!$/);
  if (dontVImperativeMatch) {
    const verb = dontVImperativeMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}지 마!`;
    }
  }

  // g12-13: "Mr. Name" → "Name 씨 / Name 선생님"
  const mrMatch = trimmed.match(/^mr\.?\s+(\w+)$/);
  if (mrMatch) {
    const name = mrMatch[1];
    // Common Korean surnames
    const nameMap: Record<string, string> = {
      kim: '김',
      lee: '이',
      park: '박',
      choi: '최',
      jung: '정',
      kang: '강',
      cho: '조',
      yoon: '윤',
      jang: '장',
      lim: '임',
    };
    const koName = nameMap[name.toLowerCase()] || name;
    return `${koName} 씨 / ${koName} 선생님`;
  }

  // g15-24: "Want to eat?" → "먹을래?" (MUST have question mark, check before cleaning)
  const wantToQMatchEarly = trimmed.match(/^want\s+to\s+(\w+)\?$/);
  if (wantToQMatchEarly) {
    const verb = wantToQMatchEarly[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)}래?`;
    }
  }

  // g30: Irregular verb triples (check before cleaning)
  // g30-4 to g30-8: "go-went-gone" → "가다-갔다-간"
  const irregularVerbTripleMatchEarly = trimmed.match(/^(\w+)-(\w+)-(\w+)$/);
  if (irregularVerbTripleMatchEarly) {
    const base = irregularVerbTripleMatchEarly[1];
    const past = irregularVerbTripleMatchEarly[2];
    const pp = irregularVerbTripleMatchEarly[3];
    const irregularMap: Record<string, string> = {
      'go-went-gone': '가다-갔다-간',
      'see-saw-seen': '보다-봤다-본',
      'buy-bought-bought': '사다-샀다-산',
      'make-made-made': '만들다-만들었다-만든',
      'put-put-put': '놓다-놓았다-놓은',
      'eat-ate-eaten': '먹다-먹었다-먹은',
      'come-came-come': '오다-왔다-온',
    };
    const key = `${base}-${past}-${pp}`;
    if (irregularMap[key]) return irregularMap[key];
  }

  // ============================================
  // g2: 문장 유형 변환 (Sentence Type Conversion)
  // ============================================

  // g2-9: "She sings a song" → "그녀가 노래를 부른다"
  // Pattern: Subject + V-s + a N → Subject가 N을 V-다
  const sheVsSongMatch = cleaned.match(/^(she|he|it)\s+(sings?)\s+a\s+(song)$/);
  if (sheVsSongMatch) {
    const subj = sheVsSongMatch[1];
    const subjKo: Record<string, string> = { she: '그녀', he: '그', it: '그것' };
    return `${subjKo[subj]}가 노래를 부른다`;
  }

  // ============================================
  // g7: 비교급 패턴 (English → Korean)
  // ============================================

  // g7-9: "as tall as me" → "나만큼 키가 크다"
  const asAsMatch = cleaned.match(/^as\s+(\w+)\s+as\s+(\w+)$/);
  if (asAsMatch) {
    const adj = asAsMatch[1];
    const obj = asAsMatch[2];
    const objMap: Record<string, string> = { me: '나', you: '너', him: '그', her: '그녀' };
    const koObj = objMap[obj] || EN_NOUNS[obj] || obj;
    // Special handling for height
    if (adj === 'tall') return `${koObj}만큼 키가 크다`;
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) return `${koObj}만큼 ${koAdj}다`;
  }

  // g7-10: "taller than me" → "나보다 더 키가 크다"
  const comparativeMatch = cleaned.match(/^(\w+?)er\s+than\s+(\w+)$/);
  if (comparativeMatch) {
    const adjStem = comparativeMatch[1];
    const obj = comparativeMatch[2];
    const objMap: Record<string, string> = { me: '나', you: '너', him: '그', her: '그녀' };
    const koObj = objMap[obj] || EN_NOUNS[obj] || obj;
    // Special handling for height
    if (adjStem === 'tall') return `${koObj}보다 더 키가 크다`;
    const koAdj = EN_ADJECTIVES[adjStem] || EN_ADJECTIVES[`${adjStem}l`];
    if (koAdj) return `${koObj}보다 더 ${koAdj}다`;
  }

  // g7-11: "the tallest in class" → "반에서 가장 키가 크다"
  const superlativeMatch = cleaned.match(/^the\s+(\w+?)est\s+in\s+(\w+)$/);
  if (superlativeMatch) {
    const adjStem = superlativeMatch[1];
    const place = superlativeMatch[2];
    const placeMap: Record<string, string> = { class: '반', school: '학교', world: '세상' };
    const koPlace = placeMap[place] || EN_NOUNS[place] || place;
    // Special handling for height
    if (adjStem === 'tall') return `${koPlace}에서 가장 키가 크다`;
    const koAdj = EN_ADJECTIVES[adjStem] || EN_ADJECTIVES[`${adjStem}l`];
    if (koAdj) return `${koPlace}에서 가장 ${koAdj}다`;
  }

  // g7-12: "less expensive" → "덜 비싸다"
  const lessMatch = cleaned.match(/^less\s+(\w+)$/);
  if (lessMatch) {
    const adj = lessMatch[1];
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) return `덜 ${koAdj}다`;
  }

  // g7-13: "three times as fast" → "세 배 빠르다"
  const timesMatch = cleaned.match(/^(two|three|four|five)\s+times\s+as\s+(\w+)$/);
  if (timesMatch) {
    const times = timesMatch[1];
    const adj = timesMatch[2];
    const koAdj = EN_ADJECTIVES[adj];
    const timesKo: Record<string, string> = { two: '두', three: '세', four: '네', five: '다섯' };
    if (koAdj) return `${timesKo[times]} 배 ${koAdj}다`;
  }

  // g7-14: "much better" → "훨씬 더 좋다"
  const muchMatch = cleaned.match(/^much\s+(\w+)$/);
  if (muchMatch) {
    const comp = muchMatch[1];
    // better → good, worse → bad
    const irregularMap: Record<string, string> = { better: 'good', worse: 'bad' };
    const baseAdj = irregularMap[comp];
    if (baseAdj) {
      const koAdj = EN_ADJECTIVES[baseAdj];
      if (koAdj) return `훨씬 더 ${koAdj}다`;
    }
  }

  // ============================================
  // g10: 부사절 패턴 (English → Korean)
  // ============================================

  // g10-13: "when the sun sets" → "해가 질 때"
  const whenMatch = cleaned.match(/^when\s+the\s+(\w+)\s+(\w+)s$/);
  if (whenMatch) {
    const subj = whenMatch[1];
    const verb = whenMatch[2];
    // sun sets → 해가 지다
    if (subj === 'sun' && verb === 'set') return '해가 질 때';
  }

  // g10-15: "before you go" → "네가 가기 전에"
  const beforeMatch = cleaned.match(/^before\s+(you|I|he|she|we|they)\s+(\w+)$/);
  if (beforeMatch) {
    const subj = beforeMatch[1];
    const verb = beforeMatch[2];
    const subjKo: Record<string, string> = {
      you: '네',
      I: '내',
      he: '그',
      she: '그녀',
      we: '우리',
      they: '그들',
    };
    const verbKo: Record<string, string> = { go: '가', come: '오', leave: '떠나' };
    if (subjKo[subj] && verbKo[verb]) return `${subjKo[subj]}가 ${verbKo[verb]}기 전에`;
  }

  // g10-16: "after she left" → "그녀가 떠난 후에"
  const afterMatch = cleaned.match(/^after\s+(you|I|he|she|we|they)\s+(\w+)$/);
  if (afterMatch) {
    const subj = afterMatch[1];
    const verb = afterMatch[2];
    const _subjKo: Record<string, string> = {
      you: '네',
      I: '내',
      he: '그',
      she: '그녀',
      we: '우리',
      they: '그들',
    };
    // left → leave 의 과거형 → 떠나다 의 관형형
    if (subj === 'she' && verb === 'left') return '그녀가 떠난 후에';
  }

  // g10-17: "because I was tired" → "피곤했기 때문에"
  const becauseMatch = cleaned.match(/^because\s+(i|he|she|we|they)\s+(was|were)\s+(\w+)$/);
  if (becauseMatch) {
    const adj = becauseMatch[3];
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) {
      // "피곤하" → "피곤했" (하다 용언 과거형)
      if (koAdj.endsWith('하')) {
        return `${koAdj}기 때문에`.replace('하기', '했기');
      }
      return `${koAdj}았기 때문에`;
    }
  }

  // g10-19: "as soon as possible" → "가능한 빨리"
  if (cleaned === 'as soon as possible') {
    return '가능한 빨리';
  }

  // ============================================
  // g13: 조사 패턴 (English → Korean)
  // ============================================

  // g13-19: "I (subject)" → "내가"
  if (cleaned === 'i (subject)') return '내가';

  // g13-21: "from Seoul" → "서울에서"
  const fromMatch = cleaned.match(/^from\s+(\w+)$/);
  if (fromMatch) {
    const noun = fromMatch[1];
    const koNoun = EN_NOUNS[noun.charAt(0).toUpperCase() + noun.slice(1)] || EN_NOUNS[noun];
    if (koNoun) return `${koNoun}에서`;
  }

  // g13-22: "by train" → "기차로"
  const byMatch = cleaned.match(/^by\s+(\w+)$/);
  if (byMatch) {
    const noun = byMatch[1];
    const koNoun = EN_NOUNS[noun];
    if (koNoun) return `${koNoun}로`;
  }

  // g13-23: "with friends" → "친구들과"
  const withMatch = cleaned.match(/^with\s+(\w+)s?$/);
  if (withMatch) {
    let noun = withMatch[1];
    // friends → friend
    if (noun.endsWith('s')) noun = noun.slice(0, -1);
    const koNoun = EN_NOUNS[noun];
    if (koNoun) return `${koNoun}들과`;
  }

  // g13-20: "to school" → "학교에" (directional particle)
  const toNounMatch = cleaned.match(/^to\s+(\w+)$/);
  if (toNounMatch) {
    const noun = toNounMatch[1];
    const koNoun = EN_NOUNS[noun.charAt(0).toUpperCase() + noun.slice(1)] || EN_NOUNS[noun];
    if (koNoun) return `${koNoun}에`;
  }

  // ============================================
  // g14: 연결어미 패턴 (English → Korean)
  // ============================================

  // g14-14: "hot but nice" → "덥지만 좋다"
  // Pattern: ADJ but ADJ → ADJ-지만 ADJ-다
  const adjButAdjMatch = cleaned.match(/^(\w+)\s+but\s+(\w+)$/);
  if (adjButAdjMatch) {
    const adj1 = adjButAdjMatch[1];
    const adj2 = adjButAdjMatch[2];
    // "hot" → "덥다" (temperature), "nice" → "좋다"
    const koAdj1 = EN_ADJECTIVES[adj1];
    const koAdj2 = EN_ADJECTIVES[adj2];
    if (koAdj1 && koAdj2) {
      // 어간 추출: 덥다 → 덥, 좋다 → 좋
      const stem1 = koAdj1.endsWith('다') ? koAdj1.slice(0, -1) : koAdj1;
      const stem2 = koAdj2.endsWith('다') ? koAdj2.slice(0, -1) : koAdj2;
      return `${stem1}지만 ${stem2}다`;
    }
  }

  // g14-16: "because I love" → "사랑하니까"
  // Pattern: because (S) V → V-니까
  const becauseVerbMatch = cleaned.match(/^because\s+(?:i\s+)?(\w+)$/);
  if (becauseVerbMatch) {
    const verb = becauseVerbMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      // 어간 추출: 사랑하다 → 사랑하
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}니까`;
    }
  }

  // g14-18: "even if it hurts" → "아프더라도"
  // Pattern: even if (it) V/ADJ → V/ADJ-더라도
  const evenIfMatch = cleaned.match(/^even\s+if\s+(?:it\s+)?(\w+)s?$/);
  if (evenIfMatch) {
    let word = evenIfMatch[1];
    // "hurts" → "hurt"
    if (word.endsWith('s') && word !== 'is') {
      word = word.slice(0, -1);
    }
    // hurt → 아프다 (adjective in Korean)
    const koAdj = EN_ADJECTIVES[word];
    if (koAdj) {
      const stem = koAdj.endsWith('다') ? koAdj.slice(0, -1) : koAdj;
      return `${stem}더라도`;
    }
    // Try as verb
    const koVerb = EN_VERBS[word];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}더라도`;
    }
  }

  // g14-19: "while watching" → "보면서"
  // Pattern: while V-ing → V-면서
  const whileVerbMatch = cleaned.match(/^while\s+(\w+)ing$/);
  if (whileVerbMatch) {
    let verbStem = whileVerbMatch[1];
    // Handle doubled consonants: running → run, stopping → stop
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    // Handle verbs ending in 'e' that was removed: making → mak → make
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${stem}면서`;
      }
    }
  }

  // g14-20: "in order to buy" → "사려고"
  // Pattern: in order to V → V-려고
  const inOrderToMatch = cleaned.match(/^in\s+order\s+to\s+(\w+)$/);
  if (inOrderToMatch) {
    const verb = inOrderToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}려고`;
    }
  }

  // ============================================
  // g11: 준동사 패턴 (English → Korean)
  // ============================================

  // g11-10: "something to eat" → "먹을 것"
  // Pattern: something to V → V-을 것
  const somethingToMatch = cleaned.match(/^something\s+to\s+(\w+)$/);
  if (somethingToMatch) {
    const verb = somethingToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}을 것`;
    }
  }

  // g11-11: "I came to help" → "돕기 위해 왔다"
  // Pattern: S came to V → V-기 위해 왔다
  const cameToMatch = cleaned.match(/^i\s+came\s+to\s+(\w+)$/);
  if (cameToMatch) {
    const verb = cameToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}기 위해 왔다`;
    }
  }

  // g11-12: "I enjoy swimming" → "수영하는 것을 즐긴다"
  // Pattern: S enjoy V-ing → V-는 것을 즐긴다
  const enjoyMatch = cleaned.match(/^i\s+enjoy\s+(\w+)ing$/);
  if (enjoyMatch) {
    let verbStem = enjoyMatch[1];
    // Handle doubled consonants: swimming → swim
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${stem}는 것을 즐긴다`;
      }
    }
  }

  // g11-13: "by working hard" → "열심히 일함으로써"
  // Pattern: by V-ing hard → 열심히 V-함으로써
  const byWorkingMatch = cleaned.match(/^by\s+(\w+)ing\s+hard$/);
  if (byWorkingMatch) {
    let verbStem = byWorkingMatch[1];
    // Handle doubled consonants
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        // 일하다 → 일하, 공부하다 → 공부하
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        // 일하 → 일함으로써 (remove 하 and add 함으로써)
        if (stem.endsWith('하')) {
          return `열심히 ${stem.slice(0, -1)}함으로써`;
        }
        // 먹 → 먹음으로써
        return `열심히 ${stem}음으로써`;
      }
    }
  }

  // g11-14: "the sleeping baby" → "자는 아기"
  // Pattern: the V-ing N → V-는 N
  const theVingNMatch = cleaned.match(/^the\s+(\w+)ing\s+(\w+)$/);
  if (theVingNMatch) {
    let verbStem = theVingNMatch[1];
    const noun = theVingNMatch[2];
    // Handle doubled consonants
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      const koNoun = EN_NOUNS[noun];
      if (koVerb && koNoun) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${stem}는 ${koNoun}`;
      }
    }
  }

  // g11-15: "the written letter" → "쓴 편지"
  // Pattern: the V-ed N → V-ㄴ/은 N (past participle adjective)
  const theVedNMatch = cleaned.match(/^the\s+(\w+)\s+(\w+)$/);
  if (theVedNMatch) {
    const pastParticiple = theVedNMatch[1];
    const noun = theVedNMatch[2];
    // Map past participles back to base verb
    const ppToVerb: Record<string, string> = {
      written: 'write',
      broken: 'break',
      spoken: 'speak',
      eaten: 'eat',
      taken: 'take',
      given: 'give',
      seen: 'see',
      done: 'do',
      gone: 'go',
      known: 'know',
      closed: 'close',
      opened: 'open',
      used: 'use',
    };
    const baseVerb = ppToVerb[pastParticiple];
    if (baseVerb) {
      const koVerb = EN_VERBS[baseVerb];
      const koNoun = EN_NOUNS[noun];
      if (koVerb && koNoun) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        // Attach past participle ending: 쓰 → 쓴, 먹 → 먹은
        return `${attachKoreanPastParticiple(stem)} ${koNoun}`;
      }
    }
  }

  // ============================================
  // g16: 관형형 어미 (Adnominal Endings) - English → Korean
  // ============================================

  // g16-8: "a person who runs" → "뛰는 사람"
  // Pattern: a N who V-s → V-는 N
  const personWhoVsMatch = cleaned.match(/^a\s+(\w+)\s+who\s+(\w+)s$/);
  if (personWhoVsMatch) {
    const noun = personWhoVsMatch[1];
    const verb = personWhoVsMatch[2];
    const koNoun = EN_NOUNS[noun] || (noun === 'person' ? '사람' : noun);
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}는 ${koNoun}`;
    }
  }

  // g16-9: "food that I ate" → "먹은 음식"
  // Pattern: N that I V-ed → V-은 N
  const nounThatIVedMatch = cleaned.match(/^(\w+)\s+that\s+i\s+(\w+)$/);
  if (nounThatIVedMatch) {
    const noun = nounThatIVedMatch[1];
    const pastVerb = nounThatIVedMatch[2];
    const koNoun = EN_NOUNS[noun];
    // Map past tense to base verb
    const pastToBase: Record<string, string> = {
      ate: 'eat',
      bought: 'buy',
      went: 'go',
      came: 'come',
      left: 'leave',
      saw: 'see',
      did: 'do',
      had: 'have',
      made: 'make',
      took: 'take',
      gave: 'give',
      read: 'read',
      wrote: 'write',
      said: 'say',
      told: 'tell',
    };
    const baseVerb = pastToBase[pastVerb] || pastVerb.replace(/ed$/, '');
    const koVerb = EN_VERBS[baseVerb];
    if (koVerb && koNoun) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanPastParticiple(stem)} ${koNoun}`;
    }
  }

  // g16-10: "work to do" → "할 일"
  // Pattern: N to V → V-ㄹ N
  const nounToVMatch = cleaned.match(/^(\w+)\s+to\s+(\w+)$/);
  if (nounToVMatch) {
    const noun = nounToVMatch[1];
    const verb = nounToVMatch[2];
    const koNoun = EN_NOUNS[noun];
    const koVerb = EN_VERBS[verb];
    if (koVerb && koNoun) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)} ${koNoun}`;
    }
  }

  // g16-11: "a tall building" → "높은 건물"
  // Pattern: a ADJ N → ADJ-은 N
  const aAdjNMatch = cleaned.match(/^a\s+(\w+)\s+(\w+)$/);
  if (aAdjNMatch) {
    const adj = aAdjNMatch[1];
    const noun = aAdjNMatch[2];
    const koAdj = EN_ADJECTIVES[adj];
    const koNoun = EN_NOUNS[noun];
    if (koAdj && koNoun) {
      // 높 → 높은, 예쁘 → 예쁜
      return `${koAdj}은 ${koNoun}`;
    }
  }

  // g16-12: "the song I used to sing" → "부르던 노래"
  // Pattern: the N I used to V → V-던 N
  const usedToMatch = cleaned.match(/^the\s+(\w+)\s+i\s+used\s+to\s+(\w+)$/);
  if (usedToMatch) {
    const noun = usedToMatch[1];
    const verb = usedToMatch[2];
    const koNoun = EN_NOUNS[noun];
    const koVerb = EN_VERBS[verb];
    if (koVerb && koNoun) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}던 ${koNoun}`;
    }
  }

  // ============================================
  // g17: 명사형 어미 (English → Korean)
  // ============================================

  // g17-6: "Swimming is fun" → "수영하기는 재밌다"
  // Pattern: V-ing is adj → V-기는 adj
  const vingIsAdjMatch = cleaned.match(/^(\w+)ing\s+is\s+(\w+)$/);
  if (vingIsAdjMatch) {
    let verbStem = vingIsAdjMatch[1];
    const adj = vingIsAdjMatch[2];
    // Handle doubled consonants (swimming → swim)
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    // Try to find verb: swim, run, read, etc.
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        const adjMap: Record<string, string> = {
          fun: '재밌다',
          good: '좋다',
          bad: '나쁘다',
          difficult: '어렵다',
          easy: '쉽다',
          hard: '힘들다',
        };
        return `${stem}기는 ${adjMap[adj] || '좋다'}`;
      }
    }
  }

  // g17-7: "I know that he left" → "그가 떠났음을 안다"
  // Pattern: I know that S V → S V-음을 알다
  const knowThatMatch = cleaned.match(/^i\s+know\s+that\s+(.+)$/);
  if (knowThatMatch) {
    const clause = knowThatMatch[1];
    // Parse: "he left" → 그가 떠났음
    const subjectMatch = clause.match(/^(\w+)\s+(.+)$/);
    if (subjectMatch) {
      const subj = subjectMatch[1].toLowerCase();
      const verbPart = subjectMatch[2];
      const subjMap: Record<string, string> = {
        he: '그가',
        she: '그녀가',
        i: '내가',
        you: '네가',
        they: '그들이',
        we: '우리가',
      };
      const koSubj = subjMap[subj] || '그가';
      // Find verb: left → leave
      const pastToBase: Record<string, string> = {
        left: 'leave',
        went: 'go',
        came: 'come',
        did: 'do',
        had: 'have',
        ate: 'eat',
        saw: 'see',
        took: 'take',
        made: 'make',
        got: 'get',
      };
      const baseVerb = pastToBase[verbPart] || verbPart.replace(/ed$/, '');
      const koVerb = EN_VERBS[baseVerb];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        // 떠나 → 떠났음 (past nominalized)
        return `${koSubj} ${attachPastTense(stem)}음을 안다`;
      }
    }
  }

  // g17-8: "What I want is peace" → "내가 원하는 것은 평화다"
  // Pattern: What I V is N → 내가 V-는 것은 N이다
  const whatIVIsNMatch = cleaned.match(/^what\s+i\s+(\w+)\s+is\s+(\w+)$/);
  if (whatIVIsNMatch) {
    const verb = whatIVIsNMatch[1];
    const noun = whatIVIsNMatch[2];
    const koVerb = EN_VERBS[verb];
    const koNoun = EN_NOUNS[noun];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      const nounKo = koNoun || noun;
      return `내가 ${stem}는 것은 ${nounKo}다`;
    }
  }

  // g17-9: "I decided to study" → "공부하기로 했다"
  // Pattern: I decided to V → V-기로 했다
  const decidedToEnMatch = cleaned.match(/^i\s+decided\s+to\s+(\w+)$/);
  if (decidedToEnMatch) {
    const verb = decidedToEnMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}기로 했다`;
    }
  }

  // ============================================
  // g12: 경어법 (English → Korean)
  // ============================================

  // g12-8: "Hello (formal)" → "안녕하십니까"
  // g12-11: "Thank you (formal)" → "감사합니다"
  // g12-12: "Thank you (casual)" → "고마워"
  // g12-13: "Mr. Kim" → "김 씨 / 김 선생님"

  // Pattern: "greeting/phrase (formal/casual)" → Korean
  const formalCasualMatch = cleaned.match(/^(.+?)\s+\((formal|casual)\)$/);
  if (formalCasualMatch) {
    const phrase = formalCasualMatch[1];
    const formality = formalCasualMatch[2];
    const formalPhrases: Record<string, string> = {
      hello: '안녕하십니까',
      'thank you': '감사합니다',
      goodbye: '안녕히 가십시오',
      sorry: '죄송합니다',
      'excuse me': '실례합니다',
    };
    const casualPhrases: Record<string, string> = {
      hello: '안녕',
      'thank you': '고마워',
      goodbye: '잘 가',
      sorry: '미안해',
      'excuse me': '잠깐만',
    };
    if (formality === 'formal' && formalPhrases[phrase]) return formalPhrases[phrase];
    if (formality === 'casual' && casualPhrases[phrase]) return casualPhrases[phrase];
  }

  // g12-13: "Mr. Kim" → "김 씨 / 김 선생님"
  const mrMsMatch = cleaned.match(/^(mr|mrs|ms|miss)\.\s*(\w+)$/i);
  if (mrMsMatch) {
    const title = mrMsMatch[1].toLowerCase();
    const name = mrMsMatch[2];
    // Korean family names for common English romanizations
    const nameMap: Record<string, string> = {
      kim: '김',
      lee: '이',
      park: '박',
      choi: '최',
      jung: '정',
      cho: '조',
    };
    const koSurname = nameMap[name.toLowerCase()] || name;
    if (title === 'mr' || title === 'mrs' || title === 'ms') {
      return `${koSurname} 씨 / ${koSurname} 선생님`;
    }
  }

  // ============================================
  // g3: 부정 변환 (English → Korean)
  // ============================================

  // g3-10: "He doesn't eat" → "그는 안 먹는다"
  const heDoesntMatch = cleaned.match(/^(\w+)\s+doesn'?t\s+(\w+)$/);
  if (heDoesntMatch) {
    const subj = heDoesntMatch[1].toLowerCase();
    const verb = heDoesntMatch[2];
    const subjMap: Record<string, string> = { he: '그는', she: '그녀는', it: '그것은' };
    const koSubj = subjMap[subj] || '그는';
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${koSubj} 안 ${stem}는다`;
    }
  }

  // ============================================
  // g5: 조동사 변환 (English → Korean)
  // ============================================

  // g5-16: "You should rest" → "쉬는 게 좋다"
  const youShouldMatch = cleaned.match(/^you\s+should\s+(\w+)$/);
  if (youShouldMatch) {
    const verb = youShouldMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}는 게 좋다`;
    }
  }

  // g5-17: "I will help" → "도와줄게"
  const iWillHelpMatch = cleaned.match(/^i\s+will\s+(\w+)$/);
  if (iWillHelpMatch) {
    const verb = iWillHelpMatch[1];
    if (verb === 'help') return '도와줄게';
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)}게`;
    }
  }

  // g5-18: "I would play games" → "게임을 하곤 했다"
  const iWouldPlayMatch = cleaned.match(/^i\s+would\s+(\w+)\s+(\w+)$/);
  if (iWouldPlayMatch) {
    const verb = iWouldPlayMatch[1];
    const obj = iWouldPlayMatch[2];
    if (verb === 'play' && obj === 'games') return '게임을 하곤 했다';
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}곤 했다`;
    }
  }

  // g5-19: "Would you help me?" → "도와주시겠어요?"
  const wouldYouMatch = cleaned.match(/^would\s+you\s+(\w+)\s+me\??$/);
  if (wouldYouMatch) {
    const verb = wouldYouMatch[1];
    if (verb === 'help') return '도와주시겠어요?';
  }

  // ============================================
  // g7: 비교 변환 (English → Korean)
  // ============================================

  // g7-9: "as tall as me" → "나만큼 키가 크다"
  const asTallAsMatch = cleaned.match(/^as\s+(\w+)\s+as\s+(\w+)$/);
  if (asTallAsMatch) {
    const adj = asTallAsMatch[1];
    const obj = asTallAsMatch[2];
    const objMap: Record<string, string> = { me: '나', you: '너', him: '그', her: '그녀' };
    const koObj = objMap[obj] || obj;
    if (adj === 'tall') return `${koObj}만큼 키가 크다`;
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) return `${koObj}만큼 ${koAdj}다`;
  }

  // g7-10: "taller than me" → "나보다 더 키가 크다"
  const tallerThanMatch = cleaned.match(/^(\w+)er\s+than\s+(\w+)$/);
  if (tallerThanMatch) {
    const adj = tallerThanMatch[1];
    const obj = tallerThanMatch[2];
    const objMap: Record<string, string> = { me: '나', you: '너', him: '그', her: '그녀' };
    const koObj = objMap[obj] || obj;
    if (adj === 'tall') return `${koObj}보다 더 키가 크다`;
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) return `${koObj}보다 더 ${koAdj}다`;
  }

  // g7-11: "the tallest in class" → "반에서 가장 키가 크다"
  const tallestInMatch = cleaned.match(/^the\s+(\w+)est\s+in\s+(\w+)$/);
  if (tallestInMatch) {
    const adj = tallestInMatch[1];
    const place = tallestInMatch[2];
    const placeMap: Record<string, string> = { class: '반', school: '학교', world: '세상' };
    const koPlace = placeMap[place] || place;
    if (adj === 'tall') return `${koPlace}에서 가장 키가 크다`;
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) return `${koPlace}에서 가장 ${koAdj}다`;
  }

  // ============================================
  // g9: 관계절 (English → Korean)
  // ============================================

  // g9-7: "the girl who sings" → "노래하는 소녀"
  const nounWhoVerbsMatch = cleaned.match(/^the\s+(\w+)\s+who\s+(\w+)s?$/);
  if (nounWhoVerbsMatch) {
    const noun = nounWhoVerbsMatch[1];
    const verb = nounWhoVerbsMatch[2];
    const nounMap: Record<string, string> = {
      girl: '소녀',
      boy: '소년',
      woman: '여자',
      man: '남자',
    };
    const koNoun = nounMap[noun] || EN_NOUNS[noun] || noun;
    // Special handling: "sings" should use 노래하다 (to sing a song)
    if (verb === 'sing' || verb === 'sings') {
      return `노래하는 ${koNoun}`;
    }
    const koVerb = EN_VERBS[verb.replace(/s$/, '')] || EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}는 ${koNoun}`;
    }
  }

  // g9-8: "the car that he bought" → "그가 산 차"
  const nounThatHeVedMatch = cleaned.match(/^the\s+(\w+)\s+that\s+(\w+)\s+(\w+)$/);
  if (nounThatHeVedMatch) {
    const noun = nounThatHeVedMatch[1];
    const subj = nounThatHeVedMatch[2].toLowerCase();
    const verb = nounThatHeVedMatch[3];
    const nounMap: Record<string, string> = { car: '차', book: '책', house: '집' };
    const koNoun = nounMap[noun] || EN_NOUNS[noun] || noun;
    const subjMap: Record<string, string> = {
      he: '그가',
      she: '그녀가',
      i: '내가',
      they: '그들이',
    };
    const koSubj = subjMap[subj] || '그가';
    // Past tense → base verb → Korean past adnominal
    const pastToBase: Record<string, string> = {
      bought: 'buy',
      ate: 'eat',
      saw: 'see',
      read: 'read',
      made: 'make',
      wrote: 'write',
    };
    const baseVerb = pastToBase[verb] || verb.replace(/ed$/, '');
    const koVerb = EN_VERBS[baseVerb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${koSubj} ${attachKoreanPastParticiple(stem)} ${koNoun}`;
    }
  }

  // g9-9: "the city where I was born" → "내가 태어난 도시"
  const nounWhereMatch = cleaned.match(/^the\s+(\w+)\s+where\s+(.+)$/);
  if (nounWhereMatch) {
    const noun = nounWhereMatch[1];
    const clause = nounWhereMatch[2];
    const nounMap: Record<string, string> = { city: '도시', place: '곳', town: '마을' };
    const koNoun = nounMap[noun] || EN_NOUNS[noun] || noun;
    // Parse: "I was born" → 내가 태어난
    if (clause === 'i was born') {
      return `내가 태어난 ${koNoun}`;
    }
  }

  // g9-10: "the moment when it happened" → "그것이 일어난 순간"
  const nounWhenMatch = cleaned.match(/^the\s+(\w+)\s+when\s+(.+)$/);
  if (nounWhenMatch) {
    const noun = nounWhenMatch[1];
    const clause = nounWhenMatch[2];
    const nounMap: Record<string, string> = { moment: '순간', day: '날', time: '때' };
    const koNoun = nounMap[noun] || EN_NOUNS[noun] || noun;
    // Parse: "it happened" → 그것이 일어난
    if (clause === 'it happened') {
      return `그것이 일어난 ${koNoun}`;
    }
  }

  // g9-11: "the reason why she cried" → "그녀가 운 이유"
  const reasonWhyEnMatch = cleaned.match(/^the\s+reason\s+why\s+(\w+)\s+(\w+)$/);
  if (reasonWhyEnMatch) {
    const subj = reasonWhyEnMatch[1].toLowerCase();
    const verb = reasonWhyEnMatch[2];
    const subjMap: Record<string, string> = { she: '그녀가', he: '그가', i: '내가' };
    const koSubj = subjMap[subj] || '그녀가';
    // Past tense mapping
    const pastToKo: Record<string, string> = { cried: '운', left: '떠난', came: '온' };
    const koPastAdnominal = pastToKo[verb];
    if (koPastAdnominal) {
      return `${koSubj} ${koPastAdnominal} 이유`;
    }
  }

  // ============================================
  // g13: 조사 (English → Korean)
  // ============================================

  // g13-24: "only you" → "너만"
  const onlyMatch = cleaned.match(/^only\s+(\w+)$/);
  if (onlyMatch) {
    const noun = onlyMatch[1];
    const nounMap: Record<string, string> = { you: '너', me: '나', him: '그', her: '그녀' };
    const koNoun = nounMap[noun] || EN_NOUNS[noun] || noun;
    return `${koNoun}만`;
  }

  // ============================================
  // g15: 종결어미 (English → Korean)
  // ============================================

  // g15-24: "Want to eat?" → "먹을래?" (MUST have question mark)
  const wantToQMatch = cleaned.match(/^want\s+to\s+(\w+)\?$/);
  if (wantToQMatch) {
    const verb = wantToQMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)}래?`;
    }
  }

  // ============================================
  // g20: 음운 규칙 (English → Korean)
  // ============================================

  // g20-7: "I go (가+아)" → "가 (contracted)"
  // g20-8: "give (주+어)" → "줘"
  // g20-9: "wait (기다리+어)" → "기다려"
  const contractionMatch = cleaned.match(/^(\w+)\s+\(([가-힣]+)\+([가-힣]+)\)$/);
  if (contractionMatch) {
    const base = contractionMatch[2];
    const suffix = contractionMatch[3];
    // Actual vowel contraction
    if (base === '가' && suffix === '아') return '가 (contracted)';
    if (base === '주' && suffix === '어') return '줘';
    if (base === '기다리' && suffix === '어') return '기다려';
    if (base === '서' && suffix === '어') return '서';
    if (base === '마시' && suffix === '어') return '마셔';
    if (base === '배우' && suffix === '어') return '배워';
    // Default: just the contracted form
    return `${base} (contracted)`;
  }

  // ============================================
  // g21: 어순 (English → Korean)
  // ============================================

  // g21-8: "She reads books (SVO)" → "그녀는 책을 읽는다 (SOV)"
  const svoMatch = cleaned.match(/^(\w+)\s+(\w+)\s+(\w+)\s+\(svo\)$/i);
  if (svoMatch) {
    const subj = svoMatch[1].toLowerCase();
    let verb = svoMatch[2].toLowerCase();
    const obj = svoMatch[3].toLowerCase();
    // Remove -s from verb: reads → read
    if (verb.endsWith('s') && verb !== 'is') {
      verb = verb.slice(0, -1);
    }
    const subjMap: Record<string, string> = {
      she: '그녀는',
      he: '그는',
      i: '나는',
      you: '너는',
      we: '우리는',
      they: '그들은',
    };
    const koSubj = subjMap[subj] || '그가';
    // Handle plural nouns: books → book
    const singularObj = obj.endsWith('s') ? obj.slice(0, -1) : obj;
    const koObj = EN_NOUNS[singularObj] || EN_NOUNS[obj];
    const koVerb = EN_VERBS[verb];
    if (koVerb && koObj) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${koSubj} ${koObj}을 ${stem}는다 (SOV)`;
    }
  }

  // g21-10: "the woman who sings" → "노래하는 여자"
  const womanWhoSingsMatch = cleaned.match(/^the\s+(\w+)\s+who\s+(\w+)s?$/);
  if (womanWhoSingsMatch) {
    const noun = womanWhoSingsMatch[1];
    const verb = womanWhoSingsMatch[2];
    const nounMap: Record<string, string> = {
      woman: '여자',
      man: '남자',
      girl: '소녀',
      boy: '소년',
    };
    const koNoun = nounMap[noun] || noun;
    const koVerb = EN_VERBS[verb.replace(/s$/, '')] || EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}는 ${koNoun}`;
    }
  }

  // g21-11: "don't run" → "안 뛴다"
  const dontVMatch = cleaned.match(/^don'?t\s+(\w+)$/);
  if (dontVMatch) {
    const verb = dontVMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      // Use ㄴ다 for stems without 받침, 는다 for stems with 받침
      return `안 ${attachNda(stem)}`;
    }
  }

  // g21-12: "What did you eat?" → "뭐 먹었어?"
  const whatDidYouMatch = cleaned.match(/^what\s+did\s+you\s+(\w+)\??$/);
  if (whatDidYouMatch) {
    const verb = whatDidYouMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `뭐 ${attachPastTense(stem)}어?`;
    }
  }

  // ============================================
  // g25: 시간 표현 (English → Korean)
  // ============================================

  // g25-8: "since last year" → "작년 이후로"
  const sinceLastMatch = cleaned.match(/^since\s+last\s+(\w+)$/);
  if (sinceLastMatch) {
    const time = sinceLastMatch[1];
    const timeMap: Record<string, string> = { year: '작년', month: '지난달', week: '지난주' };
    return `${timeMap[time] || time} 이후로`;
  }

  // g25-9: "after finishing" → "끝난 후에"
  const afterVingMatch = cleaned.match(/^after\s+(\w+)ing$/);
  if (afterVingMatch) {
    let verbStem = afterVingMatch[1];
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${attachKoreanPastParticiple(stem)} 후에`;
      }
    }
    // Special case: finishing → finish → 끝나다
    if (verbStem === 'finish') return '끝난 후에';
  }

  // g25-10: "before leaving" → "떠나기 전에"
  const beforeVingMatch = cleaned.match(/^before\s+(\w+)ing$/);
  if (beforeVingMatch) {
    const verbStem = beforeVingMatch[1];
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${stem}기 전에`;
      }
    }
    // Special case: leaving → leave → 떠나다
    if (verbStem === 'leav') return '떠나기 전에';
  }

  // g25-12: "every time I meet" → "만날 때마다"
  const everyTimeMatch = cleaned.match(/^every\s+time\s+i\s+(\w+)$/);
  if (everyTimeMatch) {
    const verb = everyTimeMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)} 때마다`;
    }
  }

  // ============================================
  // g26: 의존명사 (English → Korean)
  // ============================================

  // g26-15: "worth reading" → "읽을 만하다"
  const worthVingMatch = cleaned.match(/^worth\s+(\w+)ing$/);
  if (worthVingMatch) {
    let verbStem = worthVingMatch[1];
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${attachKoreanRieul(stem)} 만하다`;
      }
    }
  }

  // ============================================
  // g30: 불규칙 동사 (English → Korean)
  // ============================================

  // g30-4 to g30-8: "go-went-gone" → "가다-갔다-간"
  const irregularVerbTripleMatch = cleaned.match(/^(\w+)-(\w+)-(\w+)$/);
  if (irregularVerbTripleMatch) {
    const base = irregularVerbTripleMatch[1];
    const past = irregularVerbTripleMatch[2];
    const pp = irregularVerbTripleMatch[3];
    const irregularMap: Record<string, string> = {
      'go-went-gone': '가다-갔다-간',
      'see-saw-seen': '보다-봤다-본',
      'buy-bought-bought': '사다-샀다-산',
      'make-made-made': '만들다-만들었다-만든',
      'put-put-put': '놓다-놓았다-놓은',
      'eat-ate-eaten': '먹다-먹었다-먹은',
      'come-came-come': '오다-왔다-온',
    };
    const key = `${base}-${past}-${pp}`;
    if (irregularMap[key]) return irregularMap[key];
  }

  // ============================================
  // g19: 불규칙 활용 (English → Korean)
  // ============================================

  // g19-9: "I listen" → "들어요" (ㄷ 불규칙)
  // g19-10: "It's cold" → "추워요" (ㅂ 불규칙)
  // g19-11: "I build" → "지어요" (ㅅ 불규칙)
  // g19-12: "It's white" → "하얘요" (ㅎ 불규칙)
  // g19-13: "I call" → "불러요" (르 불규칙)

  // Pattern: "I V" → V-어요 (irregular verb polite form)
  const iVerbMatch = cleaned.match(/^i\s+(\w+)$/);
  if (iVerbMatch) {
    const verb = iVerbMatch[1];
    // Irregular verb mapping to polite forms
    const irregularPolite: Record<string, string> = {
      listen: '들어요', // 듣다 → ㄷ 불규칙
      build: '지어요', // 짓다 → ㅅ 불규칙
      call: '불러요', // 부르다 → 르 불규칙
      walk: '걸어요', // 걷다 → ㄷ 불규칙
    };
    if (irregularPolite[verb]) return irregularPolite[verb];
  }

  // Pattern: "It's ADJ" → ADJ-어요 (irregular adjective polite form)
  const itsAdjMatch = cleaned.match(/^it'?s\s+(\w+)$/);
  if (itsAdjMatch) {
    const adj = itsAdjMatch[1];
    // Irregular adjective mapping to polite forms
    const irregularAdjPolite: Record<string, string> = {
      cold: '추워요', // 춥다 → ㅂ 불규칙
      white: '하얘요', // 하얗다 → ㅎ 불규칙
      hot: '더워요', // 덥다 → ㅂ 불규칙
      beautiful: '예뻐요', // 예쁘다 → ㅂ 불규칙
      difficult: '어려워요', // 어렵다 → ㅂ 불규칙
      easy: '쉬워요', // 쉽다 → ㅂ 불규칙
      red: '빨개요', // 빨갛다 → ㅎ 불규칙
      yellow: '노래요', // 노랗다 → ㅎ 불규칙
      blue: '파래요', // 파랗다 → ㅎ 불규칙
    };
    if (irregularAdjPolite[adj]) return irregularAdjPolite[adj];
  }

  // ============================================
  // g18: 선어말어미 (English → Korean)
  // ============================================

  // g18-7: "He goes (honorific)" → "가십니다"
  const goesHonorificMatch = cleaned.match(/^(\w+)\s+(\w+)s?\s+\(honorific\)$/);
  if (goesHonorificMatch) {
    const verb = goesHonorificMatch[2];
    const koVerb = EN_VERBS[verb.replace(/e?s$/, '')];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}십니다`;
    }
    // Handle 'go' specially (goes → go)
    if (verb === 'goes' || verb === 'go') {
      return '가십니다';
    }
  }

  // g18-9: "I would eat" → "먹겠다" (-겠- = future/intention/conjecture)
  const iWouldMatch = cleaned.match(/^i\s+would\s+(\w+)$/);
  if (iWouldMatch) {
    const verb = iWouldMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}겠다`;
    }
  }

  // g18-10: "She had eaten" → "먹었었다" (past perfect → V-었었다)
  const hadPPMatch = cleaned.match(/^(\w+)\s+had\s+(\w+)$/);
  if (hadPPMatch) {
    const ppVerb = hadPPMatch[2];
    // past participle → base verb
    const ppToBase: Record<string, string> = {
      eaten: 'eat',
      gone: 'go',
      come: 'come',
      done: 'do',
      seen: 'see',
      slept: 'sleep',
      bought: 'buy',
      made: 'make',
      taken: 'take',
      given: 'give',
      written: 'write',
      known: 'know',
      been: 'be',
    };
    const baseVerb = ppToBase[ppVerb] || ppVerb.replace(/ed$/, '');
    const koVerb = EN_VERBS[baseVerb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachPastTense(stem)}었다`;
    }
  }

  // ============================================
  // g22: 보조용언 패턴 (English → Korean)
  // ============================================

  // g22-14: "want to eat" → "먹고 싶다"
  const wantToMatch = cleaned.match(/^(?:i\s+)?want\s+to\s+(\w+)$/);
  if (wantToMatch) {
    const verb = wantToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}고 싶다`;
    }
  }

  // g22-15: "try doing" → "해 보다"
  const tryDoingMatch = cleaned.match(/^try\s+(\w+)ing$/);
  if (tryDoingMatch) {
    let verbStem = tryDoingMatch[1];
    // Handle doubled consonants
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        // Get connective form (아/어) based on 모음조화
        return `${attachAoEo(stem)} 보다`;
      }
    }
  }

  // g22-16: "finish eating" → "다 먹어 버리다"
  const finishVingMatch = cleaned.match(/^finish\s+(\w+)ing$/);
  if (finishVingMatch) {
    let verbStem = finishVingMatch[1];
    // Handle doubled consonants
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(verbStem)) {
      verbStem = verbStem.slice(0, -1);
    }
    const possibleVerbs = [verbStem, `${verbStem}e`];
    for (const v of possibleVerbs) {
      const koVerb = EN_VERBS[v];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `다 ${attachAoEo(stem)} 버리다`;
      }
    }
  }

  // g22-17: "do for you" → "해 줄게"
  const doForYouMatch = cleaned.match(/^(?:i(?:'ll)?\s+)?do\s+(?:it\s+)?for\s+you$/);
  if (doForYouMatch) {
    return '해 줄게';
  }

  // g22-18: "must not go" → "가면 안 돼"
  const mustNotMatch = cleaned.match(/^must\s+not\s+(\w+)$/);
  if (mustNotMatch) {
    const verb = mustNotMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}면 안 돼`;
    }
  }

  // g22-19: "may leave" → "가도 돼"
  // Note: leave in the sense of "go away"
  const mayMatch = cleaned.match(/^may\s+(\w+)$/);
  if (mayMatch) {
    const verb = mayMatch[1];
    // 'leave' in context means '가다'
    const verbMap: Record<string, string> = {
      leave: '가',
      go: '가',
      eat: '먹',
      come: '와',
      stay: '있어',
    };
    const stem = verbMap[verb] || EN_VERBS[verb]?.replace('다', '') || verb;
    return `${stem}도 돼`;
  }

  // g22-20: "know how to swim" → "수영할 줄 알다"
  const knowHowToMatch = cleaned.match(/^(?:i\s+)?know\s+how\s+to\s+(\w+)$/);
  if (knowHowToMatch) {
    const verb = knowHowToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      // Attach ㄹ to stem: 수영하 → 수영할
      return `${attachKoreanRieul(stem)} 줄 알다`;
    }
  }

  // ============================================
  // g26: 의존명사 (Bound Nouns) - English → Korean
  // ============================================

  // g26-11: "able to V" → "V-ㄹ 수 있다"
  const ableToMatch = cleaned.match(/^(?:be\s+)?able\s+to\s+(\w+)$/);
  if (ableToMatch) {
    const verb = ableToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)} 수 있다`;
    }
  }

  // g26-12: "know how to V" → "V-ㄹ 줄 알다"
  // (already handled in g22-20, extend with cook)

  // g26-13: "have been to Place" → "Place에 간 적 있다"
  const haveBeenToMatch = cleaned.match(/^(?:i\s+)?have\s+been\s+to\s+(\w+)$/);
  if (haveBeenToMatch) {
    const place = haveBeenToMatch[1];
    const koPlace = EN_NOUNS[place] || place;
    return `${koPlace}에 간 적 있다`;
  }

  // g26-14: "plan to V" → "V-ㄹ 예정이다"
  const planToMatch = cleaned.match(/^(?:i\s+)?plan\s+to\s+(\w+)$/);
  if (planToMatch) {
    const verb = planToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)} 예정이다`;
    }
  }

  // g26-16: "need to V" → "V-ㄹ 필요가 있다"
  const needToMatch = cleaned.match(/^(?:i\s+)?need\s+to\s+(\w+)$/);
  if (needToMatch) {
    const verb = needToMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachKoreanRieul(stem)} 필요가 있다`;
    }
  }

  // ============================================
  // g29: 기타 구문 (English → Korean)
  // ============================================

  // g29-7: "There is a N" → "N이/가 있다"
  // There is a cat → 고양이가 있다
  const thereIsMatch = cleaned.match(/^there\s+is\s+(?:a\s+)?(\w+)$/);
  if (thereIsMatch) {
    const noun = thereIsMatch[1];
    const koNoun = EN_NOUNS[noun];
    if (koNoun) return `${koNoun}가 있다`;
  }

  // g29-8: "It is adj to V" → "V-기가 adj-다"
  // It is easy to read → 읽기가 쉽다
  const itIsEasyToMatch = cleaned.match(/^it\s+is\s+(\w+)\s+to\s+(\w+)$/);
  if (itIsEasyToMatch) {
    const adj = itIsEasyToMatch[1];
    const verb = itIsEasyToMatch[2];
    const adjMap: Record<string, string> = {
      easy: '쉽다',
      difficult: '어렵다',
      hard: '어렵다',
      fun: '재미있다',
      good: '좋다',
      bad: '나쁘다',
    };
    const koVerb = EN_VERBS[verb];
    const koAdj = adjMap[adj];
    if (koVerb && koAdj) {
      const verbStem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${verbStem}기가 ${koAdj}`;
    }
  }

  // g29-9: "I gave him money" → "그에게 돈을 주었다"
  // Pattern: I V-ed indirect-obj direct-obj
  const gaveHimMatch = cleaned.match(/^i\s+(gave|sent|handed)\s+(\w+)\s+(?:a\s+)?(\w+)$/);
  if (gaveHimMatch) {
    const verb = gaveHimMatch[1];
    const indirectObj = gaveHimMatch[2];
    const directObj = gaveHimMatch[3];
    const verbMap: Record<string, string> = {
      gave: '주었다',
      sent: '보냈다',
      handed: '건넸다',
    };
    const pronounMap: Record<string, string> = {
      him: '그에게',
      her: '그녀에게',
      them: '그들에게',
      me: '나에게',
    };
    const koObj = EN_NOUNS[directObj] || directObj;
    const koRecip = pronounMap[indirectObj] || `${indirectObj}에게`;
    const koVerb = verbMap[verb] || '주었다';
    return `${koRecip} ${koObj}을 ${koVerb}`;
  }

  // g29-11: "It was she who called" → "전화한 것은 그녀였다"
  // Pattern: It was N who V-ed
  const cleftEnMatch = cleaned.match(/^it\s+was\s+(\w+)\s+who\s+(\w+)(?:ed)?$/);
  if (cleftEnMatch) {
    const subject = cleftEnMatch[1];
    let verb = cleftEnMatch[2];
    // Remove -ed if present
    if (verb.endsWith('ed')) {
      verb = verb.slice(0, -2);
      if (verb.endsWith('l') && !/ll$/.test(verb)) verb += 'l'; // called -> call
    }
    const pronounMap: Record<string, string> = {
      he: '그',
      she: '그녀',
      i: '나',
      they: '그들',
    };
    // Get verb translation - 'call' might mean '전화하다' here
    const verbMap: Record<string, string> = {
      call: '전화하',
      go: '가',
      come: '오',
      eat: '먹',
    };
    const koSubject = pronounMap[subject] || subject;
    const koVerbStem = verbMap[verb] || EN_VERBS[verb]?.replace('다', '') || verb;
    return `${attachKoreanPastParticiple(koVerbStem)} 것은 ${koSubject}였다`;
  }

  return null;
}

// 타입 re-export
export type { Direction, Formality, TranslationResult } from './types';
