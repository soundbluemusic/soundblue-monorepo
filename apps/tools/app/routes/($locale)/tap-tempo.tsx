import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

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
  return <MainLayout defaultTool="tapTempo" />;
}
