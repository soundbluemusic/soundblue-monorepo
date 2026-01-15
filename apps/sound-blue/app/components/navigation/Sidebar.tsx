import { useParaglideI18n } from '@soundblue/i18n';
import { Link, useLocation } from 'react-router';
import { EXTERNAL_NAV_ITEMS, isNavActive, NAV_ITEMS } from '~/constants';
import m from '~/lib/messages';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { localizedPath } = useParaglideI18n();
  const location = useLocation();

  return (
    <aside
      className={`view-transition-sidebar fixed top-[var(--header-height)] left-0 bottom-0 w-[var(--sidebar-width)] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)] overflow-y-auto overflow-x-hidden z-50 transition-transform duration-150 ease-[var(--ease-default)] max-md:hidden scrollbar-thin scrollbar-thumb-[var(--color-border-primary)] scrollbar-track-transparent ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="py-4" aria-label="Main navigation">
        <ul className="list-none m-0 p-0">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavActive(item.path, location.pathname, localizedPath);

            return (
              <li key={item.path} className="mb-1 px-3">
                <Link
                  to={localizedPath(item.path)}
                  prefetch="intent"
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium no-underline transition-all duration-150 ease-[var(--ease-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 ${
                    isActive
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {m[`nav_${item.labelKey}`]?.()}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Divider */}
          <li className="mx-3 my-2" aria-hidden="true">
            <div className="h-px bg-[var(--color-border-primary)]" />
          </li>

          {/* External Links Section */}
          {EXTERNAL_NAV_ITEMS.map((item) => (
            <li key={item.url} className="mb-1 px-3">
              <a
                href={item.url}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium no-underline text-[var(--color-text-secondary)] transition-all duration-150 ease-[var(--ease-default)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                  {item.icon()}
                </span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {m[`externalLinks_${item.labelKey}`]?.()}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
