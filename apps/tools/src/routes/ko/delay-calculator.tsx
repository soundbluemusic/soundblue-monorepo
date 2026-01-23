import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/delay-calculator')({
  head: () => ({
    meta: [
      { title: '딜레이 계산기 - Tools' },
      { name: 'description', content: '음악 제작을 위한 딜레이 시간 계산' },
    ],
  }),
  component: KoDelayCalculatorPage,
});

function KoDelayCalculatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '딜레이 계산기', url: 'https://tools.soundbluemusic.com/ko/delay-calculator' },
        ]}
      />
      <MainLayout defaultTool="delayCalculator" />
    </>
  );
}
