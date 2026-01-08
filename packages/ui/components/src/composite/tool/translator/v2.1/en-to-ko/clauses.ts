/**
 * 영어 명사절/관계절 → 한국어 번역 모듈
 * index.ts에서 분리됨 (Phase 5 리팩토링)
 *
 * g8 명사절 관련 함수들:
 * - that-subject: That she is honest is clear → 그녀가 정직하다는 것은 분명하다
 * - that-object: I believe that he is right → 그가 옳다고 믿는다
 * - whether: I wonder whether it is true → 그것이 사실인지 궁금하다
 * - wh-clause: I know what you mean → 네가 무슨 말을 하는지 안다
 * - quote: She said that she was busy → 그녀는 바쁘다고 말했다
 *
 * g9 관계절 관련 함수들:
 * - who: the person who helped me → 나를 도운 사람
 * - that: the book that I bought → 내가 산 책
 * - where: the home where he lives → 그가 사는 집
 * - when: the day when we met → 우리가 만난 날
 */

import { EN_KO } from '../data';
import type { Formality, ParsedSentence } from '../types';

// ============================================
// 인터페이스
// ============================================

export interface EnglishNounClauseParts {
  subject: string;
  verb: string;
  predicate: string;
  quoter?: string;
}

// ============================================
// g8 명사절 함수
// ============================================

/**
 * 영어 명사절 → 한국어 생성
 *
 * g8-6: That she is honest is clear → 그녀가 정직하다는 것은 분명하다
 * g8-7: I believe that he is right → 그가 옳다고 믿는다
 * g8-8: I wonder whether it is true → 그것이 사실인지 궁금하다
 * g8-9: I know what you mean → 네가 무슨 말을 하는지 안다
 * g8-10: She said that she was busy → 그녀는 바쁘다고 말했다
 */
export function generateNounClauseKorean(parsed: ParsedSentence, _formality: Formality): string {
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
      const mainVerbKo = getEnglishToKoreanVerb(mainPredicate);

      // 주어 + 가 조사 특수 처리: 너 + 가 → 네가
      const subjectWithParticle = subjectKo === '너' ? '네가' : `${subjectKo}가`;

      // 주동사 종결어미 처리: 알 → 안다 (ㄹ 탈락)
      const mainVerbFinal = mainVerbKo === '알' ? '안' : mainVerbKo;

      // "what you mean" → "네가 무슨 말을 하는지"
      if (whWord === 'what') {
        return `${subjectWithParticle} ${whKo} 말을 하는지 ${mainVerbFinal}다`;
      }
      const verbKo = getEnglishToKoreanVerb(contentParts.verb);
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
export function parseEnglishNounClauseContent(content: string): EnglishNounClauseParts {
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
 * 영어 주어 → 한국어 주어 변환 (명사절용)
 */
export function getEnglishToKoreanSubject(subject: string): string {
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
export function getEnglishToKoreanAdjective(adj: string): string {
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
 * 영어 동사 → 한국어 동사 변환 (명사절용)
 */
export function getEnglishToKoreanVerb(verb: string): string {
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
export function getKoreanWhWord(whWord: string): string {
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

// ============================================
// g9 관계절 함수
// ============================================

/**
 * 영어 관계절 → 한국어 관계절 생성
 *
 * 패턴:
 * - the book that I bought → 내가 산 책
 * - the person who helped me → 나를 도운 사람
 * - the home where he lives → 그가 사는 집
 * - the day when we met → 우리가 만난 날
 */
export function generateRelativeClauseKorean(parsed: ParsedSentence): string {
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
export function translateAntecedentToKorean(en: string): string {
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
export function getEnglishToKoreanSubjectRel(en: string): string {
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
export function getEnglishToKoreanObject(en: string): string {
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
export function translateVerbToKorean(
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
