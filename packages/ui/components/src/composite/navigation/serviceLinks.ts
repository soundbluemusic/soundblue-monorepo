import type { ServiceItem, SocialItem } from './types';

export const SERVICE_LINKS: ServiceItem[] = [
  {
    id: 'sound-blue',
    name: 'Sound Blue',
    label: { ko: '사운드블루', en: 'Sound Blue' },
    url: 'https://soundbluemusic.com',
  },
  {
    id: 'tools',
    name: 'Tools',
    label: { ko: '도구', en: 'Tools' },
    url: 'https://tools.soundbluemusic.com',
  },
  {
    id: 'dialogue',
    name: 'Dialogue',
    label: { ko: '다이얼로그', en: 'Dialogue' },
    url: 'https://dialogue.soundbluemusic.com',
  },
  {
    id: 'context',
    name: 'Context',
    label: { ko: '컨텍스트', en: 'Context' },
    url: 'https://context.soundbluemusic.com',
  },
  {
    id: 'roots',
    name: 'Roots',
    label: { ko: '루츠', en: 'Roots' },
    url: 'https://roots.soundbluemusic.com',
  },
  {
    id: 'permissive',
    name: 'Permissive',
    label: { ko: '퍼미시브', en: 'Permissive' },
    url: 'https://permissive.soundbluemusic.com',
  },
];

export const SOCIAL_LINKS: SocialItem[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@SoundBlueMusic',
  },
  {
    id: 'x',
    name: 'X',
    url: 'https://x.com/SoundBlueMusic',
  },
  {
    id: 'threads',
    name: 'Threads',
    url: 'https://threads.net/@SoundBlueMusic',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/SoundBlueMusic',
  },
];

export const SERVICE_MENU_LABELS = {
  ko: {
    services: '서비스',
    social: '소셜',
    ariaLabel: '서비스 메뉴 열기',
  },
  en: {
    services: 'Services',
    social: 'Social',
    ariaLabel: 'Open services menu',
  },
};
