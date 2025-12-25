'use client';

import { useParaglideI18n } from '@soundblue/shared-react';
import {
  Activity,
  FileText,
  Info,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import m from '~/lib/messages';
import { getToolInfo, TOOL_CATEGORIES } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { type ToolType, useToolStore } from '~/stores/tool-store';
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

export function ToolSidebar() {
  const navigate = useNavigate();
  const { localizedPath } = useParaglideI18n();
  const { sidebarCollapsed, toggleSidebarCollapse, openTool } = useToolStore();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!moreMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [moreMenuOpen]);

  const handleToolClick = (toolId: ToolType) => {
    const toolInfo = getToolInfo(toolId);
    if (toolInfo) {
      // Navigate to tool URL with locale (this will auto-open the tool via the route)
      navigate(localizedPath(`/${toolInfo.slug}`));
    }
    openTool(toolId);
  };

  const toggleCollapse = () => {
    toggleSidebarCollapse();
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center border-b px-3 py-3',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!sidebarCollapsed && <h2 className="font-semibold text-sm">{m['sidebar.tools']?.()}</h2>}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            'p-1.5 rounded-lg transition-all duration-200 ease-out',
            HOVER_STYLES,
            ACTIVE_STYLES,
            FOCUS_STYLES,
          )}
          aria-label={sidebarCollapsed ? m['sidebar.expand']?.() : m['sidebar.collapse']?.()}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {TOOL_CATEGORIES.map((category) => (
          <ToolCategory
            key={category.id}
            category={category}
            onToolClick={handleToolClick}
            collapsed={sidebarCollapsed}
          />
        ))}
      </div>

      {/* More Menu */}
      <div ref={moreMenuRef} className="relative border-t p-2">
        {moreMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full left-2 right-2 mb-1 z-50 rounded-lg border bg-popover p-1 shadow-lg',
              sidebarCollapsed && 'left-0 right-auto w-48',
            )}
          >
            <Link
              to={localizedPath('/about')}
              className={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Info className="h-4 w-4" />
              <span>{m['navigation.about']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/benchmark')}
              className={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Activity className="h-4 w-4" />
              <span>{m['sidebar.benchmark']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/sitemap')}
              className={MENU_ITEM_CLASS}
              onClick={() => setMoreMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>{m['sidebar.sitemap']?.()}</span>
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={toggleMoreMenu}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-out',
            HOVER_STYLES,
            'active:scale-[0.98] active:bg-black/12 dark:active:bg-white/18',
            FOCUS_STYLES,
            moreMenuOpen && 'bg-black/5 dark:bg-white/8',
            sidebarCollapsed && 'justify-center px-2',
          )}
          title={sidebarCollapsed ? m['sidebar.more']?.() : undefined}
        >
          <MoreHorizontal className="h-5 w-5" />
          {!sidebarCollapsed && <span>{m['sidebar.more']?.()}</span>}
        </button>
      </div>
    </aside>
  );
}
