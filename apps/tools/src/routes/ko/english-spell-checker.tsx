import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/english-spell-checker')({
  head: () => ({
    meta: [
      { title: '영어 맞춤법 검사기 - Tools' },
      { name: 'description', content: '영어 맞춤법 및 문법 검사' },
    ],
  }),
  component: KoEnglishSpellCheckerPage,
});

function KoEnglishSpellCheckerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          {
            name: '영어 맞춤법 검사기',
            url: 'https://tools.soundbluemusic.com/ko/english-spell-checker',
          },
        ]}
      />
      <MainLayout defaultTool="englishSpellChecker" />
    </>
  );
}
