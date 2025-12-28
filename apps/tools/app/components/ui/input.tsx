import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border-none bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px] shadow-border/50 transition-all duration-200 ease-out placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-secondary/80 hover:shadow-border focus-visible:outline-none focus-visible:bg-background focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/60',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
