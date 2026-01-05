import { getLocaleFromPath } from '@soundblue/i18n';
import type { MetaFunction } from 'react-router';
import { Link, useLocation } from 'react-router';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ params }) => [
  { title: 'Built With | Dialogue' },
  {
    name: 'description',
    content: 'Technologies used to build Dialogue - A conversational learning tool.',
  },
  ...getSeoMeta('/built-with', params),
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
      name: '@formkit/auto-animate',
      url: 'https://auto-animate.formkit.com',
      license: 'MIT',
      description: 'Auto animation',
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
  state: 'State Management',
  utilities: 'Utilities',
  build: 'Build Tools',
  testing: 'Testing',
  quality: 'Code Quality',
  ai: 'AI Tools',
};

function LibraryItem({ item }: { item: OpenSourceItem }) {
  return (
    <li className="flex items-center justify-between py-3 px-4 bg-(--color-bg-secondary) border border-(--color-border-primary) rounded-lg">
      <div className="flex items-center gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-(--color-text-primary) hover:text-(--color-accent-primary) hover:underline"
        >
          {item.name}
        </a>
        {item.description && (
          <span className="text-sm text-(--color-text-secondary)">- {item.description}</span>
        )}
      </div>
      <span className="text-xs px-2 py-0.5 rounded bg-(--color-bg-primary) text-(--color-text-tertiary)">
        {item.license}
      </span>
    </li>
  );
}

export default function BuiltWith() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';
  const totalCount = Object.values(openSourceLibraries).flat().length;

  const getHomeUrl = () => {
    return locale === 'en' ? '/' : `/${locale}`;
  };

  return (
    <div className="min-h-full flex flex-col bg-(--color-bg-primary)">
      <header className="py-4 px-6 max-md:px-4 bg-(--color-bg-secondary) border-b border-(--color-border-primary)">
        <Link
          to={getHomeUrl()}
          className="inline-flex items-center gap-2 py-2 px-4 text-(--color-text-secondary) no-underline rounded-lg transition-colors duration-150 hover:bg-blue-500/10 hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
        >
          <BackIcon />
          <span>{locale === 'ko' ? '채팅으로 돌아가기' : 'Back to Chat'}</span>
        </Link>
      </header>

      <main className="flex-1 py-6 px-8 max-md:py-6 max-md:px-4 max-w-[800px] mx-auto w-full">
        <div className="text-center py-8 max-md:py-6">
          <h1 className="text-[2rem] max-md:text-[1.75rem] font-bold text-(--color-text-primary) mb-4">
            {locale === 'ko' ? '사용된 기술' : 'Built With'}
          </h1>
          <p className="text-base text-(--color-text-secondary) mb-2">
            {locale === 'ko'
              ? '이 프로젝트는 현대적인 웹 기술과 오픈소스 라이브러리로 제작되었습니다.'
              : 'This project is built with modern web technologies and open source libraries.'}
          </p>
          <p className="text-sm text-(--color-text-tertiary)">
            {locale === 'ko'
              ? `총 ${totalCount}개의 오픈소스 라이브러리를 사용합니다.`
              : `Using ${totalCount} open source libraries.`}
          </p>
        </div>

        {Object.entries(openSourceLibraries).map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 pb-2 border-b border-(--color-border-primary) flex items-center gap-2">
              {sectionTitles[category]}
              <span className="text-sm font-normal text-(--color-text-tertiary)">
                ({items.length})
              </span>
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <LibraryItem key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 pb-2 border-b border-(--color-border-primary)">
            {locale === 'ko' ? '브라우저 API' : 'Browser APIs'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) text-sm text-(--color-text-secondary)">
              Service Worker
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) text-sm text-(--color-text-secondary)">
              IndexedDB
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) text-sm text-(--color-text-secondary)">
              localStorage
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 pb-2 border-b border-(--color-border-primary)">
            {locale === 'ko' ? '배포' : 'Deployment'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) text-sm text-(--color-text-secondary)">
              Cloudflare Pages
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-(--color-bg-secondary) border border-(--color-border-primary) text-sm text-(--color-text-secondary)">
              100% SSG
            </span>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-(--color-text-tertiary) text-[0.8125rem] border-t border-(--color-border-primary)">
        <p>{locale === 'ko' ? 'SoundBlue가 만들었습니다' : 'Made by SoundBlue'}</p>
      </footer>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}
