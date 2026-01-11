/**
 * Korean Spell Checker - Settings
 * 한국어 맞춤법 검사기 설정
 */

export interface SpellCheckerSettings {
  /** 띄어쓰기 검사 활성화 */
  checkSpacing: boolean;
  /** 오타 검사 활성화 */
  checkTypo: boolean;
  /** 문법 검사 활성화 */
  checkGrammar: boolean;
  /** 마지막 입력 텍스트 */
  lastInput: string;
}

export const defaultSpellCheckerSettings: SpellCheckerSettings = {
  checkSpacing: true,
  checkTypo: true,
  checkGrammar: true,
  lastInput: '',
};

export const spellCheckerMeta = {
  id: 'spellChecker',
  slug: 'spell-checker',
  name: { ko: '한국어 맞춤법 검사기', en: 'Korean Spell Checker' },
  description: {
    ko: '한국어 맞춤법, 띄어쓰기, 문법 검사',
    en: 'Check Korean spelling, spacing, and grammar',
  },
  icon: '✏️',
  category: 'text' as const,
  defaultSize: 'lg' as const,
  tags: ['korean', 'spelling', 'grammar', 'proofreading', '맞춤법', '띄어쓰기'],
};
