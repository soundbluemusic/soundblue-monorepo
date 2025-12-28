import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, LinkButton } from './Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('기본 버튼 렌더링', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('자식 요소 렌더링', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>,
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('primary variant 적용', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-(--color-accent-primary)');
    });

    it('secondary variant 적용', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-(--color-bg-tertiary)');
    });

    it('ghost variant 적용', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
    });

    it('youtube variant 적용', () => {
      render(<Button variant="youtube">YouTube</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[#dc2626]');
    });

    it('기본 variant는 primary', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-(--color-accent-primary)');
    });
  });

  describe('Sizes', () => {
    it('sm 사이즈 적용', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('text-sm');
    });

    it('md 사이즈 적용', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
    });

    it('lg 사이즈 적용', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('text-base');
    });

    it('기본 사이즈는 md', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
    });
  });

  describe('사용자 정의 className', () => {
    it('추가 className 적용', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('bg-(--color-accent-primary)'); // 기본 variant도 유지
    });
  });

  describe('이벤트 핸들러', () => {
    it('onClick 이벤트 발생', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('disabled 상태에서 onClick 미발생', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // disabled 버튼은 클릭 불가
      try {
        await user.click(button);
      } catch {
        /* expected to fail */
      }
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('HTML 속성 전달', () => {
    it('type 속성 전달', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('aria-label 속성 전달', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('data-* 속성 전달', () => {
      render(<Button data-testid="custom-button">Test</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('빈 children', () => {
      render(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('null children', () => {
      render(<Button>{null}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('undefined children', () => {
      render(<Button>{undefined}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('숫자 children', () => {
      render(<Button>{0}</Button>);
      expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();
    });
  });
});

describe('LinkButton', () => {
  describe('렌더링', () => {
    it('링크로 렌더링', () => {
      render(<LinkButton href="/about">About</LinkButton>);
      const link = screen.getByRole('link', { name: 'About' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('외부 링크 렌더링', () => {
      render(
        <LinkButton href="https://example.com" target="_blank" rel="noopener noreferrer">
          External
        </LinkButton>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Variants', () => {
    it('primary variant 적용', () => {
      render(
        <LinkButton href="/" variant="primary">
          Link
        </LinkButton>,
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('bg-(--color-accent-primary)');
    });

    it('youtube variant 적용', () => {
      render(
        <LinkButton href="https://youtube.com" variant="youtube">
          YouTube
        </LinkButton>,
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('bg-[#dc2626]');
    });
  });

  describe('Sizes', () => {
    it('lg 사이즈 적용', () => {
      render(
        <LinkButton href="/" size="lg">
          Large Link
        </LinkButton>,
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('px-6');
    });
  });

  describe('접근성', () => {
    it('aria-label 지원', () => {
      render(
        <LinkButton href="/close" aria-label="닫기">
          X
        </LinkButton>,
      );
      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('href 필수 (TypeScript 타입 체크)', () => {
      // This test verifies TypeScript enforces href requirement at compile time
      // @ts-expect-error - href is required but we test runtime behavior
      const { container } = render(<LinkButton>No href</LinkButton>);

      // Without href, component should still render but may not have proper link behavior
      expect(container).toBeInTheDocument();
    });
  });
});
