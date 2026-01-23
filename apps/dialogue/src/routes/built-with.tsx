import { getLocaleFromPath } from '@soundblue/i18n';
import { createFileRoute, Link, useLocation } from '@tanstack/react-router';

export const Route = createFileRoute('/built-with')({
  head: () => ({
    meta: [
      { title: 'Open Source Licenses | Dialogue' },
      { name: 'description', content: 'Open source libraries used to build Dialogue.' },
      // Open Graph
      { property: 'og:title', content: 'Open Source Licenses | Dialogue' },
      { property: 'og:description', content: 'Open source libraries used to build Dialogue.' },
      { property: 'og:url', content: 'https://dialogue.soundbluemusic.com/built-with' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/built-with' },
      // Alternate language
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'ko',
        href: 'https://dialogue.soundbluemusic.com/ko/built-with',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://dialogue.soundbluemusic.com/built-with',
      },
    ],
  }),
  component: BuiltWithPage,
});

type OpenSourceItem = {
  name: string;
  url: string;
};

const openSourceLibraries: Record<string, OpenSourceItem[]> = {
  framework: [
    { name: 'React', url: 'https://react.dev' },
    { name: 'TanStack Start', url: 'https://tanstack.com/start' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  ],
  ui: [
    { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
    { name: '@formkit/auto-animate', url: 'https://auto-animate.formkit.com' },
  ],
  state: [
    { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
    { name: 'Immer', url: 'https://immerjs.github.io/immer' },
  ],
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
  quality: [{ name: 'Biome', url: 'https://biomejs.dev' }],
};

const sectionTitles: Record<string, { en: string; ko: string }> = {
  framework: { en: 'Framework & Language', ko: '프레임워크 & 언어' },
  ui: { en: 'UI Components', ko: 'UI 컴포넌트' },
  state: { en: 'State Management', ko: '상태 관리' },
  utilities: { en: 'Utilities', ko: '유틸리티' },
  build: { en: 'Build Tools', ko: '빌드 도구' },
  testing: { en: 'Testing', ko: '테스팅' },
  quality: { en: 'Code Quality', ko: '코드 품질' },
};

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5 text-[var(--color-text-tertiary)]"
    >
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
        className="flex items-center justify-between py-4 px-4 hover:bg-[var(--color-bg-secondary)]/50 transition-colors"
      >
        <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
        <ChevronRight />
      </a>
    </li>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function BuiltWithPage() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  const getHomeUrl = () => {
    return locale === 'en' ? '/' : `/${locale}`;
  };

  const texts = {
    title: locale === 'ko' ? '오픈소스 라이센스' : 'Open Source Licenses',
    backToChat: locale === 'ko' ? '채팅으로 돌아가기' : 'Back to Chat',
    footer: locale === 'ko' ? 'SoundBlue가 만들었습니다' : 'Made by SoundBlue',
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-bg-primary)]">
      <header className="py-4 px-6 max-md:px-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
        <Link
          to={getHomeUrl()}
          className="inline-flex items-center gap-2 py-2 px-4 text-[var(--color-text-secondary)] no-underline rounded-lg transition-colors duration-150 hover:bg-blue-500/10 hover:text-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
        >
          <BackIcon />
          <span>{texts.backToChat}</span>
        </Link>
      </header>

      <main className="flex-1 py-6 px-8 max-md:py-6 max-md:px-4 max-w-[800px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[2rem] max-md:text-[1.75rem] font-bold text-[var(--color-text-primary)]">
            {texts.title}
          </h1>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-secondary)]"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {Object.entries(openSourceLibraries).map(([category, items]) => (
          <section key={category} className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2 px-2">
              {sectionTitles[category]?.[locale] ?? category}
            </h2>
            <ul className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
              {items.map((item) => (
                <LibraryItem key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="py-6 text-center text-[var(--color-text-tertiary)] text-[0.8125rem] border-t border-[var(--color-border-primary)]">
        <p>{texts.footer}</p>
      </footer>
    </div>
  );
}
