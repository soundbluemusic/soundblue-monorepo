// ========================================
// Programming Languages - 프로그래밍 언어
// ========================================

export const TECH_LANGUAGES_KO_EN: Record<string, string> = {
  자바스크립트: 'JavaScript',
  타입스크립트: 'TypeScript',
  파이썬: 'Python',
  자바: 'Java',
  코틀린: 'Kotlin',
  스위프트: 'Swift',
  '오브젝티브-C': 'Objective-C',
  고: 'Go',
  러스트: 'Rust',
  루비: 'Ruby',
  펄: 'Perl',
  스칼라: 'Scala',
  클로저: 'Clojure',
  하스켈: 'Haskell',
  얼랭: 'Erlang',
  엘릭서: 'Elixir',
  다트: 'Dart',
  루아: 'Lua',
  줄리아: 'Julia',
  매트랩: 'MATLAB',
  '셸 스크립트': 'shell script',
  배시: 'Bash',
  파워셸: 'PowerShell',
  사스: 'Sass',
  레스: 'Less',
  웹어셈블리: 'WebAssembly',
  어셈블리: 'Assembly',
  코볼: 'COBOL',
  포트란: 'Fortran',
  솔리디티: 'Solidity',
  지그: 'Zig',
  님: 'Nim',
  브이: 'V',
  크리스탈: 'Crystal',
};

export const TECH_LANGUAGES_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_LANGUAGES_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
