import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-(--radius-sm)',
    circular: 'rounded-full',
    rectangular: 'rounded-(--radius-md)',
  };

  const defaultHeight = variant === 'text' ? '1em' : undefined;

  return (
    <div
      className={`animate-pulse bg-(--color-bg-tertiary) ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : (height ?? defaultHeight),
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
