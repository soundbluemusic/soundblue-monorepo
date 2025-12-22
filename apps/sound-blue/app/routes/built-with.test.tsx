import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import BuiltWith, { meta } from './built-with';

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
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/built-with' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'builtWith.title': () => 'Built With',
    'builtWith.sections.frameworks': () => 'Frameworks & Libraries',
    'builtWith.sections.deployment': () => 'Deployment & Hosting',
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
    {
      path: '/built-with',
      labelKey: 'built-with',
      icon: () => <svg data-testid="built-with-icon" />,
    },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('BuiltWith Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({} as any) as any[];
      const titleMeta = metaResult?.find((m: any) => m.title) as any;
      expect(titleMeta?.title).toBe('Built With | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({} as any) as any[];
      const descMeta = metaResult?.find((m: any) => m.name === 'description') as any;
      expect(descMeta?.content).toBe('Technologies used to build Sound Blue website.');
    });
  });

  describe('렌더링', () => {
    it('BuiltWith 컴포넌트 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      const title = screen.getByRole('heading', { level: 1, name: 'Built With' });
      expect(title.tagName).toBe('H1');
    });

    it('섹션 타이틀 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      expect(screen.getByText('Frameworks & Libraries')).toBeInTheDocument();
      expect(screen.getByText('Deployment & Hosting')).toBeInTheDocument();
    });

    it('프레임워크 목록 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      expect(screen.getByText('React 19')).toBeInTheDocument();
      expect(screen.getByText('React Router v7')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Tailwind CSS v4')).toBeInTheDocument();
    });

    it('배포 정보 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      expect(screen.getByText('Cloudflare Pages')).toBeInTheDocument();
      expect(screen.getByText('100% SSG (Static Site Generation)')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<BuiltWith />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
    });

    it('타이틀 스타일', () => {
      renderWithRouter(<BuiltWith />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
    });

    it('섹션 타이틀 스타일', () => {
      renderWithRouter(<BuiltWith />);
      const sectionTitle = screen.getByText('Frameworks & Libraries');
      expect(sectionTitle.className).toContain('text-xl');
      expect(sectionTitle.className).toContain('font-semibold');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<BuiltWith />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<BuiltWith />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('React 19')).toBeInTheDocument();
      expect(screen.getByText('Cloudflare Pages')).toBeInTheDocument();
    });
  });
});
