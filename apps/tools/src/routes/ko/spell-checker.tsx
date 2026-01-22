import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/spell-checker')({
  head: () => ({
    meta: [
      { title: '맞춤법 검사기 - Tools' },
      { name: 'description', content: '한글 맞춤법 검사기' },
    ],
  }),
  component: KoSpellCheckerPage,
});

function KoSpellCheckerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '맞춤법 검사기', url: 'https://tools.soundbluemusic.com/ko/spell-checker' },
        ]}
      />
      <MainLayout defaultTool="spellChecker" />
    </>
  );
}
