import type { MetaFunction } from 'react-router';
import { CategoryBadge } from '~/components/changelog';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import changelogData from '~/data/changelog.json';
import { getSeoMeta } from '~/lib/seo';
import { getLocale } from '~/paraglide/runtime';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Changelog | Tools' },
  {
    name: 'description',
    content: 'Version history and updates for Tools.',
  },
  ...getSeoMeta(location),
];

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

export default function Changelog() {
  const { sidebarCollapsed } = useToolStore();
  const locale = getLocale();
  const isKo = locale === 'ko';
  const versions = changelogData.versions as Version[];

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
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{isKo ? '변경 이력' : 'Changelog'}</h1>
              <p className="text-muted-foreground mt-1">
                {isKo ? '버전별 업데이트 내역' : 'Version history and updates'}
              </p>
            </div>
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

          {versions.map((version) => (
            <section key={version.version} className="mb-8">
              {/* Version Header */}
              <div className="flex items-baseline gap-4 mb-2">
                <h2 className="text-xl font-bold">v{version.version}</h2>
                <time className="text-sm text-muted-foreground">{version.date}</time>
              </div>
              <p className="text-muted-foreground mb-4">{isKo ? version.titleKo : version.title}</p>

              {/* Categories */}
              <div className="bg-background rounded-lg border border-border overflow-hidden">
                {version.categories.map((category, catIndex) => (
                  <div key={category.type} className={catIndex > 0 ? 'border-t border-border' : ''}>
                    <div className="px-4 py-3 bg-secondary/30">
                      <CategoryBadge
                        type={category.type}
                        label={
                          categoryLabels[locale]?.[category.type] ||
                          categoryLabels.en[category.type]
                        }
                      />
                    </div>
                    <ul className="divide-y divide-border">
                      {category.items.map((item, index) => (
                        <li key={index} className="px-4 py-3">
                          <div className="font-medium text-foreground">
                            {isKo ? item.titleKo : item.title}
                          </div>
                          {(isKo ? item.descriptionKo : item.description) && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {isKo ? item.descriptionKo : item.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hidden md:block">
          <Footer appName="Changelog" />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
