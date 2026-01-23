import { createFileRoute } from '@tanstack/react-router';
import { Changelog } from '~/components';

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog - Dialogue' },
      { name: 'description', content: 'Version history and updates for Dialogue' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/changelog' },
      // Alternate language
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'ko',
        href: 'https://dialogue.soundbluemusic.com/ko/changelog',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://dialogue.soundbluemusic.com/changelog',
      },
    ],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  return <Changelog />;
}
