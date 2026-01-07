// ========================================
// English to Korean Clause Processing
// 영→한 절 처리 (토큰 분석 + SOV 변환)
// ========================================

import { HANGUL_BASE, HANGUL_END } from '@soundblue/hangul';
import { enToKoWords } from '../dictionary/entries/words';
import {
  ENGLISH_ADJECTIVES,
  ENGLISH_ADVERBS,
  ENGLISH_ARTICLES,
  ENGLISH_BE_VERBS,
  ENGLISH_CONJUNCTIONS,
  ENGLISH_DEMONSTRATIVES,
  ENGLISH_IRREGULAR_VERBS,
  ENGLISH_PREPOSITIONS,
  LOCATION_ADVERBS,
  MOVEMENT_VERBS_EN,
  PHRASAL_VERBS_WITH_TO,
} from './en-to-ko-constants';
import {
  conjugateKoreanAdjective,
  conjugateKoreanVerb,
  convertToKoreanModifier,
  getEnglishVerbBase,
  hasFinalConsonant,
  selectObjectParticle,
  selectTopicParticle,
} from './en-to-ko-utils';

// Types
export type TokenRole =
  | 'subject'
  | 'verb'
  | 'object'
  | 'preposition'
  | 'conjunction'
  | 'adverb'
  | 'adjective'
  | 'article'
  | 'auxiliary'
  | 'negation'
  | 'unknown';

export interface AnalyzedToken {
  original: string;
  translated: string;
  role: TokenRole;
  tense?: 'past' | 'present' | 'future';
  verbBase?: string;
  isModifier?: boolean;
  isLocationAdverb?: boolean;
  negationType?: 'did_not' | 'could_not';
}

// 역방향 사전 생성 (한→영에서 영→한 추출)
function getKoreanFromEnglish(english: string): string | undefined {
  const lower = english.toLowerCase();
  return enToKoWords[lower];
}

/**
 * 영어 토큰 분석 및 번역
 */
export function analyzeAndTranslateEnToken(
  token: string,
  prevRole: string | undefined,
  isFirst: boolean,
  context: {
    hasMovementVerb?: boolean;
    verbBase?: string;
    hasVerb?: boolean;
    prevVerbBase?: string;
  } = {},
): AnalyzedToken {
  const lowerToken = token.toLowerCase();

  // 1. 관사 체크 (번역에서 생략)
  if (ENGLISH_ARTICLES.has(lowerToken)) {
    return { original: token, translated: '', role: 'article' };
  }

  // 1.5. 지시형용사 체크 (this, that - 관형어로 처리)
  if (ENGLISH_DEMONSTRATIVES.has(lowerToken)) {
    const translation = enToKoWords[lowerToken] || token;
    return { original: token, translated: translation, role: 'article', isModifier: true };
  }

  // 2. 부정어 체크
  if (lowerToken === 'not') {
    return { original: token, translated: '', role: 'negation' };
  }

  // 3. 접속사 체크
  const conjunction = ENGLISH_CONJUNCTIONS[lowerToken];
  if (conjunction) {
    return { original: token, translated: conjunction, role: 'conjunction' };
  }

  // 4. 전치사 체크
  // "listen to", "look at" 같은 구문동사의 전치사는 무시
  if (lowerToken === 'to' && prevRole === 'verb') {
    // 직전이 phrasal verb면 to 무시, 그 외에는 정상 전치사로 처리
    if (context.prevVerbBase && PHRASAL_VERBS_WITH_TO.has(context.prevVerbBase)) {
      return { original: token, translated: '', role: 'preposition' };
    }
    // 이동 동사 뒤의 to는 정상 전치사 (에로 번역)
    return { original: token, translated: '에', role: 'preposition' };
  }
  const preposition = ENGLISH_PREPOSITIONS[lowerToken];
  if (preposition) {
    return { original: token, translated: preposition, role: 'preposition' };
  }

  // 5. be 동사 체크
  if (ENGLISH_BE_VERBS.has(lowerToken)) {
    const tense = ['was', 'were'].includes(lowerToken) ? ('past' as const) : ('present' as const);
    return { original: token, translated: '있', role: 'auxiliary', tense };
  }

  // 6. do/does/did 체크 (조동사로 사용)
  if (['do', 'does', 'did'].includes(lowerToken)) {
    const tense = lowerToken === 'did' ? ('past' as const) : ('present' as const);
    return { original: token, translated: '', role: 'auxiliary', tense };
  }

  // 6.5. 조동사 체크 (can, could, will, would, should, may, might, must)
  if (['can', 'could', 'will', 'would', 'should', 'may', 'might', 'must'].includes(lowerToken)) {
    // could, would 등은 과거 시제로 처리
    const tense = ['could', 'would', 'might'].includes(lowerToken)
      ? ('past' as const)
      : ('present' as const);
    return { original: token, translated: '', role: 'auxiliary', tense };
  }

  // 6.6. cannot 체크 (can + not 합쳐진 형태)
  if (lowerToken === 'cannot') {
    return {
      original: token,
      translated: '',
      role: 'auxiliary',
      tense: 'present',
      negationType: 'could_not',
    };
  }

  // 6.7. 축약형 부정 조동사 체크 (couldn't, wouldn't, shouldn't, didn't, don't, doesn't, can't, won't 등)
  // 패턴: V + n't → 부정 조동사 (능력 부정 vs 의지 부정)
  // 참고: ' (U+2019 curly quote)와 ' (U+0027 straight quote) 모두 지원
  const normalizedToken = lowerToken.replace(/[\u2018\u2019']/g, "'"); // curly quotes (U+2018, U+2019) → straight quote
  const contractionMatch = normalizedToken.match(
    /^(could|would|should|did|do|does|can|will|won|has|have|had|is|are|was|were)n't$/,
  );
  if (contractionMatch) {
    const base = contractionMatch[1];
    // 능력 부정: can't, couldn't, won't, wouldn't
    // 의지 부정: didn't, don't, doesn't, hasn't, haven't, hadn't, isn't, aren't, wasn't, weren't
    const isAbilityNegation = ['can', 'could', 'will', 'won', 'would'].includes(base);
    const negationType = isAbilityNegation ? ('could_not' as const) : ('did_not' as const);
    const tense = ['did', 'could', 'would', 'had', 'was', 'were'].includes(base)
      ? ('past' as const)
      : ('present' as const);
    return { original: token, translated: '', role: 'auxiliary', tense, negationType };
  }

  // 7. 불규칙 동사 과거형 체크
  const irregularVerb = ENGLISH_IRREGULAR_VERBS[lowerToken];
  if (irregularVerb) {
    // 사전에서 기본형 번역
    const baseTranslation = getKoreanFromEnglish(irregularVerb.base);
    if (baseTranslation) {
      return {
        original: token,
        translated: baseTranslation,
        role: prevRole === 'auxiliary' ? 'adjective' : 'verb',
        tense: 'past',
        verbBase: irregularVerb.base,
      };
    }
  }

  // 8. 3인칭 단수 동사 체크 (-s, -es, -ies)
  const verbInfo = getEnglishVerbBase(lowerToken);
  if (verbInfo.base !== lowerToken) {
    const baseTranslation = getKoreanFromEnglish(verbInfo.base);
    if (baseTranslation) {
      return {
        original: token,
        translated: baseTranslation,
        role: 'verb',
        tense: verbInfo.tense,
        verbBase: verbInfo.base,
      };
    }
  }

  // 9. 부사 체크
  if (ENGLISH_ADVERBS.has(lowerToken)) {
    const directTranslation = enToKoWords[lowerToken];
    return {
      original: token,
      translated: directTranslation || token,
      role: 'adverb',
    };
  }

  // 10. 형용사 체크 (관형어로 사용될 수 있음)
  if (ENGLISH_ADJECTIVES.has(lowerToken)) {
    const directTranslation = enToKoWords[lowerToken];
    // 이전이 관사나 부사면 관형어 (modifier)
    const isModifier = prevRole === 'article' || prevRole === 'adverb' || prevRole === 'adjective';
    return {
      original: token,
      translated: directTranslation || token,
      role: 'adjective',
      isModifier,
    };
  }

  // 11. 장소 부사 체크 (home, here, there 등 - 전치사 없이 사용)
  // "go home", "come home"에서 home은 부사로 사용됨 → 장소로 처리
  if (LOCATION_ADVERBS.has(lowerToken) && prevRole === 'verb') {
    const directTranslation = enToKoWords[lowerToken];
    // 이동 동사 + home → 집에
    if (context.prevVerbBase && MOVEMENT_VERBS_EN.has(context.prevVerbBase)) {
      return {
        original: token,
        translated: directTranslation || token,
        role: 'object', // rearrangeToSOV에서 장소로 처리되도록
        isLocationAdverb: true, // 마커 추가
      };
    }
    return { original: token, translated: directTranslation || token, role: 'adverb' };
  }

  // 12. 사전에서 직접 검색
  const directTranslation = enToKoWords[lowerToken];
  if (directTranslation !== undefined) {
    // 역할 추론
    let role: TokenRole = 'unknown';
    let tense: 'past' | 'present' | 'future' | undefined;

    // 첫 번째 단어이고 대명사면 주어
    if (isFirst && ['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(lowerToken)) {
      role = 'subject';
    }
    // 관사 뒤에 오는 명사 + 아직 동사가 안 나왔으면 주어 (The cat, The book 등)
    else if (prevRole === 'article' && !context.hasVerb) {
      role = 'subject';
    }
    // 이전이 주어/부사면 동사
    else if (
      prevRole === 'subject' ||
      prevRole === 'adverb' ||
      prevRole === 'auxiliary' ||
      prevRole === 'negation'
    ) {
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
    // 이전이 관사/형용사면 목적어 (a beautiful painting → 아름다운 그림을)
    else if (prevRole === 'article' || prevRole === 'adjective') {
      role = 'object';
    }

    // -ed 어미로 과거 시제 추론
    if (lowerToken.endsWith('ed') && role === 'verb') {
      tense = 'past';
    }

    return { original: token, translated: directTranslation, role, tense, verbBase: lowerToken };
  }

  // 13. 원본 반환 (로마자 유지)
  return { original: token, translated: token, role: 'unknown' };
}

/**
 * SVO → SOV 어순 변환 (관형절, 부사절 처리 포함)
 */
export function rearrangeToSOV(tokens: AnalyzedToken[]): string {
  const subjects: string[] = [];
  const verbs: Array<{ text: string; tense: string; base?: string; isAdjective?: boolean }> = [];
  const objects: string[] = [];
  const adverbs: string[] = [];
  const conjunctions: string[] = [];
  const locations: Array<{ text: string; preposition?: string }> = [];
  const companions: string[] = []; // with 관계
  const modifiers: string[] = []; // 관형어 (다음 명사 앞에 배치)
  const others: string[] = [];
  let verbTense: 'past' | 'present' = 'present';
  let isNegative = false;
  let negationType: 'did_not' | 'could_not' | undefined; // 부정 유형 추적
  let hasMovementVerb = false;
  let pendingPreposition: string | null = null;

  // 1단계: 동사 분석하여 이동 동사 여부 확인
  for (const token of tokens) {
    if (token.role === 'verb' && token.verbBase) {
      if (MOVEMENT_VERBS_EN.has(token.verbBase)) {
        hasMovementVerb = true;
        break;
      }
    }
  }

  // 2단계: 토큰 분류
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    const nextToken = tokens[i + 1];

    // 부정어 감지
    if (token.role === 'negation') {
      isNegative = true;
      // 이전 토큰이 능력 조동사(can, could, will, would)면 능력 부정으로 설정
      // "could not", "can not", "will not", "would not" → 능력 부정
      const prevToken = tokens[i - 1];
      if (prevToken && prevToken.role === 'auxiliary') {
        const prevOriginal = prevToken.original.toLowerCase();
        if (['can', 'could', 'will', 'would'].includes(prevOriginal)) {
          negationType = 'could_not';
        }
      }
      continue;
    }

    // 빈 번역은 건너뜀 (관사 등)
    if (!token.translated) {
      // auxiliary (be/do)의 시제는 기억
      if (token.role === 'auxiliary' && token.tense === 'past') {
        verbTense = 'past';
      }
      // 축약형 부정 조동사의 negationType 추적 (couldn't, didn't 등)
      if (token.role === 'auxiliary' && token.negationType) {
        isNegative = true;
        negationType = token.negationType;
      }
      continue;
    }

    // 지시형용사 (this, that)는 modifier로 추가
    if (token.role === 'article' && token.isModifier && token.translated) {
      modifiers.push(token.translated);
      continue;
    }

    // 동사의 시제 저장
    if (token.tense === 'past') {
      verbTense = 'past';
    }

    switch (token.role) {
      case 'subject':
        // 수식어가 있으면 주어 앞에 붙임
        // 주제 조사 (은/는) 사용 - 받침에 따라 선택
        if (modifiers.length > 0) {
          const particle = selectTopicParticle(token.translated);
          subjects.push(`${modifiers.join(' ')} ${token.translated}${particle}`);
          modifiers.length = 0;
        } else {
          const particle = selectTopicParticle(token.translated);
          subjects.push(`${token.translated}${particle}`);
        }
        break;

      case 'verb':
        verbs.push({
          text: token.translated,
          tense: token.tense || 'present',
          base: token.verbBase,
        });
        break;

      case 'object':
        // 장소 부사 (home, here, there 등 - 전치사 없이 사용되는 경우)
        if (token.isLocationAdverb) {
          // 이동 동사 뒤의 home → 집에
          locations.push({ text: token.translated, preposition: '에' });
          break;
        }
        // 전치사가 pending 상태면 장소로 처리
        if (pendingPreposition) {
          // 이동 동사 + to + 장소 → 장소에
          if (hasMovementVerb && pendingPreposition === '에') {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({ text: `${modifiedText} ${token.translated}`, preposition: '에' });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: '에' });
            }
          } else if (pendingPreposition === '위에') {
            locations.push({ text: token.translated, preposition: ' 위에' });
          } else if (pendingPreposition === '에서') {
            locations.push({ text: token.translated, preposition: '에' });
          } else if (pendingPreposition.includes('에') || pendingPreposition.includes('로')) {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({
                text: `${modifiedText} ${token.translated}`,
                preposition: pendingPreposition,
              });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: pendingPreposition });
            }
          } else if (pendingPreposition === '와 함께') {
            companions.push(token.translated);
          } else {
            // 일반 목적어
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              objects.push(`${modifiedText} ${token.translated}`);
              modifiers.length = 0;
            } else {
              objects.push(token.translated);
            }
          }
          pendingPreposition = null;
        } else {
          // 수식어가 있으면 목적어 앞에 붙임 (관형절)
          if (modifiers.length > 0) {
            const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
            objects.push(`${modifiedText} ${token.translated}`);
            modifiers.length = 0;
          } else {
            objects.push(token.translated);
          }
        }
        break;

      case 'preposition':
        // 전치사 정보 저장 (다음 명사에 적용될 것)
        pendingPreposition = token.translated;
        break;

      case 'conjunction':
        conjunctions.push(token.translated);
        break;

      case 'adverb':
        adverbs.push(token.translated);
        break;

      case 'adjective':
        // 형용사는 관형어로 처리 (다음 명사 앞에 배치)
        if (token.isModifier || (nextToken && ['object', 'unknown'].includes(nextToken.role))) {
          modifiers.push(token.translated);
        } else {
          // 서술어로 사용 (be + adj)
          // 형용사 어간 추출: 좋은 → 좋다, 아름다운 → 아름답다, 완벽한 → 완벽하다
          let adjBase = token.translated;

          // 관형형 어미 제거 및 기본형 복원
          if (adjBase.endsWith('운')) {
            // ~운: ㅂ 불규칙 (아름다운 → 아름답)
            // 아름다 + 운 → 아름다 → 아름답다
            const withoutEnding = adjBase.slice(0, -1);
            const lastChar = withoutEnding[withoutEnding.length - 1];
            if (lastChar) {
              const code = lastChar.charCodeAt(0);
              if (code >= HANGUL_BASE && code <= HANGUL_END) {
                // 마지막 글자에 ㅂ 받침 추가
                const newCode = code + 17; // ㅂ은 17번 받침
                adjBase = `${withoutEnding.slice(0, -1) + String.fromCharCode(newCode)}다`;
              } else {
                adjBase = `${withoutEnding}다`;
              }
            } else {
              adjBase = `${withoutEnding}다`;
            }
          } else if (adjBase.endsWith('은')) {
            // ~은: 일반형 (좋은 → 좋다)
            adjBase = `${adjBase.slice(0, -1)}다`;
          } else if (!adjBase.endsWith('다')) {
            // 관형형 ㄴ 받침이 붙은 경우 처리 (완벽한 → 완벽하다)
            const lastChar = adjBase[adjBase.length - 1];
            if (lastChar) {
              const code = lastChar.charCodeAt(0);
              if (code >= HANGUL_BASE && code <= HANGUL_END) {
                const jong = (code - HANGUL_BASE) % 28;
                if (jong === 4) {
                  // ㄴ 받침 → 제거하고 다 추가
                  const newCode = code - 4; // ㄴ 받침 제거
                  adjBase = `${adjBase.slice(0, -1) + String.fromCharCode(newCode)}다`;
                } else {
                  // 기본형이 아니면 ~다 추가
                  adjBase = `${adjBase}다`;
                }
              } else {
                adjBase = `${adjBase}다`;
              }
            } else {
              adjBase = `${adjBase}다`;
            }
          }

          verbs.push({
            text: adjBase,
            tense: token.tense || 'present',
            base: undefined,
            isAdjective: true,
          });
        }
        break;

      case 'auxiliary':
        // be 동사 + 형용사/장소의 경우
        if (token.translated === '있') {
          // 다음 토큰 확인하여 장소/형용사 판단
          // 지금은 일단 동사로 추가
          verbs.push({ text: token.translated, tense: token.tense || 'present', base: 'be' });
        }
        break;

      default:
        // 전치사 뒤에 온 명사 처리
        if (pendingPreposition) {
          // 이동 동사 + to + 장소 → 장소에
          if (hasMovementVerb && pendingPreposition === '에') {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({ text: `${modifiedText} ${token.translated}`, preposition: '에' });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: '에' });
            }
          } else if (pendingPreposition === '위에') {
            // on the desk → 책상 위에
            locations.push({ text: token.translated, preposition: ' 위에' });
          } else if (pendingPreposition === '에서') {
            // at home → 집에 (be 동사 + at → 에)
            locations.push({ text: token.translated, preposition: '에' });
          } else if (pendingPreposition.includes('에') || pendingPreposition.includes('로')) {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({
                text: `${modifiedText} ${token.translated}`,
                preposition: pendingPreposition,
              });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: pendingPreposition });
            }
          } else if (pendingPreposition === '와 함께') {
            companions.push(token.translated);
          } else {
            if (modifiers.length > 0) {
              others.push(`${modifiers.join(' ')} ${token.translated}`);
              modifiers.length = 0;
            } else {
              others.push(token.translated);
            }
          }
          pendingPreposition = null;
        } else if (modifiers.length > 0) {
          others.push(`${modifiers.join(' ')} ${token.translated}`);
          modifiers.length = 0;
        } else {
          others.push(token.translated);
        }
    }
  }

  // 남은 수식어가 있으면 others에 추가
  if (modifiers.length > 0) {
    others.push(...modifiers);
  }

  // SOV 순서로 조합
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

  // 장소 (조사 포함)
  if (locations.length > 0) {
    for (const loc of locations) {
      const particle = loc.preposition || '에';
      if (
        !loc.text.endsWith('에') &&
        !loc.text.endsWith('에서') &&
        !loc.text.endsWith('로') &&
        !loc.text.endsWith('으로')
      ) {
        parts.push(`${loc.text}${particle}`);
      } else {
        parts.push(loc.text);
      }
    }
  }

  // 동반자 (with 관계) - 받침에 따라 과/와 선택
  if (companions.length > 0) {
    for (const comp of companions) {
      const particle = hasFinalConsonant(comp) ? '과' : '와';
      parts.push(`${comp}${particle} 함께`);
    }
  }

  // 기타
  if (others.length > 0) {
    parts.push(...others.filter((o) => o && !o.includes('에') && o !== '와 함께'));
  }

  // 목적어
  if (objects.length > 0) {
    const objsWithParticle = objects.map((obj, idx) => {
      if (
        obj.includes('에') ||
        obj.includes('와') ||
        obj.endsWith('를') ||
        obj.endsWith('을') ||
        obj.endsWith('로')
      ) {
        return obj;
      }
      if (idx === objects.length - 1) {
        // 받침에 따라 을/를 선택
        const particle = selectObjectParticle(obj);
        return `${obj}${particle}`;
      }
      return obj;
    });
    parts.push(...objsWithParticle);
  }

  // 동사 (문장 끝) - 활용형 적용
  if (verbs.length > 0) {
    const lastVerb = verbs[verbs.length - 1];
    if (!lastVerb) return parts.join(' ');
    let finalVerb = lastVerb.text;

    // 부정문 처리
    if (isNegative) {
      // negationType에 따라 다른 부정 형태 사용
      // could_not (능력 부정): ~지 못했다/못한다
      // did_not (의지 부정): ~지 않았다/않는다
      const stem = finalVerb.endsWith('다') ? finalVerb.slice(0, -1) : finalVerb;
      const tense = verbTense === 'past' || lastVerb.tense === 'past' ? 'past' : 'present';
      if (negationType === 'could_not') {
        // 능력 부정: ~지 못했다/못한다
        if (tense === 'past') {
          finalVerb = `${stem}지 못했다`;
        } else {
          finalVerb = `${stem}지 못한다`;
        }
      } else {
        // 의지 부정 (기본): ~지 않았다/않는다
        if (tense === 'past') {
          finalVerb = `${stem}지 않았다`;
        } else {
          finalVerb = `${stem}지 않는다`;
        }
      }
    } else if (lastVerb.isAdjective) {
      // 형용사도 시제에 따라 활용 (좋다 → 좋았다)
      const tense = verbTense === 'past' || lastVerb.tense === 'past' ? 'past' : 'present';
      if (tense === 'past') {
        finalVerb = conjugateKoreanAdjective(finalVerb, 'past');
      }
      // 현재형은 이미 ~다 형태이므로 그대로 사용
    } else {
      // 동사 활용형 적용
      const tense = verbTense === 'past' || lastVerb.tense === 'past' ? 'past' : 'present';
      finalVerb = conjugateKoreanVerb(finalVerb, tense);
    }

    parts.push(finalVerb);
  }

  // 공백으로 연결
  return parts.filter((p) => p?.trim()).join(' ');
}
