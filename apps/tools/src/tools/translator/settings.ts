/**
 * Translator Settings
 *
 * Local copy of settings to avoid loading the entire @soundblue/ui-components bundle.
 * Keep in sync with packages/ui/components/src/composite/tool/translator/settings.ts
 */

export type TranslationDirection = 'ko-en' | 'en-ko';

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
