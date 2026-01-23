import { createFileRoute } from '@tanstack/react-router';

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
});
