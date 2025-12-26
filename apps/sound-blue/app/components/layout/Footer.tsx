import { useParaglideI18n } from '@soundblue/shared-react';
import { Link } from 'react-router';
import { BRAND } from '~/constants';
import m from '~/lib/messages';

interface FooterLink {
  path: string;
  labelKey: 'privacy' | 'terms' | 'license' | 'sitemap';
}

const FOOTER_LINKS: FooterLink[] = [
  { path: '/privacy', labelKey: 'privacy' },
  { path: '/terms', labelKey: 'terms' },
  { path: '/license', labelKey: 'license' },
  { path: '/sitemap', labelKey: 'sitemap' },
];

export function Footer() {
  const { localizedPath } = useParaglideI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col items-center justify-center py-8 px-4 mt-auto border-t border-(--color-border-primary) bg-(--color-bg-secondary) relative z-10">
      <nav
        className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-center mb-4"
        aria-label="Footer navigation"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.path}
            to={localizedPath(link.path)}
            className="inline-flex items-center justify-center text-(--color-text-secondary) no-underline text-sm py-2 px-3 rounded-xl cursor-pointer transition-all duration-150 hover:text-(--color-text-primary) hover:bg-(--color-interactive-hover) active:scale-95 focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2"
          >
            {m[`footer_${link.labelKey}`]?.()}
          </Link>
        ))}
      </nav>
      <p className="text-(--color-text-secondary) text-[0.8125rem] text-center mb-2">
        {m['footer.tagline']()}{' '}
        <Link
          to={localizedPath('/built-with')}
          className="text-(--color-accent-primary) underline underline-offset-2 decoration-(--color-accent-light) rounded transition-colors duration-150 hover:text-(--color-accent-hover) focus-visible:outline-2 focus-visible:outline-(--color-border-focus) focus-visible:outline-offset-2"
        >
          {m['footer.builtWith']()}
        </Link>
      </p>
      <p className="text-(--color-text-tertiary) text-xs text-center">
        &copy; {currentYear} {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
}
