// ========================================
// Development Tools - 개발 도구
// ========================================

export const TECH_TOOLS_KO_EN: Record<string, string> = {
  // === IDE / 에디터 (IDE / Editors) ===
  '코드 에디터': 'code editor',
  '비주얼 스튜디오': 'Visual Studio',
  인텔리제이: 'IntelliJ IDEA',
  웹스톰: 'WebStorm',
  파이참: 'PyCharm',
  이클립스: 'Eclipse',
  넷빈즈: 'NetBeans',
  엑스코드: 'Xcode',
  '안드로이드 스튜디오': 'Android Studio',
  빔: 'Vim',
  네오빔: 'Neovim',
  이맥스: 'Emacs',
  '서브라임 텍스트': 'Sublime Text',
  아톰: 'Atom',
  커서: 'Cursor',
  윈드서프: 'Windsurf',
  제드: 'Zed',

  // === 터미널 / 셸 (Terminal / Shell) ===
  터미널: 'terminal',
  콘솔: 'console',
  '커맨드 라인': 'command line',
  셸: 'shell',
  피시: 'Fish',
  하이퍼: 'Hyper',
  워프: 'Warp',
  '윈도우 터미널': 'Windows Terminal',

  // === 패키지 매니저 (Package Managers) ===
  '패키지 매니저': 'package manager',
  번: 'Bun',
  콘다: 'Conda',
  포이트리: 'Poetry',
  메이븐: 'Maven',
  그래들: 'Gradle',
  코코아팟: 'CocoaPods',
  카르타고: 'Carthage',
  '스위프트 패키지 매니저': 'Swift Package Manager',
  컴포저: 'Composer',
  젬: 'Gem',
  번들러: 'Bundler',
  카고: 'Cargo',
  '고 모듈': 'Go Modules',
  너겟: 'NuGet',
  홈브류: 'Homebrew',
  쇼콜라티: 'Chocolatey',

  // === 빌드 도구 (Build Tools) ===
  '빌드 도구': 'build tool',
  '빌드 시스템': 'build system',
  메이크: 'Make',
  메이크파일: 'Makefile',
  앤트: 'Ant',
  바젤: 'Bazel',
  닌자: 'Ninja',
  '태스크 러너': 'task runner',
  걸프: 'Gulp',
  그런트: 'Grunt',

  // === 디버깅 (Debugging) ===
  디버깅: 'debugging',
  디버거: 'debugger',
  브레이크포인트: 'breakpoint',
  '스텝 오버': 'step over',
  '스텝 인투': 'step into',
  '스텝 아웃': 'step out',
  컨티뉴: 'continue',
  워치: 'watch',
  '변수 인스펙터': 'variable inspector',
  '콘솔 로그': 'console log',
  '코어 덤프': 'core dump',
  '메모리 누수': 'memory leak',
  프로파일링: 'profiling',
  프로파일러: 'profiler',
  '성능 분석': 'performance analysis',
  '크롬 개발자 도구': 'Chrome DevTools',
  '리액트 개발자 도구': 'React DevTools',
};

export const TECH_TOOLS_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_TOOLS_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
