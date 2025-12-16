import type { JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';

export default function TermsPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="terms" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().terms.title}</h1>

          <div class="prose prose-lg max-w-none">
            <p class="text-content-muted mb-6">{t().common.lastUpdated}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().terms.sections.use.title}</h2>
            <p class="mb-4">{t().terms.sections.use.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().terms.sections.copyright.title}</h2>
            <p class="mb-4">{t().terms.sections.copyright.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().terms.sections.disclaimer.title}</h2>
            <p class="mb-4">{t().terms.sections.disclaimer.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().terms.sections.changes.title}</h2>
            <p class="mb-4">{t().terms.sections.changes.content}</p>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
