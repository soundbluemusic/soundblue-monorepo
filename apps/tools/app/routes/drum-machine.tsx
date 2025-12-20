import type { MetaFunction } from 'react-router';
import { DrumMachine as DrumMachineComponent } from '~/tools/drum-machine';

export const meta: MetaFunction = () => [
  { title: 'Drum Machine | Tools' },
  { name: 'description', content: '16-step drum pattern sequencer - Free browser-based utility.' },
];

export default function DrumMachinePage() {
  return (
    <div className="min-h-screen">
      <DrumMachineComponent />
    </div>
  );
}
