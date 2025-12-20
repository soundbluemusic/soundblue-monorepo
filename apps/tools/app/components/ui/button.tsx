import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  [
    // Base styles - Apple-inspired
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-semibold tracking-tight',
    'rounded-xl', // Larger radius for Apple look
    'transition-all duration-200 ease-out',
    // Focus states
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Disabled states
    'disabled:pointer-events-none disabled:opacity-50',
    // Active press effect
    'active:scale-[0.98] active:transition-none',
    // Icon handling
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary - Solid blue Apple style
        default: [
          'bg-primary text-primary-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,122,255,0.25)]',
          'hover:brightness-110 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,122,255,0.35)]',
          'hover:-translate-y-0.5',
        ].join(' '),
        // Destructive - Red
        destructive: [
          'bg-destructive text-destructive-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(239,68,68,0.25)]',
          'hover:brightness-110 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(239,68,68,0.35)]',
          'hover:-translate-y-0.5',
        ].join(' '),
        // Outline - Subtle border with fill on hover
        outline: [
          'border border-border bg-transparent text-foreground',
          'hover:bg-secondary hover:border-transparent',
          'shadow-sm hover:shadow-md',
        ].join(' '),
        // Secondary - Subtle gray background
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'shadow-sm hover:shadow-md hover:-translate-y-0.5',
        ].join(' '),
        // Ghost - No background until hover
        ghost: ['text-foreground', 'hover:bg-secondary/80'].join(' '),
        // Link - Text only with underline
        link: ['text-primary underline-offset-4', 'hover:underline'].join(' '),
        // Glass - Glassmorphism style (Apple-style frosted)
        glass: [
          'bg-white/10 backdrop-blur-xl border border-white/20',
          'text-foreground',
          'hover:bg-white/20',
          'shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
        ].join(' '),
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 px-4 text-xs rounded-lg',
        lg: 'h-12 px-8 text-base rounded-2xl',
        xl: 'h-14 px-10 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
}

function Button({ className, variant, size, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}

export { Button, buttonVariants };
