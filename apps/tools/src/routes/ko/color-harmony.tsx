import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/color-harmony')({
  head: () => ({
    meta: [
      { title: '컬러 하모니 - Tools' },
      { name: 'description', content: '색상환 및 조화 생성기' },
    ],
  }),
  component: KoColorHarmonyPage,
});

function KoColorHarmonyPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '컬러 하모니', url: 'https://tools.soundbluemusic.com/ko/color-harmony' },
        ]}
      />
      <MainLayout defaultTool="colorHarmony" />
    </>
  );
}
