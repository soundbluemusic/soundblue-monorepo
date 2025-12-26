import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  children?: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: styles.default,
  destructive: styles.destructive,
  outline: styles.outline,
  secondary: styles.secondary,
  ghost: styles.ghost,
  link: styles.link,
  glass: styles.glass,
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  icon: styles.sizeIcon,
  'icon-sm': styles.sizeIconSm,
  'icon-lg': styles.sizeIconLg,
};

function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classNames = [styles.button, variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}

export { Button };
