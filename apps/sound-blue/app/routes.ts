import { index, type RouteConfig, route } from '@react-router/dev/routes';

// Routes without locale prefix
// Locale detection handled at component level via URL pathname
export default [
  // English (default, no prefix)
  index('routes/($locale)/home.tsx', { id: 'home-en' }),
  route('about', 'routes/($locale)/about.tsx', { id: 'about-en' }),
  route('privacy', 'routes/($locale)/privacy.tsx', { id: 'privacy-en' }),
  route('terms', 'routes/($locale)/terms.tsx', { id: 'terms-en' }),
  route('license', 'routes/($locale)/license.tsx', { id: 'license-en' }),
  route('sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-en' }),
  route('sound-recording', 'routes/($locale)/sound-recording.tsx', { id: 'sound-recording-en' }),
  route('news', 'routes/($locale)/news.tsx', { id: 'news-en' }),
  route('blog', 'routes/($locale)/blog.tsx', { id: 'blog-en' }),
  route('chat', 'routes/($locale)/chat.tsx', { id: 'chat-en' }),
  route('built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-en' }),
  route('offline', 'routes/($locale)/offline.tsx', { id: 'offline-en' }),
  route('music', 'routes/($locale)/music.tsx', { id: 'music-en' }),
  route('changelog', 'routes/($locale)/changelog.tsx', { id: 'changelog-en' }),
  // Korean (/ko prefix)
  route('ko', 'routes/($locale)/home.tsx', { id: 'home-ko' }),
  route('ko/about', 'routes/($locale)/about.tsx', { id: 'about-ko' }),
  route('ko/privacy', 'routes/($locale)/privacy.tsx', { id: 'privacy-ko' }),
  route('ko/terms', 'routes/($locale)/terms.tsx', { id: 'terms-ko' }),
  route('ko/license', 'routes/($locale)/license.tsx', { id: 'license-ko' }),
  route('ko/sitemap', 'routes/($locale)/sitemap.tsx', { id: 'sitemap-ko' }),
  route('ko/sound-recording', 'routes/($locale)/sound-recording.tsx', { id: 'sound-recording-ko' }),
  route('ko/news', 'routes/($locale)/news.tsx', { id: 'news-ko' }),
  route('ko/blog', 'routes/($locale)/blog.tsx', { id: 'blog-ko' }),
  route('ko/chat', 'routes/($locale)/chat.tsx', { id: 'chat-ko' }),
  route('ko/built-with', 'routes/($locale)/built-with.tsx', { id: 'built-with-ko' }),
  route('ko/offline', 'routes/($locale)/offline.tsx', { id: 'offline-ko' }),
  route('ko/music', 'routes/($locale)/music.tsx', { id: 'music-ko' }),
  route('ko/changelog', 'routes/($locale)/changelog.tsx', { id: 'changelog-ko' }),
] satisfies RouteConfig;
