import { A } from '@solidjs/router';
import { For, type JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';
import { SmallExternalLinkIcon } from '~/constants';

interface InternalLink {
  path: string;
  labelKey:
    | 'home'
    | 'news'
    | 'blog'
    | 'builtWith'
    | 'privacy'
    | 'terms'
    | 'license'
    | 'soundRecording';
}

interface ExternalLink {
  url: string;
  label: string;
}

interface SitemapSection {
  titleKey: 'main' | 'content' | 'about' | 'legal' | 'external' | 'xml';
  external?: boolean;
  links: (InternalLink | ExternalLink)[];
}

const sections: SitemapSection[] = [
  {
    titleKey: 'main',
    links: [{ path: '/', labelKey: 'home' }],
  },
  {
    titleKey: 'content',
    links: [
      { path: '/news', labelKey: 'news' },
      { path: '/blog', labelKey: 'blog' },
    ],
  },
  {
    titleKey: 'about',
    links: [{ path: '/built-with', labelKey: 'builtWith' }],
  },
  {
    titleKey: 'legal',
    links: [
      { path: '/privacy', labelKey: 'privacy' },
      { path: '/terms', labelKey: 'terms' },
      { path: '/license', labelKey: 'license' },
      { path: '/sound-recording', labelKey: 'soundRecording' },
    ],
  },
  {
    titleKey: 'external',
    external: true,
    links: [
      { url: 'https://youtube.com/@SoundBlueMusic', label: 'YouTube' },
      { url: 'https://soundblue.music', label: 'Discography' },
    ],
  },
  {
    titleKey: 'xml',
    external: true,
    links: [{ url: '/sitemap.xml', label: 'sitemap.xml' }],
  },
];

export default function SitemapPage(): JSX.Element {
  const { t, localizedPath } = useLanguage();

  return (
    <>
      <PageSeo page="sitemap" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().sitemap.title}</h1>

          <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <For each={sections}>
              {(section) => (
                <div class="space-y-4">
                  <h2 class="text-xl font-semibold text-content">
                    {t().sitemap.sections[section.titleKey]}
                  </h2>
                  <ul class="space-y-2">
                    <For each={section.links}>
                      {(link) => (
                        <li>
                          {'path' in link ? (
                            <A
                              href={localizedPath(link.path)}
                              class="text-content-muted hover:text-content transition-colors"
                            >
                              {t().sitemap.links[link.labelKey]}
                            </A>
                          ) : (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-content-muted hover:text-content transition-colors inline-flex items-center gap-1"
                            >
                              {link.label}
                              <SmallExternalLinkIcon class="w-3 h-3" />
                            </a>
                          )}
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              )}
            </For>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
