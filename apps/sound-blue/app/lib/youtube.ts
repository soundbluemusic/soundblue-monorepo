/**
 * YouTube URL Parser & Embed Utilities
 *
 * WordPress-style auto-embed: just paste a YouTube URL and it works.
 * Supports videos, playlists, shorts, and youtu.be links.
 */

export type YouTubeUrlType = 'video' | 'playlist' | 'short' | 'unknown';

export interface ParsedYouTubeUrl {
  type: YouTubeUrlType;
  videoId?: string;
  playlistId?: string;
  embedUrl: string;
  isValid: boolean;
}

/**
 * Parse any YouTube URL and extract video/playlist IDs
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 */
export function parseYouTubeUrl(url: string): ParsedYouTubeUrl {
  const trimmed = url.trim();

  // Default invalid result
  const invalid: ParsedYouTubeUrl = {
    type: 'unknown',
    embedUrl: '',
    isValid: false,
  };

  if (!trimmed) return invalid;

  try {
    // Handle youtu.be short URLs
    if (trimmed.includes('youtu.be/')) {
      const match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return {
          type: 'video',
          videoId: match[1],
          embedUrl: `https://www.youtube-nocookie.com/embed/${match[1]}`,
          isValid: true,
        };
      }
    }

    // Parse as URL
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.replace('www.', '');

    if (!['youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      return invalid;
    }

    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Shorts: /shorts/VIDEO_ID
    if (pathname.startsWith('/shorts/')) {
      const videoId = pathname.split('/shorts/')[1]?.split(/[?&]/)[0];
      if (videoId && videoId.length === 11) {
        return {
          type: 'short',
          videoId,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          isValid: true,
        };
      }
    }

    // Embed: /embed/VIDEO_ID or /embed/videoseries
    if (pathname.startsWith('/embed/')) {
      const segment = pathname.split('/embed/')[1]?.split(/[?&]/)[0];

      // Playlist embed
      if (segment === 'videoseries' || searchParams.has('list')) {
        const playlistId = searchParams.get('list');
        if (playlistId) {
          return {
            type: 'playlist',
            playlistId,
            embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`,
            isValid: true,
          };
        }
      }

      // Video embed
      if (segment && segment.length === 11) {
        return {
          type: 'video',
          videoId: segment,
          embedUrl: `https://www.youtube-nocookie.com/embed/${segment}`,
          isValid: true,
        };
      }
    }

    // Playlist page: /playlist?list=PLAYLIST_ID
    if (pathname === '/playlist') {
      const playlistId = searchParams.get('list');
      if (playlistId) {
        return {
          type: 'playlist',
          playlistId,
          embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`,
          isValid: true,
        };
      }
    }

    // Watch page: /watch?v=VIDEO_ID (optionally with playlist)
    if (pathname === '/watch') {
      const videoId = searchParams.get('v');
      const playlistId = searchParams.get('list');

      // If has playlist, prefer playlist embed
      if (playlistId) {
        return {
          type: 'playlist',
          playlistId,
          videoId: videoId || undefined,
          embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`,
          isValid: true,
        };
      }

      // Single video
      if (videoId && videoId.length === 11) {
        return {
          type: 'video',
          videoId,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          isValid: true,
        };
      }
    }

    return invalid;
  } catch {
    return invalid;
  }
}

/**
 * Check if a string is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url).isValid;
}

/**
 * Get embed URL from any YouTube URL
 * Returns empty string if invalid
 */
export function getEmbedUrl(url: string): string {
  return parseYouTubeUrl(url).embedUrl;
}

/**
 * Get thumbnail URL for a video
 */
export function getThumbnailUrl(
  videoId: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault',
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
