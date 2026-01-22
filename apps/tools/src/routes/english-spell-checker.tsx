import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/english-spell-checker')({
  head: () => ({
    meta: [
      { title: 'English Spell Checker - Tools' },
      {
        name: 'description',
        content: 'Check English spelling and get suggestions for corrections',
      },
      {
        name: 'keywords',
        content: 'spell checker, english spelling, grammar check, writing tool, proofreading',
      },
    ],
  }),
  component: EnglishSpellCheckerPage,
});

function EnglishSpellCheckerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'English Spell Checker',
            url: 'https://tools.soundbluemusic.com/english-spell-checker',
          },
        ]}
      />
      <MainLayout defaultTool="englishSpellChecker" />
    </>
  );
}
