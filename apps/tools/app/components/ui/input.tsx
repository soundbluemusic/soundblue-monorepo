import type { InputHTMLAttributes } from 'react';
import styles from './input.module.scss';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
  const classNames = [styles.input, className].filter(Boolean).join(' ');

  return <input type={type} className={classNames} {...props} />;
}

export { Input };
