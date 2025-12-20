// ========================================
// Morphemes Dictionary - 형태소 사전
// ========================================

import type { EndingInfo, ParticleInfo } from '../types';

// 조사 (문장 내 역할 결정)
export const particles: Record<string, ParticleInfo> = {
  은: { role: 'topic', en: '' },
  는: { role: 'topic', en: '' },
  이: { role: 'subject', en: '' },
  가: { role: 'subject', en: '' },
  을: { role: 'object', en: '' },
  를: { role: 'object', en: '' },
  에: { role: 'direction', en: 'to' }, // 주로 이동/방향 (학교에 가다)
  에서: { role: 'location', en: 'at' }, // 동작이 일어나는 장소 (학교에서 공부하다)
  로: { role: 'direction', en: 'to' },
  으로: { role: 'direction', en: 'to' },
  와: { role: 'conjunction', en: 'and' },
  과: { role: 'conjunction', en: 'and' },
  의: { role: 'possessive', en: "'s" },
};

// 어미 (시제/높임 결정)
export const endings: Record<string, EndingInfo> = {
  // 현재
  아요: { tense: 'present', formality: 'polite' },
  어요: { tense: 'present', formality: 'polite' },
  해요: { tense: 'present', formality: 'polite' },
  습니다: { tense: 'present', formality: 'formal' },
  ㅂ니다: { tense: 'present', formality: 'formal' },

  // 과거
  았어요: { tense: 'past', formality: 'polite' },
  었어요: { tense: 'past', formality: 'polite' },
  했어요: { tense: 'past', formality: 'polite' },
  았습니다: { tense: 'past', formality: 'formal' },
  었습니다: { tense: 'past', formality: 'formal' },

  // 미래
  '을 거예요': { tense: 'future', formality: 'polite' },
  'ㄹ 거예요': { tense: 'future', formality: 'polite' },
  겠습니다: { tense: 'future', formality: 'formal' },

  // 반말
  아: { tense: 'present', formality: 'casual' },
  어: { tense: 'present', formality: 'casual' },
  았어: { tense: 'past', formality: 'casual' },
  었어: { tense: 'past', formality: 'casual' },
};

// 조사 목록 (길이순 정렬 - 긴 것 먼저 매칭)
export const particleList = Object.keys(particles).sort((a, b) => b.length - a.length);

// 어미 목록 (길이순 정렬)
export const endingList = Object.keys(endings).sort((a, b) => b.length - a.length);
