import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/benchmark')({
  head: () => ({
    meta: [
      { title: 'Benchmark | Tools' },
      {
        name: 'description',
        content: 'Translation benchmark and performance tests',
      },
      {
        name: 'keywords',
        content: 'benchmark, translation test, performance, translator accuracy',
      },
    ],
  }),
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
