import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'youtube';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href: string;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-xl font-medium no-underline transition-all duration-150 ease-[var(--ease-default)] cursor-pointer border-none active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-(--color-accent-primary) text-white hover:bg-(--color-accent-hover)',
  secondary:
    'bg-(--color-bg-tertiary) text-(--color-text-primary) hover:bg-(--color-interactive-hover)',
  ghost:
    'bg-transparent text-(--color-text-secondary) hover:bg-(--color-interactive-hover) hover:text-(--color-text-primary)',
  youtube: 'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm gap-1.5',
  md: 'py-2 px-4 text-sm gap-2',
  lg: 'py-3 px-6 text-base gap-2',
};

function getButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={getButtonClasses(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: LinkButtonProps) {
  return <a className={getButtonClasses(variant, size, className)} {...props} />;
}

export type { ButtonProps, ButtonVariant, ButtonSize, LinkButtonProps };
