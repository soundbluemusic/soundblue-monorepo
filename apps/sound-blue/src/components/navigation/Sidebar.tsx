import { A, useLocation } from '@solidjs/router';
import { For, type JSX } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { EXTERNAL_NAV_ITEMS, isNavActive, NAV_ITEMS } from '~/constants';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar(props: SidebarProps): JSX.Element {
  const { t, localizedPath } = useLanguage();
  const location = useLocation();

  return (
    <aside
      class={`view-transition-sidebar fixed top-14 left-0 bottom-0 w-[var(--sidebar-width)] bg-surface-alt border-r border-line overflow-y-auto overflow-x-hidden z-[200] transition-transform duration-150 ease-default max-md:hidden ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav class="py-4" aria-label="Main navigation">
        <ul class="list-none m-0 p-0">
          <For each={NAV_ITEMS}>
            {(item) => (
              <li class="mb-1 px-3">
                <A
                  href={localizedPath(item.path)}
                  preload
                  class={`flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isNavActive(item.path, location.pathname, localizedPath)
                      ? 'bg-accent/12 text-accent'
                      : 'text-content-muted hover:bg-state-hover hover:text-content'
                  }`}
                >
                  <span class="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                    {t().nav[item.labelKey]}
                  </span>
                </A>
              </li>
            )}
          </For>

          {/* Divider */}
          <li class="my-2 mx-3" aria-hidden="true">
            <div class="h-px bg-line" />
          </li>

          {/* External Links Section */}
          <For each={EXTERNAL_NAV_ITEMS}>
            {(item) => (
              <li class="mb-1 px-3">
                <a
                  href={item.url}
                  class="flex items-center gap-3 py-2.5 px-3 rounded-md text-content-muted text-sm font-medium no-underline transition-colors duration-150 hover:bg-state-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                    {t().externalLinks[item.labelKey]}
                  </span>
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </aside>
  );
}
