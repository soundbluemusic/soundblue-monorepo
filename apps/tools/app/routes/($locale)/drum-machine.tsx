import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Drum Machine - Tools' },
  { name: 'description', content: '16-step drum pattern sequencer - Free browser-based utility.' },
  {
    name: 'keywords',
    content:
      'online drum machine, free drum machine, beat maker, drum sounds, rhythm maker, drum pattern sequencer, drum loop, 온라인 드럼 머신, 무료 드럼 머신, 비트 메이커, 드럼 사운드, 드럼 패턴',
  },
  ...getSeoMeta(location),
];

export default function DrumMachinePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Drum Machine', url: 'https://tools.soundbluemusic.com/drum-machine' },
        ]}
      />
      <MainLayout defaultTool="drumMachine" />
    </>
  );
}
