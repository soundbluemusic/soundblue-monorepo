import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { About } from '~/components';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About - Dialogue' },
      { name: 'description', content: 'About Dialogue - A conversational learning tool' },
      {
        name: 'keywords',
        content:
          'about Dialogue, offline education, learning app, Q&A tool, conversational AI, 오프라인 교육, 학습 앱, 대화형 도구',
      },
      // Open Graph
      { property: 'og:title', content: 'About - Dialogue' },
      { property: 'og:description', content: 'About Dialogue - A conversational learning tool' },
      { property: 'og:url', content: 'https://dialogue.soundbluemusic.com/about' },
      { property: 'og:type', content: 'website' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'About - Dialogue' },
      { name: 'twitter:description', content: 'About Dialogue - A conversational learning tool' },
      // Canonical URL
      { tagName: 'link', rel: 'canonical', href: 'https://dialogue.soundbluemusic.com/about' },
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
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Dialogue', url: 'https://dialogue.soundbluemusic.com' },
          { name: 'About', url: 'https://dialogue.soundbluemusic.com/about' },
        ]}
      />
      <About />
    </>
  );
}
