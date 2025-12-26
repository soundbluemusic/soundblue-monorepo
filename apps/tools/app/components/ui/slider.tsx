import * as SliderPrimitive from '@radix-ui/react-slider';
import type { ComponentProps } from 'react';

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
  const rootStyles = 'relative flex w-full touch-none select-none items-center py-2';

  const classNames = [rootStyles, className].filter(Boolean).join(' ');

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
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary transition-colors duration-200">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary transition-all duration-75" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-8 w-8 rounded-full bg-white border-none shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out [@media(hover:none)_and_(pointer:coarse)]:h-11 [@media(hover:none)_and_(pointer:coarse)]:w-11 hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--primary)),0_0_0_4px_hsl(var(--background))] active:scale-105 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}
