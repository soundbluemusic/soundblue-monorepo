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
