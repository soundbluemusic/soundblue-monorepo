import { useParaglideI18n } from '@soundblue/i18n';
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

// 빌드 타임에 연도 고정 - Hydration 불일치 방지
const BUILD_YEAR = 2025;

export function Footer() {
  const { localizedPath } = useParaglideI18n();

  return (
    <footer className="flex flex-col items-center justify-center py-8 px-4 mt-auto border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] relative z-10">
      <nav
        className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-center mb-4"
        aria-label="Footer navigation"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.path}
            to={localizedPath(link.path)}
            className="inline-flex items-center justify-center text-[var(--color-text-secondary)] no-underline text-sm py-2 px-3 rounded-xl cursor-pointer transition-all duration-150 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
          >
            {m[`footer_${link.labelKey}`]?.()}
          </Link>
        ))}
      </nav>
      <p className="text-[var(--color-text-secondary)] text-[0.8125rem] text-center mb-2">
        {m['footer.tagline']()}{' '}
        <Link
          to={localizedPath('/built-with')}
          className="text-[var(--color-accent-primary)] underline underline-offset-2 decoration-[var(--color-accent-light)] rounded transition-colors duration-150 hover:text-[var(--color-accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
        >
          {m['footer.builtWith']()}
        </Link>
      </p>
      <p className="text-[var(--color-text-tertiary)] text-xs text-center">
        &copy; {BUILD_YEAR} {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
}
