'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './tabs.module.scss';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const classNames = [styles.list, className].filter(Boolean).join(' ');
  return <TabsPrimitive.List className={classNames} {...props} />;
}

function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  const classNames = [styles.trigger, className].filter(Boolean).join(' ');
  return <TabsPrimitive.Trigger className={classNames} {...props} />;
}

function TabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  const classNames = [styles.content, className].filter(Boolean).join(' ');
  return <TabsPrimitive.Content className={classNames} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
