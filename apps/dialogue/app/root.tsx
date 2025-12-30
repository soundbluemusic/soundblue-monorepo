import { getLocaleFromPath } from '@soundblue/i18n';
import { WebSiteStructuredData } from '@soundblue/seo';
import { ThemeProvider, ToastContainer } from '@soundblue/ui-components/base';
import { useEffect } from 'react';
import type { LinksFunction } from 'react-router';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from 'react-router';
import m from '~/lib/messages';
import { setLocale } from '~/paraglide/runtime';

import './app.css';

/**
 * Safely set locale for both SSR and client
 */
function safeSetLocale(locale: 'en' | 'ko') {
  try {
    if (typeof setLocale === 'function') {
      setLocale(locale);
    }
  } catch (error) {
    // Ignore errors during SSR/prerendering
    console.debug('setLocale error (expected during SSR):', error);
  }
}

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.png', type: 'image/png' },
  { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
  { rel: 'manifest', href: '/manifest.json' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* JSON-LD Structured Data for SEO */}
        <WebSiteStructuredData
          name="Dialogue"
          url="https://dialogue.soundbluemusic.com"
          description="Offline Q&A learning tool with instant answers"
          inLanguage={['en', 'ko']}
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
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const location = useLocation();

  // Sync Paraglide locale with URL
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    safeSetLocale(locale);
  }, [location.pathname]);

  return (
    <ThemeProvider storageKey="dialogue-theme" defaultTheme="system">
      <Outlet />
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}

export default function App() {
  return <AppContent />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();

  // Sync Paraglide locale with URL
  const locale = getLocaleFromPath(location.pathname);
  safeSetLocale(locale);

  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? m['app.notFoundCode']() : 'Error';
    details = error.status === 404 ? m['app.notFoundMessage']() : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
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
  );
}
