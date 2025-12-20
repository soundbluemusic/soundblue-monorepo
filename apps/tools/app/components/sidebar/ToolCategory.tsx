'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '~/i18n';
import type { ToolCategory as ToolCategoryType } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import type { ToolType } from '~/stores/tool-store';
import { ToolItem } from './ToolItem';

// ========================================
// ToolCategory Component - 도구 카테고리 (접이식)
// ========================================

interface ToolCategoryProps {
  category: ToolCategoryType;
  onToolClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export function ToolCategory({ category, onToolClick, collapsed }: ToolCategoryProps) {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1">
      {/* Category Header */}
      {!collapsed && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between px-3 py-2 rounded-md',
            'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
            'hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <span>{category.name[locale]}</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
      )}

      {/* Tool List */}
      {(isOpen || collapsed) && (
        <div className={cn('space-y-0.5', !collapsed && 'pl-1')}>
          {category.tools.map((tool) => (
            <ToolItem key={tool.id} tool={tool} onClick={onToolClick} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}
