// ========================================
// English to Korean Engine - 영→한 자소 기반 번역
// 문장 수준 번역 지원 (토큰화, 접속사 처리, 어순 변환)
// ========================================

import { translatePrefix } from '../dictionary/prefixes';
import { translateStemEnToKo } from '../dictionary/stems';
import { translateSuffix } from '../dictionary/suffixes';
import { enToKoWords } from '../dictionary/words';
import { decomposeEnglish, type EnglishMorpheme } from '../jaso/english-morpheme';

export interface EnToKoResult {
  original: string; // 원본
  morpheme: EnglishMorpheme; // 형태소 분해
  koreanPrefix: string; // 한국어 접두사
  koreanStem: string; // 한국어 어간
  koreanSuffix: string; // 한국어 접미사
  translated: string; // 최종 번역
}

// 영어 접속사 → 한국어 연결어미
const ENGLISH_CONJUNCTIONS: Record<string, string> = {
  and: '그리고',
  but: '하지만',
  or: '또는',
  because: '왜냐하면',
  so: '그래서',
  // biome-ignore lint/suspicious/noThenProperty: dictionary key for translation
  then: '그리고',
  if: '만약',
  when: '때',
  while: '동안',
  although: '비록',
  however: '하지만',
};

// 영어 전치사 → 한국어 조사
const ENGLISH_PREPOSITIONS: Record<string, string> = {
  at: '에서',
  in: '에',
  on: '위에',
  to: '에',
  for: '위해',
  with: '와 함께',
  from: '에서부터',
  by: '에 의해',
  about: '에 대해',
  of: '의',
  during: '동안',
  after: '후에',
  before: '전에',
  into: '안으로',
  through: '통해',
  between: '사이에',
  among: '가운데',
  under: '아래에',
  over: '위에',
  near: '근처에',
  nearby: '근처',
};

// 영어 관사/한정사 (번역 시 생략)
const ENGLISH_ARTICLES = new Set(['the', 'a', 'an']);

// 영어 be 동사 (번역 시 특수 처리)
const ENGLISH_BE_VERBS = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);

/**
 * 영어 → 한국어 번역 (자소 기반)
 * 문장 수준 번역 지원
 *
 * @example
 * translateEnToKo('unhappiness') → '불행복함'
 * translateEnToKo('I ate breakfast') → '나는 아침을 먹었다'
 */
export function translateEnToKo(text: string): string {
  // 문장인지 단어인지 판별
  const hasSpaces = text.includes(' ');
  const hasCommas = text.includes(',');

  if (hasSpaces || hasCommas) {
    // 문장 수준 번역
    return translateSentenceEnToKo(text);
  }

  // 단어 수준 번역
  const result = translateEnToKoDetailed(text);
  return result?.translated || text;
}

/**
 * 문장 수준 영→한 번역
 */
function translateSentenceEnToKo(text: string): string {
  // 1. 쉼표로 절 분리
  const clauses = text.split(/,\s*/);
  const translatedClauses: string[] = [];

  for (const clause of clauses) {
    if (!clause.trim()) continue;
    const translatedClause = translateClauseEnToKo(clause.trim());
    translatedClauses.push(translatedClause);
  }

  // 절들을 적절한 접속사로 연결
  return translatedClauses.join(', ');
}

/**
 * 절 수준 영→한 번역 (SVO → SOV 변환)
 */
function translateClauseEnToKo(clause: string): string {
  // 토큰화 (공백 기준)
  const tokens = clause.split(/\s+/);

  // 각 토큰 분석 및 번역
  const analyzed: Array<{
    original: string;
    translated: string;
    role:
      | 'subject'
      | 'verb'
      | 'object'
      | 'preposition'
      | 'conjunction'
      | 'adverb'
      | 'adjective'
      | 'article'
      | 'auxiliary'
      | 'unknown';
    tense?: 'past' | 'present' | 'future';
  }> = [];

  let prevRole: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    const result = analyzeAndTranslateEnToken(token, prevRole, i === 0);
    analyzed.push(result);
    prevRole = result.role;
  }

  // SOV 어순으로 재배열
  return rearrangeToSOV(analyzed);
}

/**
 * 영어 토큰 분석 및 번역
 */
function analyzeAndTranslateEnToken(
  token: string,
  prevRole: string | undefined,
  isFirst: boolean,
): {
  original: string;
  translated: string;
  role:
    | 'subject'
    | 'verb'
    | 'object'
    | 'preposition'
    | 'conjunction'
    | 'adverb'
    | 'adjective'
    | 'article'
    | 'auxiliary'
    | 'unknown';
  tense?: 'past' | 'present' | 'future';
} {
  const lowerToken = token.toLowerCase();

  // 1. 관사 체크 (번역에서 생략)
  if (ENGLISH_ARTICLES.has(lowerToken)) {
    return { original: token, translated: '', role: 'article' };
  }

  // 2. 접속사 체크
  const conjunction = ENGLISH_CONJUNCTIONS[lowerToken];
  if (conjunction) {
    return { original: token, translated: conjunction, role: 'conjunction' };
  }

  // 3. 전치사 체크
  const preposition = ENGLISH_PREPOSITIONS[lowerToken];
  if (preposition) {
    return { original: token, translated: preposition, role: 'preposition' };
  }

  // 4. be 동사 체크
  if (ENGLISH_BE_VERBS.has(lowerToken)) {
    const tense = ['was', 'were'].includes(lowerToken) ? ('past' as const) : ('present' as const);
    return { original: token, translated: '', role: 'auxiliary', tense };
  }

  // 5. 사전에서 직접 검색
  const directTranslation = enToKoWords[lowerToken];
  if (directTranslation !== undefined) {
    // 역할 추론
    let role: 'subject' | 'verb' | 'object' | 'adverb' | 'adjective' | 'unknown' = 'unknown';

    // 첫 번째 단어이고 대명사면 주어
    if (isFirst && ['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(lowerToken)) {
      role = 'subject';
    }
    // 이전이 주어/부사면 동사
    else if (prevRole === 'subject' || prevRole === 'adverb' || prevRole === 'auxiliary') {
      role = 'verb';
    }
    // 이전이 동사면 목적어
    else if (prevRole === 'verb') {
      role = 'object';
    }
    // 이전이 전치사면 목적어
    else if (prevRole === 'preposition') {
      role = 'object';
    }

    return { original: token, translated: directTranslation, role };
  }

  // 6. 형태소 분해 번역
  const morphemeResult = translateEnToKoDetailed(token);
  if (morphemeResult && morphemeResult.translated !== token) {
    let role: 'subject' | 'verb' | 'object' | 'adverb' | 'adjective' | 'unknown' = 'unknown';

    if (prevRole === 'subject' || prevRole === 'adverb' || prevRole === 'auxiliary') {
      role = 'verb';
    } else if (prevRole === 'verb' || prevRole === 'preposition') {
      role = 'object';
    }

    return { original: token, translated: morphemeResult.translated, role };
  }

  // 7. 원본 반환 (로마자 유지)
  return { original: token, translated: token, role: 'unknown' };
}

/**
 * SVO → SOV 어순 변환
 */
function rearrangeToSOV(
  tokens: Array<{
    original: string;
    translated: string;
    role: string;
    tense?: string;
  }>,
): string {
  const subjects: string[] = [];
  const verbs: string[] = [];
  const objects: string[] = [];
  const adverbs: string[] = [];
  const conjunctions: string[] = [];
  const others: string[] = [];
  let pastTense = false;

  for (const token of tokens) {
    // 빈 번역은 건너뜀 (관사, be동사 등)
    if (!token.translated) {
      // be 동사의 시제는 기억
      if (token.role === 'auxiliary' && token.tense === 'past') {
        pastTense = true;
      }
      continue;
    }

    switch (token.role) {
      case 'subject':
        // 주어에 조사 '는' 추가
        subjects.push(`${token.translated}는`);
        break;
      case 'verb':
        verbs.push(token.translated);
        break;
      case 'object':
        // 목적어에 조사 '를' 추가 (단, 전치사 뒤에 온 경우 제외)
        objects.push(token.translated);
        break;
      case 'preposition':
        // 전치사는 목적어 뒤에 붙음
        if (objects.length > 0) {
          const lastObj = objects.pop();
          objects.push(`${lastObj} ${token.translated}`);
        } else {
          others.push(token.translated);
        }
        break;
      case 'conjunction':
        conjunctions.push(token.translated);
        break;
      case 'adverb':
      case 'adjective':
        adverbs.push(token.translated);
        break;
      default:
        others.push(token.translated);
    }
  }

  // SOV 순서로 조합 (주어 + 부사 + 목적어 + 동사)
  const parts: string[] = [];

  // 접속사 (문두)
  if (conjunctions.length > 0) {
    parts.push(...conjunctions);
  }

  // 주어
  if (subjects.length > 0) {
    parts.push(...subjects);
  }

  // 부사
  if (adverbs.length > 0) {
    parts.push(...adverbs);
  }

  // 기타 (장소, 시간 등)
  if (others.length > 0) {
    parts.push(...others);
  }

  // 목적어
  if (objects.length > 0) {
    // 목적어에 조사 추가
    const objsWithParticle = objects.map((obj, idx) => {
      // 마지막 목적어에만 '를' 추가
      if (idx === objects.length - 1 && !obj.includes('에') && !obj.includes('와')) {
        return `${obj}를`;
      }
      return obj;
    });
    parts.push(...objsWithParticle);
  }

  // 동사 (문장 끝)
  if (verbs.length > 0) {
    // 과거 시제 적용
    const verbsWithTense = verbs.map((v) => {
      if (pastTense && !v.endsWith('다') && !v.endsWith('었다') && !v.endsWith('았다')) {
        return `${v}었다`;
      }
      return v;
    });
    parts.push(...verbsWithTense);
  }

  // 공백으로 연결
  return parts.filter((p) => p.trim()).join(' ');
}

/**
 * 영어 → 한국어 번역 (상세 정보 포함)
 */
export function translateEnToKoDetailed(text: string): EnToKoResult | null {
  // 1. 형태소 분해
  const morpheme = decomposeEnglish(text);

  // 2. 접두사 번역
  const koreanPrefix = morpheme.prefix ? translatePrefix(morpheme.prefix) : '';

  // 3. 어간 번역
  const koreanStem = translateStemEnToKo(morpheme.stem) || morpheme.stem;

  // 4. 접미사 번역
  const koreanSuffix = translateEnglishSuffix(morpheme.suffix, morpheme.suffixInfo?.type);

  // 5. 조합
  let translated = koreanPrefix + koreanStem + koreanSuffix;

  // 6. 후처리 (자연스러운 한국어 형태로)
  translated = postProcessKorean(translated, morpheme);

  return {
    original: text,
    morpheme,
    koreanPrefix,
    koreanStem,
    koreanSuffix,
    translated,
  };
}

/**
 * 영어 접미사를 한국어로 번역
 */
function translateEnglishSuffix(suffix: string, type?: string): string {
  if (!suffix) return '';

  // 동사 접미사
  if (type === 'verb') {
    // 과거형
    if (suffix.includes('ed')) {
      return '었다'; // 간단 버전
    }

    // 진행형
    if (suffix.includes('ing')) {
      return '는'; // 간단 버전
    }

    // 3인칭 단수
    if (suffix === 's' || suffix === 'es') {
      return '다';
    }
  }

  // 명사 접미사
  if (type === 'noun') {
    if (suffix === 'ness') return '함';
    if (suffix === 'ment' || suffix === 'tion' || suffix === 'sion') return '것';
    if (suffix === 'er' || suffix === 'or') return '하는사람';
    if (suffix === 'ist') return '주의자';
    if (suffix === 'ship') return '관계';
    if (suffix === 'hood') return '상태';
    if (suffix === 'ity') return '성';
  }

  // 형용사 접미사
  if (type === 'adjective') {
    if (suffix === 'able' || suffix === 'ible') return '할수있는';
    if (suffix === 'ful') return '로운';
    if (suffix === 'less') return '없는';
    if (suffix === 'ous' || suffix === 'ious') return '한';
    if (suffix === 'ive') return '한';
    if (suffix === 'al' || suffix === 'ial') return '한';
    if (suffix === 'y') return '한';
  }

  // 부사 접미사
  if (type === 'adverb') {
    if (suffix.includes('ly')) return '하게';
  }

  // 기본 번역 시도
  return translateSuffix(suffix);
}

/**
 * 한국어 후처리 (자연스러운 형태로)
 */
function postProcessKorean(text: string, morpheme: EnglishMorpheme): string {
  let result = text;

  // 동사 접미사 자연스럽게 변환
  if (morpheme.suffixInfo?.type === 'verb') {
    // ing → 고있다/는중이다
    if (morpheme.suffix.includes('ing')) {
      result = result.replace(/는$/, '고있다');
    }

    // ed → 었다/았다
    if (morpheme.suffix.includes('ed')) {
      // 어간의 마지막 모음에 따라 었다/았다 선택
      // 간단 버전: 일단 었다 사용
      result = result.replace(/었다$/, '었다');
    }
  }

  // 명사화 접미사 자연스럽게
  if (morpheme.suffixInfo?.type === 'noun') {
    if (morpheme.suffix === 'ness') {
      // happiness → 행복함
      result = result.replace(/함$/, '함');
    }

    if (morpheme.suffix === 'er' || morpheme.suffix === 'or') {
      // teacher → 가르치는사람
      result = result.replace(/하는사람$/, '는사람');
    }
  }

  // 형용사 접미사
  if (morpheme.suffixInfo?.type === 'adjective') {
    if (morpheme.suffix === 'able' || morpheme.suffix === 'ible') {
      // readable → 읽을수있는
      result = result.replace(/할수있는$/, '할수있는');
    }

    if (morpheme.suffix === 'ful') {
      // beautiful → 아름다로운
      result = result.replace(/로운$/, '운');
    }

    if (morpheme.suffix === 'less') {
      // helpless → 도움없는
      result = result.replace(/없는$/, '없는');
    }
  }

  // 공백 제거 (한국어는 붙여씀)
  result = result.replace(/\s+/g, '');

  return result;
}

/**
 * 여러 단어 번역 (공백으로 구분)
 */
export function translateEnToKoMultiple(text: string): string {
  const words = text.split(/\s+/);
  const translated = words.map((word) => translateEnToKo(word));
  return translated.join(' ');
}
