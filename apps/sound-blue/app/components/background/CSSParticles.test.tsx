import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CSSParticles } from './CSSParticles';

describe('CSSParticles', () => {
  describe('렌더링', () => {
    it('컨테이너 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.absolute.inset-0');
      expect(particlesContainer).toBeInTheDocument();
    });

    it('12개의 파티클 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(12);
    });

    it('각 파티클에 animate-float 클래스', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.animate-float');
      expect(particles.length).toBe(12);
    });
  });

  describe('접근성', () => {
    it('aria-hidden="true" 설정 (스크린 리더에서 숨김)', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('[aria-hidden="true"]');
      expect(particlesContainer).toBeInTheDocument();
    });
  });

  describe('구조', () => {
    it('모든 파티클이 rounded-full 클래스 포함', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.rounded-full');

      particles.forEach((particle) => {
        expect(particle.classList.contains('rounded-full')).toBe(true);
      });
    });

    it('컨테이너가 모든 파티클 포함', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.absolute.inset-0') as HTMLElement;
      const particles = container.querySelectorAll('.rounded-full');

      particles.forEach((particle) => {
        expect(particlesContainer).toContainElement(particle as HTMLElement);
      });
    });
  });

  describe('Edge Cases', () => {
    it('여러 번 렌더링해도 동일한 구조', () => {
      const { container: container1 } = render(<CSSParticles />);
      const { container: container2 } = render(<CSSParticles />);

      const particles1 = container1.querySelectorAll('.rounded-full');
      const particles2 = container2.querySelectorAll('.rounded-full');

      expect(particles1.length).toBe(particles2.length);
      expect(particles1.length).toBe(12);
    });

    it('unmount 후 다시 mount', () => {
      const { container, unmount } = render(<CSSParticles />);
      expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();

      unmount();
      expect(container.querySelector('.absolute.inset-0')).not.toBeInTheDocument();

      const { container: newContainer } = render(<CSSParticles />);
      expect(newContainer.querySelector('.absolute.inset-0')).toBeInTheDocument();
    });
  });

  describe('CSS 클래스 검증', () => {
    it('파티클에 올바른 스타일 클래스', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.rounded-full');

      particles.forEach((particle) => {
        expect(particle.classList.contains('absolute')).toBe(true);
        expect(particle.classList.contains('opacity-30')).toBe(true);
      });
    });

    it('정확히 12개의 파티클', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(12);
    });
  });

  describe('DOM 구조', () => {
    it('div 요소로 렌더링', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.absolute.inset-0');
      expect(particlesContainer?.tagName).toBe('DIV');
    });

    it('각 파티클도 div 요소', () => {
      const { container } = render(<CSSParticles />);
      const particles = container.querySelectorAll('.rounded-full');

      particles.forEach((particle) => {
        expect(particle.tagName).toBe('DIV');
      });
    });
  });

  describe('pointer-events', () => {
    it('컨테이너가 pointer-events-none', () => {
      const { container } = render(<CSSParticles />);
      const particlesContainer = container.querySelector('.pointer-events-none');
      expect(particlesContainer).toBeInTheDocument();
    });
  });
});
