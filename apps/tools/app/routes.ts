import { index, type RouteConfig, route } from '@react-router/dev/routes';

// Routes without locale prefix
// Locale detection handled at component level via URL pathname
export default [
  // English (default, no prefix)
  index('routes/($locale)/home.tsx', { id: 'home-en' }),
  route('about', 'routes/($locale)/about.tsx', { id: 'about-en' }),
  route('built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-en' }),
  route('benchmark', 'routes/($locale)/benchmark.tsx', { id: 'benchmark-en' }),
  route('sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-en' }),
  route('metronome', 'routes/($locale)/metronome.tsx', { id: 'metronome-en' }),
  route('drum-machine', 'routes/($locale)/drum-machine.tsx', { id: 'drum-machine-en' }),
  route('qr', 'routes/($locale)/qr.tsx', { id: 'qr-en' }),
  route('translator', 'routes/($locale)/translator.tsx', { id: 'translator-en' }),
  // Korean (/ko prefix)
  route('ko', 'routes/($locale)/home.tsx', { id: 'home-ko' }),
  route('ko/about', 'routes/($locale)/about.tsx', { id: 'about-ko' }),
  route('ko/built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-ko' }),
  route('ko/benchmark', 'routes/($locale)/benchmark.tsx', { id: 'benchmark-ko' }),
  route('ko/sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-ko' }),
  route('ko/metronome', 'routes/($locale)/metronome.tsx', { id: 'metronome-ko' }),
  route('ko/drum-machine', 'routes/($locale)/drum-machine.tsx', { id: 'drum-machine-ko' }),
  route('ko/qr', 'routes/($locale)/qr.tsx', { id: 'qr-ko' }),
  route('ko/translator', 'routes/($locale)/translator.tsx', { id: 'translator-ko' }),
] satisfies RouteConfig;
