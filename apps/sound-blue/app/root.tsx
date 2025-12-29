import {
  getLocaleFromPath,
  MusicGroupStructuredData,
  ThemeProvider,
  ToastContainer,
  WebSiteStructuredData,
} from '@soundblue/shared-react';
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
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://www.youtube.com' },
  { rel: 'dns-prefetch', href: 'https://soundblue.music' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4A9E95" />
        <Meta />
        <Links />
        {/* JSON-LD Structured Data for SEO */}
        <WebSiteStructuredData
          name="Sound Blue"
          url="https://soundbluemusic.com"
          description="Music Artist & Producer - Official Website"
          inLanguage={['en', 'ko']}
        />
        <MusicGroupStructuredData
          name="Sound Blue"
          url="https://soundbluemusic.com"
          description="Music Artist & Producer"
          genre={['Electronic', 'Ambient', 'Experimental']}
          sameAs={['https://www.youtube.com/@soundbluemusic', 'https://soundblue.music']}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sound-blue-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
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
    <ThemeProvider storageKey="sound-blue-theme" defaultTheme="system">
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

  // Sync Paraglide locale with URL (in effect to avoid render-time side effects)
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    safeSetLocale(locale);
  }, [location.pathname]);

  let message = m['common.errorTitle']();
  let details = m['common.errorUnexpected']();

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? m['notFound.code']() : m['common.errorGeneric']();
    details = error.status === 404 ? m['notFound.message']() : error.statusText || details;
  }

  return (
    <main className="error-page">
      <div className="error-content">
        <h1 className="error-title">{message}</h1>
        <p className="error-message">{details}</p>
        <a href="/" className="error-link">
          {m['notFound.backHome']()}
        </a>
      </div>
    </main>
  );
}
