'use client';

import { Link, useLocation } from 'react-router';
import { EXTERNAL_NAV_ITEMS, isNavActive, NAV_ITEMS } from '~/constants';
import { useI18n } from '~/i18n';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { t, localizedPath } = useI18n();
  const location = useLocation();

  return (
    <aside
      className={`view-transition-sidebar fixed top-14 left-0 bottom-0 w-[var(--sidebar-width)] bg-surface-alt border-r border-line overflow-y-auto overflow-x-hidden z-[200] transition-transform duration-150 ease-default max-md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav className="py-4" aria-label="Main navigation">
        <ul className="list-none m-0 p-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="mb-1 px-3">
              <Link
                to={localizedPath(item.path)}
                prefetch="intent"
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isNavActive(item.path, location.pathname, localizedPath)
                    ? 'bg-accent/12 text-accent'
                    : 'text-content-muted hover:bg-state-hover hover:text-content'
                }`}
              >
                <span className="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                  {item.icon()}
                </span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {t.nav[item.labelKey]}
                </span>
              </Link>
            </li>
          ))}

          {/* Divider */}
          <li className="my-2 mx-3" aria-hidden="true">
            <div className="h-px bg-line" />
          </li>

          {/* External Links Section */}
          {EXTERNAL_NAV_ITEMS.map((item) => (
            <li key={item.url} className="mb-1 px-3">
              <a
                href={item.url}
                className="flex items-center gap-3 py-2.5 px-3 rounded-md text-content-muted text-sm font-medium no-underline transition-colors duration-150 hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                  {item.icon()}
                </span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {t.externalLinks[item.labelKey]}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
