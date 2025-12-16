import { Link, Meta, Title } from '@solidjs/meta';
import { ExternalLink } from 'lucide-solid';
import { type Component, For } from 'solid-js';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/i18n';

const SITE_URL = 'https://tools.soundbluemusic.com';

// ========================================
// Built With Page - 기술 스택
// ========================================

interface TechItem {
  nameKey?: string; // Translation key for name (optional)
  name?: string; // Static name (optional)
  url: string;
}

interface TechSection {
  titleKey: string; // Translation key for title
  items: TechItem[];
}

const TECH_STACK: TechSection[] = [
  {
    titleKey: 'framework',
    items: [
      { name: 'SolidJS', url: 'https://www.solidjs.com/' },
      { name: 'SolidStart', url: 'https://start.solidjs.com/' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
    ],
  },
  {
    titleKey: 'deployment',
    items: [{ name: 'Cloudflare Pages', url: 'https://pages.cloudflare.com/' }],
  },
  {
    titleKey: 'devTools',
    items: [
      { name: 'pnpm', url: 'https://pnpm.io/' },
      { name: 'Vite', url: 'https://vite.dev/' },
      { name: 'Biome', url: 'https://biomejs.dev/' },
    ],
  },
  {
    titleKey: 'aiAssistant',
    items: [{ name: 'Claude (Anthropic)', url: 'https://www.anthropic.com/' }],
  },
  {
    titleKey: 'uiux',
    items: [
      { nameKey: 'webStandardsLayout', url: 'https://web.dev/' },
      { nameKey: 'darkLightMode', url: 'https://web.dev/articles/prefers-color-scheme' },
      { nameKey: 'responsiveDesign', url: 'https://web.dev/articles/responsive-web-design-basics' },
    ],
  },
  {
    titleKey: 'browserApi',
    items: [
      {
        name: 'Web Audio API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      },
      {
        name: 'AudioWorklet',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet',
      },
      { name: 'Canvas API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API' },
      {
        name: 'localStorage',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
      },
      { name: 'IndexedDB (Dexie)', url: 'https://dexie.org/' },
      { name: 'WebMIDI API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API' },
    ],
  },
  {
    titleKey: 'audioEngine',
    items: [{ name: 'Rust + WebAssembly', url: 'https://www.rust-lang.org/what/wasm' }],
  },
  {
    titleKey: 'comingSoon',
    items: [
      { name: 'Pixi.js / WebGL', url: 'https://pixijs.com/' },
      { name: 'TensorFlow.js', url: 'https://www.tensorflow.org/js' },
    ],
  },
];

const TechLink: Component<{
  item: TechItem;
  builtWith: Record<string, string>;
}> = (props) => {
  const getItemName = () => {
    if (props.item.nameKey) {
      return props.builtWith[props.item.nameKey] ?? props.item.nameKey;
    }
    return props.item.name ?? '';
  };

  return (
    <a
      href={props.item.url}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors group"
    >
      <span class="group-hover:underline">{getItemName()}</span>
      <ExternalLink class="h-3 w-3 opacity-50 group-hover:opacity-100" />
    </a>
  );
};

export default function BuiltWithPage() {
  const { t, locale } = useLanguage();

  const getSectionTitle = (titleKey: string) => {
    const builtWith = t().builtWith as Record<string, string>;
    return builtWith[titleKey] ?? titleKey;
  };

  const isKorean = () => locale() === 'ko';
  const currentUrl = () => (isKorean() ? `${SITE_URL}/ko/built-with` : `${SITE_URL}/built-with`);

  return (
    <>
      <Title>{t().navigation.builtWith} - Tools</Title>
      <Meta name="description" content={t().builtWith.intro} />
      <Link rel="canonical" href={currentUrl()} />
      {/* Alternate Languages */}
      <Link rel="alternate" hreflang="en" href={`${SITE_URL}/built-with`} />
      <Link rel="alternate" hreflang="ko" href={`${SITE_URL}/ko/built-with`} />
      <Link rel="alternate" hreflang="x-default" href={`${SITE_URL}/built-with`} />
      {/* Open Graph */}
      <Meta property="og:title" content={`${t().navigation.builtWith} - Tools`} />
      <Meta property="og:description" content={t().builtWith.intro} />
      <Meta property="og:url" content={currentUrl()} />
      <div class="flex h-screen flex-col bg-background">
        {/* Shared Header */}
        <Header />

        {/* Content */}
        <main class="flex-1 overflow-auto px-4 py-8">
          <div class="mx-auto max-w-2xl">
            <p class="text-muted-foreground mb-8">{t().builtWith.intro}</p>

            <div class="space-y-8">
              <For each={TECH_STACK}>
                {(section) => (
                  <section>
                    <h2 class="text-lg font-semibold mb-3 text-foreground">
                      {getSectionTitle(section.titleKey)}
                    </h2>
                    <ul class="space-y-2 pl-4">
                      <For each={section.items}>
                        {(item) => (
                          <li class="text-muted-foreground">
                            <TechLink
                              item={item}
                              builtWith={t().builtWith as Record<string, string>}
                            />
                          </li>
                        )}
                      </For>
                    </ul>
                  </section>
                )}
              </For>
            </div>

            {/* Footer note */}
            <div class="mt-12 pt-8 border-t text-center">
              <p class="text-sm text-muted-foreground">
                Made with ❤️ by{' '}
                <a
                  href="https://soundbluemusic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  SoundBlueMusic
                </a>
              </p>
            </div>
          </div>
        </main>

        {/* Shared Footer */}
        <Footer />
      </div>
    </>
  );
}
