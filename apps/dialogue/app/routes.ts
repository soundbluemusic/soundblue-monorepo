import { index, type RouteConfig, route } from '@react-router/dev/routes';

// Routes without locale prefix
// Locale detection handled at component level via URL pathname
export default [
  // English (default, no prefix)
  index('routes/($locale)/home.tsx', { id: 'home-en' }),
  route('about', 'routes/($locale)/about.tsx', { id: 'about-en' }),
  route('built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-en' }),
  route('sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-en' }),
  // Korean (/ko prefix)
  route('ko', 'routes/($locale)/home.tsx', { id: 'home-ko' }),
  route('ko/about', 'routes/($locale)/about.tsx', { id: 'about-ko' }),
  route('ko/built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-ko' }),
  route('ko/sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-ko' }),
] satisfies RouteConfig;
