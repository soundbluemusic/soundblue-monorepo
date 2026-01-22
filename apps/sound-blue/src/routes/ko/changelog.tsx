import { createFileRoute } from '@tanstack/react-router';
import { CategoryBadge } from '~/components/changelog';
import { NavigationLayout } from '~/components/layout';
import changelogData from '~/data/changelog.json';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/changelog')({
  head: () => ({
    meta: [
      { title: '변경 이력 | Sound Blue' },
      {
        name: 'description',
        content: 'Sound Blue 웹사이트의 버전 이력 및 업데이트 내용입니다.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/changelog' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/changelog' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/changelog' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/changelog' },
    ],
  }),
  component: Changelog,
});

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

const categoryLabels: Record<CategoryType, string> = {
  added: '추가',
  changed: '변경',
  fixed: '수정',
  removed: '삭제',
  deprecated: '지원 중단',
  security: '보안',
};

function Changelog() {
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
              <p className="text-lg text-content-muted mb-6">{version.titleKo}</p>

              {/* Categories */}
              <div className="space-y-6">
                {version.categories.map((category) => (
                  <div key={category.type}>
                    <div className="mb-3">
                      <CategoryBadge
                        type={category.type}
                        label={categoryLabels[category.type] || category.type}
                      />
                    </div>
                    <ul className="space-y-3 pl-4">
                      {category.items.map((item, index) => (
                        <li key={index} className="relative">
                          <div className="absolute -left-4 top-2 w-1.5 h-1.5 rounded-full bg-content-muted" />
                          <div>
                            <span className="font-medium text-content">{item.titleKo}</span>
                            {item.descriptionKo && (
                              <p className="text-sm text-content-muted mt-0.5">
                                {item.descriptionKo}
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
