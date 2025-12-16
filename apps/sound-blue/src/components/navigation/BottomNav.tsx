import { A, useLocation, useNavigate } from '@solidjs/router';
import { createSignal, For, type JSX } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { BottomSheetClient } from '~/components/ui';
import { isNavActive, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '~/constants';

/**
 * MoreIcon - Three dots icon for "More" menu
 */
function MoreIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function BottomNav(): JSX.Element {
  const { t, localizedPath } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = createSignal(false);

  // Check if any secondary item is active
  const isSecondaryActive = (): boolean => {
    return SECONDARY_NAV_ITEMS.some((item) =>
      isNavActive(item.path, location.pathname, localizedPath),
    );
  };

  const handleSecondaryClick = (path: string): void => {
    navigate(localizedPath(path));
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        class="hidden max-md:block fixed bottom-0 left-0 right-0 h-14 bg-surface-alt border-t border-line z-[300] pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <ul class="flex items-center justify-around h-full m-0 p-0 list-none">
          {/* Primary navigation items */}
          <For each={PRIMARY_NAV_ITEMS}>
            {(item) => (
              <li class="flex-1 h-full">
                <A
                  href={localizedPath(item.path)}
                  preload
                  class={`flex flex-col items-center justify-center gap-1 h-full p-2 no-underline transition-all duration-150 focus-visible:outline-none focus-visible:bg-state-hover active:scale-95 ${
                    isNavActive(item.path, location.pathname, localizedPath)
                      ? 'text-accent'
                      : 'text-content-muted hover:text-content'
                  }`}
                >
                  <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span class="text-[11px] font-medium">{t().nav[item.labelKey]}</span>
                </A>
              </li>
            )}
          </For>

          {/* More button */}
          <li class="flex-1 h-full">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              class={`flex flex-col items-center justify-center gap-1 w-full h-full p-2 bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:bg-state-hover active:scale-95 ${
                isSecondaryActive() || isMoreOpen()
                  ? 'text-accent'
                  : 'text-content-muted hover:text-content'
              }`}
              aria-label={t().nav.more}
              aria-expanded={isMoreOpen()}
              aria-haspopup="dialog"
            >
              <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                <MoreIcon />
              </span>
              <span class="text-[11px] font-medium">{t().nav.more}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More menu bottom sheet (client-only to prevent SSR issues) */}
      <BottomSheetClient
        isOpen={isMoreOpen()}
        onClose={() => setIsMoreOpen(false)}
        title={t().nav.more}
      >
        <ul class="m-0 p-0 list-none">
          <For each={SECONDARY_NAV_ITEMS}>
            {(item) => (
              <li>
                <button
                  type="button"
                  onClick={() => handleSecondaryClick(item.path)}
                  class={`flex items-center gap-4 w-full p-4 bg-transparent rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98] ${
                    isNavActive(item.path, location.pathname, localizedPath)
                      ? 'text-accent bg-accent/10'
                      : 'text-content hover:bg-state-hover'
                  }`}
                >
                  <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span class="text-base font-medium">{t().nav[item.labelKey]}</span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </BottomSheetClient>
    </>
  );
}
