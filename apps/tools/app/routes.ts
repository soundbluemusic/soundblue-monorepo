import { index, type RouteConfig, route } from '@react-router/dev/routes';

// ========================================
// Route Manifest - Centralized Route Configuration
// ========================================

// Type for individual route entries
type RouteEntry = ReturnType<typeof route>;

// Static pages (non-tool routes)
const STATIC_PAGES = [
  { slug: 'about', file: 'about.tsx' },
  { slug: 'built-with', file: 'built-with.tsx' },
  { slug: 'benchmark', file: 'benchmark.tsx' },
  { slug: 'sitemap', file: 'sitemap.tsx' },
] as const;

// Tool pages - matches toolCategories.ts slugs
// Adding a new tool? Just add its slug here!
const TOOL_PAGES = [
  'metronome',
  'drum-machine',
  'delay-calculator',
  'qr',
  'translator',
  'spell-checker',
  'english-spell-checker',
] as const;

// ========================================
// Route Generation Functions
// ========================================

function generateStaticRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];

  for (const page of STATIC_PAGES) {
    // English (default, no prefix)
    routes.push(route(page.slug, `routes/($locale)/${page.file}`, { id: `${page.slug}-en` }));
    // Korean (/ko prefix)
    routes.push(
      route(`ko/${page.slug}`, `routes/($locale)/${page.file}`, { id: `${page.slug}-ko` }),
    );
  }

  return routes;
}

function generateToolRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];

  for (const slug of TOOL_PAGES) {
    // English (default, no prefix)
    routes.push(route(slug, `routes/($locale)/${slug}.tsx`, { id: `${slug}-en` }));
    // Korean (/ko prefix)
    routes.push(route(`ko/${slug}`, `routes/($locale)/${slug}.tsx`, { id: `${slug}-ko` }));
  }

  return routes;
}

// ========================================
// Exported Route Configuration
// ========================================

export default [
  // Home routes
  index('routes/($locale)/home.tsx', { id: 'home-en' }),
  route('ko', 'routes/($locale)/home.tsx', { id: 'home-ko' }),

  // Static pages
  ...generateStaticRoutes(),

  // Tool pages (auto-generated from TOOL_PAGES manifest)
  ...generateToolRoutes(),
] satisfies RouteConfig;
