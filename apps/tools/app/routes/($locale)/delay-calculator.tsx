import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

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
  return <MainLayout defaultTool="delayCalculator" />;
}
