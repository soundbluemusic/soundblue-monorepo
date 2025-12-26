'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  const baseStyles =
    'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <DialogPrimitive.Overlay className={classNames} {...props} />;
}

interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  children?: ReactNode;
}

function DialogContent({ className, children, ...props }: DialogContentProps) {
  const baseStyles =
    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border/50 bg-background/95 backdrop-blur-[24px] backdrop-saturate-150 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-6 data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content className={classNames} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 flex items-center justify-center h-8 w-8 rounded-full border-none bg-secondary/80 text-muted-foreground cursor-pointer transition-all duration-200 ease-out hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const baseStyles = 'flex flex-col gap-2 text-center sm:text-left';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

function DialogFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const baseStyles = 'flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  const baseStyles = 'text-lg font-semibold tracking-tight text-foreground';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <DialogPrimitive.Title className={classNames} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  const baseStyles = 'text-sm text-muted-foreground leading-relaxed';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');
  return <DialogPrimitive.Description className={classNames} {...props} />;
}

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
