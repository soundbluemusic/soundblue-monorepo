import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/qr')({
  head: () => ({
    meta: [
      { title: 'QR Generator - Tools' },
      {
        name: 'description',
        content: 'Generate QR codes easily for URLs, text, contact info, and more',
      },
      {
        name: 'keywords',
        content: 'qr code, qr generator, barcode, url to qr, qr maker, free qr code',
      },
    ],
  }),
  component: QRPage,
});

function QRPage() {
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
