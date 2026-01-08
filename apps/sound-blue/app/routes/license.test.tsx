import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaDescription, findMetaTitle } from '~/test/types';
import License, { meta } from './($locale)/license';

// Mock dependencies
vi.mock('@soundblue/ui-components/base', () => ({
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
    useLocation: () => ({ pathname: '/license' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    license_title: () => 'License',
    license_soundRecording_title: () => 'Sound Recording License',
    license_soundRecording_description: () => 'License for sound recordings',
    license_soundRecording_permitted_title: () => 'Permitted Uses',
    license_soundRecording_prohibited_title: () => 'Prohibited Uses',
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
  getRawMessage: (key: string) => {
    if (key === 'license_soundRecording_permitted_items') {
      return ['Personal projects', 'YouTube videos', 'Commercial use with attribution'];
    }
    if (key === 'license_soundRecording_prohibited_items') {
      return ['Reselling', 'Redistribution', 'Claiming ownership'];
    }
    return '';
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
    { path: '/license', labelKey: 'license', icon: () => <svg data-testid="license-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('License Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('License | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toBe('Sound recording license information.');
    });
  });

  describe('렌더링', () => {
    it('License 컴포넌트 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<License />);
      const title = screen.getByRole('heading', { level: 1, name: 'License' });
      expect(title.tagName).toBe('H1');
    });

    it('섹션 타이틀 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByText('Sound Recording License')).toBeInTheDocument();
      expect(screen.getByText('Permitted Uses')).toBeInTheDocument();
      expect(screen.getByText('Prohibited Uses')).toBeInTheDocument();
    });

    it('설명 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByText('License for sound recordings')).toBeInTheDocument();
    });

    it('허용된 사용 목록 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByText('Personal projects')).toBeInTheDocument();
      expect(screen.getByText('YouTube videos')).toBeInTheDocument();
      expect(screen.getByText('Commercial use with attribution')).toBeInTheDocument();
    });

    it('금지된 사용 목록 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByText('Reselling')).toBeInTheDocument();
      expect(screen.getByText('Redistribution')).toBeInTheDocument();
      expect(screen.getByText('Claiming ownership')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<License />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
      expect(mainDiv?.className).toContain('prose');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<License />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<License />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Sound Recording License')).toBeInTheDocument();
      expect(screen.getByText('Permitted Uses')).toBeInTheDocument();
      expect(screen.getByText('Prohibited Uses')).toBeInTheDocument();
    });
  });
});
