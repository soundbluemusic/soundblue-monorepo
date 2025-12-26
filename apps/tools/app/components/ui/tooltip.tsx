'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  children?: ReactNode;
}

function TooltipContent({ className, sideOffset = 4, children, ...props }: TooltipContentProps) {
  const baseStyles =
    'z-50 overflow-hidden rounded-lg px-3 py-2 bg-foreground/90 backdrop-blur-sm text-[13px] font-medium text-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] animate-tooltip-fade-in data-[state=closed]:animate-tooltip-fade-out data-[side=bottom]:animate-slide-from-top data-[side=top]:animate-slide-from-bottom data-[side=left]:animate-slide-from-right data-[side=right]:animate-slide-from-left';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content sideOffset={sideOffset} className={classNames} {...props}>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
