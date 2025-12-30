import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaTitle } from '~/test/types';
import Offline, { meta } from './($locale)/offline';

// Mock dependencies
vi.mock('@soundblue/ui-primitives', () => ({
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
    useLocation: () => ({ pathname: '/offline' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'offline.title': () => "You're Offline",
    'offline.message': () => 'Please check your internet connection.',
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
  BottomSheet: ({ isOpen, onClose, title, children }: MockBottomSheetProps) =>
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
    { path: '/offline', labelKey: 'offline', icon: () => <svg data-testid="offline-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('Offline Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({} as Parameters<typeof meta>[0]) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Offline | Sound Blue');
    });
  });

  describe('렌더링', () => {
    it('Offline 컴포넌트 렌더링', () => {
      renderWithRouter(<Offline />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Offline />);
      const title = screen.getByRole('heading', { level: 1, name: "You're Offline" });
      expect(title.tagName).toBe('H1');
    });

    it('메시지 렌더링', () => {
      renderWithRouter(<Offline />);
      expect(screen.getByText('Please check your internet connection.')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('전체 화면 중앙 정렬', () => {
      const { container } = renderWithRouter(<Offline />);
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv?.className).toContain('flex');
      expect(mainDiv?.className).toContain('items-center');
      expect(mainDiv?.className).toContain('justify-center');
    });

    it('타이틀 스타일', () => {
      renderWithRouter(<Offline />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
    });

    it('메시지 스타일', () => {
      renderWithRouter(<Offline />);
      const message = screen.getByText('Please check your internet connection.');
      expect(message.className).toContain('text-content-muted');
    });

    it('중앙 텍스트 정렬', () => {
      const { container } = renderWithRouter(<Offline />);
      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Offline />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Offline />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Please check your internet connection.')).toBeInTheDocument();
    });
  });
});
