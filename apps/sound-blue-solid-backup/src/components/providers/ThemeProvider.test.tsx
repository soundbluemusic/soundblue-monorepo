import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

// Mock storage module with async functions
vi.mock('~/utils/storage', () => ({
  getRawStorageItem: vi.fn(),
  setRawStorageItem: vi.fn(),
  migrateFromLocalStorage: vi.fn(),
}));

import { getRawStorageItem, setRawStorageItem } from '~/utils/storage';

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
    // Default mock implementations returning resolved promises
    vi.mocked(getRawStorageItem).mockResolvedValue(null);
    vi.mocked(setRawStorageItem).mockResolvedValue(undefined);
  });

  it('should provide theme context to children', () => {
    function TestChild() {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme()}</div>;
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    expect(screen.getByTestId('theme')).toBeInTheDocument();
  });

  it('should default to light theme', () => {
    vi.mocked(getRawStorageItem).mockResolvedValue(null);

    function TestChild() {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme()}</div>;
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should toggle theme from light to dark', async () => {
    vi.mocked(getRawStorageItem).mockResolvedValue(null);
    const user = userEvent.setup();

    function TestChild() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme()}</span>
          <button type="button" onClick={toggleTheme}>
            Toggle
          </button>
        </div>
      );
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    // Initial state is light
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    // Toggle to dark
    await user.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    // Toggle back to light
    await user.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should set theme directly', async () => {
    vi.mocked(getRawStorageItem).mockResolvedValue(null);
    const user = userEvent.setup();

    function TestChild() {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme()}</span>
          <button type="button" onClick={() => setTheme('dark')}>
            Set Dark
          </button>
        </div>
      );
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    await user.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('should throw error when useTheme is used outside provider', () => {
    function TestChild() {
      useTheme();
      return <div>Test</div>;
    }

    expect(() => render(() => <TestChild />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
  });

  it('should read initial theme from IndexedDB', () => {
    vi.mocked(getRawStorageItem).mockResolvedValue('dark');

    function TestChild() {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme()}</div>;
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    // After mount, should read from IndexedDB
    expect(getRawStorageItem).toHaveBeenCalledWith('sb-theme');
  });

  it('should save theme to IndexedDB when changed', async () => {
    vi.mocked(getRawStorageItem).mockResolvedValue(null);
    const user = userEvent.setup();

    function TestChild() {
      const { toggleTheme } = useTheme();
      return (
        <button type="button" onClick={toggleTheme}>
          Toggle
        </button>
      );
    }

    render(() => (
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    ));

    await user.click(screen.getByText('Toggle'));
    expect(setRawStorageItem).toHaveBeenCalledWith('sb-theme', 'dark');
  });
});
