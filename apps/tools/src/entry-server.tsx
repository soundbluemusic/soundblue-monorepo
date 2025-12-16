// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';

const SITE_URL = 'https://tools.soundbluemusic.com';
const SITE_NAME = 'SoundBlue Tools';
const SITE_DESCRIPTION =
  'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators. 음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구.';

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['ko', 'en'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'SoundBlue Music',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512.png`,
        width: 512,
        height: 512,
      },
      sameAs: ['https://github.com/soundbluemusic'],
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Metronome with visual pendulum',
        'Chromatic tuner',
        'Piano roll MIDI editor',
        'Drum machine sequencer',
        'QR code generator',
        'World clock',
      ],
    },
  ],
};

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="ko">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Favicon & Icons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />

          {/* PWA */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0a0a0a" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

          {/* Default SEO */}
          <meta name="description" content={SITE_DESCRIPTION} />
          <meta name="author" content="SoundBlue Music" />
          <meta
            name="keywords"
            content="DAW, Digital Audio Workstation, Metronome, Tuner, Piano Roll, MIDI, Music Production, Web Audio, Rhythm Game, QR Generator, World Clock, 메트로놈, 튜너, 피아노롤"
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={SITE_URL} />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:title" content={`${SITE_NAME} - Pro-grade Web DAW & Creative Tools`} />
          <meta property="og:description" content={SITE_DESCRIPTION} />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:locale" content="ko_KR" />
          <meta property="og:locale:alternate" content="en_US" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={`${SITE_NAME} - Pro-grade Web DAW & Creative Tools`}
          />
          <meta name="twitter:description" content={SITE_DESCRIPTION} />
          <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

          {/* Alternate Languages */}
          <link rel="alternate" hreflang="ko" href={SITE_URL} />
          <link rel="alternate" hreflang="en" href={`${SITE_URL}/en`} />
          <link rel="alternate" hreflang="x-default" href={SITE_URL} />

          {/* JSON-LD Structured Data */}
          <script type="application/ld+json" innerHTML={JSON.stringify(jsonLd)} />

          {assets}
        </head>
        <body class="min-h-screen bg-background text-foreground antialiased">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
