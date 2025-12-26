import * as SliderPrimitive from '@radix-ui/react-slider';
import type { ComponentProps } from 'react';
import styles from './slider.module.scss';

interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
  ...props
}: SliderProps & Omit<ComponentProps<typeof SliderPrimitive.Root>, 'value' | 'defaultValue'>) {
  const classNames = [styles.root, className].filter(Boolean).join(' ');

  return (
    <SliderPrimitive.Root
      className={classNames}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
      {...props}
    >
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={styles.thumb} />
    </SliderPrimitive.Root>
  );
}
