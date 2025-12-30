// ========================================
// @soundblue/ui-patterns - ToolCard
// Card component for tool display
// ========================================

import type { ReactNode } from 'react';

export interface ToolCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Tool card component
 */
export function ToolCard({
  title,
  description,
  icon,
  href,
  onClick,
  className = '',
}: ToolCardProps) {
  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick, type: 'button' as const };

  return (
    <Component
      {...props}
      className={`
        block p-4 rounded-xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        hover:border-blue-500 hover:shadow-lg
        transition-all duration-200
        text-left
        ${className}
      `}
    >
      {icon && <div className="mb-3 text-blue-500">{icon}</div>}
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </Component>
  );
}
