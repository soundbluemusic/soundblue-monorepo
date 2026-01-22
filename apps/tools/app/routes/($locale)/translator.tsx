import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Translator - Tools' },
  {
    name: 'description',
    content: 'Korean ↔ English algorithm-based translator - Free browser-based utility.',
  },
  {
    name: 'keywords',
    content:
      'Korean English translator, bidirectional translation, language learning, algorithm translator, 한영 번역기, 영한 번역기, 양방향 번역, 언어 학습, 번역 도구',
  },
  ...getSeoMeta(location),
];

export default function TranslatorPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Translator', url: 'https://tools.soundbluemusic.com/translator' },
        ]}
      />
      <MainLayout defaultTool="translator" />
    </>
  );
}
