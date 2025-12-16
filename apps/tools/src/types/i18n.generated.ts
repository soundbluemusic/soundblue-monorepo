// ========================================
// i18n Types - 자동 생성된 번역 타입
// ========================================
// 이 파일은 messages/*.json 파일 구조를 기반으로 합니다.
// 타입 안전한 번역 키 접근을 제공합니다.

/**
 * 지원되는 로케일
 */
export type Locale = 'ko' | 'en';

/**
 * 번역 메시지 구조
 */
export interface Messages {
  brand: string;
  common: {
    error: string;
    retry: string;
    close: string;
    save: string;
    copy: string;
    menu: string;
  };
  sidebar: {
    open: string;
    close: string;
    expand: string;
    collapse: string;
    tools: string;
    more: string;
    sitemap: string;
    benchmark: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  navigation: {
    home: string;
    builtWith: string;
  };
  tools: {
    metronome: string;
    drumMachine: string;
    qrGenerator: string;
    translator: string;
    placeholder: {
      title: string;
      subtitle: string;
    };
    closeTool: string;
    leaveWarning: string;
    shareUrl: string;
    urlCopied: string;
  };
  metronome: {
    measure: string;
    elapsedTime: string;
    remainingTime: string;
    timeSignature: string;
    volume: string;
    timer: string;
    syncOn: string;
    syncOff: string;
  };
  drumMachine: {
    syncingWith: string;
    syncDisabled: string;
    metronome: string;
  };
  qr: {
    generationFailed: string;
    inputPlaceholder: string;
    foreground: string;
    background: string;
  };
  builtWith: {
    intro: string;
    framework: string;
    deployment: string;
    devTools: string;
    aiAssistant: string;
    uiux: string;
    browserApi: string;
    audioEngine: string;
    comingSoon: string;
    webStandardsLayout: string;
    darkLightMode: string;
    responsiveDesign: string;
  };
  chat: {
    title: string;
    inputPlaceholder: string;
    send: string;
    welcome: string;
  };
  language: {
    switchTo: string;
  };
  benchmark: {
    title: string;
    description: string;
    overallScore: string;
    toolResults: string;
    passed: string;
    warnings: string;
    failed: string;
    suggestedImprovements: string;
    note: string;
    runTest: string;
    runQuickTest: string;
    running: string;
    testComplete: string;
    grade: string;
    passRate: string;
    totalTests: string;
    executionTime: string;
    criteriaScores: string;
    categoryResults: string;
    improvements: string;
    viewDetails: string;
    hideDetails: string;
    criteria: {
      accuracy: string;
      fluency: string;
      context: string;
      cultural: string;
      consistency: string;
      tone: string;
      domain: string;
    };
    metrics: {
      timing: string;
      cpuUsage: string;
      memoryUsage: string;
      renderTime: string;
      responseTime: string;
      accuracy: string;
    };
  };
}

/**
 * 번역 키 경로 타입
 * @example type Key = TranslationKey; // "common.error" | "sidebar.open" | ...
 */
type NestedKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? NestedKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeys<Messages>;

/**
 * 번역 값 타입 가져오기
 */
type GetNestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? GetNestedValue<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

export type TranslationValue<K extends TranslationKey> = GetNestedValue<Messages, K>;
