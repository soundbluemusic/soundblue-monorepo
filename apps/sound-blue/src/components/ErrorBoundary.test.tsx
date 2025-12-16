/**
 * @fileoverview ErrorBoundary component tests
 *
 * Tests for:
 * - Error fallback rendering
 * - Error message display
 * - Reset functionality
 * - Navigation to home
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal, type JSX } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useLanguage
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      common: {
        error: 'Something went wrong',
        tryAgain: 'Try Again',
      },
      notFound: {
        backHome: 'Back to Home',
      },
    }),
    localizedPath: (path: string) => path,
  }),
}));

// Mock UI components to avoid @solidjs/start import chain
vi.mock('~/components/ui', () => ({
  Button: (props: {
    variant?: string;
    size?: string;
    onClick?: () => void;
    children: JSX.Element;
  }) => (
    <button type="button" onClick={props.onClick}>
      {props.children}
    </button>
  ),
  buttonVariants: () => 'mock-button-class',
}));

// Mock router A component
vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; class?: string; children: JSX.Element }) => (
    <a href={props.href} class={props.class}>
      {props.children}
    </a>
  ),
}));

// Import after mocks
import { AppErrorBoundary } from './ErrorBoundary';

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal rendering', () => {
    it('should render children when no error', () => {
      render(() => (
        <AppErrorBoundary>
          <div>Normal Content</div>
        </AppErrorBoundary>
      ));

      expect(screen.getByText('Normal Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(() => (
        <AppErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </AppErrorBoundary>
      ));

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should render error fallback when child throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error message');
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display default message when error has no message', () => {
      const ThrowingComponent = () => {
        throw new Error();
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('should log error to console', () => {
      const testError = new Error('Console test error');
      const ThrowingComponent = () => {
        throw testError;
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(console.error).toHaveBeenCalledWith('Application Error:', testError);
    });
  });

  describe('Reset functionality', () => {
    it('should render Try Again button', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should reset error state when Try Again is clicked', async () => {
      const user = userEvent.setup();
      const [shouldThrow, setShouldThrow] = createSignal(true);

      const ConditionalThrow = () => {
        if (shouldThrow()) {
          throw new Error('Conditional error');
        }
        return <div>Recovered Content</div>;
      };

      render(() => (
        <AppErrorBoundary>
          <ConditionalThrow />
        </AppErrorBoundary>
      ));

      expect(screen.getByText('Conditional error')).toBeInTheDocument();

      // Fix the error condition
      setShouldThrow(false);

      // Click Try Again
      const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
      await user.click(tryAgainButton);

      // Should show recovered content
      expect(screen.getByText('Recovered Content')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render Back to Home link', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      const homeLink = screen.getByRole('link', { name: 'Back to Home' });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have heading', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(() => (
        <AppErrorBoundary>
          <ThrowingComponent />
        </AppErrorBoundary>
      ));

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
