import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'QR Generator - Tools' },
  { name: 'description', content: 'QR Code Generator - Free browser-based utility.' },
  ...getSeoMeta(location),
];

export default function QRGeneratorPage() {
  return <MainLayout defaultTool="qr" />;
}
