import type { JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';

export default function NewsPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="news" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().news.title}</h1>

          <div class="prose prose-lg max-w-none">
            <p class="text-content-muted mb-6">{t().news.description}</p>

            <div class="bg-surface-dim rounded-lg p-8 text-center">
              <p class="text-content-muted text-lg">{t().news.comingSoon}</p>
            </div>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
