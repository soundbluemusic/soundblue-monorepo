'use client';

import { useParaglideI18n } from '@soundblue/i18n';
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
import { type ToolType, useToolStore } from '~/stores/tool-store';
import { ToolCategory } from './ToolCategory';

// ========================================
// ToolSidebar Component - 도구 사이드바
// ========================================

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
      className={`flex h-full flex-col border-r border-(--border) bg-(--card) transition-[width] duration-200 ${
        sidebarCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-(--border) p-3 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!sidebarCollapsed && <h2 className="text-sm font-semibold">{m['sidebar.tools']?.()}</h2>}
        <button
          type="button"
          onClick={toggleCollapse}
          className="cursor-pointer rounded-xl border-none bg-transparent p-1.5 text-inherit transition-all duration-200 ease-out hover:bg-black/8 hover:text-(--foreground) active:scale-95 active:bg-black/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) dark:hover:bg-white/12 dark:active:bg-white/18"
          aria-label={sidebarCollapsed ? m['sidebar.expand']?.() : m['sidebar.collapse']?.()}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 space-y-4 overflow-y-auto p-2">
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
      <div ref={moreMenuRef} className="relative border-t border-(--border) p-2">
        {moreMenuOpen && (
          <div
            className={`absolute bottom-full z-50 mb-1 rounded-xl border border-(--border) bg-(--popover) p-1 shadow-lg ${
              sidebarCollapsed ? 'left-0 right-auto w-48' : 'left-2 right-2'
            }`}
          >
            <Link
              to={localizedPath('/about')}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent px-3 py-2 text-sm text-inherit no-underline transition-all duration-200 ease-out hover:bg-black/8 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) dark:hover:bg-white/12"
              onClick={() => setMoreMenuOpen(false)}
            >
              <Info className="size-4" />
              <span>{m['navigation.about']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/benchmark')}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent px-3 py-2 text-sm text-inherit no-underline transition-all duration-200 ease-out hover:bg-black/8 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) dark:hover:bg-white/12"
              onClick={() => setMoreMenuOpen(false)}
            >
              <Activity className="size-4" />
              <span>{m['sidebar.benchmark']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/sitemap')}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent px-3 py-2 text-sm text-inherit no-underline transition-all duration-200 ease-out hover:bg-black/8 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) dark:hover:bg-white/12"
              onClick={() => setMoreMenuOpen(false)}
            >
              <FileText className="size-4" />
              <span>{m['sidebar.sitemap']?.()}</span>
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={toggleMoreMenu}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent text-sm text-(--muted-foreground) transition-all duration-200 ease-out hover:bg-black/8 hover:text-(--foreground) active:scale-98 active:bg-black/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) dark:hover:bg-white/12 dark:active:bg-white/18 ${
            moreMenuOpen ? 'bg-black/5 dark:bg-white/8' : ''
          } ${sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2'}`}
          title={sidebarCollapsed ? m['sidebar.more']?.() : undefined}
        >
          <MoreHorizontal className="size-5" />
          {!sidebarCollapsed && <span>{m['sidebar.more']?.()}</span>}
        </button>
      </div>
    </aside>
  );
}
