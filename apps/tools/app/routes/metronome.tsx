import type { MetaFunction } from 'react-router';
import { Metronome as MetronomeComponent } from '~/tools/metronome';

export const meta: MetaFunction = () => [
  { title: 'Metronome | Tools' },
  {
    name: 'description',
    content: 'Precision metronome for tempo practice - Free browser-based utility.',
  },
];

export default function MetronomePage() {
  return (
    <div className="min-h-screen">
      <MetronomeComponent />
    </div>
  );
}
