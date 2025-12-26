import { useParaglideI18n } from '@soundblue/shared-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BottomSheet } from '~/components/ui';
import { isNavActive, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '~/constants';
import m from '~/lib/messages';
import styles from './BottomNav.module.scss';

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
      <nav className={styles.bottomNav} aria-label="Mobile navigation">
        <ul className={styles.navList}>
          {/* Primary navigation items */}
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item.path, location.pathname, localizedPath);
            const linkClasses = [styles.navLink, isActive && styles.navLinkActive]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={item.path} className={styles.navItem}>
                <Link to={localizedPath(item.path)} prefetch="intent" className={linkClasses}>
                  <span className={styles.iconWrapper}>{item.icon()}</span>
                  <span className={styles.label}>{m[`nav_${item.labelKey}`]?.()}</span>
                </Link>
              </li>
            );
          })}

          {/* More button */}
          <li className={styles.navItem}>
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={[
                styles.moreButton,
                (isSecondaryActive || isMoreOpen) && styles.moreButtonActive,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={m['nav.more']()}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
            >
              <span className={styles.iconWrapper}>
                <MoreIcon />
              </span>
              <span className={styles.label}>{m['nav.more']()}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More menu bottom sheet */}
      <BottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title={m['nav.more']()}>
        <ul className={styles.sheetList}>
          {SECONDARY_NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item.path, location.pathname, localizedPath);
            const itemClasses = [styles.sheetItem, isActive && styles.sheetItemActive]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => handleSecondaryClick(item.path)}
                  className={itemClasses}
                >
                  <span className={styles.sheetIconWrapper}>{item.icon()}</span>
                  <span className={styles.sheetLabel}>{m[`nav_${item.labelKey}`]?.()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
