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
import { type ToolType, useToolStore } from '~/stores/tool-store';
import { ToolCategory } from './ToolCategory';
import styles from './ToolSidebar.module.scss';

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

  const sidebarClasses = [styles.sidebar, sidebarCollapsed ? styles.collapsed : styles.expanded]
    .filter(Boolean)
    .join(' ');

  const headerClasses = [styles.header, sidebarCollapsed ? styles.collapsed : styles.expanded]
    .filter(Boolean)
    .join(' ');

  const dropdownClasses = [styles.moreMenuDropdown, sidebarCollapsed && styles.collapsed]
    .filter(Boolean)
    .join(' ');

  const moreButtonClasses = [
    styles.moreButton,
    moreMenuOpen && styles.active,
    sidebarCollapsed && styles.collapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className={headerClasses}>
        {!sidebarCollapsed && <h2 className={styles.title}>{m['sidebar.tools']?.()}</h2>}
        <button
          type="button"
          onClick={toggleCollapse}
          className={styles.collapseButton}
          aria-label={sidebarCollapsed ? m['sidebar.expand']?.() : m['sidebar.collapse']?.()}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className={styles.collapseIcon} />
          ) : (
            <PanelLeftClose className={styles.collapseIcon} />
          )}
        </button>
      </div>

      {/* Tool Categories */}
      <div className={styles.content}>
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
      <div ref={moreMenuRef} className={styles.moreMenuWrapper}>
        {moreMenuOpen && (
          <div className={dropdownClasses}>
            <Link
              to={localizedPath('/about')}
              className={styles.menuItem}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Info className={styles.menuItemIcon} />
              <span>{m['navigation.about']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/benchmark')}
              className={styles.menuItem}
              onClick={() => setMoreMenuOpen(false)}
            >
              <Activity className={styles.menuItemIcon} />
              <span>{m['sidebar.benchmark']?.()}</span>
            </Link>
            <Link
              to={localizedPath('/sitemap')}
              className={styles.menuItem}
              onClick={() => setMoreMenuOpen(false)}
            >
              <FileText className={styles.menuItemIcon} />
              <span>{m['sidebar.sitemap']?.()}</span>
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={toggleMoreMenu}
          className={moreButtonClasses}
          title={sidebarCollapsed ? m['sidebar.more']?.() : undefined}
        >
          <MoreHorizontal className={styles.moreIcon} />
          {!sidebarCollapsed && <span>{m['sidebar.more']?.()}</span>}
        </button>
      </div>
    </aside>
  );
}
