// ========================================
// @soundblue/ui-components/icons - StopIcon
// ========================================

import type { IconProps } from '../types';

export function StopIcon({ size = 24, title, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={!title}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
