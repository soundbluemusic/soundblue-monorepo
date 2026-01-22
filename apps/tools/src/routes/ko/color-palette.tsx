import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/color-palette')({
  head: () => ({
    meta: [
      { title: '컬러 팔레트 - Tools' },
      { name: 'description', content: '색상 팔레트 생성 및 관리' },
    ],
  }),
  component: KoColorPalettePage,
});

function KoColorPalettePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '컬러 팔레트', url: 'https://tools.soundbluemusic.com/ko/color-palette' },
        ]}
      />
      <MainLayout defaultTool="colorPalette" />
    </>
  );
}
