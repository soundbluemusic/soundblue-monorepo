'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ToolCategory as ToolCategoryType } from '~/lib/toolCategories';
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
  const { locale } = useParaglideI18n();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1">
      {/* Category Header */}
      {!collapsed && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full cursor-pointer items-center justify-between rounded-md border-none bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground) transition-colors duration-150 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
        >
          <span>{category.name[locale]}</span>
          <ChevronDown
            className={`size-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Tool List */}
      {(isOpen || collapsed) && (
        <div className={`space-y-0.5 ${!collapsed ? 'pl-1' : ''}`}>
          {category.tools.map((tool) => (
            <ToolItem key={tool.id} tool={tool} onClick={onToolClick} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}
