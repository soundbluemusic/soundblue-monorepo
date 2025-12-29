// ========================================
// Pattern Index - 패턴 매칭 최적화
// 첫 토큰/키워드 기반 인덱싱으로 O(n) → O(k) 개선
// ========================================

/**
 * 인덱싱된 패턴 타입
 */
export interface IndexedPattern {
  /** 원본 정규식 */
  regex: RegExp;
  /** 영어 템플릿 */
  template: string;
  /** 인덱스 키 (첫 토큰 또는 키워드) */
  indexKey: string;
  /** 질문 전용 여부 */
  questionOnly?: boolean;
  /** 우선순위 (높을수록 우선) */
  priority?: number;
  /** 패턴 ID (디버깅용) */
  id?: string;
}

/**
 * 패턴 추출 결과
 */
interface PatternExtractResult {
  /** 첫 번째 키워드 (인덱스용) */
  firstKeyword: string;
  /** 패턴이 시작 앵커(^)를 가지는지 */
  hasStartAnchor: boolean;
  /** 리터럴 프리픽스 (있는 경우) */
  literalPrefix: string;
}

/**
 * 패턴 매칭 결과
 */
export interface PatternMatchResult {
  /** 매칭된 패턴 */
  pattern: IndexedPattern;
  /** 정규식 매칭 결과 */
  match: RegExpMatchArray;
  /** 변환된 결과 */
  result: string;
}

/**
 * 고성능 패턴 인덱스
 * - 첫 토큰/키워드 기반 인덱싱
 * - 전체 순회 O(n) → 그룹 순회 O(k)
 *
 * @example
 * const index = new PatternIndex();
 * index.add({ regex: /^나는\s+(.+)을/, template: 'I $1' });
 * index.add({ regex: /^나는\s+(.+)를/, template: 'I $1' });
 *
 * // '나는'으로 시작하는 패턴만 검색 (2개)
 * index.match('나는 밥을 먹는다'); // 전체 100개 중 2개만 검사
 */
export class PatternIndex {
  /** 키워드 → 패턴 그룹 인덱스 */
  private keywordIndex: Map<string, IndexedPattern[]>;

  /** 시작 앵커 패턴 (^로 시작) */
  private anchoredPatterns: Map<string, IndexedPattern[]>;

  /** 일반 패턴 (인덱싱 불가능한 것들) */
  private generalPatterns: IndexedPattern[];

  /** 전체 패턴 수 */
  private patternCount: number;

  constructor() {
    this.keywordIndex = new Map();
    this.anchoredPatterns = new Map();
    this.generalPatterns = [];
    this.patternCount = 0;
  }

  /**
   * 패턴 추가
   */
  add(pattern: Omit<IndexedPattern, 'indexKey'> & { indexKey?: string }): void {
    const extracted = this.extractPatternInfo(pattern.regex);
    const indexKey = pattern.indexKey || extracted.firstKeyword;

    const indexedPattern: IndexedPattern = {
      ...pattern,
      indexKey,
      priority: pattern.priority ?? 0,
    };

    if (extracted.hasStartAnchor && extracted.literalPrefix) {
      // 시작 앵커 + 리터럴 프리픽스가 있으면 앵커 인덱스에 추가
      const prefix = extracted.literalPrefix;
      if (!this.anchoredPatterns.has(prefix)) {
        this.anchoredPatterns.set(prefix, []);
      }
      this.anchoredPatterns.get(prefix)!.push(indexedPattern);
    } else if (indexKey && indexKey !== '*') {
      // 키워드가 있으면 키워드 인덱스에 추가
      if (!this.keywordIndex.has(indexKey)) {
        this.keywordIndex.set(indexKey, []);
      }
      this.keywordIndex.get(indexKey)!.push(indexedPattern);
    } else {
      // 인덱싱 불가능한 패턴은 일반 목록에 추가
      this.generalPatterns.push(indexedPattern);
    }

    this.patternCount++;

    // 우선순위 정렬
    this.sortPatterns();
  }

  /**
   * 여러 패턴 일괄 추가
   */
  addMany(
    patterns: Array<{
      ko: RegExp;
      en: string;
      questionOnly?: boolean;
      priority?: number;
    }>,
  ): void {
    for (const p of patterns) {
      this.add({
        regex: p.ko,
        template: p.en,
        questionOnly: p.questionOnly,
        priority: p.priority,
      });
    }
  }

  /**
   * 정규식에서 패턴 정보 추출
   */
  private extractPatternInfo(regex: RegExp): PatternExtractResult {
    const source = regex.source;

    // 시작 앵커 체크
    const hasStartAnchor = source.startsWith('^');

    // 리터럴 프리픽스 추출 (정규식 시작 부분의 순수 문자열)
    let literalPrefix = '';
    let firstKeyword = '';

    if (hasStartAnchor) {
      // ^를 제외하고 리터럴 부분 추출
      const withoutAnchor = source.slice(1);

      // 첫 번째 특수문자나 캡처 그룹까지의 문자열
      const literalMatch = withoutAnchor.match(/^([가-힣a-zA-Z0-9]+)/);
      if (literalMatch) {
        literalPrefix = literalMatch[1];
        firstKeyword = literalPrefix;
      }
    }

    // 첫 키워드가 없으면 패턴에서 추출 시도
    if (!firstKeyword) {
      // 한글 단어 추출
      const koreanWords = source.match(/[가-힣]+/g);
      if (koreanWords && koreanWords.length > 0) {
        firstKeyword = koreanWords[0];
      }
    }

    return {
      firstKeyword,
      hasStartAnchor,
      literalPrefix,
    };
  }

  /**
   * 모든 패턴 우선순위 정렬
   */
  private sortPatterns(): void {
    const sortFn = (a: IndexedPattern, b: IndexedPattern) => (b.priority ?? 0) - (a.priority ?? 0);

    for (const patterns of this.keywordIndex.values()) {
      patterns.sort(sortFn);
    }
    for (const patterns of this.anchoredPatterns.values()) {
      patterns.sort(sortFn);
    }
    this.generalPatterns.sort(sortFn);
  }

  /**
   * 패턴 매칭 (최적화된 검색)
   * @param text 검색할 텍스트
   * @param isQuestion 질문 여부
   * @returns 매칭 결과 또는 null
   */
  match(text: string, isQuestion = false): PatternMatchResult | null {
    const candidates: IndexedPattern[] = [];

    // 1. 앵커 패턴 검색 (텍스트 시작 부분과 일치하는 것)
    for (const [prefix, patterns] of this.anchoredPatterns) {
      if (text.startsWith(prefix)) {
        candidates.push(...patterns);
      }
    }

    // 2. 키워드 인덱스 검색 (텍스트에 키워드가 포함된 것)
    const firstToken = text.split(/\s+/)[0] || '';
    if (this.keywordIndex.has(firstToken)) {
      candidates.push(...this.keywordIndex.get(firstToken)!);
    }

    // 첫 토큰이 아닌 다른 키워드도 검색
    for (const [keyword, patterns] of this.keywordIndex) {
      if (keyword !== firstToken && text.includes(keyword)) {
        candidates.push(...patterns);
      }
    }

    // 3. 일반 패턴 추가
    candidates.push(...this.generalPatterns);

    // 4. 중복 제거 및 정렬
    const uniqueCandidates = [...new Set(candidates)];
    uniqueCandidates.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // 5. 순차적으로 매칭 시도
    for (const pattern of uniqueCandidates) {
      // questionOnly 체크
      if (pattern.questionOnly && !isQuestion) {
        continue;
      }

      const match = text.match(pattern.regex);
      if (match) {
        const result = this.applyTemplate(pattern.template, match);
        return { pattern, match, result };
      }
    }

    return null;
  }

  /**
   * 모든 매칭 패턴 찾기
   */
  matchAll(text: string, isQuestion = false): PatternMatchResult[] {
    const results: PatternMatchResult[] = [];
    const allPatterns = this.getAllPatterns();

    for (const pattern of allPatterns) {
      if (pattern.questionOnly && !isQuestion) {
        continue;
      }

      const match = text.match(pattern.regex);
      if (match) {
        const result = this.applyTemplate(pattern.template, match);
        results.push({ pattern, match, result });
      }
    }

    // 우선순위 정렬
    results.sort((a, b) => (b.pattern.priority ?? 0) - (a.pattern.priority ?? 0));

    return results;
  }

  /**
   * 템플릿 적용 ($1, $2 등 치환)
   */
  private applyTemplate(template: string, match: RegExpMatchArray): string {
    let result = template;

    for (let i = 1; i < match.length; i++) {
      const group = match[i] ?? '';
      result = result.replace(new RegExp(`\\$${i}`, 'g'), group);
    }

    return result;
  }

  /**
   * 모든 패턴 반환
   */
  getAllPatterns(): IndexedPattern[] {
    const all: IndexedPattern[] = [];

    for (const patterns of this.anchoredPatterns.values()) {
      all.push(...patterns);
    }
    for (const patterns of this.keywordIndex.values()) {
      all.push(...patterns);
    }
    all.push(...this.generalPatterns);

    return all;
  }

  /**
   * 패턴 수
   */
  get size(): number {
    return this.patternCount;
  }

  /**
   * 통계 정보
   */
  getStats(): {
    total: number;
    anchored: number;
    indexed: number;
    general: number;
    indexKeys: string[];
  } {
    let anchored = 0;
    for (const patterns of this.anchoredPatterns.values()) {
      anchored += patterns.length;
    }

    let indexed = 0;
    for (const patterns of this.keywordIndex.values()) {
      indexed += patterns.length;
    }

    return {
      total: this.patternCount,
      anchored,
      indexed,
      general: this.generalPatterns.length,
      indexKeys: [...this.keywordIndex.keys()],
    };
  }

  /**
   * 직렬화 (SSG 빌드용)
   */
  serialize(): string {
    const patterns = this.getAllPatterns().map((p) => ({
      source: p.regex.source,
      flags: p.regex.flags,
      template: p.template,
      indexKey: p.indexKey,
      questionOnly: p.questionOnly,
      priority: p.priority,
      id: p.id,
    }));

    return JSON.stringify(patterns);
  }

  /**
   * 역직렬화 (SSG 런타임용)
   */
  static deserialize(json: string): PatternIndex {
    const index = new PatternIndex();
    const patterns = JSON.parse(json) as Array<{
      source: string;
      flags: string;
      template: string;
      indexKey?: string;
      questionOnly?: boolean;
      priority?: number;
      id?: string;
    }>;

    for (const p of patterns) {
      index.add({
        regex: new RegExp(p.source, p.flags),
        template: p.template,
        indexKey: p.indexKey,
        questionOnly: p.questionOnly,
        priority: p.priority,
        id: p.id,
      });
    }

    return index;
  }
}
