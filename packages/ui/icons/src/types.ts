// ========================================
// @soundblue/icons - Types
// Icon component types
// ========================================

import type { SVGProps } from 'react';

/**
 * Base icon props
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  title?: string;
}
