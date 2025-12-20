'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '~/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // Apple-style segmented control container
        'inline-flex items-center justify-center',
        'rounded-xl bg-secondary/80 p-1',
        'backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        // Base styles
        'inline-flex items-center justify-center whitespace-nowrap',
        'rounded-lg px-4 py-2',
        'text-[13px] font-medium',
        // Transition
        'transition-all duration-200 ease-out',
        // Default state
        'text-muted-foreground',
        // Hover state
        'hover:text-foreground',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Disabled state
        'disabled:pointer-events-none disabled:opacity-50',
        // Selected state - Apple style
        'data-[state=active]:bg-background data-[state=active]:text-foreground',
        'data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-4',
        'animate-in fade-in-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
