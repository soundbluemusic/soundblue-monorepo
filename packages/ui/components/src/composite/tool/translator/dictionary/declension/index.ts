/**
 * 격변화(Declension) 모듈
 *
 * 영어-한국어 양방향 격변화 처리
 * - 영어: 대명사 격변화 (I/me/my/mine/myself)
 * - 한국어: 조사 시스템 (이/가, 을/를, 의 등 45개+)
 *
 * 참조: docs/declension-en-ko-complete.md
 */

// 영어 대명사 격변화
export {
  EN_PRONOUN_CASE,
  getPronounCase,
  INTERROGATIVE_WHAT,
  INTERROGATIVE_WHICH,
  INTERROGATIVE_WHO,
  isObjectivePronoun,
  isPossessivePronoun,
  isSubjectivePronoun,
  PRONOUN_1P,
  PRONOUN_1S,
  PRONOUN_2P,
  PRONOUN_2S,
  PRONOUN_3P,
  PRONOUN_3SF,
  PRONOUN_3SM,
  PRONOUN_3SN,
  type PronounCase,
  type PronounDeclension,
  translatePronoun,
} from './english-pronouns';

// 한국어 조사
export {
  ABLATIVE_PARTICLES,
  ACCUSATIVE_PARTICLES,
  ALL_PARTICLES,
  AUXILIARY_PARTICLES,
  COMITATIVE_PARTICLES,
  COMPARATIVE_PARTICLES,
  DATIVE_PARTICLES,
  DELIMITER_PARTICLES,
  findParticleByEnglish,
  GENITIVE_PARTICLES,
  getEnglishPreposition,
  getParticleInfo,
  getParticlesByCategory,
  INSTRUMENTAL_PARTICLES,
  LOCATIVE_PARTICLES,
  NOMINATIVE_PARTICLES,
  type ParticleCategory,
  type ParticleInfo,
  QUOTATIVE_PARTICLES,
  selectParticle,
  TOPIC_PARTICLES,
  VOCATIVE_PARTICLES,
} from './korean-particles';
