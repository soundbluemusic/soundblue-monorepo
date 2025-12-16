import type { JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';

export default function PrivacyPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="privacy" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().privacy.title}</h1>

          <div class="prose prose-lg max-w-none">
            <p class="text-content-muted mb-6">{t().common.lastUpdated}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().privacy.sections.collection.title}</h2>
            <p class="mb-4">{t().privacy.sections.collection.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().privacy.sections.cookies.title}</h2>
            <p class="mb-4">{t().privacy.sections.cookies.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().privacy.sections.thirdParty.title}</h2>
            <p class="mb-4">{t().privacy.sections.thirdParty.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().privacy.sections.contact.title}</h2>
            <p class="mb-4">{t().privacy.sections.contact.content}</p>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
