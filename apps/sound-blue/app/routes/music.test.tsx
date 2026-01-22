import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { createTestMetaArgs, findMetaDescription, findMetaTitle } from '~/test/types';
import Music, { meta } from './($locale)/music';

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
    useLocation: () => ({ pathname: '/music' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'seo.pages.music.title': () => 'Music | Sound Blue',
    'seo.pages.music.description': () => 'Listen to Sound Blue music collection.',
    'music.title': () => 'Music',
    'music.description': () => 'Explore my music collection.',
    'music.emptyState': () => 'No videos available yet.',
    'music.emptyStateHint': () => 'Check out my YouTube channel for more.',
    'music.visitYouTube': () => 'Visit YouTube Channel',
    'externalLinks.youtube': () => 'YouTube',
    'externalLinks.discography': () => 'Discography',
    'nav.home': () => 'Home',
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
    nav_about: () => 'About',
    nav_blog: () => 'Blog',
    nav_news: () => 'News',
    nav_chat: () => 'Chat',
    externalLinks_tools: () => 'Tools',
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
  MoreIcon: ({ className }: { className?: string }) => (
    <svg data-testid="more-icon" className={className} />
  ),
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

vi.mock('~/lib/youtube', () => ({
  parseYouTubeUrl: (url: string) => ({
    isValid: true,
    type: 'video',
    videoId: 'testVideoId',
    embedUrl: `https://www.youtube-nocookie.com/embed/testVideoId`,
  }),
}));

vi.mock('~/data/music-catalog', () => ({
  FEATURED_VIDEO: {
    url: 'https://www.youtube.com/watch?v=testVideoId',
    title: { en: 'Featured Video', ko: '추천 영상' },
    releaseDate: '2025-01',
    description: { en: 'Featured video description', ko: '추천 영상 설명' },
  },
  MUSIC_CATEGORIES: [
    {
      id: 'originals',
      name: { en: 'Original Music', ko: '오리지널 음악' },
      videos: [
        {
          url: 'https://www.youtube.com/watch?v=video1',
          title: { en: 'Song One', ko: '노래 1' },
          releaseDate: '2024-12',
        },
        {
          url: 'https://www.youtube.com/watch?v=video2',
          title: { en: 'Song Two', ko: '노래 2' },
        },
      ],
    },
    {
      id: 'covers',
      name: { en: 'Covers', ko: '커버' },
      videos: [],
    },
  ],
}));

// Mock window.scrollTo
const scrollToMock = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true });

describe('Music Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    scrollToMock.mockClear();
  });

  describe('meta 함수', () => {
    it('title 메타 태그 반환', () => {
      const result = meta(createTestMetaArgs('/music')) as MetaDescriptor[];
      const title = findMetaTitle(result);
      expect(title?.title).toBe('Music | Sound Blue');
    });

    it('description 메타 태그 반환', () => {
      const result = meta(createTestMetaArgs('/music')) as MetaDescriptor[];
      const description = findMetaDescription(result);
      expect(description?.content).toBe('Listen to Sound Blue music collection.');
    });
  });

  describe('렌더링', () => {
    it('페이지 제목 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByRole('heading', { level: 1, name: 'Music' })).toBeInTheDocument();
    });

    it('페이지 설명 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Explore my music collection.')).toBeInTheDocument();
    });

    it('Featured video 제목 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Featured Video')).toBeInTheDocument();
    });

    it('Featured video 날짜 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('2025-01')).toBeInTheDocument();
    });

    it('Featured video 설명 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Featured video description')).toBeInTheDocument();
    });
  });

  describe('YouTube 임베드', () => {
    it('YouTube iframe 렌더링', () => {
      renderWithRouter(<Music />);
      const iframe = screen.getByTitle('Featured Video');
      expect(iframe).toBeInTheDocument();
    });
  });

  describe('카테고리', () => {
    it('카테고리 제목 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Original Music')).toBeInTheDocument();
    });

    it('비디오가 없는 카테고리는 렌더링하지 않음', () => {
      renderWithRouter(<Music />);
      expect(screen.queryByText('Covers')).not.toBeInTheDocument();
    });

    it('카테고리 내 비디오 제목 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });
  });

  describe('비디오 선택', () => {
    it('썸네일 클릭 시 비디오 선택', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Music />);

      // 썸네일 버튼 찾기
      const thumbnail = screen.getByLabelText('Play Song One');
      await user.click(thumbnail);

      // scrollTo가 호출되었는지 확인
      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('외부 링크', () => {
    it('YouTube 링크 렌더링', () => {
      renderWithRouter(<Music />);
      const youtubeLinks = screen.getAllByText('YouTube');
      expect(youtubeLinks.length).toBeGreaterThan(0);
    });

    it('YouTube 링크가 올바른 URL', () => {
      renderWithRouter(<Music />);
      const youtubeLinks = screen.getAllByRole('link', { name: /youtube/i });
      const mainYoutubeLink = youtubeLinks.find((link) =>
        link.getAttribute('href')?.includes('youtube.com/@SoundBlueMusic'),
      );
      expect(mainYoutubeLink).toBeInTheDocument();
    });

    it('Discography 링크 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByText('Discography')).toBeInTheDocument();
    });

    it('외부 링크에 target="_blank" 속성', () => {
      renderWithRouter(<Music />);
      const discographyLink = screen.getByText('Discography').closest('a');
      expect(discographyLink).toHaveAttribute('target', '_blank');
      expect(discographyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('레이아웃', () => {
    it('NavigationLayout 내에 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('헤더 렌더링', () => {
      renderWithRouter(<Music />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Music />)).not.toThrow();
    });

    it('releaseDate가 없는 비디오도 렌더링 가능', () => {
      // Song Two는 releaseDate가 없음 (mock 데이터 참조)
      renderWithRouter(<Music />);
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });

    it('description이 없는 비디오도 렌더링 가능', () => {
      // Song One과 Song Two는 description이 없음
      renderWithRouter(<Music />);
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    it('선택된 비디오에 ring 스타일 적용', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Music />);

      const thumbnail = screen.getByLabelText('Play Song One');
      await user.click(thumbnail);

      // 썸네일 클릭 후 선택된 상태 확인
      expect(thumbnail.className).toContain('ring-2');
    });
  });
});

describe('Music Route - Korean locale', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.doMock('~/lib/messages', () => ({
      default: {
        'seo.pages.music.title': () => '음악 | Sound Blue',
        'seo.pages.music.description': () => 'Sound Blue 음악 컬렉션.',
        'music.title': () => '음악',
        'music.description': () => '음악 컬렉션을 탐색하세요.',
        'music.emptyState': () => '아직 비디오가 없습니다.',
        'music.emptyStateHint': () => 'YouTube 채널을 확인하세요.',
        'music.visitYouTube': () => 'YouTube 채널 방문',
        'externalLinks.youtube': () => 'YouTube',
        'externalLinks.discography': () => '디스코그래피',
        'nav.home': () => '홈',
        'accessibility.skipToContent': () => '콘텐츠로 건너뛰기',
        'accessibility.mainContent': () => '메인 콘텐츠',
        'header.themeDark': () => '다크 모드로 전환',
        'header.themeLight': () => '라이트 모드로 전환',
        'header.langSwitch': () => '언어 전환',
        'header.langCode': () => 'KO',
        'header.sidebarClose': () => '사이드바 닫기',
        'header.sidebarOpen': () => '사이드바 열기',
        'externalLinks.tools': () => '도구',
        footer_privacy: () => '개인정보처리방침',
        footer_terms: () => '이용약관',
        footer_license: () => '라이선스',
        footer_sitemap: () => '사이트맵',
        'footer.tagline': () => '사랑으로 만들었습니다',
        'footer.builtWith': () => 'Built With',
        'nav.more': () => '더보기',
        nav_about: () => '소개',
        nav_blog: () => '블로그',
        nav_news: () => '뉴스',
        nav_chat: () => '채팅',
        externalLinks_tools: () => '도구',
      },
    }));
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('한국어 로케일에서 렌더링 성공', async () => {
    const { default: MusicKo } = await import('./($locale)/music');
    expect(() => renderWithRouter(<MusicKo />)).not.toThrow();
  });
});
