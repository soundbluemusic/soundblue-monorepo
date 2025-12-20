import { Tooltip as KobalteTooltip } from '@kobalte/core/tooltip';
import { type JSX, type ParentComponent, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

const TooltipProvider = (props: { children: JSX.Element }) => props.children;

const Tooltip = KobalteTooltip;

const TooltipTrigger = KobalteTooltip.Trigger;

type TooltipContentProps = JSX.HTMLAttributes<HTMLDivElement>;

const TooltipContent: ParentComponent<TooltipContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <KobalteTooltip.Portal>
      <KobalteTooltip.Content
        class={cn(
          'z-50 overflow-hidden',
          // Apple-style tooltip
          'rounded-lg px-3 py-2',
          'bg-foreground/90 backdrop-blur-md',
          'text-[13px] font-medium text-background',
          // Shadow
          'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
          // Animation
          'animate-fade-in',
          'data-[closed]:animate-fade-out',
          'data-[placement=bottom]:slide-in-from-top-1',
          'data-[placement=left]:slide-in-from-right-1',
          'data-[placement=right]:slide-in-from-left-1',
          'data-[placement=top]:slide-in-from-bottom-1',
          local.class,
        )}
        {...others}
      >
        {local.children}
      </KobalteTooltip.Content>
    </KobalteTooltip.Portal>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
