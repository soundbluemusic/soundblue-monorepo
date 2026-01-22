import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { createTestMetaArgs, findMetaDescription, findMetaTitle } from '~/test/types';
import Terms, { meta } from './($locale)/terms';

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
  ColorblindSelector: () => null,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/terms' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'terms.title': () => 'Terms of Service',
    'terms.sections.use.title': () => 'Use of Service',
    'terms.sections.use.content': () => 'You may use this service for personal purposes',
    'terms.sections.copyright.title': () => 'Copyright',
    'terms.sections.copyright.content': () => 'All content is copyrighted',
    'terms.sections.disclaimer.title': () => 'Disclaimer',
    'terms.sections.disclaimer.content': () => 'Service provided as is',
    'terms.sections.changes.title': () => 'Changes to Terms',
    'terms.sections.changes.content': () => 'We may update these terms',
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
    { path: '/terms', labelKey: 'terms', icon: () => <svg data-testid="terms-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('Terms Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta(createTestMetaArgs()) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Terms of Service | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta(createTestMetaArgs()) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toContain('Terms and conditions');
    });
  });

  describe('렌더링', () => {
    it('Terms 컴포넌트 렌더링', () => {
      renderWithRouter(<Terms />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Terms />);
      const title = screen.getByRole('heading', { level: 1, name: 'Terms of Service' });
      expect(title.tagName).toBe('H1');
    });

    it('모든 섹션 타이틀 렌더링', () => {
      renderWithRouter(<Terms />);
      expect(screen.getByText('Use of Service')).toBeInTheDocument();
      expect(screen.getByText('Copyright')).toBeInTheDocument();
      expect(screen.getByText('Disclaimer')).toBeInTheDocument();
      expect(screen.getByText('Changes to Terms')).toBeInTheDocument();
    });

    it('모든 섹션 컨텐츠 렌더링', () => {
      renderWithRouter(<Terms />);
      expect(
        screen.getByText('You may use this service for personal purposes'),
      ).toBeInTheDocument();
      expect(screen.getByText('All content is copyrighted')).toBeInTheDocument();
      expect(screen.getByText('Service provided as is')).toBeInTheDocument();
      expect(screen.getByText('We may update these terms')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<Terms />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
      expect(mainDiv?.className).toContain('prose');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Terms />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Terms />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Use of Service')).toBeInTheDocument();
      expect(screen.getByText('Copyright')).toBeInTheDocument();
      expect(screen.getByText('Disclaimer')).toBeInTheDocument();
      expect(screen.getByText('Changes to Terms')).toBeInTheDocument();
    });
  });
});
