import {
  getLocaleFromPath,
  SoftwareApplicationStructuredData,
  ThemeProvider,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
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
                  var theme = localStorage.getItem('tools-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
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
    setLocale(locale);
  }, [location.pathname]);

  return (
    <ThemeProvider storageKey="tools-theme" defaultTheme="system">
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
  setLocale(locale);

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
