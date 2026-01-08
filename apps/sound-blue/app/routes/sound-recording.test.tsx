import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaDescription, findMetaTitle } from '~/test/types';
import SoundRecording, { meta } from './($locale)/sound-recording';

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
    useLocation: () => ({ pathname: '/sound-recording' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    soundRecording_title: () => 'Sound Recording',
    soundRecording_intro: () => 'Free field recording library',
    soundRecording_about_title: () => 'About',
    soundRecording_about_content: () => 'High quality field recordings',
    soundRecording_types_title: () => 'Types',
    soundRecording_downloads_title: () => 'Downloads',
    soundRecording_downloads_content: () => 'Available for download',
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
    if (key === 'soundRecording_types_items') {
      return ['Nature sounds', 'Urban ambience', 'Musical instruments'];
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
    {
      path: '/sound-recording',
      labelKey: 'sound-recording',
      icon: () => <svg data-testid="sound-recording-icon" />,
    },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('SoundRecording Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Sound Recording | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toBe('Field recording library by Sound Blue.');
    });
  });

  describe('렌더링', () => {
    it('SoundRecording 컴포넌트 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      const title = screen.getByRole('heading', { level: 1, name: 'Sound Recording' });
      expect(title.tagName).toBe('H1');
    });

    it('인트로 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByText('Free field recording library')).toBeInTheDocument();
    });

    it('섹션 타이틀 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Types')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('섹션 컨텐츠 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByText('High quality field recordings')).toBeInTheDocument();
      expect(screen.getByText('Available for download')).toBeInTheDocument();
    });

    it('타입 목록 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByText('Nature sounds')).toBeInTheDocument();
      expect(screen.getByText('Urban ambience')).toBeInTheDocument();
      expect(screen.getByText('Musical instruments')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<SoundRecording />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
      expect(mainDiv?.className).toContain('prose');
    });

    it('인트로 텍스트 크기', () => {
      renderWithRouter(<SoundRecording />);
      const intro = screen.getByText('Free field recording library');
      expect(intro.className).toContain('text-lg');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<SoundRecording />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<SoundRecording />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Types')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });
  });
});
