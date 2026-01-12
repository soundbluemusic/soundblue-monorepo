import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Delay Calculator - Tools' },
  {
    name: 'description',
    content:
      'Calculate delay times in milliseconds based on BPM - Free browser-based utility for music producers.',
  },
  ...getSeoMeta(location),
];

export default function DelayCalculatorPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('delayCalculator');
  }, [openTool]);

  return <MainLayout />;
}
