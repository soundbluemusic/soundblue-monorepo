import type { MetaFunction } from 'react-router';
import { CategoryBadge } from '~/components/changelog';
import { NavigationLayout } from '~/components/layout';
import changelogData from '~/data/changelog.json';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';
import { getLocale } from '~/paraglide/runtime';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Changelog | Sound Blue' },
  {
    name: 'description',
    content: 'Version history and updates for Sound Blue website.',
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
  const locale = getLocale();
  const isKo = locale === 'ko';
  const versions = changelogData.versions as Version[];

  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-content mb-2">{m['changelog_title']()}</h1>
        <p className="text-lg text-content-muted mb-8">{m['changelog_description']()}</p>

        <div className="space-y-12">
          {versions.map((version) => (
            <article key={version.version} className="relative">
              {/* Version Header */}
              <div className="flex items-baseline gap-4 mb-4">
                <h2 className="text-2xl font-bold text-content">v{version.version}</h2>
                <time className="text-sm text-content-muted">{version.date}</time>
              </div>
              <p className="text-lg text-content-muted mb-6">
                {isKo ? version.titleKo : version.title}
              </p>

              {/* Categories */}
              <div className="space-y-6">
                {version.categories.map((category) => (
                  <div key={category.type}>
                    <div className="mb-3">
                      <CategoryBadge
                        type={category.type}
                        label={
                          categoryLabels[locale]?.[category.type] ||
                          categoryLabels.en?.[category.type] ||
                          category.type
                        }
                      />
                    </div>
                    <ul className="space-y-3 pl-4">
                      {category.items.map((item, index) => (
                        <li key={index} className="relative">
                          <div className="absolute -left-4 top-2 w-1.5 h-1.5 rounded-full bg-content-muted" />
                          <div>
                            <span className="font-medium text-content">
                              {isKo ? item.titleKo : item.title}
                            </span>
                            {(isKo ? item.descriptionKo : item.description) && (
                              <p className="text-sm text-content-muted mt-0.5">
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

              {/* Divider */}
              <div className="mt-8 border-b border-border" />
            </article>
          ))}
        </div>
      </div>
    </NavigationLayout>
  );
}
