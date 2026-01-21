import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Open Source Licenses | Sound Blue' },
  { name: 'description', content: 'Open source libraries used to build Sound Blue website.' },
  ...getSeoMeta(location),
];

type OpenSourceItem = {
  name: string;
  url: string;
};

const openSourceLibraries: Record<string, OpenSourceItem[]> = {
  framework: [
    { name: 'React', url: 'https://react.dev' },
    { name: 'React Router', url: 'https://reactrouter.com' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  ],
  ui: [
    { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
    { name: 'class-variance-authority', url: 'https://cva.style' },
    { name: 'clsx', url: 'https://github.com/lukeed/clsx' },
    { name: 'tailwind-merge', url: 'https://github.com/dcastil/tailwind-merge' },
    { name: '@tailwindcss/typography', url: 'https://tailwindcss.com/docs/typography-plugin' },
  ],
  state: [
    { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
    { name: 'Immer', url: 'https://immerjs.github.io/immer' },
    { name: 'Dexie.js', url: 'https://dexie.org' },
  ],
  validation: [{ name: 'Valibot', url: 'https://valibot.dev' }],
  utilities: [{ name: 'date-fns', url: 'https://date-fns.org' }],
  build: [
    { name: 'Vite', url: 'https://vitejs.dev' },
    { name: 'pnpm', url: 'https://pnpm.io' },
    { name: 'Turbo', url: 'https://turbo.build' },
  ],
  testing: [
    { name: 'Vitest', url: 'https://vitest.dev' },
    { name: 'Playwright', url: 'https://playwright.dev' },
    { name: 'Testing Library', url: 'https://testing-library.com' },
  ],
  quality: [
    { name: 'Biome', url: 'https://biomejs.dev' },
    { name: 'Storybook', url: 'https://storybook.js.org' },
    { name: 'Lighthouse', url: 'https://developer.chrome.com/docs/lighthouse' },
  ],
};

const sectionTitles: Record<string, string> = {
  framework: 'Framework & Language',
  ui: 'UI Components',
  state: 'State & Storage',
  validation: 'Validation',
  utilities: 'Utilities',
  build: 'Build Tools',
  testing: 'Testing',
  quality: 'Code Quality',
};

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function LibraryItem({ item }: { item: OpenSourceItem }) {
  return (
    <li className="border-b border-[var(--color-border-primary)] last:border-b-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between py-4 px-4 hover:bg-[var(--color-interactive-hover)] transition-colors"
      >
        <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
        <ChevronRight />
      </a>
    </li>
  );
}

export default function BuiltWith() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Open Source Licenses</h1>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {Object.entries(openSourceLibraries).map(([category, items]) => (
          <section key={category} className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2 px-2">
              {sectionTitles[category]}
            </h2>
            <ul className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
              {items.map((item) => (
                <LibraryItem key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </NavigationLayout>
  );
}
