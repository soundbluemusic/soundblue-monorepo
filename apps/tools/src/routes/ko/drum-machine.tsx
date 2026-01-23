import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/drum-machine')({
  head: () => ({
    meta: [
      { title: '드럼 머신 - Tools' },
      { name: 'description', content: '다양한 킷을 갖춘 온라인 드럼 머신' },
    ],
  }),
  component: KoDrumMachinePage,
});

function KoDrumMachinePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '드럼 머신', url: 'https://tools.soundbluemusic.com/ko/drum-machine' },
        ]}
      />
      <MainLayout defaultTool="drumMachine" />
    </>
  );
}
