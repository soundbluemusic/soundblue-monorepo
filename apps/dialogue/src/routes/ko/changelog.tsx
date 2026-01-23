import { createFileRoute } from '@tanstack/react-router';
import { Changelog } from '~/components';

export const Route = createFileRoute('/ko/changelog')({
  head: () => ({
    meta: [
      { title: '변경 이력 - Dialogue' },
      { name: 'description', content: 'Dialogue의 버전 히스토리 및 업데이트' },
      // Canonical URL
      {
        tagName: 'link',
        rel: 'canonical',
        href: 'https://dialogue.soundbluemusic.com/ko/changelog',
      },
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
  component: ChangelogPageKo,
});

function ChangelogPageKo() {
  return <Changelog />;
}
