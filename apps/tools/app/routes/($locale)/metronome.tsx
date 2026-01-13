import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Metronome - Tools' },
  {
    name: 'description',
    content: 'Precision metronome for tempo practice - Free browser-based utility.',
  },
  ...getSeoMeta(location),
];

export default function MetronomePage() {
  return <MainLayout defaultTool="metronome" />;
}
