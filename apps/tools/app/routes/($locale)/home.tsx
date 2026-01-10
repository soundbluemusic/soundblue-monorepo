import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { LazyHomeLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Tools - SoundBlueMusic' },
  {
    name: 'description',
    content:
      'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators. 음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구.',
  },
  ...getSeoMeta(location),
];

export default function Home() {
  const { closeTool } = useToolStore();

  // Close any open tool when navigating to home
  useEffect(() => {
    closeTool();
  }, [closeTool]);

  return <LazyHomeLayout />;
}
