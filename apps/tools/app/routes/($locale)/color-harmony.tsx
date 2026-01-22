import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Color Harmony - Tools' },
  {
    name: 'description',
    content:
      'Generate harmonious color schemes based on color wheel theory - complementary, analogous, triadic, and monochromatic.',
  },
  {
    name: 'keywords',
    content:
      'color harmony, color wheel, complementary colors, analogous colors, triadic colors, color scheme generator, 컬러 하모니, 색상환, 보색, 유사색, 컬러 스킴',
  },
  ...getSeoMeta(location),
];

export default function ColorHarmonyPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Color Harmony', url: 'https://tools.soundbluemusic.com/color-harmony' },
        ]}
      />
      <MainLayout defaultTool="colorHarmony" />
    </>
  );
}
