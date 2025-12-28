import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MockBottomSheetProps } from '~/test/types';
import { NavigationLayout } from './NavigationLayout';

// Mock dependencies
vi.mock('@soundblue/shared-react', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
    toggleLanguage: vi.fn(),
  }),
  useTheme: () => ({
    resolvedTheme: 'light',
    toggleTheme: vi.fn(),
  }),
  cn: ((...classes) => classes.filter(Boolean).join(' ')) as CnFunction,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'accessibility.skipToContent': () => 'Skip to content',
    'accessibility.mainContent': () => 'Main content',
    'header.themeDark': () => 'Switch to dark mode',
    'header.themeLight': () => 'Switch to light mode',
    'header.langSwitch': () => 'Switch language',
    'header.langCode': () => 'EN',
    'header.sidebarClose': () => 'Close sidebar',
    'header.sidebarOpen': () => 'Open sidebar',
    'externalLinks.tools': () => 'Tools',
    footer_privacy: () => 'Privacy Policy',
    footer_terms: () => 'Terms of Service',
    footer_license: () => 'License',
    footer_sitemap: () => 'Sitemap',
    'footer.tagline': () => 'Made with love',
    'footer.builtWith': () => 'Built With',
    'nav.more': () => 'More',
  },
}));

vi.mock('~/components/ui', () => ({
  SearchBox: () => <div data-testid="search-box">SearchBox</div>,
  ThemeIcon: ({ theme }: { theme: string }) => <div data-testid="theme-icon">{theme}</div>,
  BottomSheet: ({ isOpen, onClose, title, children }: MockBottomSheetProps) =>
    isOpen ? (
      <div data-testid="bottom-sheet" role="dialog">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('~/constants', () => ({
  BRAND: {
    copyrightHolder: 'Sound Blue Music',
  },
  isNavActive: (path: string, pathname: string) => path === pathname,
  NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [
    {
      url: 'https://tools.soundbluemusic.com',
      labelKey: 'tools',
      icon: () => <svg data-testid="tools-icon" />,
    },
  ],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [
    { path: '/blog', labelKey: 'blog', icon: () => <svg data-testid="blog-icon" /> },
  ],
}));

vi.mock('~/constants/icons', () => ({
  ToolsIcon: ({ className }: { className?: string }) => (
    <svg data-testid="tools-icon" className={className} />
  ),
}));

describe('NavigationLayout', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('렌더링', () => {
    it('레이아웃 컴포넌트 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test Content</div>
        </NavigationLayout>,
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('Header 컴포넌트 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('Sidebar 컴포넌트 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('Footer 컴포넌트 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('BottomNav 컴포넌트 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });
      expect(mobileNav).toBeInTheDocument();
    });

    it('children 컨텐츠 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div data-testid="custom-content">Custom Content</div>
        </NavigationLayout>,
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Sidebar 토글', () => {
    it('초기 상태에서 사이드바 열림', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const sidebarButton = screen.getByLabelText('Close sidebar');
      expect(sidebarButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('사이드바 버튼 클릭 시 토글', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );

      const sidebarButton = screen.getByLabelText('Close sidebar');
      await user.click(sidebarButton);

      const openButton = screen.getByLabelText('Open sidebar');
      expect(openButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('사이드바 닫힌 후 다시 열기', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );

      const closeButton = screen.getByLabelText('Close sidebar');
      await user.click(closeButton);

      const openButton = screen.getByLabelText('Open sidebar');
      await user.click(openButton);

      const closedButton = screen.getByLabelText('Close sidebar');
      expect(closedButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Main content', () => {
    it('main 요소에 id="main-content"', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const main = document.querySelector('#main-content');
      expect(main).toBeInTheDocument();
    });

    it('main 요소에 aria-label', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const main = screen.getByLabelText('Main content');
      expect(main).toBeInTheDocument();
    });

    it('사이드바 열림 시 margin-left 적용', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const main = document.querySelector('#main-content');
      expect(main?.className).toContain('ml-(--sidebar-width)');
    });

    it('사이드바 닫힘 시 margin-left 0', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );

      const sidebarButton = screen.getByLabelText('Close sidebar');
      await user.click(sidebarButton);

      const main = document.querySelector('#main-content');
      expect(main?.className).toContain('ml-0');
    });
  });

  describe('접근성', () => {
    it('Skip to content 링크 렌더링', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const skipLink = screen.getByText('Skip to content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveAttribute('aria-label', 'Skip to content');
    });

    it('Skip to content 링크가 첫 번째 요소', () => {
      const { container } = renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      // Skip link is positioned off-screen and has href="#main-content"
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
    });

    it('Main content에 landmark role', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('레이아웃 구조', () => {
    it('app-layout 클래스 적용', () => {
      const { container } = renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );
      const layout = container.querySelector('.app-layout');
      expect(layout).toBeInTheDocument();
    });

    it('모든 주요 컴포넌트 포함', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Test</div>
        </NavigationLayout>,
      );

      // Header
      expect(screen.getByRole('banner')).toBeInTheDocument();
      // Sidebar
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      // Main content
      expect(screen.getByRole('main')).toBeInTheDocument();
      // Footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      // BottomNav
      expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('빈 children 처리', () => {
      expect(() => renderWithRouter(<NavigationLayout>{null}</NavigationLayout>)).not.toThrow();
    });

    it('여러 children 처리', () => {
      renderWithRouter(
        <NavigationLayout>
          <div>Child 1</div>
          <div>Child 2</div>
        </NavigationLayout>,
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });
});
