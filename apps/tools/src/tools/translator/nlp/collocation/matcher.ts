// ========================================
// 연어 매칭 (Collocation Matcher)
// 한국어 문장에서 연어 패턴 탐지
// ========================================

import { type Collocation, collocationIndex } from './collocation-dict';

/**
 * 연어 매칭 결과
 */
export interface CollocationMatch {
  /** 매칭된 연어 */
  collocation: Collocation;
  /** 시작 인덱스 */
  startIndex: number;
  /** 종료 인덱스 */
  endIndex: number;
  /** 매칭 신뢰도 (0-1) */
  confidence: number;
}

// 조사 목록
const PARTICLES = [
  '을',
  '를',
  '이',
  '가',
  '은',
  '는',
  '에',
  '에서',
  '로',
  '으로',
  '와',
  '과',
  '도',
  '만',
  '의',
  '에게',
  '한테',
  '께',
  '에게서',
  '보다',
  '처럼',
  '같이',
];

// 어미 목록 (긴 것부터 정렬)
const ENDINGS = [
  // 복합 종결어미 - ㄹ받침 동사용 (내리다→내렸, 걸다→걸었)
  '렸어요',
  '렀어요',
  '렸다',
  '렀다',
  // 복합 종결어미 (긴 것 먼저)
  '었어요',
  '았어요',
  '였어요',
  '습니다',
  '입니다',
  '겠어요',
  '셨어요',
  '셨다',
  // 축약형 종결어미 (오다→와요, 하다→해요)
  '왔어요',
  '했어요',
  '봤어요',
  '갔어요',
  '왔다',
  '했다',
  '봤다',
  '갔다',
  // 종결어미
  '니다',
  '어요',
  '아요',
  '세요',
  '네요',
  '군요',
  '지요',
  '와요', // 오다→와요
  '해요', // 하다→해요
  '봐요', // 보다→봐요
  '가요', // 가다→가요
  '요',
  '다',
  '네',
  '군',
  '지',
  '니',
  '나',
  '냐',
  '까',
  // 연결어미
  '니까',
  '지만',
  '는데',
  '은데',
  '려고',
  '면서',
  '다가',
  '고',
  '서',
  '면',
  '러',
  // 과거 - 단일
  '렸',
  '렀',
  '였',
  '었',
  '았',
  '왔', // 오다→왔
  '했', // 하다→했
  '봤', // 보다→봤
  '갔', // 가다→갔
  // 미래/추측
  '겠',
];

// 축약형 동사 복원 맵 (축약형 → 기본형)
const CONTRACTED_VERBS: Record<string, string> = {
  // 오다 계열
  와: '오',
  왔: '오',
  // 하다 계열
  해: '하',
  했: '하',
  // 보다 계열
  봐: '보',
  봤: '보',
  // 가다 계열 (가 → 가 그대로 유지, 갔만 복원)
  갔: '가',
  // 되다 계열
  돼: '되',
  됐: '되',
  // 주다 계열
  줘: '주',
  줬: '주',
  // 서다 계열
  섰: '서',
  // 내리다 계열
  내렸: '내리',
  내려: '내리',
  // 걸다 계열
  걸었: '걸',
  // 오르다 계열
  올랐: '오르',
  올라: '오르',
  // 기울이다 계열
  기울여: '기울이',
  기울였: '기울이',
  // 지키다 계열
  지켰: '지키',
  지켜: '지키',
  // 타다 계열 (verb-object 연어용)
  탔: '타',
  타: '타',
  // 잡다 계열
  잡았: '잡',
  // 먹다 계열
  먹었: '먹',
  // 빠지다 계열
  빠졌: '빠지',
  빠져: '빠지',
  // 끊다 계열
  끊었: '끊',
  // 풀다 계열
  풀었: '풀',
  // 치다 계열
  쳤: '치',
  // 들다 계열
  들었: '들',
  // 내다 계열
  냈: '내',
};

/**
 * 어간 추출 (조사/어미 제거)
 */
export function extractStem(word: string): string {
  let result = word;

  // 조사 제거
  for (const p of PARTICLES) {
    if (result.endsWith(p) && result.length > p.length) {
      result = result.slice(0, -p.length);
      break;
    }
  }

  // 축약형 동사 복원 먼저 시도
  const contracted = CONTRACTED_VERBS[result];
  if (contracted) {
    return contracted;
  }

  // 어미 제거 (반복적으로 적용)
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of ENDINGS) {
      if (result.endsWith(e) && result.length > e.length) {
        result = result.slice(0, -e.length);
        changed = true;
        break;
      }
    }
    // 매 단계마다 축약형 복원 체크
    const contractedInLoop = CONTRACTED_VERBS[result];
    if (contractedInLoop) {
      return contractedInLoop;
    }
  }

  // 결과가 비어있거나 너무 짧으면 원본 반환
  if (result.length === 0) {
    // 축약형 전체 단어인 경우 복원 시도
    const restored = CONTRACTED_VERBS[word.replace(/요$/, '')];
    if (restored) return restored;
    return word;
  }

  return result;
}

/**
 * 어간 유사도 확인 (부분 매칭 허용)
 */
function stemMatches(wordStem: string, patternStem: string): boolean {
  // 완전 일치
  if (wordStem === patternStem) return true;

  // 빈 문자열 체크
  if (!wordStem || !patternStem) return false;

  // 어간이 패턴을 포함 (예: "결정을" → "결정")
  if (wordStem.includes(patternStem)) return true;

  // 패턴이 어간을 포함 (예: "내리" in "내렸")
  if (patternStem.includes(wordStem)) return true;

  // 시작 부분 일치 (최소 1글자 - 한국어 동사 활용 고려)
  const shorter = wordStem.length < patternStem.length ? wordStem : patternStem;
  const longer = wordStem.length < patternStem.length ? patternStem : wordStem;
  if (longer.startsWith(shorter) && shorter.length >= 1) return true;

  // 역순도 확인: 패턴이 어간으로 시작하면 매칭
  if (patternStem.startsWith(wordStem) && wordStem.length >= 1) return true;

  return false;
}

/**
 * 연어 매칭 (메인 함수)
 * @param tokens 토큰 배열
 * @param maxGap 연어 구성요소 사이 최대 간격 (기본: 2)
 */
export function findCollocations(tokens: string[], maxGap = 2): CollocationMatch[] {
  const matches: CollocationMatch[] = [];
  const stems = tokens.map(extractStem);

  for (let i = 0; i < stems.length; i++) {
    const stem = stems[i];
    if (!stem) continue;

    // 첫 단어로 후보 연어 조회
    const candidates = collocationIndex.get(stem);
    if (!candidates) continue;

    for (const colloc of candidates) {
      if (colloc.ko.length === 1) {
        // 단일 단어 연어 (복합어)
        matches.push({
          collocation: colloc,
          startIndex: i,
          endIndex: i,
          confidence: 1.0,
        });
      } else if (colloc.ko.length === 2) {
        // 2단어 연어 - 인접 또는 간격 허용
        const secondPattern = colloc.ko[1];
        if (!secondPattern) continue;

        for (let j = i + 1; j <= Math.min(i + maxGap + 1, stems.length - 1); j++) {
          const secondStem = stems[j];
          if (!secondStem) continue;

          if (stemMatches(secondStem, secondPattern)) {
            // 간격에 따른 신뢰도 조정
            const gap = j - i - 1;
            const confidence = gap === 0 ? 1.0 : gap === 1 ? 0.9 : 0.8;

            matches.push({
              collocation: colloc,
              startIndex: i,
              endIndex: j,
              confidence,
            });
            break; // 첫 번째 매칭만 사용
          }
        }
      } else if (colloc.ko.length >= 3) {
        // 3단어 이상 연어
        let matched = true;
        let lastIdx = i;
        const matchIndices: number[] = [i];

        for (let k = 1; k < colloc.ko.length && matched; k++) {
          const kthPattern = colloc.ko[k];
          if (!kthPattern) {
            matched = false;
            break;
          }

          matched = false;
          for (let j = lastIdx + 1; j <= Math.min(lastIdx + maxGap + 1, stems.length - 1); j++) {
            const jthStem = stems[j];
            if (!jthStem) continue;

            if (stemMatches(jthStem, kthPattern)) {
              matchIndices.push(j);
              lastIdx = j;
              matched = true;
              break;
            }
          }
        }

        if (matched && matchIndices.length === colloc.ko.length) {
          const firstIdx = matchIndices[0];
          const lastMatchIdx = matchIndices[matchIndices.length - 1];
          if (firstIdx === undefined || lastMatchIdx === undefined) continue;

          const avgGap = (lastMatchIdx - firstIdx) / (colloc.ko.length - 1);
          const confidence = avgGap <= 1 ? 1.0 : avgGap <= 2 ? 0.85 : 0.7;

          matches.push({
            collocation: colloc,
            startIndex: firstIdx,
            endIndex: lastMatchIdx,
            confidence,
          });
        }
      }
    }
  }

  // 겹치는 매칭 해결 (우선순위/신뢰도 기준)
  return resolveOverlaps(matches);
}

/**
 * 겹치는 매칭 해결
 */
function resolveOverlaps(matches: CollocationMatch[]): CollocationMatch[] {
  if (matches.length <= 1) return matches;

  // 점수 계산: 우선순위 * 신뢰도 * 길이 보너스
  const scored = matches.map((m) => ({
    match: m,
    score: (m.collocation.priority || 5) * m.confidence * (1 + (m.endIndex - m.startIndex) * 0.1),
  }));

  // 점수순 정렬
  scored.sort((a, b) => b.score - a.score);

  const result: CollocationMatch[] = [];
  const usedIndices = new Set<number>();

  for (const { match } of scored) {
    // 이미 사용된 인덱스와 겹치는지 확인
    let overlaps = false;
    for (let i = match.startIndex; i <= match.endIndex; i++) {
      if (usedIndices.has(i)) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      result.push(match);
      for (let i = match.startIndex; i <= match.endIndex; i++) {
        usedIndices.add(i);
      }
    }
  }

  // 시작 인덱스순 정렬
  return result.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * 연어 번역 적용 결과
 */
export interface CollocationTranslation {
  /** 번역된 영어 문자열 */
  result: string;
  /** 연어로 처리된 토큰 인덱스들 */
  processedIndices: Set<number>;
  /** 매칭된 연어들 */
  matches: CollocationMatch[];
}

/**
 * 토큰 배열에 연어 번역 적용
 * @param tokens 원본 토큰 배열
 * @returns 연어 번역 결과
 */
export function applyCollocationTranslation(tokens: string[]): CollocationTranslation {
  const matches = findCollocations(tokens);
  const processedIndices = new Set<number>();
  const translations: { index: number; en: string }[] = [];

  for (const match of matches) {
    // 연어가 차지하는 인덱스 기록
    for (let i = match.startIndex; i <= match.endIndex; i++) {
      processedIndices.add(i);
    }
    // 시작 인덱스에 영어 번역 기록
    translations.push({
      index: match.startIndex,
      en: match.collocation.en,
    });
  }

  // 결과 문자열 생성 (연어 위치에 영어 삽입)
  const resultParts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const trans = translations.find((t) => t.index === i);
    if (trans) {
      resultParts.push(trans.en);
    } else if (!processedIndices.has(i)) {
      const token = tokens[i];
      if (token) resultParts.push(token);
    }
    // processedIndices에 있지만 translations에 없으면 건너뜀
  }

  return {
    result: resultParts.join(' '),
    processedIndices,
    matches,
  };
}

/**
 * 문장에서 연어 찾기 (간편 함수)
 */
export function findCollocationsInSentence(sentence: string): CollocationMatch[] {
  const tokens = sentence.split(/\s+/).filter(Boolean);
  return findCollocations(tokens);
}

// ========================================
// 동사-목적어 연어 매칭 (Verb-Object Collocation Matching)
// ========================================

import { findVerbObjectCollocation, verbStems } from './verb-object';

/**
 * 동사-목적어 연어 매칭 결과
 */
export interface VerbObjectMatch {
  /** 목적어 토큰 인덱스 */
  objectIndex: number;
  /** 동사 토큰 인덱스 */
  verbIndex: number;
  /** 영어 번역 */
  en: string;
  /** 매칭된 목적어 (원본) */
  object: string;
  /** 매칭된 동사 어간 */
  verbStem: string;
  /** 매칭 신뢰도 (0-1) */
  confidence: number;
}

/**
 * 토큰 배열에서 동사-목적어 연어 찾기
 * 한국어 어순: 목적어 + (조사) + 동사
 * @param tokens 토큰 배열
 * @param maxGap 목적어와 동사 사이 최대 간격 (기본: 3)
 */
export function findVerbObjectCollocations(tokens: string[], maxGap = 3): VerbObjectMatch[] {
  const matches: VerbObjectMatch[] = [];
  const stems = tokens.map(extractStem);

  // 각 토큰에 대해 목적어인지 확인
  for (let objIdx = 0; objIdx < stems.length; objIdx++) {
    const objectStem = stems[objIdx];
    if (!objectStem) continue;

    // 뒤에 있는 토큰들 중에서 동사 찾기 (한국어: 목적어 뒤에 동사)
    for (
      let verbIdx = objIdx + 1;
      verbIdx <= Math.min(objIdx + maxGap, stems.length - 1);
      verbIdx++
    ) {
      const verbStem = stems[verbIdx];
      if (!verbStem) continue;

      // 동사 어간이 사전에 있는지 확인
      if (!verbStems.includes(verbStem)) {
        // 부분 매칭 시도 (어간의 앞부분만 일치하는 경우)
        const matchedStem = verbStems.find(
          (vs) => verbStem.startsWith(vs) || vs.startsWith(verbStem),
        );
        if (!matchedStem) continue;

        // 부분 매칭된 동사로 연어 확인
        const colloc = findVerbObjectCollocation(objectStem, matchedStem);
        if (colloc) {
          const gap = verbIdx - objIdx - 1;
          const confidence = gap === 0 ? 1.0 : gap === 1 ? 0.95 : gap === 2 ? 0.9 : 0.85;

          matches.push({
            objectIndex: objIdx,
            verbIndex: verbIdx,
            en: colloc.en,
            object: objectStem,
            verbStem: matchedStem,
            confidence,
          });
          break; // 첫 번째 매칭만 사용
        }
      } else {
        // 정확히 일치하는 동사 어간으로 연어 확인
        const colloc = findVerbObjectCollocation(objectStem, verbStem);
        if (colloc) {
          const gap = verbIdx - objIdx - 1;
          const confidence = gap === 0 ? 1.0 : gap === 1 ? 0.95 : gap === 2 ? 0.9 : 0.85;

          matches.push({
            objectIndex: objIdx,
            verbIndex: verbIdx,
            en: colloc.en,
            object: objectStem,
            verbStem,
            confidence,
          });
          break; // 첫 번째 매칭만 사용
        }
      }
    }
  }

  // 겹치는 매칭 해결 (신뢰도 기준)
  return resolveVerbObjectOverlaps(matches);
}

/**
 * 겹치는 동사-목적어 매칭 해결
 */
function resolveVerbObjectOverlaps(matches: VerbObjectMatch[]): VerbObjectMatch[] {
  if (matches.length <= 1) return matches;

  // 신뢰도순 정렬
  const sorted = [...matches].sort((a, b) => b.confidence - a.confidence);

  const result: VerbObjectMatch[] = [];
  const usedIndices = new Set<number>();

  for (const match of sorted) {
    // 이미 사용된 인덱스와 겹치는지 확인
    if (usedIndices.has(match.objectIndex) || usedIndices.has(match.verbIndex)) {
      continue;
    }

    result.push(match);
    usedIndices.add(match.objectIndex);
    usedIndices.add(match.verbIndex);
  }

  // 목적어 인덱스순 정렬
  return result.sort((a, b) => a.objectIndex - b.objectIndex);
}

/**
 * 동사-목적어 연어 번역 적용
 */
export interface VerbObjectTranslation {
  /** 번역된 영어 문자열 */
  result: string;
  /** 연어로 처리된 토큰 인덱스들 */
  processedIndices: Set<number>;
  /** 매칭된 연어들 */
  matches: VerbObjectMatch[];
}

/**
 * 토큰 배열에 동사-목적어 연어 번역 적용
 */
export function applyVerbObjectTranslation(tokens: string[]): VerbObjectTranslation {
  const matches = findVerbObjectCollocations(tokens);
  const processedIndices = new Set<number>();
  const translations: { index: number; en: string }[] = [];

  for (const match of matches) {
    // 목적어와 동사 인덱스 기록
    processedIndices.add(match.objectIndex);
    processedIndices.add(match.verbIndex);

    // 목적어 인덱스에 영어 번역 기록
    translations.push({
      index: match.objectIndex,
      en: match.en,
    });
  }

  // 결과 문자열 생성
  const resultParts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const trans = translations.find((t) => t.index === i);
    if (trans) {
      resultParts.push(trans.en);
    } else if (!processedIndices.has(i)) {
      const token = tokens[i];
      if (token) resultParts.push(token);
    }
  }

  return {
    result: resultParts.join(' '),
    processedIndices,
    matches,
  };
}
