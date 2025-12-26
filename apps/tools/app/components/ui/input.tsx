import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
  const baseStyles =
    'flex h-11 w-full rounded-xl border-none bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px] shadow-border/50 transition-all duration-200 ease-out placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-secondary/80 hover:shadow-border focus-visible:outline-none focus-visible:bg-background focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/60';

  const classNames = [baseStyles, className].filter(Boolean).join(' ');

  return <input type={type} className={classNames} {...props} />;
}

export { Input };
