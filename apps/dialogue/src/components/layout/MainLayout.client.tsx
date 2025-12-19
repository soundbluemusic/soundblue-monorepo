import { clientOnly } from '@solidjs/start';

/**
 * Client-only wrapper for MainLayout
 * SSG builds require clientOnly for components that use:
 * - useNavigate/useLocation (router hooks)
 * - Store with IndexedDB
 * - Browser-only APIs
 */
export const MainLayoutClient = clientOnly(async () => {
  const { MainLayout } = await import('./MainLayout');
  return { default: MainLayout };
});
