/**
 * @fileoverview HomeContent component tests
 *
 * Tests for:
 * - Brand name rendering
 * - Tagline and description rendering
 * - Social links (YouTube, Discography)
 * - Accessibility attributes on links
 * - CSSParticles background
 */

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

// Mock useLanguage
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      home: {
        tagline: 'Music for your soul',
        description: 'Creating ambient and electronic music',
        genres: 'Ambient • Electronic • Cinematic',
        cta: 'Watch on YouTube',
        discography: 'Discography',
      },
    }),
  }),
}));

// Mock CSSParticles
vi.mock('~/components/background', () => ({
  CSSParticles: () => <div data-testid="css-particles" />,
}));

// Mock BRAND constant
vi.mock('~/constants', () => ({
  BRAND: {
    name: 'Sound Blue',
  },
}));

import { HomeContent } from './HomeContent';

describe('HomeContent', () => {
  describe('Brand rendering', () => {
    it('should render brand name as h1', () => {
      render(() => <HomeContent />);

      expect(screen.getByRole('heading', { level: 1, name: 'Sound Blue' })).toBeInTheDocument();
    });

    it('should render tagline', () => {
      render(() => <HomeContent />);

      expect(screen.getByText('Music for your soul')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(() => <HomeContent />);

      expect(screen.getByText('Creating ambient and electronic music')).toBeInTheDocument();
    });

    it('should render genres', () => {
      render(() => <HomeContent />);

      expect(screen.getByText('Ambient • Electronic • Cinematic')).toBeInTheDocument();
    });
  });

  describe('CSSParticles background', () => {
    it('should render CSSParticles component', () => {
      render(() => <HomeContent />);

      expect(screen.getByTestId('css-particles')).toBeInTheDocument();
    });
  });

  describe('Social links', () => {
    describe('YouTube link', () => {
      it('should render YouTube link', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /YouTube/i });
        expect(link).toBeInTheDocument();
      });

      it('should have correct YouTube URL', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /YouTube/i });
        expect(link).toHaveAttribute('href', 'https://www.youtube.com/@SoundBlueMusic');
      });

      it('should open YouTube in new tab', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /YouTube/i });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('should have accessible aria-label', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /YouTube/i });
        expect(link).toHaveAttribute('aria-label', 'YouTube - SoundBlueMusic');
      });

      it('should render CTA text', () => {
        render(() => <HomeContent />);

        expect(screen.getByText('Watch on YouTube')).toBeInTheDocument();
      });
    });

    describe('Discography link', () => {
      it('should render Discography link', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /Discography/i });
        expect(link).toBeInTheDocument();
      });

      it('should have correct Discography URL', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /Discography/i });
        expect(link).toHaveAttribute('href', 'https://soundblue.music');
      });

      it('should open Discography in new tab', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /Discography/i });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('should have accessible aria-label', () => {
        render(() => <HomeContent />);

        const link = screen.getByRole('link', { name: /Discography/i });
        expect(link).toHaveAttribute('aria-label', 'Discography - Sound Blue');
      });

      it('should render Discography text', () => {
        render(() => <HomeContent />);

        expect(screen.getByText('Discography')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(() => <HomeContent />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have hidden icons from screen readers', () => {
      render(() => <HomeContent />);

      const hiddenIcons = document.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('CSS classes', () => {
    it('should have social-link class on links', () => {
      render(() => <HomeContent />);

      const youtubeLink = screen.getByRole('link', { name: /YouTube/i });
      expect(youtubeLink).toHaveClass('social-link');
      expect(youtubeLink).toHaveClass('social-youtube');

      const discographyLink = screen.getByRole('link', { name: /Discography/i });
      expect(discographyLink).toHaveClass('social-link');
      expect(discographyLink).toHaveClass('social-discography');
    });
  });
});
