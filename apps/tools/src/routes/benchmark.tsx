import { createFileRoute } from '@tanstack/react-router';

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
});
