// ========================================
// Domain Voter - 도메인 투표 시스템
// ========================================

import { findAnchorsInText, getDomainAnchors } from './anchor-extractor';
import { getDomainsForWord } from './tagged-dictionary-builder';
import type { Clause, Domain, DomainVote } from './types';

/**
 * 투표 가중치
 *
 * 모든 앵커는 동일한 강도 (사전에서 자동 추출)
 * - 단일 도메인에만 속하는 단어 = 앵커 (3점)
 * - 다중 도메인에 속하는 단어 = 일반 단어 (1점)
 */
const VOTE_WEIGHTS = {
  ANCHOR: 3, // 앵커 (단일 도메인 단어)
  DOMAIN_WORD: 1, // 도메인 단어 (다중 도메인에 속할 수 있음)
};

/**
 * 단어 추출 (공백 기준)
 */
function extractWords(text: string): string[] {
  // 영어와 한글 모두 처리
  return text
    .toLowerCase()
    .split(/[\s,.!?;:'"()[\]{}—–-]+/)
    .filter((word) => word.length > 0);
}

/**
 * 절에서 도메인 투표 수행
 *
 * @param clause - 분석할 절
 * @returns 도메인별 투표 결과 배열 (점수순 정렬)
 *
 * @example
 * voteForDomain({ text: "The developer pushed the branch fix", ... })
 * // → [
 * //   { domain: 'technology.devops', score: 6, anchors: ['branch', 'push'] },
 * //   { domain: 'technology', score: 3, anchors: ['developer'] }
 * // ]
 */
export function voteForDomain(clause: Clause): DomainVote[] {
  const votes = new Map<Domain, { score: number; anchors: string[] }>();
  const anchors = getDomainAnchors();

  // 1. 앵커 단어 투표 (단일 도메인 단어 = 앵커, +3점)
  const anchorMatches = findAnchorsInText(clause.text, anchors);

  for (const match of anchorMatches) {
    const existing = votes.get(match.domain) || { score: 0, anchors: [] };
    existing.score += VOTE_WEIGHTS.ANCHOR;
    if (!existing.anchors.includes(match.word)) {
      existing.anchors.push(match.word);
    }
    votes.set(match.domain, existing);
  }

  // 2. 일반 도메인 단어 투표 (+1)
  const words = extractWords(clause.text);
  for (const word of words) {
    const wordDomains = getDomainsForWord(word);

    // 다중 도메인에 속하는 단어도 각 도메인에 약한 투표
    for (const domain of wordDomains) {
      // 이미 앵커로 투표된 경우 스킵
      const existing = votes.get(domain);
      if (existing?.anchors.includes(word)) {
        continue;
      }

      const vote = existing || { score: 0, anchors: [] };
      vote.score += VOTE_WEIGHTS.DOMAIN_WORD;
      votes.set(domain, vote);
    }
  }

  // 점수순으로 정렬하여 반환
  const result: DomainVote[] = [];
  for (const [domain, { score, anchors: anchorList }] of votes) {
    result.push({ domain, score, anchors: anchorList });
  }

  return result.sort((a, b) => b.score - a.score);
}

/**
 * 투표 결과에서 최종 도메인 결정
 *
 * @param votes - 투표 결과 배열
 * @param previousDomain - 이전 절의 도메인 (없으면 null)
 * @returns 최종 도메인과 신뢰도
 */
export function decideDomain(
  votes: DomainVote[],
  previousDomain: Domain | null = null,
): { domain: Domain; confidence: number } {
  // 투표가 없으면 이전 도메인 상속 또는 general
  if (votes.length === 0) {
    return {
      domain: previousDomain || 'general',
      confidence: previousDomain ? 0.5 : 0,
    };
  }

  const topVote = votes[0];
  const secondVote = votes[1];

  // 동점 처리
  if (secondVote && topVote.score === secondVote.score) {
    // 더 구체적인 도메인 우선 (technology.web > technology)
    const topSpecificity = topVote.domain.split('.').length;
    const secondSpecificity = secondVote.domain.split('.').length;

    if (secondSpecificity > topSpecificity) {
      return {
        domain: secondVote.domain,
        confidence: calculateConfidence(secondVote.score, votes),
      };
    }

    // 이전 도메인과 관련 있으면 우선
    if (previousDomain) {
      if (isDomainRelated(secondVote.domain, previousDomain)) {
        return {
          domain: secondVote.domain,
          confidence: calculateConfidence(secondVote.score, votes),
        };
      }
    }
  }

  return {
    domain: topVote.domain,
    confidence: calculateConfidence(topVote.score, votes),
  };
}

/**
 * 신뢰도 계산 (0-1)
 */
function calculateConfidence(topScore: number, votes: DomainVote[]): number {
  if (votes.length === 0 || topScore === 0) return 0;

  // 총점 대비 1위 점수 비율
  const totalScore = votes.reduce((sum, v) => sum + v.score, 0);
  const ratio = topScore / totalScore;

  // 점수 절대값도 고려 (높은 점수 = 더 확신)
  const absoluteBonus = Math.min(topScore / 10, 0.3);

  return Math.min(ratio + absoluteBonus, 1);
}

/**
 * 두 도메인이 관련있는지 확인
 * (같은 상위 도메인이거나, 하위 도메인 관계)
 */
function isDomainRelated(domain1: Domain, domain2: Domain): boolean {
  if (domain1 === domain2) return true;

  const parts1 = domain1.split('.');
  const parts2 = domain2.split('.');

  // 상위 도메인이 같으면 관련됨
  return parts1[0] === parts2[0];
}

/**
 * 문장 전체의 도메인 분석
 * 각 절의 도메인을 결정하고, 이전 절 도메인을 상속
 *
 * @param clauses - 절 배열
 * @returns 도메인이 할당된 절 배열
 */
export function analyzeClauseDomains(clauses: Clause[]): Clause[] {
  const result: Clause[] = [];
  let previousDomain: Domain | null = null;

  for (const clause of clauses) {
    const votes = voteForDomain(clause);
    const { domain, confidence } = decideDomain(votes, previousDomain);

    result.push({
      ...clause,
      domain,
      confidence,
    });

    previousDomain = domain;
  }

  return result;
}

/**
 * 문장 전체의 주요 도메인 결정
 * (모든 절의 투표를 합산)
 */
export function getOverallDomain(clauses: Clause[]): Domain {
  const allVotes = new Map<Domain, number>();

  for (const clause of clauses) {
    if (clause.domain) {
      const current = allVotes.get(clause.domain) || 0;
      // 신뢰도를 가중치로 사용
      allVotes.set(clause.domain, current + (clause.confidence || 0.5));
    }
  }

  if (allVotes.size === 0) {
    return 'general';
  }

  // 가장 높은 점수의 도메인 반환
  let maxDomain: Domain = 'general';
  let maxScore = 0;

  for (const [domain, score] of allVotes) {
    if (score > maxScore) {
      maxScore = score;
      maxDomain = domain;
    }
  }

  return maxDomain;
}

/**
 * 문장이 다중 도메인을 포함하는지 확인
 */
export function isMultiDomain(clauses: Clause[]): boolean {
  const domains = new Set<Domain>();

  for (const clause of clauses) {
    if (clause.domain && clause.domain !== 'general') {
      domains.add(clause.domain);
    }
  }

  // 서로 다른 상위 도메인이 2개 이상이면 다중 도메인
  const topLevelDomains = new Set(Array.from(domains).map((d) => d.split('.')[0]));

  return topLevelDomains.size >= 2;
}
