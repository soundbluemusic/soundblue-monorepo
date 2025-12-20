/**
 * @fileoverview ThemeIcon component tests
 *
 * Tests for:
 * - Dark theme icon (moon)
 * - Light theme icon (sun)
 * - Custom size prop
 * - Custom class prop
 */

import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { ThemeIcon } from './ThemeIcon';

describe('ThemeIcon', () => {
  describe('Dark theme (moon icon)', () => {
    it('should render moon icon for dark theme', () => {
      render(() => <ThemeIcon theme="dark" />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have moon path for dark theme', () => {
      render(() => <ThemeIcon theme="dark" />);

      // Moon icon has the characteristic path
      const path = document.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', expect.stringContaining('12.79'));
    });

    it('should not have circle element for dark theme', () => {
      render(() => <ThemeIcon theme="dark" />);

      const circle = document.querySelector('circle');
      expect(circle).not.toBeInTheDocument();
    });
  });

  describe('Light theme (sun icon)', () => {
    it('should render sun icon for light theme', () => {
      render(() => <ThemeIcon theme="light" />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have circle for sun center', () => {
      render(() => <ThemeIcon theme="light" />);

      const circle = document.querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '5');
    });

    it('should have sun rays path', () => {
      render(() => <ThemeIcon theme="light" />);

      const path = document.querySelector('path');
      expect(path).toBeInTheDocument();
      // Sun rays path contains coordinates for the ray lines
      expect(path).toHaveAttribute('d', expect.stringContaining('M12 1v2'));
    });
  });

  describe('Size prop', () => {
    it('should use default size of 18', () => {
      render(() => <ThemeIcon theme="light" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '18');
      expect(svg).toHaveAttribute('height', '18');
    });

    it('should accept custom size', () => {
      render(() => <ThemeIcon theme="light" size={24} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('should apply size to dark theme icon', () => {
      render(() => <ThemeIcon theme="dark" size={32} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should accept small size', () => {
      render(() => <ThemeIcon theme="light" size={12} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
      expect(svg).toHaveAttribute('height', '12');
    });

    it('should accept large size', () => {
      render(() => <ThemeIcon theme="dark" size={48} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });
  });

  describe('Class prop', () => {
    it('should use default theme-icon class', () => {
      render(() => <ThemeIcon theme="light" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('theme-icon');
    });

    it('should accept custom class', () => {
      render(() => <ThemeIcon theme="light" class="custom-icon" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
      expect(svg).not.toHaveClass('theme-icon');
    });

    it('should apply custom class to dark theme', () => {
      render(() => <ThemeIcon theme="dark" class="dark-custom" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('dark-custom');
    });
  });

  describe('SVG attributes', () => {
    it('should have correct viewBox', () => {
      render(() => <ThemeIcon theme="light" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should have fill none', () => {
      render(() => <ThemeIcon theme="dark" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should have stroke currentColor', () => {
      render(() => <ThemeIcon theme="light" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('Theme switching', () => {
    it('should render different icons for different themes', () => {
      const { unmount } = render(() => <ThemeIcon theme="light" />);
      let circle = document.querySelector('circle');
      expect(circle).toBeInTheDocument();
      unmount();

      render(() => <ThemeIcon theme="dark" />);
      circle = document.querySelector('circle');
      expect(circle).not.toBeInTheDocument();
    });
  });
});
