/**
 * 번역기 설정 (v2)
 */

export type TranslationDirection = 'ko-en' | 'en-ko';

/**
 * 어조/격식 설정
 *
 * - casual: 반말 (커피 좋아해?)
 * - formal: 존댓말 (커피 좋아하세요?)
 * - neutral: 상관없음 - 기본값 (커피 좋아하니?)
 * - friendly: 친근체 (커피 좋아해~?)
 * - literal: 번역체 (당신은 커피를 좋아합니까?)
 */
export type Formality = 'casual' | 'formal' | 'neutral' | 'friendly' | 'literal';

export interface TranslatorSettings {
  direction: TranslationDirection;
  formality: Formality;
  lastInput?: string;
}

export const defaultTranslatorSettings: TranslatorSettings = {
  direction: 'ko-en',
  formality: 'neutral',
  lastInput: '',
};

/**
 * 어조 옵션 정의 (UI용)
 */
export const FORMALITY_OPTIONS: Array<{
  value: Formality;
  labelKo: string;
  labelEn: string;
}> = [
  { value: 'casual', labelKo: '반말', labelEn: 'Casual' },
  { value: 'formal', labelKo: '존댓말', labelEn: 'Formal' },
  { value: 'neutral', labelKo: '상관없음', labelEn: 'Neutral' },
  { value: 'friendly', labelKo: '친근체', labelEn: 'Friendly' },
  { value: 'literal', labelKo: '번역체', labelEn: 'Literal' },
];
