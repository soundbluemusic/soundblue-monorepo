import { useParaglideI18n } from '@soundblue/i18n';
import { AppFooter } from '@soundblue/ui-components/composite';
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
  const { localizedPath, locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  // Build legal links with localized paths and labels
  const legalLinks = FOOTER_LINKS.map((link) => ({
    label: m[`footer_${link.labelKey}`]?.() ?? link.labelKey,
    href: localizedPath(link.path),
  }));

  return (
    <div className="mt-auto relative z-10">
      {/* Tagline section */}
      <div className="text-center py-4 px-4 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
        <p className="text-[var(--color-text-secondary)] text-[0.8125rem]">
          {m['footer.tagline']()}{' '}
          <Link
            to={localizedPath('/built-with')}
            className="text-[var(--color-accent-primary)] underline underline-offset-2 decoration-[var(--color-accent-light)] rounded transition-colors duration-150 hover:text-[var(--color-accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
          >
            {m['footer.builtWith']()}
          </Link>
        </p>
      </div>

      {/* AppFooter with services and social links */}
      <AppFooter
        currentApp="sound-blue"
        locale={currentLocale}
        legalLinks={legalLinks}
        brandName={BRAND.copyrightHolder}
      />
    </div>
  );
}
