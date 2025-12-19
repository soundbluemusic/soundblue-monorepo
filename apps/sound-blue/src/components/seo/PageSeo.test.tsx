import { render } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock router
let mockPathname = '/';
const mockNavigate = vi.fn();

vi.mock('@solidjs/router', () => ({
  useLocation: () => ({
    pathname: mockPathname,
  }),
  useNavigate: () => mockNavigate,
}));

// Mock @solidjs/meta
const mockMetaProps: Array<Record<string, string>> = [];
const mockLinkProps: Array<Record<string, string>> = [];
let mockTitleContent = '';

vi.mock('@solidjs/meta', () => ({
  Title: (props: { children: string }) => {
    mockTitleContent = props.children;
    return null;
  },
  Meta: (props: Record<string, string>) => {
    mockMetaProps.push(props);
    return null;
  },
  Link: (props: Record<string, string>) => {
    mockLinkProps.push(props);
    return null;
  },
}));

// Mock translation data
vi.mock('../../../messages/en.json', () => ({
  default: {
    seo: {
      siteName: 'Sound Blue',
      defaultDescription: 'SoundBlueMusic Official Homepage',
      pages: {
        home: { title: 'Sound Blue | Home', description: 'Welcome to Sound Blue' },
        about: { title: 'Sound Blue | About', description: 'About SoundBlueMusic' },
        privacy: { title: 'Sound Blue | Privacy', description: 'Privacy Policy' },
        terms: { title: 'Sound Blue | Terms', description: 'Terms of Service' },
        license: { title: 'Sound Blue | License', description: 'License Information' },
        soundRecording: { title: 'Sound Blue | Sound Recording', description: 'Sound Recording' },
        sitemap: { title: 'Sound Blue | Sitemap', description: 'Site Navigation' },
        news: { title: 'Sound Blue | News', description: 'Latest News' },
        blog: { title: 'Sound Blue | Blog', description: 'Blog Posts' },
        builtWith: { title: 'Sound Blue | Built With', description: 'Technologies Used' },
        chat: { title: 'Sound Blue | Chat', description: 'Chat with us' },
      },
    },
  },
}));

vi.mock('../../../messages/ko.json', () => ({
  default: {
    seo: {
      siteName: 'Sound Blue',
      defaultDescription: 'SoundBlueMusic 공식 홈페이지',
      pages: {
        home: { title: 'Sound Blue | 홈', description: 'Sound Blue에 오신 것을 환영합니다' },
        about: { title: 'Sound Blue | 소개', description: 'SoundBlueMusic 소개' },
        privacy: { title: 'Sound Blue | 개인정보', description: '개인정보처리방침' },
        terms: { title: 'Sound Blue | 이용약관', description: '이용약관' },
        license: { title: 'Sound Blue | 라이선스', description: '라이선스 정보' },
        soundRecording: { title: 'Sound Blue | 녹음물', description: '녹음물 정보' },
        sitemap: { title: 'Sound Blue | 사이트맵', description: '사이트 네비게이션' },
        news: { title: 'Sound Blue | 뉴스', description: '최신 뉴스' },
        blog: { title: 'Sound Blue | 블로그', description: '블로그 글' },
        builtWith: { title: 'Sound Blue | 제작 도구', description: '사용된 기술' },
        chat: { title: 'Sound Blue | 채팅', description: '채팅하기' },
      },
    },
  },
}));

import { I18nProvider } from '../providers/I18nProvider';
import { PageSeo } from './PageSeo';

describe('PageSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockMetaProps.length = 0;
    mockLinkProps.length = 0;
    mockTitleContent = '';
  });

  describe('Title and Description', () => {
    it('renders title for home page', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      expect(mockTitleContent).toBe('Sound Blue | Home');
    });

    it('renders title for about page', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      expect(mockTitleContent).toBe('Sound Blue | About');
    });

    it('renders description meta tag', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const descMeta = mockMetaProps.find((p) => p['name'] === 'description');
      expect(descMeta).toBeDefined();
      expect(descMeta?.['content']).toBe('Welcome to Sound Blue');
    });

    it('renders author meta tag', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const authorMeta = mockMetaProps.find((p) => p['name'] === 'author');
      expect(authorMeta).toBeDefined();
      expect(authorMeta?.['content']).toBe('SoundBlueMusic');
    });
  });

  describe('Canonical and Alternate URLs', () => {
    it('renders canonical URL for English page', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const canonical = mockLinkProps.find((p) => p['rel'] === 'canonical');
      expect(canonical).toBeDefined();
      expect(canonical?.['href']).toBe('https://soundbluemusic.com/about');
    });

    it('renders canonical URL for Korean page', () => {
      mockPathname = '/ko/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const canonical = mockLinkProps.find((p) => p['rel'] === 'canonical');
      expect(canonical).toBeDefined();
      expect(canonical?.['href']).toBe('https://soundbluemusic.com/ko/about');
    });

    it('renders hreflang alternate for English', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const enAlternate = mockLinkProps.find((p) => p['hreflang'] === 'en');
      expect(enAlternate).toBeDefined();
      expect(enAlternate?.['href']).toBe('https://soundbluemusic.com/about');
    });

    it('renders hreflang alternate for Korean', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const koAlternate = mockLinkProps.find((p) => p['hreflang'] === 'ko');
      expect(koAlternate).toBeDefined();
      expect(koAlternate?.['href']).toBe('https://soundbluemusic.com/ko/about');
    });

    it('renders x-default hreflang', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const xDefault = mockLinkProps.find((p) => p['hreflang'] === 'x-default');
      expect(xDefault).toBeDefined();
      expect(xDefault?.['href']).toBe('https://soundbluemusic.com/about');
    });

    it('handles root path correctly for canonical', () => {
      mockPathname = '/';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const canonical = mockLinkProps.find((p) => p['rel'] === 'canonical');
      expect(canonical?.['href']).toBe('https://soundbluemusic.com');
    });
  });

  describe('Open Graph Tags', () => {
    it('renders og:title', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogTitle = mockMetaProps.find((p) => p['property'] === 'og:title');
      expect(ogTitle).toBeDefined();
      expect(ogTitle?.['content']).toBe('Sound Blue | Home');
    });

    it('renders og:description', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogDesc = mockMetaProps.find((p) => p['property'] === 'og:description');
      expect(ogDesc).toBeDefined();
      expect(ogDesc?.['content']).toBe('Welcome to Sound Blue');
    });

    it('renders og:type as website', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogType = mockMetaProps.find((p) => p['property'] === 'og:type');
      expect(ogType?.['content']).toBe('website');
    });

    it('renders og:url', () => {
      mockPathname = '/about';

      render(() => (
        <I18nProvider>
          <PageSeo page="about" />
        </I18nProvider>
      ));

      const ogUrl = mockMetaProps.find((p) => p['property'] === 'og:url');
      expect(ogUrl?.['content']).toBe('https://soundbluemusic.com/about');
    });

    it('renders og:image', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogImage = mockMetaProps.find((p) => p['property'] === 'og:image');
      expect(ogImage?.['content']).toBe('https://soundbluemusic.com/og-image.png');
    });

    it('renders og:site_name', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogSiteName = mockMetaProps.find((p) => p['property'] === 'og:site_name');
      expect(ogSiteName?.['content']).toBe('Sound Blue');
    });

    it('renders og:locale for English', () => {
      mockPathname = '/';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogLocale = mockMetaProps.find((p) => p['property'] === 'og:locale');
      expect(ogLocale?.['content']).toBe('en_US');
    });

    it('renders og:locale for Korean', () => {
      mockPathname = '/ko';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogLocale = mockMetaProps.find((p) => p['property'] === 'og:locale');
      expect(ogLocale?.['content']).toBe('ko_KR');
    });

    it('renders og:locale:alternate', () => {
      mockPathname = '/';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const ogLocaleAlt = mockMetaProps.find((p) => p['property'] === 'og:locale:alternate');
      expect(ogLocaleAlt?.['content']).toBe('ko_KR');
    });
  });

  describe('Twitter Card Tags', () => {
    it('renders twitter:card as summary_large_image', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const twitterCard = mockMetaProps.find((p) => p['name'] === 'twitter:card');
      expect(twitterCard?.['content']).toBe('summary_large_image');
    });

    it('renders twitter:title', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const twitterTitle = mockMetaProps.find((p) => p['name'] === 'twitter:title');
      expect(twitterTitle?.['content']).toBe('Sound Blue | Home');
    });

    it('renders twitter:description', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const twitterDesc = mockMetaProps.find((p) => p['name'] === 'twitter:description');
      expect(twitterDesc?.['content']).toBe('Welcome to Sound Blue');
    });

    it('renders twitter:image', () => {
      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const twitterImage = mockMetaProps.find((p) => p['name'] === 'twitter:image');
      expect(twitterImage?.['content']).toBe('https://soundbluemusic.com/og-image.png');
    });
  });

  describe('Korean Language Support', () => {
    it('renders Korean title for Korean page', () => {
      mockPathname = '/ko';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      expect(mockTitleContent).toBe('Sound Blue | 홈');
    });

    it('renders Korean description for Korean page', () => {
      mockPathname = '/ko';

      render(() => (
        <I18nProvider>
          <PageSeo page="home" />
        </I18nProvider>
      ));

      const descMeta = mockMetaProps.find((p) => p['name'] === 'description');
      expect(descMeta?.['content']).toBe('Sound Blue에 오신 것을 환영합니다');
    });
  });

  describe('All Page Types', () => {
    const pageTypes = [
      'home',
      'about',
      'privacy',
      'terms',
      'license',
      'soundRecording',
      'sitemap',
      'news',
      'blog',
      'builtWith',
      'chat',
    ] as const;

    for (const pageType of pageTypes) {
      it(`renders SEO for ${pageType} page`, () => {
        render(() => (
          <I18nProvider>
            <PageSeo page={pageType} />
          </I18nProvider>
        ));

        expect(mockTitleContent).toBeTruthy();
        expect(mockMetaProps.length).toBeGreaterThan(0);
      });
    }
  });
});
