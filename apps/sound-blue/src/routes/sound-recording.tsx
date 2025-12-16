import { A } from '@solidjs/router';
import { For, type JSX } from 'solid-js';
import { NavigationLayout, PageSeo, useLanguage } from '~/components';
import { YouTubeIcon } from '~/constants';

export default function SoundRecordingPage(): JSX.Element {
  const { t, localizedPath, language } = useLanguage();

  return (
    <>
      <PageSeo page="soundRecording" />
      <NavigationLayout>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-8">{t().soundRecording.title}</h1>

          <div class="prose prose-lg max-w-none">
            <p class="mb-6 text-lg text-content-muted">{t().soundRecording.intro}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().soundRecording.about.title}</h2>
            <p class="mb-4">{t().soundRecording.about.content}</p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().soundRecording.types.title}</h2>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <For each={t().soundRecording.types.items}>{(item) => <li>{item}</li>}</For>
            </ul>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().soundRecording.license.title}</h2>
            <p
              class="mb-4"
              innerHTML={t().soundRecording.license.content.replace(
                /\*\*([^*]+)\*\*/g,
                '<strong>$1</strong>',
              )}
            />
            <p class="mb-4">
              {t().soundRecording.license.linkPrefix}
              <A href={localizedPath('/license')} class="text-accent underline">
                {t().soundRecording.license.linkText}
              </A>
              {t().soundRecording.license.linkSuffix}
            </p>
            <h2 class="text-xl font-semibold mt-8 mb-4">{t().soundRecording.downloads.title}</h2>
            <p class="mb-4 text-content-muted">{t().soundRecording.downloads.content}</p>

            <div class="mt-8 flex justify-center">
              <a
                href="https://www.youtube.com/@Sound-Recording"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link social-youtube"
                aria-label="YouTube - Sound Recording"
              >
                <YouTubeIcon class="social-icon w-5 h-5" />
                <span class="social-label">
                  {language() === 'ko' ? 'YouTube 채널 방문' : 'Visit YouTube Channel'}
                </span>
              </a>
            </div>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
