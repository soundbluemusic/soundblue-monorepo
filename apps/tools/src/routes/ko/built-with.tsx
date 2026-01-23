import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/built-with')({
  head: () => ({
    meta: [
      { title: '기술 스택 | Tools' },
      { name: 'description', content: '이 프로젝트를 구축하는 데 사용된 기술 및 도구' },
    ],
  }),
  component: KoBuiltWithPage,
});

function KoBuiltWithPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '기술 스택', url: 'https://tools.soundbluemusic.com/ko/built-with' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">기술 스택</h1>
          <p className="text-[var(--color-text-secondary)]">
            이 프로젝트를 구축하는 데 사용된 기술 및 도구
          </p>
        </div>
      </div>
    </>
  );
}
