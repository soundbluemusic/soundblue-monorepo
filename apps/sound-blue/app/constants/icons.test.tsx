import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AboutIcon,
  BlogIcon,
  BuiltWithIcon,
  ChatIcon,
  ExternalLinkIcon,
  HelpIcon,
  HomeIcon,
  NewsIcon,
  SitemapIcon,
  SmallExternalLinkIcon,
  SoundRecordingIcon,
  ToolsIcon,
  YouTubeIcon,
} from './icons';

describe('Icon Components', () => {
  describe('렌더링', () => {
    it('HomeIcon이 렌더링됨', () => {
      const { container } = render(<HomeIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('SitemapIcon이 렌더링됨', () => {
      const { container } = render(<SitemapIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('ExternalLinkIcon이 렌더링됨', () => {
      const { container } = render(<ExternalLinkIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('NewsIcon이 렌더링됨', () => {
      const { container } = render(<NewsIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('BlogIcon이 렌더링됨', () => {
      const { container } = render(<BlogIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('SoundRecordingIcon이 렌더링됨', () => {
      const { container } = render(<SoundRecordingIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('BuiltWithIcon이 렌더링됨', () => {
      const { container } = render(<BuiltWithIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('AboutIcon이 렌더링됨', () => {
      const { container } = render(<AboutIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('ChatIcon이 렌더링됨', () => {
      const { container } = render(<ChatIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('ToolsIcon이 렌더링됨', () => {
      const { container } = render(<ToolsIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('HelpIcon이 렌더링됨', () => {
      const { container } = render(<HelpIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('YouTubeIcon이 렌더링됨', () => {
      const { container } = render(<YouTubeIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('SmallExternalLinkIcon이 렌더링됨', () => {
      const { container } = render(<SmallExternalLinkIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('className 프로퍼티', () => {
    it('HomeIcon에 className 적용', () => {
      const { container } = render(<HomeIcon className="test-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('test-class');
    });

    it('AboutIcon에 className 적용', () => {
      const { container } = render(<AboutIcon className="custom-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
    });

    it('className 없이도 렌더링', () => {
      const { container } = render(<ChatIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('모든 아이콘이 aria-hidden="true"', () => {
      const icons = [
        HomeIcon,
        SitemapIcon,
        ExternalLinkIcon,
        NewsIcon,
        BlogIcon,
        SoundRecordingIcon,
        BuiltWithIcon,
        AboutIcon,
        ChatIcon,
        ToolsIcon,
        HelpIcon,
        SmallExternalLinkIcon,
      ];

      icons.forEach((Icon) => {
        const { container } = render(<Icon />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('YouTubeIcon도 aria-hidden="true"', () => {
      const { container } = render(<YouTubeIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('SVG 속성', () => {
    it('대부분 아이콘이 stroke 기반', () => {
      const { container } = render(<HomeIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('YouTubeIcon은 fill 기반', () => {
      const { container } = render(<YouTubeIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg).not.toHaveAttribute('stroke');
    });

    it('stroke 기반 아이콘이 stroke-width 속성 가짐', () => {
      const { container } = render(<NewsIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '2');
    });
  });

  describe('Edge Cases', () => {
    it('모든 아이콘이 에러 없이 렌더링', () => {
      const icons = [
        HomeIcon,
        SitemapIcon,
        ExternalLinkIcon,
        NewsIcon,
        BlogIcon,
        SoundRecordingIcon,
        BuiltWithIcon,
        AboutIcon,
        ChatIcon,
        ToolsIcon,
        HelpIcon,
        YouTubeIcon,
        SmallExternalLinkIcon,
      ];

      icons.forEach((Icon) => {
        expect(() => render(<Icon />)).not.toThrow();
      });
    });
  });
});
