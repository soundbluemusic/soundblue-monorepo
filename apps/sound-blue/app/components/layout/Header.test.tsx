import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

// Mock dependencies
const mockToggleLanguage = vi.fn();
const mockToggleTheme = vi.fn();

// useParaglideI18n is from @soundblue/i18n
vi.mock('@soundblue/i18n', () => ({
  useParaglideI18n: () => ({
    toggleLanguage: mockToggleLanguage,
    localizedPath: (path: string) => path,
  }),
}));

// useTheme is from @soundblue/ui-components/base
vi.mock('@soundblue/ui-components/base', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

vi.mock('~/lib/messages', () => ({
  default: {
    'header.themeDark': () => 'Switch to dark mode',
    'header.themeLight': () => 'Switch to light mode',
    'header.langSwitch': () => 'Switch language',
    'header.langCode': () => 'EN',
    'header.sidebarClose': () => 'Close sidebar',
    'header.sidebarOpen': () => 'Open sidebar',
    'externalLinks.tools': () => 'Tools',
  },
}));

vi.mock('~/components/ui', () => ({
  SearchBox: () => <div data-testid="search-box">SearchBox</div>,
  ThemeIcon: ({ theme }: { theme: string }) => <div data-testid="theme-icon">{theme}</div>,
}));

vi.mock('~/constants/icons', () => ({
  ToolsIcon: ({ className }: { className?: string }) => (
    <svg data-testid="tools-icon" className={className} />
  ),
}));

describe('Header', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('헤더 요소 렌더링', () => {
      renderWithRouter(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('로고 링크 렌더링', () => {
      renderWithRouter(<Header />);
      const logo = screen.getByText('Sound Blue');
      expect(logo).toBeInTheDocument();
      expect(logo.closest('a')).toHaveAttribute('href', '/');
    });

    it('SearchBox 렌더링', () => {
      renderWithRouter(<Header />);
      expect(screen.getByTestId('search-box')).toBeInTheDocument();
    });

    it('Tools 링크 렌더링', () => {
      renderWithRouter(<Header />);
      const toolsLink = screen.getByTitle('Tools');
      expect(toolsLink).toBeInTheDocument();
      expect(toolsLink).toHaveAttribute('href', 'https://tools.soundbluemusic.com');
      expect(toolsLink).toHaveAttribute('target', '_blank');
      expect(toolsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Theme toggle 버튼 렌더링', () => {
      renderWithRouter(<Header />);
      const themeButton = screen.getByLabelText('Switch to dark mode');
      expect(themeButton).toBeInTheDocument();
    });

    it('Language toggle 버튼 렌더링', () => {
      renderWithRouter(<Header />);
      const langButton = screen.getByLabelText('Switch language');
      expect(langButton).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  describe('Sidebar toggle', () => {
    it('onSidebarToggle prop이 있으면 사이드바 버튼 렌더링', () => {
      const onToggle = vi.fn();
      renderWithRouter(<Header onSidebarToggle={onToggle} />);

      const sidebarButton = screen.getByLabelText('Close sidebar');
      expect(sidebarButton).toBeInTheDocument();
    });

    it('onSidebarToggle prop이 없으면 사이드바 버튼 미렌더링', () => {
      renderWithRouter(<Header />);

      const sidebarButton = screen.queryByLabelText(/sidebar/i);
      expect(sidebarButton).not.toBeInTheDocument();
    });

    it('isSidebarOpen=true일 때 닫기 아이콘 표시', () => {
      const onToggle = vi.fn();
      renderWithRouter(<Header onSidebarToggle={onToggle} isSidebarOpen={true} />);

      const button = screen.getByLabelText('Close sidebar');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('isSidebarOpen=false일 때 열기 아이콘 표시', () => {
      const onToggle = vi.fn();
      renderWithRouter(<Header onSidebarToggle={onToggle} isSidebarOpen={false} />);

      const button = screen.getByLabelText('Open sidebar');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('사이드바 버튼 클릭 시 onSidebarToggle 호출', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      renderWithRouter(<Header onSidebarToggle={onToggle} />);

      const button = screen.getByLabelText('Close sidebar');
      await user.click(button);

      expect(onToggle).toHaveBeenCalledOnce();
    });
  });

  describe('Theme toggle', () => {
    it('Theme 버튼 클릭 시 toggleTheme 호출', async () => {
      const user = userEvent.setup();

      renderWithRouter(<Header />);
      const themeButton = screen.getByLabelText('Switch to dark mode');
      await user.click(themeButton);

      expect(mockToggleTheme).toHaveBeenCalledOnce();
    });

    it('Light 테마일 때 "Switch to dark mode" 표시', () => {
      renderWithRouter(<Header />);
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });
  });

  describe('Language toggle', () => {
    it('Language 버튼 클릭 시 toggleLanguage 호출', async () => {
      const user = userEvent.setup();

      renderWithRouter(<Header />);
      const langButton = screen.getByLabelText('Switch language');
      await user.click(langButton);

      expect(mockToggleLanguage).toHaveBeenCalledOnce();
    });
  });

  describe('접근성', () => {
    it('header 요소는 banner role 가짐', () => {
      renderWithRouter(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('모든 버튼에 aria-label 설정', () => {
      renderWithRouter(<Header onSidebarToggle={vi.fn()} />);

      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch language')).toBeInTheDocument();
    });

    it('로고 링크는 포커스 가능', () => {
      renderWithRouter(<Header />);
      const logo = screen.getByText('Sound Blue').closest('a');
      // Links are focusable by default
      expect(logo?.getAttribute('tabIndex')).not.toBe('-1');
    });

    it('Tools 링크에 title 속성', () => {
      renderWithRouter(<Header />);
      const toolsLink = screen.getByTitle('Tools');
      expect(toolsLink).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('onSidebarToggle undefined일 때 에러 없음', () => {
      expect(() => renderWithRouter(<Header />)).not.toThrow();
    });

    it('isSidebarOpen prop 없을 때 기본값 true', () => {
      const onToggle = vi.fn();
      renderWithRouter(<Header onSidebarToggle={onToggle} />);

      const button = screen.getByLabelText('Close sidebar');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
