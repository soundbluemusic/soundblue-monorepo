import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/tap-tempo')({
  head: () => ({
    meta: [
      { title: 'Tap Tempo - Tools' },
      {
        name: 'description',
        content: 'Tap to find the tempo (BPM) of any song or beat',
      },
      {
        name: 'keywords',
        content: 'tap tempo, bpm finder, tempo detector, beat counter, music tempo',
      },
    ],
  }),
  component: TapTempoPage,
});

function TapTempoPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Tap Tempo', url: 'https://tools.soundbluemusic.com/tap-tempo' },
        ]}
      />
      <MainLayout defaultTool="tapTempo" />
    </>
  );
}
