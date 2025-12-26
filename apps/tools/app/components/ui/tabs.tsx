'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef } from 'react';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl bg-secondary/80 p-1 backdrop-blur-sm';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <TabsPrimitive.List className={classNames} {...props} />;
}

function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  const baseStyles =
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium text-muted-foreground bg-transparent border-none cursor-pointer transition-all duration-200 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <TabsPrimitive.Trigger className={classNames} {...props} />;
}

function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  const baseStyles =
    'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <TabsPrimitive.Content className={classNames} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
