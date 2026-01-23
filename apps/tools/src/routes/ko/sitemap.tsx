import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/sitemap')({
  head: () => ({
    meta: [{ title: '사이트맵 | Tools' }, { name: 'description', content: '사이트 내비게이션 맵' }],
  }),
  component: KoSitemapPage,
});

function KoSitemapPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '사이트맵', url: 'https://tools.soundbluemusic.com/ko/sitemap' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">사이트맵</h1>
          <p className="text-[var(--color-text-secondary)]">사이트 내비게이션 맵</p>
        </div>
      </div>
    </>
  );
}
