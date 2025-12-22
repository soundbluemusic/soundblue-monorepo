import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import Sitemap, { meta } from './sitemap';

// Mock dependencies
vi.mock('@soundblue/shared-react', () => ({
  useParaglideI18n: () => ({
    locale: 'en',
    localizedPath: (path: string) => path,
    toggleLanguage: vi.fn(),
  }),
  useTheme: () => ({
    resolvedTheme: 'light',
    toggleTheme: vi.fn(),
  }),
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/sitemap' }),
    Link: ({ to, children, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'sitemap.title': () => 'Sitemap',
    'sitemap.sections.main': () => 'Main Pages',
    'sitemap.sections.content': () => 'Content',
    'sitemap.sections.legal': () => 'Legal',
    'sitemap.links.home': () => 'Home',
    'sitemap.links.news': () => 'News',
    'sitemap.links.blog': () => 'Blog',
    'sitemap.links.soundRecording': () => 'Sound Recording',
    'sitemap.links.privacy': () => 'Privacy Policy',
    'sitemap.links.terms': () => 'Terms of Service',
    'sitemap.links.license': () => 'License',
    'nav.about': () => 'About',
    'accessibility.skipToContent': () => 'Skip to content',
    'accessibility.mainContent': () => 'Main content',
    'header.themeDark': () => 'Switch to dark mode',
    'header.themeLight': () => 'Switch to light mode',
    'header.langSwitch': () => 'Switch language',
    'header.langCode': () => 'EN',
    'header.sidebarClose': () => 'Close sidebar',
    'header.sidebarOpen': () => 'Open sidebar',
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
  BottomSheet: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="bottom-sheet" role="dialog">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('~/components/layout', () => ({
  NavigationLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('~/constants', () => ({
  BRAND: {
    copyrightHolder: 'Sound Blue Music',
  },
  isNavActive: (path: string, pathname: string) => path === pathname,
  NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/sitemap', labelKey: 'sitemap', icon: () => <svg data-testid="sitemap-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('Sitemap Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({} as any);
      const titleMeta = metaResult.find((m: any) => m.title);
      expect(titleMeta?.title).toBe('Sitemap | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({} as any);
      const descMeta = metaResult.find((m: any) => m.name === 'description');
      expect(descMeta?.content).toBe('Complete sitemap of Sound Blue website.');
    });
  });

  describe('렌더링', () => {
    it('Sitemap 컴포넌트 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Sitemap />);
      const title = screen.getByRole('heading', { level: 1, name: 'Sitemap' });
      expect(title.tagName).toBe('H1');
    });

    it('섹션 타이틀 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByText('Main Pages')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Legal')).toBeInTheDocument();
    });

    it('메인 페이지 링크 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('컨텐츠 페이지 링크 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('Sound Recording')).toBeInTheDocument();
    });

    it('법적 페이지 링크 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('License')).toBeInTheDocument();
    });
  });

  describe('링크', () => {
    it('홈 링크가 올바른 href', () => {
      renderWithRouter(<Sitemap />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('About 링크가 올바른 href', () => {
      renderWithRouter(<Sitemap />);
      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('News 링크가 올바른 href', () => {
      renderWithRouter(<Sitemap />);
      const newsLink = screen.getByText('News').closest('a');
      expect(newsLink).toHaveAttribute('href', '/news');
    });

    it('모든 링크에 올바른 스타일', () => {
      renderWithRouter(<Sitemap />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink?.className).toContain('text-[var(--color-link)]');
      expect(homeLink?.className).toContain('hover:underline');
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<Sitemap />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
    });

    it('타이틀 스타일', () => {
      renderWithRouter(<Sitemap />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
    });

    it('섹션 타이틀 스타일', () => {
      renderWithRouter(<Sitemap />);
      const sectionTitle = screen.getByText('Main Pages');
      expect(sectionTitle.className).toContain('text-xl');
      expect(sectionTitle.className).toContain('font-semibold');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Sitemap />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Sitemap />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Main Pages')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Legal')).toBeInTheDocument();
    });
  });
});
