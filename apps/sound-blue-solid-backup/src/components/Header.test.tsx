import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

// Mock providers
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      header: {
        themeDark: 'Switch to dark mode',
        themeLight: 'Switch to light mode',
        sidebarOpen: 'Open sidebar',
        sidebarClose: 'Close sidebar',
        langSwitch: 'Switch language',
        langCode: 'EN',
      },
    }),
    toggleLanguage: vi.fn(),
    localizedPath: (path: string) => path,
  }),
  useTheme: () => ({
    theme: () => 'light',
    toggleTheme: vi.fn(),
  }),
}));

// Mock router
vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; children: unknown; class?: string }) => {
    const { href, class: className, children } = props;
    return (
      <a href={href} class={className}>
        {children as string}
      </a>
    );
  },
}));

// Mock UI components
vi.mock('./ui', () => ({
  SearchBox: () => <div data-testid="search-box">SearchBox</div>,
  ThemeIcon: (props: { theme: string }) => <span data-testid="theme-icon">{props.theme}</span>,
}));

import { Header } from './Header';

describe('Header', () => {
  it('should render the logo', () => {
    render(() => <Header />);
    expect(screen.getByText('Sound Blue')).toBeInTheDocument();
  });

  it('should render the search box', () => {
    render(() => <Header />);
    expect(screen.getByTestId('search-box')).toBeInTheDocument();
  });

  it('should render theme toggle button with correct aria-label', () => {
    render(() => <Header />);
    const themeButton = screen.getByLabelText('Switch to dark mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('should render language toggle button', () => {
    render(() => <Header />);
    const langButton = screen.getByLabelText('Switch language');
    expect(langButton).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should render sidebar toggle when onSidebarToggle is provided', () => {
    const onToggle = vi.fn();
    render(() => <Header onSidebarToggle={onToggle} isSidebarOpen={true} />);
    const sidebarButton = screen.getByLabelText('Close sidebar');
    expect(sidebarButton).toBeInTheDocument();
    expect(sidebarButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should show open sidebar label when sidebar is closed', () => {
    const onToggle = vi.fn();
    render(() => <Header onSidebarToggle={onToggle} isSidebarOpen={false} />);
    const sidebarButton = screen.getByLabelText('Open sidebar');
    expect(sidebarButton).toBeInTheDocument();
    expect(sidebarButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should not render sidebar toggle when onSidebarToggle is not provided', () => {
    render(() => <Header />);
    expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Open sidebar')).not.toBeInTheDocument();
  });

  it('should render logo as a link to home', () => {
    render(() => <Header />);
    const logoLink = screen.getByText('Sound Blue').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should render header as fixed position', () => {
    render(() => <Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed');
  });
});
