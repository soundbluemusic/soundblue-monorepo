// ========================================
// @soundblue/ui-patterns - ChatContainer
// Container component for chat interface
// ========================================

import type { ReactNode } from 'react';

export interface ChatContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for chat messages and input
 */
export function ChatContainer({ children, className = '' }: ChatContainerProps) {
  return (
    <section className={`flex flex-col h-full overflow-hidden ${className}`} aria-label="Chat">
      {children}
    </section>
  );
}
