import { A } from '@solidjs/router';
import { type JSX, type ParentComponent, ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { Button, buttonVariants } from '~/components/ui';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback(props: ErrorFallbackProps): JSX.Element {
  const { t, localizedPath } = useLanguage();

  // Log error for debugging (in production, send to error tracking service)
  console.error('Application Error:', props.error);

  return (
    <main class="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div class="max-w-md">
        <p class="text-6xl font-bold text-content-subtle mb-4">!</p>
        <h1 class="text-2xl font-bold text-content mb-4">{t().common.error}</h1>
        <p class="text-content-muted mb-8">
          {props.error?.message || 'An unexpected error occurred'}
        </p>
        <div class="flex gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => props.reset()}>
            {t().common.tryAgain}
          </Button>
          <A href={localizedPath('/')} class={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            {t().notFound.backHome}
          </A>
        </div>
      </div>
    </main>
  );
}

export const AppErrorBoundary: ParentComponent = (props): JSX.Element => {
  return (
    <SolidErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
      {props.children}
    </SolidErrorBoundary>
  );
};
