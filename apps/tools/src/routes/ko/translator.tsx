import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/translator')({
  head: () => ({
    meta: [{ title: '번역기 - Tools' }, { name: 'description', content: '한영 양방향 번역' }],
  }),
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
      <MainLayout defaultTool="translator" />
    </>
  );
}
