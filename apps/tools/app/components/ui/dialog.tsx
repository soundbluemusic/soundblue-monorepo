'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';
import styles from './dialog.module.scss';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  const classNames = [styles.overlay, className].filter(Boolean).join(' ');
  return <DialogPrimitive.Overlay className={classNames} {...props} />;
}

interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  children?: ReactNode;
}

function DialogContent({ className, children, ...props }: DialogContentProps) {
  const classNames = [styles.content, className].filter(Boolean).join(' ');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content className={classNames} {...props}>
        {children}
        <DialogPrimitive.Close className={styles.closeButton}>
          <X style={{ height: '1rem', width: '1rem' }} />
          <span className={styles.srOnly}>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const classNames = [styles.header, className].filter(Boolean).join(' ');
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

function DialogFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const classNames = [styles.footer, className].filter(Boolean).join(' ');
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
  const classNames = [styles.title, className].filter(Boolean).join(' ');
  return <DialogPrimitive.Title className={classNames} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  const classNames = [styles.description, className].filter(Boolean).join(' ');
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
