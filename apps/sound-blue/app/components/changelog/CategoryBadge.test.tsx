import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
  describe('렌더링', () => {
    it('label 텍스트 렌더링', () => {
      render(<CategoryBadge type="added" label="Added" />);
      expect(screen.getByText('Added')).toBeInTheDocument();
    });

    it('span 요소로 렌더링', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('카테고리 타입별 스타일', () => {
    it('added 타입은 녹색 스타일', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-800');
    });

    it('changed 타입은 노란색 스타일', () => {
      render(<CategoryBadge type="changed" label="Changed" />);
      const badge = screen.getByText('Changed');
      expect(badge.className).toContain('bg-yellow-100');
      expect(badge.className).toContain('text-yellow-800');
    });

    it('fixed 타입은 파란색 스타일', () => {
      render(<CategoryBadge type="fixed" label="Fixed" />);
      const badge = screen.getByText('Fixed');
      expect(badge.className).toContain('bg-blue-100');
      expect(badge.className).toContain('text-blue-800');
    });

    it('removed 타입은 빨간색 스타일', () => {
      render(<CategoryBadge type="removed" label="Removed" />);
      const badge = screen.getByText('Removed');
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-800');
    });

    it('deprecated 타입은 회색 스타일', () => {
      render(<CategoryBadge type="deprecated" label="Deprecated" />);
      const badge = screen.getByText('Deprecated');
      expect(badge.className).toContain('bg-gray-100');
      expect(badge.className).toContain('text-gray-800');
    });

    it('security 타입은 보라색 스타일', () => {
      render(<CategoryBadge type="security" label="Security" />);
      const badge = screen.getByText('Security');
      expect(badge.className).toContain('bg-purple-100');
      expect(badge.className).toContain('text-purple-800');
    });
  });

  describe('공통 스타일', () => {
    it('rounded-full 클래스 적용', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.className).toContain('rounded-full');
    });

    it('inline-flex 클래스 적용', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.className).toContain('inline-flex');
    });

    it('text-xs font-medium 클래스 적용', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.className).toContain('text-xs');
      expect(badge.className).toContain('font-medium');
    });
  });

  describe('다크 모드 스타일', () => {
    it('added 타입에 다크 모드 스타일 포함', () => {
      render(<CategoryBadge type="added" label="Added" />);
      const badge = screen.getByText('Added');
      expect(badge.className).toContain('dark:bg-green-900/30');
      expect(badge.className).toContain('dark:text-green-400');
    });

    it('security 타입에 다크 모드 스타일 포함', () => {
      render(<CategoryBadge type="security" label="Security" />);
      const badge = screen.getByText('Security');
      expect(badge.className).toContain('dark:bg-purple-900/30');
      expect(badge.className).toContain('dark:text-purple-400');
    });
  });

  describe('한글 라벨', () => {
    it('한글 라벨 렌더링', () => {
      render(<CategoryBadge type="added" label="추가" />);
      expect(screen.getByText('추가')).toBeInTheDocument();
    });

    it('한글 라벨과 스타일 조합', () => {
      render(<CategoryBadge type="fixed" label="수정" />);
      const badge = screen.getByText('수정');
      expect(badge.className).toContain('bg-blue-100');
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => render(<CategoryBadge type="added" label="Added" />)).not.toThrow();
    });

    it('빈 라벨도 렌더링 가능', () => {
      const { container } = render(<CategoryBadge type="added" label="" />);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('경계값 테스트', () => {
    it('미정의 타입 전달 시 undefined 스타일 적용', () => {
      // categoryStyles['unknown']은 undefined를 반환하여 클래스에 undefined가 포함됨
      // @ts-expect-error Testing unknown type to verify boundary handling
      const { container } = render(<CategoryBadge type="unknown" label="Test" />);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      // undefined가 className에 문자열로 포함됨
      expect(badge?.className).toContain('undefined');
    });

    it('공백만 있는 라벨', () => {
      const { container } = render(<CategoryBadge type="added" label="   " />);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('   ');
    });

    it('특수문자 포함 라벨', () => {
      render(<CategoryBadge type="added" label="<script>alert('xss')</script>" />);
      const badge = screen.getByText("<script>alert('xss')</script>");
      expect(badge).toBeInTheDocument();
      // React는 자동으로 XSS를 방지함
    });

    it('이모지 포함 라벨', () => {
      render(<CategoryBadge type="added" label="🎉 New Feature" />);
      expect(screen.getByText('🎉 New Feature')).toBeInTheDocument();
    });

    it('매우 긴 라벨', () => {
      const longLabel = 'A'.repeat(1000);
      render(<CategoryBadge type="added" label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('유니코드 특수문자 라벨', () => {
      render(<CategoryBadge type="fixed" label="버그 수정 \u200B (zero-width space)" />);
      const badge = screen.getByText(/버그 수정/);
      expect(badge).toBeInTheDocument();
    });

    it('모든 유효한 타입에 대해 렌더링 성공', () => {
      const types = ['added', 'changed', 'fixed', 'removed', 'deprecated', 'security'] as const;
      for (const type of types) {
        const { unmount } = render(<CategoryBadge type={type} label={type} />);
        expect(screen.getByText(type)).toBeInTheDocument();
        unmount();
      }
    });
  });
});
