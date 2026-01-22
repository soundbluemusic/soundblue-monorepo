import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { HomeLayout } from '~/components/layout';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Tools - SoundBlueMusic' },
      {
        name: 'description',
        content: 'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators.',
      },
      {
        name: 'keywords',
        content:
          'music tools, web daw, metronome, drum machine, qr generator, translator, online tools',
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const closeTool = useToolStore((state) => state.closeTool);

  useEffect(() => {
    closeTool();
  }, [closeTool]);

  return (
    <>
      <BreadcrumbStructuredData
        items={[{ name: 'Tools', url: 'https://tools.soundbluemusic.com' }]}
      />
      <HomeLayout />
    </>
  );
}
