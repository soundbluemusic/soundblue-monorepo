import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockBottomSheetProps } from '~/test/types';
import { BottomNav } from './BottomNav';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

vi.mock('@soundblue/ui-components/base', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
  }),
  ColorblindSelector: () => null,
}));

vi.mock('~/lib/messages', () => ({
  default: {
    nav_home: () => 'Home',
    nav_about: () => 'About',
    nav_soundRecording: () => 'Sound Recording',
    nav_blog: () => 'Blog',
    nav_news: () => 'News',
    nav_chat: () => 'Chat',
    'nav.more': () => 'More',
  },
}));

vi.mock('~/components/ui', () => ({
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
  isNavActive: (path: string, pathname: string) => path === pathname,
  MoreIcon: ({ className }: { className?: string }) => (
    <svg data-testid="more-icon" className={className} />
  ),
  PRIMARY_NAV_ITEMS: [
    { path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> },
    { path: '/about', labelKey: 'about', icon: () => <svg data-testid="about-icon" /> },
    {
      path: '/sound-recording',
      labelKey: 'soundRecording',
      icon: () => <svg data-testid="sound-icon" />,
    },
  ],
  SECONDARY_NAV_ITEMS: [
    { path: '/blog', labelKey: 'blog', icon: () => <svg data-testid="blog-icon" /> },
    { path: '/news', labelKey: 'news', icon: () => <svg data-testid="news-icon" /> },
    { path: '/chat', labelKey: 'chat', icon: () => <svg data-testid="chat-icon" /> },
  ],
}));

describe('BottomNav', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('nav 요소 렌더링', () => {
      renderWithRouter(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('Primary navigation items 렌더링', () => {
      renderWithRouter(<BottomNav />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Sound Recording')).toBeInTheDocument();
    });

    it('More 버튼 렌더링', () => {
      renderWithRouter(<BottomNav />);
      const moreButton = screen.getByLabelText('More');
      expect(moreButton).toBeInTheDocument();
      expect(moreButton).toHaveAttribute('aria-expanded', 'false');
      expect(moreButton).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('Primary items에 아이콘 표시', () => {
      renderWithRouter(<BottomNav />);
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('about-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sound-icon')).toBeInTheDocument();
    });
  });

  describe('More 버튼 동작', () => {
    it('More 버튼 클릭 시 BottomSheet 열림', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      const moreButton = screen.getByLabelText('More');
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
      });
    });

    it('BottomSheet에 secondary items 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      const moreButton = screen.getByLabelText('More');
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Blog')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
        expect(screen.getByText('Chat')).toBeInTheDocument();
      });
    });

    it('More 버튼 클릭 시 aria-expanded true', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      const moreButton = screen.getByLabelText('More');
      await user.click(moreButton);

      await waitFor(() => {
        expect(moreButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('BottomSheet에 title 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      const moreButton = screen.getByLabelText('More');
      await user.click(moreButton);

      await waitFor(() => {
        const sheet = screen.getByTestId('bottom-sheet');
        expect(sheet).toHaveTextContent('More');
      });
    });
  });

  describe('Secondary item 동작', () => {
    it('Secondary item 클릭 시 navigate 호출', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      // Open BottomSheet
      await user.click(screen.getByLabelText('More'));

      await waitFor(() => {
        expect(screen.getByText('Blog')).toBeInTheDocument();
      });

      // Click Blog item
      await user.click(screen.getByText('Blog'));

      expect(mockNavigate).toHaveBeenCalledWith('/blog');
    });

    it('Secondary item 클릭 후 BottomSheet 닫힘', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BottomNav />);

      // Open BottomSheet
      await user.click(screen.getByLabelText('More'));

      await waitFor(() => {
        expect(screen.getByText('News')).toBeInTheDocument();
      });

      // Click News item
      await user.click(screen.getByText('News'));

      await waitFor(() => {
        expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
      });
    });
  });

  describe('Active 상태', () => {
    it('현재 경로와 일치하는 item에 accent 색상', () => {
      renderWithRouter(<BottomNav />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink?.className).toContain('text-[var(--color-accent-primary)]');
    });

    it('비활성 item은 muted 색상', () => {
      renderWithRouter(<BottomNav />);
      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink?.className).toContain('text-[var(--color-text-secondary)]');
    });
  });

  describe('접근성', () => {
    it('nav에 aria-label 설정', () => {
      renderWithRouter(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('More 버튼에 aria-label 설정', () => {
      renderWithRouter(<BottomNav />);
      const moreButton = screen.getByLabelText('More');
      expect(moreButton).toBeInTheDocument();
    });

    it('More 버튼에 aria-haspopup 설정', () => {
      renderWithRouter(<BottomNav />);
      const moreButton = screen.getByLabelText('More');
      expect(moreButton).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('모든 링크는 포커스 가능', () => {
      renderWithRouter(<BottomNav />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Links are focusable by default
        expect(link.getAttribute('tabIndex')).not.toBe('-1');
      });
    });

    it('More 버튼은 포커스 가능', () => {
      renderWithRouter(<BottomNav />);
      const moreButton = screen.getByLabelText('More');
      expect(moreButton.getAttribute('tabIndex')).not.toBe('-1');
    });
  });

  describe('Edge Cases', () => {
    it('MoreIcon SVG 렌더링', () => {
      renderWithRouter(<BottomNav />);
      const moreButton = screen.getByLabelText('More');
      const svg = moreButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<BottomNav />)).not.toThrow();
    });
  });
});
