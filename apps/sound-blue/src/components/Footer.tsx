import { A } from '@solidjs/router';
import { For, type JSX } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { BRAND } from '~/constants';

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

export function Footer(): JSX.Element {
  const { t, localizedPath } = useLanguage();
  const currentYear: number = new Date().getFullYear();

  return (
    <footer class="flex flex-col items-center justify-center py-8 px-4 mt-auto border-t border-line bg-surface-alt relative z-10">
      <nav
        class="flex flex-wrap gap-1 justify-center items-center mb-4"
        aria-label="Footer navigation"
      >
        <For each={FOOTER_LINKS}>
          {(link) => (
            <A
              href={localizedPath(link.path)}
              class="inline-flex items-center justify-center text-content-muted no-underline text-sm py-2 px-3 rounded-lg cursor-pointer transition-all duration-150 hover:text-content hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95"
            >
              {t().footer[link.labelKey]}
            </A>
          )}
        </For>
      </nav>
      <p class="text-content-muted text-[13px] text-center mb-2">
        {t().footer.tagline}{' '}
        <A
          href={localizedPath('/built-with')}
          class="text-accent underline decoration-accent/50 underline-offset-2 transition-colors duration-150 hover:text-accent-hover hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
        >
          {t().footer.builtWith}
        </A>
      </p>
      <p class="text-content-subtle text-xs text-center">
        © {currentYear} {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
}
