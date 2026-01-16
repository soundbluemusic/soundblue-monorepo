import { getLocaleFromPath } from '@soundblue/i18n';
import { Link, useLocation } from 'react-router';
import changelogData from '~/data/changelog.json';
import m from '~/lib/messages';

type CategoryType = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated' | 'security';

interface ChangeItem {
  title: string;
  titleKo: string;
  description?: string;
  descriptionKo?: string;
}

interface Category {
  type: CategoryType;
  items: ChangeItem[];
}

interface Version {
  version: string;
  date: string;
  title: string;
  titleKo: string;
  categories: Category[];
}

const categoryLabels: Record<string, Record<CategoryType, string>> = {
  en: {
    added: 'Added',
    changed: 'Changed',
    fixed: 'Fixed',
    removed: 'Removed',
    deprecated: 'Deprecated',
    security: 'Security',
  },
  ko: {
    added: '추가',
    changed: '변경',
    fixed: '수정',
    removed: '삭제',
    deprecated: '지원 중단',
    security: '보안',
  },
};

const categoryStyles: Record<CategoryType, string> = {
  added: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  fixed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  removed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  deprecated: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  security: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export function Changelog() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';
  const isKo = locale === 'ko';
  const versions = changelogData.versions as Version[];

  const getHomeUrl = () => {
    return locale === 'en' ? '/' : `/${locale}`;
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-bg-primary)]">
      <header className="py-4 px-6 max-md:px-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
        <Link
          to={getHomeUrl()}
          className="inline-flex items-center gap-2 py-2 px-4 text-[var(--color-text-secondary)] no-underline rounded-lg transition-colors duration-150 hover:bg-blue-500/10 hover:text-[var(--color-accent-primary)] focus:outline-2 focus:outline-[var(--color-border-focus)] focus:outline-offset-2"
        >
          <BackIcon />
          <span>{m['app.backToChat']()}</span>
        </Link>
      </header>

      <main className="flex-1 py-6 px-8 max-md:py-6 max-md:px-4 max-w-[800px] mx-auto w-full">
        {/* Hero */}
        <div className="text-center py-8 max-md:py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-accent-primary)] text-white rounded-[20px] mb-4">
            <ChangelogIcon />
          </div>
          <h1 className="text-[2rem] max-md:text-[1.75rem] font-bold text-[var(--color-text-primary)] mb-1">
            {m['changelog.title']()}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            {m['changelog.description']()}
          </p>
        </div>

        {/* Version List */}
        {versions.map((version) => (
          <section key={version.version} className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 pb-2 border-b border-[var(--color-border-primary)] flex items-baseline gap-3">
              <span>v{version.version}</span>
              <time className="text-sm font-normal text-[var(--color-text-tertiary)]">
                {version.date}
              </time>
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              {isKo ? version.titleKo : version.title}
            </p>

            <div className="flex flex-col gap-4">
              {version.categories.map((category) => (
                <div
                  key={category.type}
                  className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${categoryStyles[category.type]}`}
                  >
                    {categoryLabels[locale]?.[category.type] ??
                      categoryLabels['en']![category.type]}
                  </span>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-[var(--color-text-tertiary)] mt-1">•</span>
                        <div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {isKo ? item.titleKo : item.title}
                          </span>
                          {(isKo ? item.descriptionKo : item.description) && (
                            <p className="text-[0.8125rem] text-[var(--color-text-secondary)]">
                              {isKo ? item.descriptionKo : item.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="py-6 text-center text-[var(--color-text-tertiary)] text-[0.8125rem] border-t border-[var(--color-border-primary)]">
        <p>{m['app.aboutMadeWith']()}</p>
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

function ChangelogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}
