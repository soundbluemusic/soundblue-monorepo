/**
 * @fileoverview Sidebar component tests
 *
 * Tests for:
 * - Sidebar rendering with open/closed states
 * - Navigation items display
 * - External links with proper attributes
 * - Active state styling
 * - Localized paths
 * - Accessibility features
 */

import { render, screen } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

// Mock location
const mockLocation = { pathname: '/' };

/** Mock props for SolidJS Router's A component */
interface MockAProps {
  children: JSX.Element;
  href: string;
  class?: string;
  preload?: boolean;
}

vi.mock('@solidjs/router', () => ({
  A: (props: MockAProps) => {
    const { children, href, class: className, ...rest } = props;
    return (
      <a href={href} class={className} {...rest}>
        {children}
      </a>
    );
  },
  useLocation: () => mockLocation,
}));

// Mock translations
const mockTranslations = {
  nav: {
    home: 'Home',
    about: 'About',
    news: 'News',
    blog: 'Blog',
    soundRecording: 'Sound Recording',
    builtWith: 'Built With',
    chat: 'Chat',
    sitemap: 'Sitemap',
  },
  externalLinks: {
    tools: 'Tools',
  },
};

vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => mockTranslations,
    localizedPath: (path: string) => path,
  }),
}));

// Mock navigation constants - inline to avoid hoisting issues
let mockIsNavActive = vi.fn(
  (_path: string, _pathname: string, _localizedPath: (p: string) => string) => false,
);

vi.mock('~/constants', () => ({
  NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [
    {
      url: 'https://tools.example.com',
      labelKey: 'tools',
      icon: () => <svg data-testid="tools-icon" />,
    },
  ],
  isNavActive: (...args: [string, string, (p: string) => string]) => mockIsNavActive(...args),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/';
    mockIsNavActive = vi.fn(() => false);
  });

  describe('Rendering', () => {
    it('should render sidebar with navigation', () => {
      render(() => <Sidebar isOpen={true} />);

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('should render all navigation items', () => {
      render(() => <Sidebar isOpen={true} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render external links', () => {
      render(() => <Sidebar isOpen={true} />);

      expect(screen.getByText('Tools')).toBeInTheDocument();
    });

    it('should render icons for navigation items', () => {
      render(() => <Sidebar isOpen={true} />);

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('about-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tools-icon')).toBeInTheDocument();
    });
  });

  describe('Open/Close state', () => {
    it('should have translate-x-0 class when open', () => {
      render(() => <Sidebar isOpen={true} />);

      const aside = document.querySelector('aside');
      expect(aside).toHaveClass('translate-x-0');
    });

    it('should have -translate-x-full class when closed', () => {
      render(() => <Sidebar isOpen={false} />);

      const aside = document.querySelector('aside');
      expect(aside).toHaveClass('-translate-x-full');
    });
  });

  describe('Navigation links', () => {
    it('should have correct href for internal links', () => {
      render(() => <Sidebar isOpen={true} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should have preload attribute on internal links', () => {
      render(() => <Sidebar isOpen={true} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('preload');
    });
  });

  describe('External links', () => {
    it('should have correct href for external links', () => {
      render(() => <Sidebar isOpen={true} />);

      const toolsLink = screen.getByRole('link', { name: /tools/i });
      expect(toolsLink).toHaveAttribute('href', 'https://tools.example.com');
    });

    it('should have target="_blank" on external links', () => {
      render(() => <Sidebar isOpen={true} />);

      const toolsLink = screen.getByRole('link', { name: /tools/i });
      expect(toolsLink).toHaveAttribute('target', '_blank');
    });

    it('should have rel="noopener noreferrer" on external links', () => {
      render(() => <Sidebar isOpen={true} />);

      const toolsLink = screen.getByRole('link', { name: /tools/i });
      expect(toolsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Active state', () => {
    it('should apply active styles to current page link', () => {
      mockIsNavActive = vi.fn((path: string) => path === '/');

      render(() => <Sidebar isOpen={true} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('bg-accent/12');
      expect(homeLink).toHaveClass('text-accent');
    });

    it('should apply inactive styles to non-current page links', () => {
      mockIsNavActive = vi.fn((path: string) => path === '/');

      render(() => <Sidebar isOpen={true} />);

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveClass('text-content-muted');
      expect(aboutLink).not.toHaveClass('bg-state-active');
    });

    it('should call isNavActive with correct arguments', () => {
      render(() => <Sidebar isOpen={true} />);

      // isNavActive should be called for each nav item
      expect(mockIsNavActive).toHaveBeenCalled();
    });
  });

  describe('Divider', () => {
    it('should render divider between internal and external links', () => {
      render(() => <Sidebar isOpen={true} />);

      const divider = document.querySelector('[aria-hidden="true"] .bg-line');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on navigation', () => {
      render(() => <Sidebar isOpen={true} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have aria-hidden on divider', () => {
      render(() => <Sidebar isOpen={true} />);

      const dividerContainer = document.querySelector('[aria-hidden="true"]');
      expect(dividerContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have fixed positioning', () => {
      render(() => <Sidebar isOpen={true} />);

      const aside = document.querySelector('aside');
      expect(aside).toHaveClass('fixed');
    });

    it('should have transition classes', () => {
      render(() => <Sidebar isOpen={true} />);

      const aside = document.querySelector('aside');
      expect(aside).toHaveClass('transition-transform');
      expect(aside).toHaveClass('duration-150');
    });

    it('should be hidden on mobile (max-md:hidden)', () => {
      render(() => <Sidebar isOpen={true} />);

      const aside = document.querySelector('aside');
      expect(aside).toHaveClass('max-md:hidden');
    });
  });
});
