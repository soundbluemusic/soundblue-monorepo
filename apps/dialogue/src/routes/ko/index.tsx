import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components';

export const Route = createFileRoute('/ko/')({
  head: () => ({
    meta: [
      { title: 'Dialogue - 대화형 학습 도구' },
      { name: 'description', content: '100% 오프라인으로 작동하는 대화형 학습 도구' },
      {
        name: 'keywords',
        content:
          '오프라인 학습 도구, Q&A 앱, 대화형 학습, 즉시 답변, 인터넷 없이 학습, 교육 앱, offline learning tool, Q&A app, conversational learning, instant answers',
      },
      // Open Graph
      { property: 'og:title', content: 'Dialogue - 대화형 학습 도구' },
      { property: 'og:description', content: '100% 오프라인으로 작동하는 대화형 학습 도구' },
      { property: 'og:url', content: 'https://dialogue.soundbluemusic.com/ko' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ko_KR' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Dialogue - 대화형 학습 도구' },
      { name: 'twitter:description', content: '100% 오프라인으로 작동하는 대화형 학습 도구' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/ko' },
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
  component: HomePageKo,
});

function HomePageKo() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[{ name: 'Dialogue', url: 'https://dialogue.soundbluemusic.com/ko' }]}
      />
      <MainLayout />
    </>
  );
}
