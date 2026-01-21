import { getLocaleFromPath } from '@soundblue/i18n';
import { SoftwareApplicationStructuredData, WebSiteStructuredData } from '@soundblue/seo';
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
  } catch (error: unknown) {
    // Ignore errors during SSR/prerendering
    console.debug('setLocale error (expected during SSR):', error);
  }
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google" content="notranslate" />
        {/* Search Engine Verification */}
        <meta
          name="google-site-verification"
          content="mw0M1q-2K63FX-NZCL5AetN7V6VI6cXY5ItnMXyl85A"
        />
        <meta name="naver-site-verification" content="0d06d3e004cd38146df5d501e660bff8f39fb8ed" />
        {/* TODO: Bing Webmaster에서 tools.soundbluemusic.com 인증 후 실제 코드로 교체 */}
        <meta name="msvalidate.01" content="TOOLS_BING_VERIFICATION_CODE" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <Meta />
        <Links />
        {/* JSON-LD Structured Data for SEO */}
        <WebSiteStructuredData
          name="Sound Blue Tools"
          url="https://tools.soundbluemusic.com"
          description="Free music tools - Metronome, Drum Machine, QR Generator, Translator"
          inLanguage={['en', 'ko']}
        />
        <SoftwareApplicationStructuredData
          name="Sound Blue Music Tools"
          url="https://tools.soundbluemusic.com"
          description="Free online music tools including metronome, drum machine, QR code generator, and translator"
          applicationCategory="MusicApplication"
          offers={{ price: '0', priceCurrency: 'USD' }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Set lang attribute based on URL
                  var path = window.location.pathname;
                  var lang = (path.startsWith('/ko/') || path === '/ko') ? 'ko' : 'en';
                  document.documentElement.lang = lang;
                  
                  // Set theme
                  var theme = localStorage.getItem('tools-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) { console.warn('[theme-init]', e); }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="/registerSW.js" defer />
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
    <ThemeProvider storageKey="tools-theme" defaultTheme="system">
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
    message = error.status === 404 ? (m['notFound_code']?.() ?? '404') : 'Error';
    details =
      error.status === 404
        ? (m['notFound_message']?.() ?? "The page you're looking for doesn't exist.")
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">{message}</h1>
      <p className="text-lg text-muted-foreground mb-8">{details}</p>
      {stack && (
        <pre className="max-w-2xl overflow-auto text-sm bg-muted p-4 rounded">
          <code>{stack}</code>
        </pre>
      )}
      <a
        href="/"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {m['notFound_backHome']?.()}
      </a>
    </main>
  );
}
