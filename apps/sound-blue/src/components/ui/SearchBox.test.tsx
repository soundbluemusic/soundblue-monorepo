/**
 * @fileoverview SearchBox component tests
 *
 * Tests for:
 * - Search input rendering and filtering
 * - Keyboard navigation (arrows, enter, escape)
 * - Global keyboard shortcuts (Ctrl+K, /)
 * - Click outside behavior
 * - Accessibility (ARIA attributes)
 */

import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock router
const mockNavigate = vi.fn();
const mockPreloadRoute = vi.fn();

/** Mock props for SolidJS Router's A component */
interface MockAProps {
  children: JSX.Element;
  href: string;
  role?: 'option' | 'link' | 'button';
  tabIndex?: number;
  'aria-selected'?: boolean;
  class?: string;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

vi.mock('@solidjs/router', () => ({
  A: (props: MockAProps) => {
    // Use div instead of anchor to properly support role="option"
    const { children, href, ...rest } = props;
    return (
      <div data-href={href} {...rest}>
        {children}
      </div>
    );
  },
  useNavigate: () => mockNavigate,
  usePreloadRoute: () => mockPreloadRoute,
}));

// Mock I18nProvider
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      search: {
        placeholder: 'Search...',
        label: 'Search site',
        clear: 'Clear search',
        noResults: 'No results found',
        pages: {
          home: { title: 'Home', desc: 'Welcome page' },
          sitemap: { title: 'Sitemap', desc: 'Site navigation' },
          privacy: { title: 'Privacy Policy', desc: 'Privacy information' },
          terms: { title: 'Terms of Service', desc: 'Terms and conditions' },
          license: { title: 'License', desc: 'License information' },
          soundRecording: { title: 'Sound Recording', desc: 'Recording samples' },
        },
      },
    }),
    localizedPath: (path: string) => path,
  }),
}));

import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(() => <SearchBox />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render with placeholder text', () => {
      render(() => <SearchBox />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Search site');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('should show keyboard shortcut hint when not focused', () => {
      render(() => <SearchBox />);

      // Should show Ctrl+K or ⌘K hint
      const hintText = screen.queryByText(/Ctrl\+K|⌘K/);
      expect(hintText).toBeInTheDocument();
    });
  });

  describe('Search filtering', () => {
    it('should filter results based on title match', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Privacy');

      await waitFor(() => {
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });

    it('should filter results based on description match', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'navigation');

      await waitFor(() => {
        expect(screen.getByText('Sitemap')).toBeInTheDocument();
      });
    });

    it('should filter results based on path match', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, '/privacy');

      await waitFor(() => {
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });

    it('should show no results message for unmatched query', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'xyznonexistent');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'PRIVACY');

      await waitFor(() => {
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate down with ArrowDown and select on Enter', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');
      // ArrowDown selects first result (index 0)
      await user.keyboard('{ArrowDown}{Enter}');

      // Should navigate to privacy page
      expect(mockNavigate).toHaveBeenCalledWith('/privacy');
    });

    it('should navigate up with ArrowUp after going down', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      // Search for 'p' which returns multiple results (privacy, sound-recording has 'p')
      await user.type(input, 's');

      // Down to first (sitemap), down to second (sound-recording), up back to first
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');

      // Should navigate to sitemap (first result)
      expect(mockNavigate).toHaveBeenCalledWith('/sitemap');
    });

    it('should wrap around at the end of list', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'home');

      // Only one result for 'home', press down twice to wrap back to first
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      // Should navigate to home (wrapped back to first)
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should close dropdown and blur on Escape', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');

      // Dropdown should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      // Dropdown should close
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should navigate to selected result on Enter', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('/privacy');
    });
  });

  describe('Clear button', () => {
    it('should show clear button when there is text', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('should close dropdown when cleared', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');

      // Dropdown should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Dropdown should close
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown behavior', () => {
    it('should open dropdown on focus with existing query', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');

      // Blur and refocus
      await user.tab();
      await user.click(input);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should update aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.type(input, 'privacy');

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('should preload route on hover', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');

      // Hover on the option element (which has onMouseEnter)
      const options = screen.getAllByRole('option');
      const firstOption = options[0];
      expect(firstOption).toBeDefined();
      await user.hover(firstOption!);

      expect(mockPreloadRoute).toHaveBeenCalledWith('/privacy');
    });
  });

  describe('Global keyboard shortcuts', () => {
    it('should focus input on Ctrl+K', async () => {
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');

      // Simulate Ctrl+K
      await userEvent.keyboard('{Control>}k{/Control}');

      expect(document.activeElement).toBe(input);
    });

    it('should focus input on / key', async () => {
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');

      // Click outside first to unfocus
      document.body.click();

      // Simulate / key
      await userEvent.keyboard('/');

      expect(document.activeElement).toBe(input);
    });
  });

  describe('Accessibility', () => {
    it('should have listbox role on dropdown', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'privacy');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should have option role on each result', async () => {
      const user = userEvent.setup();
      render(() => <SearchBox />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'p');

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });
});
