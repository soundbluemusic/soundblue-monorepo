import { ChevronRight } from 'lucide-react';
import type { MetaFunction } from 'react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Open Source Licenses | Tools' },
  {
    name: 'description',
    content: 'Open source libraries used to build Tools.',
  },
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
    { name: 'Radix UI', url: 'https://www.radix-ui.com' },
    { name: 'Lucide React', url: 'https://lucide.dev' },
    { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
    { name: 'class-variance-authority', url: 'https://cva.style' },
    { name: 'clsx', url: 'https://github.com/lukeed/clsx' },
    { name: 'tailwind-merge', url: 'https://github.com/dcastil/tailwind-merge' },
  ],
  audio: [
    { name: 'Tone.js', url: 'https://tonejs.github.io' },
    { name: 'Tonal', url: 'https://github.com/tonaljs/tonal' },
  ],
  state: [
    { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
    { name: 'Immer', url: 'https://immerjs.github.io/immer' },
    { name: 'Dexie.js', url: 'https://dexie.org' },
  ],
  forms: [
    { name: 'React Hook Form', url: 'https://react-hook-form.com' },
    { name: 'Zod', url: 'https://zod.dev' },
  ],
  utilities: [
    { name: 'date-fns', url: 'https://date-fns.org' },
    { name: 'lz-string', url: 'https://pieroxy.net/blog/pages/lz-string' },
    { name: 'QRCode', url: 'https://github.com/soldair/node-qrcode' },
    { name: '@tanstack/react-virtual', url: 'https://tanstack.com/virtual' },
    { name: '@formkit/auto-animate', url: 'https://auto-animate.formkit.com' },
  ],
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
  audio: 'Audio',
  state: 'State & Storage',
  forms: 'Forms & Validation',
  utilities: 'Utilities',
  build: 'Build Tools',
  testing: 'Testing',
  quality: 'Code Quality',
};

function LibraryItem({ item }: { item: OpenSourceItem }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between py-4 px-4 hover:bg-secondary/50 transition-colors"
      >
        <span className="font-medium text-foreground">{item.name}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </a>
    </li>
  );
}

export default function BuiltWith() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <ToolSidebar />

      <main
        className={`flex-1 p-4 pt-[var(--header-height)] pb-4 transition-[margin-left] duration-150 ease-[var(--ease-default)] max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] sm:pr-8 sm:pb-8 sm:pt-[var(--header-height)] ${
          sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        } max-md:ml-0`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">Open Source Licenses</h1>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {Object.entries(openSourceLibraries).map(([category, items]) => (
            <section key={category} className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {sectionTitles[category]}
              </h2>
              <ul className="bg-background rounded-lg border border-border">
                {items.map((item) => (
                  <LibraryItem key={item.name} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="hidden md:block">
          <Footer />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
