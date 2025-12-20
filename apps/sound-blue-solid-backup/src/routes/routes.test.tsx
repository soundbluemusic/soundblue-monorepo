/**
 * @fileoverview Route pages tests
 *
 * Tests for route pages to verify:
 * - Basic rendering
 * - Page structure
 * - SEO components inclusion
 */

import { render, screen } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @solidjs/meta
vi.mock('@solidjs/meta', () => ({
  Title: (props: { children: string }) => <title>{props.children}</title>,
  Meta: () => null,
  Link: () => null,
}));

// Mock @solidjs/router
interface MockAProps {
  children: JSX.Element;
  href: string;
  class?: string;
}

vi.mock('@solidjs/router', () => ({
  A: (props: MockAProps) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock translations
const mockTranslations = {
  nav: {
    home: 'Home',
    about: 'About',
    news: 'News',
    blog: 'Blog',
    soundRecording: 'Sound Recording',
    builtWith: 'Built With',
    chat: 'Chat',
    sitemap: 'Sitemap',
  },
  externalLinks: {
    tools: 'Tools',
  },
  notFound: {
    code: '404',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    backHome: 'Back to Home',
  },
  privacy: {
    title: 'Privacy Policy',
    sections: {
      collection: { title: 'Information Collection', content: 'Content' },
      cookies: { title: 'Cookies', content: 'Content' },
      thirdParty: { title: 'Third Party', content: 'Content' },
      contact: { title: 'Contact', content: 'Content' },
    },
  },
  terms: {
    title: 'Terms of Service',
    sections: {
      use: { title: 'Use', content: 'Content' },
      copyright: { title: 'Copyright', content: 'Content' },
      disclaimer: { title: 'Disclaimer', content: 'Content' },
      changes: { title: 'Changes', content: 'Content' },
    },
  },
  blog: {
    title: 'Blog',
    description: 'Latest articles and updates',
    comingSoon: 'Coming soon...',
  },
  news: {
    title: 'News',
    description: 'Latest news and announcements',
    comingSoon: 'Coming soon...',
  },
  license: {
    title: 'License',
    soundRecording: {
      title: 'Sound Recording License',
      description: 'License terms for sound recordings',
      permitted: {
        title: 'Permitted Uses',
        items: ['Use in creative works', 'Modify and transform'],
      },
      prohibited: {
        title: 'Prohibited Uses',
        items: ['Redistribution - Not allowed', 'Standalone sale'],
      },
      legal: {
        title: 'Legal Restrictions',
        items: [
          'Copyright registration prohibited - Not allowed',
          'Patent applications prohibited - Not allowed',
        ],
      },
      terms: {
        title: 'Terms',
        attribution: 'Attribution - Required for usage',
      },
    },
    website: {
      title: 'Website & Original Works',
      copyright: 'Copyright {year} SoundBlueMusic',
      content: 'All original works are created by and exclusively owned by SoundBlueMusic.',
    },
  },
  common: {
    lastUpdated: 'Last updated',
  },
};

// Mock I18nProvider
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => mockTranslations,
    lang: () => 'en',
    isKorean: () => false,
    localizedPath: (path: string) => path,
  }),
}));

// Mock components
vi.mock('~/components', () => ({
  NavigationLayout: (props: { children: JSX.Element }) => (
    <div data-testid="navigation-layout">{props.children}</div>
  ),
  PageSeo: (props: { page: string }) => <div data-testid={`page-seo-${props.page}`} />,
  useLanguage: () => ({
    t: () => mockTranslations,
    lang: () => 'en',
    isKorean: () => false,
    localizedPath: (path: string) => path,
  }),
  OptimizedImage: () => <img data-testid="optimized-image" alt="test" />,
}));

vi.mock('~/components/home', () => ({
  HomeContent: () => <div data-testid="home-content">Home Content</div>,
}));

vi.mock('~/components/ui', () => ({
  buttonVariants: () => 'button-class',
  LinkButton: (props: { children: JSX.Element; href: string }) => (
    <a href={props.href} data-testid="link-button">
      {props.children}
    </a>
  ),
}));

import NotFoundPage from './[...404]';
import BlogPage from './blog';
// Import pages after mocks
import HomePage from './index';
import LicensePage from './license';
import NewsPage from './news';
import OfflinePage from './offline';
import PrivacyPage from './privacy';
import TermsPage from './terms';

describe('Route Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HomePage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <HomePage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for home', () => {
      render(() => <HomePage />);
      expect(screen.getByTestId('page-seo-home')).toBeInTheDocument();
    });

    it('should render HomeContent', () => {
      render(() => <HomePage />);
      expect(screen.getByTestId('home-content')).toBeInTheDocument();
    });
  });

  describe('NotFoundPage', () => {
    it('should render 404 code', () => {
      render(() => <NotFoundPage />);
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(() => <NotFoundPage />);
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('should render message', () => {
      render(() => <NotFoundPage />);
      expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument();
    });

    it('should render back home link', () => {
      render(() => <NotFoundPage />);
      const link = screen.getByRole('link', { name: 'Back to Home' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('should have main landmark', () => {
      render(() => <NotFoundPage />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('OfflinePage', () => {
    it('should render offline message', () => {
      render(() => <OfflinePage />);
      expect(screen.getByText("You're Offline")).toBeInTheDocument();
    });

    it('should render connection message', () => {
      render(() => <OfflinePage />);
      expect(
        screen.getByText('Please check your internet connection and try again.'),
      ).toBeInTheDocument();
    });

    it('should render home link', () => {
      render(() => <OfflinePage />);
      const link = screen.getByRole('link', { name: 'Go Home' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('should have main landmark', () => {
      render(() => <OfflinePage />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render offline emoji', () => {
      render(() => <OfflinePage />);
      expect(screen.getByText('📶')).toBeInTheDocument();
    });
  });

  describe('PrivacyPage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <PrivacyPage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for privacy', () => {
      render(() => <PrivacyPage />);
      expect(screen.getByTestId('page-seo-privacy')).toBeInTheDocument();
    });

    it('should render privacy title', () => {
      render(() => <PrivacyPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    });

    it('should render section headings', () => {
      render(() => <PrivacyPage />);
      expect(
        screen.getByRole('heading', { level: 2, name: 'Information Collection' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Cookies' })).toBeInTheDocument();
    });
  });

  describe('TermsPage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <TermsPage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for terms', () => {
      render(() => <TermsPage />);
      expect(screen.getByTestId('page-seo-terms')).toBeInTheDocument();
    });

    it('should render terms title', () => {
      render(() => <TermsPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'Terms of Service' }),
      ).toBeInTheDocument();
    });

    it('should render section headings', () => {
      render(() => <TermsPage />);
      expect(screen.getByRole('heading', { level: 2, name: 'Use' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Copyright' })).toBeInTheDocument();
    });
  });

  describe('BlogPage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <BlogPage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for blog', () => {
      render(() => <BlogPage />);
      expect(screen.getByTestId('page-seo-blog')).toBeInTheDocument();
    });

    it('should render blog title', () => {
      render(() => <BlogPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
    });

    it('should render description', () => {
      render(() => <BlogPage />);
      expect(screen.getByText('Latest articles and updates')).toBeInTheDocument();
    });

    it('should render coming soon message', () => {
      render(() => <BlogPage />);
      expect(screen.getByText('Coming soon...')).toBeInTheDocument();
    });
  });

  describe('NewsPage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <NewsPage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for news', () => {
      render(() => <NewsPage />);
      expect(screen.getByTestId('page-seo-news')).toBeInTheDocument();
    });

    it('should render news title', () => {
      render(() => <NewsPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'News' })).toBeInTheDocument();
    });

    it('should render description', () => {
      render(() => <NewsPage />);
      expect(screen.getByText('Latest news and announcements')).toBeInTheDocument();
    });
  });

  describe('LicensePage', () => {
    it('should render with NavigationLayout', () => {
      render(() => <LicensePage />);
      expect(screen.getByTestId('navigation-layout')).toBeInTheDocument();
    });

    it('should include PageSeo for license', () => {
      render(() => <LicensePage />);
      expect(screen.getByTestId('page-seo-license')).toBeInTheDocument();
    });

    it('should render license title', () => {
      render(() => <LicensePage />);
      expect(screen.getByRole('heading', { level: 1, name: 'License' })).toBeInTheDocument();
    });

    it('should render sound recording section', () => {
      render(() => <LicensePage />);
      expect(
        screen.getByRole('heading', { level: 2, name: 'Sound Recording License' }),
      ).toBeInTheDocument();
    });

    it('should render permitted uses', () => {
      render(() => <LicensePage />);
      expect(screen.getByRole('heading', { level: 3, name: 'Permitted Uses' })).toBeInTheDocument();
      expect(screen.getByText('Use in creative works')).toBeInTheDocument();
    });

    it('should render prohibited uses', () => {
      render(() => <LicensePage />);
      expect(
        screen.getByRole('heading', { level: 3, name: 'Prohibited Uses' }),
      ).toBeInTheDocument();
    });

    it('should render website license section', () => {
      render(() => <LicensePage />);
      expect(
        screen.getByRole('heading', { level: 2, name: 'Website & Original Works' }),
      ).toBeInTheDocument();
    });
  });
});
