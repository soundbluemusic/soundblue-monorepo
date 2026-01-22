import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Color Palette - Tools' },
  {
    name: 'description',
    content:
      'Create custom color palettes with 2-5 colors. Pick colors visually and copy color codes in HEX, RGB, or HSL format.',
  },
  {
    name: 'keywords',
    content:
      'color palette generator, color picker, HEX color, RGB color, HSL color, custom color palette, design colors, 컬러 팔레트 생성기, 색상 선택기, 커스텀 컬러, 디자인 색상',
  },
  ...getSeoMeta(location),
];

export default function ColorPalettePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Color Palette', url: 'https://tools.soundbluemusic.com/color-palette' },
        ]}
      />
      <MainLayout defaultTool="colorPalette" />
    </>
  );
}
