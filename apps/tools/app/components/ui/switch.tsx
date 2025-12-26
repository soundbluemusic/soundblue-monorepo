'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './switch.module.scss';

interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  className?: string;
}

function Switch({ className, ...props }: SwitchProps) {
  const classNames = [styles.switch, className].filter(Boolean).join(' ');

  return (
    <SwitchPrimitive.Root className={classNames} {...props}>
      <SwitchPrimitive.Thumb className={styles.thumb} />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
