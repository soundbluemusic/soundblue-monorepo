import { getLocaleFromPath } from '@soundblue/i18n';
import { MusicGroupStructuredData, WebSiteStructuredData } from '@soundblue/seo';
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
      { name: 'theme-color', content: '#4A9E95' },
      // Search engine verification
      { name: 'google-site-verification', content: 'mw0M1q-2K63FX-NZCL5AetN7V6VI6cXY5ItnMXyl85A' },
      { name: 'naver-site-verification', content: 'd2e5722513ceb03e1afeac65bab53416c217ca72' },
      { name: 'msvalidate.01', content: '2555E807B2875180F8DAC1EB5D284D3D' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://www.youtube.com' },
      { rel: 'dns-prefetch', href: 'https://soundblue.music' },
    ],
  }),
  component: RootLayout,
  errorComponent: ErrorBoundary,
});

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
        <ThemeProvider storageKey="sound-blue-theme" defaultTheme="system">
          <ColorblindProvider storageKey="sound-blue-colorblind">
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

  const message = m['common.errorTitle']();
  const details = error?.message || m['common.errorUnexpected']();

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
              {m['notFound.backHome']()}
            </a>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
