import { getLocaleFromPath } from '@soundblue/i18n';
import { WebSiteStructuredData } from '@soundblue/seo';
import { ColorblindProvider, ThemeProvider, ToastContainer } from '@soundblue/ui-components/base';
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router';
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
      { name: 'theme-color', content: '#3b82f6' },
      // Search engine verification
      { name: 'google-site-verification', content: 'mw0M1q-2K63FX-NZCL5AetN7V6VI6cXY5ItnMXyl85A' },
      { name: 'naver-site-verification', content: 'd2e5722513ceb03e1afeac65bab53416c217ca72' },
      { name: 'msvalidate.01', content: '2555E807B2875180F8DAC1EB5D284D3D' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
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
  const location = useLocation();

  // Sync Paraglide locale with URL
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    safeSetLocale(locale);
  }, [location.pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* JSON-LD Structured Data for SEO */}
        <WebSiteStructuredData
          name="Tools - SoundBlueMusic"
          url="https://tools.soundbluemusic.com"
          description="Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators"
          inLanguage={['en', 'ko']}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('tools-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) { /* localStorage unavailable in SSR */ }
              })();
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider storageKey="tools-theme" defaultTheme="system">
          <ColorblindProvider storageKey="tools-colorblind">
            <Outlet />
            <ToastContainer position="bottom-right" />
          </ColorblindProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  const location = useLocation();

  // Sync Paraglide locale with URL
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    safeSetLocale(locale);
  }, [location.pathname]);

  const message = m['common_errorTitle']?.() || 'Error';
  const details =
    error?.message || m['common_errorUnexpected']?.() || 'An unexpected error occurred';

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
              {m['notFound_backHome']?.() || 'Back to Home'}
            </a>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  const location = useLocation();

  // Sync Paraglide locale with URL
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    safeSetLocale(locale);
  }, [location.pathname]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <title>404 - Page Not Found | Tools</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <main className="error-page">
          <div className="error-content">
            <h1 className="error-title">404</h1>
            <p className="error-message">{m['notFound_message']?.() || 'Page not found'}</p>
            <a href="/" className="error-link">
              {m['notFound_backHome']?.() || 'Back to Home'}
            </a>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
