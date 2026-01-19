// Service menu types

export interface ServiceItem {
  id: string;
  name: string;
  label: {
    ko: string;
    en: string;
  };
  url: string;
}

export interface SocialItem {
  id: string;
  name: string;
  url: string;
}

export interface ServiceMenuProps {
  currentApp: string;
  locale: 'ko' | 'en';
}

export interface AppFooterProps {
  /** Current app identifier to highlight */
  currentApp: string;
  /** Current locale */
  locale: 'ko' | 'en';
  /** Optional legal links to display */
  legalLinks?: Array<{
    label: string;
    href: string;
  }>;
  /** Brand name for copyright */
  brandName?: string;
  /** Optional className for additional styling */
  className?: string;
}
