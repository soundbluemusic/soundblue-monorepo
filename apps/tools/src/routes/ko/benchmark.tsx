import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/benchmark')({
  head: () => ({
    meta: [
      { title: '벤치마크 | Tools' },
      { name: 'description', content: '번역 벤치마크 및 성능 테스트' },
    ],
  }),
  component: KoBenchmarkPage,
});

function KoBenchmarkPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '벤치마크', url: 'https://tools.soundbluemusic.com/ko/benchmark' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">벤치마크</h1>
          <p className="text-[var(--color-text-secondary)]">번역 벤치마크 및 성능 테스트</p>
        </div>
      </div>
    </>
  );
}
