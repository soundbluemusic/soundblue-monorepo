import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/drum-machine')({
  head: () => ({
    meta: [
      { title: 'Drum Machine - Tools' },
      {
        name: 'description',
        content: 'Online drum machine with various kits and pattern sequencer for beat making',
      },
      {
        name: 'keywords',
        content: 'drum machine, beat maker, drum pattern, sequencer, online drums, web audio',
      },
    ],
  }),
  component: DrumMachinePage,
});

function DrumMachinePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Drum Machine',
            url: 'https://tools.soundbluemusic.com/drum-machine',
          },
        ]}
      />
      <MainLayout defaultTool="drumMachine" />
    </>
  );
}
