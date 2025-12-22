import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeContent } from './HomeContent';

// Mock dependencies
vi.mock('~/components/background', () => ({
  CSSParticles: () => <div data-testid="css-particles">CSSParticles</div>,
}));

vi.mock('~/constants', () => ({
  BRAND: {
    name: 'Sound Blue',
  },
  YouTubeIcon: ({ className }: { className?: string }) => (
    <svg data-testid="youtube-icon" className={className} />
  ),
}));

vi.mock('~/lib/messages', () => ({
  default: {
    'home.tagline': () => 'Indie Artist & Music Producer',
    'home.description': () => 'Creating original music and soundtracks',
    'home.genres': () => 'Original BGM · Soundtracks · Instrumental Music',
    'home.cta': () => 'Watch on YouTube',
    'home.discography': () => 'View Discography',
  },
}));

describe('HomeContent Component', () => {
  describe('렌더링', () => {
    it('HomeContent 컴포넌트가 렌더링됨', () => {
      const { container } = render(<HomeContent />);
      expect(container).toBeInTheDocument();
    });

    it('CSSParticles가 렌더링됨', () => {
      render(<HomeContent />);
      expect(screen.getByTestId('css-particles')).toBeInTheDocument();
    });

    it('브랜드 이름이 h1으로 렌더링됨', () => {
      render(<HomeContent />);
      const heading = screen.getByRole('heading', { level: 1, name: 'Sound Blue' });
      expect(heading.tagName).toBe('H1');
    });

    it('태그라인이 렌더링됨', () => {
      render(<HomeContent />);
      expect(screen.getByText('Indie Artist & Music Producer')).toBeInTheDocument();
    });

    it('설명이 렌더링됨', () => {
      render(<HomeContent />);
      expect(screen.getByText('Creating original music and soundtracks')).toBeInTheDocument();
    });

    it('장르 정보가 렌더링됨', () => {
      render(<HomeContent />);
      expect(
        screen.getByText('Original BGM · Soundtracks · Instrumental Music'),
      ).toBeInTheDocument();
    });
  });

  describe('소셜 링크', () => {
    it('YouTube 링크가 렌더링됨', () => {
      render(<HomeContent />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink).toBeInTheDocument();
      expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/@SoundBlueMusic');
    });

    it('Discography 링크가 렌더링됨', () => {
      render(<HomeContent />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      expect(discographyLink).toBeInTheDocument();
      expect(discographyLink).toHaveAttribute('href', 'https://soundblue.music');
    });

    it('YouTube 링크가 새 탭에서 열림', () => {
      render(<HomeContent />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink).toHaveAttribute('target', '_blank');
      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Discography 링크가 새 탭에서 열림', () => {
      render(<HomeContent />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      expect(discographyLink).toHaveAttribute('target', '_blank');
      expect(discographyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('YouTube 아이콘이 렌더링됨', () => {
      render(<HomeContent />);
      const youtubeIcon = screen.getByTestId('youtube-icon');
      expect(youtubeIcon).toBeInTheDocument();
    });

    it('Discography 아이콘(SVG)이 렌더링됨', () => {
      const { container } = render(<HomeContent />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      const svg = discographyLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('스타일', () => {
    it('컨테이너가 flex 레이아웃', () => {
      const { container } = render(<HomeContent />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('flex');
      expect(mainDiv.className).toContain('flex-col');
      expect(mainDiv.className).toContain('items-center');
      expect(mainDiv.className).toContain('justify-center');
    });

    it('h1에 반응형 폰트 크기', () => {
      render(<HomeContent />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.className).toContain('text-3xl');
      expect(heading.className).toContain('md:text-[3rem]');
    });

    it('태그라인이 이탤릭', () => {
      render(<HomeContent />);
      const tagline = screen.getByText('Indie Artist & Music Producer');
      expect(tagline.className).toContain('italic');
    });

    it('소셜 링크에 적절한 클래스', () => {
      render(<HomeContent />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink?.className).toContain('social-link');
      expect(youtubeLink?.className).toContain('social-youtube');
    });

    it('Discography 링크에 적절한 클래스', () => {
      render(<HomeContent />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      expect(discographyLink?.className).toContain('social-link');
      expect(discographyLink?.className).toContain('social-discography');
    });
  });

  describe('접근성', () => {
    it('YouTube 링크에 aria-label', () => {
      render(<HomeContent />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      expect(youtubeLink).toHaveAttribute('aria-label', 'YouTube - SoundBlueMusic');
    });

    it('Discography 링크에 aria-label', () => {
      render(<HomeContent />);
      const discographyLink = screen.getByText('View Discography').closest('a');
      expect(discographyLink).toHaveAttribute('aria-label', 'Discography - Sound Blue');
    });

    it('외부 링크에 rel="noopener noreferrer"', () => {
      render(<HomeContent />);
      const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
      const discographyLink = screen.getByText('View Discography').closest('a');

      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(discographyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('반응형', () => {
    it('태그라인 반응형 폰트 크기', () => {
      render(<HomeContent />);
      const tagline = screen.getByText('Indie Artist & Music Producer');
      expect(tagline.className).toContain('text-lg');
      expect(tagline.className).toContain('md:text-xl');
    });

    it('설명 반응형 폰트 크기', () => {
      render(<HomeContent />);
      const description = screen.getByText('Creating original music and soundtracks');
      expect(description.className).toContain('text-base');
      expect(description.className).toContain('md:text-lg');
    });

    it('링크 컨테이너가 flex-wrap', () => {
      const { container } = render(<HomeContent />);
      const linkContainer = container.querySelector('.flex.flex-wrap');
      expect(linkContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => render(<HomeContent />)).not.toThrow();
    });

    it('모든 필수 요소가 렌더링됨', () => {
      render(<HomeContent />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Watch on YouTube')).toBeInTheDocument();
      expect(screen.getByText('View Discography')).toBeInTheDocument();
      expect(screen.getByTestId('css-particles')).toBeInTheDocument();
    });
  });
});
