import { Link, Meta, MetaProvider } from '@solidjs/meta';
import { Router, type RouteSectionProps, useIsRouting } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { type JSX, Show, Suspense } from 'solid-js';
import { AppErrorBoundary } from '~/components/ErrorBoundary';
import { OfflineIndicator } from '~/components/pwa';
import { I18nProvider } from '~/components/providers/I18nProvider';
import { KeyboardShortcutsProvider } from '~/components/providers/KeyboardShortcutsProvider';
import { ThemeProvider } from '~/components/providers/ThemeProvider';
import './global.css';

function RoutingIndicator(): JSX.Element {
  const isRouting = useIsRouting();

  return (
    <Show when={isRouting()}>
      <div class="routing-indicator" aria-hidden="true" />
    </Show>
  );
}

export default function App(): JSX.Element {
  return (
    <Router
      root={(props: RouteSectionProps) => (
        <MetaProvider>
          {/* Base meta tags - page-specific SEO handled by PageSeo component */}
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta name="theme-color" content="#d97757" />

          {/* DNS prefetch for external resources */}
          <Link rel="dns-prefetch" href="https://www.youtube.com" />
          <Link rel="dns-prefetch" href="https://soundblue.music" />
          <Link rel="preconnect" href="https://static.cloudflareinsights.com" />

          <ThemeProvider>
            <I18nProvider>
              <KeyboardShortcutsProvider>
                <AppErrorBoundary>
                  <OfflineIndicator />
                  <RoutingIndicator />
                  <Suspense fallback={<PageLoader />}>{props.children}</Suspense>
                </AppErrorBoundary>
              </KeyboardShortcutsProvider>
            </I18nProvider>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

function PageLoader(): JSX.Element {
  return (
    <div class="page-loader">
      <div class="loader-spinner" />
    </div>
  );
}
