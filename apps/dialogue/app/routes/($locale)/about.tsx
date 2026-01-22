import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { About } from '~/components';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'About - Dialogue' },
  { name: 'description', content: 'About Dialogue - A conversational learning tool' },
  {
    name: 'keywords',
    content:
      'about Dialogue, offline education, learning app, Q&A tool, conversational AI, 오프라인 교육, 학습 앱, 대화형 도구',
  },
  ...getSeoMeta(location),
];

export default function AboutPage() {
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
