/**
 * @fileoverview CSSParticles component tests
 *
 * Tests for:
 * - Rendering of particle container
 * - Correct number of particle elements
 * - Proper CSS classes
 * - Accessibility (aria-hidden)
 */

import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { CSSParticles } from './CSSParticles';

describe('CSSParticles', () => {
  describe('Rendering', () => {
    it('should render particle container', () => {
      render(() => <CSSParticles />);
      const container = document.querySelector('.css-particles');
      expect(container).toBeInTheDocument();
    });

    it('should render 12 particle elements', () => {
      render(() => <CSSParticles />);
      const particles = document.querySelectorAll('.particle');
      expect(particles.length).toBe(12);
    });

    it('should render particles with numbered classes', () => {
      render(() => <CSSParticles />);

      for (let i = 1; i <= 12; i++) {
        const particle = document.querySelector(`.particle-${i}`);
        expect(particle).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute on container', () => {
      render(() => <CSSParticles />);
      const container = document.querySelector('.css-particles');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('CSS Classes', () => {
    it('should have css-particles class on container', () => {
      render(() => <CSSParticles />);
      const container = document.querySelector('[aria-hidden="true"]');
      expect(container).toHaveClass('css-particles');
    });

    it('should have particle class on all particle elements', () => {
      render(() => <CSSParticles />);
      const particles = document.querySelectorAll('[class*="particle-"]');

      particles.forEach((particle) => {
        expect(particle).toHaveClass('particle');
      });
    });
  });

  describe('Structure', () => {
    it('should have particles as children of container', () => {
      render(() => <CSSParticles />);
      const container = document.querySelector('.css-particles');
      const children = container?.children;

      expect(children?.length).toBe(12);
    });

    it('should only contain div elements', () => {
      render(() => <CSSParticles />);
      const container = document.querySelector('.css-particles');

      expect(container?.tagName).toBe('DIV');
      Array.from(container?.children || []).forEach((child) => {
        expect(child.tagName).toBe('DIV');
      });
    });
  });
});
