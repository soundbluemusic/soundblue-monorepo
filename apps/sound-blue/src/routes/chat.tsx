import { createFileRoute } from '@tanstack/react-router';
import { generateSeoMeta } from '~/lib/seo';

export const Route = createFileRoute('/chat')({
  head: () => ({
    meta: [
      { title: 'Chat | Sound Blue' },
      { name: 'description', content: 'Chat with Sound Blue assistant.' },
      ...generateSeoMeta('/chat'),
    ],
  }),
});
