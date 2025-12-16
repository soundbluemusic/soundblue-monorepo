// 문법 모듈 테스트
import { describe, expect, it } from 'vitest';
import { generateEnglish } from './english-generator';
import { analyzeMorpheme, analyzeTokens } from './morpheme-analyzer';
import { parseSentence } from './sentence-parser';

describe('형태소 분석기', () => {
  it('좋아요 분석', () => {
    const result = analyzeMorpheme('좋아요');
    console.log('좋아요 분석:', result);
    expect(result.stem).toBe('좋');
    expect(result.ending).toBe('아요');
    expect(result.pos).toBe('verb');
    expect(result.role).toBe('predicate');
  });

  it('먹었어요 분석', () => {
    const result = analyzeMorpheme('먹었어요');
    console.log('먹었어요 분석:', result);
    expect(result.stem).toBe('먹');
    expect(result.tense).toBe('past');
  });

  it('학생입니다 분석', () => {
    const result = analyzeMorpheme('학생입니다');
    console.log('학생입니다 분석:', result);
    expect(result.stem).toBe('학생');
    expect(result.ending).toBe('입니다');
  });

  it('날씨가 분석', () => {
    const result = analyzeMorpheme('날씨가');
    console.log('날씨가 분석:', result);
    expect(result.stem).toBe('날씨');
    expect(result.particle).toBe('가');
    expect(result.role).toBe('subject');
  });

  it('가요 분석', () => {
    const result = analyzeMorpheme('가요');
    console.log('가요 분석:', result);
    expect(result.stem).toBe('가');
  });
});

describe('문장 구조 분석', () => {
  it('오늘 날씨가 좋아요', () => {
    const parsed = parseSentence('오늘 날씨가 좋아요');
    console.log('문장 구조:', {
      subject: parsed.subject?.text,
      predicate: parsed.predicate?.text,
      predicateStem: parsed.predicate?.tokens[0]?.stem,
      tense: parsed.tense,
      pattern: parsed.pattern,
    });
    expect(parsed.subject?.text).toBe('날씨가'); // "오늘" is a separate modifier
    expect(parsed.predicate?.text).toBe('좋아요');
  });

  it('저는 학생입니다', () => {
    const parsed = parseSentence('저는 학생입니다');
    console.log('문장 구조:', {
      subject: parsed.subject?.text,
      predicate: parsed.predicate?.text,
      pattern: parsed.pattern,
    });
    expect(parsed.pattern).toBe('SVC');
  });
});

describe('영어 문장 생성', () => {
  it('오늘 날씨가 좋아요 → Today the weather is good', () => {
    const parsed = parseSentence('오늘 날씨가 좋아요');
    const result = generateEnglish(parsed);
    console.log('번역 결과:', result);
    // 형용사 + be동사 패턴 검증
    expect(result.toLowerCase()).toContain('is');
    expect(result.toLowerCase()).toContain('good');
  });

  it('저는 학생입니다 → I am a student', () => {
    const parsed = parseSentence('저는 학생입니다');
    const result = generateEnglish(parsed);
    console.log('번역 결과:', result);
    expect(result).toBe('I am a student');
  });

  it('밥을 먹었어요 → I ate rice', () => {
    const parsed = parseSentence('밥을 먹었어요');
    const result = generateEnglish(parsed);
    console.log('번역 결과:', result);
    expect(result).toBe('I ate rice');
  });

  it('저는 사운드블루 입니다 → I am SoundBlue', () => {
    const parsed = parseSentence('저는 사운드블루 입니다');
    const result = generateEnglish(parsed);
    console.log('번역 결과:', result);
    expect(result.toLowerCase()).toContain('i am');
    expect(result.toLowerCase()).toContain('soundblue');
  });

  it('안녕하세요 저는 사운드블루 입니다 → Hello. I am SoundBlue', () => {
    const parsed = parseSentence('안녕하세요 저는 사운드블루 입니다');
    console.log('구문 분석:', {
      constituents: parsed.constituents.map((c) => ({ text: c.text, role: c.role })),
      modifiers: parsed.modifiers.map((m) => m.text),
      subject: parsed.subject?.text,
      predicate: parsed.predicate?.text,
    });
    const result = generateEnglish(parsed);
    console.log('번역 결과:', result);
    expect(result.toLowerCase()).toContain('hello');
    expect(result.toLowerCase()).toContain('i am');
    expect(result.toLowerCase()).toContain('soundblue');
  });
});
