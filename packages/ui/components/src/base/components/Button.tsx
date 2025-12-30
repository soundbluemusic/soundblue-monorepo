import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-(--color-accent-primary) text-(--color-text-inverse) hover:brightness-110',
  secondary: 'bg-(--color-bg-secondary) text-(--color-text-primary) hover:bg-(--color-bg-tertiary)',
  ghost: 'bg-transparent hover:bg-(--color-interactive-hover)',
  destructive: 'bg-(--color-error) text-white hover:brightness-110',
  outline:
    'border border-(--color-border-primary) bg-transparent hover:bg-(--color-interactive-hover)',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-(--radius-md)',
  md: 'h-10 px-4 text-base gap-2 rounded-(--radius-lg)',
  lg: 'h-12 px-6 text-lg gap-2.5 rounded-(--radius-xl)',
  icon: 'h-10 w-10 rounded-(--radius-lg)',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
