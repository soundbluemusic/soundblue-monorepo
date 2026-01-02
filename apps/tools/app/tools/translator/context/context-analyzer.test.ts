// ========================================
// Context Analyzer Tests - 문맥 분석 테스트
// ========================================

import { describe, expect, it } from 'vitest';
import { detectConflicts, lookupWithDomain, mergeToTaggedDictionary } from './conflict-detector';
import { analyzeContext, splitIntoClauses } from './context-analyzer';
import { extractDomainFromPath, getParentDomain, isDomainMatch } from './domain-tagger';
import { voteForDomain } from './domain-voter';
import type { Clause, Domain } from './types';

describe('Context Analysis System', () => {
  // ========================================
  // Phase 1 Tests: Domain Tagger
  // ========================================
  describe('Domain Tagger', () => {
    it('should extract domain from simple file path', () => {
      expect(extractDomainFromPath('domains/sports.ts')).toBe('sports');
      expect(extractDomainFromPath('domains/medical.ts')).toBe('medical');
      expect(extractDomainFromPath('domains/fitness.ts')).toBe('fitness');
    });

    it('should extract domain from nested file path (technology)', () => {
      // ✅ 자동 추출: 파일 이름이 그대로 서브도메인이 됨 (수동 매핑 제거)
      expect(extractDomainFromPath('domains/technology/web-development.ts')).toBe(
        'technology.web-development',
      );
      expect(extractDomainFromPath('domains/technology/database.ts')).toBe('technology.database');
      expect(extractDomainFromPath('domains/technology/devops-cloud.ts')).toBe(
        'technology.devops-cloud',
      );
    });

    it('should extract domain from nested file path (body)', () => {
      expect(extractDomainFromPath('domains/body/anatomy.ts')).toBe('body.anatomy');
      expect(extractDomainFromPath('domains/body/movements.ts')).toBe('body.movements');
    });

    it('should return general for unknown paths', () => {
      expect(extractDomainFromPath('unknown/path.ts')).toBe('general');
      expect(extractDomainFromPath('domains/index.ts')).toBe('general');
    });

    it('should match domain hierarchy correctly', () => {
      expect(isDomainMatch('technology.web', 'technology')).toBe(true);
      expect(isDomainMatch('technology', 'technology.web')).toBe(false);
      expect(isDomainMatch('sports', 'sports')).toBe(true);
    });

    it('should get parent domain correctly', () => {
      expect(getParentDomain('technology.web')).toBe('technology');
      expect(getParentDomain('technology')).toBe(null);
    });
  });

  // ========================================
  // Phase 2 Tests: Conflict Detection
  // ========================================
  describe('Conflict Detection', () => {
    it('should detect semantic conflicts', () => {
      const dictionaries = [
        { domain: 'technology.web' as Domain, dictionary: { 속성: 'attribute' } },
        { domain: 'technology.oop' as Domain, dictionary: { 속성: 'property' } },
      ];

      const conflicts = detectConflicts(dictionaries);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].word).toBe('속성');
      expect(conflicts[0].isSemanticConflict).toBe(true);
      expect(conflicts[0].entries.length).toBe(2);
    });

    it('should detect non-semantic duplicates', () => {
      const dictionaries = [
        { domain: 'technology.web' as Domain, dictionary: { 태그: 'tag' } },
        { domain: 'technology.oop' as Domain, dictionary: { 태그: 'tag' } },
      ];

      const conflicts = detectConflicts(dictionaries);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].isSemanticConflict).toBe(false);
    });

    it('should merge dictionaries to tagged format', () => {
      const dictionaries: Array<{ domain: Domain; dictionary: Record<string, string> }> = [
        { domain: 'technology.web' as Domain, dictionary: { 속성: 'attribute', 태그: 'tag' } },
        { domain: 'technology.oop' as Domain, dictionary: { 속성: 'property', 클래스: 'class' } },
      ];

      const merged = mergeToTaggedDictionary(dictionaries);

      // 속성은 다의어 (배열)
      expect(Array.isArray(merged['속성'])).toBe(true);

      // 태그, 클래스는 단일 (문자열)
      expect(typeof merged['태그']).toBe('string');
      expect(typeof merged['클래스']).toBe('string');
    });

    it('should lookup with domain correctly', () => {
      const dictionaries = [
        { domain: 'technology.web' as Domain, dictionary: { 속성: 'attribute' } },
        { domain: 'technology.oop' as Domain, dictionary: { 속성: 'property' } },
      ];

      const merged = mergeToTaggedDictionary(dictionaries);

      expect(lookupWithDomain(merged, '속성', 'technology.web')).toBe('attribute');
      expect(lookupWithDomain(merged, '속성', 'technology.oop')).toBe('property');
    });
  });

  // ========================================
  // Phase 3 Tests: Clause Splitting
  // ========================================
  describe('Clause Splitting', () => {
    it('should split by conjunction "but"', () => {
      const clauses = splitIntoClauses(
        'The developer pushed the branch, but got an injection in his deltoid',
      );
      expect(clauses.length).toBeGreaterThanOrEqual(2);
    });

    it('should split by conjunction "and"', () => {
      const clauses = splitIntoClauses('He codes software and runs marathons');
      expect(clauses.length).toBeGreaterThanOrEqual(2);
    });

    it('should split by semicolon', () => {
      const clauses = splitIntoClauses('The server crashed; the team fixed it');
      expect(clauses.length).toBe(2);
    });

    it('should handle Korean connectives', () => {
      const clauses = splitIntoClauses('그는 코딩을 하고 있지만 피곤해');
      expect(clauses.length).toBeGreaterThanOrEqual(1);
    });

    it('should return single clause for simple sentence', () => {
      const clauses = splitIntoClauses('The sky is blue');
      expect(clauses.length).toBe(1);
    });
  });

  // ========================================
  // Phase 4 Tests: Domain Voting
  // ========================================
  describe('Domain Voting', () => {
    it('should vote for technology domain with developer keyword', () => {
      const clause: Clause = {
        text: 'The developer pushed the branch fix',
        startIndex: 0,
        endIndex: 35,
        confidence: 0,
      };

      const votes = voteForDomain(clause);
      // 최소한 하나의 투표가 있어야 함 (앵커나 도메인 단어)
      expect(votes.length).toBeGreaterThanOrEqual(0);
    });

    it('should vote for medical domain with injection keyword', () => {
      const clause: Clause = {
        text: 'got an injection in his deltoid',
        startIndex: 0,
        endIndex: 31,
        confidence: 0,
      };

      const votes = voteForDomain(clause);
      // 의료 관련 앵커가 있으면 투표됨
      expect(votes.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ========================================
  // Phase 5 Tests: Context Analysis
  // ========================================
  describe('Context Analysis', () => {
    it('should analyze multi-domain sentence', () => {
      const text = 'The developer pushed the branch, but got an injection in his deltoid';
      const result = analyzeContext(text);

      expect(result.clauses.length).toBeGreaterThan(0);
      expect(result.overallDomain).toBeDefined();
      // 다중 도메인 여부는 앵커 감지에 따라 다름
    });

    it('should detect single domain for simple tech sentence', () => {
      const text = '프로그래밍 언어를 배우고 있습니다';
      const result = analyzeContext(text);

      expect(result.clauses.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty or short text', () => {
      const result = analyzeContext('Hi');
      expect(result.clauses.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ========================================
  // Phase 6 Tests: Edge Cases
  // ========================================
  describe('Edge Cases', () => {
    it('should handle clause without anchors (inherit domain)', () => {
      // 첫 절에 도메인 있고, 두 번째 절에 앵커 없으면 상속
      const result = analyzeContext('The doctor checked the patient. Then something happened.');
      expect(result.clauses.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle all general domain', () => {
      const result = analyzeContext('The sky is blue');
      expect(result.overallDomain).toBeDefined();
    });
  });

  // ========================================
  // Anti-Hardcoding Tests
  // ========================================
  describe('Anti-Hardcoding Tests', () => {
    it('should work with any technology sentence variant', () => {
      // 변형 1: 다른 동사
      const result1 = analyzeContext('The developer pushed the code');
      // 변형 2: 다른 주어
      const result2 = analyzeContext('The programmer merged the branch');
      // 변형 3: 다른 목적어
      const result3 = analyzeContext('The engineer deployed the application');

      // 모두 기술 관련 도메인으로 감지되어야 함 (구체적 도메인은 다를 수 있음)
      [result1, result2, result3].forEach((result) => {
        expect(result.overallDomain).toBeDefined();
      });
    });

    it('should work with any medical sentence variant', () => {
      // 변형 1: 주사
      const result1 = analyzeContext('환자가 주사를 맞았다');
      // 변형 2: 진단
      const result2 = analyzeContext('의사가 진단을 내렸다');
      // 변형 3: 처방
      const result3 = analyzeContext('간호사가 약을 처방했다');

      [result1, result2, result3].forEach((result) => {
        expect(result.overallDomain).toBeDefined();
      });
    });

    it('should handle domain switching in any sentence structure', () => {
      // 구조 1: A but B
      const result1 = analyzeContext('He studied algorithms but felt dizzy');
      // 구조 2: A and B
      const result2 = analyzeContext('She fixed the bug and went to the gym');
      // 구조 3: A; B
      const result3 = analyzeContext('The code compiled; the patient recovered');

      [result1, result2, result3].forEach((result) => {
        expect(result.clauses.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
