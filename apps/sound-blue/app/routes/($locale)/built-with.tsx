import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Built With | Sound Blue' },
  { name: 'description', content: 'Technologies used to build Sound Blue website.' },
  ...getSeoMeta(location),
];

type OpenSourceItem = {
  name: string;
  url: string;
  license: string;
  description?: string;
};

const openSourceLibraries: Record<string, OpenSourceItem[]> = {
  framework: [
    { name: 'React', url: 'https://react.dev', license: 'MIT', description: 'UI library' },
    {
      name: 'React Router',
      url: 'https://reactrouter.com',
      license: 'MIT',
      description: 'Routing',
    },
    {
      name: 'TypeScript',
      url: 'https://www.typescriptlang.org',
      license: 'Apache-2.0',
      description: 'Type safety',
    },
    {
      name: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      license: 'MIT',
      description: 'Styling',
    },
  ],
  ui: [
    {
      name: 'Framer Motion',
      url: 'https://www.framer.com/motion',
      license: 'MIT',
      description: 'Animation',
    },
    {
      name: 'class-variance-authority',
      url: 'https://cva.style',
      license: 'Apache-2.0',
      description: 'Variant styling',
    },
    {
      name: 'clsx',
      url: 'https://github.com/lukeed/clsx',
      license: 'MIT',
      description: 'Class utilities',
    },
    {
      name: 'tailwind-merge',
      url: 'https://github.com/dcastil/tailwind-merge',
      license: 'MIT',
      description: 'Merge Tailwind classes',
    },
    {
      name: '@tailwindcss/typography',
      url: 'https://tailwindcss.com/docs/typography-plugin',
      license: 'MIT',
      description: 'Typography styling',
    },
  ],
  state: [
    {
      name: 'Zustand',
      url: 'https://zustand-demo.pmnd.rs',
      license: 'MIT',
      description: 'State management',
    },
    {
      name: 'Immer',
      url: 'https://immerjs.github.io/immer',
      license: 'MIT',
      description: 'Immutable state',
    },
    {
      name: 'Dexie.js',
      url: 'https://dexie.org',
      license: 'Apache-2.0',
      description: 'IndexedDB wrapper',
    },
  ],
  validation: [
    {
      name: 'Valibot',
      url: 'https://valibot.dev',
      license: 'MIT',
      description: 'Schema validation',
    },
  ],
  utilities: [
    {
      name: 'date-fns',
      url: 'https://date-fns.org',
      license: 'MIT',
      description: 'Date utilities',
    },
  ],
  build: [
    { name: 'Vite', url: 'https://vitejs.dev', license: 'MIT', description: 'Build tool' },
    { name: 'pnpm', url: 'https://pnpm.io', license: 'MIT', description: 'Package manager' },
    { name: 'Turbo', url: 'https://turbo.build', license: 'MIT', description: 'Monorepo tool' },
  ],
  testing: [
    { name: 'Vitest', url: 'https://vitest.dev', license: 'MIT', description: 'Unit testing' },
    {
      name: 'Playwright',
      url: 'https://playwright.dev',
      license: 'Apache-2.0',
      description: 'E2E testing',
    },
    {
      name: 'Testing Library',
      url: 'https://testing-library.com',
      license: 'MIT',
      description: 'Component testing',
    },
  ],
  quality: [
    {
      name: 'Biome',
      url: 'https://biomejs.dev',
      license: 'MIT',
      description: 'Linting & formatting',
    },
    {
      name: 'Storybook',
      url: 'https://storybook.js.org',
      license: 'MIT',
      description: 'UI documentation',
    },
    {
      name: 'Lighthouse',
      url: 'https://developer.chrome.com/docs/lighthouse',
      license: 'Apache-2.0',
      description: 'Performance audit',
    },
  ],
  ai: [
    {
      name: 'Claude Code',
      url: 'https://docs.anthropic.com/en/docs/claude-code',
      license: 'Anthropic',
      description: 'AI coding assistant',
    },
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
  ai: 'AI Tools',
};

function LibraryItem({ item }: { item: OpenSourceItem }) {
  return (
    <li className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-content hover:text-accent hover:underline"
        >
          {item.name}
        </a>
        {item.description && (
          <span className="text-sm text-content-muted">- {item.description}</span>
        )}
      </div>
      <span className="text-xs px-2 py-0.5 rounded bg-surface-secondary text-content-muted">
        {item.license}
      </span>
    </li>
  );
}

export default function BuiltWith() {
  const totalCount = Object.values(openSourceLibraries).flat().length;

  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{m['builtWith.title']()}</h1>
        <p className="mb-4 text-content-muted">
          This website is built with modern web technologies and open source libraries.
        </p>
        <p className="mb-8 text-sm text-content-muted">
          This project uses <strong>{totalCount}</strong> open source libraries. All libraries
          listed below are freely available under open source licenses.
        </p>

        {Object.entries(openSourceLibraries).map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {sectionTitles[category]}
              <span className="text-sm font-normal text-content-muted">({items.length})</span>
            </h2>
            <ul className="flex flex-col">
              {items.map((item) => (
                <LibraryItem key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-8 p-4 rounded-lg bg-surface-secondary">
          <h2 className="mb-2 text-lg font-semibold">Browser APIs</h2>
          <ul className="flex flex-wrap gap-2 text-sm text-content-muted">
            <li className="px-2 py-1 rounded bg-surface">Service Worker</li>
            <li className="px-2 py-1 rounded bg-surface">IndexedDB</li>
            <li className="px-2 py-1 rounded bg-surface">localStorage</li>
          </ul>
        </section>

        <section className="mb-8 p-4 rounded-lg bg-surface-secondary">
          <h2 className="mb-2 text-lg font-semibold">Deployment</h2>
          <ul className="flex flex-wrap gap-2 text-sm text-content-muted">
            <li className="px-2 py-1 rounded bg-surface">Cloudflare Pages</li>
            <li className="px-2 py-1 rounded bg-surface">100% SSG</li>
          </ul>
        </section>
      </div>
    </NavigationLayout>
  );
}
