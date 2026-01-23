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
      // Open Graph
      { property: 'og:title', content: 'Tools - SoundBlueMusic' },
      {
        property: 'og:description',
        content: 'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators.',
      },
      { property: 'og:image', content: 'https://tools.soundbluemusic.com/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://tools.soundbluemusic.com/' },
      { property: 'og:site_name', content: 'Tools - SoundBlueMusic' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Tools - SoundBlueMusic' },
      {
        name: 'twitter:description',
        content: 'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators.',
      },
      { name: 'twitter:image', content: 'https://tools.soundbluemusic.com/og-image.png' },
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
