import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = () => [
  { title: 'Drum Machine - Tools' },
  { name: 'description', content: '16-step drum pattern sequencer - Free browser-based utility.' },
];

export default function DrumMachinePage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('drumMachine');
  }, [openTool]);

  return <MainLayout />;
}
