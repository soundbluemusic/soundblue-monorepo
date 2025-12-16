/**
 * @fileoverview OptimizedImage component tests
 *
 * Tests for:
 * - Picture element structure with AVIF, WebP, PNG sources
 * - srcset generation with sizes array
 * - Loading attribute (lazy by default, eager with priority)
 * - fetchpriority attribute for priority images
 * - Alt text accessibility
 * - Custom classes
 */

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { OptimizedImage } from './OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/images/test-image',
    alt: 'Test image description',
    width: 400,
    height: 300,
  };

  describe('Basic rendering', () => {
    it('should render picture element', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const picture = document.querySelector('picture');
      expect(picture).toBeInTheDocument();
    });

    it('should render img element with correct alt', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      expect(screen.getByAltText('Test image description')).toBeInTheDocument();
    });

    it('should render img with correct dimensions', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '400');
      expect(img).toHaveAttribute('height', '300');
    });
  });

  describe('Source elements', () => {
    it('should render AVIF source', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const avifSource = document.querySelector('source[type="image/avif"]');
      expect(avifSource).toBeInTheDocument();
      expect(avifSource).toHaveAttribute('srcset', '/images/test-image.avif');
    });

    it('should render WebP source', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const webpSource = document.querySelector('source[type="image/webp"]');
      expect(webpSource).toBeInTheDocument();
      expect(webpSource).toHaveAttribute('srcset', '/images/test-image.webp');
    });

    it('should render PNG fallback img src', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/test-image.png');
    });
  });

  describe('Responsive images with sizes', () => {
    const responsiveProps = {
      ...defaultProps,
      sizes: [192, 384, 512],
    };

    it('should generate srcset for AVIF with sizes', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const avifSource = document.querySelector('source[type="image/avif"]');
      expect(avifSource).toHaveAttribute(
        'srcset',
        '/images/test-image-192.avif 192w, /images/test-image-384.avif 384w, /images/test-image-512.avif 512w',
      );
    });

    it('should generate srcset for WebP with sizes', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const webpSource = document.querySelector('source[type="image/webp"]');
      expect(webpSource).toHaveAttribute(
        'srcset',
        '/images/test-image-192.webp 192w, /images/test-image-384.webp 384w, /images/test-image-512.webp 512w',
      );
    });

    it('should generate srcset for PNG with sizes', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute(
        'srcset',
        '/images/test-image-192.png 192w, /images/test-image-384.png 384w, /images/test-image-512.png 512w',
      );
    });

    it('should use largest size for fallback src', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/test-image-512.png');
    });

    it('should include sizes attribute on sources', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const avifSource = document.querySelector('source[type="image/avif"]');
      expect(avifSource).toHaveAttribute('sizes');
    });

    it('should use default sizes attribute if not provided', () => {
      render(() => <OptimizedImage {...responsiveProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 400px) 100vw, 400px');
    });

    it('should use custom sizes attribute when provided', () => {
      render(() => (
        <OptimizedImage {...responsiveProps} sizesAttr="(max-width: 768px) 50vw, 25vw" />
      ));

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 50vw, 25vw');
    });
  });

  describe('Loading behavior', () => {
    it('should use lazy loading by default', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should use eager loading when priority is true', () => {
      render(() => <OptimizedImage {...defaultProps} priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should use specified loading attribute', () => {
      render(() => <OptimizedImage {...defaultProps} loading="eager" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should override loading with priority', () => {
      render(() => <OptimizedImage {...defaultProps} loading="lazy" priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });
  });

  describe('Fetch priority', () => {
    it('should not have fetchpriority by default', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).not.toHaveAttribute('fetchpriority');
    });

    it('should have fetchpriority high when priority is true', () => {
      render(() => <OptimizedImage {...defaultProps} priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });
  });

  describe('Decoding', () => {
    it('should have async decoding', () => {
      render(() => <OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  describe('Custom classes', () => {
    it('should apply custom class to img', () => {
      render(() => <OptimizedImage {...defaultProps} class="custom-img-class" />);

      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-img-class');
    });

    it('should apply custom class to picture', () => {
      render(() => <OptimizedImage {...defaultProps} pictureClass="custom-picture-class" />);

      const picture = document.querySelector('picture');
      expect(picture).toHaveClass('custom-picture-class');
    });

    it('should preserve default img classes', () => {
      render(() => <OptimizedImage {...defaultProps} class="custom-class" />);

      const img = screen.getByRole('img');
      expect(img).toHaveClass('max-w-full');
      expect(img).toHaveClass('h-auto');
      expect(img).toHaveClass('custom-class');
    });

    it('should preserve default picture classes', () => {
      render(() => <OptimizedImage {...defaultProps} pictureClass="custom-class" />);

      const picture = document.querySelector('picture');
      expect(picture).toHaveClass('inline-block');
      expect(picture).toHaveClass('custom-class');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sizes array', () => {
      render(() => <OptimizedImage {...defaultProps} sizes={[]} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/test-image.png');
    });

    it('should handle single size', () => {
      render(() => <OptimizedImage {...defaultProps} sizes={[256]} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('srcset', '/images/test-image-256.png 256w');
    });
  });
});
