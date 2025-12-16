import type { JSX } from 'solid-js';
import { NavigationLayout, OptimizedImage, PageSeo, useLanguage } from '~/components';
import { LinkButton } from '~/components/ui';
import { YouTubeIcon } from '~/constants';

export default function AboutPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo page="about" />
      <NavigationLayout>
        <div class="w-full bg-white/80 dark:bg-white/10 py-6 sm:py-8 mb-8">
          <div class="flex justify-center items-center px-4">
            <OptimizedImage
              src="/branding-assets/logo-mascot-nb"
              alt="Sound Blue Mascot"
              width={800}
              height={434}
              sizes={[400, 600, 800]}
              sizesAttr="(max-width: 640px) 90vw, (max-width: 1024px) 600px, 800px"
              pictureClass="w-full max-w-md sm:max-w-lg lg:max-w-2xl transition-all duration-300 ease-out"
              class="w-full h-auto object-contain transition-all duration-300 ease-out"
              priority
            />
          </div>
        </div>
        <div class="max-w-4xl mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-2">{t().about.title}</h1>
          <p class="text-xl text-content-muted mb-8">{t().about.subtitle}</p>

          <div class="prose prose-lg max-w-none">
            <p class="mb-8 text-lg text-content-muted">{t().about.intro}</p>

            <h2 class="text-xl font-semibold mt-8 mb-4">{t().about.sections.artist.title}</h2>
            <p class="mb-4">{t().about.sections.artist.content}</p>

            <h2 class="text-xl font-semibold mt-8 mb-4">{t().about.sections.label.title}</h2>
            <p class="mb-4">{t().about.sections.label.content}</p>

            <h2 class="text-xl font-semibold mt-8 mb-4">{t().about.sections.music.title}</h2>
            <p class="mb-4">{t().about.sections.music.content}</p>

            <h2 class="text-xl font-semibold mt-8 mb-4">{t().about.sections.vision.title}</h2>
            <p class="mb-4">{t().about.sections.vision.content}</p>

            <h2 class="text-xl font-semibold mt-8 mb-4">{t().about.sections.connect.title}</h2>
            <div class="flex flex-wrap gap-4">
              <LinkButton
                href="https://www.youtube.com/@SoundBlueMusic"
                target="_blank"
                rel="noopener noreferrer"
                variant="youtube"
                size="md"
                class="gap-2"
              >
                <YouTubeIcon class="w-5 h-5" />
                {t().about.sections.connect.youtube}
              </LinkButton>
            </div>
          </div>
        </div>
      </NavigationLayout>
    </>
  );
}
