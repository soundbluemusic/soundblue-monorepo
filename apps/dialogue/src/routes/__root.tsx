import { getLocaleFromPath } from '@soundblue/i18n';
import { SoftwareApplicationStructuredData, WebSiteStructuredData } from '@soundblue/seo';
import { ColorblindProvider, ThemeProvider, ToastContainer } from '@soundblue/ui-components/base';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import m from '~/lib/messages';
import { setLocale } from '~/paraglide/runtime';

import '../app.css';

/**
 * Safely set locale for both SSR and client
 */
function safeSetLocale(locale: 'en' | 'ko') {
  try {
    if (typeof setLocale === 'function') {
      setLocale(locale);
    }
  } catch (error: unknown) {
    // Ignore errors during SSR/prerendering
    console.debug('setLocale error (expected during SSR):', error);
  }
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // Search Engine Verification
      { name: 'google-site-verification', content: 'mw0M1q-2K63FX-NZCL5AetN7V6VI6cXY5ItnMXyl85A' },
      // Naver/Bing 인증은 dialogue.soundbluemusic.com 도메인으로 웹마스터 등록 후 추가
      // 1. Naver: https://searchadvisor.naver.com/ → 사이트 추가 → 메타태그 인증
      // 2. Bing: https://www.bing.com/webmasters → 사이트 추가 → 메타태그 인증
    ],
    links: [
      { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootLayout,
  pendingComponent: PendingFallback,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
});

function PendingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
    </div>
  );
}

function RootLayout() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Sync Paraglide locale with URL
  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
    safeSetLocale(locale);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* JSON-LD Structured Data for SEO */}
        <WebSiteStructuredData
          name="Dialogue"
          url="https://dialogue.soundbluemusic.com"
          description="Offline Q&A learning tool with instant answers"
          inLanguage={['en', 'ko']}
        />
        <SoftwareApplicationStructuredData
          name="Dialogue"
          url="https://dialogue.soundbluemusic.com"
          description="A conversational learning tool that works 100% offline. Instant Q&A answers without internet connection."
          applicationCategory="EducationalApplication"
          operatingSystem="Web Browser"
          offers={{ price: '0', priceCurrency: 'USD' }}
        />
        {/* Inline script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('dialogue-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) { /* localStorage unavailable in SSR */ }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider storageKey="dialogue-theme" defaultTheme="system">
          <ColorblindProvider storageKey="dialogue-colorblind">
            <Outlet />
            <ToastContainer position="bottom-right" />
          </ColorblindProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const locale = getLocaleFromPath(pathname);
  safeSetLocale(locale);

  const message = 'Oops!';
  const details = error?.message || 'An unexpected error occurred.';
  const stack = import.meta.env.DEV ? error?.stack : undefined;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="error-page">
          <div className="error-content">
            <h1 className="error-title">{message}</h1>
            <p className="error-message">{details}</p>
            <a href="/" className="error-link">
              {m['app.notFoundBackHome']()}
            </a>
            {stack && (
              <pre className="error-stack">
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const locale = getLocaleFromPath(pathname);
  safeSetLocale(locale);

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <title>404 - Page Not Found | Dialogue</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <main className="error-page">
          <div className="error-content">
            <h1 className="error-title">404</h1>
            <p className="error-message">{m['app.notFoundMessage']?.() || 'Page not found'}</p>
            <a href="/" className="error-link">
              {m['app.notFoundBackHome']()}
            </a>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
