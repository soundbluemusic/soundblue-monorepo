/**
 * Brand Configuration
 *
 * 🔧 포크 시 이 파일을 수정하세요!
 * 🔧 Modify this file when forking!
 */

export const BRAND = {
  name: 'Sound Blue',
  subtitle: 'SoundBlueMusic',
  tagline: 'SoundBlueMusic',
  copyrightHolder: 'SoundBlueMusic',
  siteUrl: 'https://soundbluemusic.com',
  githubUrl: 'https://github.com/soundbluemusic/sound-blue',
  description: {
    ko: 'SoundBlueMusic 공식 홈페이지',
    en: 'SoundBlueMusic Official Homepage',
  },
  shareTitle: {
    ko: 'Sound Blue | SoundBlueMusic',
    en: 'Sound Blue | SoundBlueMusic',
  },
} as const;

export type Brand = typeof BRAND;
