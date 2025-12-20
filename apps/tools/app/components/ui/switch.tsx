'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '~/lib/utils';

interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  className?: string;
}

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex items-center',
        // Base - iOS style switch
        'h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full',
        'border-0 p-0.5',
        'transition-all duration-300 ease-out',
        // Unchecked state - subtle gray
        'bg-secondary',
        // Checked state - Apple green (or use primary)
        'data-[state=checked]:bg-[hsl(142,71%,45%)]',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          // Base - circular thumb
          'pointer-events-none block h-[27px] w-[27px] rounded-full',
          'bg-white',
          // Apple-style shadow
          'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]',
          // Transition
          'transition-transform duration-300 ease-out',
          // Position states
          'data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
