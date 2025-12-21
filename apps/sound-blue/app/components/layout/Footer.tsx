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
    <footer className="flex flex-col items-center justify-center py-8 px-4 mt-auto border-t border-line bg-surface-alt relative z-10">
      <nav
        className="flex flex-wrap gap-1 justify-center items-center mb-4"
        aria-label="Footer navigation"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.path}
            to={localizedPath(link.path)}
            className="inline-flex items-center justify-center text-content-muted no-underline text-sm py-2 px-3 rounded-lg cursor-pointer transition-all duration-150 hover:text-content hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
          >
            {m[`footer_${link.labelKey}`]?.()}
          </Link>
        ))}
      </nav>
      <p className="text-content-muted text-[13px] text-center mb-2">
        {m['footer.tagline']()}{' '}
        <Link
          to={localizedPath('/built-with')}
          className="text-accent underline decoration-accent/50 underline-offset-2 transition-colors duration-150 hover:text-accent-hover hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
        >
          {m['footer.builtWith']()}
        </Link>
      </p>
      <p className="text-content-subtle text-xs text-center">
        &copy; {currentYear} {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
}
