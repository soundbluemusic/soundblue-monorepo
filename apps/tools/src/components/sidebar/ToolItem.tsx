import type { Component } from 'solid-js';
import { useLanguage } from '~/i18n';
import type { ToolInfo } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { type ToolType, toolStore } from '~/stores/tool-store';

// ========================================
// ToolItem Component - 개별 도구 아이템
// ========================================

interface ToolItemProps {
  tool: ToolInfo;
  onClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export const ToolItem: Component<ToolItemProps> = (props) => {
  const { locale } = useLanguage();
  const isActive = () => toolStore.currentTool === props.tool.id;

  return (
    <button
      type="button"
      onClick={() => props.onClick(props.tool.id)}
      class={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'transition-all duration-200 ease-out',
        // Hover - visible color contrast (black tint in light, white tint in dark)
        'hover:bg-black/[0.08] dark:hover:bg-white/[0.12]',
        'hover:text-foreground',
        // Active press effect
        'active:scale-[0.98] active:bg-black/[0.12] dark:active:bg-white/[0.18]',
        // Focus visible for keyboard navigation
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Active tool state - brand color for identity
        isActive() && 'bg-brand/15 text-brand font-medium shadow-sm',
        props.collapsed && 'justify-center px-2'
      )}
      title={props.collapsed ? props.tool.name[locale()] : undefined}
    >
      <span class="text-lg" aria-hidden="true">
        {props.tool.icon}
      </span>
      {!props.collapsed && <span class="truncate">{props.tool.name[locale()]}</span>}
    </button>
  );
};
