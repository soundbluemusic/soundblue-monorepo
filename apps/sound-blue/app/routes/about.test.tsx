import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaDescription, findMetaTitle } from '~/test/types';
import About, { meta } from './($locale)/about';

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
    useLocation: () => ({ pathname: '/about' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'about.title': () => 'About Sound Blue',
    'about.intro': () => 'Learn more about Sound Blue and SoundBlueMusic.',
    'about.sections.artist.title': () => 'The Artist',
    'about.sections.artist.content': () => 'Sound Blue is a musician and producer.',
    'about.sections.label.title': () => 'The Label',
    'about.sections.label.content': () => 'SoundBlueMusic is an independent music label.',
    'about.sections.music.title': () => 'The Music',
    'about.sections.music.content': () => 'Creating original soundtracks and instrumental music.',
    'about.sections.vision.title': () => 'The Vision',
    'about.sections.vision.content': () => 'Making music accessible to everyone.',
    'about.sections.projects.title': () => 'Projects',
    'about.sections.connect.title': () => 'Connect',
    'about.sections.connect.youtube': () => 'YouTube Channel',
    'about.sections.connect.github': () => 'GitHub',
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
    if (key === 'about_sections_projects_items') {
      return ['Project 1', 'Project 2'];
    }
    return undefined;
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
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('About Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({} as Parameters<typeof meta>[0]) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('About | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({} as Parameters<typeof meta>[0]) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toContain('About Sound Blue');
      expect(descMeta?.content).toContain('SoundBlueMusic');
    });
  });

  describe('렌더링', () => {
    it('About 컴포넌트 렌더링', () => {
      renderWithRouter(<About />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<About />);
      const title = screen.getByRole('heading', { level: 1, name: 'About Sound Blue' });
      expect(title.tagName).toBe('H1');
    });

    it('인트로 텍스트 렌더링', () => {
      renderWithRouter(<About />);
      expect(
        screen.getByText('Learn more about Sound Blue and SoundBlueMusic.'),
      ).toBeInTheDocument();
    });

    it('모든 섹션 렌더링', () => {
      renderWithRouter(<About />);
      expect(screen.getByText('The Artist')).toBeInTheDocument();
      expect(screen.getByText('The Label')).toBeInTheDocument();
      expect(screen.getByText('The Music')).toBeInTheDocument();
      expect(screen.getByText('The Vision')).toBeInTheDocument();
    });

    it('섹션 컨텐츠 렌더링', () => {
      renderWithRouter(<About />);
      expect(screen.getByText('Sound Blue is a musician and producer.')).toBeInTheDocument();
      expect(screen.getByText('SoundBlueMusic is an independent music label.')).toBeInTheDocument();
      expect(
        screen.getByText('Creating original soundtracks and instrumental music.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Making music accessible to everyone.')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<About />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
    });

    it('타이틀 스타일', () => {
      renderWithRouter(<About />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<About />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<About />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('The Artist')).toBeInTheDocument();
      expect(screen.getByText('The Label')).toBeInTheDocument();
      expect(screen.getByText('The Music')).toBeInTheDocument();
      expect(screen.getByText('The Vision')).toBeInTheDocument();
    });
  });
});
