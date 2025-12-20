import type { InputHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        // Base styles - Apple-inspired
        'flex h-11 w-full rounded-xl border-0 bg-secondary/60 px-4 py-3',
        'text-sm font-medium text-foreground',
        'ring-1 ring-border/50',
        'transition-all duration-200 ease-out',
        // File input
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        // Placeholder
        'placeholder:text-muted-foreground/60',
        // Focus state - consistent ring pattern
        'focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        // Hover state
        'hover:bg-secondary/80 hover:ring-border',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/60',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
