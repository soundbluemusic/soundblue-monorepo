import { createFileRoute } from '@tanstack/react-router';
import { getAllDictionary } from '~/server/dictionary';

export const Route = createFileRoute('/ko/translator')({
  head: () => ({
    meta: [{ title: '번역기 - Tools' }, { name: 'description', content: '한영 양방향 번역' }],
  }),
  // Prefetch D1 dictionary data on server
  loader: async () => {
    try {
      const dictionary = await getAllDictionary();
      return { dictionary };
    } catch {
      return { dictionary: null };
    }
  },
});
