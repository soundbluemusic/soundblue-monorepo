import type { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

interface OptimizedImageProps {
  /** Base path without extension (e.g., "/branding-assets/logo-mascot-nb") */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Available sizes for srcset (e.g., [192, 384, 512]) */
  sizes?: number[];
  /** CSS sizes attribute for responsive images */
  sizesAttr?: string;
  /** Class for the img element */
  class?: string;
  /** Class for the picture wrapper element */
  pictureClass?: string;
  loading?: 'lazy' | 'eager';
  /** Set to true if image is above the fold */
  priority?: boolean;
}

/**
 * OptimizedImage - Automatic AVIF/WebP/PNG format selection
 *
 * Uses <picture> element for optimal format delivery:
 * - AVIF: Best compression, modern browsers (Chrome 85+, Firefox 93+)
 * - WebP: Good compression, wide support (Chrome 32+, Firefox 65+, Safari 14+)
 * - PNG: Fallback for older browsers
 *
 * Features:
 * - Automatic format selection based on browser support
 * - Lazy loading by default (use priority={true} for LCP images)
 * - srcset for responsive images when sizes prop is provided
 * - Prevents CLS with explicit width/height
 */
export function OptimizedImage(props: OptimizedImageProps): JSX.Element {
  const loading = props.priority ? 'eager' : (props.loading ?? 'lazy');
  const fetchPriority = props.priority ? 'high' : undefined;

  // Generate srcset string for a given format
  const generateSrcset = (format: string): string => {
    if (!props.sizes || props.sizes.length === 0) {
      return `${props.src}.${format}`;
    }
    return props.sizes.map((size) => `${props.src}-${size}.${format} ${size}w`).join(', ');
  };

  // Default sizes attribute if not provided
  const sizesAttr = props.sizesAttr ?? `(max-width: ${props.width}px) 100vw, ${props.width}px`;

  // For single image (no sizes array)
  const hasSrcset = props.sizes && props.sizes.length > 0;

  return (
    <picture class={cn('inline-block', props.pictureClass)}>
      {/* AVIF - Best compression, modern browsers */}
      <source
        type="image/avif"
        srcset={generateSrcset('avif')}
        sizes={hasSrcset ? sizesAttr : undefined}
      />
      {/* WebP - Good compression, wide support */}
      <source
        type="image/webp"
        srcset={generateSrcset('webp')}
        sizes={hasSrcset ? sizesAttr : undefined}
      />
      {/* PNG - Fallback */}
      <img
        src={
          hasSrcset
            ? `${props.src}-${props.sizes![props.sizes!.length - 1]}.png`
            : `${props.src}.png`
        }
        srcset={hasSrcset ? generateSrcset('png') : undefined}
        sizes={hasSrcset ? sizesAttr : undefined}
        alt={props.alt}
        width={props.width}
        height={props.height}
        loading={loading}
        decoding="async"
        fetchpriority={fetchPriority}
        class={cn('max-w-full h-auto', props.class)}
      />
    </picture>
  );
}

export default OptimizedImage;
