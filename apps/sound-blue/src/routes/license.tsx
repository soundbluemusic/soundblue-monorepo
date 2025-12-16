import { For, type JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';

export default function LicensePage(): JSX.Element {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <PageSeo page="license" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().license.title}</h1>

          <div class="prose prose-lg max-w-none">
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().license.soundRecording.title}</h2>
            <p class="mb-4">{t().license.soundRecording.description}</p>
            <h3 class="text-lg font-semibold mt-6 mb-3">
              {t().license.soundRecording.permitted.title}
            </h3>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <For each={t().license.soundRecording.permitted.items}>
                {(item) => <li>{item}</li>}
              </For>
            </ul>
            <h3 class="text-lg font-semibold mt-6 mb-3">
              {t().license.soundRecording.prohibited.title}
            </h3>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <For each={t().license.soundRecording.prohibited.items}>
                {(item) => (
                  <li
                    innerHTML={
                      item.includes(' - ')
                        ? `<strong>${item.split(' - ')[0]}</strong> - ${item.split(' - ')[1]}`
                        : item
                    }
                  />
                )}
              </For>
            </ul>
            <h3 class="text-lg font-semibold mt-6 mb-3 text-red-600 dark:text-red-400">
              {t().license.soundRecording.legal.title}
            </h3>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <For each={t().license.soundRecording.legal.items}>
                {(item) => (
                  <li
                    class="text-red-700 dark:text-red-300"
                    innerHTML={
                      item.includes(' - ')
                        ? `<strong>${item.split(' - ')[0]}</strong> - ${item.split(' - ')[1]}`
                        : item
                    }
                  />
                )}
              </For>
            </ul>
            <h3 class="text-lg font-semibold mt-6 mb-3">
              {t().license.soundRecording.terms.title}
            </h3>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <li
                innerHTML={t().license.soundRecording.terms.attribution.replace(
                  /^([^-]+) - /,
                  '<strong>$1</strong> - ',
                )}
              />
            </ul>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().license.website.title}</h2>
            <p class="mb-4">
              {t().license.website.copyright.replace('{year}', String(currentYear))}
            </p>
            <p class="mb-4">{t().license.website.content}</p>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
