import { createFileRoute } from '@tanstack/react-router';
import { getAllDictionary } from '~/server/dictionary';

export const Route = createFileRoute('/translator')({
  head: () => ({
    meta: [
      { title: 'Translator - Tools' },
      {
        name: 'description',
        content:
          'Korean-English bidirectional translation tool powered by algorithm-based translation engine',
      },
      {
        name: 'keywords',
        content:
          'translator, korean english, 번역기, 한영 번역, english korean translation, free translator',
      },
    ],
  }),
  // Prefetch D1 dictionary data on server
  loader: async () => {
    try {
      const dictionary = await getAllDictionary();
      return { dictionary };
    } catch {
      // Fallback: D1 not available, use bundled dictionary
      return { dictionary: null };
    }
  },
});
