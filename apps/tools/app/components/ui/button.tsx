import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  children?: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,122,255,0.25)] hover:brightness-110 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,122,255,0.35)] hover:-translate-y-0.5',
  destructive:
    'bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(239,68,68,0.25)] hover:brightness-110 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(239,68,68,0.35)] hover:-translate-y-0.5',
  outline:
    'border border-border bg-transparent text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-secondary hover:border-transparent hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]',
  secondary:
    'bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-secondary/80 hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5',
  ghost: 'bg-transparent text-foreground hover:bg-secondary/80',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline',
  glass:
    'bg-white/10 backdrop-blur-[24px] border border-white/20 text-foreground shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:bg-white/20',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-11 px-6 py-2.5',
  sm: 'h-9 px-4 text-xs rounded-lg',
  lg: 'h-12 px-8 text-base rounded-2xl',
  xl: 'h-14 px-10 text-lg rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
  'icon-lg': 'h-12 w-12 rounded-xl',
};

function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tight rounded-xl transition-all duration-200 ease-out cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

  const classNames = [baseStyles, variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}

export { Button };
