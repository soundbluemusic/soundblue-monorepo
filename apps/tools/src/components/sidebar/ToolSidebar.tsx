import { A, useNavigate } from '@solidjs/router';
import {
  Activity,
  FileText,
  Info,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-solid';
import { type Component, createEffect, createSignal, For, onCleanup, Show } from 'solid-js';
import { getLocalizedPath, useLanguage } from '~/i18n';
import { getToolInfo, TOOL_CATEGORIES } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { type ToolType, toolActions, toolStore } from '~/stores/tool-store';
import { ToolCategory } from './ToolCategory';

// ========================================
// ToolSidebar Component - 도구 사이드바
// ========================================

// Extracted hover styles to avoid duplicate cn() calls
const HOVER_STYLES = 'hover:bg-black/8 dark:hover:bg-white/12 hover:text-foreground';
const ACTIVE_STYLES = 'active:scale-95 active:bg-black/12 dark:active:bg-white/18';
const FOCUS_STYLES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1';
const MENU_ITEM_CLASS = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ease-out ${HOVER_STYLES} ${FOCUS_STYLES}`;

export const ToolSidebar: Component = () => {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const isCollapsed = () => toolStore.sidebarCollapsed;
  const [moreMenuOpen, setMoreMenuOpen] = createSignal(false);
  let moreMenuRef: HTMLDivElement | undefined;

  // Close menu when clicking outside
  createEffect(() => {
    if (!moreMenuOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef && !moreMenuRef.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    onCleanup(() => document.removeEventListener('click', handleClickOutside));
  });

  const handleToolClick = (toolId: ToolType) => {
    const toolInfo = getToolInfo(toolId);
    if (toolInfo) {
      // Navigate to tool URL with locale (this will auto-open the tool via the route)
      navigate(getLocalizedPath(`/${toolInfo.slug}`, locale()));
    }
    toolActions.openTool(toolId);
  };

  const toggleCollapse = () => {
    toolActions.toggleSidebarCollapse();
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen());
  };

  return (
    <aside
      class={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-200',
        isCollapsed() ? 'w-14' : 'w-52',
      )}
    >
      {/* Header */}
      <div
        class={cn(
          'flex items-center border-b px-3 py-3',
          isCollapsed() ? 'justify-center' : 'justify-between',
        )}
      >
        <Show when={!isCollapsed()}>
          <h2 class="font-semibold text-sm">{t().sidebar.tools}</h2>
        </Show>
        <button
          type="button"
          onClick={toggleCollapse}
          class={cn(
            'p-1.5 rounded-lg transition-all duration-200 ease-out',
            HOVER_STYLES,
            ACTIVE_STYLES,
            FOCUS_STYLES,
          )}
          aria-label={isCollapsed() ? t().sidebar.expand : t().sidebar.collapse}
        >
          <Show when={isCollapsed()} fallback={<PanelLeftClose class="h-4 w-4" />}>
            <PanelLeftOpen class="h-4 w-4" />
          </Show>
        </button>
      </div>

      {/* Tool Categories */}
      <div class="flex-1 overflow-y-auto p-2 space-y-4">
        <For each={TOOL_CATEGORIES}>
          {(category) => (
            <ToolCategory
              category={category}
              onToolClick={handleToolClick}
              collapsed={isCollapsed()}
            />
          )}
        </For>
      </div>

      {/* More Menu */}
      <div ref={moreMenuRef} class="relative border-t p-2">
        <Show when={moreMenuOpen()}>
          <div
            class={cn(
              'absolute bottom-full left-2 right-2 mb-1 z-50 rounded-lg border bg-popover p-1 shadow-lg',
              isCollapsed() && 'left-0 right-auto w-48',
            )}
          >
            <A
              href={getLocalizedPath('/about', locale())}
              class={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Info class="h-4 w-4" />
              <span>{t().navigation.about}</span>
            </A>
            <A
              href={getLocalizedPath('/benchmark', locale())}
              class={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Activity class="h-4 w-4" />
              <span>{t().sidebar.benchmark}</span>
            </A>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              class={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <FileText class="h-4 w-4" />
              <span>{t().sidebar.sitemap}</span>
            </a>
          </div>
        </Show>
        <button
          type="button"
          onClick={toggleMoreMenu}
          class={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-out',
            HOVER_STYLES,
            'active:scale-[0.98] active:bg-black/12 dark:active:bg-white/18',
            FOCUS_STYLES,
            moreMenuOpen() && 'bg-black/5 dark:bg-white/8',
            isCollapsed() && 'justify-center px-2',
          )}
          title={isCollapsed() ? t().sidebar.more : undefined}
        >
          <MoreHorizontal class="h-5 w-5" />
          <Show when={!isCollapsed()}>
            <span>{t().sidebar.more}</span>
          </Show>
        </button>
      </div>
    </aside>
  );
};
