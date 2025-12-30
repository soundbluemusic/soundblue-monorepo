/**
 * 번역기 설정 (v2)
 */

export type TranslationDirection = 'ko-en' | 'en-ko';

export interface TranslatorSettings {
  direction: TranslationDirection;
  lastInput?: string;
}

export const defaultTranslatorSettings: TranslatorSettings = {
  direction: 'ko-en',
  lastInput: '',
};
