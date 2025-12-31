/**
 * YouTube Video Embed Component
 *
 * WordPress-style auto-embed: just paste a YouTube URL and it works.
 *
 * SSG-compatible YouTube iframe embed with:
 * - URL auto-parsing (paste any YouTube URL)
 * - Lazy loading for performance
 * - Responsive sizing
 * - Privacy-enhanced mode (youtube-nocookie.com)
 * - Accessibility support
 */

import { parseYouTubeUrl } from '~/lib/youtube';

interface YouTubeEmbedProps {
  /** YouTube URL (any format) or video ID */
  url: string;
  /** Accessible title for the iframe */
  title: string;
  /** Optional width (default: 100%) */
  width?: number | string;
  /** Optional aspect ratio (default: 16/9) */
  aspectRatio?: number;
  /** Additional CSS classes */
  className?: string;
}

export function YouTubeEmbed({
  url,
  title,
  width = '100%',
  aspectRatio = 16 / 9,
  className = '',
}: YouTubeEmbedProps) {
  // WordPress-style: auto-parse URL to get embed URL
  const parsed = parseYouTubeUrl(url);

  // If parsing fails, assume it's a direct video ID (backward compatibility)
  const embedUrl = parsed.isValid
    ? parsed.embedUrl
    : `https://www.youtube-nocookie.com/embed/${url}`;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
      style={{
        width,
        paddingBottom: `${(1 / aspectRatio) * 100}%`,
      }}
    >
      <iframe
        className="absolute inset-0 size-full"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * YouTube Thumbnail Component
 *
 * Shows a clickable thumbnail that can be used for
 * click-to-play patterns or video grids.
 */
interface YouTubeThumbnailProps {
  /** YouTube URL (any format) or video ID */
  url: string;
  title: string;
  onClick?: () => void;
  className?: string;
  /** Thumbnail quality: default, mqdefault, hqdefault, sddefault, maxresdefault */
  quality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
}

export function YouTubeThumbnail({
  url,
  title,
  onClick,
  className = '',
  quality = 'hqdefault',
}: YouTubeThumbnailProps) {
  // Parse URL to extract videoId for thumbnail
  const parsed = parseYouTubeUrl(url);
  const videoId = parsed.videoId || url; // Fallback to url as videoId
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border-none bg-black p-0 ${className}`}
      aria-label={`Play ${title}`}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/40">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-600 transition-transform duration-300 group-hover:scale-110">
          <svg className="ml-1 size-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
