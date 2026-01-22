import { describe, expect, it } from 'vitest';
import { getEmbedUrl, getThumbnailUrl, isYouTubeUrl, parseYouTubeUrl } from './youtube';

describe('youtube.ts', () => {
  describe('parseYouTubeUrl', () => {
    describe('standard watch URLs', () => {
      it('https://www.youtube.com/watch?v=VIDEO_ID 파싱', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('video');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      });

      it('https://youtube.com/watch?v=VIDEO_ID (www 없이) 파싱', () => {
        const result = parseYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      });
    });

    describe('youtu.be short URLs', () => {
      it('https://youtu.be/VIDEO_ID 파싱', () => {
        const result = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('video');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      });
    });

    describe('embed URLs', () => {
      it('https://www.youtube.com/embed/VIDEO_ID 파싱', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('video');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      });

      it('youtube-nocookie.com embed URL 파싱', () => {
        const result = parseYouTubeUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      });
    });

    describe('shorts URLs', () => {
      it('https://www.youtube.com/shorts/VIDEO_ID 파싱', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('short');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      });
    });

    describe('playlist URLs', () => {
      it('https://www.youtube.com/playlist?list=PLAYLIST_ID 파싱', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('playlist');
        expect(result.playlistId).toBe('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
        expect(result.embedUrl).toBe(
          'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
      });

      it('watch URL with playlist 파싱', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('playlist');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.playlistId).toBe('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
        expect(result.embedUrl).toBe(
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
      });

      it('embed videoseries URL 파싱', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('playlist');
        expect(result.playlistId).toBe('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
      });
    });

    describe('invalid URLs', () => {
      it('빈 문자열은 invalid', () => {
        const result = parseYouTubeUrl('');
        expect(result.isValid).toBe(false);
        expect(result.type).toBe('unknown');
        expect(result.embedUrl).toBe('');
      });

      it('공백만 있는 문자열은 invalid', () => {
        const result = parseYouTubeUrl('   ');
        expect(result.isValid).toBe(false);
      });

      it('YouTube가 아닌 URL은 invalid', () => {
        const result = parseYouTubeUrl('https://vimeo.com/12345');
        expect(result.isValid).toBe(false);
      });

      it('잘못된 URL 형식은 invalid', () => {
        const result = parseYouTubeUrl('not-a-url');
        expect(result.isValid).toBe(false);
      });

      it('videoId가 11자가 아닌 경우 invalid', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/watch?v=short');
        expect(result.isValid).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('앞뒤 공백이 있는 URL 처리', () => {
        const result = parseYouTubeUrl('  https://youtu.be/dQw4w9WgXcQ  ');
        expect(result.isValid).toBe(true);
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      });

      it('추가 쿼리 파라미터가 있는 URL 처리', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120&feature=share',
        );
        expect(result.isValid).toBe(true);
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      });

      it('youtu.be URL에서 videoId가 11자 미만인 경우 invalid', () => {
        const result = parseYouTubeUrl('https://youtu.be/short');
        expect(result.isValid).toBe(false);
      });

      it('/watch 경로에서 list만 있고 v가 없는 경우', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/watch?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('playlist');
        expect(result.playlistId).toBe('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
      });

      it('/shorts 경로에서 videoId가 11자 미만인 경우 invalid', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/shorts/abc');
        expect(result.isValid).toBe(false);
      });

      it('/embed 경로에서 videoId가 11자 미만인 경우 invalid', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/embed/short');
        expect(result.isValid).toBe(false);
      });

      it('/embed/videoseries에서 list 파라미터 없는 경우 video로 처리됨 (11자)', () => {
        // 'videoseries'가 정확히 11자이므로 videoId로 처리됨
        const result = parseYouTubeUrl('https://www.youtube.com/embed/videoseries');
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('video');
        expect(result.videoId).toBe('videoseries');
      });

      it('/playlist 경로에서 list 파라미터 없는 경우 invalid', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/playlist');
        expect(result.isValid).toBe(false);
      });

      it('/watch 경로에서 v 파라미터 없는 경우 invalid', () => {
        const result = parseYouTubeUrl('https://www.youtube.com/watch');
        expect(result.isValid).toBe(false);
      });

      it('/embed 경로에 list 파라미터가 있는 경우 playlist', () => {
        const result = parseYouTubeUrl(
          'https://www.youtube.com/embed/dQw4w9WgXcQ?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        );
        expect(result.isValid).toBe(true);
        expect(result.type).toBe('playlist');
      });
    });
  });

  describe('isYouTubeUrl', () => {
    it('유효한 YouTube URL이면 true', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('유효하지 않은 URL이면 false', () => {
      expect(isYouTubeUrl('')).toBe(false);
      expect(isYouTubeUrl('https://vimeo.com/12345')).toBe(false);
    });
  });

  describe('getEmbedUrl', () => {
    it('유효한 URL에서 embed URL 반환', () => {
      expect(getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      );
    });

    it('유효하지 않은 URL이면 빈 문자열 반환', () => {
      expect(getEmbedUrl('')).toBe('');
      expect(getEmbedUrl('invalid')).toBe('');
    });
  });

  describe('getThumbnailUrl', () => {
    it('기본 quality (hqdefault) 썸네일 URL 반환', () => {
      expect(getThumbnailUrl('dQw4w9WgXcQ')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      );
    });

    it('지정된 quality 썸네일 URL 반환', () => {
      expect(getThumbnailUrl('dQw4w9WgXcQ', 'maxresdefault')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      );
      expect(getThumbnailUrl('dQw4w9WgXcQ', 'default')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
      );
    });

    describe('경계값 테스트', () => {
      it('빈 문자열 videoId', () => {
        // 빈 videoId는 잘못된 URL 생성 (유효성 검사 없음)
        expect(getThumbnailUrl('')).toBe('https://img.youtube.com/vi//hqdefault.jpg');
      });

      it('공백만 있는 videoId', () => {
        expect(getThumbnailUrl('   ')).toBe('https://img.youtube.com/vi/   /hqdefault.jpg');
      });

      it('특수문자 포함 videoId', () => {
        expect(getThumbnailUrl('abc-_123XYZ')).toBe(
          'https://img.youtube.com/vi/abc-_123XYZ/hqdefault.jpg',
        );
      });

      it('11자 초과 videoId', () => {
        const longId = 'a'.repeat(20);
        expect(getThumbnailUrl(longId)).toBe(`https://img.youtube.com/vi/${longId}/hqdefault.jpg`);
      });

      it('11자 미만 videoId', () => {
        expect(getThumbnailUrl('abc')).toBe('https://img.youtube.com/vi/abc/hqdefault.jpg');
      });
    });
  });
});
