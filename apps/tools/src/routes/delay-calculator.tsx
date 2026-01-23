import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/delay-calculator')({
  head: () => ({
    meta: [
      { title: 'Delay Calculator - Tools' },
      {
        name: 'description',
        content: 'Calculate delay times for music production based on BPM and note values',
      },
      {
        name: 'keywords',
        content:
          'delay calculator, delay time, bpm calculator, music production, reverb time, echo time',
      },
    ],
  }),
  component: DelayCalculatorPage,
});

function DelayCalculatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Delay Calculator',
            url: 'https://tools.soundbluemusic.com/delay-calculator',
          },
        ]}
      />
      <MainLayout defaultTool="delayCalculator" />
    </>
  );
}
