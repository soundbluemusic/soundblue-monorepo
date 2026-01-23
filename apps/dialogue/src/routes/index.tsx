import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Dialogue - Conversational Learning Tool' },
      {
        name: 'description',
        content: 'A conversational learning tool that works 100% offline',
      },
      {
        name: 'keywords',
        content:
          'offline learning tool, Q&A app, conversational learning, instant answers, no internet learning, education app, learning without internet, 오프라인 학습 도구, Q&A 앱, 대화형 학습, 즉시 답변, 인터넷 없이 학습',
      },
      // Open Graph
      { property: 'og:title', content: 'Dialogue - Conversational Learning Tool' },
      {
        property: 'og:description',
        content: 'A conversational learning tool that works 100% offline',
      },
      { property: 'og:url', content: 'https://dialogue.soundbluemusic.com/' },
      { property: 'og:type', content: 'website' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Dialogue - Conversational Learning Tool' },
      {
        name: 'twitter:description',
        content: 'A conversational learning tool that works 100% offline',
      },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/' },
      // Alternate language
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'ko',
        href: 'https://dialogue.soundbluemusic.com/ko',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://dialogue.soundbluemusic.com/',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'x-default',
        href: 'https://dialogue.soundbluemusic.com/',
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[{ name: 'Dialogue', url: 'https://dialogue.soundbluemusic.com' }]}
      />
      <MainLayout />
    </>
  );
}
