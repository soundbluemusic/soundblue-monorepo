import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/changelog')({
  head: () => ({
    meta: [
      { title: '변경 로그 | Tools' },
      { name: 'description', content: '도구의 업데이트 및 변경 사항' },
    ],
  }),
  component: KoChangelogPage,
});

function KoChangelogPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '변경 로그', url: 'https://tools.soundbluemusic.com/ko/changelog' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">변경 로그</h1>
          <p className="text-[var(--color-text-secondary)]">도구의 업데이트 및 변경 사항</p>
        </div>
      </div>
    </>
  );
}
