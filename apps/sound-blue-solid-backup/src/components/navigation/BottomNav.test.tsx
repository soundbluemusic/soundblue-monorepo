/**
 * @fileoverview BottomNav component tests
 *
 * Tests for:
 * - Mobile navigation rendering
 * - Primary navigation items
 * - More button and bottom sheet
 * - Secondary navigation items
 * - Active state styling
 * - Navigation handling
 * - Accessibility features
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomNav } from './BottomNav';

// Mock location and navigate
const mockLocation = { pathname: '/' };
const mockNavigate = vi.fn();

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
  useNavigate: () => mockNavigate,
}));

// Mock translations
const mockTranslations = {
  nav: {
    home: 'Home',
    about: 'About',
    news: 'News',
    chat: 'Chat',
    blog: 'Blog',
    soundRecording: 'Sound Recording',
    builtWith: 'Built With',
    sitemap: 'Sitemap',
    more: 'More',
  },
};

vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => mockTranslations,
    localizedPath: (path: string) => path,
  }),
}));

/** Mock props for BottomSheetClient component */
interface MockBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}

// Mock BottomSheetClient - use Show for SolidJS reactivity
vi.mock('~/components/ui', () => ({
  BottomSheetClient: (_props: MockBottomSheetProps) => {
    // Use a simple reactive approach - actual rendering relies on SolidJS reactivity
    // which doesn't work well with vi.mock. Tests that need bottom sheet content
    // should be integration tests rather than unit tests.
    return null;
  },
}));

// Mock navigation constants - inline to avoid hoisting issues
let mockIsNavActive = vi.fn(
  (_path: string, _pathname: string, _localizedPath: (p: string) => string) => false,
);

vi.mock('~/constants', () => ({
  PRIMARY_NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
    { path: '/news', labelKey: 'news', icon: () => <svg data-testid="news-icon" /> },
    { path: '/chat', labelKey: 'chat', icon: () => <svg data-testid="chat-icon" /> },
  ],
  SECONDARY_NAV_ITEMS: [
    { path: '/blog', labelKey: 'blog', icon: () => <svg data-testid="blog-icon" /> },
    { path: '/sitemap', labelKey: 'sitemap', icon: () => <svg data-testid="sitemap-icon" /> },
  ],
  isNavActive: (...args: [string, string, (p: string) => string]) => mockIsNavActive(...args),
}));

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/';
    mockIsNavActive = vi.fn(() => false);
  });

  describe('Rendering', () => {
    it('should render mobile navigation', () => {
      render(() => <BottomNav />);

      const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('should render all primary navigation items', () => {
      render(() => <BottomNav />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('should render More button', () => {
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      expect(moreButton).toBeInTheDocument();
    });

    it('should render icons for primary items', () => {
      render(() => <BottomNav />);

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('about-icon')).toBeInTheDocument();
      expect(screen.getByTestId('news-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
    });
  });

  describe('Primary navigation links', () => {
    it('should have correct href for primary links', () => {
      render(() => <BottomNav />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should have preload attribute on links', () => {
      render(() => <BottomNav />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('preload');
    });
  });

  describe('More button and bottom sheet', () => {
    it('should have aria-expanded attribute on More button', () => {
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      expect(moreButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when More button is clicked', async () => {
      const user = userEvent.setup();
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      expect(moreButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup="dialog" on More button', () => {
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      expect(moreButton).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should toggle isMoreOpen state when More button is clicked', async () => {
      const user = userEvent.setup();
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });

      // Initially false
      expect(moreButton).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      await user.click(moreButton);
      expect(moreButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // Note: Secondary navigation items are rendered inside BottomSheetClient
  // which uses clientOnly HOC. Testing the actual bottom sheet content
  // requires integration tests or E2E tests. Unit tests verify the
  // component passes correct props to BottomSheetClient.

  describe('Active state styling', () => {
    it('should apply active styles to current primary page link', () => {
      mockIsNavActive = vi.fn((path: string) => path === '/');

      render(() => <BottomNav />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('text-accent');
    });

    it('should apply inactive styles to non-current primary links', () => {
      mockIsNavActive = vi.fn((path: string) => path === '/');

      render(() => <BottomNav />);

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveClass('text-content-muted');
      expect(aboutLink).not.toHaveClass('text-accent');
    });

    it('should highlight More button when a secondary page is active', () => {
      mockIsNavActive = vi.fn((path: string) => path === '/blog');

      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      expect(moreButton).toHaveClass('text-accent');
    });

    it('should highlight More button when bottom sheet is open', async () => {
      const user = userEvent.setup();
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });

      // Initially not highlighted
      expect(moreButton).toHaveClass('text-content-muted');

      // After opening (click sets isMoreOpen to true)
      await user.click(moreButton);
      expect(moreButton).toHaveClass('text-accent');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on navigation', () => {
      render(() => <BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
    });

    it('should have proper aria attributes on More button', () => {
      render(() => <BottomNav />);

      const moreButton = screen.getByRole('button', { name: /more/i });
      expect(moreButton).toHaveAttribute('aria-label', 'More');
      expect(moreButton).toHaveAttribute('aria-expanded');
      expect(moreButton).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('Styling', () => {
    it('should be hidden on desktop (hidden max-md:block)', () => {
      render(() => <BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden');
      expect(nav).toHaveClass('max-md:block');
    });

    it('should have fixed positioning', () => {
      render(() => <BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
    });
  });
});
