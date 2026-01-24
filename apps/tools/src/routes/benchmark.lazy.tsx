import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createLazyFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createLazyFileRoute('/benchmark')({
  component: BenchmarkPage,
});

function BenchmarkPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Benchmark', url: 'https://tools.soundbluemusic.com/benchmark' },
        ]}
      />
      <MainLayout />
    </>
  );
}
