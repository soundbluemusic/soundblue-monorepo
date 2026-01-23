import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/translator')({
  head: () => ({
    meta: [{ title: '번역기 - Tools' }, { name: 'description', content: '한영 양방향 번역' }],
  }),
});
