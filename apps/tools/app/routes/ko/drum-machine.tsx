import type { MetaFunction } from 'react-router';
import { DrumMachine as DrumMachineComponent } from '~/tools/drum-machine';

export const meta: MetaFunction = () => [
  { title: '드럼 머신 | Tools' },
  { name: 'description', content: '16스텝 드럼 패턴 시퀀서 - 무료 브라우저 기반 유틸리티.' },
];

export default function DrumMachineKo() {
  return (
    <div className="min-h-screen">
      <DrumMachineComponent />
    </div>
  );
}
