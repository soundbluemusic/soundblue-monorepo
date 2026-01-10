import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { LazyMainLayout } from '~/components/layout';
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

  return <LazyMainLayout />;
}
