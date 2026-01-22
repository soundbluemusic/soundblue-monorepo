import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Metronome - Tools' },
  {
    name: 'description',
    content: 'Precision metronome for tempo practice - Free browser-based utility.',
  },
  {
    name: 'keywords',
    content:
      'online metronome, free metronome, BPM counter, rhythm practice, tempo keeper, music practice tool, beat keeper, 온라인 메트로놈, 무료 메트로놈, BPM 측정, 박자 연습, 리듬 훈련',
  },
  ...getSeoMeta(location),
];

export default function MetronomePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Metronome', url: 'https://tools.soundbluemusic.com/metronome' },
        ]}
      />
      <MainLayout defaultTool="metronome" />
    </>
  );
}
