import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { About } from '~/components';

export const Route = createFileRoute('/ko/about')({
  head: () => ({
    meta: [
      { title: '소개 - Dialogue' },
      { name: 'description', content: 'Dialogue 소개 - 대화형 학습 도구' },
      {
        name: 'keywords',
        content:
          'Dialogue 소개, 오프라인 교육, 학습 앱, Q&A 도구, 대화형 AI, about Dialogue, offline education, learning app',
      },
      // Open Graph
      { property: 'og:title', content: '소개 - Dialogue' },
      { property: 'og:description', content: 'Dialogue 소개 - 대화형 학습 도구' },
      { property: 'og:url', content: 'https://dialogue.soundbluemusic.com/ko/about' },
      { property: 'og:locale', content: 'ko_KR' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/ko/about' },
      // Alternate language
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'ko',
        href: 'https://dialogue.soundbluemusic.com/ko/about',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://dialogue.soundbluemusic.com/about',
      },
    ],
  }),
  component: AboutPageKo,
});

function AboutPageKo() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Dialogue', url: 'https://dialogue.soundbluemusic.com/ko' },
          { name: '소개', url: 'https://dialogue.soundbluemusic.com/ko/about' },
        ]}
      />
      <About />
    </>
  );
}
