import { getLocaleFromPath, ThemeProvider } from '@soundblue/shared-react';
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
import { I18nProvider, translations } from '~/i18n';

import './app.css';

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
  return (
    <ThemeProvider storageKey="sound-blue-theme" defaultTheme="system">
      <I18nProvider>
        <Outlet />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return <AppContent />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();

  // Get locale from URL path
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';
  const t = translations[locale];

  let message = t.common.errorTitle;
  let details = t.common.errorUnexpected;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? t.notFound.code : t.common.errorGeneric;
    details = error.status === 404 ? t.notFound.message : error.statusText || details;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-(--color-text-tertiary) mb-4">{message}</h1>
        <p className="text-xl text-content-muted mb-8">{details}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[var(--color-accent-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          {t.notFound.backHome}
        </a>
      </div>
    </main>
  );
}
