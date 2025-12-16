// ========================================
// Logger Utility - DEV 환경 전용 로깅
// ========================================
// 프로덕션에서는 출력하지 않음

const isDev = import.meta.env.DEV;

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

export const logger: Logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
  },
  group: (label) => {
    if (isDev) console.group(label);
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
};
