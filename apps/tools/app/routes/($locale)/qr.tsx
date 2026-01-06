import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'QR Generator - Tools' },
  { name: 'description', content: 'QR Code Generator - Free browser-based utility.' },
  ...getSeoMeta(location),
];

export default function QRGeneratorPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('qr');
  }, [openTool]);

  return <MainLayout />;
}
