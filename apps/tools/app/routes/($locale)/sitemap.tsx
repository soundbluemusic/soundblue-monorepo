import { useParaglideI18n } from '@soundblue/i18n';
import type { MetaFunction } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';
import { ALL_TOOLS } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';

/**
 * 빌드 타임에 날짜를 캡처하여 Hydration 불일치 방지
 */
export async function loader() {
  const now = new Date();
  return {
    lastUpdated: {
      en: now.toLocaleDateString('en-US'),
      ko: now.toLocaleDateString('ko-KR'),
    },
  };
}

export const meta: MetaFunction = ({ location }) => [
  { title: 'Sitemap | Tools' },
  { name: 'description', content: 'Complete sitemap of SoundBlueMusic Tools website.' },
  ...getSeoMeta(location),
];

// 메인 페이지 정의
const mainPages = [
  { path: '/', messageKey: 'navigation_home' as const, icon: '🏠' },
  { path: '/about', messageKey: 'navigation_about' as const, icon: '💡' },
  { path: '/built-with', messageKey: 'navigation_builtWith' as const, icon: '🛠' },
];

// 기타 페이지 정의
const otherPages = [{ path: '/benchmark', messageKey: 'sidebar_benchmark' as const, icon: '📊' }];

export default function Sitemap() {
  const { locale, localizedPath } = useParaglideI18n();
  const { lastUpdated } = useLoaderData<typeof loader>();
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
          {/* 타이틀 섹션 */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{m['sitemap_title']?.()}</h1>
            <p className="text-sm text-(--muted-foreground)">
              {locale === 'ko' ? '사이트의 모든 페이지를 한눈에' : 'All pages at a glance'}
            </p>
          </div>

          {/* 메인 페이지 섹션 */}
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-(--muted-foreground)">
              <span className="h-px flex-1 bg-(--border)" />
              <span>{m['sitemap_sections_main']?.()}</span>
              <span className="h-px flex-1 bg-(--border)" />
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {mainPages.map((page) => (
                <Link
                  key={page.path}
                  to={localizedPath(page.path)}
                  className="group flex items-center gap-3 rounded-lg border border-(--border) bg-(--secondary)/30 p-3 transition-all hover:border-(--color-accent-primary)/30 hover:bg-(--secondary)"
                >
                  <span className="text-lg">{page.icon}</span>
                  <span className="font-medium text-(--foreground) group-hover:text-(--color-accent-primary)">
                    {m[page.messageKey]?.()}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 도구 섹션 */}
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-(--muted-foreground)">
              <span className="h-px flex-1 bg-(--border)" />
              <span>
                {m['sitemap_sections_tools']?.()} ({ALL_TOOLS.length})
              </span>
              <span className="h-px flex-1 bg-(--border)" />
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ALL_TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  to={localizedPath(`/${tool.slug}`)}
                  className="group flex items-center gap-3 rounded-lg border border-(--border) bg-(--secondary)/30 p-3 transition-all hover:border-(--color-accent-primary)/30 hover:bg-(--secondary)"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-(--background) text-base">
                    {tool.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-(--foreground) group-hover:text-(--color-accent-primary)">
                      {tool.name[locale]}
                    </span>
                    <span className="text-xs text-(--muted-foreground) line-clamp-1">
                      {tool.description[locale]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 기타 섹션 */}
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-(--muted-foreground)">
              <span className="h-px flex-1 bg-(--border)" />
              <span>{m['sitemap_sections_other']?.()}</span>
              <span className="h-px flex-1 bg-(--border)" />
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {otherPages.map((page) => (
                <Link
                  key={page.path}
                  to={localizedPath(page.path)}
                  className="group flex items-center gap-3 rounded-lg border border-(--border) bg-(--secondary)/30 p-3 transition-all hover:border-(--color-accent-primary)/30 hover:bg-(--secondary)"
                >
                  <span className="text-lg">{page.icon}</span>
                  <span className="font-medium text-(--foreground) group-hover:text-(--color-accent-primary)">
                    {m[page.messageKey]?.()}
                  </span>
                </Link>
              ))}
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-(--border) bg-(--secondary)/30 p-3 transition-all hover:border-(--color-accent-primary)/30 hover:bg-(--secondary)"
              >
                <span className="text-lg">📄</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-(--foreground) group-hover:text-(--color-accent-primary)">
                    {m['sitemap_xml']?.()}
                  </span>
                  <svg
                    className="h-3 w-3 text-(--muted-foreground)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </section>

          {/* 푸터 정보 */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-(--muted-foreground)">
            <span className="h-1 w-1 rounded-full bg-(--muted-foreground)/50" />
            <span>{m['sitemap_lastUpdated']?.()}</span>
            <span>{locale === 'ko' ? lastUpdated.ko : lastUpdated.en}</span>
            <span className="h-1 w-1 rounded-full bg-(--muted-foreground)/50" />
          </div>
        </div>

        <div className="hidden md:block">
          <Footer appName="Sitemap" />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
