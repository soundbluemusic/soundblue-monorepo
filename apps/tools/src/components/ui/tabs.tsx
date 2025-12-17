import { Tabs as KobalteTabs } from '@kobalte/core/tabs';
import { type JSX, type ParentComponent, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

const Tabs = KobalteTabs;

type TabsListProps = JSX.HTMLAttributes<HTMLDivElement>;

const TabsList: ParentComponent<TabsListProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <KobalteTabs.List
      class={cn(
        // Apple-style segmented control container
        'inline-flex items-center justify-center',
        'rounded-xl bg-secondary/80 p-1',
        'backdrop-blur-sm',
        local.class
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.List>
  );
};

interface TabsTriggerProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

const TabsTrigger: ParentComponent<TabsTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'value', 'disabled']);

  return (
    <KobalteTabs.Trigger
      value={local.value}
      disabled={local.disabled}
      class={cn(
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
        'data-[selected]:bg-background data-[selected]:text-foreground',
        'data-[selected]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]',
        local.class
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.Trigger>
  );
};

interface TabsContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent: ParentComponent<TabsContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'value']);

  return (
    <KobalteTabs.Content
      value={local.value}
      class={cn(
        'mt-4',
        'animate-fade-in',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        local.class
      )}
      {...others}
    >
      {local.children}
    </KobalteTabs.Content>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
