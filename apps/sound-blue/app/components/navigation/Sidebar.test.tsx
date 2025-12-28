import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

// Mock dependencies
vi.mock('@soundblue/shared-react', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    nav_home: () => 'Home',
    nav_about: () => 'About',
    nav_soundRecording: () => 'Sound Recording',
    nav_blog: () => 'Blog',
    nav_news: () => 'News',
    nav_chat: () => 'Chat',
    externalLinks_tools: () => 'Tools',
    externalLinks_dialogue: () => 'Dialogue',
  },
}));

vi.mock('~/constants', () => ({
  isNavActive: (path: string, pathname: string) => path === pathname,
  NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
    {
      path: '/sound-recording',
      labelKey: 'soundRecording',
      icon: () => <svg data-testid="sound-icon" />,
    },
    { path: '/blog', labelKey: 'blog', icon: () => <svg data-testid="blog-icon" /> },
    { path: '/news', labelKey: 'news', icon: () => <svg data-testid="news-icon" /> },
    { path: '/chat', labelKey: 'chat', icon: () => <svg data-testid="chat-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [
    {
      url: 'https://tools.soundbluemusic.com',
      labelKey: 'tools',
      icon: () => <svg data-testid="tools-icon" />,
    },
    {
      url: 'https://dialogue.soundbluemusic.com',
      labelKey: 'dialogue',
      icon: () => <svg data-testid="dialogue-icon" />,
    },
  ],
}));

describe('Sidebar', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('렌더링', () => {
    it('aside 요소 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('nav 요소 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('모든 NAV_ITEMS 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Sound Recording')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('모든 아이콘 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('about-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sound-icon')).toBeInTheDocument();
      expect(screen.getByTestId('blog-icon')).toBeInTheDocument();
      expect(screen.getByTestId('news-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
    });

    it('External links 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('Dialogue')).toBeInTheDocument();
    });

    it('Divider 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const divider = document.querySelector('[aria-hidden="true"]');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('isOpen 상태', () => {
    it('isOpen=true일 때 표시', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('translate-x-0');
      expect(aside?.className).not.toContain('-translate-x-full');
    });

    it('isOpen=false일 때 숨김', () => {
      renderWithRouter(<Sidebar isOpen={false} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('-translate-x-full');
    });
  });

  describe('Active 상태', () => {
    it('현재 경로와 일치하는 링크에 accent 색상', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink?.className).toContain('text-(--color-accent-primary)');
      expect(homeLink?.className).toContain('bg-(--color-accent-light)');
    });

    it('비활성 링크는 muted 색상', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink?.className).toContain('text-(--color-text-secondary)');
      expect(aboutLink?.className).not.toContain('text-(--color-accent-primary)');
    });
  });

  describe('External links', () => {
    it('Tools 링크가 올바른 URL', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const toolsLink = screen.getByText('Tools').closest('a');
      expect(toolsLink).toHaveAttribute('href', 'https://tools.soundbluemusic.com');
      expect(toolsLink).toHaveAttribute('target', '_blank');
      expect(toolsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Dialogue 링크가 올바른 URL', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const dialogueLink = screen.getByText('Dialogue').closest('a');
      expect(dialogueLink).toHaveAttribute('href', 'https://dialogue.soundbluemusic.com');
      expect(dialogueLink).toHaveAttribute('target', '_blank');
      expect(dialogueLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('External links 아이콘 렌더링', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      expect(screen.getByTestId('tools-icon')).toBeInTheDocument();
      expect(screen.getByTestId('dialogue-icon')).toBeInTheDocument();
    });
  });

  describe('링크 속성', () => {
    it('모든 링크는 올바른 href', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
      expect(screen.getByText('Sound Recording').closest('a')).toHaveAttribute(
        'href',
        '/sound-recording',
      );
    });

    it('모든 링크는 유효한 엘리먼트', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('접근성', () => {
    it('nav에 aria-label 설정', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('모든 링크는 포커스 가능', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.className).toContain('focus-visible:outline-2');
      });
    });

    it('Divider는 aria-hidden', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const divider = document.querySelector('[aria-hidden="true"]');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('fixed positioning', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('fixed');
    });

    it('transition 효과', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('transition-transform');
      expect(aside?.className).toContain('duration-150');
    });

    it('desktop only (max-md:hidden)', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('max-md:hidden');
    });

    it('z-index 설정', () => {
      renderWithRouter(<Sidebar isOpen={true} />);
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('z-50');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Sidebar isOpen={true} />)).not.toThrow();
      expect(() => renderWithRouter(<Sidebar isOpen={false} />)).not.toThrow();
    });
  });
});
