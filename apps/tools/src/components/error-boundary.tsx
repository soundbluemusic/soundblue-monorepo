import { createSignal, type JSX, Show, ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { Button } from '~/components/ui/button';

// ========================================
// Error Reporting - 클라이언트 에러 수집
// ========================================

/** Full error report for development logging */
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  componentStack?: string;
}

/** Sanitized error report for production (no sensitive data) */
interface SanitizedErrorReport {
  message: string;
  pathname: string;
  timestamp: string;
  context?: string;
}

// 에러 리포트 전송
function reportError(error: Error, componentStack?: string): void {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    componentStack,
  };

  // Development: log to console with full details
  if (import.meta.env.DEV) {
    console.group('🔴 Error Report');
    console.error('Message:', report.message);
    console.error('Stack:', report.stack);
    if (componentStack) {
      console.error('Component Stack:', componentStack);
    }
    console.error('URL:', report.url);
    console.error('Timestamp:', report.timestamp);
    console.groupEnd();
  }

  // Production: send sanitized report (no stack traces, no full URLs)
  if (import.meta.env.PROD && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    // Only send if HTTPS for security
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      return;
    }

    const sanitizedReport: SanitizedErrorReport = {
      message: error.message.slice(0, 200), // Truncate long messages
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
      context: componentStack ? 'component' : 'global',
    };

    const errorEndpoint = '/api/errors';
    try {
      navigator.sendBeacon(errorEndpoint, JSON.stringify(sanitizedReport));
    } catch {
      // Beacon failed silently - error tracking is best-effort
    }
  }
}

// ========================================
// Error Fallback Components
// ========================================

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback(props: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = createSignal(false);

  // Don't use useLanguage() here - it might not be available if error happens during initialization
  return (
    <div class="flex min-h-50 flex-col items-center justify-center gap-4 rounded-lg border border-red-500/50 dark:border-red-500/30 bg-red-500/10 dark:bg-red-950/30 p-6">
      <div class="text-center">
        <h2 class="text-lg font-semibold text-red-600 dark:text-red-400">오류가 발생했습니다</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {props.error?.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          onClick={props.reset}
          class="rounded border px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          다시 시도
        </button>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails())}
          class="rounded px-4 py-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showDetails() ? '상세 숨기기' : '상세 보기'}
        </button>
      </div>

      <Show when={showDetails() && props.error.stack}>
        <pre class="mt-2 max-h-32 w-full overflow-auto rounded bg-gray-100 dark:bg-gray-800 p-2 text-xs">
          {props.error.stack}
        </pre>
      </Show>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: JSX.Element;
  fallback?: JSX.Element | ((err: Error, reset: () => void) => JSX.Element);
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => {
        // 에러 리포팅
        reportError(err);

        if (props.fallback) {
          return typeof props.fallback === 'function' ? props.fallback(err, reset) : props.fallback;
        }
        return <ErrorFallback error={err} reset={reset} />;
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}

// Tool-specific error boundary with smaller UI
interface ToolErrorBoundaryProps {
  children: JSX.Element;
  toolName?: string;
}

function ToolErrorFallback(props: { toolName?: string; error: Error; reset: () => void }) {
  return (
    <div class="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <span class="text-2xl">⚠️</span>
      <p class="text-sm text-muted-foreground">
        {props.toolName ? `${props.toolName} 로드 실패` : '도구 로드 실패'}
      </p>
      <Button variant="ghost" size="sm" onClick={props.reset}>
        다시 시도
      </Button>
    </div>
  );
}

export function ToolErrorBoundary(props: ToolErrorBoundaryProps) {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => {
        // 도구별 에러 리포팅
        reportError(err, `Tool: ${props.toolName || 'Unknown'}`);
        return <ToolErrorFallback toolName={props.toolName} error={err} reset={reset} />;
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}

// ========================================
// Global Error Handler
// ========================================

// 전역 에러 핸들러 설정 (window.onerror, unhandledrejection)
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // 일반 에러
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ): boolean => {
    reportError(error || new Error(String(message)), `Global: ${source}:${lineno}:${colno}`);
    return false; // 기본 에러 처리 계속
  };

  // Promise rejection
  window.onunhandledrejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    reportError(error, 'Unhandled Promise Rejection');
  };
}
