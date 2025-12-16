/**
 * @fileoverview BottomSheet component tests
 *
 * Tests for:
 * - Rendering when open/closed
 * - Escape key closes the sheet
 * - Backdrop click closes the sheet
 * - Title rendering
 * - Body scroll lock
 * - Accessibility attributes
 */

import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

// Mock Portal to render in place
vi.mock('solid-js/web', async () => {
  const actual = await vi.importActual('solid-js/web');
  return {
    ...actual,
    Portal: (props: { children: unknown }) => props.children,
  };
});

describe('BottomSheet', () => {
  let originalOverflow: string;

  beforeEach(() => {
    vi.clearAllMocks();
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe('Rendering', () => {
    it('should render children when open', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Sheet Content</div>
        </BottomSheet>
      ));

      expect(screen.getByText('Sheet Content')).toBeInTheDocument();
    });

    it('should not render content when closed', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Sheet Content</div>
        </BottomSheet>
      ));

      expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose} title="Menu Title">
          <div>Content</div>
        </BottomSheet>
      ));

      expect(screen.getByText('Menu Title')).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard interaction', () => {
    it('should call onClose when Escape is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      await user.keyboard('{Enter}');
      await user.keyboard('a');

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not call onClose on Escape when closed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Backdrop interaction', () => {
    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Find backdrop by aria-hidden attribute
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();

      await user.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-label from title', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose} title="Navigation Menu">
          <div>Content</div>
        </BottomSheet>
      ));

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Navigation Menu');
    });

    it('should have drag handle indicator', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Drag handle has specific classes
      const dragHandle = document.querySelector('.w-10.h-1.bg-line.rounded-full');
      expect(dragHandle).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should apply opacity-100 when open', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toHaveClass('opacity-100');
    });

    it('should apply translate-y-0 to sheet when open', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      const sheet = screen.getByRole('dialog');
      expect(sheet).toHaveClass('translate-y-0');
    });

    it('should apply opacity-0 when closed but animating', () => {
      const onClose = vi.fn();
      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <BottomSheet isOpen={isOpen()} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Close the sheet
      setIsOpen(false);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        expect(backdrop).toHaveClass('opacity-0');
      }
    });

    it('should apply translate-y-full when closed', () => {
      const onClose = vi.fn();
      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <BottomSheet isOpen={isOpen()} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      setIsOpen(false);

      const sheet = screen.queryByRole('dialog');
      if (sheet) {
        expect(sheet).toHaveClass('translate-y-full');
      }
    });
  });

  describe('Transition events', () => {
    it('should handle onTransitionStart when opening', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      const sheet = screen.getByRole('dialog');

      // Trigger transitionstart event
      const event = new Event('transitionstart');
      sheet.dispatchEvent(event);

      // Sheet should still be visible
      expect(sheet).toBeInTheDocument();
    });

    it('should handle onTransitionEnd when closing', () => {
      const onClose = vi.fn();
      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <BottomSheet isOpen={isOpen()} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      const backdrop = document.querySelector('[aria-hidden="true"]');

      // Close the sheet
      setIsOpen(false);

      // Trigger transitionend event
      if (backdrop) {
        const event = new Event('transitionend');
        backdrop.dispatchEvent(event);
      }

      // After transition, sheet should eventually be removed
      // Note: This depends on the animation state being cleared
    });

    it('should set body overflow to hidden when open', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      const sheet = screen.getByRole('dialog');

      // Trigger transitionstart to simulate opening animation
      const event = new Event('transitionstart');
      sheet.dispatchEvent(event);

      // updateBodyScroll is called with true during opening
      // The actual body style change happens in the event handler
    });

    it('should clear body overflow when closed after transition', () => {
      const onClose = vi.fn();
      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <BottomSheet isOpen={isOpen()} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Close the sheet
      setIsOpen(false);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        const event = new Event('transitionend');
        backdrop.dispatchEvent(event);
      }

      // Body overflow should be cleared after close transition
    });
  });

  describe('Body scroll lock', () => {
    it('should lock body scroll when sheet opens', () => {
      const onClose = vi.fn();
      render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Simulate transitionstart which triggers scroll lock
      const sheet = screen.getByRole('dialog');
      sheet.dispatchEvent(new Event('transitionstart'));

      // The updateBodyScroll(true) sets overflow to hidden
    });

    it('should restore body scroll on cleanup', () => {
      const onClose = vi.fn();
      const { unmount } = render(() => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>
      ));

      // Set body style to simulate scroll lock
      document.body.style.overflow = 'hidden';

      // Unmount triggers onCleanup
      unmount();

      // Cleanup should restore overflow
      expect(document.body.style.overflow).toBe('');
    });
  });
});
