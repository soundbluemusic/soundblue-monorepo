import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Shows error state styling */
  isError?: boolean;
  /** Error message to display below input */
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border-none bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px] shadow-border/50 transition-all duration-200 ease-out placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-secondary/80 hover:shadow-border focus-visible:outline-none focus-visible:bg-background focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/60',
            isError &&
              'shadow-destructive/50 hover:shadow-destructive focus-visible:shadow-destructive',
            className,
          )}
          ref={ref}
          aria-invalid={isError}
          aria-describedby={errorMessage ? `${props.id}-error` : undefined}
          {...props}
        />
        {isError && errorMessage && (
          <p id={`${props.id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
