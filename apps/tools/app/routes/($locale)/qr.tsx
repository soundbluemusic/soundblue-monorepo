import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'QR Generator - Tools' },
  { name: 'description', content: 'QR Code Generator - Free browser-based utility.' },
  {
    name: 'keywords',
    content:
      'QR code generator, free QR maker, custom QR code, QR code creator, barcode generator, QR 코드 생성기, 무료 QR 메이커, 커스텀 QR, QR 코드 만들기',
  },
  ...getSeoMeta(location),
];

export default function QRGeneratorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'QR Generator', url: 'https://tools.soundbluemusic.com/qr' },
        ]}
      />
      <MainLayout defaultTool="qr" />
    </>
  );
}
