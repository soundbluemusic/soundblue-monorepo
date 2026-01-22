/**
 * Music Catalog - Video data for the Music page
 *
 * WordPress-style: just paste YouTube URLs directly!
 * No need to manually extract video IDs anymore.
 *
 * Supported URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 */

export interface MusicVideo {
  /** YouTube URL (any format - auto-parsed) */
  url: string;
  /** Localized title */
  title: {
    en: string;
    ko: string;
  };
  /** Release date (YYYY-MM format) */
  releaseDate?: string;
  /** Optional description */
  description?: {
    en: string;
    ko: string;
  };
}

export interface MusicCategory {
  id: string;
  name: {
    en: string;
    ko: string;
  };
  videos: MusicVideo[];
}

/**
 * Featured video shown at the top of the Music page
 * This should be your latest or most important release
 */
export const FEATURED_VIDEO: MusicVideo = {
  // Just paste the YouTube URL - it auto-converts!
  url: 'https://www.youtube.com/watch?v=M857WRLnoz0&list=PL5c-ZRIJtHrPDZ7BKlhEi04iXCav1-nkj',
  title: {
    en: 'Sound Blue Music Collection',
    ko: 'Sound Blue 음악 컬렉션',
  },
  releaseDate: '2024-12',
  description: {
    en: 'Full playlist',
    ko: '전체 플레이리스트',
  },
};

/**
 * Music categories with videos
 * Just paste YouTube URLs - they auto-convert!
 *
 * Example:
 * {
 *   url: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
 *   title: { en: 'Track Name', ko: '트랙 이름' },
 *   releaseDate: '2024-01',
 * }
 */
export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: 'originals',
    name: {
      en: 'Original Music',
      ko: '오리지널 음악',
    },
    videos: [
      // Add your original music videos here
    ],
  },
  {
    id: 'bgm',
    name: {
      en: 'BGM & Soundtracks',
      ko: 'BGM & 사운드트랙',
    },
    videos: [
      // Add your BGM/soundtrack videos here
    ],
  },
  {
    id: 'ambient',
    name: {
      en: 'Ambient & Instrumental',
      ko: '앰비언트 & 인스트루멘탈',
    },
    videos: [
      // Add your ambient/instrumental videos here
    ],
  },
];

/**
 * Get all videos from all categories (flattened)
 */
export function getAllVideos(): MusicVideo[] {
  return MUSIC_CATEGORIES.flatMap((cat) => cat.videos);
}

/**
 * Get total video count
 */
export function getTotalVideoCount(): number {
  return MUSIC_CATEGORIES.reduce((sum, cat) => sum + cat.videos.length, 0);
}
