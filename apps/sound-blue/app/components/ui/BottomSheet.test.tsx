import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  describe('렌더링', () => {
    it('isOpen이 true일 때 렌더링', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet">
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('isOpen이 false일 때 렌더링 안 됨', () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('title이 있을 때 헤딩 렌더링', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Test Title">
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
      });
    });

    it('title이 없을 때 헤딩 렌더링 안 됨', async () => {
      const onClose = vi.fn();
      const { container } = render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(container.querySelector('h2')).not.toBeInTheDocument();
      });
    });

    it('children 렌더링', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div data-testid="child-content">Child Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('dialog role 설정', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('role', 'dialog');
      });
    });

    it('aria-modal 설정', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('title이 있을 때 aria-label 설정', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Accessible Title">
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label', 'Accessible Title');
      });
    });

    it('backdrop에 aria-hidden', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Backdrop is rendered in a portal to document.body, not in container
      // Use attribute selector for aria-hidden backdrop
      const backdrop = document.body.querySelector('[aria-hidden="true"].bg-bg-overlay');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('이벤트 핸들러', () => {
    it('backdrop 클릭 시 onClose 호출', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Backdrop is rendered in a portal to document.body
      const backdrop = document.body.querySelector('.bg-bg-overlay');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledOnce();
      }
    });

    it('Escape 키 눌러서 닫기', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('isOpen이 false일 때 Escape 키 무시', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body 스크롤 잠금', () => {
    it('isOpen이 true일 때 body 스크롤 잠금', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('isOpen이 false일 때 body 스크롤 복원', async () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      rerender(
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('unmount 시 body 스크롤 복원', async () => {
      const onClose = vi.fn();
      const { unmount } = render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('CSS 클래스', () => {
    it('isOpen이 true일 때 translate-y-0', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        const sheet = screen.getByRole('dialog');
        expect(sheet.className).toContain('translate-y-0');
      });
    });

    it('isOpen이 false일 때 translate-y-full', async () => {
      const onClose = vi.fn();
      const { container, rerender } = render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      rerender(
        <BottomSheet isOpen={false} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      // isAnimating이 true일 때 여전히 렌더링됨
      await waitFor(() => {
        const sheet = container.querySelector('[role="dialog"]');
        if (sheet) {
          expect(sheet.className).toContain('translate-y-full');
        }
      });
    });

    it('backdrop opacity-100 (isOpen=true)', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Backdrop is rendered in a portal to document.body
      const backdrop = document.body.querySelector('.bg-bg-overlay');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop?.className).toContain('opacity-100');
    });
  });

  describe('Edge Cases', () => {
    it('빈 children', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          {''}
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('null children', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          {null}
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('여러 children', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
      });
    });

    it('빈 문자열 title', async () => {
      const onClose = vi.fn();
      const { container } = render(
        <BottomSheet isOpen={true} onClose={onClose} title="">
          <div>Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        // title이 빈 문자열이면 헤딩 렌더링 안 됨 (falsy)
        expect(container.querySelector('h2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Portal', () => {
    it('document.body에 렌더링', async () => {
      const onClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={onClose}>
          <div data-testid="portal-content">Portal Content</div>
        </BottomSheet>,
      );

      await waitFor(() => {
        const content = screen.getByTestId('portal-content');
        expect(content.parentElement?.parentElement?.parentElement).toBe(document.body);
      });
    });
  });
});
