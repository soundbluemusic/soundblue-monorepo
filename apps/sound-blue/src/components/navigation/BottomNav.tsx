import { useParaglideI18n } from '@soundblue/i18n';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { BottomSheet } from '~/components/ui';
import { isNavActive, MoreIcon, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '~/constants';
import m from '~/lib/messages';

export function BottomNav() {
  const { localizedPath } = useParaglideI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Check if any secondary item is active
  const isSecondaryActive = SECONDARY_NAV_ITEMS.some((item) =>
    isNavActive(item.path, location.pathname, localizedPath),
  );

  const handleSecondaryClick = (path: string) => {
    navigate({ to: localizedPath(path) });
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        className="hidden max-md:block fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] z-50 pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around h-full m-0 p-0 list-none">
          {/* Primary navigation items */}
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item.path, location.pathname, localizedPath);

            return (
              <li key={item.path} className="flex-1 h-full">
                <Link
                  to={localizedPath(item.path)}
                  preload="intent"
                  className={`flex flex-col items-center justify-center gap-1 h-full p-2 no-underline transition-all duration-150 ease-[var(--ease-default)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                    isActive
                      ? 'text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span className="text-[0.6875rem] font-medium">
                    {m[`nav_${item.labelKey}`]?.()}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* More button */}
          <li className="flex-1 h-full">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full p-2 bg-transparent border-none cursor-pointer transition-all duration-150 ease-[var(--ease-default)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                isSecondaryActive || isMoreOpen
                  ? 'text-[var(--color-accent-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-label={m['nav.more']()}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
            >
              <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                <MoreIcon />
              </span>
              <span className="text-[0.6875rem] font-medium">{m['nav.more']()}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More menu bottom sheet */}
      <BottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title={m['nav.more']()}>
        <ul className="m-0 p-0 list-none">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item.path, location.pathname, localizedPath);

            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => handleSecondaryClick(item.path)}
                  className={`flex items-center gap-4 w-full p-4 bg-transparent border-none rounded-2xl cursor-pointer transition-all duration-150 ease-[var(--ease-default)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                    isActive
                      ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-light)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)]'
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span className="text-base font-medium">{m[`nav_${item.labelKey}`]?.()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
