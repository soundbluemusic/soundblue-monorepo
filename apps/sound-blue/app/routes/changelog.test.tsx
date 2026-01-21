import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { createTestMetaArgs, findMetaDescription, findMetaTitle } from '~/test/types';
import Changelog, { meta } from './($locale)/changelog';

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
    useLocation: () => ({ pathname: '/changelog' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    changelog_title: () => 'Changelog',
    changelog_description: () => 'Version history and updates',
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
    nav_home: () => 'Home',
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

vi.mock('~/paraglide/runtime', () => ({
  getLocale: () => 'en',
}));

vi.mock('~/data/changelog.json', () => ({
  default: {
    versions: [
      {
        version: '1.0.0',
        date: '2025-01-01',
        title: 'Initial Release',
        titleKo: '최초 릴리즈',
        categories: [
          {
            type: 'added',
            items: [
              {
                title: 'New feature',
                titleKo: '새로운 기능',
                description: 'Feature description',
                descriptionKo: '기능 설명',
              },
            ],
          },
          {
            type: 'fixed',
            items: [
              {
                title: 'Bug fix',
                titleKo: '버그 수정',
              },
            ],
          },
        ],
      },
      {
        version: '0.9.0',
        date: '2024-12-15',
        title: 'Beta Release',
        titleKo: '베타 릴리즈',
        categories: [
          {
            type: 'changed',
            items: [
              {
                title: 'UI update',
                titleKo: 'UI 업데이트',
              },
            ],
          },
        ],
      },
    ],
  },
}));

describe('Changelog Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('meta 함수', () => {
    it('title 메타 태그 반환', () => {
      const result = meta(createTestMetaArgs('/changelog')) as MetaDescriptor[];
      const title = findMetaTitle(result);
      expect(title?.title).toBe('Changelog | Sound Blue');
    });

    it('description 메타 태그 반환', () => {
      const result = meta(createTestMetaArgs('/changelog')) as MetaDescriptor[];
      const description = findMetaDescription(result);
      expect(description?.content).toBe('Version history and updates for Sound Blue website.');
    });
  });

  describe('렌더링', () => {
    it('페이지 제목 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByRole('heading', { level: 1, name: 'Changelog' })).toBeInTheDocument();
    });

    it('페이지 설명 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Version history and updates')).toBeInTheDocument();
    });

    it('버전 번호 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('v0.9.0')).toBeInTheDocument();
    });

    it('버전 날짜 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('2025-01-01')).toBeInTheDocument();
      expect(screen.getByText('2024-12-15')).toBeInTheDocument();
    });

    it('버전 제목 렌더링 (영어)', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Initial Release')).toBeInTheDocument();
      expect(screen.getByText('Beta Release')).toBeInTheDocument();
    });
  });

  describe('카테고리 배지', () => {
    it('Added 카테고리 배지 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Added')).toBeInTheDocument();
    });

    it('Fixed 카테고리 배지 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Fixed')).toBeInTheDocument();
    });

    it('Changed 카테고리 배지 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Changed')).toBeInTheDocument();
    });
  });

  describe('변경 사항 항목', () => {
    it('변경 사항 제목 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('New feature')).toBeInTheDocument();
      expect(screen.getByText('Bug fix')).toBeInTheDocument();
      expect(screen.getByText('UI update')).toBeInTheDocument();
    });

    it('변경 사항 설명 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Feature description')).toBeInTheDocument();
    });
  });

  describe('레이아웃', () => {
    it('NavigationLayout 내에 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('헤더 렌더링', () => {
      renderWithRouter(<Changelog />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Changelog />)).not.toThrow();
    });

    it('description이 없는 항목도 렌더링 가능', () => {
      // Bug fix 항목은 description이 없음 (mock 데이터 참조)
      renderWithRouter(<Changelog />);
      expect(screen.getByText('Bug fix')).toBeInTheDocument();
    });
  });
});

describe('Changelog Route - Korean locale', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.doMock('~/paraglide/runtime', () => ({
      getLocale: () => 'ko',
    }));

    vi.doMock('~/lib/messages', () => ({
      default: {
        changelog_title: () => '변경 내역',
        changelog_description: () => '버전 히스토리 및 업데이트',
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
        nav_home: () => '홈',
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
    const { default: ChangelogKo } = await import('./($locale)/changelog');
    expect(() => renderWithRouter(<ChangelogKo />)).not.toThrow();
  });

  it('한국어 카테고리 라벨 사용', async () => {
    const { default: ChangelogKo } = await import('./($locale)/changelog');
    renderWithRouter(<ChangelogKo />);
    // 한국어 카테고리 라벨이 렌더링되어야 함
    expect(screen.getByText('추가')).toBeInTheDocument();
  });

  it('한국어 버전 제목 렌더링', async () => {
    const { default: ChangelogKo } = await import('./($locale)/changelog');
    renderWithRouter(<ChangelogKo />);
    // 한국어 버전 제목이 렌더링되어야 함
    expect(screen.getByText('최초 릴리즈')).toBeInTheDocument();
    expect(screen.getByText('베타 릴리즈')).toBeInTheDocument();
  });

  it('한국어 항목 제목 렌더링', async () => {
    const { default: ChangelogKo } = await import('./($locale)/changelog');
    renderWithRouter(<ChangelogKo />);
    // 한국어 항목 제목이 렌더링되어야 함
    expect(screen.getByText('새로운 기능')).toBeInTheDocument();
  });

  it('한국어 설명 렌더링', async () => {
    const { default: ChangelogKo } = await import('./($locale)/changelog');
    renderWithRouter(<ChangelogKo />);
    // 한국어 설명이 렌더링되어야 함
    expect(screen.getByText('기능 설명')).toBeInTheDocument();
  });
});
