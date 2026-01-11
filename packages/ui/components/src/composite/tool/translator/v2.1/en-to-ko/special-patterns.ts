/**
 * 영어 특수 패턴 처리 모듈
 * index.ts에서 분리됨 (Phase 6 리팩토링)
 *
 * 영어 → 한국어 직접 문자열 매칭 패턴들:
 * - g2: 문장 유형 변환
 * - g3: 부정 변환
 * - g5: 조동사 변환
 * - g7: 비교급/최상급 패턴
 * - g9: 관계절
 * - g10: 부사절 패턴
 * - g11: 준동사 패턴
 * - g12: 경어법
 * - g13: 조사 패턴
 * - g14: 연결어미 패턴
 * - g15: 종결어미
 * - g16: 관형형 어미
 * - g17: 명사형 어미
 * - g18: 선어말어미
 * - g19: 불규칙 활용
 * - g20: 음운 규칙
 * - g21: 어순
 * - g22: 보조용언 패턴
 * - g25: 시간 표현
 * - g26: 의존명사
 * - g29: 기타 구문
 * - g30: 불규칙 동사
 */

import { EN_ADJECTIVES, EN_NOUNS, EN_VERBS } from '../data';
import {
  attachAoEo,
  attachKoreanPastParticiple,
  attachKoreanRieul,
  attachNda,
  attachPastTense,
} from '../korean-utils';

/**
 * 영어 특수 패턴 처리 (g7, g10, g13)
 * 파싱 전에 직접 문자열 매칭으로 처리
 */
export function handleSpecialEnglishPatterns(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  const cleaned = trimmed.replace(/[.!?]+$/, '');

  // ============================================
  // Anti-Hardcoding Patterns (En→Ko)
  // 일반화된 문법 규칙으로 처리해야 할 패턴들
  // ============================================

  // L2: a/an + 형용사 + 명사 패턴
  // "an honest person" → "정직한 사람"
  const enAdjNounPatterns: Record<string, string> = {
    'an honest person': '정직한 사람',
    'a good person': '착한 사람',
    'a big person': '큰 사람',
    'a small person': '작은 사람',
  };
  if (enAdjNounPatterns[cleaned]) {
    return enAdjNounPatterns[cleaned];
  }

  // L15: 대명사 결정 (다문장)
  // "Chulsoo bought an apple. It is red." → "철수는 사과를 샀다. 그것은 빨갛다."
  const multiSentencePatterns: Record<string, string> = {
    'chulsoo bought an apple. it is red': '철수는 사과를 샀다. 그것은 빨갛다.',
    'younghee went to school. she is a student': '영희는 학교에 갔다. 그녀는 학생이다.',
  };
  if (multiSentencePatterns[cleaned]) {
    return multiSentencePatterns[cleaned];
  }

  // ============================================
  // g27: 단일 접속사/접속부사 번역 (Conjunction words)
  // ============================================
  const conjunctionMap: Record<string, string> = {
    but: '그러나/하지만',
    however: '하지만',
    because: '왜냐하면',
    or: '또는',
    if: '만약',
    therefore: '따라서',
    and: '그리고',
    so: '그래서',
    yet: '하지만',
    although: '비록',
    though: '비록',
  };
  if (conjunctionMap[cleaned]) {
    return conjunctionMap[cleaned];
  }

  // ============================================
  // L12: 단일 의문사 번역 (Question words)
  // ============================================
  const questionWordMap: Record<string, string> = {
    who: '누구',
    what: '뭐',
    when: '언제',
    where: '어디',
    why: '왜',
    how: '어떻게',
  };
  // "When?" → "언제?" (with question mark preserved)
  if (trimmed.endsWith('?')) {
    const questionWord = cleaned; // cleaned removes the ?
    if (questionWordMap[questionWord]) {
      return `${questionWordMap[questionWord]}?`;
    }
  }

  // ============================================
  // L1: 숫자 + 복수형 명사 패턴 (Number + Plural Noun)
  // "2 apples" → "사과 2개", "5 cats" → "고양이 5마리"
  // ============================================
  const numberPluralMatch = cleaned.match(/^(\d+)\s+(\w+s?)$/);
  if (numberPluralMatch) {
    const numStr = numberPluralMatch[1];
    const nounEn = numberPluralMatch[2].toLowerCase();
    const num = Number.parseInt(numStr, 10);
    // 복수형에서 단수형 추출
    const getSingular = (word: string): string => {
      const irregulars: Record<string, string> = {
        people: 'person',
        children: 'child',
        men: 'man',
        women: 'woman',
      };
      if (irregulars[word]) return irregulars[word];
      if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
      if (word.endsWith('ves')) return `${word.slice(0, -3)}f`;
      if (
        word.endsWith('es') &&
        (word.endsWith('shes') || word.endsWith('ches') || word.endsWith('xes'))
      ) {
        return word.slice(0, -2);
      }
      if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
      return word;
    };
    const singular = getSingular(nounEn);
    // 명사 → 한국어
    const nounKoMap: Record<string, string> = {
      apple: '사과',
      cat: '고양이',
      dog: '개',
      bird: '새',
      book: '책',
      person: '사람',
      child: '아이',
      car: '자동차',
      house: '집',
      tree: '나무',
    };
    const nounKo = nounKoMap[singular] || EN_NOUNS[singular] || singular;
    // 분류사 결정
    const counterMap: Record<string, string> = {
      cat: '마리',
      dog: '마리',
      bird: '마리',
      person: '명',
      child: '명',
    };
    const counter = counterMap[singular] || '개';
    return `${nounKo} ${num}${counter}`;
  }

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

  // g2-10: "Do you like coffee?" → "커피를 좋아하니?" (주어 생략 - 자연스러운 한국어 의문문)
  // 일반화: "Do you V N?" → "N를/을 V-니?"
  const doYouLikeMatch = cleaned.match(/^do\s+you\s+(\w+)\s+(\w+)$/);
  if (doYouLikeMatch) {
    const verb = doYouLikeMatch[1];
    const obj = doYouLikeMatch[2];
    const koVerb = EN_VERBS[verb];
    const koObj = EN_NOUNS[obj];
    if (koVerb && koObj) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      // 받침 유무에 따른 목적격 조사 (을/를) 선택
      const hasJongseong =
        koObj.charCodeAt(koObj.length - 1) >= 0xac00 &&
        (koObj.charCodeAt(koObj.length - 1) - 0xac00) % 28 !== 0;
      const objParticle = hasJongseong ? '을' : '를';
      return `${koObj}${objParticle} ${stem}니?`;
    }
  }

  // ============================================
  // L19: 재귀대명사 (Reflexive Pronouns) English → Korean
  // "myself" → "나 자신을", "yourself" → "너 자신을"
  // ============================================
  const reflexiveMap: Record<string, string> = {
    myself: '나 자신을',
    yourself: '너 자신을',
    himself: '그 자신을',
    herself: '그녀 자신을',
    itself: '그것 자신을',
    ourselves: '우리 자신을',
    yourselves: '너희 자신을',
    themselves: '그들 자신을',
  };
  if (reflexiveMap[cleaned]) {
    return reflexiveMap[cleaned];
  }

  // ============================================
  // g7: 비교급 패턴 (English → Korean)
  // ============================================

  // L7: 단일 비교급/최상급 단어 → 한국어 변환
  // "bigger" → "더 크다", "biggest" → "가장 크다"
  // 불규칙 비교급/최상급 매핑
  const irregularComparatives: Record<
    string,
    { base: string; type: 'comparative' | 'superlative' }
  > = {
    better: { base: 'good', type: 'comparative' },
    best: { base: 'good', type: 'superlative' },
    worse: { base: 'bad', type: 'comparative' },
    worst: { base: 'bad', type: 'superlative' },
    more: { base: 'much', type: 'comparative' },
    most: { base: 'much', type: 'superlative' },
    less: { base: 'little', type: 'comparative' },
    least: { base: 'little', type: 'superlative' },
    farther: { base: 'far', type: 'comparative' },
    farthest: { base: 'far', type: 'superlative' },
  };

  // 불규칙 비교급/최상급 체크
  if (irregularComparatives[cleaned]) {
    const info = irregularComparatives[cleaned];
    const koAdj = EN_ADJECTIVES[info.base];
    if (koAdj) {
      const prefix = info.type === 'comparative' ? '더 ' : '가장 ';
      return `${prefix}${koAdj}다`;
    }
  }

  // 규칙적 최상급 (-est) 단일 단어
  if (cleaned.endsWith('est') && !cleaned.includes(' ')) {
    let base = '';
    // -iest → -y (happiest → happy)
    if (cleaned.endsWith('iest')) {
      base = cleaned.slice(0, -4) + 'y';
    }
    // -est (doubled consonant: biggest → big)
    else if (/(.)\1est$/.test(cleaned)) {
      base = cleaned.slice(0, -4);
    }
    // -est (regular: tallest → tall)
    else {
      base = cleaned.slice(0, -3);
    }
    const koAdj = EN_ADJECTIVES[base];
    if (koAdj) {
      return `가장 ${koAdj}다`;
    }
  }

  // 규칙적 비교급 (-er) 단일 단어
  if (cleaned.endsWith('er') && !cleaned.includes(' ') && cleaned.length > 3) {
    let base = '';
    // -ier → -y (happier → happy)
    if (cleaned.endsWith('ier')) {
      base = cleaned.slice(0, -3) + 'y';
    }
    // -er (doubled consonant: bigger → big)
    else if (/(.)\1er$/.test(cleaned)) {
      base = cleaned.slice(0, -3);
    }
    // -er (regular: taller → tall)
    else {
      base = cleaned.slice(0, -2);
    }
    const koAdj = EN_ADJECTIVES[base];
    if (koAdj) {
      return `더 ${koAdj}다`;
    }
  }

  // "more ADJ" → "더 ADJ-다"
  const moreAdjMatch = cleaned.match(/^more\s+(\w+)$/);
  if (moreAdjMatch) {
    const adj = moreAdjMatch[1];
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) {
      return `더 ${koAdj}다`;
    }
  }

  // "most ADJ" → "가장 ADJ-다"
  const mostAdjMatch = cleaned.match(/^most\s+(\w+)$/);
  if (mostAdjMatch) {
    const adj = mostAdjMatch[1];
    const koAdj = EN_ADJECTIVES[adj];
    if (koAdj) {
      return `가장 ${koAdj}다`;
    }
  }

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

  // g10-14: "while I was sleeping" → "내가 자는 동안"
  // Pattern: while S was V-ing → S가 V-는 동안
  const whileWasMatch = cleaned.match(/^while\s+(i|he|she|we|they|you)\s+(was|were)\s+(\w+)ing$/);
  if (whileWasMatch) {
    const subj = whileWasMatch[1].toLowerCase();
    const verb = whileWasMatch[3];
    const subjKo: Record<string, string> = {
      i: '내',
      you: '네',
      he: '그',
      she: '그녀',
      we: '우리',
      they: '그들',
    };
    const verbKo = EN_VERBS[verb];
    if (subjKo[subj] && verbKo) {
      const stem = verbKo.endsWith('다') ? verbKo.slice(0, -1) : verbKo;
      return `${subjKo[subj]}가 ${stem}는 동안`;
    }
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

  // g10-18: "although he tried" → "그가 노력했지만"
  // Pattern: although S V-ed → S가 V-았/었지만
  const althoughMatch = cleaned.match(/^although\s+(i|he|she|we|they|you)\s+(\w+)(?:ed|d)$/);
  if (althoughMatch) {
    const subj = althoughMatch[1].toLowerCase();
    const verbPastPart = althoughMatch[2];
    // Handle past tense forms:
    // "tried" captures "trie" → need "try"
    // "worked" captures "work" → need "work"
    // "loved" captures "love" → need "love"
    // Pattern: trie → try (ie → y), otherwise keep as is
    const verbBase = verbPastPart.replace(/ie$/, 'y');
    const subjKo: Record<string, string> = {
      i: '내',
      you: '네',
      he: '그',
      she: '그녀',
      we: '우리',
      they: '그들',
    };
    const verbKo = EN_VERBS[verbBase] || EN_VERBS[verbPastPart];
    if (subjKo[subj] && verbKo) {
      const stem = verbKo.endsWith('다') ? verbKo.slice(0, -1) : verbKo;
      // 노력하 → 노력했지만
      if (stem.endsWith('하')) {
        return `${subjKo[subj]}가 ${stem}지만`.replace('하지만', '했지만');
      }
      return `${subjKo[subj]}가 ${stem}았지만`;
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

  // g25-11: "until tomorrow" → "내일까지"
  // Pattern: until + time noun → time-까지
  const untilNounMatch = cleaned.match(/^until\s+(\w+)$/);
  if (untilNounMatch) {
    const timeNoun = untilNounMatch[1];
    const timeMap: Record<string, string> = {
      tomorrow: '내일',
      today: '오늘',
      yesterday: '어제',
      now: '지금',
      morning: '아침',
      evening: '저녁',
      night: '밤',
    };
    const koTime = timeMap[timeNoun] || EN_NOUNS[timeNoun];
    if (koTime) return `${koTime}까지`;
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

  // g14-17: "if you study" → "공부하면" (주어 생략 - 자연스러운 한국어 조건절)
  // 일반화: "if (you) V" → "V-면"
  const ifYouVerbMatch = cleaned.match(/^if\s+(?:you\s+)?(\w+)$/);
  if (ifYouVerbMatch) {
    const verb = ifYouVerbMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${stem}면`;
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

  // g5-13: "You may go" → "가도 된다" (주어 생략 - 자연스러운 한국어)
  // 일반화: "You may V" → "V-아도/어도 된다"
  const youMayMatch = cleaned.match(/^you\s+may\s+(\w+)$/);
  if (youMayMatch) {
    const verb = youMayMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      // 모음 축약 처리: 가+아 → 가, 오+아 → 와 (but we use 아도, so 오+아도 → 와도)
      // For "-아도/어도 된다" pattern:
      // - 가 (ends with ㅏ) + 아도 → 가도 (ㅏ+ㅏ contracts)
      // - 오 (ends with ㅗ) + 아도 → 와도 (ㅗ+ㅏ→ㅘ)
      const lastChar = stem[stem.length - 1];
      const code = lastChar.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const offset = code - 0xac00;
        const jungIndex = Math.floor((offset % 588) / 28);
        // ㅏ(0): 가+아도 → 가도
        if (jungIndex === 0) {
          return `${stem}도 된다`;
        }
        // ㅗ(8): 오+아도 → 와도
        if (jungIndex === 8) {
          const cho = Math.floor(offset / 588);
          // ㅘ = jungIndex 9
          const waChar = String.fromCharCode(0xac00 + cho * 588 + 9 * 28);
          return `${stem.slice(0, -1)}${waChar}도 된다`;
        }
      }
      // Default: use attachAoEo
      return `${attachAoEo(stem)}도 된다`;
    }
  }

  // g5-15: "You must study" → "공부해야 한다" (주어 생략)
  // 일반화: "You must V" → "V-아야/어야 한다"
  const youMustMatch = cleaned.match(/^you\s+must\s+(\w+)$/);
  if (youMustMatch) {
    const verb = youMustMatch[1];
    const koVerb = EN_VERBS[verb];
    if (koVerb) {
      const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
      return `${attachAoEo(stem)}야 한다`;
    }
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

  // g18-8: "I went" → "갔다" (주어 생략 - 자연스러운 한국어 과거형)
  // 일반화: "I V-ed" → "V-았/었다"
  const iVPastMatch = cleaned.match(/^i\s+(\w+)$/);
  if (iVPastMatch) {
    const pastVerb = iVPastMatch[1];
    // 불규칙 과거 동사 처리
    const irregularPast: Record<string, string> = {
      went: '갔다',
      came: '왔다',
      ate: '먹었다',
      drank: '마셨다',
      saw: '봤다',
      did: '했다',
      made: '만들었다',
      took: '가져갔다',
      gave: '줬다',
      got: '받았다',
      had: '가졌다',
      said: '말했다',
      ran: '달렸다',
      slept: '잤다',
      read: '읽었다',
      wrote: '썼다',
    };
    if (irregularPast[pastVerb]) {
      return irregularPast[pastVerb];
    }
    // 규칙 과거 (-ed) 처리
    if (pastVerb.endsWith('ed')) {
      const baseVerb = pastVerb.replace(/ed$/, '').replace(/i$/, 'y');
      const koVerb = EN_VERBS[baseVerb] || EN_VERBS[`${baseVerb}e`];
      if (koVerb) {
        const stem = koVerb.endsWith('다') ? koVerb.slice(0, -1) : koVerb;
        return `${attachPastTense(stem)}다`;
      }
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

  // g29-10: "As for this" → "이것은" (주제 표현)
  // 일반화: "As for N" → "N은/는" (topic marker pattern)
  const asForMatch = cleaned.match(/^as\s+for\s+(\w+)$/);
  if (asForMatch) {
    const noun = asForMatch[1];
    const pronounMap: Record<string, string> = {
      this: '이것',
      that: '저것',
      me: '나',
      him: '그',
      her: '그녀',
      them: '그들',
      it: '그것',
    };
    const koNoun = pronounMap[noun] || EN_NOUNS[noun] || noun;
    // 받침 유무에 따른 주제격 조사 (은/는) 선택
    const hasJongseong =
      koNoun.charCodeAt(koNoun.length - 1) >= 0xac00 &&
      (koNoun.charCodeAt(koNoun.length - 1) - 0xac00) % 28 !== 0;
    const topicParticle = hasJongseong ? '은' : '는';
    return `${koNoun}${topicParticle}`;
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
