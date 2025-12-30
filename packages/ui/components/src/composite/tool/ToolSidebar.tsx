// ========================================
// @soundblue/ui-components/composite - ToolSidebar
// Sidebar component for tool navigation
// ========================================

import type { ReactNode } from 'react';

export interface ToolSidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Tool sidebar navigation
 */
export function ToolSidebar({
  children,
  isOpen = true,
  onClose,
  className = '',
}: ToolSidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
        aria-label="Tool navigation"
      >
        <div className="h-full overflow-y-auto p-4">{children}</div>
      </nav>
    </>
  );
}
