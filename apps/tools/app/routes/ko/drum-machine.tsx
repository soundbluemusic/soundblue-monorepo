import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = () => [
  { title: '드럼 머신 - Tools' },
  { name: 'description', content: '16스텝 드럼 패턴 시퀀서 - 무료 브라우저 기반 유틸리티.' },
];

export default function DrumMachineKo() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('drumMachine');
  }, [openTool]);

  return <MainLayout />;
}
