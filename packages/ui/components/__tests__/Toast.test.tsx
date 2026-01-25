/**
 * @soundblue/ui-components - Toast Tests
 * Tests for Toast component
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from '../src/base/components/Toast';
import type { Toast as ToastData } from '../src/base/stores/toast-store';

const createMockToast = (overrides: Partial<ToastData> = {}): ToastData => ({
  id: 'test-toast-1',
  type: 'info',
  title: 'Test Toast',
  ...overrides,
});

describe('Toast component', () => {
  describe('rendering', () => {
    it('should render toast with title', () => {
      const toast = createMockToast({ title: 'Hello World' });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render toast with description', () => {
      const toast = createMockToast({
        title: 'Title',
        description: 'This is a description',
      });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const toast = createMockToast({ title: 'Title Only' });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.queryByText('description')).not.toBeInTheDocument();
    });

    it('should have role="alert"', () => {
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('toast types', () => {
    it.each([
      'success',
      'error',
      'warning',
      'info',
    ] as const)('should render %s type toast', (type) => {
      const toast = createMockToast({ type, title: `${type} toast` });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByText(`${type} toast`)).toBeInTheDocument();
    });

    it('should show success icon for success type', () => {
      const toast = createMockToast({ type: 'success' });
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />);

      // Check for green color class on icon container
      const iconContainer = container.querySelector('.text-green-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should show error icon for error type', () => {
      const toast = createMockToast({ type: 'error' });
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />);

      const iconContainer = container.querySelector('.text-red-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should show warning icon for warning type', () => {
      const toast = createMockToast({ type: 'warning' });
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />);

      const iconContainer = container.querySelector('.text-amber-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should show info icon for info type', () => {
      const toast = createMockToast({ type: 'info' });
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />);

      const iconContainer = container.querySelector('.text-blue-500');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('dismiss button', () => {
    it('should render dismiss button', () => {
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('should call onDismiss with toast id when clicked', () => {
      const onDismiss = vi.fn();
      const toast = createMockToast({ id: 'unique-id' });
      render(<Toast toast={toast} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss'));

      expect(onDismiss).toHaveBeenCalledWith('unique-id');
    });

    it('should call onDismiss exactly once per click', () => {
      const onDismiss = vi.fn();
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss'));
      fireEvent.click(screen.getByLabelText('Dismiss'));

      expect(onDismiss).toHaveBeenCalledTimes(2);
    });
  });

  describe('action button', () => {
    it('should render action button when provided', () => {
      const toast = createMockToast({
        action: {
          label: 'Undo',
          onClick: vi.fn(),
        },
      });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should not render action button when not provided', () => {
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    });

    it('should call action onClick when clicked', () => {
      const onClick = vi.fn();
      const toast = createMockToast({
        action: {
          label: 'Retry',
          onClick,
        },
      });
      render(<Toast toast={toast} onDismiss={vi.fn()} />);

      fireEvent.click(screen.getByText('Retry'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const toast = createMockToast();
      const { container } = render(
        <Toast toast={toast} onDismiss={vi.fn()} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should merge custom className with default styles', () => {
      const toast = createMockToast();
      const { container } = render(
        <Toast toast={toast} onDismiss={vi.fn()} className="my-class" />,
      );

      const toastEl = container.firstChild as HTMLElement;
      expect(toastEl.className).toContain('my-class');
      expect(toastEl.className).toContain('flex');
    });
  });

  describe('custom props', () => {
    it('should forward additional props', () => {
      const toast = createMockToast();
      render(<Toast toast={toast} onDismiss={vi.fn()} data-testid="custom-toast" />);

      expect(screen.getByTestId('custom-toast')).toBeInTheDocument();
    });
  });
});
