/**
 * @fileoverview InfoPanel component tests
 *
 * Tests for:
 * - Rendering default state (no topic selected)
 * - Rendering topic-specific content
 * - Help topic showing site navigation
 * - External links section
 * - Link generation and accessibility
 */

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

// Mock @solidjs/router
vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; class?: string; children: unknown }) => {
    const children = props.children as string;
    return (
      <a href={props.href} class={props.class}>
        {children}
      </a>
    );
  },
}));

// Mock navigation constants
vi.mock('~/constants/navigation', () => ({
  NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <span data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <span data-testid="about-icon" /> },
    { path: '/sitemap', labelKey: 'sitemap', icon: () => <span data-testid="sitemap-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [
    {
      url: 'https://youtube.com',
      labelKey: 'youtube',
      icon: () => <span data-testid="youtube-icon" />,
    },
  ],
}));

// Mock icons
vi.mock('~/constants/icons', () => ({
  AboutIcon: (props: { class?: string }) => <span class={props.class} data-testid="AboutIcon" />,
  BuiltWithIcon: (props: { class?: string }) => (
    <span class={props.class} data-testid="BuiltWithIcon" />
  ),
  HelpIcon: (props: { class?: string }) => <span class={props.class} data-testid="HelpIcon" />,
  HomeIcon: (props: { class?: string }) => <span class={props.class} data-testid="HomeIcon" />,
  SitemapIcon: (props: { class?: string }) => (
    <span class={props.class} data-testid="SitemapIcon" />
  ),
  SoundRecordingIcon: (props: { class?: string }) => (
    <span class={props.class} data-testid="SoundRecordingIcon" />
  ),
}));

// Mock I18nProvider
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      chat: {
        infoPanel: {
          title: 'Information',
          selectPrompt: 'Ask a question to see related information',
          viewPage: 'View Page',
          sitePages: 'Site Pages',
          externalLinks: 'External Links',
        },
        topics: {
          about: {
            title: 'About Sound Blue',
            summary: 'Learn about Sound Blue.',
          },
          music: {
            title: 'Music',
            summary: 'Discover music styles.',
          },
          license: {
            title: 'License',
            summary: 'License information.',
          },
          soundRecording: {
            title: 'Sound Recording',
            summary: 'Field recordings.',
          },
          contact: {
            title: 'Contact',
            summary: 'Contact information.',
          },
          builtWith: {
            title: 'Built With',
            summary: 'Technologies used.',
          },
          navigation: {
            title: 'Navigation',
            summary: 'Site navigation.',
          },
          help: {
            title: 'Help',
            summary: 'Help information.',
          },
        },
      },
      nav: {
        home: 'Home',
        about: 'About',
        sitemap: 'Sitemap',
      },
      pageDescriptions: {
        home: 'Main page',
        about: 'About page',
        sitemap: 'All pages',
      },
      externalLinks: {
        youtube: 'YouTube',
      },
    }),
    localizedPath: (path: string) => path,
  }),
}));

import type { TopicType } from './InfoPanel';
import { InfoPanel } from './InfoPanel';

describe('InfoPanel', () => {
  describe('Default state', () => {
    it('should render panel title', () => {
      render(() => <InfoPanel selectedTopic={null} />);

      expect(screen.getByText('Information')).toBeInTheDocument();
    });

    it('should show prompt when no topic is selected', () => {
      render(() => <InfoPanel selectedTopic={null} />);

      expect(screen.getByText('Ask a question to see related information')).toBeInTheDocument();
    });

    it('should render home icon in default state', () => {
      render(() => <InfoPanel selectedTopic={null} />);

      expect(screen.getByTestId('HomeIcon')).toBeInTheDocument();
    });
  });

  describe('Topic content display', () => {
    const topicsWithPages: Array<{ topic: TopicType; title: string; page: string }> = [
      { topic: 'about', title: 'About Sound Blue', page: '/about' },
      { topic: 'music', title: 'Music', page: '/about' },
      { topic: 'license', title: 'License', page: '/license' },
      { topic: 'soundRecording', title: 'Sound Recording', page: '/sound-recording' },
      { topic: 'contact', title: 'Contact', page: '/about' },
      { topic: 'builtWith', title: 'Built With', page: '/built-with' },
      { topic: 'navigation', title: 'Navigation', page: '/sitemap' },
    ];

    topicsWithPages.forEach(({ topic, title, page }) => {
      it(`should show ${topic} topic title and link`, () => {
        render(() => <InfoPanel selectedTopic={topic} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText('View Page')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: 'View Page' });
        expect(link).toHaveAttribute('href', page);
      });
    });

    it('should show topic summary', () => {
      render(() => <InfoPanel selectedTopic="about" />);

      expect(screen.getByText('Learn about Sound Blue.')).toBeInTheDocument();
    });
  });

  describe('Help topic - Site navigation', () => {
    it('should show site pages heading for help topic', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      expect(screen.getByText('Site Pages')).toBeInTheDocument();
    });

    it('should show navigation items for help topic', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Sitemap')).toBeInTheDocument();
    });

    it('should show page descriptions for help topic', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      expect(screen.getByText('Main page')).toBeInTheDocument();
      expect(screen.getByText('About page')).toBeInTheDocument();
      expect(screen.getByText('All pages')).toBeInTheDocument();
    });

    it('should show external links section for help topic', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      expect(screen.getByText('External Links')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      const homeLink = screen.getByRole('link', { name: /Home/i });
      expect(homeLink).toHaveAttribute('href', '/');

      const aboutLink = screen.getByRole('link', { name: /About/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should have external link attributes', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      const youtubeLink = screen.getByRole('link', { name: /YouTube/i });
      expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com');
      expect(youtubeLink).toHaveAttribute('target', '_blank');
      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Topic icons', () => {
    it('should show AboutIcon for about topic', () => {
      render(() => <InfoPanel selectedTopic="about" />);

      expect(screen.getByTestId('AboutIcon')).toBeInTheDocument();
    });

    it('should show SoundRecordingIcon for music topic', () => {
      render(() => <InfoPanel selectedTopic="music" />);

      expect(screen.getByTestId('SoundRecordingIcon')).toBeInTheDocument();
    });

    it('should show BuiltWithIcon for builtWith topic', () => {
      render(() => <InfoPanel selectedTopic="builtWith" />);

      expect(screen.getByTestId('BuiltWithIcon')).toBeInTheDocument();
    });

    it('should show SitemapIcon for navigation topic', () => {
      render(() => <InfoPanel selectedTopic="navigation" />);

      expect(screen.getByTestId('SitemapIcon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have heading for panel title', () => {
      render(() => <InfoPanel selectedTopic={null} />);

      const heading = screen.getByRole('heading', { name: 'Information' });
      expect(heading).toBeInTheDocument();
    });

    it('should have navigation landmark in help topic', () => {
      render(() => <InfoPanel selectedTopic="help" />);

      const navElements = screen.getAllByRole('navigation');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should have proper link for View Page button', () => {
      render(() => <InfoPanel selectedTopic="about" />);

      const link = screen.getByRole('link', { name: 'View Page' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });
  });
});
