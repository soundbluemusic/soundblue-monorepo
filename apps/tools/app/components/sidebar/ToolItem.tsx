'use client';

import { useParaglideI18n } from '@soundblue/shared-react';
import type { ToolInfo } from '~/lib/toolCategories';
import { type ToolType, useToolStore } from '~/stores/tool-store';
import styles from './ToolItem.module.scss';

// ========================================
// ToolItem Component - 개별 도구 아이템
// ========================================

interface ToolItemProps {
  tool: ToolInfo;
  onClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export function ToolItem({ tool, onClick, collapsed }: ToolItemProps) {
  const { locale } = useParaglideI18n();
  const currentTool = useToolStore((state) => state.currentTool);
  const isActive = currentTool === tool.id;

  const buttonClasses = [styles.toolItem, isActive && styles.active, collapsed && styles.collapsed]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => onClick(tool.id)}
      className={buttonClasses}
      title={collapsed ? tool.name[locale] : undefined}
    >
      <span className={styles.toolIcon} aria-hidden="true">
        {tool.icon}
      </span>
      {!collapsed && <span className={styles.toolName}>{tool.name[locale]}</span>}
    </button>
  );
}
