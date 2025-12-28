import * as SliderPrimitive from '@radix-ui/react-slider';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '~/lib/utils';

const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center py-2', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary transition-colors duration-200">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary transition-all duration-75" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-8 w-8 rounded-full bg-white border-none shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out [@media(hover:none)_and_(pointer:coarse)]:h-11 [@media(hover:none)_and_(pointer:coarse)]:w-11 hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--primary)),0_0_0_4px_hsl(var(--background))] active:scale-105 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
