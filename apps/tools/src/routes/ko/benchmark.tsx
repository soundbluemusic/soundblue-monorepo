import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/benchmark')({
  head: () => ({
    meta: [
      { title: '벤치마크 | Tools' },
      { name: 'description', content: '번역 벤치마크 및 성능 테스트' },
    ],
  }),
});
