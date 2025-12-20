'use client';

import { useI18n } from '~/i18n';
import type { ToolInfo } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { type ToolType, useToolStore } from '~/stores/tool-store';

// ========================================
// ToolItem Component - 개별 도구 아이템
// ========================================

interface ToolItemProps {
  tool: ToolInfo;
  onClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export function ToolItem({ tool, onClick, collapsed }: ToolItemProps) {
  const { locale } = useI18n();
  const currentTool = useToolStore((state) => state.currentTool);
  const isActive = currentTool === tool.id;

  return (
    <button
      type="button"
      onClick={() => onClick(tool.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'transition-all duration-200 ease-out',
        // Hover - visible color contrast (black tint in light, white tint in dark)
        'hover:bg-black/8 dark:hover:bg-white/12',
        'hover:text-foreground',
        // Active press effect
        'active:scale-[0.98] active:bg-black/12 dark:active:bg-white/18',
        // Focus visible for keyboard navigation
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Active tool state - brand color for identity
        isActive && 'bg-brand/15 text-brand font-medium shadow-sm',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? tool.name[locale] : undefined}
    >
      <span className="text-lg" aria-hidden="true">
        {tool.icon}
      </span>
      {!collapsed && <span className="truncate">{tool.name[locale]}</span>}
    </button>
  );
}
