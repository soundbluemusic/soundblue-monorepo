import { BreadcrumbStructuredData } from '@soundblue/seo';
import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { HomeLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Tools - SoundBlueMusic' },
  {
    name: 'description',
    content:
      'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators. 음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구.',
  },
  {
    name: 'keywords',
    content:
      'free music tools, online DAW, web audio tools, music production, metronome, drum machine, QR generator, translator, color palette, 무료 음악 도구, 온라인 DAW, 웹 오디오 도구, 음악 제작, 메트로놈, 드럼 머신',
  },
  ...getSeoMeta(location),
];

export default function Home() {
  const { closeTool } = useToolStore();

  // Close any open tool when navigating to home
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
