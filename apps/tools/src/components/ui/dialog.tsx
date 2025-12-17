import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import { X } from 'lucide-solid';
import { type Component, type JSX, type ParentComponent, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

const Dialog = KobalteDialog;

const DialogTrigger = KobalteDialog.Trigger;

const DialogPortal = KobalteDialog.Portal;

const DialogClose = KobalteDialog.CloseButton;

type DialogOverlayProps = JSX.HTMLAttributes<HTMLDivElement>;

const DialogOverlay: Component<DialogOverlayProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <KobalteDialog.Overlay
      class={cn(
        'fixed inset-0 z-50',
        'bg-black/40 backdrop-blur-sm',
        'data-[expanded]:animate-fade-in data-[closed]:animate-fade-out',
        local.class
      )}
      {...others}
    />
  );
};

type DialogContentProps = JSX.HTMLAttributes<HTMLDivElement>;

const DialogContent: ParentComponent<DialogContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <DialogPortal>
      <DialogOverlay />
      <KobalteDialog.Content
        class={cn(
          // Position
          'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
          // Size
          'w-[calc(100%-2rem)] max-w-lg',
          // Apple-style card
          'rounded-2xl border border-border/50',
          'bg-background/95 backdrop-blur-xl backdrop-saturate-150',
          'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
          // Padding
          'p-6',
          // Animation
          'data-[expanded]:animate-scale-in data-[closed]:animate-scale-out',
          local.class
        )}
        {...others}
      >
        {local.children}
        <KobalteDialog.CloseButton
          class={cn(
            'absolute right-4 top-4',
            'flex h-8 w-8 items-center justify-center rounded-full',
            'bg-secondary/80 text-muted-foreground',
            'transition-all duration-200 ease-out',
            'hover:bg-secondary hover:text-foreground hover:scale-105',
            'active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </KobalteDialog.CloseButton>
      </KobalteDialog.Content>
    </DialogPortal>
  );
};

type DialogHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

const DialogHeader: ParentComponent<DialogHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <div class={cn('flex flex-col space-y-2 text-center sm:text-left', local.class)} {...others}>
      {local.children}
    </div>
  );
};

type DialogFooterProps = JSX.HTMLAttributes<HTMLDivElement>;

const DialogFooter: ParentComponent<DialogFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <div
      class={cn('flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end', local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

type DialogTitleProps = JSX.HTMLAttributes<HTMLHeadingElement>;

const DialogTitle: ParentComponent<DialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <KobalteDialog.Title
      class={cn('text-lg font-semibold tracking-tight text-foreground', local.class)}
      {...others}
    >
      {local.children}
    </KobalteDialog.Title>
  );
};

type DialogDescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;

const DialogDescription: ParentComponent<DialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);

  return (
    <KobalteDialog.Description
      class={cn('text-sm text-muted-foreground leading-relaxed', local.class)}
      {...others}
    >
      {local.children}
    </KobalteDialog.Description>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
