/**
 * @fileoverview KeyboardShortcutsProvider component tests
 *
 * Tests for:
 * - Global keyboard shortcuts (H, T, L, /, Ctrl+K, ?)
 * - Help modal open/close
 * - Input field detection (should not trigger shortcuts when typing)
 * - Context hook functionality
 */

import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dialog methods
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('~/hooks', () => ({
  useViewTransitionNavigate: () => mockNavigate,
}));

// Mock theme and language providers
const mockToggleTheme = vi.fn();
const mockToggleLanguage = vi.fn();

vi.mock('~/components/providers/ThemeProvider', () => ({
  useTheme: () => ({
    theme: () => 'light',
    toggleTheme: mockToggleTheme,
    setTheme: vi.fn(),
  }),
}));

vi.mock('~/components/providers/I18nProvider', () => ({
  useLanguage: () => ({
    t: () => ({
      keyboard: {
        title: 'Keyboard Shortcuts',
        close: 'Close',
        sections: {
          navigation: 'Navigation',
          actions: 'Actions',
          general: 'General',
        },
        shortcuts: {
          search: 'Focus search',
          home: 'Go to home',
          theme: 'Toggle theme',
          language: 'Toggle language',
          help: 'Show help',
          escape: 'Close modal',
        },
      },
    }),
    toggleLanguage: mockToggleLanguage,
    localizedPath: (path: string) => path,
  }),
}));

import { KeyboardShortcutsProvider, useKeyboardShortcuts } from './KeyboardShortcutsProvider';

// Test component to access context
function TestConsumer() {
  const { isHelpOpen, openHelp, closeHelp, toggleHelp } = useKeyboardShortcuts();
  return (
    <div>
      <span data-testid="help-open">{isHelpOpen() ? 'open' : 'closed'}</span>
      <button type="button" data-testid="open-help" onClick={openHelp}>
        Open
      </button>
      <button type="button" data-testid="close-help" onClick={closeHelp}>
        Close
      </button>
      <button type="button" data-testid="toggle-help" onClick={toggleHelp}>
        Toggle
      </button>
    </div>
  );
}

describe('KeyboardShortcutsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Context', () => {
    it('should provide keyboard shortcuts context to children', () => {
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });

    it('should throw error when useKeyboardShortcuts is used outside provider', () => {
      expect(() => render(() => <TestConsumer />)).toThrow(
        'useKeyboardShortcuts must be used within a KeyboardShortcutsProvider',
      );
    });
  });

  describe('Help modal controls', () => {
    it('should open help modal via openHelp', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.click(screen.getByTestId('open-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('open');
    });

    it('should close help modal via closeHelp', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      // Open first
      await user.click(screen.getByTestId('open-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('open');

      // Then close
      await user.click(screen.getByTestId('close-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });

    it('should toggle help modal via toggleHelp', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      // Toggle open
      await user.click(screen.getByTestId('toggle-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('open');

      // Toggle closed
      await user.click(screen.getByTestId('toggle-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should navigate home on H key', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <div>Content</div>
        </KeyboardShortcutsProvider>
      ));

      await user.keyboard('h');

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should toggle theme on T key', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <div>Content</div>
        </KeyboardShortcutsProvider>
      ));

      await user.keyboard('t');

      expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('should open help modal on ? key', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.keyboard('{Shift>}?{/Shift}');

      await waitFor(() => {
        expect(screen.getByTestId('help-open')).toHaveTextContent('open');
      });
    });

    it('should close help modal on Escape', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      // Open help first
      await user.click(screen.getByTestId('open-help'));
      expect(screen.getByTestId('help-open')).toHaveTextContent('open');

      // Press Escape
      await user.keyboard('{Escape}');

      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });

    it('should focus search on / key', async () => {
      render(() => (
        <KeyboardShortcutsProvider>
          <input type="search" data-testid="search-input" />
        </KeyboardShortcutsProvider>
      ));

      // Click somewhere else first
      document.body.click();

      await userEvent.keyboard('/');

      expect(document.activeElement).toBe(screen.getByTestId('search-input'));
    });

    it('should focus search on Ctrl+K', async () => {
      render(() => (
        <KeyboardShortcutsProvider>
          <input type="search" data-testid="search-input" />
        </KeyboardShortcutsProvider>
      ));

      await userEvent.keyboard('{Control>}k{/Control}');

      expect(document.activeElement).toBe(screen.getByTestId('search-input'));
    });
  });

  describe('Input field detection', () => {
    it('should not trigger H shortcut when typing in input', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <input type="text" data-testid="text-input" />
        </KeyboardShortcutsProvider>
      ));

      const input = screen.getByTestId('text-input');
      await user.click(input);
      await user.type(input, 'h');

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
      // Should type in input
      expect(input).toHaveValue('h');
    });

    it('should not trigger T shortcut when typing in textarea', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <textarea data-testid="textarea" />
        </KeyboardShortcutsProvider>
      ));

      const textarea = screen.getByTestId('textarea');
      await user.click(textarea);
      await user.type(textarea, 't');

      expect(mockToggleTheme).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('t');
    });

    it('should still allow Ctrl+K in input fields', async () => {
      render(() => (
        <KeyboardShortcutsProvider>
          <input type="text" data-testid="text-input" />
          <input type="search" data-testid="search-input" />
        </KeyboardShortcutsProvider>
      ));

      const textInput = screen.getByTestId('text-input');
      textInput.focus();

      await userEvent.keyboard('{Control>}k{/Control}');

      // Should focus search even from text input
      expect(document.activeElement).toBe(screen.getByTestId('search-input'));
    });

    it('should still allow Escape in input fields', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
          <input type="text" data-testid="text-input" />
        </KeyboardShortcutsProvider>
      ));

      // Open help
      await user.click(screen.getByTestId('open-help'));

      // Focus input
      const input = screen.getByTestId('text-input');
      await user.click(input);

      // Escape should still close help
      await user.keyboard('{Escape}');

      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });
  });

  describe('Modifier key handling', () => {
    it('should not trigger H when Ctrl is pressed', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <div>Content</div>
        </KeyboardShortcutsProvider>
      ));

      await user.keyboard('{Control>}h{/Control}');

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not trigger T when Shift is pressed', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <div>Content</div>
        </KeyboardShortcutsProvider>
      ));

      await user.keyboard('{Shift>}t{/Shift}');

      expect(mockToggleTheme).not.toHaveBeenCalled();
    });
  });

  describe('Help modal content', () => {
    it('should display help modal with title', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.click(screen.getByTestId('open-help'));

      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });
    });

    it('should display section headers', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.click(screen.getByTestId('open-help'));

      await waitFor(() => {
        expect(screen.getByText('Navigation')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
        expect(screen.getByText('General')).toBeInTheDocument();
      });
    });

    it('should have close button', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.click(screen.getByTestId('open-help'));

      await waitFor(() => {
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(() => (
        <KeyboardShortcutsProvider>
          <TestConsumer />
        </KeyboardShortcutsProvider>
      ));

      await user.click(screen.getByTestId('open-help'));

      await waitFor(() => {
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Close'));

      expect(screen.getByTestId('help-open')).toHaveTextContent('closed');
    });
  });
});
