import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = () => [
  { title: 'QR 생성기 - Tools' },
  { name: 'description', content: 'QR 코드 생성기 - 무료 브라우저 기반 유틸리티.' },
];

export default function QRGeneratorKo() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('qr');
  }, [openTool]);

  return <MainLayout />;
}
