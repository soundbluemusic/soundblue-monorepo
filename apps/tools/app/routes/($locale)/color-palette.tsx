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
  ...getSeoMeta(location),
];

export default function ColorPalettePage() {
  return <MainLayout defaultTool="colorPalette" />;
}
