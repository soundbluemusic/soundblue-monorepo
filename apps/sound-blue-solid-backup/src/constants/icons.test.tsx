/**
 * @fileoverview Icon components tests
 *
 * Tests for all icon components to verify:
 * - Rendering of SVG elements
 * - Proper attributes (viewBox, stroke, fill)
 * - aria-hidden attribute for accessibility
 * - Custom class prop support
 */

import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import {
  AboutIcon,
  BlogIcon,
  BuiltWithIcon,
  ChatIcon,
  ExternalLinkIcon,
  HelpIcon,
  HomeIcon,
  NewsIcon,
  SitemapIcon,
  SoundRecordingIcon,
  ToolsIcon,
} from './icons';

describe('Icon Components', () => {
  describe('HomeIcon', () => {
    it('should render SVG element', () => {
      render(() => <HomeIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct viewBox', () => {
      render(() => <HomeIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should have stroke currentColor', () => {
      render(() => <HomeIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('should have fill none', () => {
      render(() => <HomeIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should have aria-hidden attribute', () => {
      render(() => <HomeIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should accept custom class', () => {
      render(() => <HomeIcon class="custom-class" />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });
  });

  describe('SitemapIcon', () => {
    it('should render SVG with rect elements', () => {
      render(() => <SitemapIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const rects = document.querySelectorAll('rect');
      expect(rects.length).toBe(4);
    });

    it('should have aria-hidden attribute', () => {
      render(() => <SitemapIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('ExternalLinkIcon', () => {
    it('should render SVG element', () => {
      render(() => <ExternalLinkIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct attributes', () => {
      render(() => <ExternalLinkIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke-width', '2');
    });
  });

  describe('NewsIcon', () => {
    it('should render SVG element', () => {
      render(() => <NewsIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should accept custom class', () => {
      render(() => <NewsIcon class="news-icon" />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('news-icon');
    });
  });

  describe('BlogIcon', () => {
    it('should render SVG element', () => {
      render(() => <BlogIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have circle element', () => {
      render(() => <BlogIcon />);
      const circle = document.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('SoundRecordingIcon', () => {
    it('should render SVG element', () => {
      render(() => <SoundRecordingIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have path and line elements', () => {
      render(() => <SoundRecordingIcon />);
      const paths = document.querySelectorAll('path');
      const lines = document.querySelectorAll('line');
      expect(paths.length).toBeGreaterThan(0);
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('BuiltWithIcon', () => {
    it('should render SVG element', () => {
      render(() => <BuiltWithIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have polyline elements for code brackets', () => {
      render(() => <BuiltWithIcon />);
      const polylines = document.querySelectorAll('polyline');
      expect(polylines.length).toBe(2);
    });
  });

  describe('AboutIcon', () => {
    it('should render SVG element', () => {
      render(() => <AboutIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have circle for info icon', () => {
      render(() => <AboutIcon />);
      const circle = document.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('ChatIcon', () => {
    it('should render SVG element', () => {
      render(() => <ChatIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have path element', () => {
      render(() => <ChatIcon />);
      const path = document.querySelector('path');
      expect(path).toBeInTheDocument();
    });
  });

  describe('ToolsIcon', () => {
    it('should render SVG element', () => {
      render(() => <ToolsIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have aria-hidden attribute', () => {
      render(() => <ToolsIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HelpIcon', () => {
    it('should render SVG element', () => {
      render(() => <HelpIcon />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have circle element', () => {
      render(() => <HelpIcon />);
      const circle = document.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });

    it('should have question mark paths', () => {
      render(() => <HelpIcon />);
      const paths = document.querySelectorAll('path');
      expect(paths.length).toBe(2);
    });
  });

  describe('All Icons Common Properties', () => {
    const icons = [
      { name: 'HomeIcon', Component: HomeIcon },
      { name: 'SitemapIcon', Component: SitemapIcon },
      { name: 'ExternalLinkIcon', Component: ExternalLinkIcon },
      { name: 'NewsIcon', Component: NewsIcon },
      { name: 'BlogIcon', Component: BlogIcon },
      { name: 'SoundRecordingIcon', Component: SoundRecordingIcon },
      { name: 'BuiltWithIcon', Component: BuiltWithIcon },
      { name: 'AboutIcon', Component: AboutIcon },
      { name: 'ChatIcon', Component: ChatIcon },
      { name: 'ToolsIcon', Component: ToolsIcon },
      { name: 'HelpIcon', Component: HelpIcon },
    ];

    it.each(icons)('$name should have correct stroke-width', ({ Component }) => {
      render(() => <Component />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '2');
    });

    it.each(icons)('$name should have viewBox 0 0 24 24', ({ Component }) => {
      render(() => <Component />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });
});
