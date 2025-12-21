import { useParaglideI18n } from '@soundblue/shared-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BottomSheet } from '~/components/ui';
import { isNavActive, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '~/constants';
import m from '~/lib/messages';

/**
 * MoreIcon - Three dots icon for "More" menu
 */
function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

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
    navigate(localizedPath(path));
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        className="hidden max-md:block fixed bottom-0 left-0 right-0 h-14 bg-surface-alt border-t border-line z-[300] pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around h-full m-0 p-0 list-none">
          {/* Primary navigation items */}
          {PRIMARY_NAV_ITEMS.map((item) => (
            <li key={item.path} className="flex-1 h-full">
              <Link
                to={localizedPath(item.path)}
                prefetch="intent"
                className={`flex flex-col items-center justify-center gap-1 h-full p-2 no-underline transition-all duration-150 focus-visible:outline-none focus-visible:bg-state-hover active:scale-95 ${
                  isNavActive(item.path, location.pathname, localizedPath)
                    ? 'text-accent'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                  {item.icon()}
                </span>
                <span className="text-[11px] font-medium">{m[`nav_${item.labelKey}`]?.()}</span>
              </Link>
            </li>
          ))}

          {/* More button */}
          <li className="flex-1 h-full">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full p-2 bg-transparent transition-all duration-150 focus-visible:outline-none focus-visible:bg-state-hover active:scale-95 ${
                isSecondaryActive || isMoreOpen
                  ? 'text-accent'
                  : 'text-content-muted hover:text-content'
              }`}
              aria-label={m['nav.more']()}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
            >
              <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                <MoreIcon />
              </span>
              <span className="text-[11px] font-medium">{m['nav.more']()}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More menu bottom sheet */}
      <BottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title={m['nav.more']()}>
        <ul className="m-0 p-0 list-none">
          {SECONDARY_NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <button
                type="button"
                onClick={() => handleSecondaryClick(item.path)}
                className={`flex items-center gap-4 w-full p-4 bg-transparent rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98] ${
                  isNavActive(item.path, location.pathname, localizedPath)
                    ? 'text-accent bg-accent/10'
                    : 'text-content hover:bg-state-hover'
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                  {item.icon()}
                </span>
                <span className="text-base font-medium">{m[`nav_${item.labelKey}`]?.()}</span>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
