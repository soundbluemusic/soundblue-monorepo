import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ko/chat')({
  head: () => ({
    meta: [
      { title: '채팅 | Sound Blue' },
      { name: 'description', content: 'Sound Blue 어시스턴트와 대화하세요.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/chat' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/chat' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/chat' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/chat' },
    ],
  }),
});
