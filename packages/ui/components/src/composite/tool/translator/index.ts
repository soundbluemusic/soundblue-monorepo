export * from './benchmark-data';
// D1 데이터 주입 함수 (앱에서 loader 데이터를 번역기에 전달할 때 사용)
export { type DictionaryData, injectDictionaryData } from './dictionary/external';
export * from './settings';
export { Translator, type TranslatorMessages } from './Translator';
export * from './translator-service';
