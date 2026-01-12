import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'TAP Tempo - Tools' },
  {
    name: 'description',
    content:
      'Tap to detect BPM - Free browser-based tempo detection tool with optional metronome sound.',
  },
  ...getSeoMeta(location),
];

export default function TapTempoPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('tapTempo');
  }, [openTool]);

  return <MainLayout />;
}
