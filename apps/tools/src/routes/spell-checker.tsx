import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/spell-checker')({
  head: () => ({
    meta: [
      { title: 'Spell Checker - Tools' },
      {
        name: 'description',
        content: 'Korean spell checker for checking and correcting Korean text',
      },
      {
        name: 'keywords',
        content: 'spell checker, korean spell checker, 맞춤법 검사, 한글 맞춤법, writing tool',
      },
    ],
  }),
  component: SpellCheckerPage,
});

function SpellCheckerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Spell Checker',
            url: 'https://tools.soundbluemusic.com/spell-checker',
          },
        ]}
      />
      <MainLayout defaultTool="spellChecker" />
    </>
  );
}
