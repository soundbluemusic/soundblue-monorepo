// ========================================
// @soundblue/icons - CloseIcon
// ========================================

import type { IconProps } from '../types';

export function CloseIcon({ size = 24, title, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={!title}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
