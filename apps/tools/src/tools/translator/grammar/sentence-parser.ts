// ========================================
// Sentence Structure Parser - 문장 구조 분석기
// 주어/목적어/서술어 파악 및 의존 관계 분석
// ========================================

import type { Formality, Role, Tense, TokenAnalysis } from './morpheme-analyzer';
import { analyzeTokens } from './morpheme-analyzer';

// 문장 구조 타입
export type SentenceType = 'declarative' | 'interrogative' | 'imperative' | 'exclamatory';

// 문장 패턴 (한국어 기본 어순)
export type SentencePattern =
  | 'SV' // 주어 + 서술어 (나는 간다)
  | 'SVC' // 주어 + 보어 + 서술어 (나는 학생이다)
  | 'SVO' // 주어 + 목적어 + 서술어 (나는 밥을 먹는다)
  | 'SVOO' // 주어 + 간접목적어 + 직접목적어 + 서술어 (나는 그에게 책을 준다)
  | 'SVOC' // 주어 + 목적어 + 보어 + 서술어 (나는 그를 바보라고 불렀다)
  | 'SVOA'; // 주어 + 목적어 + 부사어 + 서술어 (나는 책을 책상에 놓았다)

// 문장 성분
export interface Constituent {
  tokens: TokenAnalysis[];
  role: Role;
  text: string;
  headIndex: number; // 핵심어 인덱스
}

// 파싱된 문장 구조
export interface ParsedSentence {
  original: string;
  tokens: TokenAnalysis[];
  constituents: Constituent[];
  subject?: Constituent;
  object?: Constituent;
  indirectObject?: Constituent;
  predicate?: Constituent;
  adverbials: Constituent[];
  modifiers: Constituent[];
  sentenceType: SentenceType;
  pattern: SentencePattern;
  tense: Tense;
  formality: Formality;
  isNegative: boolean;
  isQuestion: boolean;
  subjectOmitted: boolean; // 주어 생략 여부
}

// ========================================
// 문장 성분 그룹화
// ========================================
function groupConstituents(tokens: TokenAnalysis[]): Constituent[] {
  const constituents: Constituent[] = [];
  let currentGroup: TokenAnalysis[] = [];
  let currentRole: Role | null = null;

  for (const token of tokens) {
    const role = token.role || 'unknown';

    // 서술어는 항상 별도 처리
    if (role === 'predicate') {
      // 이전 그룹 저장 (unknown 역할은 modifier로 처리)
      if (currentGroup.length > 0) {
        constituents.push({
          tokens: [...currentGroup],
          role: currentRole || 'modifier',
          text: currentGroup.map((t) => t.original).join(' '),
          headIndex: currentGroup.length - 1,
        });
        currentGroup = [];
      }
      // 서술어 저장
      constituents.push({
        tokens: [token],
        role: 'predicate',
        text: token.original,
        headIndex: 0,
      });
      currentRole = null;
      continue;
    }

    // unknown 역할 토큰 처리: known 역할 토큰이 오면 이전 unknown 그룹을 modifier로 저장
    if (
      role !== 'unknown' &&
      role !== 'modifier' &&
      currentRole === null &&
      currentGroup.length > 0
    ) {
      // 이전 unknown 그룹을 modifier로 저장
      constituents.push({
        tokens: [...currentGroup],
        role: 'modifier',
        text: currentGroup.map((t) => t.original).join(' '),
        headIndex: currentGroup.length - 1,
      });
      currentGroup = [];
    }

    // 같은 역할이면 그룹에 추가
    if (currentRole === null || currentRole === role || role === 'modifier' || role === 'unknown') {
      currentGroup.push(token);
      if (role !== 'modifier' && role !== 'unknown') {
        currentRole = role;
      }
    } else {
      // 다른 역할이면 새 그룹 시작
      if (currentGroup.length > 0) {
        constituents.push({
          tokens: [...currentGroup],
          role: currentRole || 'modifier',
          text: currentGroup.map((t) => t.original).join(' '),
          headIndex: currentGroup.length - 1,
        });
      }
      currentGroup = [token];
      // At this point, role is guaranteed to not be 'unknown', 'modifier', or 'predicate'
      // due to the condition in the if statement above (line 101)
      currentRole = role;
    }
  }

  // 마지막 그룹 저장
  if (currentGroup.length > 0) {
    constituents.push({
      tokens: [...currentGroup],
      // unknown 역할은 modifier로 처리
      role: currentRole || 'modifier',
      text: currentGroup.map((t) => t.original).join(' '),
      headIndex: currentGroup.length - 1,
    });
  }

  return constituents;
}

// ========================================
// 주어 생략 감지
// ========================================
function detectSubjectOmission(constituents: Constituent[], tokens: TokenAnalysis[]): boolean {
  // 주어(topic/subject 역할) 성분이 없으면 생략된 것
  const hasSubject = constituents.some((c) => c.role === 'subject' || c.role === 'topic');
  return !hasSubject;
}

// ========================================
// 문장 패턴 결정
// ========================================
function determineSentencePattern(
  subject: Constituent | undefined,
  object: Constituent | undefined,
  predicate: Constituent | undefined,
  adverbials: Constituent[]
): SentencePattern {
  const hasSubject = !!subject;
  const hasObject = !!object;
  const hasIndirectObject = adverbials.some((a) => {
    // 에게, 한테, 께 등 간접목적어 역할 감지
    const particle = a.tokens[a.tokens.length - 1]?.particle;
    return particle === '에게' || particle === '한테' || particle === '께';
  });

  // 서술격 조사(입니다) 있으면 SVC
  if (
    predicate?.tokens[0]?.ending?.includes('입니') ||
    predicate?.tokens[0]?.ending?.includes('이에요')
  ) {
    return 'SVC';
  }

  if (hasObject && hasIndirectObject) return 'SVOO';
  if (hasObject) return 'SVO';
  return 'SV';
}

// ========================================
// 문장 파싱 메인 함수
// ========================================
export function parseSentence(text: string): ParsedSentence {
  const tokens = analyzeTokens(text);
  const constituents = groupConstituents(tokens);

  // 역할별 성분 추출
  let subject: Constituent | undefined;
  let object: Constituent | undefined;
  let predicate: Constituent | undefined;
  const adverbials: Constituent[] = [];
  const modifiers: Constituent[] = [];

  for (const constituent of constituents) {
    switch (constituent.role) {
      case 'subject':
      case 'topic':
        if (!subject) subject = constituent;
        break;
      case 'object':
        if (!object) object = constituent;
        break;
      case 'predicate':
        // 이미 서술어가 있으면, 이전 서술어를 수식어로 이동 (인사말 등 처리)
        if (predicate) {
          modifiers.push(predicate);
        }
        predicate = constituent;
        break;
      case 'adverbial':
        adverbials.push(constituent);
        break;
      case 'modifier':
        modifiers.push(constituent);
        break;
    }
  }

  // 서술어에서 시제/높임/의문 정보 추출
  const predicateToken = predicate?.tokens[0];
  const tense: Tense = predicateToken?.tense || 'present';
  const formality: Formality = predicateToken?.formality || 'polite';
  const isNegative = predicateToken?.isNegative || false;
  const isQuestion = predicateToken?.isQuestion || text.includes('?');

  // 문장 유형 결정
  let sentenceType: SentenceType = 'declarative';
  if (isQuestion) sentenceType = 'interrogative';

  // 문장 패턴 결정
  const pattern = determineSentencePattern(subject, object, predicate, adverbials);

  // 주어 생략 감지
  const subjectOmitted = detectSubjectOmission(constituents, tokens);

  return {
    original: text,
    tokens,
    constituents,
    subject,
    object,
    predicate,
    adverbials,
    modifiers,
    sentenceType,
    pattern,
    tense,
    formality,
    isNegative,
    isQuestion,
    subjectOmitted,
  };
}

// ========================================
// 문장 구조 요약 (디버깅용)
// ========================================
export function summarizeParsedSentence(parsed: ParsedSentence): string {
  const parts: string[] = [];

  if (parsed.subjectOmitted) {
    parts.push('[S: 생략]');
  } else if (parsed.subject) {
    parts.push(`[S: ${parsed.subject.text}]`);
  }

  for (const adv of parsed.adverbials) {
    parts.push(`[A: ${adv.text}]`);
  }

  if (parsed.object) {
    parts.push(`[O: ${parsed.object.text}]`);
  }

  if (parsed.predicate) {
    parts.push(`[V: ${parsed.predicate.text}]`);
  }

  parts.push(`| ${parsed.pattern} | ${parsed.tense} | ${parsed.formality}`);

  return parts.join(' ');
}
