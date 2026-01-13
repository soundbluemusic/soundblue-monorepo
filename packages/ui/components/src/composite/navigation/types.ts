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
