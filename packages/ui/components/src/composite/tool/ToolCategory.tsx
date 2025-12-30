// ========================================
// @soundblue/ui-components/composite - ToolCategory
// Category grouping for tools
// ========================================

import type { ReactNode } from 'react';

export interface ToolCategoryProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Tool category grouping
 */
export function ToolCategory({ title, children, className = '' }: ToolCategoryProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
