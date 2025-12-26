'use client';

import { useParaglideI18n } from '@soundblue/shared-react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ToolCategory as ToolCategoryType } from '~/lib/toolCategories';
import type { ToolType } from '~/stores/tool-store';
import styles from './ToolCategory.module.scss';
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

  const chevronClasses = [styles.chevronIcon, isOpen && styles.open].filter(Boolean).join(' ');
  const toolListClasses = [styles.toolList, !collapsed && styles.expanded]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.category}>
      {/* Category Header */}
      {!collapsed && (
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.categoryHeader}>
          <span>{category.name[locale]}</span>
          <ChevronDown className={chevronClasses} />
        </button>
      )}

      {/* Tool List */}
      {(isOpen || collapsed) && (
        <div className={toolListClasses}>
          {category.tools.map((tool) => (
            <ToolItem key={tool.id} tool={tool} onClick={onToolClick} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}
