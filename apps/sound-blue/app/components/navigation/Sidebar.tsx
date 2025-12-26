import { useParaglideI18n } from '@soundblue/shared-react';
import { Link, useLocation } from 'react-router';
import { EXTERNAL_NAV_ITEMS, isNavActive, NAV_ITEMS } from '~/constants';
import m from '~/lib/messages';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { localizedPath } = useParaglideI18n();
  const location = useLocation();

  const sidebarClasses = [
    'view-transition-sidebar',
    styles.sidebar,
    isOpen ? styles.sidebarOpen : styles.sidebarClosed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClasses}>
      <nav className={styles.nav} aria-label="Main navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
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

          {/* Divider */}
          <li className={styles.divider} aria-hidden="true">
            <div className={styles.dividerLine} />
          </li>

          {/* External Links Section */}
          {EXTERNAL_NAV_ITEMS.map((item) => (
            <li key={item.url} className={styles.navItem}>
              <a
                href={item.url}
                className={styles.navLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.iconWrapper}>{item.icon()}</span>
                <span className={styles.label}>{m[`externalLinks_${item.labelKey}`]?.()}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
