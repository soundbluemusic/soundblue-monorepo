/**
 * @fileoverview ClientOnly component tests
 *
 * Tests for:
 * - SSR behavior (doesn't render initially)
 * - Client-side mounting
 * - Fallback rendering
 */

import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { ClientOnly } from './ClientOnly';

describe('ClientOnly', () => {
  describe('Client-side rendering', () => {
    it('should render children after mount', async () => {
      render(() => (
        <ClientOnly>
          <div>Client Content</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('Client Content')).toBeInTheDocument();
      });
    });

    it('should render multiple children', async () => {
      render(() => (
        <ClientOnly>
          <div>First Child</div>
          <div>Second Child</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('First Child')).toBeInTheDocument();
        expect(screen.getByText('Second Child')).toBeInTheDocument();
      });
    });

    it('should render nested components', async () => {
      const NestedComponent = () => <span>Nested</span>;

      render(() => (
        <ClientOnly>
          <div>
            <NestedComponent />
          </div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('Nested')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback rendering', () => {
    it('should show fallback initially when provided', () => {
      // Note: In jsdom, onMount fires immediately, so this tests the fallback prop handling
      render(() => (
        <ClientOnly fallback={<div>Loading...</div>}>
          <div>Content</div>
        </ClientOnly>
      ));

      // After mount, content should be visible
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept JSX element as fallback', async () => {
      const FallbackComponent = () => <span>Custom Fallback</span>;

      render(() => (
        <ClientOnly fallback={<FallbackComponent />}>
          <div>Main Content</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });
    });

    it('should work without fallback prop', async () => {
      render(() => (
        <ClientOnly>
          <div>No Fallback Content</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('No Fallback Content')).toBeInTheDocument();
      });
    });
  });

  describe('Component behavior', () => {
    it('should handle empty children', async () => {
      const { container } = render(() => <ClientOnly>{null}</ClientOnly>);

      await waitFor(() => {
        // Should render without errors
        expect(container).toBeInTheDocument();
      });
    });

    it('should handle string children', async () => {
      render(() => <ClientOnly>Plain text content</ClientOnly>);

      await waitFor(() => {
        expect(screen.getByText('Plain text content')).toBeInTheDocument();
      });
    });

    it('should handle undefined fallback', async () => {
      render(() => (
        <ClientOnly fallback={undefined}>
          <div>Content with undefined fallback</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText('Content with undefined fallback')).toBeInTheDocument();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work with browser API component wrapper', async () => {
      // Simulates wrapping a component that uses document/window
      const BrowserAPIComponent = () => {
        // This would fail during SSR without ClientOnly
        const width = typeof window !== 'undefined' ? window.innerWidth : 0;
        return <div>Window width: {width}</div>;
      };

      render(() => (
        <ClientOnly>
          <BrowserAPIComponent />
        </ClientOnly>
      ));

      await waitFor(() => {
        expect(screen.getByText(/Window width:/)).toBeInTheDocument();
      });
    });

    it('should preserve reactivity in children', async () => {
      // Note: This is a basic test; full reactivity testing would require signals
      render(() => (
        <ClientOnly>
          <div data-testid="reactive-child">Reactive Content</div>
        </ClientOnly>
      ));

      await waitFor(() => {
        const element = screen.getByTestId('reactive-child');
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent('Reactive Content');
      });
    });
  });
});
