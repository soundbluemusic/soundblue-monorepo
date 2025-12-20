import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium no-underline transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent',
        secondary: 'bg-surface-dim text-content hover:bg-state-hover focus-visible:ring-accent',
        ghost:
          'bg-transparent text-content-muted hover:bg-state-hover hover:text-content focus-visible:ring-accent',
        youtube: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'>,
    ButtonVariants {
  class?: string;
}

interface LinkButtonProps
  extends Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'class'>,
    ButtonVariants {
  class?: string;
  href: string;
}

export function Button(props: ButtonProps): JSX.Element {
  const [local, others] = splitProps(props, ['variant', 'size', 'class']);

  return (
    <button
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  );
}

export function LinkButton(props: LinkButtonProps): JSX.Element {
  const [local, others] = splitProps(props, ['variant', 'size', 'class']);

  return (
    <a
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  );
}

export { buttonVariants };
export type { ButtonProps, ButtonVariants, LinkButtonProps };
