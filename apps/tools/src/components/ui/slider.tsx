import { Slider as KobalteSlider } from '@kobalte/core/slider';
import { type Component, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

interface SliderProps {
  class?: string;
  value?: number[];
  defaultValue?: number[];
  onChange?: (value: number[]) => void;
  onChangeEnd?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  inverted?: boolean;
  minStepsBetweenThumbs?: number;
}

const Slider: Component<SliderProps> = (props) => {
  const [local, others] = splitProps(props, [
    'class',
    'value',
    'defaultValue',
    'onChange',
    'onChangeEnd',
    'min',
    'max',
    'step',
    'disabled',
    'orientation',
    'inverted',
    'minStepsBetweenThumbs',
  ]);

  return (
    <KobalteSlider
      class={cn('relative flex w-full touch-none select-none items-center py-2', local.class)}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      onChangeEnd={local.onChangeEnd}
      minValue={local.min}
      maxValue={local.max}
      step={local.step}
      disabled={local.disabled}
      orientation={local.orientation}
      inverted={local.inverted}
      minStepsBetweenThumbs={local.minStepsBetweenThumbs}
      {...others}
    >
      <KobalteSlider.Track
        class={cn(
          'relative h-1.5 w-full grow overflow-hidden rounded-full',
          'bg-secondary',
          'transition-colors duration-200'
        )}
      >
        <KobalteSlider.Fill
          class={cn('absolute h-full rounded-full', 'bg-primary', 'transition-all duration-75')}
        />
      </KobalteSlider.Track>
      <KobalteSlider.Thumb
        class={cn(
          'relative block h-7 w-7 rounded-full',
          'bg-white border-0',
          'shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]',
          'transition-all duration-200 ease-out',
          'hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:scale-105',
          'disabled:pointer-events-none disabled:opacity-50',
          // Larger touch target (44px minimum)
          'before:absolute before:inset-[-8px] before:content-[""]'
        )}
      >
        <KobalteSlider.Input />
      </KobalteSlider.Thumb>
    </KobalteSlider>
  );
};

export { Slider };
