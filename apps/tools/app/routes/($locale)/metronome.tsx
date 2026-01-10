import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Metronome - Tools' },
  {
    name: 'description',
    content: 'Precision metronome for tempo practice - Free browser-based utility.',
  },
  ...getSeoMeta(location),
];

export default function MetronomePage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('metronome');
  }, [openTool]);

  return <MainLayout />;
}
