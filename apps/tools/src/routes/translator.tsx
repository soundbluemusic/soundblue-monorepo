import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/translator')({
  head: () => ({
    meta: [
      { title: 'Translator - Tools' },
      {
        name: 'description',
        content:
          'Korean-English bidirectional translation tool powered by algorithm-based translation engine',
      },
      {
        name: 'keywords',
        content:
          'translator, korean english, 번역기, 한영 번역, english korean translation, free translator',
      },
    ],
  }),
  component: TranslatorPage,
});

function TranslatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Translator', url: 'https://tools.soundbluemusic.com/translator' },
        ]}
      />
      <MainLayout defaultTool="translator" />
    </>
  );
}
