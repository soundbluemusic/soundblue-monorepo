import type { JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';

export default function BlogPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="blog" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().blog.title}</h1>

          <div class="prose prose-lg max-w-none">
            <p class="text-content-muted mb-6">{t().blog.description}</p>

            <div class="bg-surface-dim rounded-lg p-8 text-center">
              <p class="text-content-muted text-lg">{t().blog.comingSoon}</p>
            </div>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
