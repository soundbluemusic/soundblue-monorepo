/**
 * English Spell Checker Settings
 * 영어 맞춤법 검사기 설정
 */

export interface EnglishSpellCheckerSettings {
  maxSuggestions: number;
  ignoreCase: boolean;
  ignoreNumbers: boolean;
  checkSpelling: boolean;
  checkSpacing: boolean;
  checkGrammar: boolean;
  lastInput?: string;
}

export const defaultEnglishSpellCheckerSettings: EnglishSpellCheckerSettings = {
  maxSuggestions: 5,
  ignoreCase: false,
  ignoreNumbers: true,
  checkSpelling: true,
  checkSpacing: true,
  checkGrammar: true,
  lastInput: '',
};
