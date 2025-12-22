import { getLocaleFromPath, ThemeProvider } from '@soundblue/shared-react';
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
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">{message}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{details}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {m['app.notFoundBackHome']()}
        </a>
        {stack && (
          <pre className="mt-8 w-full max-w-2xl p-4 overflow-x-auto text-left bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
