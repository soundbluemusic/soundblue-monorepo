import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { createTestMetaArgs, findMetaDescription, findMetaTitle } from '~/test/types';
import Privacy, { meta } from './($locale)/privacy';

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
    useLocation: () => ({ pathname: '/privacy' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'privacy.title': () => 'Privacy Policy',
    'privacy.sections.collection.title': () => 'Data Collection',
    'privacy.sections.collection.content': () => 'We do not collect personal data.',
    'privacy.sections.cookies.title': () => 'Cookies',
    'privacy.sections.cookies.content': () => 'We use only essential cookies.',
    'privacy.sections.thirdParty.title': () => 'Third-Party Services',
    'privacy.sections.thirdParty.content': () => 'We may use third-party analytics.',
    'privacy.sections.contact.title': () => 'Contact',
    'privacy.sections.contact.content': () => 'Contact us for privacy concerns.',
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
    { path: '/privacy', labelKey: 'privacy', icon: () => <svg data-testid="privacy-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('Privacy Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta(createTestMetaArgs()) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Privacy Policy | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta(createTestMetaArgs()) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toBe("Sound Blue's privacy policy.");
    });
  });

  describe('렌더링', () => {
    it('Privacy 컴포넌트 렌더링', () => {
      renderWithRouter(<Privacy />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Privacy />);
      const title = screen.getByRole('heading', { level: 1, name: 'Privacy Policy' });
      expect(title.tagName).toBe('H1');
    });

    it('모든 섹션 타이틀 렌더링', () => {
      renderWithRouter(<Privacy />);
      expect(screen.getByText('Data Collection')).toBeInTheDocument();
      expect(screen.getByText('Cookies')).toBeInTheDocument();
      expect(screen.getByText('Third-Party Services')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('모든 섹션 컨텐츠 렌더링', () => {
      renderWithRouter(<Privacy />);
      expect(screen.getByText('We do not collect personal data.')).toBeInTheDocument();
      expect(screen.getByText('We use only essential cookies.')).toBeInTheDocument();
      expect(screen.getByText('We may use third-party analytics.')).toBeInTheDocument();
      expect(screen.getByText('Contact us for privacy concerns.')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<Privacy />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
      expect(mainDiv?.className).toContain('prose');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Privacy />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Privacy />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Data Collection')).toBeInTheDocument();
      expect(screen.getByText('Cookies')).toBeInTheDocument();
      expect(screen.getByText('Third-Party Services')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });
});
