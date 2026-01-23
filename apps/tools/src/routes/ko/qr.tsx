import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/ko/qr')({
  head: () => ({
    meta: [{ title: 'QR 생성기 - Tools' }, { name: 'description', content: 'QR 코드를 쉽게 생성' }],
  }),
  component: KoQRPage,
});

function KoQRPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: 'QR 생성기', url: 'https://tools.soundbluemusic.com/ko/qr' },
        ]}
      />
      <MainLayout defaultTool="qr" />
    </>
  );
}
