// ========================================
// Translator Engine - 고성능 번역 엔진 통합
// Trie + DictionaryIndex + PatternIndex + LRUCache 통합
// SSG 최적화, 10,000+ 단어 규모 지원
// ========================================

import { LRUCache } from './cache/lru-cache';
import { type DictionaryEntry, DictionaryIndex } from './dictionary/dictionary-index';
import { PatternIndex } from './patterns/pattern-index';
import { SuffixTrie } from './trie/suffix-trie';

/**
 * 번역 옵션
 */
export interface TranslateOptions {
  /** 캐시 사용 여부 (기본: true) */
  useCache?: boolean;
  /** 질문 여부 */
  isQuestion?: boolean;
  /** 번역 방향 */
  direction?: 'ko-en' | 'en-ko';
}

/**
 * 번역 결과
 */
export interface TranslateResult {
  /** 번역 결과 */
  translated: string;
  /** 원본 텍스트 */
  original: string;
  /** 캐시 히트 여부 */
  fromCache: boolean;
  /** 매칭된 패턴 (있는 경우) */
  matchedPattern?: string;
  /** 처리 시간 (ms) */
  processingTime?: number;
}

/**
 * 엔진 설정
 */
export interface EngineConfig {
  /** 캐시 최대 크기 */
  cacheSize?: number;
  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 조사/어미 정보 타입
 */
interface SuffixInfo {
  type: 'particle' | 'ending' | 'connective';
  role?: string;
  tense?: string;
  en?: string;
}

/**
 * 고성능 번역 엔진
 *
 * @example
 * const engine = new TranslatorEngine();
 *
 * // 사전 로드
 * engine.loadDictionary({ 학교: 'school', 가다: 'go' });
 *
 * // 조사/어미 등록
 * engine.loadParticles([
 *   { suffix: '에서', info: { role: 'location', en: 'at' } }
 * ]);
 *
 * // 번역
 * engine.translate('학교에서', { direction: 'ko-en' }); // 'at school'
 */
export class TranslatorEngine {
  /** 한→영 사전 */
  private koToEnDict: DictionaryIndex;
  /** 영→한 사전 */
  private enToKoDict: DictionaryIndex;

  /** 한국어 조사 Trie */
  private particleTrie: SuffixTrie;
  /** 한국어 어미 Trie */
  private endingTrie: SuffixTrie;
  /** 한국어 연결어미 Trie */
  private connectiveTrie: SuffixTrie;

  /** 한→영 패턴 인덱스 */
  private koToEnPatterns: PatternIndex;
  /** 영→한 패턴 인덱스 */
  private enToKoPatterns: PatternIndex;

  /** 번역 결과 캐시 */
  private cache: LRUCache<string>;

  /** 설정 */
  private config: EngineConfig;

  /** 초기화 완료 여부 */
  private initialized: boolean;

  constructor(config: EngineConfig = {}) {
    this.config = {
      cacheSize: config.cacheSize ?? 2000,
      debug: config.debug ?? false,
    };

    // 자료구조 초기화
    this.koToEnDict = new DictionaryIndex();
    this.enToKoDict = new DictionaryIndex();

    this.particleTrie = new SuffixTrie();
    this.endingTrie = new SuffixTrie();
    this.connectiveTrie = new SuffixTrie();

    this.koToEnPatterns = new PatternIndex();
    this.enToKoPatterns = new PatternIndex();

    this.cache = new LRUCache<string>(this.config.cacheSize);

    this.initialized = false;
  }

  // ========================================
  // 사전 로딩 메서드
  // ========================================

  /**
   * 한→영 사전 로드 (Record 형태)
   */
  loadKoToEnDictionary(dict: Record<string, string>): void {
    this.koToEnDict.addFromRecord(dict);
    this.log(`Loaded ${Object.keys(dict).length} ko→en entries`);
  }

  /**
   * 영→한 사전 로드 (Record 형태)
   */
  loadEnToKoDictionary(dict: Record<string, string>): void {
    this.enToKoDict.addFromRecord(dict);
    this.log(`Loaded ${Object.keys(dict).length} en→ko entries`);
  }

  /**
   * 양방향 사전 로드
   */
  loadDictionary(koToEn: Record<string, string>, enToKo?: Record<string, string>): void {
    this.loadKoToEnDictionary(koToEn);

    if (enToKo) {
      this.loadEnToKoDictionary(enToKo);
    } else {
      // 역방향 자동 생성
      const reverse: Record<string, string> = {};
      for (const [ko, en] of Object.entries(koToEn)) {
        reverse[en.toLowerCase()] = ko;
      }
      this.loadEnToKoDictionary(reverse);
    }
  }

  /**
   * 상세 엔트리 로드
   */
  loadDetailedEntries(
    entries: Record<string, DictionaryEntry>,
    direction: 'ko-en' | 'en-ko',
  ): void {
    const dict = direction === 'ko-en' ? this.koToEnDict : this.enToKoDict;
    dict.addFromEntries(entries);
    this.log(`Loaded ${Object.keys(entries).length} detailed entries (${direction})`);
  }

  // ========================================
  // 조사/어미 로딩 메서드
  // ========================================

  /**
   * 조사 로드
   */
  loadParticles(particles: Array<{ suffix: string; info: SuffixInfo }>): void {
    for (const p of particles) {
      this.particleTrie.insert(p.suffix, { ...p.info, type: 'particle' });
    }
    this.log(`Loaded ${particles.length} particles`);
  }

  /**
   * 어미 로드
   */
  loadEndings(endings: Array<{ suffix: string; info: SuffixInfo }>): void {
    for (const e of endings) {
      this.endingTrie.insert(e.suffix, { ...e.info, type: 'ending' });
    }
    this.log(`Loaded ${endings.length} endings`);
  }

  /**
   * 연결어미 로드
   */
  loadConnectives(connectives: Array<{ suffix: string; info: SuffixInfo }>): void {
    for (const c of connectives) {
      this.connectiveTrie.insert(c.suffix, { ...c.info, type: 'connective' });
    }
    this.log(`Loaded ${connectives.length} connectives`);
  }

  // ========================================
  // 패턴 로딩 메서드
  // ========================================

  /**
   * 한→영 패턴 로드
   */
  loadKoToEnPatterns(patterns: Array<{ ko: RegExp; en: string; questionOnly?: boolean }>): void {
    this.koToEnPatterns.addMany(patterns);
    this.log(`Loaded ${patterns.length} ko→en patterns`);
  }

  /**
   * 영→한 패턴 로드
   */
  loadEnToKoPatterns(patterns: Array<{ ko: RegExp; en: string }>): void {
    this.enToKoPatterns.addMany(patterns);
    this.log(`Loaded ${patterns.length} en→ko patterns`);
  }

  // ========================================
  // 핵심 번역 메서드
  // ========================================

  /**
   * 메인 번역 함수
   */
  translate(text: string, options: TranslateOptions = {}): TranslateResult {
    const startTime = performance.now();
    const { useCache = true, isQuestion = false, direction = 'ko-en' } = options;

    // 정규화
    const normalized = this.normalize(text);
    if (!normalized) {
      return {
        translated: '',
        original: text,
        fromCache: false,
        processingTime: performance.now() - startTime,
      };
    }

    // 캐시 키 생성
    const cacheKey = `${direction}:${normalized}:${isQuestion}`;

    // 캐시 확인
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return {
          translated: cached,
          original: text,
          fromCache: true,
          processingTime: performance.now() - startTime,
        };
      }
    }

    // 번역 실행
    let translated: string;
    let matchedPattern: string | undefined;

    if (direction === 'ko-en') {
      const result = this.translateKoToEn(normalized, isQuestion);
      translated = result.translated;
      matchedPattern = result.matchedPattern;
    } else {
      const result = this.translateEnToKo(normalized);
      translated = result.translated;
      matchedPattern = result.matchedPattern;
    }

    // 캐시 저장
    if (useCache) {
      this.cache.set(cacheKey, translated);
    }

    return {
      translated,
      original: text,
      fromCache: false,
      matchedPattern,
      processingTime: performance.now() - startTime,
    };
  }

  /**
   * 한→영 번역
   */
  private translateKoToEn(
    text: string,
    isQuestion: boolean,
  ): { translated: string; matchedPattern?: string } {
    // 1. 사전 완전 일치
    const direct = this.koToEnDict.get(text);
    if (direct) {
      return { translated: direct };
    }

    // 2. 패턴 매칭
    const patternResult = this.koToEnPatterns.match(text, isQuestion);
    if (patternResult) {
      return {
        translated: patternResult.result,
        matchedPattern: patternResult.pattern.regex.source,
      };
    }

    // 3. 문장 분석 (토큰화)
    const hasSpaces = text.includes(' ');
    if (hasSpaces) {
      return { translated: this.translateSentenceKoToEn(text) };
    }

    // 4. 단어 분석 (조사/어미 분리)
    return { translated: this.translateWordKoToEn(text) };
  }

  /**
   * 영→한 번역
   */
  private translateEnToKo(text: string): { translated: string; matchedPattern?: string } {
    const lowerText = text.toLowerCase();

    // 1. 사전 완전 일치
    const direct = this.enToKoDict.get(lowerText);
    if (direct) {
      return { translated: direct };
    }

    // 2. 패턴 매칭
    const patternResult = this.enToKoPatterns.match(text);
    if (patternResult) {
      return {
        translated: patternResult.result,
        matchedPattern: patternResult.pattern.regex.source,
      };
    }

    // 3. 단어별 번역
    return { translated: this.translateWordsEnToKo(text) };
  }

  /**
   * 한국어 문장 번역 (토큰화 + SOV→SVO)
   */
  private translateSentenceKoToEn(text: string): string {
    const tokens = text.split(/\s+/);
    const translatedTokens: string[] = [];

    for (const token of tokens) {
      translatedTokens.push(this.translateWordKoToEn(token));
    }

    // 기본 조합 (추후 SOV→SVO 변환 로직 추가)
    return this.postProcessEnglish(translatedTokens.join(' '));
  }

  /**
   * 한국어 단어 번역 (조사/어미 분리)
   */
  private translateWordKoToEn(word: string): string {
    // 1. 사전 완전 일치
    const direct = this.koToEnDict.get(word);
    if (direct) {
      return direct;
    }

    // 2. 조사 분리 시도
    const particleResult = this.particleTrie.splitSuffix(word);
    if (particleResult) {
      const stem = this.koToEnDict.get(particleResult.stem) || particleResult.stem;
      const prep = (particleResult.info as SuffixInfo | null)?.en || '';
      return prep ? `${prep} ${stem}` : stem;
    }

    // 3. 어미 분리 시도
    const endingResult = this.endingTrie.splitSuffix(word);
    if (endingResult) {
      const stem = this.koToEnDict.get(endingResult.stem) || endingResult.stem;
      // TODO: 시제 적용
      return stem;
    }

    // 4. 연결어미 분리 시도
    const connectiveResult = this.connectiveTrie.splitSuffix(word);
    if (connectiveResult) {
      const stem = this.koToEnDict.get(connectiveResult.stem) || connectiveResult.stem;
      const conn = (connectiveResult.info as SuffixInfo | null)?.en || '';
      return conn ? `${stem}, ${conn}` : stem;
    }

    // 5. 원본 반환
    return word;
  }

  /**
   * 영어 단어들 한국어로 번역
   */
  private translateWordsEnToKo(text: string): string {
    const words = text.split(/\s+/);
    const translatedWords: string[] = [];

    for (const word of words) {
      const lowerWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const translated = this.enToKoDict.get(lowerWord);

      if (translated !== undefined) {
        if (translated === '') continue; // 관사 등 생략
        translatedWords.push(translated);
      } else {
        translatedWords.push(word);
      }
    }

    return translatedWords.join(' ').trim();
  }

  // ========================================
  // 유틸리티 메서드
  // ========================================

  /**
   * 텍스트 정규화
   */
  private normalize(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.!?？！。]+$/, '');
  }

  /**
   * 영어 후처리
   */
  private postProcessEnglish(text: string): string {
    let result = text.replace(/\s+/g, ' ').trim();

    // a/an 처리
    result = result.replace(/\ba ([aeiouAEIOU])/g, 'an $1');

    // 첫 글자 대문자
    if (result.length > 0 && result[0]) {
      result = result[0].toUpperCase() + result.slice(1);
    }

    return result;
  }

  /**
   * 디버그 로그
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[TranslatorEngine] ${message}`);
    }
  }

  // ========================================
  // 상태 관리
  // ========================================

  /**
   * 초기화 완료 표시
   */
  markInitialized(): void {
    this.initialized = true;
    this.log('Engine initialized');
  }

  /**
   * 초기화 상태 확인
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
    this.log('Cache cleared');
  }

  /**
   * 엔진 통계
   */
  getStats(): {
    dictionaries: {
      koToEn: number;
      enToKo: number;
    };
    suffixes: {
      particles: number;
      endings: number;
      connectives: number;
    };
    patterns: {
      koToEn: number;
      enToKo: number;
    };
    cache: {
      size: number;
      hitRate: number;
    };
  } {
    const cacheStats = this.cache.getStats();

    return {
      dictionaries: {
        koToEn: this.koToEnDict.size,
        enToKo: this.enToKoDict.size,
      },
      suffixes: {
        particles: this.particleTrie.size,
        endings: this.endingTrie.size,
        connectives: this.connectiveTrie.size,
      },
      patterns: {
        koToEn: this.koToEnPatterns.size,
        enToKo: this.enToKoPatterns.size,
      },
      cache: {
        size: cacheStats.size,
        hitRate: cacheStats.hitRate,
      },
    };
  }

  // ========================================
  // 직렬화 (SSG 빌드용)
  // ========================================

  /**
   * 엔진 상태 직렬화
   */
  serialize(): string {
    return JSON.stringify({
      koToEnDict: this.koToEnDict.serialize(),
      enToKoDict: this.enToKoDict.serialize(),
      particleTrie: this.particleTrie.serialize(),
      endingTrie: this.endingTrie.serialize(),
      connectiveTrie: this.connectiveTrie.serialize(),
      koToEnPatterns: this.koToEnPatterns.serialize(),
      enToKoPatterns: this.enToKoPatterns.serialize(),
    });
  }

  /**
   * 엔진 상태 복원
   */
  static deserialize(json: string, config?: EngineConfig): TranslatorEngine {
    const data = JSON.parse(json);
    const engine = new TranslatorEngine(config);

    engine.koToEnDict = DictionaryIndex.deserialize(data.koToEnDict);
    engine.enToKoDict = DictionaryIndex.deserialize(data.enToKoDict);
    engine.particleTrie = SuffixTrie.deserialize(data.particleTrie);
    engine.endingTrie = SuffixTrie.deserialize(data.endingTrie);
    engine.connectiveTrie = SuffixTrie.deserialize(data.connectiveTrie);
    engine.koToEnPatterns = PatternIndex.deserialize(data.koToEnPatterns);
    engine.enToKoPatterns = PatternIndex.deserialize(data.enToKoPatterns);

    engine.markInitialized();
    return engine;
  }
}
