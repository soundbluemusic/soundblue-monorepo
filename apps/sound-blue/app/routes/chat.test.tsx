import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CnFunction, MetaDescriptor, MockBottomSheetProps } from '~/test/types';
import { findMetaDescription, findMetaTitle } from '~/test/types';
import Chat, { meta } from './($locale)/chat';

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
    useLocation: () => ({ pathname: '/chat' }),
  };
});

vi.mock('~/lib/messages', () => ({
  default: {
    'chat.title': () => 'Chat',
    'chat.subtitle': () => 'Chat with Sound Blue assistant',
    'chat.welcome': () => 'Welcome to the chat!',
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
    { path: '/chat', labelKey: 'chat', icon: () => <svg data-testid="chat-icon" /> },
  ],
  EXTERNAL_NAV_ITEMS: [],
  PRIMARY_NAV_ITEMS: [{ path: '/', labelKey: 'home', icon: () => <svg data-testid="home-icon" /> }],
  SECONDARY_NAV_ITEMS: [],
}));

describe('Chat Route', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Meta', () => {
    it('meta 함수가 올바른 title 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const titleMeta = findMetaTitle(metaResult);
      expect(titleMeta?.title).toBe('Chat | Sound Blue');
    });

    it('meta 함수가 올바른 description 반환', () => {
      const metaResult = meta({ location: { pathname: '/' } } as any) as MetaDescriptor[];
      const descMeta = findMetaDescription(metaResult);
      expect(descMeta?.content).toBe('Chat with Sound Blue assistant.');
    });
  });

  describe('렌더링', () => {
    it('Chat 컴포넌트 렌더링', () => {
      renderWithRouter(<Chat />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('타이틀 렌더링', () => {
      renderWithRouter(<Chat />);
      const title = screen.getByRole('heading', { level: 1, name: 'Chat' });
      expect(title.tagName).toBe('H1');
    });

    it('서브타이틀 렌더링', () => {
      renderWithRouter(<Chat />);
      expect(screen.getByText('Chat with Sound Blue assistant')).toBeInTheDocument();
    });

    it('환영 메시지 렌더링', () => {
      renderWithRouter(<Chat />);
      expect(screen.getByText('Welcome to the chat!')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('최대 너비 및 중앙 정렬', () => {
      const { container } = renderWithRouter(<Chat />);
      const mainDiv = container.querySelector('.max-w-3xl');
      expect(mainDiv?.className).toContain('mx-auto');
      expect(mainDiv?.className).toContain('p-6');
    });

    it('타이틀 스타일', () => {
      renderWithRouter(<Chat />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
    });

    it('서브타이틀 스타일', () => {
      renderWithRouter(<Chat />);
      const subtitle = screen.getByText('Chat with Sound Blue assistant');
      expect(subtitle.className).toContain('text-content-muted');
    });

    it('환영 메시지 박스 스타일', () => {
      const { container } = renderWithRouter(<Chat />);
      const welcomeBox = container.querySelector('.p-4.rounded-lg');
      expect(welcomeBox).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Chat />)).not.toThrow();
    });

    it('모든 필수 요소 렌더링', () => {
      renderWithRouter(<Chat />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Chat with Sound Blue assistant')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the chat!')).toBeInTheDocument();
    });
  });
});
