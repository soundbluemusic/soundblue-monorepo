/**
 * @fileoverview NavigationLayout component tests
 *
 * Tests for:
 * - Layout structure rendering
 * - Sidebar toggle functionality
 * - Skip to content link
 * - Responsive margin changes
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useLanguage
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      accessibility: {
        skipToContent: 'Skip to main content',
        mainContent: 'Main content',
      },
      nav: {
        home: 'Home',
        about: 'About',
      },
      footer: {
        copyright: '© 2024 SoundBlueMusic',
      },
    }),
    isKorean: () => false,
    localizedPath: (path: string) => path,
  }),
}));

// Mock child components
vi.mock('./Header', () => ({
  Header: (props: { onSidebarToggle: () => void; isSidebarOpen: boolean }) => (
    <header data-testid="header">
      <button type="button" onClick={props.onSidebarToggle} data-testid="sidebar-toggle">
        Toggle Sidebar
      </button>
      <span data-testid="sidebar-state">{props.isSidebarOpen ? 'open' : 'closed'}</span>
    </header>
  ),
}));

vi.mock('./Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('./navigation', () => ({
  Sidebar: (props: { isOpen: boolean }) => (
    <aside data-testid="sidebar" data-open={props.isOpen}>
      Sidebar
    </aside>
  ),
  BottomNav: () => <nav data-testid="bottom-nav">Bottom Nav</nav>,
}));

import { NavigationLayout } from './NavigationLayout';

describe('NavigationLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Structure rendering', () => {
    it('should render Header component', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Sidebar component', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render BottomNav component', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    });

    it('should render children in main content', () => {
      render(() => (
        <NavigationLayout>
          <div>Page Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });
  });

  describe('Sidebar toggle', () => {
    it('should start with sidebar open', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true');
    });

    it('should toggle sidebar when button is clicked', async () => {
      const user = userEvent.setup();
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const toggleButton = screen.getByTestId('sidebar-toggle');

      // Initially open
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');

      // Click to close
      await user.click(toggleButton);
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');

      // Click to open again
      await user.click(toggleButton);
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');
    });

    it('should pass isOpen prop to Sidebar', async () => {
      const user = userEvent.setup();
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const toggleButton = screen.getByTestId('sidebar-toggle');
      const sidebar = screen.getByTestId('sidebar');

      expect(sidebar).toHaveAttribute('data-open', 'true');

      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Skip to content link', () => {
    it('should render skip to content link', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
      expect(skipLink).toBeInTheDocument();
    });

    it('should have correct href for skip link', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have skip-to-content class', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
      expect(skipLink).toHaveClass('skip-to-content');
    });
  });

  describe('Main content', () => {
    it('should have main-content id', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have aria-label', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Main content');
    });

    it('should have margin-left class when sidebar is open', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const main = screen.getByRole('main');
      expect(main).toHaveClass('ml-[var(--sidebar-width)]');
    });

    it('should remove margin-left when sidebar is closed', async () => {
      const user = userEvent.setup();
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const toggleButton = screen.getByTestId('sidebar-toggle');
      await user.click(toggleButton);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('ml-0');
      expect(main).not.toHaveClass('ml-[var(--sidebar-width)]');
    });
  });

  describe('Layout structure', () => {
    it('should have app-layout class on container', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const container = document.querySelector('.app-layout');
      expect(container).toBeInTheDocument();
    });

    it('should have main-content class', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const main = screen.getByRole('main');
      expect(main).toHaveClass('main-content');
    });

    it('should have view-transition-content class', () => {
      render(() => (
        <NavigationLayout>
          <div>Content</div>
        </NavigationLayout>
      ));

      const main = screen.getByRole('main');
      expect(main).toHaveClass('view-transition-content');
    });
  });
});
