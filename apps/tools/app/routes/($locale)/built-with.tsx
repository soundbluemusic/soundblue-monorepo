import type { MetaFunction } from 'react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Built With | Tools' },
  {
    name: 'description',
    content: 'Technologies used to build Tools - React, TypeScript, SCSS Modules.',
  },
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
      name: 'Radix UI',
      url: 'https://www.radix-ui.com',
      license: 'MIT',
      description: 'Accessible UI primitives',
    },
    {
      name: 'Lucide React',
      url: 'https://lucide.dev',
      license: 'ISC',
      description: 'Icon library',
    },
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
  ],
  audio: [
    {
      name: 'Tone.js',
      url: 'https://tonejs.github.io',
      license: 'MIT',
      description: 'Web Audio framework',
    },
    {
      name: 'Tonal',
      url: 'https://github.com/tonaljs/tonal',
      license: 'MIT',
      description: 'Music theory library',
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
  forms: [
    {
      name: 'React Hook Form',
      url: 'https://react-hook-form.com',
      license: 'MIT',
      description: 'Form handling',
    },
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
    {
      name: 'lz-string',
      url: 'https://pieroxy.net/blog/pages/lz-string',
      license: 'MIT',
      description: 'Compression',
    },
    {
      name: 'QRCode',
      url: 'https://github.com/soldair/node-qrcode',
      license: 'MIT',
      description: 'QR code generation',
    },
    {
      name: '@tanstack/react-virtual',
      url: 'https://tanstack.com/virtual',
      license: 'MIT',
      description: 'Virtualization',
    },
    {
      name: '@formkit/auto-animate',
      url: 'https://auto-animate.formkit.com',
      license: 'MIT',
      description: 'Auto animation',
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
  audio: 'Audio',
  state: 'State & Storage',
  forms: 'Forms & Validation',
  utilities: 'Utilities',
  build: 'Build Tools',
  testing: 'Testing',
  quality: 'Code Quality',
  ai: 'AI Tools',
};

function LibraryItem({ item }: { item: OpenSourceItem }) {
  return (
    <li className="flex items-center justify-between py-2 border-b border-(--border) last:border-b-0">
      <div className="flex items-center gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--foreground) hover:text-(--color-accent-primary) hover:underline"
        >
          {item.name}
        </a>
        {item.description && (
          <span className="text-sm text-(--muted-foreground)">- {item.description}</span>
        )}
      </div>
      <span className="text-xs px-2 py-0.5 rounded bg-(--secondary) text-(--muted-foreground)">
        {item.license}
      </span>
    </li>
  );
}

export default function BuiltWith() {
  const totalCount = Object.values(openSourceLibraries).flat().length;
  const { sidebarCollapsed } = useToolStore();

  return (
    <div className="min-h-screen bg-(--color-bg-primary) text-(--color-text-primary)">
      <Header />
      <ToolSidebar />

      <main
        className={`flex-1 p-4 pt-(--header-height) pb-4 transition-[padding] duration-150 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] sm:p-8 sm:pt-(--header-height) ${
          sidebarCollapsed ? 'pl-[var(--sidebar-collapsed-width)]' : 'pl-[var(--sidebar-width)]'
        } max-md:pl-0`}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{m['navigation_builtWith']?.()}</h1>
          <p className="mb-4 text-(--muted-foreground)">{m['builtWith_intro']?.()}</p>
          <p className="mb-8 text-sm text-(--muted-foreground)">
            This project uses <strong>{totalCount}</strong> open source libraries. All libraries
            listed below are freely available under open source licenses.
          </p>

          {Object.entries(openSourceLibraries).map(([category, items]) => (
            <section key={category} className="mb-8">
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                {sectionTitles[category]}
                <span className="text-sm font-normal text-(--muted-foreground)">
                  ({items.length})
                </span>
              </h2>
              <ul className="flex flex-col">
                {items.map((item) => (
                  <LibraryItem key={item.name} item={item} />
                ))}
              </ul>
            </section>
          ))}

          <section className="mb-8 p-4 rounded-lg bg-(--secondary)">
            <h2 className="mb-2 text-lg font-semibold">Browser APIs</h2>
            <ul className="flex flex-wrap gap-2 text-sm text-(--muted-foreground)">
              <li className="px-2 py-1 rounded bg-(--background)">Web Audio API</li>
              <li className="px-2 py-1 rounded bg-(--background)">Canvas API</li>
              <li className="px-2 py-1 rounded bg-(--background)">Service Worker</li>
              <li className="px-2 py-1 rounded bg-(--background)">IndexedDB</li>
              <li className="px-2 py-1 rounded bg-(--background)">Web Workers</li>
            </ul>
          </section>

          <section className="mb-8 p-4 rounded-lg bg-(--secondary)">
            <h2 className="mb-2 text-lg font-semibold">Deployment</h2>
            <ul className="flex flex-wrap gap-2 text-sm text-(--muted-foreground)">
              <li className="px-2 py-1 rounded bg-(--background)">Cloudflare Pages</li>
              <li className="px-2 py-1 rounded bg-(--background)">100% SSG</li>
            </ul>
          </section>
        </div>

        <div className="hidden md:block">
          <Footer appName="Built With" />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
