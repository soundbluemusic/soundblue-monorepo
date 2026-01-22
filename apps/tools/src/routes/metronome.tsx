import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/metronome')({
  head: () => ({
    meta: [
      { title: 'Metronome - Tools' },
      {
        name: 'description',
        content:
          'Precision metronome for tempo practice - Free browser-based utility with BPM control and time signatures.',
      },
      {
        name: 'keywords',
        content: 'metronome, tempo, bpm, time signature, practice tool, music timing, beat counter',
      },
    ],
  }),
  component: MetronomePage,
});

function MetronomePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Metronome', url: 'https://tools.soundbluemusic.com/metronome' },
        ]}
      />
      <MainLayout defaultTool="metronome" />
    </>
  );
}
