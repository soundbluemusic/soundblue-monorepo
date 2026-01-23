import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { HomeLayout } from '~/components/layout';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/ko/')({
  head: () => ({
    meta: [
      { title: 'Tools - 사운드블루뮤직' },
      { name: 'description', content: '뮤지션과 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구' },
      // Open Graph
      { property: 'og:title', content: 'Tools - 사운드블루뮤직' },
      {
        property: 'og:description',
        content: '뮤지션과 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구',
      },
      { property: 'og:image', content: 'https://tools.soundbluemusic.com/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://tools.soundbluemusic.com/ko/' },
      { property: 'og:site_name', content: 'Tools - SoundBlueMusic' },
      { property: 'og:locale', content: 'ko_KR' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Tools - 사운드블루뮤직' },
      {
        name: 'twitter:description',
        content: '뮤지션과 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구',
      },
      { name: 'twitter:image', content: 'https://tools.soundbluemusic.com/og-image.png' },
    ],
  }),
  component: KoHomePage,
});

function KoHomePage() {
  const { closeTool } = useToolStore();

  useEffect(() => {
    closeTool();
  }, [closeTool]);

  return (
    <>
      <BreadcrumbStructuredData
        items={[{ name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' }]}
      />
      <HomeLayout />
    </>
  );
}
