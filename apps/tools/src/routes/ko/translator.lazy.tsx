import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createLazyFileRoute } from '@tanstack/react-router';
import { TranslatorLayout } from '~/components/layout';

export const Route = createLazyFileRoute('/ko/translator')({
  component: KoTranslatorPage,
});

function KoTranslatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '번역기', url: 'https://tools.soundbluemusic.com/ko/translator' },
        ]}
      />
      <TranslatorLayout />
    </>
  );
}
