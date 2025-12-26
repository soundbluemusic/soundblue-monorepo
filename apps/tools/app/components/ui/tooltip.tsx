'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './tooltip.module.scss';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  children?: ReactNode;
}

function TooltipContent({ className, sideOffset = 4, children, ...props }: TooltipContentProps) {
  const classNames = [styles.content, className].filter(Boolean).join(' ');

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content sideOffset={sideOffset} className={classNames} {...props}>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
