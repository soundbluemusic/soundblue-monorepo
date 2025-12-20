/**
 * @fileoverview Shared Navigation Configuration for SolidJS
 *
 * Uses `satisfies` operator to ensure type safety while preserving literal types.
 * Labels are referenced via translation keys (t().nav[labelKey])
 */

import type { JSX } from 'solid-js';
import type { ExternalUrl, PageRoute } from '~/lib/routes';
import {
  AboutIcon,
  BlogIcon,
  BuiltWithIcon,
  ChatIcon,
  HomeIcon,
  NewsIcon,
  SitemapIcon,
  SoundRecordingIcon,
  ToolsIcon,
} from './icons';

/** Navigation label keys - must match translation keys */
export type NavLabelKey =
  | 'home'
  | 'about'
  | 'sitemap'
  | 'soundRecording'
  | 'news'
  | 'blog'
  | 'builtWith'
  | 'chat';

/** External link label keys */
export type ExternalLabelKey = 'youtube' | 'discography' | 'tools';

/** Internal navigation item structure */
export interface NavItem {
  /** Route path - must be a valid PageRoute */
  path: PageRoute;
  /** Translation key for the label */
  labelKey: NavLabelKey;
  /** Icon component factory */
  icon: () => JSX.Element;
}

/** External navigation item structure */
export interface ExternalNavItem {
  /** External URL - must start with https:// */
  url: ExternalUrl;
  /** Translation key for the label */
  labelKey: ExternalLabelKey;
  /** Icon component factory */
  icon: () => JSX.Element;
}

/** All navigation items (used by Sidebar) */
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    labelKey: 'home',
    icon: () => <HomeIcon />,
  },
  {
    path: '/about',
    labelKey: 'about',
    icon: () => <AboutIcon />,
  },
  {
    path: '/news',
    labelKey: 'news',
    icon: () => <NewsIcon />,
  },
  {
    path: '/blog',
    labelKey: 'blog',
    icon: () => <BlogIcon />,
  },
  {
    path: '/sound-recording',
    labelKey: 'soundRecording',
    icon: () => <SoundRecordingIcon />,
  },
  {
    path: '/built-with',
    labelKey: 'builtWith',
    icon: () => <BuiltWithIcon />,
  },
  {
    path: '/chat',
    labelKey: 'chat',
    icon: () => <ChatIcon />,
  },
  {
    path: '/sitemap',
    labelKey: 'sitemap',
    icon: () => <SitemapIcon />,
  },
];

/** Label keys for primary navigation (mobile bottom nav, 4 items max) */
const PRIMARY_NAV_KEYS: NavLabelKey[] = ['home', 'about', 'news', 'chat'];

/** Primary navigation items for mobile bottom nav (derived from NAV_ITEMS) */
export const PRIMARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  PRIMARY_NAV_KEYS.includes(item.labelKey),
);

/** Secondary navigation items shown in "More" menu (derived from NAV_ITEMS) */
export const SECONDARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (item) => !PRIMARY_NAV_KEYS.includes(item.labelKey),
);

/** External navigation items - validated with satisfies */
export const EXTERNAL_NAV_ITEMS = [
  {
    url: 'https://tools.soundbluemusic.com',
    labelKey: 'tools',
    icon: () => <ToolsIcon />,
  },
] as const satisfies readonly ExternalNavItem[];

export function isNavActive(
  path: string,
  pathname: string,
  localizedPath: (p: string) => string,
): boolean {
  const localPath = localizedPath(path);
  if (path === '/') {
    return pathname === '/' || pathname === '/ko' || pathname === '/ko/';
  }
  return pathname === localPath || pathname.startsWith(`${localPath}/`);
}
