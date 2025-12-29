import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaDescription, findMetaTitle } from '~/test/types';
import Home, { meta } from './($locale)/home';

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
    useLoaderData: () => ({ buildTime: new Date().toISOString() }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'home.title': () => 'Sound Blue',
    'home.tagline': () => 'Indie Artist & Music Producer',
    'home.genres': () => 'Original BGM · Soundtracks · Instrumental Music',
    'home.cta': () => 'Watch on YouTube',
    'home.discography': () => 'View Discography',
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

describe('Home Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({} as Parameters<typeof meta>[0]) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Sound Blue | SoundBlueMusic');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({} as Parameters<typeof meta>[0]) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toContain('South Korean indie artist');
      expect(descMeta?.content).toContain('music producer');
    });
  });

  describe('렌더링', () => {
    it('홈 컴포넌트 렌더링', () => {
      renderWithRouter(<Home />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('NavigationLayout 렌더링', () => {
      renderWithRouter(<Home />);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Home />);
      const title = screen.getByRole('heading', { level: 1, name: 'Sound Blue' });
      expect(title.tagName).toBe('H1');
    });

    it('태그라인 렌더링', () => {
      renderWithRouter(<Home />);
      expect(screen.getByText('Indie Artist & Music Producer')).toBeInTheDocument();
    });

    it('장르 정보 렌더링', () => {
      renderWithRouter(<Home />);
      expect(
        screen.getByText('Original BGM · Soundtracks · Instrumental Music'),
      ).toBeInTheDocument();
    });
  });

  describe('소셜 링크', () => {
    it('YouTube 링크 렌더링', () => {
      renderWithRouter(<Home />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/@SoundBlueMusic');
      expect(youtubeLink).toHaveAttribute('target', '_blank');
      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Discography 링크 렌더링', () => {
      renderWithRouter(<Home />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      expect(discographyLink).toHaveAttribute('href', 'https://soundblue.music');
      expect(discographyLink).toHaveAttribute('target', '_blank');
      expect(discographyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('YouTube 아이콘 렌더링', () => {
      renderWithRouter(<Home />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      const svg = youtubeLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('Music 아이콘 렌더링', () => {
      renderWithRouter(<Home />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      const svg = discographyLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('스타일', () => {
    it('중앙 정렬 레이아웃', () => {
      const { container } = renderWithRouter(<Home />);
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv?.className).toContain('flex');
      expect(mainDiv?.className).toContain('items-center');
      expect(mainDiv?.className).toContain('justify-center');
    });

    it('애니메이션 클래스 적용', () => {
      const { container } = renderWithRouter(<Home />);
      const animatedDiv = container.querySelector('.animate-slide-up');
      expect(animatedDiv).toBeInTheDocument();
    });

    it('타이틀에 올바른 스타일', () => {
      renderWithRouter(<Home />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-5xl');
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('text-content');
    });

    it('소셜 링크 스타일', () => {
      renderWithRouter(<Home />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink?.className).toContain('social-link');
      expect(youtubeLink?.className).toContain('social-youtube');
    });
  });

  describe('반응형', () => {
    it('반응형 타이틀 크기', () => {
      renderWithRouter(<Home />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-5xl');
      expect(title.className).toContain('md:text-6xl');
    });

    it('반응형 태그라인 크기', () => {
      renderWithRouter(<Home />);
      const tagline = screen.getByText('Indie Artist & Music Producer');
      expect(tagline.className).toContain('text-xl');
      expect(tagline.className).toContain('md:text-2xl');
    });
  });

  describe('접근성', () => {
    it('외부 링크에 rel="noopener noreferrer"', () => {
      renderWithRouter(<Home />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      const discographyLink = screen.getByText('View Discography').closest('a');

      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(discographyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('외부 링크에 target="_blank"', () => {
      renderWithRouter(<Home />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      const discographyLink = screen.getByText('View Discography').closest('a');

      expect(youtubeLink).toHaveAttribute('target', '_blank');
      expect(discographyLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Home />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Home />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Indie Artist & Music Producer')).toBeInTheDocument();
      expect(screen.getByText('Watch on YouTube')).toBeInTheDocument();
    });
  });
});
