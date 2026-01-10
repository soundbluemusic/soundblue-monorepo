import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Drum Machine - Tools' },
  { name: 'description', content: '16-step drum pattern sequencer - Free browser-based utility.' },
  ...getSeoMeta(location),
];

export default function DrumMachinePage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('drumMachine');
  }, [openTool]);

  return <MainLayout />;
}
