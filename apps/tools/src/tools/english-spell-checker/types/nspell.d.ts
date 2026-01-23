/**
 * Type declarations for nspell
 * https://github.com/wooorm/nspell
 */

declare module 'nspell' {
  interface NSpell {
    /** Check if a word is correctly spelled */
    correct(word: string): boolean;
    /** Get spelling suggestions for a word */
    suggest(word: string): string[];
    /** Add a word to the dictionary */
    add(word: string): this;
    /** Remove a word from the dictionary */
    remove(word: string): this;
    /** Get personal dictionary words */
    personal(): string[];
    /** Get word information */
    wordCharacters(): string | null;
    /** Spell check (alias for correct) */
    spell(word: string): boolean;
  }

  type NSpellFactory = (aff: Buffer | string, dic?: Buffer | string) => NSpell;

  const nspell: NSpellFactory;
  export default nspell;
}

declare module 'dictionary-en' {
  type DictionaryCallback = (err: Error | null, result: { aff: Buffer; dic: Buffer }) => void;

  const dictionary: (callback: DictionaryCallback) => void;
  export default dictionary;
}
