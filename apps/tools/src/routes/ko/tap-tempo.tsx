import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/tap-tempo')({
  head: () => ({
    meta: [
      { title: '탭 템포 - Tools' },
      { name: 'description', content: '탭하여 노래의 템포 찾기' },
    ],
  }),
  component: KoTapTempoPage,
});

function KoTapTempoPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '탭 템포', url: 'https://tools.soundbluemusic.com/ko/tap-tempo' },
        ]}
      />
      <MainLayout defaultTool="tapTempo" />
    </>
  );
}
