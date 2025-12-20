import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = () => [
  { title: '메트로놈 - Tools' },
  {
    name: 'description',
    content: '정확한 템포 연습을 위한 메트로놈 - 무료 브라우저 기반 유틸리티.',
  },
];

export default function MetronomeKo() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('metronome');
  }, [openTool]);

  return <MainLayout />;
}
