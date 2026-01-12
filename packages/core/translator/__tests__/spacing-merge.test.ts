import { describe, expect, it } from 'vitest';
import {
  correctSpacing,
  correctSpacingFull,
  mergeWrongSpacing,
  recoverSpacing,
} from '../src/correction/spacing-rules';

describe('mergeWrongSpacing - 잘못 띄어쓴 텍스트 합치기', () => {
  it('안 녕 하 세 요 → 안녕하세요', () => {
    const result = mergeWrongSpacing('안 녕 하 세 요');
    expect(result.merged).toBe('안녕하세요');
  });

  it('감 사 합 니 다 → 감사합니다', () => {
    const result = mergeWrongSpacing('감 사 합 니 다');
    expect(result.merged).toBe('감사합니다');
  });

  it('이미 올바른 텍스트는 유지', () => {
    const result = mergeWrongSpacing('안녕하세요');
    expect(result.merged).toBe('안녕하세요');
  });

  it('혼합된 경우 처리 (1글자 + 다글자)', () => {
    const result = mergeWrongSpacing('나 는 학교에 갔다');
    // "나 는"은 합쳐지고 "학교에", "갔다"는 유지
    expect(result.merged).toContain('학교에');
    expect(result.merged).toContain('갔다');
  });
});

describe('correctSpacingFull - 통합 띄어쓰기 교정', () => {
  it('안 녕 하 세 요 → 안녕하세요', () => {
    const result = correctSpacingFull('안 녕 하 세 요');
    expect(result.corrected).toBe('안녕하세요');
  });

  it('나 는 학 교 에 갔 다 → 합쳐짐', () => {
    const result = correctSpacingFull('나 는 학 교 에 갔 다');
    // 글자별 분리가 합쳐져야 함
    expect(result.corrected).not.toBe('나 는 학 교 에 갔 다');
    expect(result.corrected.split(' ').length).toBeLessThan(7);
  });

  it('붙어쓴 문장 분리: 나는학교에갔다', () => {
    const result = correctSpacingFull('나는학교에갔다');
    // 붙어쓴 문장이 분리되어야 함
    expect(result.corrected.includes(' ')).toBe(true);
  });

  it('이미 올바른 문장 유지', () => {
    const result = correctSpacingFull('안녕하세요');
    expect(result.corrected).toBe('안녕하세요');
  });
});

describe('correctSpacing - 기본 동작', () => {
  it('이미 올바른 텍스트는 유지', () => {
    const result = correctSpacing('안녕하세요');
    expect(result.corrected).toBe('안녕하세요');
  });

  it('의존명사 띄어쓰기: 할수 → 할 수', () => {
    const result = correctSpacing('할수있다');
    // 의존명사 "수" 앞에 띄어쓰기가 추가됨
    expect(result.corrected).toContain('할 수');
  });
});

describe('recoverSpacing - 붙어쓴 문장 분리', () => {
  it('글자별 분리된 텍스트는 처리하지 않음 (mergeWrongSpacing이 처리)', () => {
    const result = recoverSpacing('안 녕 하 세 요');
    // recoverSpacing은 1~2글자 토큰을 그대로 유지
    // 실제 합치기는 mergeWrongSpacing이 담당
    console.log('recoverSpacing 결과:', result.recovered);
  });
});
