import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/color-decomposer')({
  head: () => ({
    meta: [{ title: '색상 분해기 - Tools' }, { name: 'description', content: '색상 분해 및 분석' }],
  }),
  component: KoColorDecomposerPage,
});

function KoColorDecomposerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '색상 분해기', url: 'https://tools.soundbluemusic.com/ko/color-decomposer' },
        ]}
      />
      <MainLayout defaultTool="colorDecomposer" />
    </>
  );
}
