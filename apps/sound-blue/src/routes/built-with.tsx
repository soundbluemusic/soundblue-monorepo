import { For, type JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';
import { SmallExternalLinkIcon } from '~/constants';

interface Technology {
  name: string;
  url: string;
}

interface TechSection {
  titleKey:
    | 'frameworks'
    | 'deployment'
    | 'devTools'
    | 'ai'
    | 'uiux'
    | 'browserApi'
    | 'chatFeatures'
    | 'upcoming';
  items: Technology[];
}

const TECH_SECTIONS: TechSection[] = [
  {
    titleKey: 'frameworks',
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
    titleKey: 'ai',
    items: [{ name: 'Claude (Anthropic)', url: 'https://www.anthropic.com/' }],
  },
  {
    titleKey: 'uiux',
    items: [
      { name: 'Web Standards', url: 'https://www.w3.org/' },
      {
        name: 'Responsive Design',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
      },
    ],
  },
  {
    titleKey: 'browserApi',
    items: [
      {
        name: 'Web Audio API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      },
      { name: 'Canvas API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API' },
      {
        name: 'localStorage',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
      },
    ],
  },
  {
    titleKey: 'chatFeatures',
    items: [
      {
        name: 'Keyword-based NLP',
        url: 'https://en.wikipedia.org/wiki/Natural_language_processing',
      },
      { name: 'Bilingual Detection (EN/KO)', url: '/chat/' },
      { name: 'Topic Detection', url: '/chat/' },
    ],
  },
  {
    titleKey: 'upcoming',
    items: [
      { name: 'WebGPU', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API' },
      { name: 'Rust + WebAssembly', url: 'https://www.rust-lang.org/what/wasm' },
      {
        name: 'AudioWorklet',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet',
      },
      {
        name: 'Web MIDI API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API',
      },
      { name: 'TensorFlow.js', url: 'https://www.tensorflow.org/js' },
      { name: 'IndexedDB', url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API' },
    ],
  },
];

export default function BuiltWithPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="builtWith" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().builtWith.title}</h1>

          <div class="grid gap-8 md:grid-cols-2">
            <For each={TECH_SECTIONS}>
              {(section) => (
                <div class="space-y-4">
                  <h2 class="text-xl font-semibold text-content">
                    {t().builtWith.sections[section.titleKey]}
                  </h2>
                  <ul class="space-y-2">
                    <For each={section.items}>
                      {(tech) => (
                        <li>
                          <a
                            href={tech.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-content-muted hover:text-accent transition-colors inline-flex items-center gap-1"
                          >
                            {tech.name}
                            <SmallExternalLinkIcon class="w-3 h-3" />
                          </a>
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
