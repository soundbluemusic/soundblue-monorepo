'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef } from 'react';

interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  className?: string;
}

function Switch({ className, ...props }: SwitchProps) {
  const baseStyles =
    'inline-flex items-center h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-none p-0.5 bg-secondary transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[hsl(142,71%,45%)]';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');

  return (
    <SwitchPrimitive.Root className={classNames} {...props}>
      <SwitchPrimitive.Thumb className="pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
