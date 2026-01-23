import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createLazyFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createLazyFileRoute('/translator')({
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
