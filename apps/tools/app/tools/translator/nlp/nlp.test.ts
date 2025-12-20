// ========================================
// NLP Module Tests
// WSD, 연어, 주제 탐지 테스트
// ========================================

import { describe, expect, it } from 'vitest';
import {
  detectDomains,
  disambiguate,
  extractContext,
  findCollocations,
  getDomainHint,
  getTopDomain,
  getWordSense,
  isPolysemous,
} from './index';

// ========================================
// WSD 테스트
// ========================================
describe('WSD - 중의성 해소', () => {
  describe('isPolysemous', () => {
    it('다의어 확인', () => {
      expect(isPolysemous('배')).toBe(true);
      expect(isPolysemous('눈')).toBe(true);
      expect(isPolysemous('밤')).toBe(true);
      expect(isPolysemous('말')).toBe(true);
    });

    it('단의어 확인', () => {
      expect(isPolysemous('컴퓨터')).toBe(false);
      expect(isPolysemous('의자')).toBe(false);
    });

    it('새로 추가된 다의어 확인', () => {
      expect(isPolysemous('사과')).toBe(true);
      expect(isPolysemous('다리')).toBe(true);
    });
  });

  describe('getWordSense', () => {
    it('배 + 아프다 → stomach', () => {
      const result = getWordSense('배', '배가 아파요');
      expect(result).toBe('stomach');
    });

    it('배 + 타다 → boat', () => {
      const result = getWordSense('배', '배를 타고 바다로 갔어요');
      expect(result).toBe('boat');
    });

    it('배 + 맛있다 → pear', () => {
      const result = getWordSense('배', '배가 달고 맛있어요');
      expect(result).toBe('pear');
    });

    it('배 + 두배 → times', () => {
      const result = getWordSense('배', '두 배로 늘었어요');
      expect(result).toBe('times');
    });

    it('눈 + 보다 → eye', () => {
      const result = getWordSense('눈', '눈을 감아요');
      expect(result).toBe('eye');
    });

    it('눈 + 내리다 → snow', () => {
      const result = getWordSense('눈', '눈이 내려요');
      expect(result).toBe('snow');
    });

    it('밤 + 어둡다 → night', () => {
      const result = getWordSense('밤', '밤이 어두워요');
      expect(result).toBe('night');
    });

    it('밤 + 먹다/맛 → chestnut', () => {
      const result = getWordSense('밤', '군밤이 맛있어요');
      expect(result).toBe('chestnut');
    });

    it('차 + 타다 → car', () => {
      const result = getWordSense('차', '차를 타고 출근해요');
      expect(result).toBe('car');
    });

    it('차 + 마시다 → tea', () => {
      const result = getWordSense('차', '따뜻한 차를 마셔요');
      expect(result).toBe('tea');
    });

    it('말 + 하다 → word', () => {
      const result = getWordSense('말', '말을 해요');
      expect(result).toBe('word');
    });

    it('말 + 타다/경마 → horse', () => {
      const result = getWordSense('말', '말을 타고 달려요');
      expect(result).toBe('horse');
    });
  });

  describe('extractContext', () => {
    it('문맥 윈도우 추출', () => {
      const tokens = ['나는', '어제', '배가', '아파서', '병원에', '갔다'];
      const context = extractContext(tokens, 2, 2);

      expect(context.before).toEqual(['나는', '어제']);
      expect(context.after).toEqual(['아파서', '병원에']);
      expect(context.full).toBe('나는 어제 배가 아파서 병원에 갔다');
    });

    it('문맥 윈도우 - 앞쪽 부족', () => {
      const tokens = ['배가', '아파요'];
      const context = extractContext(tokens, 0, 3);

      expect(context.before).toEqual([]);
      expect(context.after).toEqual(['아파요']);
    });
  });

  describe('disambiguate', () => {
    it('도메인 힌트와 함께 WSD', () => {
      const tokens = ['배가', '아파요'];
      const context = extractContext(tokens, 0, 3);
      const result = disambiguate('배', context, 'body');

      expect(result).not.toBeNull();
      expect(result?.sense.en).toBe('stomach');
    });

    it('배를 먹으며 → pear (동사-목적어 관계)', () => {
      // "배가 고파서 배를 먹으며 배를 탔다"
      // 두번째 배를 (index 2) → 먹으며 다음 → pear
      const tokens = ['배가', '고파서', '배를', '먹으며', '배를', '탔다'];
      const context = extractContext(tokens, 2, 3);
      console.log('배를 먹으며 context:', { before: context.before, after: context.after });
      const result = disambiguate('배', context, null);
      console.log('배를 먹으며 result:', result);

      expect(result).not.toBeNull();
      expect(result?.sense.en).toBe('pear');
    });

    it('배가 고파서 → stomach (고프다 트리거)', () => {
      // "배가 고파서 배를 먹으며 배를 탔다"
      // 첫번째 배가 (index 0) → 고파서 다음 → stomach
      const tokens = ['배가', '고파서', '배를', '먹으며', '배를', '탔다'];
      const context = extractContext(tokens, 0, 3);
      console.log('배가 고파서 context:', { before: context.before, after: context.after });
      const result = disambiguate('배', context, null);
      console.log('배가 고파서 result:', result);

      expect(result).not.toBeNull();
      expect(result?.sense.en).toBe('stomach');
    });

    it('배를 탔다 → boat (타다 트리거)', () => {
      // "배가 고파서 배를 먹으며 배를 탔다"
      // 세번째 배를 (index 4) → 탔다 다음 → boat
      const tokens = ['배가', '고파서', '배를', '먹으며', '배를', '탔다'];
      const context = extractContext(tokens, 4, 3);
      console.log('배를 탔다 context:', { before: context.before, after: context.after });
      const result = disambiguate('배', context, null);
      console.log('배를 탔다 result:', result);

      expect(result).not.toBeNull();
      expect(result?.sense.en).toBe('boat');
    });

    it('눈을 감았다 → eye (감다 트리거)', () => {
      // "눈이 내려서 눈을 감았다"
      // 두번째 눈을 (index 2) → 감았다 다음 → eye
      const tokens = ['눈이', '내려서', '눈을', '감았다'];
      const context = extractContext(tokens, 2, 3);
      console.log('눈을 감았다 context:', { before: context.before, after: context.after });
      const result = disambiguate('눈', context, null);
      console.log('눈을 감았다 result:', result);

      expect(result).not.toBeNull();
      expect(result?.sense.en).toBe('eye');
    });
  });
});

// ========================================
// 연어 테스트
// ========================================
describe('Collocation - 연어', () => {
  describe('findCollocations', () => {
    it('결정을 내리다 → make a decision', () => {
      const tokens = ['결정을', '내렸어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('make a decision');
    });

    it('사진을 찍다 → take a photo', () => {
      const tokens = ['사진을', '찍었어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('take a photo');
    });

    it('비가 오다 → rain falls', () => {
      const tokens = ['비가', '와요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('rain falls');
    });

    it('눈이 내리다 → snow falls', () => {
      const tokens = ['눈이', '내려요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('snow falls');
    });

    it('바람이 불다 → wind blows', () => {
      const tokens = ['바람이', '불어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('wind blows');
    });

    it('숙제를 하다 → do homework', () => {
      const tokens = ['숙제를', '했어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('do homework');
    });

    it('시험을 보다 → take an exam', () => {
      const tokens = ['시험을', '봤어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('take an exam');
    });

    it('약속을 지키다 → keep a promise', () => {
      const tokens = ['약속을', '지켰어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('keep a promise');
    });

    it('전화를 걸다 → make a call', () => {
      const tokens = ['전화를', '걸었어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('make a call');
    });

    it('실수를 하다 → make a mistake', () => {
      const tokens = ['실수를', '했어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('make a mistake');
    });

    it('주의를 기울이다 → pay attention', () => {
      const tokens = ['주의를', '기울여요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(1);
      expect(matches[0]?.collocation.en).toBe('pay attention');
    });

    it('간격 있는 연어 매칭 (조사 끼어있음)', () => {
      const tokens = ['결정을', '정말', '내렸어요'];
      const matches = findCollocations(tokens, 2);

      expect(matches.length).toBe(1);
      expect(matches[0]?.startIndex).toBe(0);
      expect(matches[0]?.endIndex).toBe(2);
    });

    it('연어 없는 문장', () => {
      const tokens = ['나는', '학교에', '갔다'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(0);
    });

    it('여러 연어 매칭', () => {
      const tokens = ['비가', '오고', '바람이', '불어요'];
      const matches = findCollocations(tokens);

      expect(matches.length).toBe(2);
    });
  });
});

// ========================================
// 주제 탐지 테스트
// ========================================
describe('Topic Detection - 주제 탐지', () => {
  describe('getTopDomain', () => {
    it('건강/신체 도메인 탐지', () => {
      const domain = getTopDomain('배가 아파서 병원에 갔어요');
      expect(domain).toBe('body');
    });

    it('날씨 도메인 탐지', () => {
      const domain = getTopDomain('오늘 비가 오고 바람이 불어요');
      expect(domain).toBe('weather');
    });

    it('음식 도메인 탐지', () => {
      const domain = getTopDomain('맛있는 음식을 먹었어요');
      expect(domain).toBe('food');
    });

    it('교통 도메인 탐지', () => {
      const domain = getTopDomain('버스를 타고 역에 갔어요');
      expect(domain).toBe('transport');
    });

    it('교육 도메인 탐지', () => {
      const domain = getTopDomain('학교에서 공부하고 시험을 봤어요');
      expect(domain).toBe('education');
    });

    it('비즈니스 도메인 탐지', () => {
      const domain = getTopDomain('회사에서 회의하고 거래를 했어요');
      expect(domain).toBe('business');
    });

    it('감정 도메인 탐지', () => {
      const domain = getTopDomain('기쁘고 행복해요');
      expect(domain).toBe('emotion');
    });
  });

  describe('detectDomains', () => {
    it('복합 도메인 탐지', () => {
      const domains = detectDomains('학교 버스를 타고 시험을 보러 갔어요');

      // 교육과 교통 도메인이 모두 탐지되어야 함
      const domainNames = domains.map((d) => d.domain);
      expect(domainNames).toContain('education');
      expect(domainNames).toContain('transport');
    });

    it('매칭된 키워드 확인', () => {
      const domains = detectDomains('배가 아파요');
      const bodyDomain = domains.find((d) => d.domain === 'body');

      expect(bodyDomain).toBeDefined();
      // '아파요' 문장에서 '아파' 키워드가 매칭됨
      expect(bodyDomain?.matchedKeywords).toContain('아파');
    });
  });

  describe('getDomainHint', () => {
    it('도메인 힌트 생성', () => {
      const hint = getDomainHint('배가 아파서 병원에 갔어요');

      expect(hint.primary).toBe('body');
      expect(hint.confidence).toBeGreaterThan(0);
    });

    it('도메인 없는 경우', () => {
      const hint = getDomainHint('안녕하세요');

      expect(hint.primary).toBeNull();
      expect(hint.confidence).toBe(0);
    });
  });
});

// ========================================
// 통합 테스트 - WSD + 도메인
// ========================================
describe('Integration - WSD + Domain', () => {
  it('도메인 힌트로 WSD 정확도 향상', () => {
    // 건강 문맥에서 '배'
    const tokens1 = ['배가', '아파요'];
    const context1 = extractContext(tokens1, 0, 3);
    const topDomain1 = getTopDomain(tokens1.join(' '));
    const result1 = disambiguate('배', context1, topDomain1);

    expect(result1?.sense.en).toBe('stomach');

    // 교통 문맥에서 '배'
    const tokens2 = ['배를', '타고', '바다에', '갔어요'];
    const context2 = extractContext(tokens2, 0, 3);
    const topDomain2 = getTopDomain(tokens2.join(' '));
    const result2 = disambiguate('배', context2, topDomain2);

    expect(result2?.sense.en).toBe('boat');

    // 음식 문맥에서 '배'
    const tokens3 = ['과일', '배가', '달아요'];
    const context3 = extractContext(tokens3, 1, 3);
    const topDomain3 = getTopDomain(tokens3.join(' '));
    const result3 = disambiguate('배', context3, topDomain3);

    expect(result3?.sense.en).toBe('pear');
  });

  it('눈 - 도메인 기반 구분', () => {
    // 신체 문맥
    const result1 = getWordSense('눈', '눈을 감고 쉬세요');
    expect(result1).toBe('eye');

    // 날씨 문맥
    const result2 = getWordSense('눈', '겨울에 눈이 많이 와요');
    expect(result2).toBe('snow');
  });

  it('차 - 도메인 기반 구분', () => {
    // 교통 문맥
    const result1 = getWordSense('차', '차를 타고 출근했어요');
    expect(result1).toBe('car');

    // 음식 문맥
    const result2 = getWordSense('차', '따뜻한 차를 마셨어요');
    expect(result2).toBe('tea');
  });
});
