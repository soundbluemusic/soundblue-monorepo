import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { YouTubeEmbed, YouTubeThumbnail } from './YouTubeEmbed';

// Mock youtube.ts
vi.mock('~/lib/youtube', () => ({
  parseYouTubeUrl: (url: string) => {
    // Simple mock implementation
    if (url.includes('dQw4w9WgXcQ')) {
      return {
        isValid: true,
        type: 'video',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      };
    }
    if (url.includes('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf')) {
      return {
        isValid: true,
        type: 'playlist',
        playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        embedUrl:
          'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
      };
    }
    return {
      isValid: false,
      type: 'unknown',
      embedUrl: '',
    };
  },
}));

describe('YouTubeEmbed', () => {
  describe('렌더링', () => {
    it('iframe 렌더링', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />);
      const iframe = screen.getByTitle('Test Video');
      expect(iframe).toBeInTheDocument();
      expect(iframe.tagName).toBe('IFRAME');
    });

    it('올바른 embed URL 설정', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />);
      const iframe = screen.getByTitle('Test Video');
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('title 속성 설정', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="My Video" />);
      expect(screen.getByTitle('My Video')).toBeInTheDocument();
    });
  });

  describe('iframe 속성', () => {
    it('allowFullScreen 속성', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />);
      const iframe = screen.getByTitle('Test');
      expect(iframe).toHaveAttribute('allowfullscreen');
    });

    it('lazy loading 속성', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />);
      const iframe = screen.getByTitle('Test');
      expect(iframe).toHaveAttribute('loading', 'lazy');
    });

    it('referrerPolicy 속성', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />);
      const iframe = screen.getByTitle('Test');
      expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    });

    it('allow 속성에 필수 권한 포함', () => {
      render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />);
      const iframe = screen.getByTitle('Test');
      const allow = iframe.getAttribute('allow');
      expect(allow).toContain('accelerometer');
      expect(allow).toContain('autoplay');
      expect(allow).toContain('clipboard-write');
      expect(allow).toContain('encrypted-media');
      expect(allow).toContain('gyroscope');
      expect(allow).toContain('picture-in-picture');
    });
  });

  describe('스타일링', () => {
    it('컨테이너에 rounded-lg 클래스', () => {
      const { container } = render(
        <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />,
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('rounded-lg');
    });

    it('커스텀 className 적용', () => {
      const { container } = render(
        <YouTubeEmbed
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Test"
          className="custom-class"
        />,
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('커스텀 width 적용', () => {
      const { container } = render(
        <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" width={640} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe('640px');
    });

    it('기본 width는 100%', () => {
      const { container } = render(
        <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe('100%');
    });
  });

  describe('aspect ratio', () => {
    it('기본 16:9 비율', () => {
      const { container } = render(
        <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test" />,
      );
      const wrapper = container.firstChild as HTMLElement;
      // 16:9 = 56.25%
      expect(wrapper.style.paddingBottom).toBe('56.25%');
    });

    it('커스텀 aspect ratio', () => {
      const { container } = render(
        <YouTubeEmbed
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Test"
          aspectRatio={4 / 3}
        />,
      );
      const wrapper = container.firstChild as HTMLElement;
      // 4:3 = 75%
      expect(wrapper.style.paddingBottom).toBe('75%');
    });
  });

  describe('invalid URL fallback', () => {
    it('invalid URL은 직접 video ID로 embed', () => {
      render(<YouTubeEmbed url="directVideoId123" title="Test" />);
      const iframe = screen.getByTitle('Test');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube-nocookie.com/embed/directVideoId123',
      );
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() =>
        render(
          <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
        ),
      ).not.toThrow();
    });
  });
});

describe('YouTubeThumbnail', () => {
  describe('렌더링', () => {
    it('button 요소 렌더링', () => {
      render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('썸네일 이미지 렌더링', () => {
      render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
      );
      const img = screen.getByAltText('Test Video');
      expect(img).toBeInTheDocument();
    });

    it('올바른 썸네일 URL (기본 hqdefault)', () => {
      render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
      );
      const img = screen.getByAltText('Test Video');
      expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('커스텀 quality 썸네일', () => {
      render(
        <YouTubeThumbnail
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Test Video"
          quality="maxresdefault"
        />,
      );
      const img = screen.getByAltText('Test Video');
      expect(img).toHaveAttribute(
        'src',
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      );
    });
  });

  describe('접근성', () => {
    it('aria-label 설정', () => {
      render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="My Video" />,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Play My Video');
    });

    it('이미지에 alt 텍스트', () => {
      render(
        <YouTubeThumbnail
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Accessible Video"
        />,
      );
      expect(screen.getByAltText('Accessible Video')).toBeInTheDocument();
    });

    it('이미지는 lazy loading', () => {
      render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
      );
      const img = screen.getByAltText('Test Video');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('클릭 동작', () => {
    it('onClick 핸들러 호출', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <YouTubeThumbnail
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Test Video"
          onClick={handleClick}
        />,
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('onClick 없이도 렌더링 가능', () => {
      expect(() =>
        render(
          <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
        ),
      ).not.toThrow();
    });
  });

  describe('스타일링', () => {
    it('커스텀 className 적용', () => {
      render(
        <YouTubeThumbnail
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Test Video"
          className="custom-style"
        />,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-style');
    });

    it('재생 버튼 오버레이 존재', () => {
      const { container } = render(
        <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
      );
      // 재생 버튼 SVG 확인
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() =>
        render(
          <YouTubeThumbnail url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Test Video" />,
        ),
      ).not.toThrow();
    });

    it('invalid URL일 때 URL을 videoId로 사용', () => {
      render(<YouTubeThumbnail url="invalidVideoId" title="Test" />);
      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', 'https://img.youtube.com/vi/invalidVideoId/hqdefault.jpg');
    });
  });
});
