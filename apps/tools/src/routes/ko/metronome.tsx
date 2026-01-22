import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/metronome')({
  head: () => ({
    meta: [
      { title: '메트로놈 - Tools' },
      {
        name: 'description',
        content: '템포 연습을 위한 정밀 메트로놈 - 무료 브라우저 기반 유틸리티',
      },
    ],
  }),
  component: KoMetronomePage,
});

function KoMetronomePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '메트로놈', url: 'https://tools.soundbluemusic.com/ko/metronome' },
        ]}
      />
      <MainLayout defaultTool="metronome" />
    </>
  );
}
