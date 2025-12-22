import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CSSParticles } from './CSSParticles';

describe('CSSParticles', () => {
  describe('렌더링', () => {
    it('컨테이너 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.css-particles');
      expect(particlesContainer).toBeInTheDocument();
    });

    it('12개의 파티클 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.particle');
      expect(particles.length).toBe(12);
    });

    it('각 파티클에 고유 클래스', () => {
      const { container } = render(<CSSParticles />);

      for (let i = 1; i <= 12; i++) {
        const particle = container.querySelector(`.particle-${i}`);
        expect(particle).toBeInTheDocument();
      }
    });
  });

  describe('접근성', () => {
    it('aria-hidden="true" 설정 (스크린 리더에서 숨김)', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.css-particles');
      expect(particlesContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('구조', () => {
    it('모든 파티클이 particle 공통 클래스 포함', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.particle');

      particles.forEach((particle) => {
        expect(particle.classList.contains('particle')).toBe(true);
      });
    });

    it('컨테이너가 모든 파티클 포함', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.css-particles');
      const particles = container.querySelectorAll('.particle');

      particles.forEach((particle) => {
        expect(particlesContainer).toContainElement(particle);
      });
    });
  });

  describe('Edge Cases', () => {
    it('여러 번 렌더링해도 동일한 구조', () => {
      const { container: container1 } = render(<CSSParticles />);
      const { container: container2 } = render(<CSSParticles />);

      const particles1 = container1.querySelectorAll('.particle');
      const particles2 = container2.querySelectorAll('.particle');

      expect(particles1.length).toBe(particles2.length);
      expect(particles1.length).toBe(12);
    });

    it('unmount 후 다시 mount', () => {
      const { container, unmount } = render(<CSSParticles />);
      expect(container.querySelector('.css-particles')).toBeInTheDocument();

      unmount();
      expect(container.querySelector('.css-particles')).not.toBeInTheDocument();

      const { container: newContainer } = render(<CSSParticles />);
      expect(newContainer.querySelector('.css-particles')).toBeInTheDocument();
    });
  });

  describe('CSS 클래스 검증', () => {
    it('파티클 1-12 모두 존재', () => {
      const { container } = render(<CSSParticles />);

      const expectedClasses = [
        'particle-1',
        'particle-2',
        'particle-3',
        'particle-4',
        'particle-5',
        'particle-6',
        'particle-7',
        'particle-8',
        'particle-9',
        'particle-10',
        'particle-11',
        'particle-12',
      ];

      expectedClasses.forEach((className) => {
        const particle = container.querySelector(`.${className}`);
        expect(particle, `Missing ${className}`).toBeInTheDocument();
      });
    });

    it('13번째 파티클은 없음', () => {
      const { container } = render(<CSSParticles />);
      const particle13 = container.querySelector('.particle-13');
      expect(particle13).not.toBeInTheDocument();
    });

    it('0번째 파티클은 없음', () => {
      const { container } = render(<CSSParticles />);
      const particle0 = container.querySelector('.particle-0');
      expect(particle0).not.toBeInTheDocument();
    });
  });

  describe('DOM 구조', () => {
    it('div 요소로 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.css-particles');
      expect(particlesContainer?.tagName).toBe('DIV');
    });

    it('각 파티클도 div 요소', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.particle');

      particles.forEach((particle) => {
        expect(particle.tagName).toBe('DIV');
      });
    });
  });
});
