import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeIcon } from './ThemeIcon';

describe('ThemeIcon', () => {
  describe('테마별 렌더링', () => {
    it('dark 테마 아이콘 렌더링 (달 모양)', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      // 달 모양 path 확인
      const path = svg?.querySelector('path');
      expect(path).toHaveAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    });

    it('light 테마 아이콘 렌더링 (해 모양)', () => {
      const { container } = render(<ThemeIcon theme="light" />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      // 해 중앙 원
      const circle = svg?.querySelector('circle');
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '5');
    });
  });

  describe('기본 속성', () => {
    it('기본 className 적용 (dark)', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('theme-icon');
    });

    it('기본 className 적용 (light)', () => {
      const { container } = render(<ThemeIcon theme="light" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('theme-icon');
    });

    it('기본 크기는 18', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '18');
      expect(svg).toHaveAttribute('height', '18');
    });
  });

  describe('사용자 정의 className', () => {
    it('커스텀 className 적용', () => {
      const { container } = render(<ThemeIcon theme="dark" className="custom-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
      expect(svg).not.toHaveClass('theme-icon');
    });

    it('빈 문자열 className', () => {
      const { container } = render(<ThemeIcon theme="dark" className="" />);
      const svg = container.querySelector('svg');
      // Empty className overrides default, component should still render
      expect(svg).toBeInTheDocument();
    });
  });

  describe('사용자 정의 크기', () => {
    it('size prop으로 크기 변경', () => {
      const { container } = render(<ThemeIcon theme="dark" size={24} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('작은 크기 (12px)', () => {
      const { container } = render(<ThemeIcon theme="light" size={12} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
      expect(svg).toHaveAttribute('height', '12');
    });

    it('큰 크기 (32px)', () => {
      const { container } = render(<ThemeIcon theme="dark" size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });
  });

  describe('SVG 속성', () => {
    it('viewBox 설정 (dark)', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('viewBox 설정 (light)', () => {
      const { container } = render(<ThemeIcon theme="light" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('stroke 속성 (dark)', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('stroke 속성 (light)', () => {
      const { container } = render(<ThemeIcon theme="light" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('fill', 'none');
    });
  });

  describe('Edge Cases', () => {
    it('size 0', () => {
      const { container } = render(<ThemeIcon theme="dark" size={0} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('size 음수 (-10)', () => {
      const { container } = render(<ThemeIcon theme="dark" size={-10} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '-10');
      expect(svg).toHaveAttribute('height', '-10');
    });

    it('매우 큰 size (1000)', () => {
      const { container } = render(<ThemeIcon theme="light" size={1000} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '1000');
      expect(svg).toHaveAttribute('height', '1000');
    });
  });

  describe('조건부 렌더링', () => {
    it('테마 변경 시 다른 아이콘 렌더링', () => {
      const { container, rerender } = render(<ThemeIcon theme="dark" />);

      // dark 아이콘
      let svg = container.querySelector('svg');
      let darkPath = svg?.querySelector('path[d*="M21 12.79"]');
      expect(darkPath).toBeInTheDocument();

      // light로 변경
      rerender(<ThemeIcon theme="light" />);

      svg = container.querySelector('svg');
      const lightCircle = svg?.querySelector('circle');
      expect(lightCircle).toBeInTheDocument();
      expect(lightCircle).toHaveAttribute('r', '5');

      // dark path는 사라짐
      darkPath = svg?.querySelector('path[d*="M21 12.79"]');
      expect(darkPath).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('currentColor 사용으로 CSS로 색상 제어 가능', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('SVG는 inline으로 렌더링 (스크린 리더 고려)', () => {
      const { container } = render(<ThemeIcon theme="dark" />);
      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
    });
  });
});
