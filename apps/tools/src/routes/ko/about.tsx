import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/about')({
  head: () => ({
    meta: [
      { title: '소개 | Tools' },
      { name: 'description', content: '강력한 도구는 모두에게 접근 가능해야 한다고 믿습니다.' },
    ],
  }),
  component: KoAboutPage,
});

function KoAboutPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '소개', url: 'https://tools.soundbluemusic.com/ko/about' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">소개</h1>
          <p className="text-[var(--color-text-secondary)]">
            강력한 도구는 모두에게 접근 가능해야 한다고 믿습니다.
          </p>
        </div>
      </div>
    </>
  );
}
