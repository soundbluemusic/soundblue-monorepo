'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import type { ToolInfo } from '~/lib/toolCategories';
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
  const { locale } = useParaglideI18n();
  const currentTool = useToolStore((state) => state.currentTool);
  const isActive = currentTool === tool.id;

  return (
    <button
      type="button"
      onClick={() => onClick(tool.id)}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent text-sm transition-all duration-200 ease-out hover:bg-black/8 hover:text-foreground active:scale-[0.98] active:bg-black/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:hover:bg-white/12 dark:active:bg-white/18 ${
        isActive ? 'bg-brand/15 text-brand font-medium shadow-sm' : ''
      } ${collapsed ? 'justify-center p-2' : 'px-3 py-2'}`}
      title={collapsed ? tool.name[locale] : undefined}
    >
      <span className="text-lg" aria-hidden="true">
        {tool.icon}
      </span>
      {!collapsed && <span className="truncate">{tool.name[locale]}</span>}
    </button>
  );
}
