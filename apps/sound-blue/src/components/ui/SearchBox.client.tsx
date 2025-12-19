/**
 * Client-only SearchBox export using SolidStart's clientOnly HOC.
 * This ensures the component is never executed during SSR/prerendering.
 *
 * SearchBox uses useNavigate, usePreloadRoute, and useLanguage hooks
 * which require client-side hydration to work properly.
 */
import { clientOnly } from '@solidjs/start';

/**
 * Client-only SearchBox component.
 * Use this instead of importing SearchBox directly to prevent SSR/hydration issues.
 *
 * @example
 * ```tsx
 * import { SearchBoxClient } from '~/components/ui';
 *
 * <SearchBoxClient />
 * ```
 */
export const SearchBoxClient = clientOnly(async () => {
  const { SearchBox } = await import('./SearchBox');
  return { default: SearchBox };
});
